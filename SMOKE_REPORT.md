# Integration Smoke Report

Run date: 28 Aug 2026 UTC

Branch: `code-design-parity-smoke-test`
Target: `http://127.0.0.1:8765/`

Severity: 🔴 blocks demo · 🟡 visible · 🟢 cosmetic

| Area | Result | Severity | Evidence |
| --- | --- | --- | --- |
| A. Fixture integrity | **FAIL** | 🔴 | `verify-fixtures.mjs` passes and confirms 29 codes, ₹98,500 total, ₹31,000/₹42,500/₹25,000 split, ₹500 leak, 36h36m elapsed, 33h07m age, the frozen 27 Aug 09:48 anchor, four named acknowledgements, and `REF-260826-0413`. The locked ledger/UI contains one ₹98,500 debit at 21:12, not the required three debit rows at 21:12/21:14/21:19. |
| B. Hold-slip extraction | **FAIL** | 🔴 | Expected sentence is not rendered anywhere on Asha's status screen. See verbatim comparison below. |
| C. Three unguided journeys | **PASS** | 🟢 | Named financial filing reached `#/filed` with generated acknowledgement `27082026000200`; anonymous filing showed the exact four categories, zero reporter identity fields, and confirmation-only boundary; tracker covered no-record and valid OTP paths. The same acknowledgement interstitial precedes named and anonymous filing. No browser page errors were reported. |
| D. State-code canon | **PASS** | 🟢 | Lane files are byte-for-byte JSON-equivalent. Counts: 7 money, 6 events, 5 process, 2 account flags, 2 boundary, 3 provenance, plus 4 `clockBadge` entries. All six retired codes are absent. |
| E. Boundary honesty | **PASS** | 🟢 | Acknowledgement interstitial states complaints are dealt with by law-enforcement agencies/police; status attribution assigns holds/requests to institutions; FAQ states portal complaint != FIR; generated acknowledgement is 14 digits; 112/181/1930 are present; shared chrome puts the mock-data/not-live marker on every route. |
| F. i18n | **PASS** | 🟢 | 23 JSON packs parse (22 regional + English). Kannada home/ack/anonymous/track/status walk, Odia home/status spot-check, and Urdu home/ack/anonymous/track/status walk all produced zero fallback underlines and zero horizontal overflow. Urdu regional lines were RTL, digits remained Latin, and locale persisted. All font/network requests are local or data URLs. |
| G. Responsive | **PASS** | 🟢 | Named, anonymous, tracker, Asha status, Kannada, Odia, and Urdu journey screens reported no root-level overflow at 390px after the clock-chip fix. |

## Hold-Slip Comparison

Expected:

> Bank ••7781 held ₹31,000 on Thu 27 Aug 2026 at 09:48 IST. The ₹42,500 freeze request has no reply yet.

Rendered hold-slip string:

> [ABSENT — no hold-slip sentence is rendered on Asha's status page.]

The page instead exposes the split cards and reconstructed institution events. Per dispatch, this report records the mismatch and does not alter locked fixture or displayed text.

## Defects

| ID | Severity | Defect | Required resolution |
| --- | --- | --- | --- |
| SMK-001 | 🔴 | Asha's locked fixture and rendered ledger do not contain the required three UPI debit rows; only one ₹98,500 debit at 21:12 is present. | Operator-approved update to the audit-locked ledger/string surface. |
| SMK-002 | 🔴 | The required exact hold-slip sentence is absent. | Operator-approved addition to the audit-locked displayed-text/fixture surface. |
| SMK-003 | 🟢 | Locale loading first probes unavailable `multilingual-packs/i18n/*` URLs, then succeeds from `data/i18n/*`; this creates local 404 requests but no console/page error. | Optional post-hackathon loader-order cleanup. |

## Visual Evidence

- `post-fix-screenshots/home-en-hi.png`
- `post-fix-screenshots/asha-money-map.png`
- `post-fix-screenshots/anonymous-form-390.png`
- `post-fix-screenshots/track-otp-390.png`
- `post-fix-screenshots/urdu-rtl-390.png`

## Video Capture Gate

**NO-GO for video capture.** Design parity, journeys, i18n, and responsive behavior pass, but SMK-001 and SMK-002 contradict the locked demo facts and required hold-slip narration. Both require operator-authorized changes to locked surfaces before capture.
