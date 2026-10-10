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
  'how-to-choose-family-photographer',
  'natural-couple-photos',
  'how-to-prepare-kids-to-family-photoshot',
  'why-everbody-needs-a-personal-photoshot',
  'prepare-to-family-photoshot',
  'privacy',
  'terms',
  'services',
  'pricing',
  'about',
  'contact',
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
  'services/first-year-photography',
  'pricing/first-year',
  'services/intimate-couples-photography',
  'pricing/couples-intimate',
]) {
  test(
    `${path}: built translation is complete, enabled for indexing and paired with unchanged Hebrew URL`,
    { skip: !built && 'Run npm run build first' },
    async () => {
      const he = await read(`${path}/index.html`),
        ru = await read(`ru/${path}/index.html`);
      assert.match(he, /<html(?=[^>]*lang="he")(?=[^>]*dir="rtl")[^>]*>/);
      assert.match(ru, /<html(?=[^>]*lang="ru")(?=[^>]*dir="ltr")[^>]*>/);
      assert.ok(tag(he, 'link', 'rel', 'canonical').includes(`href="https://yulia.photography/${path}"`));
      assert.ok(tag(ru, 'link', 'rel', 'canonical').includes(`href="https://yulia.photography/ru/${path}"`));
      assert.ok(tag(he, 'meta', 'name', 'robots').includes('content="index,follow"'));
      assert.ok(tag(ru, 'meta', 'name', 'robots').includes('content="index,follow"'));
      for (const html of [he, ru]) {
        assert.ok(tag(html, 'link', 'hreflang', 'he').includes(`href="https://yulia.photography/${path}"`));
        assert.ok(tag(html, 'link', 'hreflang', 'ru').includes(`href="https://yulia.photography/ru/${path}"`));
        assert.ok(tag(html, 'link', 'hreflang', 'x-default').includes(`href="https://yulia.photography/${path}"`));
        assert.doesNotMatch(html, /Русская версия готовится к запуску/);
      }
      const visible = ru
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '')
        .replace(/<[^>]+>/g, '')
        .replaceAll('עברית', '');
      assert.doesNotMatch(visible, /[\u0590-\u05ff]/);
      const sitemap = await read('sitemap-0.xml');
      assert.ok(sitemap.includes(`https://yulia.photography/${path}`));
      assert.ok(sitemap.includes(`https://yulia.photography/ru/${path}`));
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

test(
  'First-year prices and translated family crosslinks agree',
  { skip: !built && 'Run npm run build first' },
  async () => {
    for (const locale of ['', 'ru/']) {
      const service = await read(locale + 'services/first-year-photography/index.html');
      const pricing = await read(locale + 'pricing/first-year/index.html');
      assert.ok(tag(service, 'img', 'fetchpriority', 'high'));
      assert.match(service.replace(/<[^>]+>/g, ' '), /700/);
      for (const amount of [700, 900, 1200]) assert.ok(pricing.includes(String(amount)));
      assert.ok(service.includes('href="/' + locale + 'pricing/first-year"'));
      assert.ok(pricing.includes('href="/' + locale + 'services/family-photography"'));
    }
    const family = await read('ru/services/family-photography/index.html');
    assert.ok(family.includes('href="/ru/pricing/first-year"'));
  }
);

test(
  'Russian homepage has localized content, equivalent links and released search settings',
  { skip: !built },
  async () => {
    const ru = await read('ru/index.html');
    const he = await read('index.html');
    assert.match(ru, /<html(?=[^>]*lang="ru")(?=[^>]*dir="ltr")[^>]*>/);
    assert.ok(tag(ru, 'meta', 'name', 'robots').includes('content="index,follow"'));
    assert.ok(tag(ru, 'link', 'rel', 'canonical').includes('https://yulia.photography/ru'));
    assert.match(he, /href="\/ru"/);
    assert.match(ru, /href="\/"[^>]*lang="he"/);
    const visible = ru
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, '')
      .replaceAll('עברית', '');
    assert.doesNotMatch(visible, /[\u0590-\u05ff]/);
    for (const path of [
      'services/couples-photography',
      'services/pregnancy-photography',
      'services/feminine-photography',
      'services/personal-photography',
    ])
      assert.ok(ru.includes(`href="/ru/${path}"`));
    for (const image of ru.match(/<img\b[^>]*>/g) || []) {
      assert.doesNotMatch(image.match(/alt="([^"]*)"/)?.[1] || '', /[\u0590-\u05ff]/);
    }
    assert.doesNotMatch(visible, /статьи доступны на иврите/);
    assert.match(ru, /href="\/ru\/articles"/);
  }
);

test('overview pages expose all seven categories in each language', { skip: !built }, async () => {
  for (const locale of ['', 'ru/']) {
    for (const page of ['services', 'pricing']) {
      const html = await read(`${locale}${page}/index.html`);
      const articles = html.match(/<article\b[\s\S]*?<\/article>/g) || [];
      assert.equal(articles.length, 7);
      for (const article of articles) {
        for (const [, href] of article.matchAll(/href="([^"]*)"/g)) assert.ok(href.startsWith(`/${locale}${page}/`));
      }
      if (page === 'pricing')
        assert.match(
          articles.find((a) => a.includes('/pricing/family')),
          /700/
        );
    }
  }
});

test('Russian page links stay in Russian wherever a translation exists', { skip: !built }, async () => {
  const { readdir } = await import('node:fs/promises');
  const paths = await readdir(new URL('ru/', root), { recursive: true });
  for (const path of paths.filter((path) => path.endsWith('.html'))) {
    const html = await read(`ru/${path}`);
    for (const anchor of html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) || []) {
      if (anchor.includes('data-language-switch')) continue;
      const href = anchor.match(/\bhref="([^"]*)"/)?.[1];
      if (!href) continue;
      const url = new URL(
        href,
        'https://yulia.photography/ru' + (path === 'index.html' ? '' : '/' + path.replace(/\/index\.html$/, ''))
      );
      if (url.origin !== 'https://yulia.photography' || url.pathname.startsWith('/_astro/')) continue;
      const pathname = url.pathname.replace(/\/+$/, '') || '/';
      if (!pathname.startsWith('/ru')) {
        const russianFile = pathname === '/' ? 'ru/index.html' : `ru${pathname}/index.html`;
        let translated = false;
        try {
          await access(new URL(russianFile, root));
          translated = true;
        } catch {
          // Destinations without a built Russian page intentionally stay in Hebrew.
        }
        assert.equal(translated, false, `${path}: untranslated link ${href}`);
      } else {
        assert.doesNotMatch(anchor, /на иврите/, `${path}: stale label for ${href}`);
        const target = await read(pathname === '/ru' ? 'ru/index.html' : pathname.slice(1) + '/index.html');
        if (url.hash) {
          const id = decodeURIComponent(url.hash.slice(1));
          assert.ok(target.includes(`id="${id}"`), `${path}: missing section ${href}`);
        }
      }
    }
  }
});

