# Reusing photoshoot sections

Keep photoshoot-specific wording, links, package data and schema offers in `src/lib/<photoshoot>.ts`. Shared input types live in `src/lib/photoshoots.ts`; pregnancy is the working example.

- `Journey`: takes a `journey` configuration, the current link ID and optional `cta`. Supplies cross-page navigation and the contact section.
- `PackageComparison`: takes packages in display order, an accessible label and caption. Row links target package IDs.
- `ServiceSchema`: takes service details and offers; resolves URLs against the configured site.
- `Gallery`: takes an ordered array of `{ image: ImageMetadata, alt: string }`. Load and validate the image manifest in the photoshoot data module. Each instance manages its own lightbox and cleanup.
- `ImageSection`: takes an image, alt text and `imageFirst`; write rich page-specific content in its default slot.

Use `ui/PricingCards.astro` for cards inside an existing section, or the existing `widgets/Pricing.astro` when a heading and section wrapper are also needed. Both use the same renderer and `Price` type. Optional `id` supports comparison links; `highlight` emphasizes photo quantities; `hasRibbon` and `ribbonTitle` identify the featured package. A period is optional. Supply cards in the desired display order without reordering the underlying package data.

The existing HeroText, FAQs, Steps and Breadcrumbs components remain available for page composition. Keep editorial prose in pages; do not duplicate layout, lightbox or schema logic for each photoshoot.

Feminine is a second working example: `src/lib/feminine.ts` supplies the same shared components, and `src/lib/feminine-gallery.ts` explicitly selects assets from `src/assets/feminine_gallery` with visually checked descriptions. Reuse these source images across pages rather than copying binaries. Keep gallery wording accurate to the images available, and add new gallery routes to both header and footer navigation. Preserve published prices and booking terms when adapting a session type.

- `SessionFacts`: accepts a title and `{ label, value }[]` for a visible, semantic summary of verified service facts. Keep the values in the session data module and derive prices from package data.
- After a production build, run `python3 scripts/audit-photoshoot-seo.py pricing/<type> services/<service-slug> gallery/<type>` to check generated canonical URLs, indexing, headings, schemas, offer anchors, images and sitemap entries.

Homepage `ContentGrid` entries can pass `galleryImages` (an ordered `{ image, alt }[]`) to reuse a curated selection in the existing section style. Existing `imagesFolder` entries remain supported.

Homepage `ContentGrid` entries accept `actions: CallToAction[]` for multiple destination-specific buttons. Buttons stack on small screens and wrap in a centered row on larger screens. `actions` takes precedence over the legacy single `callToAction`, which remains supported.

For balanced homepage previews, pass `galleryLayout: 'grid'` with four `galleryImages`. The shared Gallery uses equal-height tiles in two columns on mobile and four on desktop; its default masonry layout remains available for full galleries. Keep homepage selections separate from pricing selections when their image counts differ.
