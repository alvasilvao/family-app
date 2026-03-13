import { buildPushPayload } from '@block65/webcrypto-web-push'
import type { PushSubscription, VapidKeys } from '@block65/webcrypto-web-push'
import { createClient } from '@supabase/supabase-js'

interface NotificationPayload {
  title: string
  body: string
  url: string
}

/**
 * Send a push notification to all subscribed users, optionally excluding a specific user.
 */
export async function sendPushNotification(payload: NotificationPayload, excludeUserId?: string) {
  const config = useRuntimeConfig()

  const vapid: VapidKeys = {
    subject: `mailto:${config.vapidEmail}`,
    publicKey: String(config.public.vapidPublicKey),
    privateKey: String(config.vapidPrivateKey),
  }

  const supabase = createClient(
    String(config.public.supabase.url),
    String(config.supabaseServiceRoleKey),
  )

  let query = supabase.from('push_subscriptions').select('*')
  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId)
  }

  const { data: subscriptions, error } = await query

  if (error) throw new Error(error.message)
  if (!subscriptions?.length) return { sent: 0, failed: 0 }

  const data = JSON.stringify(payload)

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const subscription: PushSubscription = {
        endpoint: sub.endpoint,
        expirationTime: null,
        keys: sub.keys,
      }

      const request = await buildPushPayload({ data, options: { ttl: 60 } }, subscription, vapid)
      const res = await fetch(sub.endpoint, request)

      if (res.status === 404 || res.status === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
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
}
