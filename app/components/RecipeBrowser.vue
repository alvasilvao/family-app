<template>
  <!-- Search -->
  <input
    v-model="searchQuery"
    type="text"
    placeholder="Search recipes..."
    class="form-input"
    style="width: 100%; padding: 10px 14px; font-size: 16px; border-radius: 10px; margin-bottom: 12px"
  />

  <!-- Sort pills -->
  <div style="display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap">
    <button
      v-for="opt in sortOptions"
      :key="opt.value"
      :style="{
        padding: '5px 12px',
        borderRadius: '999px',
        border: sortMode === opt.value ? '1.5px solid #2d6a4f' : '1.5px solid #e8e2db',
        background: sortMode === opt.value ? '#e8f5ee' : '#fff',
        color: sortMode === opt.value ? '#2d6a4f' : '#6b6560',
        fontSize: '12px',
        fontWeight: sortMode === opt.value ? 600 : 400,
        cursor: 'pointer',
        fontFamily: '\'DM Sans\', sans-serif',
        transition: 'all .2s',
      }"
      @click="sortMode = opt.value"
    >
      {{ opt.label }}
    </button>
  </div>

  <!-- No results -->
  <div v-if="filteredRecipes.length === 0" style="text-align: center; padding: 40px 20px">
    <p style="font-size: 13px; color: #9b9590">No recipes found</p>
  </div>

  <!-- Flat grid (default / A-Z / search active) -->
  <template v-else-if="recipeGroups.length <= 1">
    <RecipeGrid
      :recipes="recipeGroups[0]?.items ?? []"
      :basket="basket"
      @add="$emit('add', $event)"
      @remove="$emit('remove', $event)"
      @view="$emit('view', $event)"
    />
  </template>

  <!-- Grouped grid (by tag) -->
  <template v-else>
    <div v-for="group in recipeGroups" :key="group.label" style="margin-bottom: 20px">
      <div style="display: flex; align-items: center; gap: 7px; margin-bottom: 10px">
        <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
          {{ group.label }}
        </span>
        <div style="flex: 1; height: 1px; background: #f0ebe4; margin-left: 4px" />
        <span style="font-size: 11px; color: #b0a89e">{{ group.items.length }}</span>
      </div>
      <RecipeGrid
        :recipes="group.items"
        :basket="basket"
        @add="$emit('add', $event)"
        @remove="$emit('remove', $event)"
        @view="$emit('view', $event)"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import type { RecipeData } from '~/composables/useRecipes'

const props = defineProps<{
  recipes: RecipeData[]
  basket?: Record<string, number>
}>()

defineEmits<{
  add: [id: string]
  remove: [id: string]
  view: [id: string]
}>()

const searchQuery = ref('')

type SortMode = 'default' | 'alphabetical' | 'tag' | 'rating'
const sortMode = ref<SortMode>('default')

const sortOptions: Array<{ label: string; value: SortMode }> = [
  { label: 'Default', value: 'default' },
  { label: 'A-Z', value: 'alphabetical' },
  { label: 'By tag', value: 'tag' },
  { label: 'My rating', value: 'rating' },
]

const filteredRecipes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.recipes
  return props.recipes.filter((r) =>
    r.name.toLowerCase().includes(q)
    || r.description?.toLowerCase().includes(q)
    || r.tags?.some((t) => t.toLowerCase().includes(q)),
  )
})

interface RecipeGroup {
  label: string
  items: RecipeData[]
}

const recipeGroups = computed<RecipeGroup[]>(() => {
  const list = filteredRecipes.value

  if (sortMode.value === 'alphabetical') {
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return [{ label: 'All', items: sorted }]
  }

  if (sortMode.value === 'tag') {
    const groups: Record<string, RecipeData[]> = {}
    const untagged: RecipeData[] = []

    for (const recipe of list) {
      if (!recipe.tags?.length) {
        untagged.push(recipe)
        continue
      }
      for (const tag of recipe.tags) {
        if (!groups[tag]) groups[tag] = []
        groups[tag]!.push(recipe)
      }
    }

    const result: RecipeGroup[] = Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, items]) => ({ label: tag, items }))

    if (untagged.length > 0) {
      result.push({ label: 'Untagged', items: untagged })
    }
    return result
  }

  if (sortMode.value === 'rating') {
    const sorted = [...list].sort((a, b) =>
      (b.rating?.userRating ?? 0) - (a.rating?.userRating ?? 0),
    )
    return [{ label: 'All', items: sorted }]
  }

  // Default — keep score order from composable
  return [{ label: 'All', items: list }]
})
</script>
