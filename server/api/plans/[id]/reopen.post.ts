export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing plan id' })

  // Check plan exists and is closed
  const { data: plan, error: planError } = await client
    .from('meal_plans')
    .select('id, status')
    .eq('id', id)
    .single()

  if (planError || !plan) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  if (plan.status === 'open') throw createError({ statusCode: 400, statusMessage: 'Plan is already open' })

  // Reopen the plan and reset bought_ingredients
  const { data, error } = await client
    .from('meal_plans')
    .update({ status: 'open', bought_ingredients: {}, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
