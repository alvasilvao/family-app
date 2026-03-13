export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  const userId = await requireAuth(event)

  // Aggregate ratings server-side with SQL instead of fetching all rows
  const { data, error } = await client.rpc('get_recipe_ratings', { p_user_id: userId })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const ratings: Record<string, { userRating: number | null; avgRating: number; ratingCount: number }> = {}

  for (const row of data || []) {
    ratings[row.recipe_id] = {
      userRating: row.user_rating,
      avgRating: Math.round(row.avg_rating * 10) / 10,
      ratingCount: row.rating_count,
    }
  }

  return ratings
})
