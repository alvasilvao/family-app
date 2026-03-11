export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Verify cron secret to prevent unauthorized access
  const query = getQuery(event)
  if (query.key !== config.cronSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid key' })
  }

  return sendPushNotification({
    title: 'Food Planner',
    body: 'Time to plan your meals for next week!',
    url: '/plans',
  })
})
