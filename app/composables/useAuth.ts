export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigateTo('/login', { replace: true })
  }

  async function getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) return session.access_token
    // Token may be expired — try refreshing
    const { data: { session: refreshed } } = await supabase.auth.refreshSession()
    return refreshed?.access_token || ''
  }

  async function authFetch<T>(url: string, opts?: Parameters<typeof $fetch>[1]): Promise<T> {
    const token = await getAccessToken()
    try {
      return await $fetch<T>(url, { ...opts, headers: { ...opts?.headers, Authorization: `Bearer ${token}` } })
    } catch (err: unknown) {
      // On 401, try one refresh before giving up
      if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 401) {
        const { data: { session } } = await supabase.auth.refreshSession()
        if (!session?.access_token) {
          navigateTo('/login', { replace: true })
          throw err
        }
        return $fetch<T>(url, { ...opts, headers: { ...opts?.headers, Authorization: `Bearer ${session.access_token}` } })
      }
      throw err
    }
  }

  return { user, signIn, signOut, authFetch }
}
