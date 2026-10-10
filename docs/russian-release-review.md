# Russian translation parity review

Reviewed 10 October 2026. The owner subsequently approved Russian indexing: it is now enabled in the release build and the preparation notice is removed. No deployment was performed.

## Coverage

Compared all 38 Russian public pages with their Hebrew counterparts: homepage, About, Contact, service and pricing overviews, seven service pages, seven pricing pages, four galleries, Privacy, Accessibility, five articles, article listing, category and six tag pages.

- Main heading structure, photos and internal destinations match after removing the language prefix.
- Package amounts and delivery wording match; delivery is 14 business days.
- The few numeric-text differences are equivalent formatting: Russian spells out two outfits and formats policy dates differently.
- Header/footer navigation shares one tree, in the requested order: couples, intimate couples, personal, feminine, pregnancy, family, first-year.
- Russian links remain in Russian wherever a translated destination exists. Built-page checks verify destinations and section anchors.
- Homepage article previews link to Russian posts and the Russian article listing.
- Canonicals, language/direction attributes and structured data were checked. The subsequent release validation verifies indexable Russian content, reciprocal language alternates, sitemap inclusion and removal of the preparation notice.

## Fixes from this review

- Translated remaining Hebrew homepage structured-data descriptions and location names.
- Corrected Russian structured-data homepage and breadcrumb destinations.
- Supplied page metadata to structured data where separate rich metadata was absent.
- Matched clickable email, telephone and Contact links on Hebrew policy pages to the Russian versions.
- Added structured-data regression coverage.
- Clarified the owner-approved intimate-session exception to the private-home policy in both homepage FAQs.

## Scope boundaries and outstanding items

- `/landing/couples` stays Hebrew-only by explicit owner decision.
- Contract, fillable PDF and signing confirmation are a separate Russian-contract milestone; management remains Hebrew.
- The owner explicitly chose to keep the generic 404 recovery page and RSS feed Hebrew-only; neither blocks this release.
- Owner confirmed private locations remain available for intimate sessions. Both homepage FAQs now state this exception explicitly; other photography types remain outdoors or in a studio.

## Validation

- Production build passed.
- 131 automated tests passed, including built-page link/anchor and metadata checks.
- Astro: zero errors and warnings (43 informational hints).
- ESLint passed.
- Browser: all 38 Russian pages passed at 320, 768 and 1440 pixels (114 layout/content checks); no overflow or browser exceptions.
- All 38 Hebrew/Russian language-switch round trips passed; site header/footer destinations match in the browser and built HTML. Browser navigation comparisons exclude the Astro development toolbar.
- Rebuilt and reran all 131 tests after the approved homepage location clarification; all passed.

## Indexing release validation

Production build, Astro and ESLint checks passed. All 132 tests passed, including Russian sitemap entries, index/follow metadata, reciprocal language links, crawl permission and notice removal on all translated pages. The existing noindex/follow policy for article listings, categories and tags remains aligned with Hebrew.
