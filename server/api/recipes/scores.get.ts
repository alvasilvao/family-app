export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await requireAuth(event)

  const query = getQuery(event)
  const refDate = (query.ref_date as string) || new Date().toISOString().slice(0, 10)

  const { data, error } = await client.rpc('get_ranked_recipes', { ref_date: refDate })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const scores: Record<string, { totalCount: number; lastUsedDate: string | null; weeksSinceLast: number | null; score: number }> = {}
  for (const row of data || []) {
    scores[row.recipe_id] = {
      totalCount: row.total_count,
      lastUsedDate: row.last_used_date,
      weeksSinceLast: row.weeks_since_last,
      score: parseFloat(row.score),
    }
  }

  return scores
})
