export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const body = await readBody(event)
  const name = validateString(body?.name, 'name', 500)
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  const category = categorizeByName(name)

  const { data, error } = await client
    .from('favorite_ingredients')
    .update({ name, category })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    handleDuplicateError(error, 'Already in favorites')
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return data
})
