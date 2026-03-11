export function useNotifications() {
  const { authFetch } = useAuth()
  const config = useRuntimeConfig()

  const permission = ref<NotificationPermission>(
    import.meta.client && 'Notification' in window ? Notification.permission : 'default',
  )
  const isSubscribed = ref(false)
  const isSupported = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  onMounted(async () => {
    isSupported.value = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    if (isSupported.value) {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      isSubscribed.value = !!sub
    }
  })

  async function subscribe() {
    if (!isSupported.value) return
    loading.value = true
    error.value = null
    try {
      const perm = await Notification.requestPermission()
      permission.value = perm
      if (perm !== 'granted') return

      const vapidKey = config.public.vapidPublicKey
      console.log('VAPID public key:', JSON.stringify(vapidKey))
      console.log('VAPID key length:', typeof vapidKey === 'string' ? vapidKey.length : 'not a string')

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })

      await authFetch('/api/notifications/subscribe', {
        method: 'POST',
        body: sub.toJSON(),
      })

      isSubscribed.value = true
    } catch (err: unknown) {
      console.error('Failed to subscribe to notifications:', err)
      error.value = err instanceof Error ? err.message : 'Failed to enable notifications'
    } finally {
      loading.value = false
    }
  }

  async function unsubscribe() {
    loading.value = true
    error.value = null
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await authFetch('/api/notifications/unsubscribe', {
          method: 'POST',
          body: { endpoint: sub.endpoint },
        })
        await sub.unsubscribe()
      }
      isSubscribed.value = false
    } catch (err: unknown) {
      console.error('Failed to unsubscribe from notifications:', err)
      error.value = err instanceof Error ? err.message : 'Failed to disable notifications'
    } finally {
      loading.value = false
    }
  }

  return { permission, isSubscribed, isSupported, loading, error, subscribe, unsubscribe }
}
