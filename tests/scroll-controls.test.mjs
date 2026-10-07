import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
const source = await readFile(new URL('../src/components/common/BasicScripts.astro', import.meta.url), 'utf8');
const script = source.slice(
  source.indexOf('  window.clientButtonsObserver?.cleanup?.();'),
  source.lastIndexOf('</script>')
);
function setup({ top = true, whatsapp = false, reduced = false } = {}) {
  const events = {};
  const observers = [];
  const elements = {};
  const make = () => ({
    dataset: {},
    tabIndex: 0,
    attributes: {},
    events: {},
    classList: { toggle() {} },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    addEventListener(name, fn, options) {
      this.events[name] = { fn, signal: options.signal };
    },
  });
  if (top) elements.scrollToTop = make();
  if (whatsapp) elements.whatsapp = make();
  const window = {
    scrollY: 0,
    addEventListener(name, fn, options) {
      events[name] = { fn, signal: options.signal };
    },
    matchMedia() {
      return { matches: reduced };
    },
    scrollTo(options) {
      this.lastScroll = options;
    },
  };
  const context = {
    window,
    AbortController,
    document: { getElementById: (id) => elements[id], querySelector: () => ({}), addEventListener() {} },
    IntersectionObserver: class {
      constructor(fn) {
        this.fn = fn;
        observers.push(this);
      }
      observe() {}
      disconnect() {
        this.disconnected = true;
      }
    },
  };
  vm.runInNewContext(script, context);
  return { context, window, elements, events, observers };
}
test('pages without shared controls safely initialize', () => {
  setup({ top: false });
});
test('hidden scroll control leaves keyboard navigation and returns after scrolling', () => {
  const app = setup();
  const button = app.elements.scrollToTop;
  assert.equal(button.tabIndex, -1);
  assert.equal(button.attributes['aria-hidden'], 'true');
  app.window.scrollY = 500;
  app.events.scroll.fn();
  assert.equal(button.tabIndex, 0);
  assert.equal(button.attributes['aria-hidden'], 'false');
  app.observers[0].fn([{ isIntersecting: true }]);
  assert.equal(button.tabIndex, -1);
});
test('scroll respects reduced motion and navigation cleans up old handlers', () => {
  const app = setup({ reduced: true, whatsapp: true });
  app.elements.scrollToTop.events.click.fn();
  assert.equal(app.window.lastScroll.behavior, 'instant');
  const previous = app.events.scroll.signal;
  const previousObservers = [...app.observers];
  app.window.clientButtonsObserver.start();
  assert.equal(previous.aborted, true);
  assert.ok(previousObservers.every((observer) => observer.disconnected));
  const normal = setup();
  normal.elements.scrollToTop.events.click.fn();
  assert.equal(normal.window.lastScroll.behavior, 'smooth');
});
