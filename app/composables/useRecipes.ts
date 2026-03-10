export interface RecipeStats {
  totalCount: number
  lastUsedDate: string | null
  weeksSinceLast: number | null
  score: number
}

export interface RecipeRating {
  userRating: number | null
  avgRating: number
  ratingCount: number
}

export interface RecipeData {
  id: string
  name: string
  cookTime: string
  description: string
  tags: string[]
  emoji: string
  color: string
  isBuiltIn: boolean
  sourceUrl: string
  instructions: string
  ingredients: Array<{ name: string; unit: string; perServing: number }>
  imagePath: string | null
  createdAt: string | null
  stats?: RecipeStats
  rating?: RecipeRating
}

/** Map snake_case DB row to camelCase frontend shape */
function mapRecipe(row: any): RecipeData {
  return {
    id: row.id,
    name: row.name,
    cookTime: row.cook_time,
    description: row.description,
    tags: row.tags,
    emoji: row.emoji,
    color: row.color,
    isBuiltIn: row.is_built_in,
    sourceUrl: row.source_url || '',
    instructions: row.instructions || '',
    ingredients: (row.ingredients || []).map((ing: any) => ({
      name: ing.name,
      unit: ing.unit,
      perServing: ing.per_serving,
    })),
    imagePath: row.image_path || null,
    createdAt: row.created_at || null,
  }
}

const DEFAULT_STATS: RecipeStats = { totalCount: 0, lastUsedDate: null, weeksSinceLast: null, score: 8 }

const recipes = ref<RecipeData[]>([])
const loading = ref(true)

export function useRecipes() {
  const { authFetch } = useAuth()

  const userRecipes = computed(() => recipes.value.filter((r) => !r.isBuiltIn))

  async function fetchRecipes() {
    loading.value = true
    try {
      const data = await authFetch<any[]>('/api/recipes')
      recipes.value = data.map(mapRecipe)
    } catch (err) {
      console.error('Failed to fetch recipes:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchScores(refDate?: string) {
    try {
      const param = refDate ? `?ref_date=${refDate}` : ''
      const scores = await authFetch<Record<string, RecipeStats>>(`/api/recipes/scores${param}`)
      // Merge scores into existing recipes and sort by score
      recipes.value = [...recipes.value]
        .map((r) => ({ ...r, stats: scores[r.id] || DEFAULT_STATS }))
        .sort((a, b) => (b.stats?.score ?? 0) - (a.stats?.score ?? 0))
    } catch (err) {
      console.error('Failed to fetch scores:', err)
    }
  }

  async function fetchRatings() {
    try {
      const ratings = await authFetch<Record<string, RecipeRating>>('/api/recipes/ratings')
      recipes.value = recipes.value.map((r) => ({
        ...r,
        rating: ratings[r.id] || r.rating,
      }))
    } catch (err) {
      console.error('Failed to fetch ratings:', err)
    }
  }

  async function setRating(recipeId: string, rating: number) {
    // Optimistic update
    recipes.value = recipes.value.map((r) => {
      if (r.id !== recipeId) return r
      const prev = r.rating || { userRating: null, avgRating: 0, ratingCount: 0 }
      const wasRated = prev.userRating !== null
      const newCount = wasRated ? prev.ratingCount : prev.ratingCount + 1
      const newAvg = wasRated
        ? (prev.avgRating * prev.ratingCount - prev.userRating! + rating) / newCount
        : (prev.avgRating * prev.ratingCount + rating) / newCount
      return { ...r, rating: { userRating: rating, avgRating: Math.round(newAvg * 10) / 10, ratingCount: newCount } }
    })

    try {
      await authFetch(`/api/recipes/${recipeId}/rating`, {
        method: 'PUT',
        body: { rating },
      })
    } catch (err) {
      console.error('Failed to set rating:', err)
      // Revert on error by refetching
      await fetchRatings()
    }
  }

  async function addRecipe(recipe: Omit<RecipeData, 'id' | 'isBuiltIn'>) {
    const created = await authFetch<any>('/api/recipes', {
      method: 'POST',
      body: recipe,
    })
    const mapped = mapRecipe(created)
    recipes.value = [...recipes.value, mapped]
    return mapped
  }

  async function updateRecipe(id: string, recipe: Omit<RecipeData, 'id' | 'isBuiltIn'>) {
    const updated = await authFetch<any>(`/api/recipes/${id}`, {
      method: 'PUT',
      body: recipe,
    })
    const mapped = mapRecipe(updated)
    recipes.value = recipes.value.map((r) => (r.id === id ? mapped : r))
    return mapped
  }

  async function uploadRecipeImage(id: string, blob: Blob) {
    const form = new FormData()
    form.append('image', blob, 'image.jpg')
    const updated = await authFetch<any>(`/api/recipes/${id}/image`, {
      method: 'POST',
      body: form,
    })
    const mapped = mapRecipe(updated)
    recipes.value = recipes.value.map((r) => (r.id === id ? { ...r, imagePath: mapped.imagePath } : r))
    return mapped
  }

  async function removeRecipeImage(id: string) {
    const updated = await authFetch<any>(`/api/recipes/${id}/image`, {
      method: 'DELETE',
    })
    const mapped = mapRecipe(updated)
    recipes.value = recipes.value.map((r) => (r.id === id ? { ...r, imagePath: null } : r))
    return mapped
  }

  async function deleteRecipe(id: string) {
    await authFetch(`/api/recipes/${id}`, {
      method: 'DELETE',
    })
    recipes.value = recipes.value.filter((r) => r.id !== id)
  }

  return {
    recipes,
    userRecipes,
    loading,
    fetchRecipes,
    fetchScores,
    fetchRatings,
    setRating,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    uploadRecipeImage,
    removeRecipeImage,
  }
}
