export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)

  const query = getQuery(event)
  const limit = query.limit ? parseInt(query.limit as string) : null
  const offset = query.offset ? parseInt(query.offset as string) : 0

  if (limit !== null && (!Number.isInteger(limit) || limit < 1))
    throw createError({ statusCode: 400, statusMessage: 'limit must be a positive integer' })
  if (!Number.isInteger(offset) || offset < 0)
    throw createError({ statusCode: 400, statusMessage: 'offset must be a non-negative integer' })

  let q = client
    .from('meal_plans')
    .select('id, name, start_date, end_date, basket, cooked, status, created_at, updated_at', limit ? { count: 'exact' } : {})
    .order('start_date', { ascending: false })

  if (limit) {
    q = q.range(offset, offset + limit - 1)
  }

  const { data, error, count } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return limit ? { data, total: count } : data
})
