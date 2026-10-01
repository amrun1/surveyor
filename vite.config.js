import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Bridges the one gap that's real only in local dev: Vite's dev server and
  // the backend's local instance run on different ports (different origins)
  // until deployed. In production, both apps live on the same Tomcat instance
  // at different context-paths — same-origin by definition — so this proxy
  // has no production equivalent to keep in sync; it exists purely for local
  // development convenience.
  server: {
    port: 5173,
    proxy: {
      '/appraisal-api': {
        target: 'http://localhost:3000', // wherever the backend runs locally in dev
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/appraisal-api/, '')
      }
    }
  },
  base: '/surveyor/',
  plugins: [
    tailwindcss(),
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // 🛠️ CRUCIAL FIX: Added html and xml assets to allow the app shell shell to render offline
        globPatterns: ['**/*.{js,css,html,xml,ico,png,svg}'],
        runtimeCaching: [
          {
            // 🛠️ CRUCIAL FIX: Corrected and escaped the regex matching signature 
            // to intercept all a, b, or c subdomains securely
            urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'surveyor-map-tiles',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                // Status 0 ensures opaque cross-origin CORS images are saved safely
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Surveyor',
        short_name: 'Surveyor',
        description: 'A survey application',
        theme_color: '#002850',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
