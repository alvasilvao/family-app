export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing recipe id' })

  const body = await readBody(event)
  const validated = validateRecipeBody(body)

  // Update recipe (RLS ensures only own non-built-in recipes)
  const { error: recipeErr } = await client
    .from('recipes')
    .update(buildRecipeRow(validated))
    .eq('id', id)

  if (recipeErr) {
    throw createError({ statusCode: 500, statusMessage: recipeErr.message })
  }

  // Delete old ingredients and insert new ones
  const { error: delErr } = await client.from('ingredients').delete().eq('recipe_id', id)
  if (delErr) throw createError({ statusCode: 500, statusMessage: delErr.message })

  const ingredientRows = buildIngredientRows(validated.ingredients, id)

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
