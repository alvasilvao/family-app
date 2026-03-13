export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)

  const { data, error } = await client
    .from('favorite_ingredients')
    .select('*')
    .order('name')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
