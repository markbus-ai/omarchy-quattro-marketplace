// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://markbus-ai.github.io',
  base: '/omarchy-quattro-marketplace',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
