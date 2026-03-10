export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const body = await readBody(event)

  const { items } = body || {}
  if (!Array.isArray(items) || items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'items array is required' })
  }
  if (items.length > MAX_BULK_TOGGLE_ITEMS) {
    throw createError({ statusCode: 400, statusMessage: `Too many items (max ${MAX_BULK_TOGGLE_ITEMS})` })
  }

  const now = new Date().toISOString()

  // Separate manual and plan items
  const manualIds: string[] = []
  const planIngredients: Array<{ plan_id: string; ingredient_key: string }> = []

  for (const item of items) {
    if (item.type === 'plan' && item.plan_id && item.ingredient_key) {
      planIngredients.push({ plan_id: item.plan_id, ingredient_key: item.ingredient_key })
    } else if (item.type === 'manual' && item.id) {
      manualIds.push(item.id)
    }
  }

  // Bulk update manual items
  if (manualIds.length > 0) {
    const { error } = await client
      .from('grocery_items')
      .update({ bought_at: now })
      .in('id', manualIds)
      .is('bought_at', null)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // Bulk update plan ingredients (grouped by plan_id)
  const byPlan = new Map<string, string[]>()
  for (const pi of planIngredients) {
    if (!byPlan.has(pi.plan_id)) byPlan.set(pi.plan_id, [])
    byPlan.get(pi.plan_id)!.push(pi.ingredient_key)
  }

  for (const [planId, keys] of byPlan) {
    const { data: plan, error: planError } = await client
      .from('meal_plans')
      .select('id, bought_ingredients')
      .eq('id', planId)
      .eq('status', 'closed')
      .single()

    if (planError || !plan) continue

    const bought = { ...((plan.bought_ingredients || {}) as Record<string, string | null>) }
    for (const key of keys) {
      if (!bought[key]) bought[key] = now
    }

    await client
      .from('meal_plans')
      .update({ bought_ingredients: bought })
      .eq('id', planId)
  }

  return { ok: true, bought_at: now }
})
