import { nextWeekKey, adjacentWeek } from '~/utils/week'

export function useWeek() {
  const route = useRoute()
  const router = useRouter()

  const defaultWeek = nextWeekKey()
  const currentWeek = computed({
    get: () => (route.query.week as string) || defaultWeek,
    set: (val: string) => {
      router.replace({ query: { ...route.query, week: val } })
    },
  })

  function goWeek(delta: number) {
    currentWeek.value = adjacentWeek(currentWeek.value, delta)
  }

  return { currentWeek, goWeek }
}
