import { SECTIONS, type IngredientItem } from '~~/shared/utils/ingredients'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await requireAuth(event)
  const weekKey = validateWeekKey(getRouterParam(event, 'weekKey'))

  // Get plan
  const { data: plan } = await client
    .from('weekly_plans')
    .select('basket')
    .eq('week_key', weekKey)
    .maybeSingle()

  const basket = (plan?.basket || {}) as Record<string, number>
  const recipeIds = Object.keys(basket).filter((id) => basket[id] > 0)
  if (recipeIds.length === 0) return { sections: [] }

  // Get ingredients for selected recipes
  const { data: ingredients } = await client
    .from('ingredients')
    .select('name, unit, per_serving, recipe_id')
    .in('recipe_id', recipeIds)

  if (!ingredients) return { sections: [] }

  // Aggregate
  const totals: Record<string, number> = {}
  for (const ing of ingredients) {
    const servings = basket[ing.recipe_id] || 0
    if (!servings) continue
    const qty = ing.per_serving * servings
    const key = `${ing.name}||${ing.unit}`
    totals[key] = (totals[key] || 0) + qty
  }

  const items: IngredientItem[] = Object.entries(totals).map(([key, qty]) => {
    const [name, unit] = key.split('||')
    return { name, unit, qty: Math.round(qty * 10) / 10 }
  })

  // Group by aisle
  const grouped: Record<string, IngredientItem[]> = {}
  SECTIONS.forEach((s) => { grouped[s.label] = [] })
  grouped['Other'] = []

  items.forEach((item) => {
    const k = item.name.toLowerCase()
    const section = SECTIONS.find((s) => s.keys.some((key) => k.includes(key)))
    grouped[section ? section.label : 'Other'].push(item)
  })

  const sections = Object.entries(grouped)
    .filter(([, v]) => v.length > 0)
    .map(([label, sectionItems]) => ({
      label,
      icon: SECTIONS.find((s) => s.label === label)?.icon || '🛍️',
      items: sectionItems.sort((a, b) => a.name.localeCompare(b.name)),
    }))

  return { sections }
})
