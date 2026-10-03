# Personal photography: research and implementation

Research date: 2026-09-29. Scope: existing service, pricing and `/gallery/solo` URLs. This is qualitative competitor research, not keyword-volume data, customer interviews or measured conversion evidence.

## Competitor observations

| Source | Observed positioning | Implication for Yulia |
| --- | --- | --- |
| [Ofer Keidar: private photography](https://www.oferkeidar.co.il/personal/) | Separates social-profile and dating packages; shows prices, time, image quantities, preparation and guidance for camera-shy customers. At review, listed ₪1,500 for 45 minutes/15 edited images and ₪1,300 for 90 minutes/30 edited images, with different retouching and location inclusions. | Make purpose and deliverables clear. These are different offers, not evidence of a like-for-like price advantage. |
| [Anda Yoel: portraits and dating](https://andayoel.com/tadmit) | Emphasizes understanding the client's needs and planning pictures for multiple channels, including LinkedIn and social networks. | Ask what the images will be used for before choosing setting and clothes. |
| [Mor Levi: dating photography](https://mor-levi.co.il/dating/) | Search-indexed copy highlights clothing that expresses interests and a range of approachable, elegant and everyday images. Direct page access was blocked by a browser challenge. | Explain variety through concrete planning rather than promise dating results. Treat this source as search-excerpt evidence only. |

## Audience hypotheses

Segments are inferred from competing offers and the existing personal service, not validated demographics. Avoid unsupported age, income or gender stereotypes.

- **Personal keepsake / milestone:** a birthday, a new chapter or simply wanting pictures of oneself. Needs permission to book without a major occasion, visual examples and clear guidance.
- **Profile refresh:** social or dating profiles. Wants recognizable, expressive portraits; worries about looking stiff or overly staged. Address the intended use without promising matches.
- **Individual professional presence:** LinkedIn, an about page, creators and independent professionals. Needs purposeful background, clothing and framing. Confirm specific commercial or output requirements before booking; do not imply a full brand campaign is included.
- **Gift buyer:** needs a clear way to ask about a voucher while allowing the recipient to choose the setting and date.
- Camera discomfort cuts across all segments: answer “what do I do with my hands?”, preparation, direction and session pace early.

## Content and conversion decisions

Use playful, assured Hebrew: “כל הפריים שלך”, “הסלפי מהמעלית יכול לנוח”. Authority comes from describing lighting, location planning, posing guidance and delivery, not invented credentials or transformation promises.

Reuse the established photoshoot components: Journey, SessionFacts, ImageSection, Gallery, PackageComparison, PricingCards, ServiceSchema and LeadTracking. Centralize the personal offer in `src/lib/personal.ts`. Every package has a contextual WhatsApp message and tracked lead source. Keep phone contact and service/pricing/gallery navigation. Retain the existing gallery collection through an explicit manifest with visually reviewed descriptions.

Preserve ₪600/800/1,000 prices, 45 minutes/90 minutes/about two hours, published “at least 30–40 / 40–50 / 50–70” quantities, premium's two outfits, 14-business-day delivery, ₪100 deposit and existing cancellation/rescheduling terms. The inherited photo quantity wording is ambiguous but remains unchanged rather than inventing a different guarantee. No studio rental, makeup or album inclusion is invented.

Remove lengthy repetitive prose, the unverified anecdote and generic couple-oriented testimonials from the personal service page. Portfolio examples serve as relevant evidence; do not label reviews of another session type as personal-session reviews.

## Search intent and technical implementation

- Service: צילום אישי, בוק אישי, צילומי פורטרט, צילום אישי לנשים ולגברים, במרכז.
- Pricing: מחירון צילומי בוק אישי, כמה עולה בוק אישי, package comparisons and booking terms.
- Gallery: visual proof for פורטרטים, בוק אישי ותדמית.
- Preserve route names and established title/H1 subjects; use one H1 per page, unique descriptions, shared breadcrumbs and canonical handling.
- Derive structured service offers and visible prices from the same data. FAQs answer actual preparation/booking questions; no search appearance or ranking guarantee.
- Use descriptive image text, responsive sizes, lazy loading below the fold and priority loading for the service hero. Replace the old gallery's extra RichSeo rendering with the standard layout metadata flow.

## Measurement after release

Compare `personal` lead events by page and source, package inquiries and gift inquiries. In Search Console, compare relevant query impressions, clicks and landing pages over a meaningful period. No ranking or conversion improvement has yet been measured. This change is local and does not deploy the site.

## Validation results

- Production build passed with a temporary local-only SESSION_SECRET; no production credential or configuration was changed.
- Generated-page SEO audit passed for all three URLs: canonical, indexing, one H1, JSON-LD, offer anchors, image dimensions/alt text and sitemap entries.
- Targeted ESLint, Prettier and `git diff --check` passed.
- Full Astro check reports 111 errors elsewhere in the project; none reference the changed personal files. This remains a repository-wide limitation.
- Browser review: desktop service hero, 390px mobile pricing comparison and gallery introduction. Gallery lightbox opens with all 37 images and closes successfully. Shared mobile comparison table scrolls horizontally as designed.
