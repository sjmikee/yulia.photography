export type Locale = 'he' | 'ru';

// Russian public pages passed parity review; indexing approved for release.
export const russianIndexingEnabled = true;
export const translatedRoutes = {
  home: '/',
  articles: '/articles',
  articleCategoryTips: '/category/tips',
  articleTagPhoto: '/tag/photo',
  articleTagTips: '/tag/tips',
  articleTagFamily: '/tag/family',
  articleTagCouples: '/tag/couples',
  articleTagSingle: '/tag/single',
  articleTagPortrait: '/tag/portrait',
  article0: '/how-to-choose-family-photographer',
  article1: '/how-to-prepare-kids-to-family-photoshot',
  article2: '/natural-couple-photos',
  article3: '/prepare-to-family-photoshot',
  article4: '/why-everbody-needs-a-personal-photoshot',

  privacy: '/privacy',
  accessibility: '/terms',
  services: '/services',
  pricing: '/pricing',
  about: '/about',
  contact: '/contact',
  pregnancyService: '/services/pregnancy-photography',
  pregnancyPricing: '/pricing/pregnancy',
  pregnancyGallery: '/gallery/pregnancy',
  couplesService: '/services/couples-photography',
  couplesPricing: '/pricing/couples',
  couplesGallery: '/gallery/couples',
  intimateService: '/services/intimate-couples-photography',
  intimatePricing: '/pricing/couples-intimate',
  personalService: '/services/personal-photography',
  personalPricing: '/pricing/personal',
  personalGallery: '/gallery/solo',
  feminineService: '/services/feminine-photography',
  femininePricing: '/pricing/feminine',
  feminineGallery: '/gallery/feminine',
  familyService: '/services/family-photography',
  familyPricing: '/pricing/family',
  firstYearService: '/services/first-year-photography',
  firstYearPricing: '/pricing/first-year',
} as const;

export function localeFromPath(path: string): Locale {
  return /^\/ru(?:\/|$)/.test(path) ? 'ru' : 'he';
}

export function basePath(path: string): string {
  return path.replace(/^\/ru(?=\/|$)/, '').replace(/\/+$/, '') || '/';
}

export function translatedPath(path: string, locale: Locale): string | undefined {
  // Only registered page routes can be translated. Never prefix APIs or asset URLs.
  const [pathname, hash] = path.split('#');
  if (pathname.includes('?')) return undefined;
  const base = basePath(pathname);
  if (!(Object.values(translatedRoutes) as string[]).includes(base)) return undefined;
  return `${locale === 'ru' ? '/ru' : ''}${locale === 'ru' && base === '/' ? '' : base}${hash ? `#${hash}` : ''}`;
}

export function isIndexablePage(path: string): boolean {
  if (localeFromPath(path) === 'ru' && !russianIndexingEnabled) return false;
  const base = basePath(path);
  return !(
    ['/contract', '/thank_you', '/landing/couples', '/404'].includes(base) ||
    /^\/(clients|api|articles|category|tag)(\/|$)/.test(base)
  );
}

export function languageAlternates(path: string) {
  if (!russianIndexingEnabled || !isIndexablePage(path)) return [];
  const he = translatedPath(path, 'he');
  const ru = translatedPath(path, 'ru');
  return he && ru
    ? [
        { language: 'he', path: he },
        { language: 'ru', path: ru },
        { language: 'x-default', path: he },
      ]
    : [];
}
