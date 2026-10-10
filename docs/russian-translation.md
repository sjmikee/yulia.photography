# Russian translation: staged implementation

Implemented on `russian_translation`: language infrastructure plus the pregnancy, couples, intimate couples, personal portrait, feminine/boudoir and family pages. The public homepage, overviews, About, Contact, policies and five articles with their listing/topic pages are also translated. The Russian contract workflow remains a separate milestone. Nothing has been deployed by this implementation.

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

Only complete translation pairs appear in the registry. Untranslated destinations are explicitly labeled as Hebrew. The Russian homepage is available at `/ru` and uses the same template as the Hebrew homepage.

Language switching currently uses full document navigation (`data-astro-reload`) to reliably reset font, direction, and third-party widgets. Navigation within a language continues to use Astro's router.

## Shared facts and assets

Prices remain in the existing `PRICES` source. Pregnancy package identifiers, photo quantities, child supplement, and photographs are shared. Localized package presentation is returned by `getPregnancy(locale)`; existing Hebrew exports remain compatible with other pages. No database keys or business terms were changed.

Public estimated durations remain distinct from the contract duration system. The owner resolved the family starting-price discrepancy: use the central family price everywhere (700 ILS starting price). The owner confirmed a homepage delivery promise of 14 business days in both languages. Contract wording remains a separate pending item.

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

The two-adult/two-child inclusion and 100 ILS extra-child charge are preserved. The extra-child amount is shared between translated prose and cards. FAQs, booking steps, image descriptions and package-specific WhatsApp inquiries are translated. Pregnancy crosslinks remain Russian; first-year pricing now links to its Russian translation. The shared bottom contact component accepts translated content while retaining its Hebrew defaults elsewhere.

Validation covers both pages at five viewport widths, mobile navigation, both language directions, family contact messages and the corrected Hebrew starting price. Built-page tests also check the price correction and both languages' package amounts.

## First-birthday milestone

The owner approved family. First-birthday service and pricing now share localized templates, with Russian copy, metadata, photo descriptions, reviews, FAQs, booking steps and package-specific WhatsApp inquiries. Existing photographs are retained; there is no standalone first-year gallery. The landscape hero retains its aspect ratio and uses a mobile crop around the child.

Prices remain sourced from the central list (700/900/1200 ILS). Durations, photo quantities, studio surcharge, cake/decor exclusions, delivery and booking terms are preserved. Family crosslinks now work in Russian in both directions. All photography categories are now in Russian navigation; indexing remains disabled pending the complete-site release review.

## Homepage milestone

The homepage is translated at `/ru`, using a shared template and paired semantic message dictionaries. Hero copy, service links, FAQs, reviews, photo descriptions, metadata and WhatsApp inquiries are localized. The Russian header logo and home link lead to the Russian homepage. Both homepages display the latest four articles in their own language, with links to the corresponding article listing. Decorative background and reviewer images have empty alternative text. The duplicate reviews section ID is removed.

Validation covers five viewport widths (320–1440 pixels), mobile navigation, logo navigation, both language directions and preserved review anchors. Production build, Astro and ESLint checks pass.

The owner approved aligning the homepage delivery promise with the service pages: 14 business days in both Hebrew and Russian. Indexing remains disabled.

## About and Contact milestone

About and Contact now use shared Hebrew/Russian templates at `/about`, `/contact`, `/ru/about` and `/ru/contact`. Personal copy, headings, photo description, breadcrumbs, metadata and contact labels are translated. Phone, email and social destinations are preserved; Russian WhatsApp actions include a localized inquiry. Both pages are linked in Russian header/footer navigation. Contact cards wrap on narrow screens, and Russian desktop navigation has room for the expanded links and language controls. The contact page still omits the floating WhatsApp button. Browser validation covers both pages at 320, 390, 768, 1024 and 1440 pixels, header overlap, mobile navigation, contact destinations, breadcrumbs and both language directions.

## Service and pricing overview milestone

The service and pricing overviews now share localized templates at `/services`, `/pricing`, `/ru/services` and `/ru/pricing`. All seven categories are linked in both languages. The missing family pricing card is added, using the central 700 ILS starting price, and the broken family service image is replaced with the existing family photo used on the service page. Pregnancy and feminine starting prices still come from `PRICES`. Card action text and accessible link labels, image descriptions, breadcrumbs, metadata and the pricing WhatsApp inquiry are localized. Russian navigation and footer include both overviews. Browser checks cover both pages at five viewport widths (320–1440 pixels), all seven category cards and images, the family starting price, accessible link labels, breadcrumbs, language switching and mobile navigation.

