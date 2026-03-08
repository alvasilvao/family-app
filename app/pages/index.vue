<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Modals -->
    <AddRecipeModal v-if="showAddRecipe" @close="showAddRecipe = false" @import="handleImport" />
    <RecipeDetailModal v-if="detailRecipe" :recipe="detailRecipe" @close="detailRecipe = null" />

    <!-- Header -->
    <AppHeader
      :week-key="currentWeek"
      :total-servings="totalServings"
      :active-tab="activeTab"
      @prev-week="goWeek(-1)"
      @next-week="goWeek(+1)"
      @add-recipe="showAddRecipe = true"
      @change-tab="activeTab = $event"
    />

    <!-- Loading state -->
    <div v-if="recipesLoading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <!-- Tab: Recipes -->
    <div v-else-if="activeTab === 'recipes'" style="flex: 1; overflow: auto; padding: 22px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Built-in recipes -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px">
        <h2 style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #2a2520">
          Recipes
        </h2>
        <div style="flex: 1; height: 1px; background: #e8e2da" />
      </div>

      <div style="margin-bottom: 36px">
        <RecipeGrid
          :recipes="builtInRecipes"
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

    <!-- Tab: Weekly Plan -->
    <div v-else-if="activeTab === 'plan'" style="flex: 1; overflow: auto; padding: 22px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <div v-if="selectedRecipes.length === 0" style="text-align: center; padding: 60px 20px">
        <p style="font-size: 32px; margin-bottom: 12px">&#x1f372;</p>
        <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #2a2520; margin-bottom: 6px">
          No meals planned yet
        </p>
        <p style="font-size: 13px; color: #9b9590; line-height: 1.5">
          Go to <strong>Recipes</strong> and add servings to plan your week.
        </p>
      </div>

      <div v-else>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px">
          <h2 style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #2a2520">
            This week's plan
          </h2>
          <span
            style="
              background: #2d6a4f;
              color: #fff;
              border-radius: 999px;
              font-size: 10px;
              padding: 1px 7px;
              font-weight: 700;
            "
          >
            {{ totalServings }} serving{{ totalServings > 1 ? 's' : '' }}
          </span>
          <div style="flex: 1; height: 1px; background: #e8e2da" />
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px">
          <div
            v-for="sr in selectedRecipes"
            :key="sr.recipe.id"
            style="
              background: #fff;
              border-radius: 13px;
              padding: 14px 16px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
              display: flex;
              align-items: center;
              gap: 14px;
            "
          >
            <div
              :style="{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: sr.recipe.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }"
            >
              {{ sr.recipe.emoji }}
            </div>
            <div style="flex: 1; min-width: 0">
              <p style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; line-height: 1.3">
                {{ sr.recipe.name }}
              </p>
              <p style="font-size: 11.5px; color: #9b9590; margin-top: 2px">
                {{ sr.recipe.cookTime }} &middot; {{ sr.recipe.ingredients.length }} ingredients
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0">
              <button
                class="counter-btn"
                style="
                  width: 36px;
                  height: 36px;
                  border-radius: 50%;
                  border: 1.5px solid #2d6a4f;
                  background: #fff;
                  color: #2d6a4f;
                  font-size: 17px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
                @click="planRemove(sr.recipe.id)"
              >
                &minus;
              </button>
              <span style="font-size: 14px; font-weight: 700; color: #2d6a4f; min-width: 20px; text-align: center">
                {{ sr.servings }}
              </span>
              <button
                class="counter-btn"
                style="
                  width: 36px;
                  height: 36px;
                  border-radius: 50%;
                  border: 1.5px solid #2d6a4f;
                  background: #fff;
                  color: #2d6a4f;
                  font-size: 17px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
                @click="planAdd(sr.recipe.id)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Grocery List -->
    <div v-else-if="activeTab === 'grocery'" style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <div v-if="totalServings === 0" style="text-align: center; padding: 60px 20px">
        <p style="font-size: 32px; margin-bottom: 12px">&#x1f6d2;</p>
        <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #2a2520; margin-bottom: 6px">
          Your grocery list is empty
        </p>
        <p style="font-size: 13px; color: #9b9590; line-height: 1.5">
          Add servings to recipes to generate your grocery list.
        </p>
      </div>

      <div v-else>
        <!-- Progress -->
        <div style="padding: 16px 20px 12px">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px">
            <span style="font-size: 11px; color: #9b9590">{{ checkedCount }} of {{ groceryTotal }} items ticked off</span>
            <div style="display: flex; align-items: center; gap: 10px">
              <span v-if="checkedCount === groceryTotal && groceryTotal > 0" style="font-size: 11px; color: #2d6a4f; font-weight: 600">
                &#x2713; All done!
              </span>
              <button
                v-if="checkedCount > 0"
                style="
                  font-size: 11px;
                  color: #9b9590;
                  background: none;
                  border: none;
                  cursor: pointer;
                  font-family: 'DM Sans', sans-serif;
                  padding: 8px 4px;
                "
                @click="clearGroceryChecked()"
              >
                Clear ticks
              </button>
            </div>
          </div>
          <div style="height: 4px; background: #f0ebe4; border-radius: 999px">
            <div
              :style="{
                height: '4px',
                background: '#2d6a4f',
                borderRadius: '999px',
                width: `${groceryTotal > 0 ? (checkedCount / groceryTotal) * 100 : 0}%`,
                transition: 'width .3s',
              }"
            />
          </div>
        </div>

        <!-- Recipe pills -->
        <div style="padding: 0 20px 14px; display: flex; flex-wrap: wrap; gap: 5px">
          <span
            v-for="sr in selectedRecipes"
            :key="sr.recipe.id"
            style="background: #f5f0eb; border-radius: 999px; padding: 3px 10px; font-size: 11px; color: #4a4540"
          >
            {{ sr.recipe.emoji }}
            <span style="color: #2d6a4f; font-weight: 700">{{ sr.servings }}&times;</span>
            {{ sr.recipe.name }}
          </span>
        </div>

        <!-- Sections -->
        <div v-for="section in grocerySections" :key="section.label">
          <div style="display: flex; align-items: center; gap: 7px; padding: 13px 20px 5px">
            <span style="font-size: 15px">{{ section.icon }}</span>
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
              {{ section.label }}
            </span>
            <div style="flex: 1; height: 1px; background: #f0ebe4; margin-left: 4px" />
            <span style="font-size: 11px; color: #b0a89e">{{ section.items.length }}</span>
          </div>
          <div
            v-for="(item, idx) in section.items"
            :key="`${section.label}:${idx}`"
            class="ing-row"
            style="cursor: pointer"
            @click="toggleGroceryItem(`${section.label}:${idx}`)"
          >
            <div style="display: flex; align-items: center; gap: 11px">
              <div
                :style="{
                  width: '22px',
                  height: '22px',
                  borderRadius: '5px',
                  flexShrink: 0,
                  transition: 'all .15s',
                  border: `1.5px solid ${groceryChecked[`${section.label}:${idx}`] ? '#2d6a4f' : '#d4ccc4'}`,
                  background: groceryChecked[`${section.label}:${idx}`] ? '#2d6a4f' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }"
              >
                <span v-if="groceryChecked[`${section.label}:${idx}`]" style="color: #fff; font-size: 11px">&#x2713;</span>
              </div>
              <span
                :style="{
                  fontSize: '13.5px',
                  color: groceryChecked[`${section.label}:${idx}`] ? '#b0a89e' : '#1a1a1a',
                  textDecoration: groceryChecked[`${section.label}:${idx}`] ? 'line-through' : 'none',
                  transition: 'all .15s',
                }"
              >
                {{ item.name }}
              </span>
            </div>
            <span
              :style="{
                fontSize: '13px',
                fontWeight: 700,
                color: groceryChecked[`${section.label}:${idx}`] ? '#b0a89e' : '#2d6a4f',
                background: groceryChecked[`${section.label}:${idx}`] ? '#f5f5f5' : '#e8f5ee',
                padding: '2px 11px',
                borderRadius: '999px',
                flexShrink: 0,
                transition: 'all .15s',
              }"
            >
              {{ item.qty }} {{ item.unit }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

import type { RecipeData } from '~/composables/useRecipes'

const { currentWeek, goWeek } = useWeek()
const { recipes, builtInRecipes, userRecipes, loading: recipesLoading, fetchRecipes, addRecipe, deleteRecipe } = useRecipes()
const { basket, groceryChecked, totalServings, fetchPlan, add: planAdd, remove: planRemove, removeRecipeFromBasket, toggleGroceryItem, clearGroceryChecked } = usePlan()
const { sections: grocerySections, fetchGrocery } = useGrocery()

const route = useRoute()
const router = useRouter()
const activeTab = computed({
  get: () => (['recipes', 'plan', 'grocery'].includes(route.query.tab as string) ? route.query.tab as string : 'recipes'),
  set: (val: string) => {
    router.replace({ query: { ...route.query, tab: val } })
  },
})
const showAddRecipe = ref(false)
const detailRecipe = ref<RecipeData | null>(null)

const groceryTotal = computed(() => grocerySections.value.reduce((sum, s) => sum + s.items.length, 0))
const checkedCount = computed(() => Object.values(groceryChecked.value).filter(Boolean).length)

function viewRecipe(id: string) {
  const recipe = recipes.value.find((r) => r.id === id)
  if (recipe) detailRecipe.value = recipe
}

const selectedRecipes = computed(() =>
  Object.entries(basket.value)
    .filter(([, s]) => s > 0)
    .map(([id, servings]) => ({
      recipe: recipes.value.find((r) => r.id === id)!,
      servings,
    }))
    .filter((x) => x.recipe),
)

// Fetch recipes on mount
onMounted(() => {
  fetchRecipes()
})

// Fetch plan when week changes
watch(currentWeek, (weekKey) => {
  fetchPlan(weekKey)
}, { immediate: true })

// Fetch grocery data when switching to grocery tab or when basket changes
watch([activeTab, basket], async ([tab]) => {
  if (tab === 'grocery' && totalServings.value > 0) {
    await fetchGrocery(currentWeek.value)
  }
}, { deep: true })

async function handleImport(recipeData: any) {
  await addRecipe(recipeData)
}

async function handleDelete(id: string) {
  await deleteRecipe(id)
  removeRecipeFromBasket(id)
}
</script>
