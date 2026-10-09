# Russian translation: staged implementation

Implemented on `russian_translation`: language infrastructure plus the pregnancy, couples, intimate couples, personal portrait, feminine/boudoir and family pages. The rest of the public-site translation and Russian contract workflow remain future milestones. Nothing has been deployed by this implementation.

## Review routes

- `/ru/services/pregnancy-photography`
- `/ru/pricing/pregnancy`
- `/ru/gallery/pregnancy`
- `/ru/services/couples-photography`
- `/ru/pricing/couples`
- `/ru/gallery/couples`
- `/ru/services/intimate-couples-photography`
- `/ru/pricing/couples-intimate`
- `/ru/services/personal-photography`
- `/ru/pricing/personal`
- `/ru/gallery/solo`
- `/ru/services/feminine-photography`
- `/ru/pricing/feminine`
- `/ru/gallery/feminine`
- `/ru/services/family-photography`
- `/ru/pricing/family`

Service, pricing and gallery pages use shared Astro templates (intimate couples reuses the couples gallery) as their existing Hebrew equivalents. Editorial messages are paired in `src/i18n/{pregnancy,couples,intimate,personal,feminine,family}/*.he.json` and `*.ru.json`; message keys are semantic and substitutions are checked by tests. Russian name spelling confirmed by the owner: **Юлия Коренская**.

## Release safeguards

`russianIndexingEnabled` in `src/i18n/routes.ts` intentionally remains `false`. Russian pages have self-canonicals but `noindex,follow`, stay out of the sitemap, and have no search hreflang annotations until release. The language switch is a normal link and does not require JavaScript; JavaScript additionally preserves known section anchors and never propagates queries.

Do not enable Russian indexing merely because the pilot looks good. Complete the planned public translations, replace the pilot navigation and untranslated-link labels, and perform a release review first. The registry and tests already support reciprocal `he`, `ru`, and `x-default` alternates after the release flag is enabled.

Only complete translation pairs appear in the registry. Untranslated destinations are explicitly labeled as Hebrew. There is deliberately no Russian homepage placeholder or redirect to the pregnancy service.

Language switching currently uses full document navigation (`data-astro-reload`) to reliably reset font, direction, and third-party widgets. Navigation within a language continues to use Astro's router.

## Shared facts and assets

Prices remain in the existing `PRICES` source. Pregnancy package identifiers, photo quantities, child supplement, and photographs are shared. Localized package presentation is returned by `getPregnancy(locale)`; existing Hebrew exports remain compatible with other pages. No database keys or business terms were changed.

Public estimated durations remain distinct from the contract duration system. The owner resolved the family starting-price discrepancy: use the central family price everywhere (700 ILS starting price). The homepage delivery promise and contract wording identified in the plan remain unresolved.

The Russian gallery uses the existing 26-image selection with explicit Russian descriptions. Localized gallery labels travel on each component instance, avoiding stale language after client navigation. Rubik is already installed and supplies Cyrillic glyphs; font resources are used when the Russian font is applied. Hebrew continues to use Heebo.

## Couples milestone

Pregnancy was reviewed by the owner. Couples is the second review unit: service, pricing and the shared 25-image couples gallery. Existing prices (600/800/1000 ILS), package IDs, quantities, booking terms and lead-source identifiers are preserved. `getCouples(locale)` provides localized packages, facts, offers and contact messages. Image descriptions are explicit and keyed by the existing filenames.

Russian navigation now groups pregnancy and couples. Intimate service/pricing links now lead to their Russian equivalents. The floating WhatsApp message follows the current photography type; switching language preserves the couples booking anchor as well as package anchors.

## Intimate couples milestone

The owner approved regular couples. The intimate service and pricing pages now share templates with their Hebrew equivalents and reuse the translated couples gallery. The original caveats about regular-couples sample images and the non-intimate testimonial are retained. Consent, optional nudity, privacy, delivery and booking wording is translated without changing the business terms. Packages share numeric prices and photo quantities; lead-source identifiers remain intact.

Russian navigation includes intimate sessions, crosslinks stay in Russian, WhatsApp inquiries identify the intimate service, and language switching preserves the privacy section anchor. No new gallery, privacy policy, publication permission or contract workflow was introduced.

## Personal portrait milestone

The owner approved intimate couples. Personal portrait service, pricing and the existing 25-image solo gallery are translated. `getPersonal(locale)` shares package prices, IDs and photo quantities with Hebrew while localizing descriptions, offers, inquiries and facts. The gift-voucher inquiry is also Russian. The feminine/boudoir crosslink now leads to the Russian service page.

Russian header navigation is grouped into services, prices and galleries, with the shared couples gallery listed once. All completed categories are reachable. The floating WhatsApp message recognizes all three personal routes, including `/gallery/solo`. Booking and package anchors are preserved when switching languages.

## Feminine and boudoir milestone

The owner approved personal portraits. Feminine/boudoir service, pricing and the existing 16-image gallery are translated. Prices, photo quantities, delivery and booking terms are unchanged. Studio surcharges remain explicit; the translation retains the distinction between portraits and boudoir, optional nudity, personal boundaries and the invitation to discuss privacy and photo use before booking.

`getFeminine(locale)` shares package facts, and `getFeminineGallery(locale)` preserves the existing hero, studio, outdoor and featured selections with filename-keyed Russian descriptions. Navigation, the personal portrait crosslink, preview notice and WhatsApp inquiries now include this category. Language switching preserves the preparation section and package anchors.

Validation includes 15 responsive checks at 320, 390, 768, 1024 and 1440 pixels, the 16-image gallery/lightbox, mobile navigation, Russian contact messages and Hebrew/Russian switching. The contract workflow is still a separate pending milestone.

## Family milestone

The owner approved feminine/boudoir. Family service and pricing are translated using shared templates and existing photo assets. The old family hero referenced a missing file; it now uses the existing mother-and-child photo from `family_gallery`, with a mobile crop that keeps both faces visible. There is no existing standalone family gallery, so no gallery route was invented. The Hebrew service page previously advertised 600 ILS; the owner explicitly approved using the central family price everywhere. Both languages now use 700 ILS from `PRICES`, with packages at 700/900/1300 ILS.

The two-adult/two-child inclusion and 100 ILS extra-child charge are preserved. The extra-child amount is shared between translated prose and cards. FAQs, booking steps, image descriptions and package-specific WhatsApp inquiries are translated. Pregnancy crosslinks remain Russian; first-year pricing is labeled Hebrew until that category is translated. The shared bottom contact component accepts translated content while retaining its Hebrew defaults elsewhere.

Validation covers both pages at five viewport widths, mobile navigation, both language directions, family contact messages and the corrected Hebrew starting price. Built-page tests also check the price correction and both languages' package amounts.

## Next milestone

Continue one photography type at a time, each as a complete service/pricing/gallery unit for review. Then translate the homepage, articles, contact/about and supporting pages. Russian contracts need a separate tested implementation of invitation language/version, PDF variants, form labels, email and confirmation. Management itself remains Hebrew.

## Validation

- `node --test tests/*.test.mjs`
- `npm run check:astro`
- `npm run check:eslint`
- `npm run build` (requires network for existing Google-font and remote-image lookups)
- `node --test tests/i18n-built.test.mjs` after the build
- Browser review of each type’s three routes at 390, 768 and 1440 pixels; gallery controls, mobile navigation, language switching and package anchors.

No email delivery, contract issuance or production database operations are needed for these checks.
