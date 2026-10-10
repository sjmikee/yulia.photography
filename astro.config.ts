import vercel from '@astrojs/vercel';
import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig, fontProviders } from 'astro/config';

import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import compress from 'astro-compress';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { isIndexablePage } from './src/i18n/routes';
const isIndexableSitemapPage = (page: string) => isIndexablePage(new URL(page).pathname);

export default defineConfig({
  output: 'static',
  i18n: { defaultLocale: 'he', locales: ['he', 'ru'], routing: { prefixDefaultLocale: false } },
  // Preserve the HTML whitespace behavior used before Astro 7.
  compressHTML: true,
  adapter: vercel({}),

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Heebo',
      weights: [400, 500, 'bold'],
      subsets: ['hebrew', 'latin'],
      cssVariable: '--font-heebo',
    },
  ],

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
    domains: ['cdn.pixabay.com', 'yulia.photography'],
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
    optimizeDeps: {
      include: ['photoswipe', 'photoswipe/lightbox'],
    },
    plugins: [
      {
        name: 'separate-vite-caches',
        // A production build must not replace modules served by a running dev server.
        config: (_config, { command }) => ({
          cacheDir: path.resolve(__dirname, `./node_modules/.vite/${command}`),
        }),
      },
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
