export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const body = await readBody(event)

  const { plan_id, ingredient_key } = body || {}
  if (!plan_id || !ingredient_key) {
    throw createError({ statusCode: 400, statusMessage: 'plan_id and ingredient_key are required' })
  }

  // Get current bought_ingredients
  const { data: plan, error: planError } = await client
    .from('meal_plans')
    .select('id, bought_ingredients')
    .eq('id', plan_id)
    .eq('status', 'closed')
    .single()

  if (planError || !plan) throw createError({ statusCode: 404, statusMessage: 'Closed plan not found' })

  const bought = { ...((plan.bought_ingredients || {}) as Record<string, string | null>) }

  // Toggle: if already bought, unbuy; otherwise mark bought now
  if (bought[ingredient_key]) {
    delete bought[ingredient_key]
  } else {
    bought[ingredient_key] = new Date().toISOString()
  }

  const { error } = await client
    .from('meal_plans')
    .update({ bought_ingredients: bought })
    .eq('id', plan_id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { plan_id, ingredient_key, bought_at: bought[ingredient_key] || null }
})
