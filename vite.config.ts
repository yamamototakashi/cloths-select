/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages で公開する場合のサブパス。
// 環境変数 BASE_PATH で上書き可能（例: カスタムドメインなら "/"）。
const BASE_PATH = process.env.BASE_PATH ?? '/cloths-select/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg'],
      manifest: {
        name: 'Closet Weather',
        short_name: 'Closet',
        description: '天気に合わせて、今ある服から今日のコーデを提案するPWA',
        theme_color: '#2f6feb',
        background_color: '#f7f8fa',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ja',
        start_url: BASE_PATH,
        scope: BASE_PATH,
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: `${BASE_PATH}index.html`,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo-api',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 6 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/geocoding-api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo-geo',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
