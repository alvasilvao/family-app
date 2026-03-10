export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  const userId = await requireAuth(event)

  const { data, error } = await client
    .from('recipe_ratings')
    .select('recipe_id, rating, user_id')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const ratings: Record<string, { userRating: number | null; avgRating: number; ratingCount: number }> = {}

  for (const row of data || []) {
    if (!ratings[row.recipe_id]) {
      ratings[row.recipe_id] = { userRating: null, avgRating: 0, ratingCount: 0 }
    }
    const entry = ratings[row.recipe_id]!
    entry.avgRating = (entry.avgRating * entry.ratingCount + row.rating) / (entry.ratingCount + 1)
    entry.ratingCount++
    if (row.user_id === userId) {
      entry.userRating = row.rating
    }
  }

  // Round averages
  for (const key in ratings) {
    ratings[key]!.avgRating = Math.round(ratings[key]!.avgRating * 10) / 10
  }

  return ratings
})
