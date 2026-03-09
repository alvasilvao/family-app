export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing plan id' })

  const { data, error } = await client
    .from('meal_plans')
    .select('id, name, start_date, end_date, basket, status, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  return data
})
