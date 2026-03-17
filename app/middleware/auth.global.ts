export default defineNuxtRouteMiddleware((to) => {
  // Only check auth on the client to avoid server-side 302 redirects.
  // Server-side redirects break iPad PWA standalone mode by triggering
  // Safari's in-app browser bar.
  if (import.meta.server) return

  const user = useSupabaseUser()
  if (!user.value && to.path !== '/login' && to.path !== '/confirm') {
    return navigateTo('/login', { replace: true })
  }
})
