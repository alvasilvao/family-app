export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing plan id' })

  const body = await readBody(event)
  const addToShopping = body?.addToShopping !== false

  // Get the plan
  const { data: plan, error: planError } = await client
    .from('meal_plans')
    .select('id, status')
    .eq('id', id)
    .single()

  if (planError || !plan) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  if (plan.status !== 'open') throw createError({ statusCode: 400, statusMessage: plan.status === 'cooked' ? 'Plan is already cooked' : 'Plan is already closed' })

  // Mark plan as closed
  const status = addToShopping ? 'closed' : 'closed_no_shop'
  const { data, error } = await client
    .from('meal_plans')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
