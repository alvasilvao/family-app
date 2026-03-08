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
