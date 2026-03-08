import { hashId } from '~/utils/week'

export interface RecipeData {
  id: string
  name: string
  cookTime: string
  description: string
  tags: string[]
  emoji: string
  color: string
  isBuiltIn: boolean
  ingredients: Array<{ name: string; unit: string; perServing: number }>
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
    ingredients: (row.ingredients || []).map((ing: any) => ({
      name: ing.name,
      unit: ing.unit,
      perServing: ing.per_serving,
    })),
  }
}

export function useRecipes() {
  const recipes = ref<RecipeData[]>([])
  const loading = ref(true)
  const { getAccessToken } = useAuth()

  const builtInRecipes = computed(() => recipes.value.filter((r) => r.isBuiltIn))
  const userRecipes = computed(() => recipes.value.filter((r) => !r.isBuiltIn))

  function getWeeklyRecipes(weekKey: string): RecipeData[] {
    const builtIn = builtInRecipes.value
    if (builtIn.length <= 4) return builtIn
    const [yearStr, wStr] = weekKey.split('-W')
    const seed = parseInt(yearStr) * 100 + parseInt(wStr)
    return [...builtIn]
      .sort((a, b) => {
        const ha = Math.sin(seed * 9301 + hashId(a.id) * 49297) * 233280
        const hb = Math.sin(seed * 9301 + hashId(b.id) * 49297) * 233280
        return (ha - Math.floor(ha)) - (hb - Math.floor(hb))
      })
      .slice(0, 4)
  }

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
    addRecipe,
    deleteRecipe,
    getWeeklyRecipes,
  }
}
