<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <RecipeDetailModal
      v-if="detailRecipe"
      :recipe="detailRecipe"
      :deletable="false"
      :editable="true"
      @close="detailRecipeId = null"
    />

    <PageHeader title="Cooking History" />

    <!-- Loading -->
    <div v-if="loading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <div v-else class="page-content" style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Empty state -->
      <EmptyState
        v-if="entries.length === 0"
        emoji="&#x1F373;"
        title="No cooking history yet"
        message="Recipes marked as cooked in your meal plans will show up here."
      />

      <div v-else>
        <!-- Stats summary -->
        <div style="padding: 16px 20px 8px; display: flex; gap: 10px">
          <div style="flex: 1; background: #fff; border-radius: 12px; padding: 14px 16px; box-shadow: 0 2px 12px rgba(0,0,0,.06)">
            <div style="font-size: 24px; font-family: 'Fraunces', serif; font-weight: 700; color: #2d6a4f">
              {{ entries.length }}
            </div>
            <div style="font-size: 11px; color: #9b9590; margin-top: 2px">Meals cooked</div>
          </div>
          <div style="flex: 1; background: #fff; border-radius: 12px; padding: 14px 16px; box-shadow: 0 2px 12px rgba(0,0,0,.06)">
            <div style="font-size: 24px; font-family: 'Fraunces', serif; font-weight: 700; color: #2d6a4f">
              {{ uniqueRecipes }}
            </div>
            <div style="font-size: 11px; color: #9b9590; margin-top: 2px">Unique recipes</div>
          </div>
          <div style="flex: 1; background: #fff; border-radius: 12px; padding: 14px 16px; box-shadow: 0 2px 12px rgba(0,0,0,.06)">
            <div style="font-size: 24px; font-family: 'Fraunces', serif; font-weight: 700; color: #2d6a4f">
              {{ monthsActive }}
            </div>
            <div style="font-size: 11px; color: #9b9590; margin-top: 2px">Months active</div>
          </div>
        </div>

        <!-- Timeline -->
        <div v-for="(group, idx) in groupedByMonth" :key="group.label" style="padding: 0 20px">
          <!-- Month header -->
          <div style="display: flex; align-items: center; gap: 7px; padding: 18px 0 8px">
            <span
              :style="{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: idx === 0 ? '#2d6a4f' : '#9b9590',
                fontFamily: '\'Fraunces\', serif',
              }"
            >
              {{ group.label }}
            </span>
            <div style="flex: 1; height: 1px; background: #e8e2db; margin-left: 4px" />
            <span style="font-size: 11px; color: #9b9590">{{ group.entries.length }} meals</span>
          </div>

          <!-- Entries for this month -->
          <div style="display: flex; flex-direction: column; gap: 10px; padding-bottom: 4px">
            <PlanRecipeItem
              v-for="entry in group.entries"
              :key="`${entry.planId}-${entry.recipeId}`"
              :recipe="mapEntryToRecipe(entry)"
              :subtitle="formatEntrySubtitle(entry)"
              :rating="getRecipeRating(entry.recipeId)"
              :unrated="unratedRecipeIds.has(entry.recipeId)"
              @view="viewRecipe"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HistoryEntry } from '~/composables/useHistory'
import type { RecipeData } from '~/composables/useRecipes'

const { entries, loading, fetchHistory } = useHistory()
const { recipes, fetchRecipes, fetchStats } = useRecipes()

const detailRecipeId = ref<string | null>(null)
const detailRecipe = computed<RecipeData | null>(() =>
  detailRecipeId.value ? recipes.value.find((r) => r.id === detailRecipeId.value) ?? null : null,
)

function viewRecipe(id: string) {
  detailRecipeId.value = id
}

const uniqueRecipes = computed(() => {
  const ids = new Set(entries.value.map((e) => e.recipeId))
  return ids.size
})

const monthsActive = computed(() => {
  const months = new Set(entries.value.map((e) => e.date.slice(0, 7)))
  return months.size
})

const groupedByMonth = computed(() => {
  const groups: Record<string, typeof entries.value> = {}
  for (const entry of entries.value) {
    const key = entry.date.slice(0, 7) // YYYY-MM
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  }
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({
      key,
      label: formatMonth(key),
      entries: groups[key],
    }))
})

function mapEntryToRecipe(entry: HistoryEntry) {
  return {
    id: entry.recipeId,
    name: entry.recipeName,
    emoji: entry.recipeEmoji,
    color: entry.recipeColor,
    imagePath: entry.recipeImagePath,
    tags: entry.recipeTags,
  }
}

function formatEntrySubtitle(entry: HistoryEntry): string {
  const date = formatDate(entry.date)
  if (entry.servings) return `${date} \u00B7 ${entry.servings} servings`
  return date
}

function formatMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  const now = new Date()
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
    return 'This month'
  }
  const prev = new Date(now.getFullYear(), now.getMonth() - 1)
  if (date.getFullYear() === prev.getFullYear() && date.getMonth() === prev.getMonth()) {
    return 'Last month'
  }
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function getRecipeRating(recipeId: string) {
  const recipe = recipes.value.find((r) => r.id === recipeId)
  return recipe?.rating ?? null
}

const unratedRecipeIds = computed(() => {
  const ids = new Set<string>()
  for (const r of recipes.value) {
    if (!r.rating?.userRating) ids.add(r.id)
  }
  return ids
})

onMounted(async () => {
  fetchHistory()
  await fetchRecipes()
  fetchStats()
})
</script>
