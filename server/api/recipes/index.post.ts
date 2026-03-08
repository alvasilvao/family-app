export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  const userId = await requireAuth(event)
  const body = await readBody(event)

  const validated = validateRecipeBody(body)

  // Insert recipe
  const { data: recipe, error: recipeErr } = await client
    .from('recipes')
    .insert({ ...buildRecipeRow(validated), user_id: userId })
    .select()
    .single()

  if (recipeErr || !recipe) {
    throw createError({ statusCode: 500, statusMessage: recipeErr?.message || 'Failed to create recipe' })
  }

  // Insert ingredients
  const ingredientRows = buildIngredientRows(validated.ingredients, recipe.id)

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
