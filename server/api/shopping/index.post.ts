export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const client = serverSupabaseClient(event)
  const body = await readBody(event)

  const name = validateString(body?.name, 'name', 500)
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Item name is required' })
  }

  const { data, error } = await client
    .from('grocery_items')
    .insert({ name, added_by: userId })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
