import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
const source = await readFile(new URL('../src/pages/clients/[id].astro', import.meta.url), 'utf8');
const start = source.indexOf('  function initSessionHistory()');
const end = source.indexOf('  initClientEditor();', start);
const script = ts.transpileModule(source.slice(start, end), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
function setup(hash = '') {
  const listeners = {};
  const linkListeners = {};
  const windowListeners = {};
  const documentListeners = {};
  const requests = [];
  const events = [];
  const location = { hash };
  let replacement;
  const status = { textContent: '' };
  const link = {
    href: '/clients/session-card?session_id=42',
    addEventListener: (event, fn) => {
      linkListeners[event] = fn;
    },
  };
  const content = {
    querySelector: (selector) => (selector === '[data-load-history]' ? link : status),
    replaceWith: (card) => {
      replacement = card;
    },
  };
  const details = {
    dataset: { sessionId: '42' },
    open: false,
    isConnected: true,
    querySelector: () => content,
    addEventListener: (event, fn) => {
      listeners[event] = fn;
    },
  };
  vm.runInNewContext(script, {
    location,
    Event,
    document: {
      querySelectorAll: () => [details],
      dispatchEvent: (event) => events.push(event.type),
      addEventListener: (event, fn) => {
        documentListeners[event] = fn;
      },
    },
    window: {
      addEventListener: (event, fn) => {
        windowListeners[event] = fn;
      },
      removeEventListener: (event) => {
        delete windowListeners[event];
      },
    },
    fetch: (url, options) =>
      new Promise((resolve) => {
        requests.push({ url, options, resolve });
      }),
    DOMParser: class {
      parseFromString(text) {
        return { getElementById: (id) => (text === 'valid' ? { id } : null) };
      }
    },
  });
  const settle = async (ok = true, html = 'valid') => {
    requests.at(-1).resolve({ ok, text: async () => html });
    await new Promise((resolve) => setImmediate(resolve));
  };
  return {
    details,
    listeners,
    linkListeners,
    windowListeners,
    documentListeners,
    requests,
    events,
    status,
    location,
    settle,
    replacement: () => replacement,
  };
}
test('history loads only on expansion, deduplicates requests, and initializes the loaded card once', async () => {
  const app = setup();
  assert.equal(app.requests.length, 0);
  app.details.open = true;
  app.listeners.toggle();
  app.listeners.toggle();
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].url, '/clients/session-card?session_id=42');
  assert.equal(app.requests[0].options.cache, 'no-store');
  await app.settle();
  assert.equal(app.replacement().id, 'session-42');
  assert.deepEqual(app.events, ['clients:session-loaded']);
  app.details.open = false;
  app.listeners.toggle();
  app.details.open = true;
  app.listeners.toggle();
  assert.equal(app.requests.length, 1);
});
test('a direct session link opens history and a failed load can be retried', async () => {
  const app = setup('#session-42');
  assert.equal(app.details.open, true);
  assert.equal(app.requests.length, 1);
  await app.settle(false);
  assert.equal(app.replacement(), undefined);
  assert.ok(app.status.textContent.includes('לנסות שוב'));
  app.linkListeners.click({ preventDefault() {} });
  assert.equal(app.requests.length, 2);
  await app.settle();
  assert.equal(app.replacement().id, 'session-42');
  app.documentListeners['astro:before-swap']();
  assert.equal(app.windowListeners.hashchange, undefined);
});
test('changing the hash opens the selected history and invalid HTML leaves a retry available', async () => {
  const app = setup();
  app.location.hash = '#session-42';
  app.windowListeners.hashchange();
  assert.equal(app.details.open, true);
  await app.settle(true, 'invalid');
  assert.equal(app.replacement(), undefined);
  assert.deepEqual(app.events, []);
  app.linkListeners.click({ preventDefault() {} });
  await app.settle();
  assert.equal(app.replacement().id, 'session-42');
});
