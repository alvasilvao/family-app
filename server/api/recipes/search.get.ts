export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)

  const query = getQuery(event)
  const q = (query.q as string || '').trim()

  if (!q) throw createError({ statusCode: 400, statusMessage: 'q parameter is required' })

  const { data, error } = await client.rpc('search_recipes', { search_query: q })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data || []
})
