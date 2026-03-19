export default defineNuxtRouteMiddleware(async (to) => {
  // Only check auth on the client to avoid server-side 302 redirects.
  // Server-side redirects break iPad PWA standalone mode by triggering
  // Safari's in-app browser bar.
  if (import.meta.server) return

  if (to.path === '/login' || to.path === '/confirm') return

  // Wait for Supabase to restore the session from cookies/storage before
  // deciding whether the user is authenticated.  Without this, the user ref
  // is still null on initial page load (ssr: false) and the middleware would
  // incorrectly redirect to /login on every reload.
  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return navigateTo('/login', { replace: true })
  }
})
