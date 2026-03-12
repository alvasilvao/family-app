export interface MealPlan {
  id: string
  name: string
  start_date: string
  end_date: string
  basket: Record<string, number>
  cooked: Record<string, boolean>
  status: 'open' | 'closed' | 'closed_no_shop' | 'cooked'
  created_at: string
  updated_at: string
}

const plans = ref<MealPlan[]>([])
const loading = ref(false)

export function usePlans() {
  const { authFetch } = useAuth()
  const { fetch: fetchPlans } = useAsyncFetch<MealPlan>(
    plans,
    loading,
    () => authFetch<MealPlan[]>('/api/plans'),
    'Failed to load meal plans',
  )

  async function createPlan(name: string, startDate: string, endDate: string): Promise<MealPlan> {
    const plan = await authFetch<MealPlan>('/api/plans', {
      method: 'POST',
      body: { name, start_date: startDate, end_date: endDate },
    })
    plans.value = [plan, ...plans.value]
    return plan
  }

  return { plans, loading, fetchPlans, createPlan }
}
