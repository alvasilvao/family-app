export interface TmdbSearchResult {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  title: string
  overview: string
  posterPath: string
  releaseDate: string
}

interface MediaRow {
  id: string
  user_id: string
  tmdb_id: number
  media_type: 'movie' | 'tv'
  title: string
  overview: string
  poster_path: string
  release_date: string
  status: 'watched' | 'want_to_watch'
  rating: number | null
  notes: string
  created_at: string
  updated_at: string
}

export interface MediaItem {
  id: string
  userId: string
  tmdbId: number
  mediaType: 'movie' | 'tv'
  title: string
  overview: string
  posterPath: string
  releaseDate: string
  status: 'watched' | 'want_to_watch'
  rating: number | null
  notes: string
  createdAt: string
}

function mapMedia(row: MediaRow): MediaItem {
  return {
    id: row.id,
    userId: row.user_id,
    tmdbId: row.tmdb_id,
    mediaType: row.media_type,
    title: row.title,
    overview: row.overview,
    posterPath: row.poster_path,
    releaseDate: row.release_date,
    status: row.status,
    rating: row.rating,
    notes: row.notes || '',
    createdAt: row.created_at,
  }
}

const mediaList = ref<MediaItem[]>([])
const loading = ref(true)

export function useMedia() {
  const { authFetch } = useAuth()
  const toast = useToast()

  const watched = computed(() => mediaList.value.filter((m) => m.status === 'watched'))
  const wantToWatch = computed(() => mediaList.value.filter((m) => m.status === 'want_to_watch'))

  async function fetchMedia() {
    loading.value = true
    try {
      const data = await authFetch<MediaRow[]>('/api/media')
      mediaList.value = data.map(mapMedia)
    } catch (err: unknown) {
      console.error('Failed to fetch media:', err)
      toast.error('Failed to load watchlist')
    } finally {
      loading.value = false
    }
  }

  async function searchTmdb(query: string): Promise<TmdbSearchResult[]> {
    return authFetch<TmdbSearchResult[]>(`/api/media/search?query=${encodeURIComponent(query)}`)
  }

  async function addMedia(item: TmdbSearchResult, status: 'watched' | 'want_to_watch') {
    const created = await authFetch<MediaRow>('/api/media', {
      method: 'POST',
      body: { ...item, status },
    })
    const mapped = mapMedia(created)
    mediaList.value = [mapped, ...mediaList.value]
    return mapped
  }

  async function updateMedia(id: string, updates: { status?: string; rating?: number | null; notes?: string }) {
    const updated = await authFetch<MediaRow>(`/api/media/${id}`, {
      method: 'PUT',
      body: updates,
    })
    const mapped = mapMedia(updated)
    mediaList.value = mediaList.value.map((m) => (m.id === id ? mapped : m))
    return mapped
  }

  async function deleteMedia(id: string) {
    await authFetch(`/api/media/${id}`, { method: 'DELETE' })
    mediaList.value = mediaList.value.filter((m) => m.id !== id)
  }

  return {
    mediaList,
    watched,
    wantToWatch,
    loading,
    fetchMedia,
    searchTmdb,
    addMedia,
    updateMedia,
    deleteMedia,
  }
}
