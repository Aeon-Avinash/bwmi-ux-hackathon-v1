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

## Dispatch F Abbreviated Re-gate

Branch: `dispatch-f/type-normalization`
Preview: `http://127.0.0.1:8767/`

| Gate | Result | Evidence |
| --- | --- | --- |
| Fixture verifier before/after | **PASS** | Both runs reported `OK codes=29 asha=₹98,500 elapsed=36h36m holdAGE=33h07m anon=REF-260826-0413`. |
| Focus behavior | **PASS** | Mouse language selection left programmatic focus on `main` with `:focus-visible = false`, no outline, and `transition-duration: 0s`; keyboard Tab produced a solid 3px ring with no transition. |
| Title/type normalization | **PASS** | Home and acknowledgement titles measured 32px/38.4px; tracker measured 28px at 390px. Breadcrumb-to-banner measured 12px and banner-to-title 24px. Body measured 16px and content 1080px at 1440px. |
| Checklist i18n | **PASS** | Every checklist pack key exists in all 23 packs. Kannada primary rendered 23 bilingual pairs with English secondary and zero fallback underlines. No English-only checklist defect remains. |
| Named journey | **PASS** | Home → common acknowledgement → login/OTP → 23-pair checklist → complaint → filed; issued `27082026000200`. |
| Anonymous journey | **PASS** | Common acknowledgement → exact four categories → zero identity fields → confirmation-only `REF-260827-0948`; boundary states that it cannot be tracked. |
| Track journey | **PASS** | Unknown acknowledgement returned the no-record message with the ledger hint hidden; valid Asha acknowledgement + OTP reached status. |
| Responsive/errors | **PASS** | Named, anonymous, and tracking stages reported no root overflow at 390×844; browser page-error logs were empty. |
| Visual evidence | **PASS** | `post-fix-screenshots/dispatch-f/home.png`, `acknowledgement.png`, and `track-390.png` are fresh final captures. |

**Dispatch F decision: GO for video capture.**

## Dispatch G Re-gate

Branch: `dispatch-g/seeded-case-discoverability`
Preview: `http://127.0.0.1:8768/`

| Gate | Result | Evidence |
| --- | --- | --- |
| Fixture verifier before/after | **PASS** | `verify-fixtures.mjs` reports `hints=4` and asserts the four trackable fixture ids, acknowledgements, and registered mobiles. |
| Guided review discovery | **PASS** | Tracker inputs expose the Asha acknowledgement and mobile as placeholders and selectable/copyable values. The seeded hint card lists exactly the four trackable named records from fixtures; fill-on-tap populates, but does not submit, the gate. |
| Asha spine via hint | **PASS** | Asha fill-on-tap → OTP toast → OTP verification reaches `#/status?ack=25082026000147`, with the three money-map states rendered. |
| No-record boundary | **PASS** | A non-seeded acknowledgement shows the unchanged no-record message and exposes neither OTP nor mock SMS toast. |
| Copy fallback and mobile | **PASS** | The clipboard-denied path selects the credential text; at 390px the mock SMS toast remains below the nav and clear of the acknowledgement input. |
| RTL and desktop rails | **PASS** | Urdu tracker retains RTL platform content with LTR demo hints, Latin digits, no fallback underlines, and no overflow. Desktop measurements are 1140px container, 880px document rail, 820px form rail, and 1080px case/status rail. |
| Scope and errors | **PASS** | No strings, i18n packs, codes, or ledger facts changed. Browser page-error logs were empty in the exercised paths. |

## Dispatch G Visual Evidence

- `post-fix-screenshots/dispatch-g/home-seeded-way-in.png`
- `post-fix-screenshots/dispatch-g/track-hints-en.png`
- `post-fix-screenshots/dispatch-g/track-hints-ur-390.png`
- `post-fix-screenshots/dispatch-g/asha-money-map-via-hint.png`
- `post-fix-screenshots/dispatch-g/acknowledgement-widened.png`

**Dispatch G decision: pending final main-branch verification and merge.**
