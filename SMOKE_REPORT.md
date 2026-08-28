# Integration Smoke Report

Run date: 28 Aug 2026 UTC

Branch: `code-design-parity-smoke-test`
Target: `http://127.0.0.1:8765/`

Severity: 🔴 blocks demo · 🟡 visible · 🟢 cosmetic

| Area | Result | Severity | Evidence |
| --- | --- | --- | --- |
| A. Fixture integrity | **PASS** | 🟢 | The strengthened verifier passes. Asha renders three Saral Bank UPI debit events at 21:12 ₹31,000, 21:14 ₹42,500, and 21:19 ₹25,000; they sum to the rendered ₹98,500 total. The split is ₹31,000 held / ₹42,500 freeze requested / ₹25,000 unlocated, with the ₹500 leak on its own row. Clocks are 36h36m and 33h07m at Thu 27 Aug 2026 09:48 IST. All four named acknowledgements and `REF-260826-0413` are present. |
| B. Event-row extraction | **PASS** | 🟢 | The rescinded design-figure sentence was not added. Exact English-primary DOM text and metadata for the hold-related and pending freeze-request rows are recorded below. |
| C. Three unguided journeys | **PASS** | 🟢 | Named financial filing traversed home → acknowledgement → login/OTP → checklist → three-step complaint → filed and issued `27082026000200`. Anonymous filing traversed the same acknowledgement interstitial, showed the exact four categories and zero identity inputs, then ended at `REF-260827-0948` with a confirmation-only/not-trackable boundary. Tracker covered an unknown acknowledgement with no hint or OTP and a valid Asha OTP into status. Browser page-error logs were empty. |
| D. State-code canon | **PASS** | 🟢 | The two `codes.json` files are byte-identical. Counts are exactly 7 money, 6 events, 5 process, 2 account flags, 2 boundary, and 3 provenance codes, plus four `clockBadge` codes: ELAPSED, AGE, DEADLINE, TARGET. All six retired codes are absent from shell UI/data. |
| E. Boundary honesty | **PASS** | 🟢 | The acknowledgement text assigns action to law-enforcement agencies/police; no control claims NCRP/I4C can freeze or unfreeze funds. FAQ states complaint ≠ FIR. Generated acknowledgements are 14 digits in date-plus-serial form. 112, 181, and 1930 are present. Every tested route carries the mock/not-live marker and ministry footer. |
| F. i18n | **PASS** | 🟢 | All 23 JSON packs parse; the picker exposes 22 regional languages in their own scripts and defaults to Hindi with English primary. Primacy switching preserves locale. Kannada home/ack/anonymous/track/status, Odia home/status, and Urdu home/ack/anonymous/track/status produced zero fallback underlines, zero non-Latin digits, and zero overflow. Urdu lines compute RTL while amounts/codes/clocks remain LTR. The loaded app navigated offline with `document.fonts.status = loaded`; all observed assets and fonts were local. |
| G. Responsive | **PASS** | 🟢 | A 26-route sweep at both 390×844 and 1440×1000 found no root overflow and retained nav, mock marker, and footer on every route. The mobile SMS toast measured below the nav and did not intersect the acknowledgement input. |

## Verbatim Event Rows

Rendered hold-related event element (`innerText`):

> 26 Aug 00:41
>
> Dhanvir Co-op Bank put ₹31,000 on hold in “Kuber Traders” ••7734 and suspended its digital banking.
>
> ● Dhanvir Bank
> AMOUNT_HOLD_PARTIAL
> [ASSUMPTION]

Rendered pending freeze-request event element (`innerText`):

> 26 Aug 00:41
>
> Hold request sent to PayMate Wallet for ₹42,500. A ₹500 PRE_HOLD_LEAK is already gone and is permanently unrecoverable.
>
> ● PayMate Wallet
> FREEZE_REQUESTED
> [ASSUMPTION]

No hold-slip prose sentence was synthesized. These are the exact English-primary event strings and labels exposed by Asha's status DOM.

## Defects

| ID | Severity | Status |
| --- | --- | --- |
| SMK-001 | 🔴 | **CLOSED.** Authorized ledger correction and regression assertions pass. |
| SMK-002 | n/a | **RESCINDED.** No build change; verbatim DOM event rows are reported above. |
| SMK-003 | 🟢 | **ACCEPTED.** The harmless local `multilingual-packs/i18n/*` 404 probes fall back successfully to `data/i18n/*`; deferred to post-hackathon cleanup. |

## Visual Evidence

- `post-fix-screenshots/home-en-hi.png`
- `post-fix-screenshots/asha-money-map.png`
- `post-fix-screenshots/anonymous-form-390.png`
- `post-fix-screenshots/track-otp-390.png`
- `post-fix-screenshots/urdu-rtl-390.png`

## Video Capture Gate

**GO for video capture.** Gates A–G pass on `code-design-parity-smoke-test`; the only remaining item is the accepted cosmetic SMK-003 fallback probe.
