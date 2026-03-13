const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Produce': [
    'tomato', 'onion', 'garlic', 'pepper', 'carrot', 'potato', 'lettuce', 'spinach',
    'broccoli', 'zucchini', 'cucumber', 'celery', 'mushroom', 'avocado', 'lemon',
    'lime', 'ginger', 'basil', 'cilantro', 'parsley', 'mint', 'thyme', 'rosemary',
    'oregano', 'dill', 'chive', 'scallion', 'shallot', 'leek', 'cabbage', 'kale',
    'arugula', 'beetroot', 'beet', 'radish', 'turnip', 'squash', 'pumpkin',
    'eggplant', 'aubergine', 'corn', 'pea', 'bean sprout', 'spring onion',
    'apple', 'banana', 'orange', 'berry', 'strawberr', 'blueberr', 'raspberr',
    'mango', 'pineapple', 'grape', 'melon', 'watermelon', 'peach', 'pear',
    'plum', 'cherry', 'fig', 'date', 'pomegranate', 'kiwi', 'papaya',
    'fennel', 'artichoke', 'asparagus', 'chard', 'endive', 'watercress',
    'coriander', 'sage', 'bay lea', 'tarragon', 'chili', 'jalape',
  ],
  'Dairy & Eggs': [
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'egg',
    'mozzarella', 'parmesan', 'cheddar', 'feta', 'ricotta', 'gouda',
    'brie', 'mascarpone', 'sour cream', 'creme frai',
    'whipping cream', 'cottage cheese', 'cream cheese', 'quark',
  ],
  'Meat & Fish': [
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'veal',
    'bacon', 'sausage', 'ham', 'salami', 'prosciutto', 'chorizo',
    'mince', 'ground meat', 'steak', 'fillet', 'filet', 'thigh', 'breast',
    'salmon', 'tuna', 'shrimp', 'prawn', 'cod', 'tilapia', 'trout',
    'sardine', 'anchov', 'mussel', 'clam', 'squid', 'octopus', 'crab',
    'lobster', 'mackerel', 'halibut', 'sea bass', 'haddock',
  ],
  'Grains & Bread': [
    'rice', 'pasta', 'bread', 'flour', 'noodle', 'oat', 'cereal',
    'tortilla', 'wrap', 'pita', 'couscous', 'quinoa', 'bulgur',
    'barley', 'polenta', 'cornmeal', 'semolina', 'spaghetti',
    'penne', 'fusilli', 'macaroni', 'lasagna', 'fettuccine',
    'ramen', 'udon', 'soba', 'gnocchi', 'cracker', 'breadcrumb',
    'panko', 'baguette', 'ciabatta', 'focaccia', 'sourdough',
    'croissant', 'brioche', 'muesli', 'granola',
  ],
  'Pantry': [
    'oil', 'vinegar', 'sauce', 'soy sauce', 'ketchup', 'mustard',
    'mayonnaise', 'honey', 'sugar', 'salt', 'spice',
    'cumin', 'paprika', 'turmeric', 'cinnamon', 'nutmeg', 'clove',
    'curry', 'chili flake', 'red pepper flake', 'cayenne',
    'vanilla', 'baking', 'yeast', 'cocoa', 'chocolate',
    'can', 'tinned', 'tomato paste', 'passata', 'stock', 'broth',
    'bouillon', 'coconut milk', 'coconut cream',
    'nut', 'almond', 'walnut', 'cashew', 'peanut', 'pistachio',
    'seed', 'sesame', 'sunflower', 'chia', 'flax', 'lentil',
    'chickpea', 'bean', 'kidney', 'black bean', 'white bean',
    'tahini', 'pesto', 'miso', 'fish sauce', 'oyster sauce',
    'worcestershire', 'hot sauce', 'sriracha', 'sambal',
    'jam', 'preserve', 'syrup', 'maple', 'molasses',
    'cornstarch', 'corn starch', 'gelatine', 'gelatin',
    'dried', 'canned', 'jarred',
  ],
}

function categorizeByName(name: string): string | null {
  const lower = name.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }
  return null
}

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const client = serverSupabaseClient(event)
  const body = await readBody(event)

  const name = validateString(body?.name, 'name', 500)
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  const category = categorizeByName(name)

  const { data, error } = await client
    .from('favorite_ingredients')
    .insert({ name, category, user_id: userId })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Already in favorites' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return data
})
