export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const title = validateString(body?.title, 'title', 500)
  const noteBody = validateString(body?.body, 'body', 50000)

  const { data, error } = await client
    .from('notes')
    .update({ title, body: noteBody, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
