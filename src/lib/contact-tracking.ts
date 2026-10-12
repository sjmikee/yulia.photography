export const measurementId = 'G-FEK1JX57FT';

export function isPublicPage(path: string): boolean {
  return !/^\/(?:ru\/)?(?:clients(?:\/|$)|api(?:\/|$)|(?:contract|thank_you)\/?$)/.test(path);
}

export function contactContext(path: string) {
  const page = path.replace(/^\/ru(?=\/|$)/, '').replace(/\/+$/, '') || '/';
  const service = /intimate/.test(page)
    ? 'couples_intimate'
    : /(?:^|\/)(personal(?:-photography)?|solo)$/.test(page)
      ? 'personal'
      : ['couples', 'pregnancy', 'feminine', 'family', 'first-year']
          .find((name) => new RegExp(`/(?:${name})(?:-photography)?$`).test(page))
          ?.replace('-', '_') || 'general';
  return {
    service,
    page_language: /^\/ru(?:\/|$)/.test(path) ? 'ru' : 'he',
    page_type: page === '/' ? 'home' : page.split('/')[1],
    page_path: path,
  };
}

export function contactMethod(href: string): 'whatsapp' | 'phone' | 'email' | undefined {
  if (/^tel:/i.test(href)) return 'phone';
  if (/^mailto:/i.test(href)) return 'email';
  try {
    const url = new URL(href);
    if (url.protocol === 'https:' && ['wa.me', 'api.whatsapp.com'].includes(url.hostname)) return 'whatsapp';
  } catch {
    // Relative links and non-contact controls are not contact attempts.
  }
}
