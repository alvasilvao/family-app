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

interface IngredientRow {
  id: string
  name: string
  unit: string
  per_serving: number
  calories: number | null
  protein: number | null
}

interface RecipeRow {
  id: string
  name: string
  cook_time: string
  emoji: string
  color: string
  description: string
  source_url: string
  image_path: string
  tags: string[]
  is_built_in: boolean
  instructions: string
  notes: string
  ingredients?: IngredientRow[]
  created_at: string
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
  notes: string
  ingredients?: Array<{ name: string; unit: string; perServing: number; calories: number | null; protein: number | null }>
  imagePath: string | null
  createdAt?: string | null
  stats?: RecipeStats
  rating?: RecipeRating
}

/** Map snake_case DB row to camelCase frontend shape */
function mapRecipe(row: RecipeRow): RecipeData {
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
    notes: row.notes || '',
    ingredients: row.ingredients !== undefined
      ? row.ingredients.map((ing: IngredientRow) => ({
          name: ing.name,
          unit: ing.unit,
          perServing: ing.per_serving,
          calories: ing.calories ?? null,
          protein: ing.protein ?? null,
        }))
      : undefined,
    imagePath: row.image_path || null,
    createdAt: row.created_at || null,
  }
}

const DEFAULT_STATS: RecipeStats = { totalCount: 0, lastUsedDate: null, weeksSinceLast: null, score: 8 }

const recipes = ref<RecipeData[]>([])
const loading = ref(true)
const error = ref(false)

export function useRecipes() {
  const { authFetch } = useAuth()
  const toast = useToast()

  const userRecipes = computed(() => recipes.value.filter((r) => !r.isBuiltIn))

  type StatsResponse = Record<string, {
    totalCount: number; lastUsedDate: string | null; weeksSinceLast: number | null; score: number
    avgRating: number | null; ratingCount: number; userRating: number | null
  }>

  function applyStats(list: RecipeData[], stats: StatsResponse): RecipeData[] {
    return list
      .map((r) => {
        const s = stats[r.id]
        if (!s) return r
        return {
          ...r,
          stats: { totalCount: s.totalCount, lastUsedDate: s.lastUsedDate, weeksSinceLast: s.weeksSinceLast, score: s.score },
          rating: { userRating: s.userRating, avgRating: s.avgRating ?? 0, ratingCount: s.ratingCount },
        }
      })
      .sort((a, b) => (b.stats?.score ?? 0) - (a.stats?.score ?? 0))
  }

  async function fetchRecipes() {
    loading.value = true
    error.value = false
    try {
      const data = await authFetch<RecipeRow[]>('/api/recipes')
      recipes.value = data.map(mapRecipe)
    } catch (err: unknown) {
      error.value = true
      console.error('Failed to fetch recipes:', err)
      toast.error('Failed to load recipes')
    } finally {
      loading.value = false
    }
  }

  async function fetchStats(refDate?: string) {
    try {
      const param = refDate ? `?ref_date=${refDate}` : ''
      const stats = await authFetch<StatsResponse>(`/api/recipes/stats${param}`)
      recipes.value = applyStats([...recipes.value], stats)
    } catch (err: unknown) {
      console.error('Failed to fetch stats:', err)
      toast.error('Failed to load recipe stats')
    }
  }

  async function fetchRecipesWithStats(refDate?: string) {
    loading.value = true
    error.value = false
    const param = refDate ? `?ref_date=${refDate}` : ''
    const recipesReq = authFetch<RecipeRow[]>('/api/recipes')
    const statsReq = authFetch<StatsResponse>(`/api/recipes/stats${param}`).catch((err) => {
      console.error('Failed to fetch stats:', err)
      return null
    })
    try {
      const [data, stats] = await Promise.all([recipesReq, statsReq])
      const mapped = data.map(mapRecipe)
      recipes.value = stats ? applyStats(mapped, stats) : mapped
    } catch (err: unknown) {
      error.value = true
      console.error('Failed to fetch recipes:', err)
      toast.error('Failed to load recipes')
    } finally {
      loading.value = false
    }
  }

  async function fetchRecipeIngredients(id: string) {
    const data = await authFetch<RecipeRow>(`/api/recipes/${id}`)
    const mapped = mapRecipe(data)
    recipes.value = recipes.value.map((r) => r.id === id ? { ...r, ingredients: mapped.ingredients } : r)
  }

  async function searchRecipes(query: string): Promise<RecipeData[]> {
    const data = await authFetch<RecipeRow[]>(`/api/recipes/search?q=${encodeURIComponent(query)}`)
    return data.map((row) => {
      const mapped = mapRecipe(row)
      const stored = recipes.value.find((r) => r.id === row.id)
      return stored ? { ...mapped, stats: stored.stats, rating: stored.rating } : mapped
    })
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
    } catch (err: unknown) {
      console.error('Failed to set rating:', err)
      toast.error('Failed to save rating')
      await fetchStats()
    }
  }

  async function addRecipe(recipe: Omit<RecipeData, 'id' | 'isBuiltIn'>) {
    const created = await authFetch<RecipeRow>('/api/recipes', {
      method: 'POST',
      body: recipe,
    })
    const mapped = mapRecipe(created)
    recipes.value = [...recipes.value, mapped]
    return mapped
  }

  async function updateRecipe(id: string, recipe: Omit<RecipeData, 'id' | 'isBuiltIn'>) {
    const updated = await authFetch<RecipeRow>(`/api/recipes/${id}`, {
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
    const updated = await authFetch<RecipeRow>(`/api/recipes/${id}/image`, {
      method: 'POST',
      body: form,
    })
    const mapped = mapRecipe(updated)
    recipes.value = recipes.value.map((r) => (r.id === id ? { ...r, imagePath: mapped.imagePath } : r))
    return mapped
  }

  async function removeRecipeImage(id: string) {
    const updated = await authFetch<RecipeRow>(`/api/recipes/${id}/image`, {
      method: 'DELETE',
    })
    const mapped = mapRecipe(updated)
    recipes.value = recipes.value.map((r) => (r.id === id ? { ...r, imagePath: null } : r))
    return mapped
  }

  async function importRecipe(params: { url?: string; text?: string }) {
    const result = await authFetch<{
      recipe?: Omit<RecipeData, 'id' | 'isBuiltIn'>
      error?: string
      message?: string
    }>('/api/recipes/import', {
      method: 'POST',
      body: params,
    })
    return result
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
    error,
    fetchRecipes,
    fetchStats,
    fetchRecipesWithStats,
    fetchRecipeIngredients,
    searchRecipes,
    setRating,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    importRecipe,
    uploadRecipeImage,
    removeRecipeImage,
  }
}
