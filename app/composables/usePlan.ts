const basket = ref<Record<string, number>>({})
const groceryChecked = ref<Record<string, boolean>>({})

export function usePlan() {
  const { getAccessToken } = useAuth()

  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  let currentWeekKey = ''

  async function fetchPlan(weekKey: string) {
    currentWeekKey = weekKey
    try {
      const token = await getAccessToken()
      const data = await $fetch<{ basket: Record<string, number>; groceryChecked: Record<string, boolean> }>(`/api/plans/${weekKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      basket.value = data.basket || {}
      groceryChecked.value = data.groceryChecked || {}
    } catch (err) {
      console.error('Failed to fetch plan:', err)
      basket.value = {}
      groceryChecked.value = {}
    }
  }

  function debouncedSave() {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(async () => {
      try {
        const token = await getAccessToken()
        await $fetch(`/api/plans/${currentWeekKey}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: { basket: basket.value, groceryChecked: groceryChecked.value },
        })
      } catch (err) {
        console.error('Failed to save plan:', err)
      }
    }, 300)
  }

  function add(id: string) {
    basket.value = { ...basket.value, [id]: (basket.value[id] || 0) + 1 }
    debouncedSave()
  }

  function remove(id: string) {
    const count = (basket.value[id] || 0) - 1
    if (count <= 0) {
      const newBasket = { ...basket.value }
      delete newBasket[id]
      basket.value = newBasket
    } else {
      basket.value = { ...basket.value, [id]: count }
    }
    debouncedSave()
  }

  function removeRecipeFromBasket(id: string) {
    const newBasket = { ...basket.value }
    delete newBasket[id]
    basket.value = newBasket
    debouncedSave()
  }

  function toggleGroceryItem(key: string) {
    groceryChecked.value = { ...groceryChecked.value, [key]: !groceryChecked.value[key] }
    debouncedSave()
  }

  function clearGroceryChecked() {
    groceryChecked.value = {}
    debouncedSave()
  }

  const totalServings = computed(() =>
    Object.values(basket.value).reduce((a, b) => a + b, 0),
  )

  return {
    basket,
    groceryChecked,
    fetchPlan,
    add,
    remove,
    removeRecipeFromBasket,
    toggleGroceryItem,
    clearGroceryChecked,
    totalServings,
  }
}
