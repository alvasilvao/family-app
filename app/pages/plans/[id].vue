<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Modals -->
    <RecipeDetailModal
      v-if="detailRecipe"
      :recipe="detailRecipe"
      :deletable="false"
      :editable="false"
      @close="detailRecipe = null"
    />

    <!-- Confirm close modal -->
    <div
      v-if="showCloseConfirm"
      style="
        position: fixed;
        inset: 0;
        z-index: 100;
        background: rgba(0,0,0,.4);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      "
      @click.self="showCloseConfirm = false"
    >
      <div style="background: #fff; border-radius: 16px; padding: 24px; max-width: 340px; width: 100%; text-align: center">
        <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; margin-bottom: 8px">
          Close this plan?
        </p>
        <p style="font-size: 13px; color: #9b9590; line-height: 1.5; margin-bottom: 20px">
          Its ingredients will appear in your shopping list.
        </p>
        <div style="display: flex; gap: 10px">
          <button
            style="flex: 1; background: #f5f0eb; border: none; border-radius: 10px; padding: 12px; font-size: 14px; font-weight: 600; color: #9b9590; cursor: pointer; font-family: 'DM Sans', sans-serif"
            @click="showCloseConfirm = false"
          >
            Cancel
          </button>
          <button
            style="flex: 1; background: #2d6a4f; border: none; border-radius: 10px; padding: 12px; font-size: 14px; font-weight: 600; color: #fff; cursor: pointer; font-family: 'DM Sans', sans-serif"
            @click="handleClose"
          >
            Close Plan
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <PageHeader :title="plan?.name || 'Plan'" back-to="/plans">
      <template #right>
        <button
          v-if="plan?.status === 'open' && totalServings > 0"
          style="
            background: #fff;
            border: none;
            border-radius: 10px;
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 600;
            color: #2d6a4f;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            box-shadow: 0 1px 4px rgba(0,0,0,.08);
          "
          @click="showCloseConfirm = true"
        >
          Close Plan
        </button>
        <button
          v-else-if="plan?.status === 'closed'"
          style="
            background: #fff;
            border: none;
            border-radius: 10px;
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 600;
            color: #b45309;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            box-shadow: 0 1px 4px rgba(0,0,0,.08);
          "
          @click="handleReopen"
        >
          Reopen
        </button>
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="recipesLoading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <!-- Closed plan: read-only view -->
    <div v-else-if="plan?.status === 'closed'" style="flex: 1; overflow: auto; padding: 22px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <div v-if="selectedRecipes.length === 0" style="text-align: center; padding: 60px 20px">
        <p style="font-size: 32px; margin-bottom: 12px">&#x1F4CB;</p>
        <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #2a2520; margin-bottom: 6px">
          No recipes in this plan
        </p>
      </div>

      <div v-else>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
          <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
            Planned meals
          </span>
          <span style="font-size: 12px; color: #2d6a4f; font-weight: 600">{{ totalServings }} servings</span>
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
              opacity: 0.7;
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
                cursor: 'pointer',
              }"
              @click="viewRecipe(sr.recipe.id)"
            >
              {{ sr.recipe.emoji }}
            </div>
            <div style="flex: 1; min-width: 0; cursor: pointer" @click="viewRecipe(sr.recipe.id)">
              <p style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; line-height: 1.3">
                {{ sr.recipe.name }}
              </p>
              <p style="font-size: 11.5px; color: #9b9590; margin-top: 2px">
                {{ sr.recipe.cookTime }} &middot; {{ sr.recipe.ingredients.length }} ingredients
              </p>
            </div>
            <span style="font-size: 14px; font-weight: 700; color: #2d6a4f; min-width: 20px; text-align: center">
              {{ sr.servings }}x
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Open plan: editable -->
    <div v-else style="flex: 1; overflow: auto; padding: 22px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Selected recipes summary -->
      <div v-if="selectedRecipes.length > 0" style="margin-bottom: 20px">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
          <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
            Planned meals
          </span>
          <span style="font-size: 12px; color: #2d6a4f; font-weight: 600">{{ totalServings }} servings</span>
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
                cursor: 'pointer',
              }"
              @click="viewRecipe(sr.recipe.id)"
            >
              {{ sr.recipe.emoji }}
            </div>
            <div style="flex: 1; min-width: 0; cursor: pointer" @click="viewRecipe(sr.recipe.id)">
              <p style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; line-height: 1.3">
                {{ sr.recipe.name }}
              </p>
              <p style="font-size: 11.5px; color: #9b9590; margin-top: 2px">
                {{ sr.recipe.cookTime }} &middot; {{ sr.recipe.ingredients.length }} ingredients
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0">
              <button class="counter-btn counter-btn-circle" @click="planRemove(sr.recipe.id)">&minus;</button>
              <span style="font-size: 14px; font-weight: 700; color: #2d6a4f; min-width: 20px; text-align: center">
                {{ sr.servings }}
              </span>
              <button class="counter-btn counter-btn-circle" @click="planAdd(sr.recipe.id)">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- All recipes to browse and add -->
      <div>
        <div style="display: flex; align-items: center; gap: 7px; margin-bottom: 12px">
          <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
            Add recipes
          </span>
          <div style="flex: 1; height: 1px; background: #e8e2da" />
        </div>
        <RecipeGrid
          :recipes="recipes"
          :basket="basket"
          @add="planAdd"
          @remove="planRemove"
          @view="viewRecipe"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeData } from '~/composables/useRecipes'

definePageMeta({ layout: false })

const route = useRoute()
const planId = route.params.id as string

const { recipes, loading: recipesLoading, fetchRecipes, fetchScores } = useRecipes()
const { plan, basket, totalServings, fetchPlan, add: planAdd, remove: planRemove, closePlan, reopenPlan } = usePlan()

const detailRecipe = ref<RecipeData | null>(null)
const showCloseConfirm = ref(false)

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

async function handleClose() {
  showCloseConfirm.value = false
  try {
    await closePlan(planId)
  } catch (err) {
    console.error('Failed to close plan:', err)
  }
}

async function handleReopen() {
  try {
    await reopenPlan(planId)
  } catch (err) {
    console.error('Failed to reopen plan:', err)
  }
}

onMounted(async () => {
  await fetchRecipes()
  await fetchPlan(planId)
  fetchScores(plan.value?.start_date)
})
</script>
