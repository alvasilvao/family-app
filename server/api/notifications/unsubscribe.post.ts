export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const client = serverSupabaseClient(event)
  const body = await readBody(event)

  if (!body.endpoint) {
    throw createError({ statusCode: 400, statusMessage: 'Missing endpoint' })
  }

  const { error } = await client
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', body.endpoint)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
