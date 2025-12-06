// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://mga-constellation.pages.dev',
  integrations: [preact()],

  build: {
    inlineStylesheets: 'always'
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      modulePreload: {
        polyfill: false
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/preact')) {
              return 'preact'
            }
          }
        }
      }
    }
  }
});