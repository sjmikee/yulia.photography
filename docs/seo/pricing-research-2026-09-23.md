# Hebrew pricing-page SEO research

Research date: 23 September 2026. Scope: `/pricing/pregnancy` and `/pricing/first-year`.

## Evidence and limits

Reviewed public search results for צילומי הריון מחיר חבילות צילום הריון, צילומי גיל שנה מחיר חבילות סמאש קייק, צילומי הריון מחיר חולון, and צילומי גיל שנה מחיר מרכז. These are research results, not a localized Google rank report. Positions 50–60 are user-reported; no Search Console data was available. Search results and cached pages can vary by date and location. Competitor prices below are displayed offers, not independently confirmed quotes or equivalent packages.

## Competitor findings

| Page | Observed content | Application to these pages |
| --- | --- | --- |
| [Liron Aloni maternity pricing](https://www.lironstudio.com/pregnentpricing) | An ₪800 studio offer specifies one hour, edited-photo count, clothing/accessories and a separate outdoor supplement. | Answer the price question immediately and distinguish inclusions from extras. |
| [Efrat Saar maternity pricing](https://www.efratsaar.com/maternitypricelist) | ₪1,450 and ₪1,750 packages specify duration, participants, basic versus full editing, delivery and geographic limits. | Make package selection, child supplements and delivery timing easy to understand. This is a content benchmark outside the core local area. |
| [Studio Or: first birthday versus cake smash](https://www.studioor.co.il/post/צילומי-גיל-שנה-או-סמאש-קייק) | Explains the two experiences; lists ₪1,100 birthday and ₪1,380 cake-smash studio packages, with a separate outdoor supplement. | Address cake-smash intent without inventing a cake package. Explain the natural/family session and ask visitors to clarify special requests before booking. |
| [Maayan Druyan: Holon](https://maayandruyan.com/locations/holon) | Local location guidance, work samples, service links and questions about logistics. | Use supported Holon/central-Israel context and link to existing work; avoid invented studio addresses or travel promises. |

These observations suggest opportunities to improve usefulness and intent alignment. They do not establish why a competitor ranks or prove that matching a content feature will cause a ranking increase.

## Search intent and page ownership

| URL | Primary intent | Supporting Hebrew phrases |
| --- | --- | --- |
| `/pricing/pregnancy` | Price and package comparison | צילומי הריון מחיר, מחירון צילומי הריון, חבילות צילומי הריון, מחיר צילומי הריון בחולון |
| `/pricing/first-year` | First-birthday price and package comparison | צילומי גיל שנה מחיר, מחירון צילומי גיל שנה, צילומי יום הולדת שנה, צילומי גיל שנה במרכז |
| `/services/pregnancy-photography` | Experience and portfolio | צילומי הריון, צילומי הריון בטבע, צילומי הריון בים |
| `/services/first-year-photography` | Experience and preparation | צילומי גיל שנה, צילומי יום הולדת ראשון |

Cake-smash terminology is explanatory, not a claim that an unverified service is sold. No search-volume or keyword-difficulty figures were available. The service/pricing separation is an intent strategy, not a confirmed diagnosis of keyword cannibalization.

## Implemented

- Price-focused Hebrew titles and descriptions; prices come from the existing shared price source.
- Disabled automatic brand suffix on both titles to prevent a repeated name.
- Preserved existing URLs, self-canonical behavior, indexability, breadcrumbs and Hebrew RTL layout.
- Added opening answers showing ₪700 / ₪900 / ₪1,200 and corresponding durations.
- Added early links to the package section and WhatsApp.
- Rewrote package-selection guidance and clarified studio supplements near the prices.
- Kept existing prices, photo quantities, deposits and cancellation terms.
- Explained the pregnancy child supplement with a calculated example.
- Added first-birthday preparation and scheduling guidance based on the existing 14-business-day delivery window.
- Added relevant internal links, pricing/delivery FAQs and cleaner image alternative text.
- Preserved unrelated working-tree changes. The first-year service page linked by the rewrite was already present as an untracked file; include it when releasing that link.

No fabricated testimonials, credentials, ratings, locations or new package benefits were added. Existing structured data was retained; no rich-result eligibility or ranking benefit is promised.

## Release and measurement

1. Publish the reviewed changes through the normal deployment process, including the first-year service route already present in the workspace.
2. In Google Search Console, inspect both exact URLs. Confirm crawl access, Google-selected canonical and indexing, then request indexing after deployment.
3. Record a pre-release baseline by page, country Israel and relevant Hebrew queries: impressions, clicks, CTR and average position. Compare equivalent 28-day periods and account for seasonality and changes in query mix.
4. Review at roughly 4, 8 and 12 weeks. These are measurement checkpoints, not promises of ranking timing. Track leads alongside rankings.
5. If progress stalls, inspect which URL Google shows per query; assess local Business Profile completeness, authentic reviews, relevant earned links, competing pages and mobile performance using actual data.
6. Business details that could strengthen a later revision: exact studio supplement, whether partner participation has a charge, first-year sibling fees, cake-smash availability, and whether clothing/prints are supplied. Do not invent these to match competitors.

Google recommends useful, people-first content rather than writing to a presumed word count: [Google Search Central guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Rewriting is one part of the work toward top-10 visibility; there is no guaranteed position.

## Validation

- Both edited pages pass focused ESLint and Prettier checks; `git diff --check` passes.
- Rendered HTML checks pass for a single H1, price in title, a single brand name, self-canonical URLs, `index,follow`, the package jump link, parsable existing JSON-LD, and service/gallery link targets.
- Site-wide Astro check reports 111 errors outside these two pages, including missing module/type references and client-page typing errors. No diagnostics name either edited pricing page. This work does not repair those unrelated issues.
- Build validation uses a temporary, test-only session secret because this checkout does not supply `SESSION_SECRET`; it is not a deployment credential and is not stored in source.
- Production build completed successfully. Vercel warned that local Node 25 differs from its selected Node 24 runtime.
