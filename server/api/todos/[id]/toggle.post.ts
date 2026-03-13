export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  // Fetch current state
  const { data: existing, error: fetchError } = await client
    .from('todos')
    .select('completed_at')
    .eq('id', id)
    .single()

  if (fetchError) throw createError({ statusCode: 500, statusMessage: fetchError.message })

  const completedAt = existing.completed_at ? null : new Date().toISOString()

  const { data, error } = await client
    .from('todos')
    .update({ completed_at: completedAt, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
