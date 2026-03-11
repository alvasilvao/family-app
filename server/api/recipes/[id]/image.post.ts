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

  // Validate size
  if (filePart.data.length > MAX_IMAGE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'Image must be under 5MB' })
  }

  // Validate image type via magic bytes (don't trust client-provided MIME)
  const header = filePart.data.subarray(0, 12)
  const isJPEG = header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF
  const isPNG = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47
  const isWebP = header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50
  if (!isJPEG && !isPNG && !isWebP) {
    throw createError({ statusCode: 400, statusMessage: 'File must be a JPEG, PNG, or WebP image' })
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
  const { error: updateErr, count } = await client
    .from('recipes')
    .update({ image_path: storagePath })
    .eq('id', id)
    .select('id', { count: 'exact', head: true })
  if (updateErr) {
    throw createError({ statusCode: 500, statusMessage: updateErr.message })
  }
  if (count === 0) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot update this recipe (built-in or not owned by you)' })
  }

  // Return full recipe
  const { data: full, error: selectErr } = await client
    .from('recipes')
    .select('*, ingredients(*)')
    .eq('id', id)
    .single()
  if (selectErr || !full) {
    throw createError({ statusCode: 500, statusMessage: selectErr?.message ?? 'Failed to fetch updated recipe' })
  }

  return full
})
