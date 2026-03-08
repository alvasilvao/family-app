// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase'],

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login'],
    },
  },

  css: ['~/assets/css/main.css'],

  nitro: {
    preset: 'cloudflare-pages',
  },

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@300;600;700&family=DM+Sans:wght@300;400;500;600&display=swap',
        },
      ],
    },
  },
})
