// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://saladbowl.com.uy',
  vite: {
    plugins: [tailwindcss()],
  },
});
