export interface MealPlan {
  id: string
  name: string
  start_date: string
  end_date: string
  basket: Record<string, number>
  status: 'open' | 'closed' | 'closed_no_shop'
  created_at: string
  updated_at: string
}

const plans = ref<MealPlan[]>([])
const loading = ref(false)

export function usePlans() {
  const { authFetch } = useAuth()

  async function fetchPlans() {
    loading.value = true
    try {
      plans.value = await authFetch<MealPlan[]>('/api/plans')
    } catch (err) {
      console.error('Failed to fetch plans:', err)
      plans.value = []
    } finally {
      loading.value = false
    }
  }

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
