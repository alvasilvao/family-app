import type { GrocerySection } from '~~/shared/utils/ingredients'

const sections = ref<GrocerySection[]>([])

export function useGrocery() {
  const { authFetch } = useAuth()

  async function fetchGrocery(weekKey: string) {
    try {
      const data = await authFetch<{ sections: GrocerySection[] }>(`/api/grocery/${weekKey}`)
      sections.value = data.sections
    } catch (err) {
      console.error('Failed to fetch grocery:', err)
      sections.value = []
    }
  }

  return { sections, fetchGrocery }
}
