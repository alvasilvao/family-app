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

  const { fetch: fetchFavorites } = useAsyncFetch<FavoriteIngredient>(
    favorites,
    loading,
    () => authFetch<FavoriteIngredient[]>('/api/favorites'),
    'Failed to load favorites',
  )

  async function addFavorite(name: string) {
    const item = await authFetch<FavoriteIngredient>('/api/favorites', {
      method: 'POST',
      body: { name },
    })
    favorites.value = [...favorites.value, item].sort((a, b) => a.name.localeCompare(b.name))
  }

  async function updateFavorite(id: string, name: string) {
    const updated = await authFetch<FavoriteIngredient>(`/api/favorites/${id}`, {
      method: 'PUT',
      body: { name },
    })
    favorites.value = favorites.value
      .map((f) => (f.id === id ? updated : f))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  async function removeFavorite(id: string) {
    await authFetch(`/api/favorites/${id}`, { method: 'DELETE' })
    favorites.value = favorites.value.filter((f) => f.id !== id)
  }

  return { favorites, loading, fetchFavorites, addFavorite, updateFavorite, removeFavorite }
}
