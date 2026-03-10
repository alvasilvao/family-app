export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const title = validateString(body?.title, 'title', 500)
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const { data, error } = await client
    .from('todos')
    .update({ title, due_date: body?.due_date ?? null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
