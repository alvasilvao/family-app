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

  function getAccessToken() {
    return supabase.auth.getSession().then((res) => res.data.session?.access_token || '')
  }

  async function authFetch<T>(url: string, opts?: Parameters<typeof $fetch>[1]): Promise<T> {
    const token = await getAccessToken()
    return $fetch<T>(url, { ...opts, headers: { ...opts?.headers, Authorization: `Bearer ${token}` } })
  }

  return { user, signIn, signOut, authFetch }
}
