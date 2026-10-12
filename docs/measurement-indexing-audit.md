# Measurement and indexing pass — October 11–12, 2026

## Verified in the signed-in accounts

- Search Console domain property: `yulia.photography`.
- Both submitted sitemaps show Success, last read October 10, with 60 discovered pages. Discovery is not the same as indexing.
- Search performance snapshot, September 12–October 9: 70 clicks, approximately 1,220 impressions, 5.7% CTR, average position 34.3.
- GA4 property `476984632`, Google tag `G-FEK1JX57FT`, GTM container `GTM-PNSPZVVG`.
- GA4 September 13–October 10: `whatsapp_chat_start` 11 events from 5 users; `click_to_call` 3 events from 1 user. These count contact-button interactions, not verified messages or bookings.
- GTM live version 4 contains a Google tag and the two contact event tags. Its WhatsApp link trigger matches Click URL containing `wa.me`; it also has older element triggers. No GTM changes were published.
- The site's old `generate_lead` push is not connected to a tag in this container. It also misleadingly represented a click as a lead.

## Indexing sample

| URL | Inspection result | Action |
| --- | --- | --- |
| `/pricing/pregnancy` | Indexed; Google's canonical matches the inspected URL; crawl successful September 26 | No indexing request necessary |
| `/services/pregnancy-photography` | Unknown to Google; live test passed | Indexing request accepted October 11 |
| `/ru/services/pregnancy-photography` | Unknown to Google; live test passed | Indexing request accepted October 11 |
| `/ru/pricing/pregnancy` | Unknown to Google | Google's request-time live validation completed; indexing request accepted October 12 |

The live homepages and these four service/pricing pages returned HTTP 200, permitted indexing, declared their own canonical, and supplied reciprocal Hebrew/Russian and x-default alternate links. All six URLs appear in the live 60-URL sitemap. No technical blocker was found in this sample. Indexing requests do not guarantee inclusion or ranking, and this was not an inspection of every site URL.

## Implemented locally

- One delegated `contact_click` handler covers public WhatsApp links, the floating WhatsApp button, phone links and email links in both languages, including after Astro navigation.
- Parameters: `service`, `page_language`, `page_type`, `page_path`, `contact_method`, and `button_location`. Existing package/button identifiers are retained where present; unlabelled controls fall back to header/footer/content placement.
- Commands route through the existing Google tag's data layer to `G-FEK1JX57FT`. No second Google tag or GA4 configuration is installed.
- Contact payloads omit contact addresses, telephone numbers, prefilled messages, query strings and fragments. The handler ignores client management, contract, thank-you and API routes, plus non-production hosts.
- The GTM loader now also ignores non-production hosts, to reduce development traffic in production analytics. This does not retroactively clean historical data.
- Removed the old component's misleading `generate_lead` click handler.
- Business overview now counts distinct sessions with an actual positive deposit recorded during the selected month. Signed contracts, balance payments and checklist overrides do not count. Later cancellations remain in this historical gross booking count, as explained in the UI.

## Saved in GA4

Four Event-scoped custom dimensions were created and verified October 12:

| Reporting name | Event parameter |
| --- | --- |
| Photography service | `service` |
| Page language | `page_language` |
| Contact method | `contact_method` |
| Button location | `button_location` |

`contact_click` is intentionally not marked as a key event or called a booking. Existing GTM contact events remain unchanged for historical continuity; do not add their counts to `contact_click`, since the same action can be represented in both event families. Use only `contact_click` for the new detailed contact report.

## Validation and remaining rollout

- Production build passed.
- Astro check: zero errors or warnings (existing hints remain).
- Lint passed for changed TypeScript, Astro and test files.
- 33 focused tests passed, including click context, Astro-style path changes, excluded/private routes, all service mappings, paid-deposit rules and PostgreSQL overview parity.
- Built-page SEO audit passed for all four sampled service/pricing pages.
- Live page metadata and sitemap verified separately from build output.

Website code is not deployed yet. After deployment, verify a controlled `contact_click` in GA4 Realtime/DebugView, with correct service, language and placement, then verify an internal page navigation and a floating button. Do not send a message, place a call, or record a fake deposit as part of testing. Normal processed custom-dimension reports may lag behind realtime collection.

Bookings remain measured in the client system. This pass does not link a visitor's GA identity to a customer/deposit, track an actual WhatsApp message, or import paid bookings into GA4. Therefore it cannot yet attribute individual paid bookings to search queries, campaigns or website visitors. That requires a separate inquiry/source capture and attribution workflow.
