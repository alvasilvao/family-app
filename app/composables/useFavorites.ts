export interface FavoriteIngredient {
  id: string
  name: string
  category: string | null
  user_id: string
  created_at: string
}

const favorites = ref<FavoriteIngredient[]>([])
const loading = ref(false)

export function useFavorites() {
  const { authFetch } = useAuth()
  const toast = useToast()
  const { enqueue, isOnline } = useOfflineQueue()

  const { fetch: fetchFavorites, writeCache } = useAsyncFetch<FavoriteIngredient>(
    favorites,
    loading,
    () => authFetch<FavoriteIngredient[]>('/api/favorites'),
    'Failed to load favorites',
    { cacheKey: 'favorite-ingredients' },
  )

  function persistCache() {
    writeCache(favorites.value)
  }

  async function addFavorite(name: string) {
    // Optimistic: add immediately
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const optimistic: FavoriteIngredient = {
      id: tempId,
      name,
      category: null,
      user_id: '',
      created_at: new Date().toISOString(),
    }
    favorites.value = [...favorites.value, optimistic].sort((a, b) => a.name.localeCompare(b.name))
    persistCache()

    const doAdd = async () => {
      const item = await authFetch<FavoriteIngredient>('/api/favorites', {
        method: 'POST',
        body: { name },
      })
      favorites.value = favorites.value
        .map((f) => (f.id === tempId ? item : f))
        .sort((a, b) => a.name.localeCompare(b.name))
      persistCache()
    }

    try {
      await doAdd()
    } catch {
      if (!isOnline.value) {
        enqueue(doAdd)
      } else {
        favorites.value = favorites.value.filter((f) => f.id !== tempId)
        persistCache()
        toast.error('Failed to add favorite')
      }
    }
  }

  async function updateFavorite(id: string, name: string) {
    // Optimistic: update immediately
    const previous = favorites.value.find((f) => f.id === id)
    favorites.value = favorites.value
      .map((f) => (f.id === id ? { ...f, name } : f))
      .sort((a, b) => a.name.localeCompare(b.name))
    persistCache()

    const doUpdate = async () => {
      const updated = await authFetch<FavoriteIngredient>(`/api/favorites/${id}`, {
        method: 'PUT',
        body: { name },
      })
      favorites.value = favorites.value
        .map((f) => (f.id === id ? updated : f))
        .sort((a, b) => a.name.localeCompare(b.name))
      persistCache()
    }

    try {
      await doUpdate()
    } catch {
      if (!isOnline.value) {
        enqueue(doUpdate)
      } else {
        if (previous) {
          favorites.value = favorites.value
            .map((f) => (f.id === id ? previous : f))
            .sort((a, b) => a.name.localeCompare(b.name))
          persistCache()
        }
        toast.error('Failed to update favorite')
      }
    }
  }

  async function removeFavorite(id: string) {
    // Optimistic: remove immediately
    const removed = favorites.value.find((f) => f.id === id)
    const previousIndex = favorites.value.findIndex((f) => f.id === id)
    favorites.value = favorites.value.filter((f) => f.id !== id)
    persistCache()

    const doRemove = async () => {
      await authFetch(`/api/favorites/${id}`, { method: 'DELETE' })
    }

    try {
      await doRemove()
    } catch {
      if (!isOnline.value) {
        enqueue(doRemove)
      } else {
        if (removed) {
          const restored = [...favorites.value]
          restored.splice(previousIndex, 0, removed)
          favorites.value = restored
          persistCache()
        }
        toast.error('Failed to remove favorite')
      }
    }
  }

  return { favorites, loading, fetchFavorites, addFavorite, updateFavorite, removeFavorite }
}