## Completed-page link audit

All translated category pages now use current Russian labels for home, service/pricing overviews and About links. Removed 54 obsolete “in Hebrew” qualifiers and changed the footer logo to the Russian homepage on Russian pages. Built-page validation checks every Russian page for links to Hebrew pages that have Russian equivalents, missing Russian destinations and obsolete link labels. Article, privacy and accessibility links now lead to their Russian translations.

## Privacy and accessibility milestone

Russian Privacy and Accessibility pages are available at `/ru/privacy` and `/ru/terms`, using the existing Markdown layout. The translations preserve the original policy dates, claims, accessibility coordinator and contact details. Russian footer links point to these pages without Hebrew-only labels; privacy contact links lead to `/ru/contact`. Both pages participate in language switching and remain excluded from search until release. This milestone translates the existing policies; it does not revise or certify their legal or accessibility claims.

## Next milestone

Photography categories are complete. Next perform the complete public-site release review. Confirm the remaining public route inventory before enabling indexing; the contract workflow is still separate. Russian contracts need a separate tested implementation of invitation language/version, PDF variants, form labels, email and confirmation. Management itself remains Hebrew.

## Validation

- `node --test tests/*.test.mjs`
- `npm run check:astro`
- `npm run check:eslint`
- `npm run build` (requires network for existing Google-font and remote-image lookups)
- `node --test tests/i18n-built.test.mjs` after the build
- Browser review of each type’s three routes at 390, 768 and 1440 pixels; gallery controls, mobile navigation, language switching and package anchors.

No email delivery, contract issuance or production database operations are needed for these checks.

## Navigation alignment

Hebrew and Russian headers and footers now share the same navigation tree. Services and pricing use the owner’s order: couples, intimate couples, personal, feminine, pregnancy, family, first-year. Galleries follow the same relative order for available galleries, without duplicating the shared couples gallery. Russian navigation translates the Hebrew tree directly, preserving overview links, grouping and contact actions; Tips links to the translated article listing. The narrow-phone header spacing was adjusted to fit the logo and language switch at 320 pixels.

## Articles milestone

All five published articles have Russian MDX counterparts, preserving publication dates and images. The shared article system now selects content by language for posts, listing, category, tags, related posts and homepage previews. Existing Hebrew URLs are retained; Russian equivalents use `/ru`. The personal article's historical canonical typo is corrected to its actual existing URL in both languages. Labels, date formatting, reading time, sharing controls, WhatsApp calls to action, topic links and back-to-articles links are localized. The homepage shows four Russian previews and links to `/ru/articles`; header and footer Tips links now stay in Russian.

The owner approved correcting two existing inconsistencies in both languages: couples photo quantities depend on the selected package, and family locations are outdoors or in a studio, not private homes. Search indexing remains disabled for Russian pages. Article listings and taxonomy pages retain the existing noindex policy in both languages. Automated validation covers all article pairs, topic pages, homepage language isolation, links and anchors. Browser validation covers all 13 new Russian routes at 390, 768 and 1440 pixels, four Hebrew/Russian switch pairs, loaded article images and the homepage-to-article-to-pricing journey; listing and article layouts were additionally checked at 320 pixels.

## Final parity review

See [Russian release review](./russian-release-review.md) for the 38-page inventory, final metadata/contact-link corrections, validation and scope exclusions. The owner chose to keep `/landing/couples` Hebrew-only. Russian search indexing remains disabled. Contract/signing, the generic Hebrew 404 page and Hebrew RSS feed are tracked separately from translated content pages.

## Russian indexing release — 10 October 2026

Owner approved enabling Russian search indexing and removing the preparation notice. `russianIndexingEnabled` is now true and the notice is removed from the shared page layout. Eligible Russian content pages enter the generated sitemap and receive `index,follow`; both language versions expose reciprocal Hebrew/Russian and Hebrew x-default alternates, with self-canonicals. Article listings, categories and tags retain the existing Hebrew-equivalent `noindex,follow` policy and remain crawlable. Robots.txt already allows public crawling. The owner chose to leave RSS and the generic 404 Hebrew-only. This change prepares the production build; it does not itself deploy it.
