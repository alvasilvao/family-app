import { buildPushPayload } from '@block65/webcrypto-web-push'
import type { PushSubscription, VapidKeys } from '@block65/webcrypto-web-push'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const client = serverSupabaseClient(event)
  const config = useRuntimeConfig()

  const { data: subscriptions, error } = await client
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!subscriptions?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No active subscriptions found' })
  }

  const vapid: VapidKeys = {
    subject: `mailto:${config.vapidEmail}`,
    publicKey: String(config.public.vapidPublicKey),
    privateKey: String(config.vapidPrivateKey),
  }

  const payload = JSON.stringify({
    title: 'Food Planner',
    body: 'Notifications are working!',
    url: '/profile',
  })

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const subscription: PushSubscription = {
        endpoint: sub.endpoint,
        expirationTime: null,
        keys: sub.keys,
      }

      const request = await buildPushPayload({ data: payload, options: { ttl: 60 } }, subscription, vapid)
      const res = await fetch(sub.endpoint, request)

      if (res.status === 404 || res.status === 410) {
        await client.from('push_subscriptions').delete().eq('id', sub.id)
        throw new Error(`Subscription expired: ${res.status}`)
      }

      if (!res.ok) {
        throw new Error(`Push failed: ${res.status} ${await res.text()}`)
      }

      return res
    }),
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length
  return { sent, failed }
})
