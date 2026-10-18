import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { test } from 'node:test';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = new URL('../dist/client/', import.meta.url);
const decode = (text) => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const meta = (html, key) => {
  const tags = html.match(/<meta\b[^>]*>/g) ?? [];
  return tags
    .filter((tag) => tag.includes(`name="${key}"`) || tag.includes(`property="${key}"`))
    .map((tag) => decode(tag.match(/content="([^"]*)"/)?.[1] ?? ''));
};

test('every indexable public page has complete, localized search and sharing previews', async () => {
  const files = (await readdir(root, { recursive: true })).filter((file) => file.endsWith('.html'));
  const titles = new Set();
  let checked = 0;
  const images = new Map();
  for (const file of files) {
    const html = await readFile(new URL(file, root), 'utf8');
    if (!meta(html, 'robots')[0]?.startsWith('index,')) continue;
    checked++;
    const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? '');
    const description = meta(html, 'description');
    assert.ok(title, `${file}: title`);
    assert.ok(!titles.has(title), `${file}: duplicate title ${title}`);
    titles.add(title);
    assert.equal(description.length, 1, `${file}: one description`);
    assert.ok(description[0].length > 40, `${file}: useful description`);
    assert.deepEqual(meta(html, 'og:title'), [title], `${file}: matching OG title`);
    assert.deepEqual(meta(html, 'twitter:title'), [title], `${file}: matching Twitter title`);
    assert.deepEqual(meta(html, 'og:description'), description);
    assert.deepEqual(meta(html, 'twitter:description'), description);
    const russian = file.startsWith('ru/');
    assert.deepEqual(meta(html, 'og:locale'), [russian ? 'ru_IL' : 'he_IL']);
    if (russian)
      assert.doesNotMatch(title + description[0] + meta(html, 'og:image:alt').join(''), /[\u0590-\u05ff]/, file);
    const urls = meta(html, 'og:image');
    assert.ok(urls.length, `${file}: sharing image`);
    assert.deepEqual(meta(html, 'twitter:image'), [urls[0]], `${file}: one primary Twitter image`);
    assert.deepEqual(meta(html, 'twitter:image:alt'), [meta(html, 'og:image:alt')[0]]);
    assert.deepEqual(meta(html, 'twitter:card'), ['summary_large_image']);
    for (const [index, url] of urls.entries()) {
      assert.match(url, /^https:\/\/yulia\.photography\//, file);
      assert.doesNotMatch(url, /\/_image\?/, file);
      assert.ok(meta(html, 'og:image:alt')[index], `${file}: image description`);
      const path = new URL(url).pathname;
      if (!images.has(path)) images.set(path, await sharp(fileURLToPath(new URL(`.${path}`, root))).metadata());
      const size = images.get(path);
      assert.equal(Number(meta(html, 'og:image:width')[index]), size.width, `${file}: actual image width`);
      assert.equal(Number(meta(html, 'og:image:height')[index]), size.height, `${file}: actual image height`);
      assert.ok(size.width > 0 && size.width <= 1200, file);
      assert.ok(size.height > 0, file);
    }
  }
  assert.ok(checked >= 50, `Expected both languages; checked ${checked} pages`);
});
