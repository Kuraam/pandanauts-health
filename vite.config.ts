import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Offline-first: a service worker precaches the whole app (JS, CSS, fonts, icons),
// so after the first visit it opens and runs with no network at all, like
// software on a spacecraft with no Earth link.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-mark.png', 'logo-full.png'],
      manifest: {
        name: 'Pandanauts Health: Astronaut Self-Check',
        short_name: 'Pandanauts',
        description: 'Offline health self-assessment for astronauts on long-duration missions.',
        theme_color: '#0A0F24',
        background_color: '#060918',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/logo-mark.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/logo-mark.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: '/index.html',
      },
    }),
  ],
})
