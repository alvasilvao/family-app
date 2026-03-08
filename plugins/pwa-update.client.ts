export default defineNuxtPlugin(() => {
  if (!navigator.serviceWorker) return

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
})
