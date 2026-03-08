export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing recipe id' })

  const body = await readBody(event)
  const { name, cookTime, description, tags, emoji, color, sourceUrl, instructions, ingredients } = validateRecipeBody(body)

  // Update recipe (RLS ensures only own non-built-in recipes)
  const { error: recipeErr } = await client
    .from('recipes')
    .update({
      name,
      cook_time: cookTime || '',
      description: description || '',
      tags: tags || [],
      emoji: emoji || '🥘',
      color: color || '#7ba7a7',
      source_url: sourceUrl || '',
      instructions: instructions || '',
    })
    .eq('id', id)

  if (recipeErr) {
    throw createError({ statusCode: 500, statusMessage: recipeErr.message })
  }

  // Delete old ingredients and insert new ones
  const { error: delErr } = await client.from('ingredients').delete().eq('recipe_id', id)
  if (delErr) throw createError({ statusCode: 500, statusMessage: delErr.message })

  const ingredientRows = ingredients.map((ing: { name: string; unit: string; perServing: number }) => ({
    name: ing.name,
    unit: ing.unit,
    per_serving: ing.perServing,
    recipe_id: id,
  }))

  const { error: ingErr } = await client.from('ingredients').insert(ingredientRows)
  if (ingErr) throw createError({ statusCode: 500, statusMessage: ingErr.message })

  // Return full recipe with ingredients
  const { data: full } = await client
    .from('recipes')
    .select('*, ingredients(*)')
    .eq('id', id)
    .single()

  return full
})
