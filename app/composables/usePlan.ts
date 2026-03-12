import type { MealPlan } from './usePlans'

const plan = ref<MealPlan | null>(null)
const basket = ref<Record<string, number>>({})
const cooked = ref<Record<string, boolean | string>>({})

export function usePlan() {
  const { authFetch } = useAuth()
  const toast = useToast()

  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  let activePlanId = ''

  async function fetchPlan(id: string) {
    activePlanId = id
    plan.value = null
    basket.value = {}
    cooked.value = {}
    try {
      const data = await authFetch<MealPlan>(`/api/plans/${id}`)
      plan.value = data
      basket.value = (data.basket as Record<string, number>) || {}
      cooked.value = (data.cooked as Record<string, boolean | string>) || {}
    } catch (err: unknown) {
      console.error('Failed to fetch plan:', err)
      toast.error('Failed to load meal plan')
      plan.value = null
      basket.value = {}
      cooked.value = {}
    }
  }

  function debouncedSave() {
    if (saveTimeout) clearTimeout(saveTimeout)
    const planId = activePlanId
    saveTimeout = setTimeout(async () => {
      try {
        const data = await authFetch<MealPlan>(`/api/plans/${planId}`, {
          method: 'PUT',
          body: { basket: basket.value, cooked: cooked.value },
        })
        if (plan.value && data.status !== plan.value.status) {
          plan.value = { ...plan.value, status: data.status }
        }
      } catch (err: unknown) {
        console.error('Failed to save plan:', err)
        toast.error('Failed to save plan changes')
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
      const newCooked = { ...cooked.value }
      delete newCooked[id]
      cooked.value = newCooked
    } else {
      basket.value = { ...basket.value, [id]: count }
    }
    debouncedSave()
  }

  function toggleCooked(id: string) {
    if (cooked.value[id]) {
      const newCooked = { ...cooked.value }
      delete newCooked[id]
      cooked.value = newCooked
    } else {
      cooked.value = { ...cooked.value, [id]: new Date().toISOString() }
    }
    debouncedSave()
  }

  async function closePlan(id: string, addToShopping = true): Promise<MealPlan> {
    const data = await authFetch<MealPlan>(`/api/plans/${id}/close`, {
      method: 'POST',
      body: { addToShopping },
    })
    plan.value = data
    return data
  }

  async function reopenPlan(id: string): Promise<MealPlan> {
    const data = await authFetch<MealPlan>(`/api/plans/${id}/reopen`, { method: 'POST' })
    plan.value = data
    return data
  }

  async function deletePlan(id: string) {
    await authFetch(`/api/plans/${id}`, { method: 'DELETE' })
    plan.value = null
    basket.value = {}
    cooked.value = {}
    const { plans } = usePlans()
    plans.value = plans.value.filter((p) => p.id !== id)
  }

  const totalServings = computed(() =>
    Object.values(basket.value).reduce((a, b) => a + b, 0),
  )

  return {
    plan,
    basket,
    cooked,
    fetchPlan,
    add,
    remove,
    toggleCooked,
    closePlan,
    reopenPlan,
    deletePlan,
    totalServings,
  }
}
