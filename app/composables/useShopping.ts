export interface ShoppingItem {
  id: string
  name: string
  type: 'manual' | 'plan'
  bought_at: string | null
  added_by?: string
  created_at?: string
  plan_id?: string
  plan_name?: string
  ingredient_key?: string
  recipes?: Array<{ id: string; emoji: string; name: string }>
}

const items = ref<ShoppingItem[]>([])
const loading = ref(false)

export function useShopping() {
  const { authFetch } = useAuth()
  const toast = useToast()
  const { enqueue, isOnline } = useOfflineQueue()

  const { fetch: fetchItems, writeCache } = useAsyncFetch<ShoppingItem>(
    items,
    loading,
    () => authFetch<ShoppingItem[]>('/api/shopping'),
    'Failed to load shopping list',
    { cacheKey: 'shopping-items' },
  )

  function persistCache() {
    writeCache(items.value)
  }

  async function addItem(name: string) {
    // Optimistic: add a temporary item immediately
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const optimistic: ShoppingItem = {
      id: tempId,
      name,
      type: 'manual',
      bought_at: null,
      created_at: new Date().toISOString(),
    }
    items.value = [optimistic, ...items.value]
    persistCache()

    const doAdd = async () => {
      const item = await authFetch<ShoppingItem>('/api/shopping', {
        method: 'POST',
        body: { name },
      })
      // Replace temp item with real server item
      items.value = items.value.map((i) => (i.id === tempId ? item : i))
      persistCache()
    }

    try {
      await doAdd()
    } catch {
      if (!isOnline.value) {
        enqueue(doAdd)
      } else {
        // Real error — roll back
        items.value = items.value.filter((i) => i.id !== tempId)
        persistCache()
        toast.error('Failed to add item')
      }
    }
  }

  async function toggleBought(item: ShoppingItem) {
    // Optimistic: toggle immediately
    const previousBoughtAt = item.bought_at
    const newBoughtAt = item.bought_at ? null : new Date().toISOString()
    items.value = items.value.map((i) =>
      i.id === item.id ? { ...i, bought_at: newBoughtAt } : i,
    )
    persistCache()

    const doToggle = async () => {
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
      persistCache()
    }

    try {
      await doToggle()
    } catch {
      if (!isOnline.value) {
        enqueue(doToggle)
      } else {
        // Roll back
        items.value = items.value.map((i) =>
          i.id === item.id ? { ...i, bought_at: previousBoughtAt } : i,
        )
        persistCache()
        toast.error('Failed to update item')
      }
    }
  }

  async function bulkMarkBought(toBuy: ShoppingItem[]) {
    // Optimistic: mark all as bought immediately
    const ids = new Set(toBuy.map((i) => i.id))
    const now = new Date().toISOString()
    const previousStates = new Map(
      toBuy.map((i) => [i.id, i.bought_at]),
    )
    items.value = items.value.map((i) =>
      ids.has(i.id) && !i.bought_at ? { ...i, bought_at: now } : i,
    )
    persistCache()

    const doBulk = async () => {
      const payload = toBuy.map((item) => ({
        type: item.type,
        id: item.id,
        plan_id: item.plan_id,
        ingredient_key: item.ingredient_key,
      }))
      const result = await authFetch<{ bought_at: string }>('/api/shopping/bulk-toggle', {
        method: 'PUT',
        body: { items: payload },
      })
      items.value = items.value.map((i) =>
        ids.has(i.id) ? { ...i, bought_at: result.bought_at } : i,
      )
      persistCache()
    }

    try {
      await doBulk()
    } catch {
      if (!isOnline.value) {
        enqueue(doBulk)
      } else {
        // Roll back
        items.value = items.value.map((i) =>
          ids.has(i.id) ? { ...i, bought_at: previousStates.get(i.id) ?? i.bought_at } : i,
        )
        persistCache()
        toast.error('Failed to update items')
      }
    }
  }

  async function deleteItem(id: string) {
    // Optimistic: remove immediately
    const removed = items.value.find((i) => i.id === id)
    const previousIndex = items.value.findIndex((i) => i.id === id)
    items.value = items.value.filter((i) => i.id !== id)
    persistCache()

    const doDelete = async () => {
      await authFetch(`/api/shopping/${id}`, { method: 'DELETE' })
    }

    try {
      await doDelete()
    } catch {
      if (!isOnline.value) {
        enqueue(doDelete)
      } else {
        // Roll back — re-insert at original position
        if (removed) {
          const restored = [...items.value]
          restored.splice(previousIndex, 0, removed)
          items.value = restored
          persistCache()
        }
        toast.error('Failed to delete item')
      }
    }
  }

  return { items, loading, fetchItems, addItem, toggleBought, bulkMarkBought, deleteItem }
}
