export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  const userId = await requireAuth(event)
  const body = await readBody(event)

  const { name, cookTime, description, tags, emoji, color, ingredients } = body
  if (!name || !ingredients || !Array.isArray(ingredients)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid recipe data' })
  }

  // Insert recipe
  const { data: recipe, error: recipeErr } = await client
    .from('recipes')
    .insert({
      name,
      cook_time: cookTime || '',
      description: description || '',
      tags: tags || [],
      emoji: emoji || '🥘',
      color: color || '#7ba7a7',
      user_id: userId,
    })
    .select()
    .single()

  if (recipeErr || !recipe) {
    throw createError({ statusCode: 500, statusMessage: recipeErr?.message || 'Failed to create recipe' })
  }

  // Insert ingredients
  const ingredientRows = ingredients.map((ing: { name: string; unit: string; perServing: number }) => ({
    name: ing.name,
    unit: ing.unit,
    per_serving: ing.perServing,
    recipe_id: recipe.id,
  }))

  const { error: ingErr } = await client.from('ingredients').insert(ingredientRows)
  if (ingErr) {
    // Clean up recipe if ingredients fail
    await client.from('recipes').delete().eq('id', recipe.id)
    throw createError({ statusCode: 500, statusMessage: ingErr.message })
  }

  // Return recipe with ingredients
  const { data: full } = await client
    .from('recipes')
    .select('*, ingredients(*)')
    .eq('id', recipe.id)
    .single()

  return full
})
