const SECTIONS = [
  { label: 'Produce', icon: '🥦', keys: ['lemon', 'lime', 'cucumber', 'avocado', 'spinach', 'broccoli', 'tomato', 'pepper', 'onion', 'cabbage', 'ginger', 'basil', 'coriander', 'thyme', 'rosemary', 'lemongrass', 'chili', 'aubergine', 'spring onion', 'shallot', 'garlic', 'cilantro', 'parsley'] },
  { label: 'Proteins', icon: '🥩', keys: ['chicken', 'beef', 'salmon', 'egg', 'fish', 'prawn', 'tofu', 'bean', 'tuna', 'pork', 'lamb', 'chickpea', 'cannellini', 'halloumi'] },
  { label: 'Dairy & Eggs', icon: '🥛', keys: ['cream', 'parmesan', 'cheese', 'butter', 'milk', 'feta', 'yogurt'] },
  { label: 'Grains & Pasta', icon: '🌾', keys: ['rice', 'pasta', 'bread', 'flour', 'arborio', 'pappardelle', 'tortilla', 'noodle', 'oat', 'pita'] },
  { label: 'Pantry & Spices', icon: '🧂', keys: ['sauce', 'oil', 'vinegar', 'honey', 'mirin', 'stock', 'wine', 'paste', 'paprika', 'cumin', 'sesame', 'soy', 'oyster', 'fish sauce', 'coconut', 'crushed', 'sun-dried', 'garam', 'curry', 'tahini', 'salt', 'pepper flakes', 'broth', 'oregano'] },
]

interface IngredientItem { name: string; unit: string; qty: number }

export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await ensureUser(event)
  const weekKey = getRouterParam(event, 'weekKey')
  if (!weekKey) throw createError({ statusCode: 400, statusMessage: 'Missing weekKey' })

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
