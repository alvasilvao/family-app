export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const client = serverSupabaseClient(event)
  const body = await readBody(event)

  const url = validateString(body?.url, 'url', 2000)
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'URL is required' })
  }
  if (!/^https?:\/\/.+/.test(url)) {
    throw createError({ statusCode: 400, statusMessage: 'URL must start with http:// or https://' })
  }

  const title = validateString(body?.title, 'title', 500)
  const note = validateString(body?.note, 'note', 2000)

  const { data, error } = await client
    .from('recipe_links')
    .insert({ url, title, note, created_by: userId })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
