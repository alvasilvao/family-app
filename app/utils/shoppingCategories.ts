import type { ShoppingItem } from '~/composables/useShopping'

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
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
    'brie', 'mascarpone', 'sour cream', 'cr??me fra', 'creme frai',
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
    'mayonnaise', 'honey', 'sugar', 'salt', 'pepper', 'spice',
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

export const CATEGORY_ORDER = ['Produce', 'Dairy & Eggs', 'Meat & Fish', 'Grains & Bread', 'Pantry', 'Other']

export function getIngredientName(item: ShoppingItem): string {
  // Plan items have format "Name - qty unit", manual items are just the name
  if (item.type === 'plan') {
    const dashIdx = item.name.lastIndexOf(' - ')
    return dashIdx > 0 ? item.name.substring(0, dashIdx) : item.name
  }
  return item.name
}

export function categorize(item: ShoppingItem): string {
  const name = getIngredientName(item).toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => name.includes(kw))) return category
  }
  return 'Other'
}
