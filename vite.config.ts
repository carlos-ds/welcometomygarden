import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { createAvailableLocales } from './plugins/available-locales';
import { customSvgLoader } from './plugins/svg-loader';

/* eslint-env node */
export default defineConfig((): UserConfig => {
  const isProduction = process.env.MODE === 'production' || process.env.MODE === 'staging';
  return {
    build: {
      minify: isProduction
    },
    plugins: [
      createAvailableLocales(),
      customSvgLoader({ removeSVGTagAttrs: false }),
      sveltekit()
    ]
  };
});
