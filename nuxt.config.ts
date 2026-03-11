// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase', '@vite-pwa/nuxt', '@nuxt/eslint'],

  pwa: {
    strategies: 'injectManifest',
    srcDir: 'service-worker',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    manifest: {
      name: 'Family App',
      short_name: 'Family App',
      description: 'Organize meals, tasks, and more for the family',
      theme_color: '#4f6f52',
      background_color: '#faf6f1',
      display: 'standalone',
      icons: [
        {
          src: 'icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,png,svg,ico,woff2}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: false,
    },
  },

  supabase: {
    types: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login'],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    tmdbApiKey: process.env.TMDB_API_KEY || '',
    vapidPrivateKey: '',
    vapidEmail: '',
    cronSecret: '',
    supabaseServiceRoleKey: '',
    public: {
      vapidPublicKey: '',
    },
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  app: {
    head: {
      title: 'Family App',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', content: '#4f6f52' },
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@300;600;700&family=DM+Sans:wght@300;400;500;600&display=swap',
        },
      ],
    },
  },
})
