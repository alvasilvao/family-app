export function useNotifications() {
  const { authFetch } = useAuth()
  const config = useRuntimeConfig()

  const permission = ref<NotificationPermission>(
    import.meta.client && 'Notification' in window ? Notification.permission : 'default',
  )
  const isSubscribed = ref(false)
  const isSupported = ref(false)
  const loading = ref(false)

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
    try {
      const perm = await Notification.requestPermission()
      permission.value = perm
      if (perm !== 'granted') return

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: config.public.vapidPublicKey,
      })

      await authFetch('/api/notifications/subscribe', {
        method: 'POST',
        body: sub.toJSON(),
      })

      isSubscribed.value = true
    } finally {
      loading.value = false
    }
  }

  async function unsubscribe() {
    loading.value = true
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
    } finally {
      loading.value = false
    }
  }

  return { permission, isSubscribed, isSupported, loading, subscribe, unsubscribe }
}
