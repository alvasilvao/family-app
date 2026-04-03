export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  const userId = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing recipe id' })

  const body = await readBody(event)
  const rating = body?.rating

  if (typeof rating !== 'number' || rating < 1 || rating > 5 || rating % 0.5 !== 0) {
    throw createError({ statusCode: 400, statusMessage: 'Rating must be from 1 to 5 in 0.5 steps' })
  }

  const { error } = await client
    .from('recipe_ratings')
    .upsert(
      { recipe_id: id, user_id: userId, rating, updated_at: new Date().toISOString() },
      { onConflict: 'recipe_id,user_id' },
    )

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { recipe_id: id, rating }
})
