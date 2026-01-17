// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if we're building for local mode (Docker) or preview mode (Vercel/static)
const isLocalMode = process.env.PUBLIC_APP_MODE === 'local';

// https://astro.build/config
const config = {
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  },
  integrations: [react()]
};

// For local mode (Docker), use server output with node adapter
// For preview mode (Vercel), use static output
if (isLocalMode) {
  const node = (await import('@astrojs/node')).default;
  config.output = 'server';
  config.adapter = node({ mode: 'standalone' });
} else {
  config.output = 'static';
}

export default defineConfig(config);
