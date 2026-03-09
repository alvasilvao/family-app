<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Modals -->
    <AddRecipeModal v-if="showAddRecipe" @close="showAddRecipe = false" @import="addRecipe" />
    <RecipeDetailModal
      v-if="detailRecipe"
      :recipe="detailRecipe"
      :deletable="userRecipeIds.has(detailRecipe.id)"
      :editable="userRecipeIds.has(detailRecipe.id)"
      @close="detailRecipe = null"
      @delete="handleDelete($event); detailRecipe = null"
      @update="handleUpdate($event)"
    />

    <!-- Header -->
    <PageHeader title="Recipes">
      <template #right>
        <button
          style="
            background: rgba(255,255,255,.15);
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          "
          @click="showAddRecipe = true"
        >
          +
        </button>
      </template>
    </PageHeader>

    <!-- Loading state -->
    <div v-if="recipesLoading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <!-- Content -->
    <div v-else style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Search + sort controls -->
      <div style="padding: 16px 20px 0">
        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search recipes..."
          class="form-input"
          style="width: 100%; padding: 10px 14px; font-size: 15px; border-radius: 10px; margin-bottom: 12px"
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
      </div>

      <!-- No results -->
      <div v-if="filteredRecipes.length === 0" style="text-align: center; padding: 40px 20px">
        <p style="font-size: 13px; color: #9b9590">No recipes found</p>
      </div>

      <!-- Flat grid (default / A-Z / search active) -->
      <div v-else-if="recipeGroups.length <= 1" style="padding: 0 20px 22px">
        <RecipeGrid
          :recipes="recipeGroups[0]?.items ?? []"
          @view="viewRecipe"
        />
      </div>

      <!-- Grouped grid (by tag) -->
      <div v-else style="padding: 0 20px 22px">
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
            @view="viewRecipe"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeData } from '~/composables/useRecipes'

definePageMeta({ layout: false })

const { recipes, userRecipes, loading: recipesLoading, fetchRecipes, fetchScores, addRecipe, updateRecipe, deleteRecipe } = useRecipes()

const showAddRecipe = ref(false)
const detailRecipe = ref<RecipeData | null>(null)
const userRecipeIds = computed(() => new Set(userRecipes.value.map((r) => r.id)))

const searchQuery = ref('')

type SortMode = 'default' | 'alphabetical' | 'tag'
const sortMode = ref<SortMode>('default')

const sortOptions: Array<{ label: string; value: SortMode }> = [
  { label: 'Default', value: 'default' },
  { label: 'A-Z', value: 'alphabetical' },
  { label: 'By tag', value: 'tag' },
]

const filteredRecipes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return recipes.value
  return recipes.value.filter((r) =>
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

  // Default — keep score order from composable
  return [{ label: 'All', items: list }]
})

function viewRecipe(id: string) {
  const recipe = recipes.value.find((r) => r.id === id)
  if (recipe) detailRecipe.value = recipe
}

onMounted(() => {
  fetchRecipes().then(() => fetchScores())
})

async function handleUpdate(recipe: RecipeData) {
  const updated = await updateRecipe(recipe.id, recipe)
  detailRecipe.value = updated
}

async function handleDelete(id: string) {
  await deleteRecipe(id)
}
</script>
