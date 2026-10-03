# Regular couples: research and implementation — 29 September 2026

## Scope

Refactored `/services/couples-photography` and `/pricing/couples` using the established intimate-couples components. Reused the existing curated gallery and its 25 published photographs; no separate gallery or new photography. Preserved established service/pricing titles, URLs, pricing H1, canonical behavior, navigation and booking terms. Corrected two stale ₪500 mentions on the noindex campaign page `/landing/couples` to derive from current package data; that campaign page was not otherwise redesigned.

## Research and search intent

Searches: `צילומי זוגיות מחיר חוויה זוגית צלמת מרכז`, `"צילומי זוגיות" "מחיר" -site:yulia.photography`, `"צילומי זוגיות" "לא" "מצלמה" -site:yulia.photography`. Results are qualitative intent research, not keyword volumes, a localized rank report or evidence of competitors' conversion rates.

Primary business pages reviewed:

- [Elad Rachlis — couples](https://www.eladrachlis.com/couple/): differentiates packages by duration and deliverables, connects couples photography with Save the Date, and discloses delivery, deposit and location extras. Adopt the decision clarity, not his package specifications or terms.
- [Studio Kamomil — couples / Save the Date](https://kamomil.com/save-the-date/): connects a shared outdoor experience with an explicit edited-image package, delivery and optional printed products. Our copy addresses the occasion but does not promise their invitation designs, albums or extras.
- Tali Lifshitz appeared in search results but the full page could not be retrieved; no implementation claim relies on that page.

General guidance:

- [NN/g: trustworthiness in web design](https://www.nngroup.com/articles/trustworthy-design/) supports clear presentation, upfront disclosure and complete information. Application here: show prices and deliverables, identify Yulia, expose booking terms, and make portfolio examples easy to reach.
- [Google: people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) favors useful, original information that helps visitors accomplish their goal. Replaced repetitive keyword sections with concrete preparation and buying guidance.
- [Google: title links](https://developers.google.com/search/docs/appearance/title-link) recommends clear, descriptive page titles and prominent headings. Retained existing distinct titles and one H1 per page to avoid unnecessary changes to established search signals.

## Customer psychology: design hypotheses

These are hypotheses informed by usability guidance and observed competitor messaging, not customer interviews or measured conversion lifts:

1. Camera anxiety: explain what guidance actually involves (walking, talking, hand placement), without promising instant confidence.
2. Different enthusiasm between partners: invite a conversation and a mutually wanted session rather than pressure.
3. Choice effort: compare time, price and fully edited images side by side; describe which package fits which need. The classic recommendation is editorial, not a fabricated bestseller claim.
4. Emotional relevance: include everyday togetherness, anniversaries, gifts and engagement/Save the Date. Mention the real delivery window when images are needed for an event.
5. Trust: use existing portfolio assets and an existing Osher review excerpt labeled as general client feedback. Remove the old second review whose attribution/image did not match. Do not add ratings or review schema.
6. Enquiry friction: package-specific WhatsApp messages and an invitation to ask questions without choosing a package first.

## Preserved business facts

| Package | Price  | Fully edited photos (existing published wording) | Approximate duration |
| ------- | ------ | ------------------------------------------------ | -------------------- |
| Basic   | ₪600   | at least 30–40                                   | 45 minutes           |
| Classic | ₪800   | at least 40–50                                   | 90 minutes           |
| Premium | ₪1,000 | at least 50–70                                   | about two hours      |

Premium retains up to two outfits and breaks. All include preparation/guidance and a high-resolution downloadable digital gallery. Delivery: up to 14 business days. Deposit: ₪100; refundable for cancellation up to three days before. Rescheduling: notification up to 24 hours before, by agreement. Studio/location rental is clarified before booking, without inventing a fee or assuming inclusion. No new tax, image-retention, publication or privacy guarantees.

## Implementation and measurement

`src/lib/couples.ts` supplies package facts, cards, journeys, service offers and summary facts. Prices remain sourced from the central `PRICES` object. Both pages use existing reusable sections and the curated `couples-gallery` manifest. Below-fold images are lazy-loaded; service hero is prioritized with responsive sizes.

`LeadTracking` uses service `couples`. Sources: `couples-service-hero`, `couples-pricing-hero`, `couples-package-basic`, `couples-package-classic`, `couples-package-premium`, `couples-bottom-cta`. These measure selected enquiry-link clicks, not sent messages or bookings. Existing global contact widgets and phone links are not included in this page-specific tracking.

Before publishing, capture Search Console's preceding 28 days for service/pricing/gallery queries, clicks, impressions, CTR and position, ideally segmented by Israel/device. Monitor weekly for four weeks after release, allowing for seasonality and indexing lag. Compare enquiry clicks per landing-page session, then qualified enquiries and actual bookings separately. No ranking or conversion improvement is claimed without post-release data.

## Validation

- Production build passed using a test-only SESSION_SECRET in the build process. Sandbox restriction on Astro's local listener required approved execution outside the sandbox; no production credentials changed.
- Existing SEO audit passed for regular service, regular pricing and shared gallery: canonical, indexability, one H1, valid JSON-LD, offer anchors, image metadata/social images and sitemap inclusion.
- Refactored pages and data module passed ESLint and Prettier. `git diff --check` passed. The campaign page's existing formatting was retained for its two price substitutions.
- Project-wide Astro check reports 111 existing errors elsewhere; none reported in the changed couples files. This is not a clean repository-wide type check.
- Browser review: desktop pricing comparison/cards and service layout; 390px mobile service/pricing pages fit a 390px document width. The 560px comparison table scrolls inside its region.
- Service gallery preview opened and advanced from image 1 to image 2 of 3. No enquiries were sent.
- Changes are local, not deployed. Search and conversion results require post-release observation.
