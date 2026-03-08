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

  async function fetchScores(weekKey: string) {
    try {
      const scores = await authFetch<Record<string, RecipeStats>>(`/api/recipes/scores?week=${weekKey}`)
      // Merge scores into existing recipes and sort by score
      recipes.value = [...recipes.value]
        .map((r) => ({ ...r, stats: scores[r.id] || DEFAULT_STATS }))
        .sort((a, b) => (b.stats?.score ?? 0) - (a.stats?.score ?? 0))
    } catch (err) {
      console.error('Failed to fetch scores:', err)
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
    addRecipe,
    updateRecipe,
    deleteRecipe,
  }
}
