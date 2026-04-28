import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png}'],
      },
      manifest: {
        name: 'Casino Habit',
        short_name: 'CasinoHabit',
        description: 'Gamified habit tracker with casino mechanics',
        theme_color: '#121214',
        background_color: '#121214',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
