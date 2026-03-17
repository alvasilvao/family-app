export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  if (!user.value && to.path !== '/login' && to.path !== '/confirm') {
    return navigateTo('/login', { replace: true })
  }
})
