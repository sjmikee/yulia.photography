# Russian contract templates

The owner approved the Russian translation on 10 October 2026. Final templates:

- `public/contract_template_ru_fillable.pdf`: standard publication clause (`conf === '1'`).
- `public/contract_template_conf_ru_fillable.pdf`: confidential publication clause (`conf === '0'`).

Both retain the approved wording from `ru.json`, the original Hebrew PDF logo,
pale background, red title rules and two-page format. Russian text runs left to right.
Earlier `*-review.md` files and `output/pdf/*-review.pdf` remain review artifacts.

## Field compatibility

Both final PDFs have the same ten field names and types as the Hebrew PDFs:

- Text: `client_name`, `client_id`, `client_address`, `client_phone`, `date_1`,
  `type`, `price`, `date_2`.
- Button/image placeholders: `my_sign_af_image`, `client_sign_af_image`.

Text field positions and widths fit the Russian layout. The client signature area
is `(50, 55, 150, 60)` and photographer signature area is `(350, 55, 150, 60)`
on page two, matching the existing server draw positions. Transparent placeholder
appearances preserve images drawn before flattening. These are image placeholders,
not certificate-based digital-signature fields.

The signing flow now selects these templates from the signed invitation language
and consent choice. Russian page routes are `/ru/contract` and `/ru/thank_you`.
The admin Send Contract page remains Hebrew and includes a Hebrew/Russian selector.
Old invitations with no language/version claims retain Hebrew behavior.

The Russian templates, their filled fields and the Russian website use Rubik.
`public/fonts/Rubik-{Regular,Bold}.ttf` are static 400/700 instances of the official
Google Fonts Rubik variable font, distributed under `Rubik-OFL.txt`. They include
Cyrillic, Hebrew and Latin glyphs. Russian email requests Rubik with system-font
fallbacks because some mail clients do not support web fonts.

Invitation language and contract version `1` are signed and checked server-side;
unknown versions/languages are rejected. Version 1 assets must remain stable after
issuing invitations; later contract changes need a new version/asset mapping.
The signed PDF records language/version/consent in its metadata. Successful signing
also records language/version in the existing session workflow JSON; no database
migration is required. Existing claim, expiry and uncertain-delivery guards remain.

## Rebuild and verification

Run `scripts/contracts/build-russian-pdfs.py` with Python containing ReportLab and
pypdf, then `node scripts/contracts/finalize-russian-pdfs.mjs`. Both use the bundled
Rubik fonts in `public/fonts`; `CONTRACT_FONT_DIR` can override this folder. The original logo is extracted from the Hebrew standard template.

Local validation compared all ten names/types with Hebrew, checked canonical fields
and page widgets, filled all eight text fields with sample Cyrillic data, and verified
flattening leaves no fields or annotations. Rendered both final templates and a filled
sample to inspect all pages. No real email, signing or database operations were used.

Final validation: 136 automated tests passed, Astro and ESLint checks passed, and
the production build completed. Browser checks covered eight responsive layouts
(320, 390, 768 and 1440 pixels in both languages), both Russian consent variants,
signature-required validation, confirmation, all five unavailable-invitation states,
PDF load failure and signed-language redirects. API calls were mocked throughout.
