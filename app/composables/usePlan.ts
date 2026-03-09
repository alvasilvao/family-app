import type { MealPlan } from './usePlans'

const plan = ref<MealPlan | null>(null)
const basket = ref<Record<string, number>>({})

export function usePlan() {
  const { authFetch } = useAuth()

  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  let activePlanId = ''

  async function fetchPlan(id: string) {
    activePlanId = id
    try {
      const data = await authFetch<MealPlan>(`/api/plans/${id}`)
      plan.value = data
      basket.value = (data.basket as Record<string, number>) || {}
    } catch (err) {
      console.error('Failed to fetch plan:', err)
      plan.value = null
      basket.value = {}
    }
  }

  function debouncedSave() {
    if (saveTimeout) clearTimeout(saveTimeout)
    const planId = activePlanId
    saveTimeout = setTimeout(async () => {
      try {
        await authFetch(`/api/plans/${planId}`, {
          method: 'PUT',
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

  async function closePlan(id: string): Promise<MealPlan> {
    const data = await authFetch<MealPlan>(`/api/plans/${id}/close`, { method: 'POST' })
    plan.value = data
    return data
  }

  async function reopenPlan(id: string): Promise<MealPlan> {
    const data = await authFetch<MealPlan>(`/api/plans/${id}/reopen`, { method: 'POST' })
    plan.value = data
    return data
  }

  const totalServings = computed(() =>
    Object.values(basket.value).reduce((a, b) => a + b, 0),
  )

  return {
    plan,
    basket,
    fetchPlan,
    add,
    remove,
    removeRecipeFromBasket,
    closePlan,
    reopenPlan,
    totalServings,
  }
}
