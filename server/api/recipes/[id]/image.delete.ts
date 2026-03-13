export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing recipe id' })

  // Get current image_path
  const { data: recipe } = await client
    .from('recipes')
    .select('image_path')
    .eq('id', id)
    .single()

  if (recipe?.image_path) {
    // Delete from storage
    await client.storage.from(RECIPE_IMAGES_BUCKET).remove([recipe.image_path])
  }

  // Clear image_path on recipe
  const { error: updateErr } = await client
    .from('recipes')
    .update({ image_path: null })
    .eq('id', id)
  if (updateErr) {
    throw createError({ statusCode: 500, statusMessage: updateErr.message })
  }

  // Return full recipe
  const { data: full } = await client
    .from('recipes')
    .select('*, ingredients(*)')
    .eq('id', id)
    .single()

  return full
})
