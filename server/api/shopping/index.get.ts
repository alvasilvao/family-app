export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)

  const { data, error } = await client
    .from('grocery_items')
    .select('*')
    .order('bought_at', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
