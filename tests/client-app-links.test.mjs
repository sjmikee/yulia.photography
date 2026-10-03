import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../src/lib/client-app-links.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { clientAppDestination, calendarUtcDate, openClientApp } = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
);
const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)';
const desktop = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

test('iPhone WhatsApp handoff preserves number, Hebrew, punctuation and nested delivery links', () => {
  const message = 'היי ❤️\nhttps://example.test/file?a=1&b=2#photos';
  const web = `https://wa.me/972501234567?text=${encodeURIComponent(message)}`;
  const app = new URL(clientAppDestination(web, iphone));
  assert.equal(app.protocol, 'whatsapp:');
  assert.equal(app.hostname, 'send');
  assert.equal(app.searchParams.get('phone'), '972501234567');
  assert.equal(app.searchParams.get('text'), message);
  assert.equal(clientAppDestination(web, desktop), web);
  assert.equal(new URL(clientAppDestination(web, desktop, 5)).protocol, 'whatsapp:');
});

test('Google Calendar receives exact UTC dates and preserves title, guests, location and notes', () => {
  const web = new URL('https://calendar.google.com/calendar/render');
  web.search = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'צילומי משפחה',
    details: 'טלפון: 0501234567',
    location: 'חוף הים',
    add: 'a@example.test,b@example.test',
    ctz: 'Asia/Jerusalem',
    dates: '20261015T170000/20261015T180000',
  }).toString();
  const app = new URL(clientAppDestination(web.href, iphone));
  assert.equal(app.protocol, 'googlecalendar:');
  assert.equal(app.searchParams.get('action'), 'create');
  assert.equal(app.searchParams.get('dates'), '20261015T140000Z/20261015T150000Z');
  assert.equal(app.searchParams.get('title'), 'צילומי משפחה');
  assert.equal(app.searchParams.get('description'), 'טלפון: 0501234567');
  assert.equal(app.searchParams.get('location'), 'חוף הים');
  assert.equal(app.searchParams.get('add'), 'a@example.test,b@example.test');
  assert.equal(clientAppDestination(web.href, desktop), web.href);
});

test('calendar conversion handles Israel winter/summer time and rejects nonexistent DST times', () => {
  assert.equal(calendarUtcDate('20260115T170000', 'Asia/Jerusalem'), '20260115T150000Z');
  assert.equal(calendarUtcDate('20260715T170000', 'Asia/Jerusalem'), '20260715T140000Z');
  assert.equal(calendarUtcDate('20260715T140000Z', 'Asia/Jerusalem'), '20260715T140000Z');
  assert.throws(() => calendarUtcDate('20260327T023000', 'Asia/Jerusalem'));
  assert.throws(() => calendarUtcDate('not-a-date', 'Asia/Jerusalem'));
  assert.throws(() => calendarUtcDate('20260231T170000', 'Asia/Jerusalem'));
  assert.throws(() => calendarUtcDate('20261003T250000Z', 'Asia/Jerusalem'));
});

test('app handoff accepts only the intended HTTPS services and valid phone numbers', () => {
  for (const url of [
    'https://wa.me.evil.test/972501234567',
    'javascript:alert(1)',
    'https://user:pass@wa.me/972501234567',
    'https://wa.me/not-a-phone',
    'https://calendar.google.com/calendar/render',
  ]) {
    assert.throws(() => clientAppDestination(url, iphone));
  }
});

test('native launch never opens a tab or automatically falls back to a website', () => {
  const originals = Object.fromEntries(
    ['navigator', 'window', 'document'].map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)])
  );
  const nodes = [];
  const node = () => ({
    dataset: {},
    children: [],
    replaceChildren() {
      this.children = [];
    },
    append(...items) {
      this.children.push(...items);
    },
    contains() {
      return false;
    },
  });
  const container = node();
  const navigations = [];
  const activation = { isActive: true };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { userAgent: iphone, maxTouchPoints: 5, userActivation: activation },
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      location: {
        assign(url) {
          navigations.push(url);
        },
      },
      open() {
        assert.fail('Must not create a browser tab');
      },
    },
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      getElementById() {
        return null;
      },
      querySelector() {
        return container;
      },
      createElement() {
        const n = node();
        nodes.push(n);
        return n;
      },
    },
  });
  try {
    openClientApp('https://wa.me/972501234567?text=hello', container);
    assert.equal(navigations.length, 1);
    assert.ok(navigations[0].startsWith('whatsapp://send?'));
    activation.isActive = false;
    openClientApp('https://wa.me/972501234567?text=hello', container);
    assert.equal(navigations.length, 1, 'after gesture expires, wait for the visible app button');
    assert.ok(nodes.some((n) => n.href?.startsWith('whatsapp:')));
    assert.ok(nodes.some((n) => n.dataset.clientWebFallback === 'true'));
  } finally {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
