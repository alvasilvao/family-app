export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await readBody(event)

  const { url, text } = body as { url?: string; text?: string }

  if (!url && !text) {
    throw createError({ statusCode: 400, statusMessage: 'Either "url" or "text" is required' })
  }

  // URL-based import
  if (url) {
    // Basic URL validation
    try {
      new URL(url)
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
    }

    const html = await fetchRecipePage(url)
    if (!html) {
      // Return fetch_failed so the frontend can show the text fallback
      return { error: 'fetch_failed', message: 'Could not access that page. Try pasting the recipe text instead.' }
    }

    const pageText = htmlToText(html)
    if (pageText.length < 50) {
      return { error: 'fetch_failed', message: 'Page content was too short to extract a recipe. Try pasting the recipe text instead.' }
    }

    const recipe = await extractWithLlm(pageText, url)
    return { recipe }
  }

  // Text-based import (fallback)
  if (!text || text.trim().length < 20) {
    throw createError({ statusCode: 400, statusMessage: 'Please provide more recipe content to extract from' })
  }

  const recipe = await extractWithLlm(text.slice(0, 8000), '')
  return { recipe }
})
