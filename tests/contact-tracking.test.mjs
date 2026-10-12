import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const lib = await readFile(new URL('../src/lib/contact-tracking.ts', import.meta.url), 'utf8');
const component = await readFile(new URL('../src/components/common/ContactTracking.astro', import.meta.url), 'utf8');
const script = component.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/import .*?;/, '');
const js = ts.transpileModule(lib.replaceAll('export ', '') + script, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;

function fixture(pathname = '/ru/services/pregnancy-photography', hostname = 'yulia.photography') {
  const listeners = [];
  class Element {
    constructor(href, dataset = {}, id = '') {
      this.href = href;
      this.dataset = dataset;
      this.id = id;
    }
    closest(selector) {
      return selector.startsWith('a[') ? this : null;
    }
    getAttribute() {
      return this.href;
    }
  }
  const window = { location: { pathname, hostname, origin: 'https://' + hostname } };
  const document = {
    referrer: 'https://example.test/?private=secret',
    addEventListener: (_name, handler) => listeners.push(handler),
  };
  const context = vm.createContext({ window, document, Element, URL });
  vm.runInContext(js, context);
  return { window, context, click: (href, dataset, id) => listeners[0]({ target: new Element(href, dataset, id) }) };
}

test('all contact methods get one explicit click event with context, never a lead or booking', () => {
  const f = fixture();
  for (const href of ['https://wa.me/972525836940?text=private', 'tel:0525836940', 'mailto:contact@yulia.photography'])
    f.click(href);
  const commands = Array.from(f.window.dataLayer, (args) => [...args]);
  assert.deepEqual(
    commands.map((c) => c[1]),
    ['contact_click', 'contact_click', 'contact_click']
  );
  assert.deepEqual(
    commands.map((c) => c[2].contact_method),
    ['whatsapp', 'phone', 'email']
  );
  assert.equal(commands[0][2].service, 'pregnancy');
  assert.equal(commands[0][2].page_language, 'ru');
  assert.equal(commands[0][2].send_to, 'G-FEK1JX57FT');
  assert.ok(!JSON.stringify(commands).includes('private'));
  assert.ok(!JSON.stringify(commands).includes('0525836940'));
});

test('floating buttons, package controls and subsequent Astro navigation retain correct context', () => {
  const f = fixture();
  f.click(null, { whatsappUrl: 'https://wa.me/972525836940' }, 'whatsapp');
  assert.equal(f.window.dataLayer[0][2].button_location, 'floating');
  f.window.location.pathname = '/pricing/couples-intimate';
  f.click('https://wa.me/972525836940', { leadSource: 'intimate-package-1' });
  assert.equal(f.window.dataLayer[1][2].service, 'couples_intimate');
  assert.equal(f.window.dataLayer[1][2].page_language, 'he');
  assert.equal(f.window.dataLayer[1][2].button_location, 'intimate-package-1');
  f.window.location.pathname = '/clients/123';
  f.click('tel:123');
  assert.equal(f.window.dataLayer.length, 2);
});

test('private routes, local development and ordinary links never emit contact events', () => {
  for (const path of [
    '/clients',
    '/clients/123',
    '/contract',
    '/ru/contract',
    '/thank_you',
    '/ru/thank_you',
    '/api/test',
  ]) {
    const f = fixture(path);
    f.click('tel:123');
    assert.equal(f.window.dataLayer, undefined, path);
  }
  const local = fixture('/', 'localhost');
  local.click('tel:123');
  assert.equal(local.window.dataLayer, undefined);
  const f = fixture();
  for (const href of ['/pricing/pregnancy', 'https://wa.me.evil.test', 'javascript:alert(1)', '#top']) f.click(href);
  assert.equal(f.window.dataLayer, undefined);
});

test('every service route and locale maps to the same service identifier', () => {
  const f = fixture();
  for (const [slug, expected] of [
    ['family', 'family'],
    ['first-year', 'first_year'],
    ['feminine', 'feminine'],
    ['personal', 'personal'],
    ['couples', 'couples'],
  ]) {
    for (const prefix of ['', '/ru']) {
      assert.equal(
        vm.runInContext(`contactContext('${prefix}/services/${slug}-photography').service`, f.context),
        expected
      );
      assert.equal(vm.runInContext(`contactContext('${prefix}/pricing/${slug}').service`, f.context), expected);
    }
  }
});
