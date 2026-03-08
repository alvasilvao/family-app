<template>
  <div style="display: flex; flex-direction: column; height: 100vh; background: #f7f3ee">
    <!-- Modals -->
    <AddRecipeModal v-if="showAddRecipe" @close="showAddRecipe = false" @import="handleImport" />
    <RecipeDetailModal v-if="detailRecipe" :recipe="detailRecipe" @close="detailRecipe = null" />
    <GroceryModal
      v-if="showGrocery"
      :week-key="currentWeek"
      :sections="grocerySections"
      :basket="basket"
      :recipes="allRecipes"
      @close="showGrocery = false"
    />

    <!-- Header -->
    <AppHeader
      :week-key="currentWeek"
      :total-servings="totalServings"
      @prev-week="goWeek(-1)"
      @next-week="goWeek(+1)"
      @add-recipe="showAddRecipe = true"
      @show-grocery="openGrocery"
    />

    <!-- Loading state -->
    <div v-if="recipesLoading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <!-- Recipe grid -->
    <div v-else style="flex: 1; overflow: auto; padding: 22px 20px 48px">
      <!-- Weekly picks -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px">
        <h2 style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #2a2520">
          This week's picks
        </h2>
        <div style="flex: 1; height: 1px; background: #e8e2da" />
      </div>

      <div style="margin-bottom: 36px">
        <RecipeGrid
          :recipes="weeklyRecipes"
          :basket="basket"
          @add="planAdd"
          @remove="planRemove"
          @view="viewRecipe"
        />
      </div>

      <!-- My Recipes -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px">
        <h2 style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #2a2520">
          My Recipes
        </h2>
        <span
          v-if="userRecipes.length > 0"
          style="
            background: #2d6a4f;
            color: #fff;
            border-radius: 999px;
            font-size: 10px;
            padding: 1px 7px;
            font-weight: 700;
          "
        >
          {{ userRecipes.length }}
        </span>
        <div style="flex: 1; height: 1px; background: #e8e2da" />
      </div>

      <div v-if="userRecipes.length === 0">
        <div
          style="
            border: 2px dashed #ddd6ce;
            border-radius: 14px;
            padding: 28px 20px;
            text-align: center;
          "
        >
          <p style="font-size: 22px; margin-bottom: 8px">&#x1f4cb;</p>
          <p style="font-size: 13px; color: #9b9590">Use the <strong>+ Add Recipe</strong> button on the top right to add your first recipe</p>
        </div>
      </div>
      <RecipeGrid
        v-else
        :recipes="userRecipes"
        :basket="basket"
        :deletable="true"
        @add="planAdd"
        @remove="planRemove"
        @delete="handleDelete"
        @view="viewRecipe"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { currentWeek, goWeek } = useWeek()
import type { RecipeData } from '~/composables/useRecipes'
const { recipes, userRecipes, loading: recipesLoading, fetchRecipes, addRecipe, deleteRecipe, getWeeklyRecipes } = useRecipes()
const { basket, totalServings, fetchPlan, add: planAdd, remove: planRemove, removeRecipeFromBasket } = usePlan()
const { sections: grocerySections, fetchGrocery } = useGrocery()

const showAddRecipe = ref(false)
const showGrocery = ref(false)
const detailRecipe = ref<RecipeData | null>(null)

function viewRecipe(id: string) {
  const recipe = recipes.value.find((r) => r.id === id)
  if (recipe) detailRecipe.value = recipe
}

const weeklyRecipes = computed(() => getWeeklyRecipes(currentWeek.value))
const allRecipes = computed(() => [...weeklyRecipes.value, ...userRecipes.value])

// Fetch recipes on mount
onMounted(() => {
  fetchRecipes()
})

// Fetch plan when week changes
watch(currentWeek, (weekKey) => {
  fetchPlan(weekKey)
}, { immediate: true })

async function openGrocery() {
  await fetchGrocery(currentWeek.value)
  showGrocery.value = true
}

async function handleImport(recipeData: any) {
  await addRecipe(recipeData)
}

async function handleDelete(id: string) {
  await deleteRecipe(id)
  removeRecipeFromBasket(id)
}
</script>
