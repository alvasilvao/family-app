import type { GrocerySection } from '~/utils/ingredients'

export function useGrocery() {
  const sections = ref<GrocerySection[]>([])
  const loading = ref(false)
  const { getAccessToken } = useAuth()

  async function fetchGrocery(weekKey: string) {
    loading.value = true
    try {
      const token = await getAccessToken()
      const data = await $fetch<{ sections: GrocerySection[] }>(`/api/grocery/${weekKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      sections.value = data.sections
    } catch (err) {
      console.error('Failed to fetch grocery:', err)
      sections.value = []
    } finally {
      loading.value = false
    }
  }

  return { sections, loading, fetchGrocery }
}
