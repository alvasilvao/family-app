export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  const { data, error } = await client
    .from('recipes')
    .select('*, ingredients(*)')
    .eq('id', id!)
    .single()

  if (error) throw createError({ statusCode: error.code === 'PGRST116' ? 404 : 500, statusMessage: error.message })

  return data
})
