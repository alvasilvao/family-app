export interface RecipeStats {
  totalCount: number
  lastWeekKey: string | null
  weeksSinceLast: number | null
  score: number
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
  stats?: RecipeStats
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
  }
}

const DEFAULT_STATS: RecipeStats = { totalCount: 0, lastWeekKey: null, weeksSinceLast: null, score: 8 }

const recipes = ref<RecipeData[]>([])
const loading = ref(true)

export function useRecipes() {
  const { getAccessToken } = useAuth()

  const builtInRecipes = computed(() => recipes.value.filter((r) => r.isBuiltIn))
  const userRecipes = computed(() => recipes.value.filter((r) => !r.isBuiltIn))

  async function fetchRecipes() {
    loading.value = true
    try {
      const token = await getAccessToken()
      const data = await $fetch<any[]>('/api/recipes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      recipes.value = data.map(mapRecipe)
    } catch (err) {
      console.error('Failed to fetch recipes:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchScores(weekKey: string) {
    try {
      const token = await getAccessToken()
      const scores = await $fetch<Record<string, RecipeStats>>(`/api/recipes/scores?week=${weekKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Merge scores into existing recipes and sort by score
      recipes.value = [...recipes.value]
        .map((r) => ({ ...r, stats: scores[r.id] || DEFAULT_STATS }))
        .sort((a, b) => (b.stats?.score ?? 0) - (a.stats?.score ?? 0))
    } catch (err) {
      console.error('Failed to fetch scores:', err)
    }
  }

  async function addRecipe(recipe: Omit<RecipeData, 'id' | 'isBuiltIn'>) {
    const token = await getAccessToken()
    const created = await $fetch<any>('/api/recipes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: recipe,
    })
    recipes.value = [...recipes.value, mapRecipe(created)]
    return mapRecipe(created)
  }

  async function updateRecipe(id: string, recipe: Omit<RecipeData, 'id' | 'isBuiltIn'>) {
    const token = await getAccessToken()
    const updated = await $fetch<any>(`/api/recipes/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: recipe,
    })
    const mapped = mapRecipe(updated)
    recipes.value = recipes.value.map((r) => (r.id === id ? mapped : r))
    return mapped
  }

  async function deleteRecipe(id: string) {
    const token = await getAccessToken()
    await $fetch(`/api/recipes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    recipes.value = recipes.value.filter((r) => r.id !== id)
  }

  return {
    recipes,
    builtInRecipes,
    userRecipes,
    loading,
    fetchRecipes,
    fetchScores,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  }
}
