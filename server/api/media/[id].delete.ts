export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  const { error } = await client
    .from('media_watchlist')
    .delete()
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { success: true }
})
