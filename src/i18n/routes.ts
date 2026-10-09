export type Locale = 'he' | 'ru';

// Turn on only when the complete Russian site has passed its release review.
export const russianIndexingEnabled = false;
export const translatedRoutes = {
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
  return `${locale === 'ru' ? '/ru' : ''}${base}${hash ? `#${hash}` : ''}`;
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
