<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Modals -->
    <AddRecipeModal v-if="showAddRecipe" @close="showAddRecipe = false" @import="addRecipe" />
    <RecipeDetailModal
      v-if="detailRecipe"
      :recipe="detailRecipe"
      :deletable="userRecipeIds.has(detailRecipe.id)"
      :editable="userRecipeIds.has(detailRecipe.id)"
      @close="detailRecipeId = null"
      @delete="handleDelete($event); detailRecipeId = null"
      @update="handleUpdate($event)"
    />

    <!-- Header -->
    <PageHeader title="Recipes">
      <template #right>
        <NuxtLink
          to="/recipe-links"
          style="
            background: rgba(255,255,255,.15);
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
          "
          aria-label="Inspiration links"
        >
          &#x1F517;
        </NuxtLink>
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
          aria-label="Add recipe"
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

    <!-- Error state -->
    <div v-else-if="recipesError" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px">
      <p style="font-size: 14px; color: #9b9590">Failed to load recipes</p>
      <button
        style="background: #2d6a4f; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif"
        @click="retry"
      >
        Try again
      </button>
    </div>

    <!-- Content -->
    <div v-else class="page-content-wide" style="flex: 1; overflow: auto; padding: 16px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <RecipeBrowser :recipes="recipes" @view="viewRecipe" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { recipes, userRecipes, loading: recipesLoading, error: recipesError, fetchRecipes, fetchStats, addRecipe, updateRecipe, deleteRecipe } = useRecipes()

const showAddRecipe = ref(false)
const detailRecipeId = ref<string | null>(null)
const detailRecipe = computed(() =>
  detailRecipeId.value ? recipes.value.find((r) => r.id === detailRecipeId.value) ?? null : null,
)
const userRecipeIds = computed(() => new Set(userRecipes.value.map((r) => r.id)))

function viewRecipe(id: string) {
  detailRecipeId.value = id
}

function retry() {
  fetchRecipes().then(() => fetchStats())
}

onMounted(() => {
  retry()

  function onFocus() {
    if (document.visibilityState === 'visible') retry()
  }
  document.addEventListener('visibilitychange', onFocus)
  onUnmounted(() => document.removeEventListener('visibilitychange', onFocus))
})

async function handleUpdate(recipe: RecipeData) {
  const updated = await updateRecipe(recipe.id, recipe)
  detailRecipeId.value = updated.id
}

async function handleDelete(id: string) {
  await deleteRecipe(id)
}
</script>
