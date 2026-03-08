const WEEK_KEY_RE = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/

export function validateWeekKey(weekKey: string | undefined): string {
  if (!weekKey) {
    throw createError({ statusCode: 400, statusMessage: 'Missing weekKey' })
  }
  if (!WEEK_KEY_RE.test(weekKey)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid weekKey format' })
  }
  return weekKey
}

export function validateString(value: unknown, field: string, maxLen = 2000): string {
  if (typeof value !== 'string') return ''
  if (value.length > maxLen) {
    throw createError({ statusCode: 400, statusMessage: `${field} exceeds max length of ${maxLen}` })
  }
  return value
}

export function validateRecipeBody(body: any) {
  const { name, cookTime, description, tags, emoji, color, sourceUrl, instructions, ingredients } = body

  if (!name || typeof name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Recipe name is required' })
  }

  validateString(name, 'name', 2000)
  validateString(cookTime, 'cookTime', 100)
  validateString(description, 'description', 2000)
  validateString(emoji, 'emoji', 20)
  validateString(color, 'color', 20)
  validateString(sourceUrl, 'sourceUrl', 2000)
  validateString(instructions, 'instructions', 10000)

  if (tags != null) {
    if (!Array.isArray(tags) || tags.length > 50) {
      throw createError({ statusCode: 400, statusMessage: 'Tags must be an array of up to 50 items' })
    }
    for (const tag of tags) {
      validateString(tag, 'tag', 100)
    }
  }

  if (!ingredients || !Array.isArray(ingredients)) {
    throw createError({ statusCode: 400, statusMessage: 'Ingredients array is required' })
  }
  if (ingredients.length === 0 || ingredients.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Ingredients must have 1-200 items' })
  }

  for (const ing of ingredients) {
    if (!ing.name || typeof ing.name !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Each ingredient must have a name' })
    }
    validateString(ing.name, 'ingredient name', 200)
    validateString(ing.unit, 'ingredient unit', 50)

    if (typeof ing.perServing !== 'number' || !isFinite(ing.perServing) || ing.perServing <= 0) {
      throw createError({ statusCode: 400, statusMessage: `Invalid perServing for "${ing.name}": must be a positive number` })
    }
  }

  return { name, cookTime, description, tags, emoji, color, sourceUrl, instructions, ingredients }
}
