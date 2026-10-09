import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { test } from 'node:test';
const root = new URL('../dist/client/', import.meta.url);
let built = true;
try {
  await access(new URL('ru/pricing/pregnancy/index.html', root));
} catch {
  built = false;
}
const read = (path) => readFile(new URL(path, root), 'utf8');
const tag = (html, name, attribute, value) =>
  (html.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) || []).find((t) => t.includes(`${attribute}="${value}"`)) || '';
for (const path of [
  'services/pregnancy-photography',
  'pricing/pregnancy',
  'gallery/pregnancy',
  'services/couples-photography',
  'pricing/couples',
  'gallery/couples',
  'services/personal-photography',
  'pricing/personal',
  'gallery/solo',
  'services/feminine-photography',
  'pricing/feminine',
  'gallery/feminine',
  'services/family-photography',
  'pricing/family',
  'services/intimate-couples-photography',
  'pricing/couples-intimate',
]) {
  test(
    `${path}: built translation is complete, isolated from indexing and paired with unchanged Hebrew URL`,
    { skip: !built && 'Run npm run build first' },
    async () => {
      const he = await read(`${path}/index.html`),
        ru = await read(`ru/${path}/index.html`);
      assert.match(he, /<html(?=[^>]*lang="he")(?=[^>]*dir="rtl")[^>]*>/);
      assert.match(ru, /<html(?=[^>]*lang="ru")(?=[^>]*dir="ltr")[^>]*>/);
      assert.ok(tag(he, 'link', 'rel', 'canonical').includes(`href="https://yulia.photography/${path}"`));
      assert.ok(tag(ru, 'link', 'rel', 'canonical').includes(`href="https://yulia.photography/ru/${path}"`));
      assert.ok(tag(he, 'meta', 'name', 'robots').includes('content="index,follow"'));
      assert.ok(tag(ru, 'meta', 'name', 'robots').includes('content="noindex,follow"'));
      assert.doesNotMatch(ru, /<link[^>]*hreflang=/);
      const visible = ru
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '')
        .replace(/<[^>]+>/g, '')
        .replaceAll('עברית', '');
      assert.doesNotMatch(visible, /[\u0590-\u05ff]/);
      const sitemap = await read('sitemap-0.xml');
      assert.ok(sitemap.includes(`https://yulia.photography/${path}`));
      assert.ok(!sitemap.includes('https://yulia.photography/ru/'));
      for (const source of [he, ru]) {
        for (const [, json] of source.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))
          JSON.parse(json);
      }
    }
  );
}
test(
  'Russian service and pricing offers use the same amounts as Hebrew',
  { skip: !built && 'Run npm run build first' },
  async () => {
    for (const path of [
      'services/pregnancy-photography',
      'pricing/pregnancy',
      'services/couples-photography',
      'pricing/couples',
      'services/personal-photography',
      'pricing/personal',
      'services/feminine-photography',
      'pricing/feminine',
      'services/intimate-couples-photography',
      'pricing/couples-intimate',
    ]) {
      const offers = async (locale) => {
        const html = await read(`${locale}${path}/index.html`);
        const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
          (m) => JSON.parse(m[1])
        );
        return schemas.find((s) => s['@type'] === 'Service').offers;
      };
      const he = await offers(''),
        ru = await offers('ru/');
      assert.deepEqual(
        ru.map((o) => o.price),
        he.map((o) => o.price)
      );
      for (const offer of ru) {
        assert.equal(offer.priceCurrency, 'ILS');
        assert.match(
          offer.url,
          /\/ru\/pricing\/(pregnancy|couples|couples-intimate|personal|feminine)#(basic|classic|premium)$/
        );
      }
    }
  }
);

test(
  'Family starting price and package amounts agree across languages',
  { skip: !built && 'Run npm run build first' },
  async () => {
    for (const locale of ['', 'ru/']) {
      const service = await read(`${locale}services/family-photography/index.html`);
      const pricing = await read(`${locale}pricing/family/index.html`);
      const visible = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
      assert.ok(tag(service, 'img', 'fetchpriority', 'high'), 'Family hero must render an image');
      assert.match(visible(service), /700/);
      assert.doesNotMatch(visible(service), /600/);
      for (const amount of [700, 900, 1300]) assert.ok(visible(pricing).includes(String(amount)));
    }
  }
);
