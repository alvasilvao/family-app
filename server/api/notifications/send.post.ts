import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Verify cron secret to prevent unauthorized access
  const query = getQuery(event)
  if (query.key !== config.cronSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid key' })
  }

  webpush.setVapidDetails(
    `mailto:${config.vapidEmail}`,
    config.public.vapidPublicKey as string,
    config.vapidPrivateKey as string,
  )

  // Use service role client to read all subscriptions (bypasses RLS)
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceRoleKey as string)

  const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('*')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!subscriptions?.length) return { sent: 0 }

  const payload = JSON.stringify({
    title: 'Food Planner',
    body: 'Time to plan your meals for next week!',
    url: '/plans',
  })

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush
        .sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
        .catch(async (err) => {
          // Remove invalid subscriptions (gone or expired)
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          }
          throw err
        }),
    ),
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length
  return { sent, failed }
})
