export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  const userId = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing recipe id' })

  // Read multipart form data
  const formData = await readMultipartFormData(event)
  const filePart = formData?.find((p) => p.name === 'image')
  if (!filePart || !filePart.data) {
    throw createError({ statusCode: 400, statusMessage: 'No image provided' })
  }

  // Validate type and size
  const mime = filePart.type || ''
  if (!mime.startsWith('image/')) {
    throw createError({ statusCode: 400, statusMessage: 'File must be an image' })
  }
  if (filePart.data.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: 'Image must be under 5MB' })
  }

  const storagePath = `${userId}/${id}.jpg`

  // Upload to storage (upsert replaces existing)
  const { error: uploadErr } = await client.storage
    .from('recipe-images')
    .upload(storagePath, filePart.data, {
      contentType: 'image/jpeg',
      upsert: true,
    })
  if (uploadErr) {
    throw createError({ statusCode: 500, statusMessage: uploadErr.message })
  }

  // Update recipe row
  const { error: updateErr } = await client
    .from('recipes')
    .update({ image_path: storagePath })
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
