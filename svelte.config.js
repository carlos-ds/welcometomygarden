import adapter from '@sveltejs/adapter-static'; // https://www.npmjs.com/package/@sveltejs/adapter-static

import preprocess from 'svelte-preprocess';
import { resolve } from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist'
    }),

    prerender: {
      crawl: true,
      entries: [
        '*',
        '/chat/[name]/[chatId]',
        '/explore/garden/[gardenId]',
        '/become-superfan/payment/[id]'
      ]
    },
    alias: {
      '@': resolve('./src')
    }
  },
  onwarn: (warning) => {
    // https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#config-file-resolving
    if (warning.code === 'security-anchor-rel-noreferrer') return;
  }
};

export default config;
