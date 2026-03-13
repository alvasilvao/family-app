export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)

  // Fetch all meal plans that have cooked entries
  const { data: plans, error } = await client
    .from('meal_plans')
    .select('id, name, start_date, end_date, cooked, basket')
    .order('start_date', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Collect all recipe IDs that were cooked
  const cookedRecipeIds = new Set<string>()
  for (const plan of plans || []) {
    if (!plan.cooked) continue
    for (const [recipeId, cookedVal] of Object.entries(plan.cooked)) {
      if (cookedVal) cookedRecipeIds.add(recipeId)
    }
  }

  if (cookedRecipeIds.size === 0) return []

  // Fetch recipe details for cooked recipes
  const { data: recipes, error: recipeError } = await client
    .from('recipes')
    .select('id, name, emoji, color, image_path, tags')
    .in('id', Array.from(cookedRecipeIds))

  if (recipeError) throw createError({ statusCode: 500, statusMessage: recipeError.message })

  const recipeMap = new Map((recipes || []).map((r) => [r.id, r]))

  // Build history entries
  const history = []
  for (const plan of plans || []) {
    if (!plan.cooked) continue
    for (const [recipeId, cookedVal] of Object.entries(plan.cooked)) {
      if (!cookedVal) continue
      const recipe = recipeMap.get(recipeId)
      if (!recipe) continue
      // Use cooked timestamp if available (string), otherwise fall back to plan start_date
      const cookedDate = typeof cookedVal === 'string' ? cookedVal.slice(0, 10) : plan.start_date
      history.push({
        recipe_id: recipeId,
        recipe_name: recipe.name,
        recipe_emoji: recipe.emoji,
        recipe_color: recipe.color,
        recipe_image_path: recipe.image_path,
        recipe_tags: recipe.tags,
        plan_id: plan.id,
        plan_name: plan.name,
        date: cookedDate,
        servings: plan.basket?.[recipeId] || null,
      })
    }
  }

  // Sort by date descending
  history.sort((a, b) => b.date.localeCompare(a.date))

  return history
})
