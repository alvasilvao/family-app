export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigateTo('/login')
  }

  function getAccessToken() {
    return supabase.auth.getSession().then((res) => res.data.session?.access_token || '')
  }

  return { user, signIn, signOut, getAccessToken }
}
