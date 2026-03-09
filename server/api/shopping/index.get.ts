export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  // Fetch manual items and closed plans in parallel
  const [manualResult, plansResult] = await Promise.all([
    client
      .from('grocery_items')
      .select('*')
      .or(`bought_at.is.null,bought_at.gte.${oneHourAgo}`)
      .order('bought_at', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false }),
    client
      .from('meal_plans')
      .select('id, name, basket, bought_ingredients')
      .eq('status', 'closed')
      .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  if (manualResult.error) throw createError({ statusCode: 500, statusMessage: manualResult.error.message })
  if (plansResult.error) throw createError({ statusCode: 500, statusMessage: plansResult.error.message })

  const manualItems = (manualResult.data || []).map((item: any) => ({
    ...item,
    type: 'manual' as const,
  }))

  const plans = plansResult.data || []
  if (plans.length === 0) return manualItems

  // Collect all recipe IDs across closed plans
  const allRecipeIds = new Set<string>()
  for (const plan of plans) {
    const basket = (plan.basket || {}) as Record<string, number>
    for (const [rid, servings] of Object.entries(basket)) {
      if (servings > 0) allRecipeIds.add(rid)
    }
  }

  if (allRecipeIds.size === 0) return manualItems

  // Batch-fetch ingredients for all recipes
  const { data: ingredients, error: ingError } = await client
    .from('ingredients')
    .select('name, unit, per_serving, recipe_id')
    .in('recipe_id', Array.from(allRecipeIds))

  if (ingError) throw createError({ statusCode: 500, statusMessage: ingError.message })
  if (!ingredients || ingredients.length === 0) return manualItems

  // Build plan items
  const planItems: any[] = []

  for (const plan of plans) {
    const basket = (plan.basket || {}) as Record<string, number>
    const boughtIngredients = (plan.bought_ingredients || {}) as Record<string, string>

    // Aggregate quantities for this plan
    const totals: Record<string, number> = {}
    for (const ing of ingredients) {
      const servings = basket[ing.recipe_id] || 0
      if (!servings) continue
      const qty = ing.per_serving * servings
      const key = `${ing.name}||${ing.unit}`
      totals[key] = (totals[key] || 0) + qty
    }

    for (const [key, qty] of Object.entries(totals)) {
      const [name, unit] = key.split('||')
      const rounded = Math.round(qty * 10) / 10
      const boughtAt = boughtIngredients[key] || null

      // Apply same bought/1h filter
      if (boughtAt && boughtAt < oneHourAgo) continue

      planItems.push({
        id: `plan:${plan.id}:${key}`,
        name: `${name} - ${rounded} ${unit}`,
        type: 'plan' as const,
        plan_id: plan.id,
        plan_name: plan.name,
        ingredient_key: key,
        bought_at: boughtAt,
      })
    }
  }

  // Merge: unbought first (plans then manual), then bought
  const allItems = [...manualItems, ...planItems]
  allItems.sort((a, b) => {
    // Unbought before bought
    if (!a.bought_at && b.bought_at) return -1
    if (a.bought_at && !b.bought_at) return 1
    return 0
  })

  return allItems
})
