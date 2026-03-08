export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await requireAuth(event)

  const query = getQuery(event)
  const currentWeekKey = (query.week as string) || ''

  const { data, error } = await client.rpc('get_ranked_recipes', { current_week_key: currentWeekKey })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Return as a map: { [recipeId]: stats }
  const scores: Record<string, { totalCount: number; lastWeekKey: string | null; weeksSinceLast: number | null; score: number }> = {}
  for (const row of data || []) {
    scores[row.recipe_id] = {
      totalCount: row.total_count,
      lastWeekKey: row.last_week_key,
      weeksSinceLast: row.weeks_since_last,
      score: parseFloat(row.score),
    }
  }

  return scores
})
