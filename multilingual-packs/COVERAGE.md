# Pack re-export coverage

Canonical tree: `shell-boundaries-fixtures/data/strings.en.json` (351 keys).
Source: `i18n/strings.json` parts + `data/gap_translations.py`.
Protected tokens/codes excluded from the 95% test.

| Lang | Native | Keys | Differ% | Script ratio | (a) parity | (b) ≥95% | (c) script | Fallbacks |
|---|---|---:|---:|---:|---|---|---|---:|
| `as` | অসমীয়া | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `bn` | বাংলা | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `brx` | बर' | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `doi` | डोगरी | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `gu` | ગુજરાતી | 351 | 99.7% | 0.95 | PASS | PASS | PASS | 0 |
| `hi` | हिन्दी | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `kn` | ಕನ್ನಡ | 351 | 99.7% | 0.95 | PASS | PASS | PASS | 0 |
| `ks` | کٲشُر | 351 | 99.7% | 0.97 | PASS | PASS | PASS | 0 |
| `kok` | कोंकणी | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `mai` | मैथिली | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `ml` | മലയാളം | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `mni` | ꯃꯤꯇꯩꯂꯣꯟ | 351 | 99.7% | 0.83 | PASS | PASS | PASS | 0 |
| `mr` | मराठी | 351 | 99.7% | 0.95 | PASS | PASS | PASS | 0 |
| `ne` | नेपाली | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `or` | ଓଡ଼ିଆ | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `pa` | ਪੰਜਾਬੀ | 351 | 99.7% | 0.95 | PASS | PASS | PASS | 0 |
| `sa` | संस्कृतम् | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `sat` | ᱥᱟᱱᱛᱟᱲᱤ | 351 | 99.7% | 0.96 | PASS | PASS | PASS | 0 |
| `sd` | سنڌي | 351 | 99.7% | 0.97 | PASS | PASS | PASS | 0 |
| `ta` | தமிழ் | 351 | 99.7% | 0.97 | PASS | PASS | PASS | 0 |
| `te` | తెలుగు | 351 | 99.7% | 0.95 | PASS | PASS | PASS | 0 |
| `ur` | اردو | 351 | 99.7% | 0.97 | PASS | PASS | PASS | 0 |

## Languages below 95% or script-ratio — untranslated keys (Hindi fallback)
None.

Numeral-normalization sweep applied, as: 54 substitutions in 24 keys; bn: 54 substitutions in 24 keys; or: 54 substitutions in 24 keys.
