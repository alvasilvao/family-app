export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const body = await readBody(event)

  const title = validateString(body?.title, 'title', 500)
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const dueDate = body?.due_date || null
  if (dueDate) validateDate(dueDate, 'due_date')

  const { data, error } = await client
    .from('todos')
    .update({ title, due_date: dueDate, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
