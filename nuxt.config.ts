// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-11',
  devtools: { enabled: true },
  ssr: false,

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
      theme_color: '#2d6a4f',
      background_color: '#faf6f1',
      display: 'standalone',
      display_override: ['standalone'],
      scope: '/',
      start_url: '/',
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
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,webmanifest}'],
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
    redirect: false,
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    tmdbApiKey: '',
    vapidPrivateKey: '',
    vapidEmail: '',
    cronSecret: '',
    supabaseServiceRoleKey: '',
    openaiApiKey: '',
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
        { name: 'theme-color', content: '#2d6a4f' },
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
