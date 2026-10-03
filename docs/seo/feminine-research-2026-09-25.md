# Feminine photography search research — 25 September 2026

## Scope and evidence

Queries: `צילומי נשיות מחיר`, `צילומי בודואר מחיר חבילות`. This is a search-result sample, not a localized Google rank report. Position ~15 is user-reported; no Search Console data was available. Results vary by location, device and date. No ranking outcome is promised.

| Competitor / source                                              | Observed offer and useful pattern                                                                                                           | Application                                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [Meital Zikri](https://www.meital-studio.co.il/feminine-pricing) | Search extract: ₪1,800, 90 minutes, ~150 basic edits plus 10 retouched images; studio and booking conditions explicit. Direct fetch failed. | State studio surcharge and booking conditions clearly.                                                       |
| [Yael Elad](https://newbornstudio.co.il/צילומי-נשיות-מחירון/)    | Direct page: ₪2,370 / 3,000 / 3,570, separate delivered and retouched counts, different look counts. Pricing links to the service.          | Comparison table and consistent edited-image counts, with service/gallery links.                             |
| [Noale](https://noale.co.il/services/)                           | Direct page: ₪1,380, 1–1.5 hours, 35 processed images.                                                                                      | Fast, factual price answer before editorial content.                                                         |
| [Compositzia](https://www.compositzia.com/women)                 | Search extract: basic and extended offerings, explicit counts and session length. Separate pricing page had different promotional amounts.  | Keep all our prices sourced from the existing central price list; do not publish a supposed market average.  |
| [Reut Ashkenazi](https://reutashkenazi.co.il/צילומי-נשיות/)      | Search extract discusses comfort, boundaries, choosing a photographer and factors affecting price.                                          | Answer preparation, clothing, comfort and location questions in original copy, without therapeutic promises. |

Offers differ in studio inclusion, editing and styling; prices are not like-for-like comparisons. Competitor wording was not copied.

## Implemented intent map

- `/pricing/feminine`: transactional price queries. Immediate ₪700–1,200 answer, table/cards, edited-image quantities, studio costs, choice guidance, delivery and existing deposit/cancellation terms.
- `/services/feminine-photography`: experience, feminine vs boudoir, clothing, comfort, location and preparation. Original professional/playful Hebrew in the pregnancy visual style.
- `/gallery/feminine`: visual inspiration using six visually checked, already-public photographs used on the prior feminine page. Explicitly describes clothed portraits; does not represent them as an intimate boudoir portfolio.
- All three pages cross-link through shared Journey; header/footer include the gallery. Existing service/pricing URLs preserved.
- Shared ServiceSchema uses the same package data as the visible cards and table. Generic Gallery, ImageSection and PricingCards retain their existing implementations.

## Business facts preserved / remaining inputs

Existing prices, photo quantities, approximate session lengths, premium clothing count, studio surcharge, 14-business-day delivery and booking terms are preserved. No new studio address, credentials, customer review or definitive image-publication policy was invented. Confirm a specific privacy/publication policy before making stronger promises. Additional approved boudoir portfolio images could broaden the gallery later.

## After publication

Record the release date. In Search Console, inspect the three canonical URLs and sitemap discovery. Compare equal 28-day periods for Israel, separating mobile and desktop, for the price-query cluster and service queries. Track impressions, clicks, CTR, average position and which URL ranks; also measure inquiries if analytics is configured. Review after indexing and enough impressions, rather than treating a short-term position change as conclusive. Top-three progress also depends on competition, reputation, links and site performance; no external promotion or deployment was performed as part of this edit.

## Validation

- Production build passed with an ephemeral test-only SESSION_SECRET (no production credential used).
- Changed TypeScript/Astro files passed ESLint; formatting applied; diff whitespace check passed.
- Repository-wide Astro check reports 111 errors elsewhere, with no diagnostics in the feminine files.
- Built HTML checks passed: one H1 and canonical per page, index/follow, valid JSON-LD, three correct offer prices, internal fragment targets and new gallery sitemap entry.
- Browser checks: pricing comparison, service hero, gallery images and lightbox next-image navigation; all three pages fit a 390px mobile viewport without document-level horizontal overflow (comparison table scrolls within its region).
