export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const body = await readBody(event)

  const name = validateString(body?.name, 'name', 200)
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Plan name is required' })
  }

  const startDate = body?.start_date
  const endDate = body?.end_date
  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, statusMessage: 'start_date and end_date are required' })
  }

  validateDate(startDate, 'start_date')
  validateDate(endDate, 'end_date')

  if (startDate > endDate) {
    throw createError({ statusCode: 400, statusMessage: 'start_date must be before or equal to end_date' })
  }

  const { data, error } = await client
    .from('meal_plans')
    .insert({ name, start_date: startDate, end_date: endDate })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
