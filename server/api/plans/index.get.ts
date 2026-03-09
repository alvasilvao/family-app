export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)

  const { data, error } = await client
    .from('meal_plans')
    .select('id, name, start_date, end_date, basket, status, created_at, updated_at')
    .order('start_date', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
