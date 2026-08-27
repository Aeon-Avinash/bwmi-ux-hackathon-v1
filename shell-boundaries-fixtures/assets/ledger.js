/* Mock ledger: Asha locked split, anonymous boundary, Day 0/9/12, OTP toast is source of truth. */
(function (global) {
  var NCRP = global.NCRP || (global.NCRP = {});
  var KEY = 'ncrp-packet-b-overlay';

  function loadOverlay() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || '{}');
    } catch (e) {
      return {};
    }
  }
  function saveOverlay(o) {
    sessionStorage.setItem(KEY, JSON.stringify(o));
  }

  NCRP.inr = function (paise) {
    var n = Math.round(Number(paise) / 100);
    return '₹' + n.toLocaleString('en-IN');
  };

  NCRP.clockDiff = function (fromIso, nowIso) {
    var ms = Date.parse(nowIso) - Date.parse(fromIso);
    if (!isFinite(ms) || ms < 0) ms = 0;
    var totalMin = Math.round(ms / 60000);
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    if (m === 0) return h + ' hrs';
    return h + 'h ' + String(m).padStart(2, '0') + 'm';
  };

  NCRP.dayIndex = function (filedAt, nowIso) {
    function ymd(iso) {
      return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    }
    var a = Date.parse(ymd(filedAt) + 'T00:00:00+05:30');
    var b = Date.parse(ymd(nowIso) + 'T00:00:00+05:30');
    return Math.round((b - a) / 86400000);
  };

  NCRP.formatStamp = function (iso) {
    var d = new Date(iso);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  NCRP.formatWhenShort = function (iso) {
    var d = new Date(iso);
    var day = d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit' });
    var mon = d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short' });
    var hm = d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return day + ' ' + mon + '\n' + hm;
  };

  NCRP.conservation = function (rec) {
    if (!rec || !rec.split) return { ok: true, sum: 0, total: 0 };
    var s = rec.split;
    var sum = (s.held || 0) + (s.requested || 0) + (s.unlocated || 0) + (s.returned || 0);
    return { ok: sum === rec.totalPaise, sum: sum, total: rec.totalPaise };
  };

  function applyOverlay(base) {
    var o = loadOverlay();
    var extras = o.filed || [];
    var confirms = o.confirms || {};
    var records = base.records.concat(extras).map(function (r) {
      var copy = JSON.parse(JSON.stringify(r));
      if (confirms[copy.ack]) {
        copy.citizenConfirmedAt = confirms[copy.ack];
        copy.closeGated = false;
        copy.status = 'CLOSED_CONFIRMED';
        copy.events = (copy.events || []).concat([
          {
            at: confirms[copy.ack],
            author: 'You (citizen)',
            code: 'CITIZEN_CONFIRM_PENDING',
            provenance: 'CONFIRMED',
            text: 'Complainant confirmed receipt of the returned amount. Close may proceed.',
            band: 'confirmed'
          }
        ]);
      }
      return copy;
    });
    return {
      now: base.$meta.now,
      nextSerial: o.nextSerial || base.nextSerial,
      records: records,
      demoMobiles: base.demoMobiles
    };
  }

  NCRP.findByAck = function (ack) {
    if (!ack) return null;
    var needle = String(ack).trim();
    var recs = NCRP.store.records;
    for (var i = 0; i < recs.length; i++) {
      if (recs[i].ack === needle) return recs[i];
    }
    return null;
  };

  NCRP.issueAck = function (atIso) {
    var d = new Date(atIso || NCRP.store.now);
    var parts = d
      .toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })
      .split('/');
    var dd = parts[0];
    var mm = parts[1];
    var yyyy = parts[2];
    var o = loadOverlay();
    var serial = o.nextSerial || NCRP.store.nextSerial;
    o.nextSerial = serial + 1;
    saveOverlay(o);
    NCRP.store.nextSerial = o.nextSerial;
    return dd + mm + yyyy + String(serial).padStart(6, '0');
  };

  NCRP.addFiled = function (rec) {
    var o = loadOverlay();
    o.filed = o.filed || [];
    o.filed.push(rec);
    saveOverlay(o);
    NCRP.store.records.push(rec);
  };

  NCRP.confirmReturn = function (ack, atIso) {
    var o = loadOverlay();
    o.confirms = o.confirms || {};
    o.confirms[ack] = atIso || NCRP.store.now;
    saveOverlay(o);
    NCRP.store = applyOverlay(NCRP.raw);
  };

  NCRP.parseSms = function (txt) {
    var amt = txt.match(/(?:Rs\.?|INR|₹)\s*([\d,]{2,})/i);
    var when = txt.match(/(\d{2})-(\d{2})-(\d{2})\s*at\s*(\d{2}):(\d{2})/i);
    var out = {};
    if (amt) out.amount = amt[1].replace(/,/g, '');
    if (when) out.when = '20' + when[3] + '-' + when[2] + '-' + when[1] + 'T' + when[4] + ':' + when[5];
    return out;
  };

  NCRP.loadLedger = function () {
    return fetch('data/ledger.json', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('ledger.json ' + r.status);
        return r.json();
      })
      .then(function (json) {
        NCRP.raw = json;
        NCRP.store = applyOverlay(json);
        return NCRP.store;
      });
  };
})(window);
