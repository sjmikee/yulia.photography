import vercel from '@astrojs/vercel';
import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig, fontProviders } from 'astro/config';

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

export default defineConfig({
  output: 'static',
  adapter: vercel({}),

  experimental: {
      fonts: [{
          provider: fontProviders.google(),
          name: "Heebo",
          weights: [400, 500, "bold"],
          subsets: ["hebrew", "latin"],
          cssVariable: "--font-heebo"
      }]
  },

  integrations: [
    sitemap(),
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
    domains: ['cdn.pixabay.com'],
  },

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
  },

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
