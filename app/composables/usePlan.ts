export function usePlan() {
  const basket = ref<Record<string, number>>({})
  const loadingPlan = ref(false)
  const { getAccessToken } = useAuth()

  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  let currentWeekKey = ''

  async function fetchPlan(weekKey: string) {
    currentWeekKey = weekKey
    loadingPlan.value = true
    try {
      const token = await getAccessToken()
      const data = await $fetch<{ basket: Record<string, number> }>(`/api/plans/${weekKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      basket.value = data.basket || {}
    } catch {
      basket.value = {}
    } finally {
      loadingPlan.value = false
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
          body: { basket: basket.value },
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
    basket.value = { ...basket.value, [id]: Math.max(0, (basket.value[id] || 0) - 1) }
    debouncedSave()
  }

  function removeRecipeFromBasket(id: string) {
    const newBasket = { ...basket.value }
    delete newBasket[id]
    basket.value = newBasket
    debouncedSave()
  }

  const totalServings = computed(() =>
    Object.values(basket.value).reduce((a, b) => a + b, 0),
  )

  return {
    basket,
    loadingPlan,
    fetchPlan,
    add,
    remove,
    removeRecipeFromBasket,
    totalServings,
  }
}
