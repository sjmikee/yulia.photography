# Pregnancy photography: research and implementation

Research date: 23 September 2026. Hebrew-language Israeli search results and public competitor pages. This is qualitative intent/competitor research, not measured keyword volume, a verified ranking report, or Search Console analysis. No ranking outcome is guaranteed.

## Page inventory and search intent

| Page                                              | Intent and query themes                                                                                                                        | Research-informed change                                                                                                                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/services/pregnancy-photography`                 | Choose a photographer: צילומי הריון, צילומי הריון בטבע / בים / במרכז / בחולון, צילומי הריון צנועים, צילומי הריון זוגיים; preparation questions | Rebuilt around experience, comfort, locations, preparation and authentic photographs. Clear starting price and links to the dedicated comparison/gallery pages.                        |
| `/pricing/pregnancy`                              | Decide budget/package: צילומי הריון מחיר, מחירון צילומי הריון, חבילות צילומי הריון                                                             | Comparable table and package cards, transparent child/studio supplements, individual package enquiry messages, existing payment/delivery terms.                                        |
| `/gallery/pregnancy`                              | Evaluate work and find inspiration: גלריית צילומי הריון, תמונות הריון בטבע / בים, רעיונות לצילומי הריון                                        | Real portfolio retained; useful introduction, individually reviewed Hebrew image descriptions, responsive images, accessible local lightbox, direct pricing/preparation/enquiry links. |
| `/`                                               | Broad local photographer discovery                                                                                                             | Pregnancy section now introduces the experience and links to the service page. Other services retain their focus.                                                                      |
| `/services`                                       | Choose a service                                                                                                                               | Pregnancy card explains location, support and solo/couple options.                                                                                                                     |
| `/pricing`                                        | Find the relevant price list                                                                                                                   | Pregnancy card gives the current starting price from the central price source, with a concise comparison promise.                                                                      |
| `/services/family-photography`                    | Family session that includes pregnancy                                                                                                         | Existing pregnancy section now links to the service and pregnancy supplements.                                                                                                         |
| `/about`, `/contact`                              | Photographer credibility and contact                                                                                                           | Reviewed as supporting pages, not duplicate pregnancy landing pages. Existing broad-service mentions retained; service page links to About and provides phone/WhatsApp contact.        |
| Navigation/footer, site configuration, common SEO | Discovery and shared business identity                                                                                                         | Existing pregnancy navigation destinations preserved. Existing canonicals and sitemap paths preserved.                                                                                 |
| `/clients/add_session`, `/clients/add_event`      | Internal session administration                                                                                                                | Inventory only; not public pregnancy acquisition pages, left unchanged.                                                                                                                |

No dedicated pregnancy article was found in the content search. No thin city pages or duplicate keyword landing pages were added.

## Competitor observations

- [Lital Peer maternity pricing](https://www.litalpeer.co.il/pricematernity): clearly separates duration, delivered images, styling and package price. Applied to the pricing page with a direct comparison; no competitor terms or inclusions were copied.
- [Anda Yoel outdoor maternity](https://andayoel.com/maternity_outdoors): combines portfolio, outdoor positioning and a route to pricing. Applied to the service/gallery connection and specific nature/sea choice. Her studio wardrobe/privacy claims were not adopted.
- [Malena Romano pregnancy](https://www.malenaromano.com/pregnancy/): connects a reassuring introduction with practical solo/couple/family package details. Applied to gallery context and explicit family supplements, and concise related cards on the service/pricing hubs.
- [Nitzan photography nature guide](https://nm-photography.com/pregnancy-photos-in-nature/): search excerpt discusses light, clothing and outdoor locations. Full-page retrieval failed; used only as a directional signal for preparation intent, not as a source for business facts.
- [Maayan Druyan](https://maayandruyan.com/): search result emphasizes named local service areas, social proof and accessible contact. Inference for supporting pages: make the route from discovery to the photographer and contact clearer, without fabricating credentials, ratings or city coverage.

Opportunity: make the difference between experience, examples and price immediately understandable, answer the practical questions, and use Yulia's photographs and voice. Repeating every keyword in every paragraph obscures these decisions.

## SEO basis

- [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): specific original help, descriptive titles and a clear author/photographer connection. Each dedicated page serves a different decision.
- [Google: image SEO](https://developers.google.com/search/docs/appearance/google-images): relevant surrounding text, meaningful alt text, actual image elements and responsive delivery. Reviewed a contact sheet of all existing pregnancy portfolio/service images before describing them.
- Unique title, description and page-specific social image for each dedicated page; gallery uses the common layout's WebPage and breadcrumb graph instead of a duplicate body graph.
- Service/Offer structured data on service and pricing pages reflects visible packages and draws from the same data as the comparison/cards. It is semantic markup, not a promise of a special Google result. No invented reviews, aggregate ratings or FAQ rich-result claims.
- URLs remain stable. Existing navigation, canonical handling and sitemap are retained.

## Business facts and boundaries

Preserved the published ₪700 / ₪900 / ₪1,200 prices; 45 minutes / 90 minutes / approximately two hours; existing image-count wording; ₪100 per child; studio by arrangement at additional cost; digital delivery within 14 business days; ₪100 reservation payment and existing cancellation/postponement deadlines. All prices still originate in `src/lib/pricing.ts`.

The published “at least 30–40 / 40–50 / 50–70” phrasing is ambiguous. It remains unchanged rather than silently changing the deliverable; the owner should eventually confirm whether these are ranges or guaranteed minimums. No studio price, free partner inclusion, wardrobe inventory or exclusive outdoor privacy promise was invented.

Existing testimonials retained verbatim. Removed the second portrait because the source import was `inbal_review.jpg` while the displayed attribution was Zehava. Replaced repeated Japanese Garden descriptions after inspecting photos that actually show beach/trees/stone. Avoided naming an unverified location. The timing range is presented as a photography planning starting point, not medical advice.

Tone: first-person Hebrew, reassuring and lightly playful; e.g. help with posing, room to laugh, a little sand in the shoes. No urgency tricks or unsupported “most popular” claims.

## Verification

- Production build passes using an ephemeral, local-only `SESSION_SECRET` (the production build requires one at middleware import time); no secret or environment file changed.
- Targeted ESLint and formatting checks for the new components, data and dedicated pages.
- Browser checks at phone and desktop widths, including service → pricing → gallery navigation and gallery opening/navigation/closing.
- Full Astro type check reports 111 errors in unrelated files and no diagnostics in the new pregnancy components/data or dedicated pages. This is not a clean full-project type check.
- Generated HTML checks pass for all three dedicated pages and all 45 gallery photographs: a single H1, correct canonicals, descriptions, non-duplicated WebPage data, matching offer prices, valid internal links/fragments and Hebrew gallery alt text.

## After publication

Use Search Console to record the three URL baselines, request recrawling, and compare page/query impressions, clicks and click-through rate after sufficient data accumulates (roughly 4–8 weeks). Track enquiry clicks separately from confirmed bookings; compare pregnancy enquiries and booking rate. No Search Console or analytics account was accessed, and no production deployment was performed in this task.
