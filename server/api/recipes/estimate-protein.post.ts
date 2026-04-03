import OpenAI from 'openai'

/**
 * Accepts a batch of ingredients and returns protein estimates via OpenAI.
 * Body: { ingredients: Array<{ id, name, unit, per_serving }> }
 * Returns: { estimates: Array<{ id, protein }> }
 */
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const config = useRuntimeConfig()
  if (!config.openaiApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'OpenAI API key is not configured' })
  }

  const body = await readBody(event)
  const ingredients = body?.ingredients
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'ingredients array is required' })
  }

  if (ingredients.length > 50) {
    throw createError({ statusCode: 400, statusMessage: 'Max 50 ingredients per batch' })
  }

  const ingredientList = ingredients
    .map((ing: any, i: number) => `${i + 1}. ${ing.per_serving}${ing.unit} ${ing.name}`)
    .join('\n')

  const prompt = `Estimate the protein (grams) for each ingredient at the given quantity per serving.
Return ONLY a JSON array of numbers, one per ingredient, in the same order. Use null if unknown.

Ingredients:
${ingredientList}`

  const openai = new OpenAI({ apiKey: config.openaiApiKey })

  const response = await openai.chat.completions.create({
    model: 'gpt-5-nano',
    reasoning_effort: 'low' as any,
    messages: [{ role: 'user', content: prompt }],
  }, { timeout: 60_000 })

  const text = response.choices[0]?.message?.content?.trim()
  if (!text) {
    throw createError({ statusCode: 502, statusMessage: 'LLM returned empty response' })
  }

  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')

  let proteinValues: (number | null)[]
  try {
    proteinValues = JSON.parse(cleaned)
    if (!Array.isArray(proteinValues)) throw new Error()
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Failed to parse LLM response' })
  }

  // Map what we can — if AI returns fewer values, remaining get null
  const estimates = ingredients.map((ing: any, i: number) => ({
    id: ing.id,
    protein: i < proteinValues.length && typeof proteinValues[i] === 'number' && proteinValues[i]! >= 0
      ? proteinValues[i]
      : null,
  }))

  return { estimates }
})
