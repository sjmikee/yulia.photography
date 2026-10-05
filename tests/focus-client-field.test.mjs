import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/focus-client-field.ts', import.meta.url), 'utf8');
const script = ts.transpileModule(source.replace('export function', 'function'), {}).outputText;

function setup({ position = 1000, height = 48, withViewport = true } = {}) {
  const viewport = Object.assign(new EventTarget(), { offsetTop: 0, height: 800 });
  const document = new EventTarget();
  const field = new EventTarget();
  let scroll = 0;
  let timer;
  Object.assign(field, {
    isConnected: true,
    focus(options) {
      assert.equal(options.preventScroll, true);
      document.activeElement = field;
    },
    getBoundingClientRect: () => ({ top: position - scroll, bottom: position - scroll + height, height }),
  });
  const window = Object.assign(new EventTarget(), {
    visualViewport: withViewport ? viewport : undefined,
    innerHeight: 800,
    scrollBy: ({ top }) => (scroll += top),
  });
  const context = {
    document,
    window,
    setTimeout: (callback) => (timer = callback),
    clearTimeout: () => (timer = undefined),
  };
  runInNewContext(script, context);
  context.focusClientField(field);
  return {
    viewport,
    document,
    field,
    window,
    scroll: () => scroll,
    settle: () => {
      const callback = timer;
      timer = undefined;
      callback?.();
    },
  };
}

test('waits for keyboard resize and subsequent viewport panning before revealing', () => {
  const s = setup();
  assert.equal(s.document.activeElement, s.field);
  assert.equal(s.scroll(), 0);
  s.viewport.height = 400;
  s.viewport.dispatchEvent(new Event('resize'));
  s.viewport.offsetTop = 50;
  s.viewport.dispatchEvent(new Event('scroll'));
  assert.equal(s.scroll(), 0);
  s.settle();
  assert.equal(s.scroll(), 622);
  s.viewport.dispatchEvent(new Event('scroll'));
  s.settle();
  assert.equal(s.scroll(), 622);
});

test('leaves an already visible field still', () => {
  const s = setup({ position: 120 });
  s.viewport.height = 400;
  s.viewport.dispatchEvent(new Event('resize'));
  s.settle();
  assert.equal(s.scroll(), 0);
});

test('reveals a field obscured above the panned viewport', () => {
  const s = setup({ position: 120 });
  s.viewport.offsetTop = 200;
  s.viewport.dispatchEvent(new Event('scroll'));
  s.settle();
  assert.equal(s.scroll(), -104);
});

for (const event of ['blur', 'pointerdown', 'wheel', 'astro:before-swap']) {
  test(`cancels pending work and listeners on ${event}`, () => {
    const s = setup();
    (event === 'blur' ? s.field : s.document).dispatchEvent(new Event(event));
    s.viewport.dispatchEvent(new Event('resize'));
    s.viewport.dispatchEvent(new Event('scroll'));
    s.window.dispatchEvent(new Event('resize'));
    s.settle();
    assert.equal(s.scroll(), 0);
  });
}

test('falls back to window height without the visual viewport API', () => {
  const s = setup({ withViewport: false });
  s.window.innerHeight = 400;
  s.window.dispatchEvent(new Event('resize'));
  s.settle();
  assert.equal(s.scroll(), 672);
});
