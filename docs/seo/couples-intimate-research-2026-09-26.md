> Update — 27 September 2026: The owner clarified that intimate photographs may be published when available, without faces or with client permission when faces are visible. This supersedes the initial no-publication policy described in the historical research below. Public copy now avoids a blanket non-publication promise and does not spell out those publication conditions. The gallery introduction focuses on the shared experience rather than describing photographs. No images were added or removed in this copy revision.

# Intimate couples: research and implementation — 26 September 2026

## Scope and ranking protection

Rebuild `/services/intimate-couples-photography`, `/pricing/couples-intimate` and the existing shared `/gallery/couples`. The owner reports a top-three pricing ranking; no Search Console export was available, so that position, queries and conversion baseline are not independently verified. Search results here are qualitative discovery, not an Israeli rank tracker.

Keep the established pricing URL, title (`מחירון צילומי זוגיות אינטימיים ולייף סטייל - יוליה קורנסקי`), H1, price intent, published packages and terms. Keep the service and gallery URLs and titles. No redirect, duplicate intimate gallery, or canonical consolidation. Service explains experience; pricing answers cost and booking; gallery demonstrates the ordinary couples style and routes to BOTH services. Existing header/footer links already expose these routes.

## Competitor review

Primary business pages read on the date above; prices are observations, not an equivalent-package market average.

| Source                                                               | Observed approach                                                                                                                                                                                                              | Decision for this site                                                                                                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ofir Avrahamov — intimate couples](https://ofirav.co.il/sensual/)   | Explicit boundaries and discretion, home/rented-space options, direct answers to camera anxiety. Advertises ₪1,200 without editing at a client location through ₪2,500 with rental and editing. Includes file-deletion claims. | Address boundaries and location early. Explain our own deliverables. Do not borrow deletion, security, therapy or outcome claims.                                   |
| [Sharon Yanai — pricing](https://www.sharonphoto.com/מחירון-צילומים) | Lists ₪2,700 + VAT, editing, deposit/cancellation details and travel supplement. Gives substantial room to preparation and an unpressured conversation.                                                                        | Preserve our existing booking terms and put them alongside the buying decision. Invite a question before committing. His package is materially different from ours. |
| [Valeria Osik](https://www.valeriaosik.com/)                         | Adjacent couples/family competitor emphasizes natural images, guidance and suitability for camera-shy people.                                                                                                                  | Explain what guidance actually looks like rather than claiming everyone will instantly relax.                                                                       |

Searches: `צילומי זוגיות אינטימיים מחיר`, `צילומי זוגיות אינטימיים מחיר צלמת`, `בודואר זוגי צילום`, `צילומי זוגיות בודואר זוגי פרטיות`. Relevant intent terms include intimate/sensual couples, pricing, privacy, clothing, home/studio and posing anxiety. No keyword-volume estimates or competitor conversion claims are inferred from search results.

## Customer psychology: evidence and hypotheses

[NN/g's usability research on trust](https://www.nngroup.com/articles/trustworthy-design/) supports clear organization, upfront cost and service disclosure, complete information and identifiable businesses. This is general usability evidence, not a controlled study of Israeli intimate photography customers.

The following are design hypotheses from that evidence and competitor messaging, not findings from interviews with Yulia's customers:

- Privacy uncertainty can prevent enquiry. State the owner's actual policy: intimate client photographs are not published. Label ordinary examples honestly. Do not suggest unpublished intimate work can be requested privately.
- Partners can have different comfort levels. Explain that both choose the boundaries; discourage surprising someone with an intimate appointment.
- Fear of performing can make beautiful photographs feel unattainable. Describe starting with simple movement and receiving guidance; avoid guaranteeing confidence or relationship improvement.
- Uncertainty about cost and output increases decision effort. Reuse the comparison table and cards, with price, edited-image quantity and approximate duration from one data source.
- Contact can feel like a commitment. Offer questions without a booking requirement, with an optional phone call. No artificial scarcity or unsupported popularity claims.
- A shared gallery can confuse intent. Clearly state why it contains ordinary couples photos and provide equal routes to regular and intimate services/pricing.

## Preserved business facts

Central `PRICES`: ₪700 / ₪900 / ₪1,200. Published quantities: at least 15–20 / 20–35 / 35–50 fully edited images. Durations: 45 minutes / 90 minutes / approximately two hours. Premium includes up to two outfits and breaks. Delivery within 14 business days. Deposit ₪100, refundable for cancellation up to three days before; rescheduling with notice up to 24 hours before by agreement.

The existing intimate pages did not specify a studio rental fee. New copy asks clients to clarify required location rental before booking; it does not invent a surcharge or import another session's studio policy. No new promises about storage, encryption, retention, taxes or refunds.

One existing client quote remains as general photography feedback, explicitly not identified as an intimate-session testimonial. The old pricing page inconsistently attributed the second review's image/name, so it is not reused.

## Implementation

- Reuse Journey, SessionFacts, ImageSection, Gallery, PackageComparison, PricingCards, ServiceSchema, HeroText, FAQs and Breadcrumbs.
- `src/lib/couples-intimate.ts`: package facts, cards, journeys and structured offers derive from one source.
- `src/lib/couples-gallery.ts`: explicit manifest of the 25 previously public photographs, all visually inspected, with descriptive Hebrew alt text. New files are not automatically published.
- Generic LeadTracking component preserves `generate_lead`, service `couples_intimate` and existing hero/package/bottom source identifiers, with lifecycle cleanup. It measures enquiry-link clicks, not completed conversations or bookings, and sends no message contents.
- No new binary assets, packages or public intimate gallery.

## Measurement after publishing

Record Search Console's preceding 28-day query/page baseline before release, segmented by device and Israel where possible. Monitor pricing/service/gallery impressions, clicks, CTR and average position weekly for four weeks; compare periods while considering seasonality. Review queries moving between service and pricing before calling that cannibalization. Track enquiry clicks per landing-page session and package source; count qualified enquiries/bookings separately. Do not interpret the generic lead click as a booked session.

A ranking improvement cannot be promised. Keeping URLs and established pricing signals reduces unnecessary disruption but substantive content changes can still change rankings.

## Validation completed

- Production build passed with an ephemeral test-only `SESSION_SECRET`; no production credentials changed. Initial sandbox listener restriction required an approved build outside the sandbox.
- Existing generated-page audit passed on all three routes: canonical, indexability, one H1, valid JSON-LD, offer anchors, social images, image dimensions/alt and sitemap inclusion.
- Changed Astro/TypeScript files passed ESLint and Prettier; `git diff --check` passed.
- Repository-wide Astro check reported 111 errors in unrelated files, including client pages and existing missing type dependencies. None were reported in the six changed/new implementation files. This does not constitute a clean repository-wide type check.
- Browser review covered desktop pricing/service and 390px mobile service/pricing/gallery. All three mobile documents measured 390px scroll width at a 390px viewport. The comparison table intentionally scrolls within its own region.
- Shared gallery viewer opened, advanced from image 1 to 2 of 25, and closed. A stale development dependency cache after concurrent build/preview initially prevented the viewer from loading; restarting the preview resolved it.
- Enquiry tracking was checked using an isolated event/lifecycle harness: nested click targets, event/service/source fields, ignored untracked/outside links and listener cleanup/reconnection. All five existing pricing source identifiers are rendered with the correct WhatsApp destination. No enquiry was sent.
- Changes are local and have not been deployed. Live rankings and booking conversion require post-release observation.
