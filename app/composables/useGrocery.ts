import type { GrocerySection } from '~/utils/ingredients'

const sections = ref<GrocerySection[]>([])

export function useGrocery() {
  const { getAccessToken } = useAuth()

  async function fetchGrocery(weekKey: string) {
    try {
      const token = await getAccessToken()
      const data = await $fetch<{ sections: GrocerySection[] }>(`/api/grocery/${weekKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      sections.value = data.sections
    } catch (err) {
      console.error('Failed to fetch grocery:', err)
      sections.value = []
    }
  }

  return { sections, fetchGrocery }
}
