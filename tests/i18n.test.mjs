import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../src/i18n/routes.ts', import.meta.url), 'utf8');
async function loadRoutes(source) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const routes = await loadRoutes(source);

test('only complete registered page pairs receive Russian URLs; private paths and assets never do', () => {
  for (const path of Object.values(routes.translatedRoutes)) {
    assert.equal(routes.translatedPath(path, 'ru'), '/ru' + path);
    assert.equal(routes.translatedPath('/ru' + path + '/', 'he'), path);
    assert.equal(routes.translatedPath(path + '#classic', 'ru'), '/ru' + path + '#classic');
  }
  for (const path of [
    '/about',
    '/clients/login',
    '/api/get_price',
    '/contract?token=secret',
    '/fonts/font.woff2',
    '//example.com',
    'https://example.com',
    '/services/pregnancy-photography?token=secret',
  ]) {
    assert.equal(routes.translatedPath(path, 'ru'), undefined);
  }
  assert.equal(routes.localeFromPath('/russian'), 'he');
  assert.equal(routes.localeFromPath('/ru/services/pregnancy-photography'), 'ru');
});

test('preview translations stay out of search and do not generate alternates to noindex pages', () => {
  for (const path of Object.values(routes.translatedRoutes)) {
    assert.equal(routes.isIndexablePage(path), true);
    assert.equal(routes.isIndexablePage('/ru' + path), false);
    assert.deepEqual(routes.languageAlternates(path), []);
    assert.deepEqual(routes.languageAlternates('/ru' + path), []);
  }
  for (const path of [
    '/clients',
    '/clients/dashboard',
    '/contract',
    '/thank_you',
    '/articles/2',
    '/category/tips',
    '/tag/family',
    '/landing/couples',
    '/api/login',
  ]) {
    assert.equal(routes.isIndexablePage(path), false);
    assert.equal(routes.isIndexablePage('/ru' + path), false);
  }
});

test('release configuration generates reciprocal, equivalent language alternates', async () => {
  const released = await loadRoutes(source.replace('russianIndexingEnabled = false', 'russianIndexingEnabled = true'));
  for (const path of Object.values(routes.translatedRoutes)) {
    assert.deepEqual(released.languageAlternates(path), [
      { language: 'he', path },
      { language: 'ru', path: '/ru' + path },
      { language: 'x-default', path },
    ]);
    assert.deepEqual(released.languageAlternates('/ru' + path), released.languageAlternates(path));
  }
  assert.deepEqual(released.languageAlternates('/ru/contract'), []);
  assert.deepEqual(released.languageAlternates('/about'), []);
});

for (const type of ['pregnancy', 'couples', 'intimate', 'personal', 'feminine', 'family'])
  for (const page of ['intimate', 'family'].includes(type)
    ? ['service', 'pricing']
    : ['service', 'pricing', 'gallery']) {
    test(`${type}/${page}: translation coverage and substitution values match`, async () => {
      const read = async (locale) =>
        JSON.parse(await readFile(new URL(`../src/i18n/${type}/${page}.${locale}.json`, import.meta.url), 'utf8'));
      const he = await read('he'),
        ru = await read('ru');
      assert.deepEqual(Object.keys(he).sort(), Object.keys(ru).sort());
      for (const key of Object.keys(he)) {
        assert.ok(ru[key].trim(), key);
        assert.doesNotMatch(ru[key], /[\u0590-\u05ff]/, key);
        assert.deepEqual((he[key].match(/\{\d+\}/g) || []).sort(), (ru[key].match(/\{\d+\}/g) || []).sort(), key);
      }
    });
  }
