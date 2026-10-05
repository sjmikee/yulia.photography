import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/components/common/BasicScripts.astro', import.meta.url), 'utf8');
const scripts = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]);

function browser() {
  let activeObservers = 0;
  let scrolls = 0;
  const buttons = new Map(
    ['scrollToTop', 'scrollToTopFooter', 'whatsapp'].map((id) => {
      const node = new EventTarget();
      node.dataset = {};
      node.classList = { toggle() {}, add() {}, remove() {} };
      return [id, node];
    })
  );
  const document = new EventTarget();
  Object.assign(document, {
    getElementById: (id) => buttons.get(id) || null,
    querySelector: (selector) =>
      selector === '#header[data-aw-sticky-header]'
        ? { classList: { contains: () => false, add() {}, remove() {} } }
        : null,
    querySelectorAll: () => [],
    documentElement: { classList: { add() {}, remove() {} } },
    body: { classList: { remove() {} } },
  });
  const window = new EventTarget();
  Object.assign(window, {
    scrollY: 400,
    matchMedia: () => new EventTarget(),
    scrollTo: () => scrolls++,
    open() {},
  });
  let pending = new Map();
  let frame = 0;
  const requestAnimationFrame = (callback) => {
    pending.set(++frame, callback);
    return frame;
  };
  const context = {
    window,
    document,
    AbortController,
    defaultTheme: 'light',
    localStorage: {},
    requestAnimationFrame,
    cancelAnimationFrame: (id) => pending.delete(id),
    IntersectionObserver: class {
      constructor() {
        activeObservers++;
        this.active = true;
      }
      observe() {}
      disconnect() {
        if (this.active) activeObservers--;
        this.active = false;
      }
    },
  };
  window.requestAnimationFrame = requestAnimationFrame;
  return { context, buttons, scrolls: () => scrolls, observers: () => activeObservers, frames: () => pending.size };
}

test('repeated navigation keeps one animation observer and one set of button handlers', () => {
  const state = browser();
  const context = vm.createContext(state.context);
  for (const script of scripts) vm.runInContext(script, context);
  context.window.onload();
  for (let index = 0; index < 8; index++) context.document.dispatchEvent(new Event('astro:after-swap'));
  assert.equal(state.observers(), 1);
  state.buttons.get('scrollToTop').dispatchEvent(new Event('click'));
  assert.equal(state.scrolls(), 1);
  for (let index = 0; index < 20; index++) {
    context.window.dispatchEvent(new Event('scroll'));
    context.document.dispatchEvent(new Event('scroll'));
  }
  assert.equal(state.frames(), 2, 'one header frame and one floating-button frame despite repeated scroll events');
});

test('shared controls initialize on pages without floating buttons', () => {
  const state = browser();
  state.buttons.clear();
  const context = vm.createContext(state.context);
  for (const script of scripts) vm.runInContext(script, context);
  context.window.onload();
  context.document.dispatchEvent(new Event('astro:after-swap'));
  assert.equal(state.observers(), 1);
});

async function endpoint(path, dependencies) {
  const text = await readFile(new URL(`../src/pages/api/${path}.ts`, import.meta.url), 'utf8');
  const output = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = { exports: {}, require: (id) => dependencies[id], Response, console };
  vm.runInNewContext(output, context);
  return context.exports.POST;
}

test('phone lookup returns optional bookings with one database round trip', async () => {
  let calls = 0;
  let result = [];
  const POST = await endpoint('get_client_by_phone', {
    '../../lib/db.ts': {
      sql: async () => {
        calls++;
        return result;
      },
    },
  });
  const invoke = (include_sessions) =>
    POST({
      request: new Request('https://example.test/api/get_client_by_phone', {
        method: 'POST',
        body: JSON.stringify({ phone: '0501234567', include_sessions }),
      }),
    });
  result = [{ id: 7, name: 'Client', email: '', sessions: [{ id: 42 }] }];
  assert.deepEqual(await (await invoke(true)).json(), result[0]);
  assert.equal(calls, 1);
  result = [{ id: 7, name: 'Client', email: '' }];
  assert.deepEqual(await (await invoke(false)).json(), result[0]);
  assert.equal(calls, 2);
  result = [];
  assert.equal((await invoke(true)).status, 404);
  assert.equal(calls, 3);
});

test('booking insertion returns 404 for absent clients and uses authoritative pricing in one query', async () => {
  let result = [];
  const queries = [];
  const POST = await endpoint('add_session', {
    '../../lib/db.ts': {
      sql: async (parts, ...values) => {
        queries.push({ text: parts.join('?'), values });
        return result;
      },
    },
    '../../lib/pricing': { PRICES: { family: { 1: 900 } } },
    '../../lib/session-duration': { packageDurationHours: () => 2 },
  });
  const invoke = () => {
    const body = new FormData();
    for (const [key, value] of Object.entries({
      client_id: '7',
      session_type: 'family',
      package_type: '1',
      additional_price: '50',
      price: '1',
    }))
      body.set(key, value);
    return POST({ request: new Request('https://example.test/api/add_session', { method: 'POST', body }) });
  };
  assert.equal((await invoke()).status, 404);
  assert.equal(queries.length, 1);
  result = [{ id: 42 }];
  const response = await invoke();
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/clients/7#session-42');
  assert.equal(queries.length, 2);
  assert.ok(queries[1].text.includes('FROM clients WHERE id ='));
  assert.deepEqual(queries[1].values, ['family', 1, 950, 950, '{"duration":"2"}', 7]);
});

test('gallery sliders initialize once and release timers when leaving the page', async () => {
  const source = await readFile(new URL('../src/components/widgets/SwiperSlider.astro', import.meta.url), 'utf8');
  const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
  const window = new EventTarget();
  const document = new EventTarget();
  const slider = {};
  document.readyState = 'complete';
  document.querySelectorAll = () => [slider];
  let created = 0;
  let destroyed = 0;
  vm.runInNewContext(script, {
    window,
    document,
    Swiper: class {
      constructor(element) {
        created++;
        element.swiper = {
          destroy() {
            destroyed++;
            delete element.swiper;
          },
        };
      }
    },
  });
  window.dispatchEvent(new Event('load'));
  window.dispatchEvent(new Event('pageshow'));
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(created, 1);
  document.dispatchEvent(new Event('astro:before-swap'));
  assert.equal(destroyed, 1);
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(created, 2);
});
