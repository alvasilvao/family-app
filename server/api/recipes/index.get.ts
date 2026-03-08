export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await ensureUser(event)

  // RLS handles filtering: built-in + own recipes
  const { data: recipes, error } = await client
    .from('recipes')
    .select('*, ingredients(*)')
    .order('created_at', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return recipes
})
