<template>
  <div style="display: flex; flex-direction: column; height: 100vh; background: #f7f3ee">
    <!-- Modals -->
    <AddRecipeModal v-if="showAddRecipe" @close="showAddRecipe = false" @import="handleImport" />
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
          :style="{
            border: '2px dashed #ddd6ce',
            borderRadius: '14px',
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color .2s',
          }"
          @click="showAddRecipe = true"
          @mouseenter="($event.currentTarget as HTMLElement).style.borderColor = '#2d6a4f'"
          @mouseleave="($event.currentTarget as HTMLElement).style.borderColor = '#ddd6ce'"
        >
          <p style="font-size: 22px; margin-bottom: 8px">&#x1f4cb;</p>
          <p style="font-size: 13px; color: #9b9590">Paste a recipe as JSON to add it</p>
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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { currentWeek, goWeek } = useWeek()
const { recipes, userRecipes, loading: recipesLoading, fetchRecipes, addRecipe, deleteRecipe, getWeeklyRecipes } = useRecipes()
const { basket, totalServings, fetchPlan, add: planAdd, remove: planRemove, removeRecipeFromBasket } = usePlan()
const { sections: grocerySections, fetchGrocery } = useGrocery()

const showAddRecipe = ref(false)
const showGrocery = ref(false)

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
