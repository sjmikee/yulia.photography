/** Preserve the client page when handing off to an installed iPhone app. */
export function calendarUtcDate(value: string, timeZone: string): string {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(value);
  if (!match) throw new Error('Invalid calendar date');
  const [, y, m, d, h, minute, second, utc] = match;
  const wall = Date.UTC(+y, +m - 1, +d, +h, +minute, +second);
  const normalized = new Date(wall).toISOString().replace(/[-:]/g, '').slice(0, 15);
  if (normalized !== value.replace(/Z$/, '')) throw new Error('Invalid calendar date');
  if (utc) return value;
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  let instant = wall;
  for (let attempt = 0; attempt < 4; attempt++) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map((p) => [p.type, p.value]));
    const rendered = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    if (rendered === wall)
      return new Date(instant)
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, 'Z');
    instant += wall - rendered;
  }
  throw new Error('This local time does not exist; choose another session time');
}

export function clientAppDestination(value: string, userAgent: string, maxTouchPoints = 0): string {
  const web = new URL(value);
  if (web.protocol !== 'https:' || web.username || web.password) throw new Error('Invalid app link');
  const appleMobile = /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
  if (web.hostname === 'wa.me') {
    const phone = web.pathname.replace(/^\//, '');
    if (!/^\d{8,15}$/.test(phone)) throw new Error('Invalid WhatsApp number');
    if (!appleMobile && !/Android/.test(userAgent)) return web.href;
    const params = new URLSearchParams({ phone });
    if (web.searchParams.has('text')) params.set('text', web.searchParams.get('text')!);
    return `whatsapp://send?${params}`;
  }
  if (web.hostname === 'calendar.google.com' && ['/calendar/render', '/calendar/r/eventedit'].includes(web.pathname)) {
    if (!appleMobile) return web.href;
    const dates = (web.searchParams.get('dates') || '').split('/');
    if (dates.length !== 2) throw new Error('Missing calendar dates');
    const zone = web.searchParams.get('ctz') || 'Asia/Jerusalem';
    const params = new URLSearchParams({
      action: 'create',
      title: web.searchParams.get('text') || '',
      description: web.searchParams.get('details') || '',
      location: web.searchParams.get('location') || '',
      add: web.searchParams.get('add') || '',
      isallday: '0',
      dates: dates.map((date) => calendarUtcDate(date, zone)).join('/'),
    });
    return `googlecalendar://?${params}`;
  }
  throw new Error('Unsupported client app');
}

export function openClientApp(webUrl: string, source?: HTMLElement | null) {
  const destination = clientAppDestination(webUrl, navigator.userAgent, navigator.maxTouchPoints);
  if (destination !== webUrl && !destination.startsWith('https:')) {
    // A fresh tap is available if Safari blocks a launch following a slow server request.
    // Never replace the page with a timed web fallback or open a blank browser tab.
    let retry = document.getElementById('client-app-retry');
    if (!retry) {
      retry = document.createElement('div');
      retry.id = 'client-app-retry';
      retry.className = 'my-4 space-y-3 text-center';
    }
    retry.replaceChildren();
    const nativeLink = document.createElement('a');
    nativeLink.href = destination;
    nativeLink.className = 'btn-secondary';
    nativeLink.textContent = destination.startsWith('whatsapp:') ? 'פתיחה ב־WhatsApp' : 'פתיחה ב־Google Calendar';
    retry.append(nativeLink);
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'האפליקציה לא נפתחת?';
    const webLink = document.createElement('a');
    webLink.href = webUrl;
    webLink.dataset.clientWebFallback = 'true';
    webLink.className = 'underline';
    webLink.textContent = 'פתיחת גרסת הדפדפן במקום האפליקציה';
    details.append(summary, webLink);
    retry.append(details);
    const anchor = source || document.querySelector<HTMLElement>('main');
    if (anchor && !retry.contains(anchor)) anchor.append(retry);
    if (navigator.userActivation && !navigator.userActivation.isActive) return;
  }
  window.location.assign(destination);
}
