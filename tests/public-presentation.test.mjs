import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/public-presentation.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { usesRefinedPresentation } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

test('protected page families keep their presentation in both languages and with trailing slashes', () => {
  for (const route of [
    '/services/family-photography',
    '/services/first-year-photography',
    '/pricing/family',
    '/pricing/first-year',
    '/landing/couples',
    '/clients',
    '/clients/dashboard',
    '/contract',
    '/thank_you',
  ]) {
    for (const prefix of ['', '/ru']) {
      for (const suffix of ['', '/']) {
        const path = prefix + route + suffix;
        assert.equal(usesRefinedPresentation(path), false, path);
      }
    }
  }
});

test('other public routes receive refinements without excluding family-related articles', () => {
  for (const route of [
    '/',
    '/services',
    '/pricing',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/services/couples-photography',
    '/pricing/pregnancy',
    '/gallery/solo',
    '/articles',
    '/prepare-to-family-photoshot',
  ]) {
    for (const prefix of ['', '/ru']) {
      assert.equal(usesRefinedPresentation(prefix + route), true, prefix + route);
    }
  }
});
