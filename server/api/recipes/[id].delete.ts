export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing recipe id' })

  // Clean up storage image if exists
  const { data: recipe } = await client
    .from('recipes')
    .select('image_path')
    .eq('id', id)
    .single()

  if (recipe?.image_path) {
    await client.storage.from(RECIPE_IMAGES_BUCKET).remove([recipe.image_path])
  }

  // RLS ensures only own non-built-in recipes can be deleted
  const { error } = await client.from('recipes').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { success: true }
})
