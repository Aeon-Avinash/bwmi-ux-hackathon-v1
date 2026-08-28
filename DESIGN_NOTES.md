# Design Notes

- `shell-boundaries-fixtures/index.html` -> removed Google Fonts preconnect and stylesheet imports -> keep the prototype fully self-hosted and renderable without external network access.
- `shell-boundaries-fixtures/assets/app.js` -> hid the demo acknowledgement-number hint on the tracker -> preserve the no-hints/no-guessing no-record journey.
- `shell-boundaries-fixtures/assets/app.js` -> omitted the zero-value returned card and moved the existing ₹500 leak sentence into its own row -> match the three-state money map and never visually round away the leak.
- `shell-boundaries-fixtures/assets/app.js` -> separated confirmed provenance markup from proposed provenance markup -> keep confirmed facts solid green and proposed/unconfirmed facts ochre-dashed.
- `shell-boundaries-fixtures/assets/shell.css` -> forced nav bilingual labels and hover states to light-on-blue, with a white active tab and visible keyboard focus -> fix the dark-on-dark navigation defect and meet AA contrast.
- `shell-boundaries-fixtures/assets/shell.css` -> added restrained borders, shadows, and consistent card depth -> restore the reference system's editorial interior inside government chrome.
- `shell-boundaries-fixtures/assets/shell.css` -> applied green held, dashed-neutral requested, amber unlocated, ochre-dashed proposed, and hatched leak treatments -> make status and provenance readable before the labels are parsed.
- `shell-boundaries-fixtures/assets/shell.css` -> added 390px containment for masthead, nav, forms, OTP, event rows, footer, and long clock chips -> remove journey-level horizontal overflow without shrinking text.
- `shell-boundaries-fixtures/assets/shell.css` -> kept RTL regional lines right-directed while isolating amounts, codes, clocks, and numerals LTR -> support Urdu/Kashmiri/Sindhi without reversing numeric facts.
- `shell-boundaries-fixtures/assets/shell.css` -> stopped forcing regional leak/footer text through the monospace stack -> prevent missing-script glyph boxes while retaining tabular numerals.

