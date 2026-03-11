export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const client = serverSupabaseClient(event)
  const body = await readBody(event)

  const { tmdbId, mediaType, title, overview, posterPath, releaseDate, status } = body

  if (!tmdbId || !mediaType || !title) {
    throw createError({ statusCode: 400, statusMessage: 'tmdbId, mediaType, and title are required' })
  }
  if (!['movie', 'tv'].includes(mediaType)) {
    throw createError({ statusCode: 400, statusMessage: 'mediaType must be "movie" or "tv"' })
  }
  const watchStatus = status === 'watched' ? 'watched' : 'want_to_watch'

  const { data, error } = await client
    .from('media_watchlist')
    .insert({
      user_id: userId,
      tmdb_id: tmdbId,
      media_type: mediaType,
      title: validateString(title, 'title', 500),
      overview: validateString(overview || '', 'overview', 2000),
      poster_path: posterPath || '',
      release_date: releaseDate || '',
      status: watchStatus,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'This title is already in your watchlist' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return data
})