test('Russian articles, topic pages and homepage previews stay in their language', { skip: !built }, async () => {
  const { readdir } = await import('node:fs/promises');
  const slugs = (await readdir(new URL('../src/data/post/ru/', import.meta.url))).map((name) =>
    name.replace(/\.mdx$/, '')
  );
  assert.equal(slugs.length, 5);
  const topics = [
    'articles',
    'category/tips',
    ...['photo', 'tips', 'family', 'couples', 'single', 'portrait'].map((tag) => `tag/${tag}`),
  ];
  for (const path of topics) {
    const html = await read(`ru/${path}/index.html`);
    assert.match(html, /lang="ru"/);
    assert.ok(tag(html, 'meta', 'name', 'robots').includes('noindex,follow'));
    const visible = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, '')
      .replaceAll('עברית', '');
    assert.doesNotMatch(visible, /[\u0590-\u05ff]/);
    assert.match(html, /data-language-switch/);
  }
  const list = await read('ru/articles/index.html');
  for (const slug of slugs) {
    assert.ok(list.includes(`href="/ru/${slug}"`));
    const post = await read(`ru/${slug}/index.html`);
    assert.ok(post.includes('href="/ru/articles"'));
    assert.ok(post.includes('href="/ru/category/tips"'));
    assert.match(post, /Поделиться/);
    assert.match(post, /Время чтения/);
  }
  const home = await read('ru/index.html');
  assert.equal(slugs.filter((slug) => home.includes(`href="/ru/${slug}"`)).length, 4);
  assert.ok(home.includes('href="/ru/articles"'));
  assert.doesNotMatch(home, /статьи доступны на иврите|Советы — на иврите/);
  const heHome = await read('index.html');
  for (const slug of slugs) assert.ok(!heHome.includes(`href="/ru/${slug}"`));
});

