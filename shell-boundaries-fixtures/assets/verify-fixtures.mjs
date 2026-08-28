#!/usr/bin/env node
/* Fixture and i18n smoke check. Exit 1 on conservation or contract failure. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ledger = JSON.parse(readFileSync(join(root, 'data/ledger.json'), 'utf8'));
const codes = JSON.parse(readFileSync(join(root, 'data/codes.json'), 'utf8'));
const strings = JSON.parse(readFileSync(join(root, 'data/strings.en.json'), 'utf8'));

const errors = [];
function fail(msg) { errors.push(msg); }

if (!Array.isArray(codes.codes) || codes.codes.length < 20) fail('codes[] missing or short');
const codeSet = new Set(codes.codes.map((c) => c.code));
['REPORTED', 'PROVISIONALLY_HELD', 'AMOUNT_HOLD_PARTIAL', 'FREEZE_REQUESTED', 'MOVED_ONWARD',
  'UNKNOWN', 'RETURNED_TO_CITIZEN', 'HOLD_RELEASED', 'PRE_HOLD_LEAK', 'CONFIRMATION_ONLY',
  'ANONYMOUS_RECEIVED', 'INTERIM_CUSTODY'].forEach((c) => {
  if (!codeSet.has(c)) fail('missing code ' + c);
});

['chrome', 'home', 'ack', 'login', 'otpToast', 'checklist', 'complaint', 'anonForm', 'filed',
  'anonFiled', 'track', 'status', 'suspect', 'learn', 'faq', 'stubs'].forEach((k) => {
  if (!strings[k]) fail('strings.en.json missing ' + k);
});
if (strings.ack.p1.indexOf('special focus on cyber crimes against women and children') < 0) {
  fail('acknowledgement p1 is not the coded NCRP text');
}
['catRgr', 'catObscene', 'catExplicit', 'catCseam'].forEach((k) => {
  if (!strings.anonForm[k]) fail('anonymous category missing ' + k);
});
if (strings.anonForm.catCseam !== 'CSEAM – Child Sexual Exploitative & Abuse Material') {
  fail('CSEAM label was reworded');
}

const now = ledger.$meta.now;
function rec(id) { return ledger.records.find((r) => r.id === id); }
function amountPaise(text) {
  const match = String(text).match(/₹([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, '')) * 100 : NaN;
}

const asha = rec('asha-day2');
if (!asha) fail('Asha record missing');
else {
  if (asha.ack !== '25082026000147' || asha.ack.length !== 14) fail('Asha ack');
  const s = asha.split;
  const sum = s.held + s.requested + s.unlocated + s.returned;
  if (s.held !== 3100000) fail('Asha held locked at ₹31,000');
  if (s.requested !== 4250000) fail('Asha freeze-requested locked at ₹42,500');
  if (s.unlocated !== 2500000) fail('Asha unlocated locked at ₹25,000');
  if (s.leak !== 50000) fail('Asha ₹500 leak missing');
  if (sum !== 9850000) fail('Asha conservation broken: ' + sum);
  const debitRows = asha.events.filter((event) =>
    event.code === 'REPORTED' && event.author === 'Saral Bank · SMS'
  );
  const expectedDebits = [
    ['2026-08-25T21:12:00+05:30', '₹31,000 debited from A/c ••4821 by UPI to kubertraders@dvb.', 3100000],
    ['2026-08-25T21:14:00+05:30', '₹42,500 debited from A/c ••4821 by UPI to kubertraders@dvb.', 4250000],
    ['2026-08-25T21:19:00+05:30', '₹25,000 debited from A/c ••4821 by UPI to kubertraders@dvb.', 2500000]
  ];
  if (debitRows.length !== expectedDebits.length) {
    fail('Asha expected exactly three debit rows, got ' + debitRows.length);
  }
  expectedDebits.forEach(([at, text, amount], index) => {
    const row = debitRows[index];
    if (!row) return;
    if (row.at !== at) fail('Asha debit ' + (index + 1) + ' timestamp expected ' + at + ', got ' + row.at);
    if (row.text !== text) fail('Asha debit ' + (index + 1) + ' text mismatch');
    if (amountPaise(row.text) !== amount) fail('Asha debit ' + (index + 1) + ' amount mismatch');
  });
  const debitTotal = debitRows.reduce((total, row) => total + amountPaise(row.text), 0);
  if (debitTotal !== asha.totalPaise) {
    fail('Asha debit rows do not sum to TOTAL REPORTED: ' + debitTotal + ' != ' + asha.totalPaise);
  }
  const elapsedMs = Date.parse(now) - Date.parse(asha.theftAt);
  const ageMs = Date.parse(now) - Date.parse('2026-08-26T00:41:00+05:30');
  const elapsedH = elapsedMs / 3600000;
  const ageH = ageMs / 3600000;
  if (Math.abs(elapsedH - 36.6) > 0.02) fail('ELAPSED expected 36h 36m, got ' + elapsedH);
  if (Math.abs(ageH - 33.116) > 0.02) fail('Hold AGE expected 33h 7m, got ' + ageH);
}

const anon = rec('anon-wc-obscene');
if (!anon || anon.ack !== 'REF-260826-0413') fail('anonymous ref');
if (!anon || anon.categoryLabel !== 'Sexually Obscene material') fail('anonymous category');
if (!anon || anon.boundary !== 'CONFIRMATION_ONLY') fail('anonymous boundary');

const d0 = rec('ravi-day0');
const d9 = rec('meera-day9');
const d12 = rec('farhan-day12');
if (!d0 || d0.ack !== '27082026000101') fail('day0 ack');
if (!d9 || d9.holds.length !== 2) fail('day9 two holds');
if (d9.holds[0].state !== 'HOLD_RELEASED' || d9.holds[1].state !== 'PROVISIONALLY_HELD') fail('day9 fan-out states');
if (d9.split.held + d9.split.unlocated !== d9.totalPaise) fail('day9 conservation');
if (!d12 || !d12.closeGated || d12.split.returned !== 4200000) fail('day12 returned/gated');
if (d12.split.held + d12.split.requested + d12.split.unlocated + d12.split.returned !== d12.totalPaise) {
  fail('day12 conservation');
}

ledger.records.filter((r) => r.boundary === 'TRACKABLE').forEach((r) => {
  if (!/^\d{14}$/.test(r.ack)) fail('trackable ack not 14 digits: ' + r.ack);
  if (r.split) {
    const sum = r.split.held + r.split.requested + r.split.unlocated + r.split.returned;
    if (sum !== r.totalPaise) fail(r.id + ' conservation ' + sum + ' != ' + r.totalPaise);
  }
});

if (errors.length) {
  console.error('FAIL');
  errors.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
console.log('OK  codes=' + codes.codes.length +
  '  asha=₹98,500  elapsed=36h36m  holdAGE=33h07m  anon=REF-260826-0413');
