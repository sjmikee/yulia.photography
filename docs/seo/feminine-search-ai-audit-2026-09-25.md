# Feminine pages: search and AI discovery audit

## Research scope

25 September 2026. Queries sampled separately: `צילומי נשיות מחיר`, `צילומי בודואר מחיר`, `צילומי נשיות חולון`. This search provider is not a controlled, location-specific Google rank tracker. No Search Console access, backlink dataset or verified ranking baseline was available.

| Intent                  | Evidence                                                                                                                                                                                                                   | Decision                                                                                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Price                   | [Yael Elad](https://newbornstudio.co.il/צילומי-נשיות-מחירון/) presents three packages, editing counts and different looks.                                                                                                 | Keep pricing as the primary commercial page; preserve comparison table, studio surcharge and central price data. Add actual portfolio examples to help assess value.                                                           |
| Feminine / boudoir      | [Reut Ashkenazi](https://reutashkenazi.co.il/צילומי-נשיות/) combines packages, relevant imagery, named testimonials and extensive experience content. Her page differentiates an intimate clothing option.                 | Strengthen context around our real images and explain the available styles. Approved boudoir images and verifiable feminine-session testimonials remain an evidence gap. No therapeutic claims or fabricated experience added. |
| Service differentiation | [Compositzia](https://www.compositzia.com/women) combines photography with an explicitly distinct portrait-art offering.                                                                                                   | Describe what Yulia actually delivers rather than imitating another business's specialties.                                                                                                                                    |
| Holon                   | Results included [Ilanit Kitzoni](https://www.ilanitkitzoni.com/), Yulia's homepage, and general photography directories. Ilanit result mentions Holon location and portrait services; direct extraction returned no text. | Keep verified Holon/central-Israel coverage visible. Do not invent a studio address or create repetitive city landing pages.                                                                                                   |

These observations expand the initial research; they do not prove which individual factor causes a competitor's ranking. Meital's direct page fetch remained unavailable, so her offer is documented only as a search extract in the earlier report.

## Changes implemented

- Reusable `SessionFacts` definition-list component, with session facts in `src/lib/feminine.ts`. Plain rendered HTML identifies photographer, service area, prices, deliverables and delivery time.
- Pricing page now shows three real portfolio examples with visible captions and links to the full gallery and photographer background.
- Gallery has image-specific commentary about black-and-white, natural light and studio color. No invented client stories.
- Dedicated feminine preview image on all three pages instead of the site-wide generic image.
- Contextual links from homepage, personal-photography service and existing personal-session article. Pricing and service directories now describe this service more precisely.
- Reusable build audit: `python3 scripts/audit-photoshoot-seo.py pricing/feminine services/feminine-photography gallery/feminine`.

## Crawler and AI findings

The live pricing URL returned HTTP 200 and already contained the first rewrite. Live robots.txt matches the repository: `User-agent: *` with empty `Disallow`. No robots change was necessary; no firewall or account settings were modified. A normal HTTP request does not verify access from a crawler's actual IP range.

- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots): OAI-SearchBot controls ChatGPT search discovery. Search access and GPTBot training controls are independent. Existing wildcard rules permit search crawling; hosting-level filtering still needs observation in server logs if access problems arise.
- [Google AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): crawlable, indexable, useful pages and normal search fundamentals remain relevant; no special AI file or schema guarantees inclusion. Review the Search Console generative-AI inclusion setting described in the current documentation when account access is available.
- [Google crawler documentation](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended): Google-Extended covers both future Gemini training and specified Gemini grounding uses. It is distinct from Google Search crawling. Existing rules do not block it; this audit does not change training preferences.

Do not equate inclusion in Google AI features with a guarantee of recommendation in the standalone Gemini app. AI citations depend on the question, retrieval and each provider's systems. We have not submitted prompts to external consumer AI accounts or claimed verified citations.

## Technical validation and limits

- Production build passed with temporary test-only session value; changed Astro/TypeScript files passed ESLint.
- Built pages passed canonical, indexability, single-H1, JSON-LD parsing, offer-anchor, image dimensions/alt, local social-image existence and sitemap checks.
- Main text, prices and links are prerendered HTML; no client JavaScript is needed to extract these facts. Hero has high fetch priority and responsive sources; below-fold portfolio images are lazy-loaded with dimensions.
- HTML sizes after this pass: pricing ~74 KB, service ~62 KB, gallery ~61 KB, before transfer compression. These are not performance scores.
- Google's public PageSpeed API returned HTTP 429 quota exhaustion. No Lighthouse or real-user Core Web Vitals result was obtained, and no performance improvement is claimed from this audit.
- The first rewrite was observed live; this second pass was built locally, not deployed by this task.

## Next inputs and release measurement

1. Deploy the reviewed second pass, then inspect the three URLs in Search Console, including canonical selection and indexing; verify sitemap discovery.
2. Export queries/pages for these URLs, with clicks, impressions, CTR and position over the last three months, split by Israel and device. Use this to detect query overlap and prioritize titles/content using evidence.
3. Supply approved feminine/boudoir photographs, accurate session-specific testimonials, and the actual publication/privacy policy. Add them with attribution/permission rather than repurposing pregnancy reviews.
4. Confirm business profile facts and relevant public profiles match actual services. Pursue genuine editorial mentions or partner links; no outreach or account changes were performed.
5. Compare matched 28-day periods after indexing, record release dates, and track inquiries alongside search traffic. If available, inspect AI-feature reporting and referrals, recognizing that they do not measure every AI mention.

## Subsequent editorial revision

At the owner's request, removed the extra gallery commentary and pricing-image captions. The homepage entry now uses the same ContentGrid/Content layout as other session types, with an optional reusable curated image array. Consolidated seven previously used assets into `src/assets/feminine_gallery`, added all nine owner-supplied Hela photographs (16 total), and updated references and featured selections. Descriptive alt text remains for accessibility. Build, targeted ESLint, generated SEO checks and desktop visual checks passed after this revision.
