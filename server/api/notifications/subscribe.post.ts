export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const client = serverSupabaseClient(event)
  const body = await readBody(event)

  if (!body.endpoint || !body.keys) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid subscription' })
  }

  const { error } = await client.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: body.endpoint,
      keys: body.keys,
    },
    { onConflict: 'user_id,endpoint' },
  )

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
