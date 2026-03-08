export interface IngredientItem {
  name: string
  unit: string
  qty: number
}

export interface GrocerySection {
  label: string
  icon: string
  items: IngredientItem[]
}

export const SECTIONS = [
  { label: 'Produce', icon: '🥦', keys: ['lemon', 'lime', 'cucumber', 'avocado', 'spinach', 'broccoli', 'tomato', 'pepper', 'onion', 'cabbage', 'ginger', 'basil', 'coriander', 'thyme', 'rosemary', 'lemongrass', 'chili', 'aubergine', 'spring onion', 'shallot', 'garlic', 'cilantro', 'parsley'] },
  { label: 'Proteins', icon: '🥩', keys: ['chicken', 'beef', 'salmon', 'egg', 'fish', 'prawn', 'tofu', 'bean', 'tuna', 'pork', 'lamb', 'chickpea', 'cannellini', 'halloumi'] },
  { label: 'Dairy & Eggs', icon: '🥛', keys: ['cream', 'parmesan', 'cheese', 'butter', 'milk', 'feta', 'yogurt'] },
  { label: 'Grains & Pasta', icon: '🌾', keys: ['rice', 'pasta', 'bread', 'flour', 'arborio', 'pappardelle', 'tortilla', 'noodle', 'oat', 'pita'] },
  { label: 'Pantry & Spices', icon: '🧂', keys: ['sauce', 'oil', 'vinegar', 'honey', 'mirin', 'stock', 'wine', 'paste', 'paprika', 'cumin', 'sesame', 'soy', 'oyster', 'fish sauce', 'coconut', 'crushed', 'sun-dried', 'garam', 'curry', 'tahini', 'salt', 'pepper flakes', 'broth', 'oregano'] },
]

export function aggregateIngredients(
  basket: Record<string, number>,
  recipes: Array<{ id: string; ingredients: Array<{ name: string; unit: string; perServing: number }> }>,
): IngredientItem[] {
  const totals: Record<string, number> = {}
  for (const [id, servings] of Object.entries(basket)) {
    if (!servings) continue
    const recipe = recipes.find((r) => String(r.id) === String(id))
    if (!recipe) continue
    for (const ing of recipe.ingredients) {
      const qty = ing.perServing * servings
      const key = `${ing.name}||${ing.unit}`
      totals[key] = (totals[key] || 0) + qty
    }
  }
  return Object.entries(totals).map(([key, qty]) => {
    const [name, unit] = key.split('||')
    return { name, unit, qty: Math.round(qty * 10) / 10 }
  })
}

export function groupIngredients(items: IngredientItem[]): GrocerySection[] {
  const grouped: Record<string, IngredientItem[]> = {}
  SECTIONS.forEach((s) => {
    grouped[s.label] = []
  })
  grouped['Other'] = []

  items.forEach((item) => {
    const k = item.name.toLowerCase()
    const section = SECTIONS.find((s) => s.keys.some((key) => k.includes(key)))
    grouped[section ? section.label : 'Other'].push(item)
  })

  return Object.entries(grouped)
    .filter(([, v]) => v.length > 0)
    .map(([label, sectionItems]) => ({
      label,
      icon: SECTIONS.find((s) => s.label === label)?.icon || '🛍️',
      items: sectionItems.sort((a, b) => a.name.localeCompare(b.name)),
    }))
}
