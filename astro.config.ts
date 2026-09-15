import vercel from '@astrojs/vercel';
import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig, fontProviders } from 'astro/config';

import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import compress from 'astro-compress';
import type { AstroIntegration } from 'astro';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

// Keep URLs marked noindex out of the XML sitemap. A sitemap should contain
// only canonical URLs that we want search engines to crawl and index.
const sitemapExcludedPaths = new Set(['/articles', '/contract', '/thank_you', '/landing/couples']);
const isIndexableSitemapPage = (page: string) => {
  const pathname = new URL(page).pathname.replace(/\/$/, '') || '/';

  return !(
    sitemapExcludedPaths.has(pathname) ||
    pathname.startsWith('/clients') ||
    pathname.startsWith('/category/') ||
    pathname.startsWith('/tag/')
  );
};

export default defineConfig({
  output: 'static',
  adapter: vercel({}),

  fonts: [{
          provider: fontProviders.google(),
          name: "Heebo",
          weights: [400, 500, "bold"],
          subsets: ["hebrew", "latin"],
          cssVariable: "--font-heebo"
  }],

  integrations: [
    sitemap({ filter: isIndexableSitemapPage }),
    mdx(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    astrowind({
      config: './src/config.yaml',
    }),
  ],

  image: {
    domains: ['cdn.pixabay.com','yulia.photography'],
  },

  markdown: {
    processor: unified({
      remarkPlugins: [readingTimeRemarkPlugin],
      rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
    }),
  },
  //   remarkPlugins: [readingTimeRemarkPlugin],
  //   rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
  // },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
