export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing media id' })
  const body = await readBody(event)

  const updates: Record<string, any> = {}

  if (body.status !== undefined) {
    if (!['watched', 'want_to_watch'].includes(body.status)) {
      throw createError({ statusCode: 400, statusMessage: 'status must be "watched" or "want_to_watch"' })
    }
    updates.status = body.status
  }

  if (body.rating !== undefined) {
    if (body.rating !== null && (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5)) {
      throw createError({ statusCode: 400, statusMessage: 'rating must be 1-5 or null' })
    }
    updates.rating = body.rating
  }

  if (body.notes !== undefined) {
    updates.notes = validateString(body.notes || '', 'notes', 2000)
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  const { data, error } = await client
    .from('media_watchlist')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
