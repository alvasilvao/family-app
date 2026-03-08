import { nextWeekKey, adjacentWeek } from '~/utils/week'

export function useWeek() {
  const currentWeek = ref(nextWeekKey())

  function goWeek(delta: number) {
    currentWeek.value = adjacentWeek(currentWeek.value, delta)
  }

  return { currentWeek, goWeek }
}
