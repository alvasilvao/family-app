export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  const userId = await requireAuth(event)

  const query = getQuery(event)
  const refDate = (query.ref_date as string) || new Date().toISOString().slice(0, 10)

  const { data, error } = await client.rpc('get_recipe_stats', { p_user_id: userId, ref_date: refDate })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const stats: Record<string, {
    totalCount: number
    lastUsedDate: string | null
    weeksSinceLast: number | null
    score: number
    avgRating: number | null
    ratingCount: number
    userRating: number | null
  }> = {}

  for (const row of data || []) {
    stats[row.recipe_id] = {
      totalCount: row.total_count,
      lastUsedDate: row.last_used_date,
      weeksSinceLast: row.weeks_since_last,
      score: parseFloat(row.score),
      avgRating: row.avg_rating != null ? Math.round(parseFloat(row.avg_rating) * 10) / 10 : null,
      ratingCount: row.rating_count,
      userRating: row.user_rating ?? null,
    }
  }

  return stats
})