test('Russian structured data uses Russian names and homepage destinations', { skip: !built }, async () => {
  for (const path of [
    'index.html',
    'privacy/index.html',
    'natural-couple-photos/index.html',
    'pricing/couples/index.html',
  ]) {
    const html = await read(`ru/${path}`);
    const graphs = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map(([, json]) => JSON.parse(json))
      .flatMap((data) => data['@graph'] || []);
    const page = graphs.find((item) => item['@type'] === 'WebPage');
    assert.ok(page?.name, `${path}: missing page name`);
    assert.equal(page.inLanguage, 'ru');
    assert.doesNotMatch(JSON.stringify(graphs), /[\u0590-\u05ff]|на иврите/);
    const breadcrumb = graphs.find((item) => item['@type'] === 'BreadcrumbList');
    if (breadcrumb) assert.equal(breadcrumb.itemListElement[0].item['@id'], 'https://yulia.photography/ru');
  }
});

test(
  'released Russian site allows crawling, lists its homepage and has no preparation notice',
  { skip: !built },
  async () => {
    const { readdir } = await import('node:fs/promises');
    const sitemap = await read('sitemap-0.xml');
    assert.match(sitemap, /<loc>https:\/\/yulia\.photography\/ru<\/loc>/);
    const robots = await read('robots.txt');
    assert.doesNotMatch(robots, /Disallow:\s*\/ru/);
    assert.match(robots, /Sitemap: https:\/\/yulia\.photography\/sitemap-index.xml/);
    for (const file of (await readdir(new URL('ru/', root), { recursive: true })).filter((file) =>
      file.endsWith('.html')
    )) {
      assert.doesNotMatch(await read(`ru/${file}`), /Русская версия готовится к запуску/);
    }
    for (const file of ['index.html', 'ru/index.html']) {
      const html = await read(file);
      assert.ok(tag(html, 'link', 'hreflang', 'ru').includes('href="https://yulia.photography/ru"'));
      assert.ok(tag(html, 'link', 'hreflang', 'he').includes('href="https://yulia.photography"'));
    }
  }
);

test(
  'contract and confirmation routes localize privately without indexing or analytics',
  { skip: !built && 'Run npm run build first' },
  async () => {
    const sitemap = await read('sitemap-0.xml');
    for (const locale of ['he', 'ru']) {
      for (const route of ['contract', 'thank_you']) {
        const path = `${locale === 'ru' ? 'ru/' : ''}${route}`;
        const html = await read(`${path}/index.html`);
        assert.ok(tag(html, 'html', 'lang', locale));
        assert.ok(tag(html, 'meta', 'name', 'robots').includes('noindex,nofollow'));
        assert.ok(tag(html, 'meta', 'name', 'referrer').includes('no-referrer'));
        assert.doesNotMatch(html, /googletagmanager.com/);
        assert.ok(!sitemap.includes(`https://yulia.photography/${path}`));
        if (locale === 'ru') {
          const visible = html
            .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
            .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '')
            .replace(/<[^>]+>/g, '');
          assert.doesNotMatch(visible, /[\u0590-\u05ff]/);
        }
      }
    }
  }
);
