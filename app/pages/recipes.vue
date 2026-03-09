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

    <!-- Recipe grid -->
    <div v-else style="flex: 1; overflow: auto; padding: 22px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <RecipeGrid
        :recipes="recipes"
        @view="viewRecipe"
      />
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
