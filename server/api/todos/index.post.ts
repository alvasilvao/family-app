export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const client = serverSupabaseClient(event)
  const body = await readBody(event)

  const title = validateString(body?.title, 'title', 500)
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const dueDate = body?.due_date || null

  const { data, error } = await client
    .from('todos')
    .insert({ title, due_date: dueDate, created_by: userId })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
