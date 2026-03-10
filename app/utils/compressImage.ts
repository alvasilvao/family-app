/**
 * Compress an image file to JPEG, scaling down to max 1200px on longest side.
 */
export async function compressImage(file: File, maxSize = 1200, quality = 0.8): Promise<Blob> {
  const img = await createImageBitmap(file)
  let { width, height } = img

  if (width > maxSize || height > maxSize) {
    const ratio = maxSize / Math.max(width, height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)
  img.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to compress image'))
      },
      'image/jpeg',
      quality,
    )
  })
}
