export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing item id' })

  // Fetch current state to toggle
  const { data: existing, error: fetchError } = await client
    .from('grocery_items')
    .select('bought_at')
    .eq('id', id)
    .single()

  if (fetchError) throw createError({ statusCode: 404, statusMessage: 'Item not found' })

  const bought_at = existing.bought_at ? null : new Date().toISOString()

  const { data, error } = await client
    .from('grocery_items')
    .update({ bought_at })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
