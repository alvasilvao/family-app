export interface HistoryEntry {
  recipeId: string
  recipeName: string
  recipeEmoji: string
  recipeColor: string
  recipeImagePath: string | null
  recipeTags: string[]
  planId: string
  planName: string
  date: string
  servings: number | null
}

interface HistoryRow {
  recipe_id: string
  recipe_name: string
  recipe_emoji: string
  recipe_color: string
  recipe_image_path: string | null
  recipe_tags: string[]
  plan_id: string
  plan_name: string
  date: string
  servings: number | null
}

function mapEntry(row: HistoryRow): HistoryEntry {
  return {
    recipeId: row.recipe_id,
    recipeName: row.recipe_name,
    recipeEmoji: row.recipe_emoji,
    recipeColor: row.recipe_color,
    recipeImagePath: row.recipe_image_path,
    recipeTags: row.recipe_tags,
    planId: row.plan_id,
    planName: row.plan_name,
    date: row.date,
    servings: row.servings,
  }
}

const entries = ref<HistoryEntry[]>([])
const loading = ref(false)

export function useHistory() {
  const { authFetch } = useAuth()
  const toast = useToast()

  async function fetchHistory() {
    entries.value = []
    loading.value = true
    try {
      const data = await authFetch<HistoryRow[]>('/api/history')
      entries.value = data.map(mapEntry)
    } catch (err: unknown) {
      console.error('Failed to fetch history:', err)
      toast.error('Failed to load cooking history')
      entries.value = []
    } finally {
      loading.value = false
    }
  }

  return { entries, loading, fetchHistory }
}
