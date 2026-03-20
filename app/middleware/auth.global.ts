export default defineNuxtRouteMiddleware(async (to) => {
  // Only check auth on the client to avoid server-side 302 redirects.
  // Server-side redirects break iPad PWA standalone mode by triggering
  // Safari's in-app browser bar.
  if (import.meta.server) return

  if (to.path === '/login' || to.path === '/confirm') return

  // Must await getSession() instead of using useSupabaseUser() directly.
  // With useSsrCookies: false, the session is stored in localStorage and
  // restored asynchronously. useSupabaseUser() starts as null until
  // restoration completes, causing spurious redirects to /login on refresh.
  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return navigateTo('/login', { replace: true })
  }
})
