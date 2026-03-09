export interface ShoppingItem {
  id: string
  name: string
  type: 'manual' | 'plan'
  bought_at: string | null
  added_by?: string
  created_at?: string
  plan_id?: string
  ingredient_key?: string
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

  async function toggleBought(item: ShoppingItem) {
    if (item.type === 'plan') {
      const result = await authFetch<{ plan_id: string; ingredient_key: string; bought_at: string | null }>(
        '/api/shopping/plan-ingredient',
        {
          method: 'PUT',
          body: { plan_id: item.plan_id, ingredient_key: item.ingredient_key },
        },
      )
      items.value = items.value.map((i) =>
        i.id === item.id ? { ...i, bought_at: result.bought_at } : i,
      )
    } else {
      const updated = await authFetch<ShoppingItem>(`/api/shopping/${item.id}`, {
        method: 'PUT',
      })
      items.value = items.value.map((i) => (i.id === item.id ? { ...updated, type: 'manual' } : i))
    }
  }

  async function deleteItem(id: string) {
    await authFetch(`/api/shopping/${id}`, { method: 'DELETE' })
    items.value = items.value.filter((i) => i.id !== id)
  }

  return { items, loading, fetchItems, addItem, toggleBought, deleteItem }
}
