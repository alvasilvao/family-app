import { buildPushPayload } from '@block65/webcrypto-web-push'
import type { PushSubscription, VapidKeys } from '@block65/webcrypto-web-push'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Verify cron secret to prevent unauthorized access
  const query = getQuery(event)
  if (query.key !== config.cronSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid key' })
  }

  const vapid: VapidKeys = {
    subject: `mailto:${config.vapidEmail}`,
    publicKey: String(config.public.vapidPublicKey),
    privateKey: String(config.vapidPrivateKey),
  }

  // Use service role client to read all subscriptions (bypasses RLS)
  const supabase = createClient(
    String(config.public.supabase.url),
    String(config.supabaseServiceRoleKey),
  )

  const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('*')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!subscriptions?.length) return { sent: 0 }

  const data = JSON.stringify({
    title: 'Food Planner',
    body: 'Time to plan your meals for next week!',
    url: '/plans',
  })

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const subscription: PushSubscription = {
        endpoint: sub.endpoint,
        expirationTime: null,
        keys: sub.keys,
      }

      const payload = await buildPushPayload({ data, options: { ttl: 60 } }, subscription, vapid)
      const res = await fetch(sub.endpoint, payload)

      // Remove invalid subscriptions (gone or expired)
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
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => r.reason?.message || String(r.reason))
  return { sent, failed: errors.length, errors }
})
