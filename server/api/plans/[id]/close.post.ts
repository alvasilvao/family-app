export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing plan id' })

  // Get the plan
  const { data: plan, error: planError } = await client
    .from('meal_plans')
    .select('id, status')
    .eq('id', id)
    .single()

  if (planError || !plan) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  if (plan.status === 'closed') throw createError({ statusCode: 400, statusMessage: 'Plan is already closed' })

  // Mark plan as closed
  const { data, error } = await client
    .from('meal_plans')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
