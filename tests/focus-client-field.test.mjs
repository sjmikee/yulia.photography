import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/focus-client-field.ts', import.meta.url), 'utf8');
const script = ts.transpileModule(source.replace('export function', 'function'), {}).outputText;

test('centers the focused field again when the keyboard shrinks the viewport and cleans up on blur', () => {
  const viewport = new EventTarget();
  Object.assign(viewport, { offsetTop: 0, height: 800 });
  const document = new EventTarget();
  const field = new EventTarget();
  let scroll = 0;
  let frame;
  Object.assign(field, {
    isConnected: true,
    focus(options) {
      assert.equal(options.preventScroll, true);
      document.activeElement = field;
    },
    getBoundingClientRect: () => ({ top: 1000 - scroll, height: 48 }),
  });
  const context = {
    document,
    window: { visualViewport: viewport, scrollBy: ({ top }) => (scroll += top) },
    requestAnimationFrame: (callback) => (frame = callback),
  };
  runInNewContext(script, context);
  context.focusClientField(field);
  assert.equal(document.activeElement, field);
  assert.equal(scroll, 624);
  frame();
  assert.equal(scroll, 624);
  viewport.height = 400;
  viewport.offsetTop = 50;
  viewport.dispatchEvent(new Event('resize'));
  assert.equal(scroll, 774);
  field.dispatchEvent(new Event('blur'));
  viewport.height = 800;
  viewport.dispatchEvent(new Event('resize'));
  assert.equal(scroll, 774);
});
