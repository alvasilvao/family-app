export interface ShoppingItem {
  id: string
  name: string
  added_by: string
  bought_at: string | null
  created_at: string
}

const items = ref<ShoppingItem[]>([])
const loading = ref(false)

export function useShopping() {
  const { authFetch } = useAuth()

  async function fetchItems() {
    loading.value = true
    try {
      items.value = await authFetch<ShoppingItem[]>('/api/shopping')
    } catch (err) {
      console.error('Failed to fetch shopping items:', err)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function addItem(name: string) {
    const item = await authFetch<ShoppingItem>('/api/shopping', {
      method: 'POST',
      body: { name },
    })
    items.value = [item, ...items.value]
  }

  async function toggleBought(id: string) {
    const updated = await authFetch<ShoppingItem>(`/api/shopping/${id}`, {
      method: 'PUT',
    })
    items.value = items.value.map((i) => (i.id === id ? updated : i))
  }

  async function deleteItem(id: string) {
    await authFetch(`/api/shopping/${id}`, { method: 'DELETE' })
    items.value = items.value.filter((i) => i.id !== id)
  }

  return { items, loading, fetchItems, addItem, toggleBought, deleteItem }
}
