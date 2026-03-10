<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Modals -->
    <RecipeDetailModal
      v-if="detailRecipe"
      :recipe="detailRecipe"
      :deletable="false"
      :editable="false"
      :servings="detailServings"
      @close="detailRecipeId = null"
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
        <label
          style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; cursor: pointer; padding: 10px 12px; background: #f9f7f4; border-radius: 10px"
          @click.stop
        >
          <input
            v-model="addToShopping"
            type="checkbox"
            style="width: 18px; height: 18px; accent-color: #2d6a4f; cursor: pointer; flex-shrink: 0"
          />
          <span style="font-size: 13px; color: #4a4540; line-height: 1.4">
            Add ingredients to shopping list
          </span>
        </label>
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

    <!-- Confirm delete modal -->
    <div
      v-if="showDeleteConfirm"
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
      @click.self="showDeleteConfirm = false"
    >
      <div style="background: #fff; border-radius: 16px; padding: 24px; max-width: 340px; width: 100%; text-align: center">
        <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; margin-bottom: 8px">
          Delete this plan?
        </p>
        <p style="font-size: 13px; color: #9b9590; margin-bottom: 20px">
          This action cannot be undone.
        </p>
        <div style="display: flex; gap: 10px">
          <button
            style="flex: 1; background: #f5f0eb; border: none; border-radius: 10px; padding: 12px; font-size: 14px; font-weight: 600; color: #9b9590; cursor: pointer; font-family: 'DM Sans', sans-serif"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </button>
          <button
            style="flex: 1; background: #dc2626; border: none; border-radius: 10px; padding: 12px; font-size: 14px; font-weight: 600; color: #fff; cursor: pointer; font-family: 'DM Sans', sans-serif"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <PageHeader :title="plan?.name || 'Plan'" back-to="/plans">
      <template #right>
        <div style="display: flex; gap: 8px">
          <button
            v-if="plan"
            style="
              background: #fff;
              border: none;
              border-radius: 10px;
              padding: 8px 14px;
              font-size: 13px;
              font-weight: 600;
              color: #dc2626;
              cursor: pointer;
              font-family: 'DM Sans', sans-serif;
              box-shadow: 0 1px 4px rgba(0,0,0,.08);
            "
            @click="showDeleteConfirm = true"
          >
            Delete
          </button>
          <button
            v-if="!isClosed && plan?.status === 'open' && totalServings > 0"
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
            v-else-if="isClosed"
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
        </div>
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="recipesLoading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <!-- Closed plan: read-only view -->
    <div v-else-if="isClosed" class="page-content-wide" style="flex: 1; overflow: auto; padding: 22px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <EmptyState
        v-if="selectedRecipes.length === 0"
        emoji="&#x1F4CB;"
        title="No recipes in this plan"
      />

      <div v-else>
        <!-- To cook (closed view) -->
        <div v-if="toCookRecipes.length > 0" style="margin-bottom: 16px">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
              To cook
            </span>
            <span style="font-size: 12px; color: #2d6a4f; font-weight: 600">{{ totalServings }} servings</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px">
            <PlanRecipeItem
              v-for="sr in toCookRecipes"
              :key="sr.recipe.id"
              :recipe="sr.recipe"
              :servings="sr.servings"
              :cooked="false"
              :plan-closed="true"
              @view="viewRecipe"
              @toggle-cooked="toggleCooked"
            />
          </div>
        </div>

        <!-- Cooked (closed view) -->
        <div v-if="cookedRecipes.length > 0">
          <SectionHeader label="Cooked" style="margin-bottom: 10px" />
          <div style="display: flex; flex-direction: column; gap: 10px">
            <PlanRecipeItem
              v-for="sr in cookedRecipes"
              :key="sr.recipe.id"
              :recipe="sr.recipe"
              :servings="sr.servings"
              :cooked="true"
              :plan-closed="true"
              @view="viewRecipe"
              @toggle-cooked="toggleCooked"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Open plan: editable -->
    <div v-else class="page-content-wide" style="flex: 1; overflow: auto; padding: 22px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- To cook -->
      <div v-if="toCookRecipes.length > 0" style="margin-bottom: 20px">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
          <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
            To cook
          </span>
          <span style="font-size: 12px; color: #2d6a4f; font-weight: 600">{{ totalServings }} servings</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px">
          <PlanRecipeItem
            v-for="sr in toCookRecipes"
            :key="sr.recipe.id"
            :recipe="sr.recipe"
            :servings="sr.servings"
            :cooked="false"
            :plan-closed="false"
            @view="viewRecipe"
            @toggle-cooked="toggleCooked"
            @update-servings="planAdd"
            @remove="planRemove"
          />
        </div>
      </div>

      <!-- Cooked -->
      <div v-if="cookedRecipes.length > 0" style="margin-bottom: 20px">
        <SectionHeader label="Cooked" style="margin-bottom: 10px" />
        <div style="display: flex; flex-direction: column; gap: 10px">
          <PlanRecipeItem
            v-for="sr in cookedRecipes"
            :key="sr.recipe.id"
            :recipe="sr.recipe"
            :servings="sr.servings"
            :cooked="true"
            :plan-closed="false"
            @view="viewRecipe"
            @toggle-cooked="toggleCooked"
            @update-servings="planAdd"
            @remove="planRemove"
          />
        </div>
      </div>

      <!-- All recipes to browse and add -->
      <div>
        <SectionHeader label="Add recipes" style="margin-bottom: 12px" />
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

const { recipes, loading: recipesLoading, fetchRecipes, fetchScores, fetchRatings } = useRecipes()
const { plan, basket, cooked, totalServings, fetchPlan, add: planAdd, remove: planRemove, toggleCooked, closePlan, reopenPlan, deletePlan } = usePlan()

const detailRecipeId = ref<string | null>(null)
const detailRecipe = computed(() =>
  detailRecipeId.value ? recipes.value.find((r) => r.id === detailRecipeId.value) ?? null : null,
)
const detailServings = computed(() =>
  detailRecipeId.value ? basket.value[detailRecipeId.value] || 1 : 1,
)
const showCloseConfirm = ref(false)
const showDeleteConfirm = ref(false)
const addToShopping = ref(true)

const isClosed = computed(() => plan.value?.status === 'closed' || plan.value?.status === 'closed_no_shop')

function viewRecipe(id: string) {
  detailRecipeId.value = id
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

const toCookRecipes = computed(() =>
  selectedRecipes.value.filter((sr) => !cooked.value[sr.recipe.id]),
)

const cookedRecipes = computed(() =>
  selectedRecipes.value.filter((sr) => cooked.value[sr.recipe.id]),
)

async function handleClose() {
  showCloseConfirm.value = false
  try {
    await closePlan(planId, addToShopping.value)
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

async function handleDelete() {
  showDeleteConfirm.value = false
  try {
    await deletePlan(planId)
    navigateTo('/plans')
  } catch (err) {
    console.error('Failed to delete plan:', err)
  }
}

onMounted(async () => {
  await fetchRecipes()
  await fetchPlan(planId)
  fetchScores(plan.value?.start_date)
  fetchRatings()
})
</script>
