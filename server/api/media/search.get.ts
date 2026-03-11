export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const search = (query.query as string || '').trim()

  if (!search) {
    throw createError({ statusCode: 400, statusMessage: 'query parameter is required' })
  }

  const config = useRuntimeConfig()
  if (!config.tmdbApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'TMDB API key not configured' })
  }

  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(search)}&include_adult=false&language=en-US&page=1`

  const data = await $fetch<{ results: any[] }>(url, {
    headers: { Authorization: `Bearer ${config.tmdbApiKey}` },
  })

  // Filter to only movies and TV shows, return clean shape
  const results = (data.results || [])
    .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
    .slice(0, 20)
    .map((item: any) => ({
      tmdbId: item.id,
      mediaType: item.media_type,
      title: item.media_type === 'movie' ? item.title : item.name,
      overview: item.overview || '',
      posterPath: item.poster_path || '',
      releaseDate: item.media_type === 'movie' ? (item.release_date || '') : (item.first_air_date || ''),
    }))

  return results
})
