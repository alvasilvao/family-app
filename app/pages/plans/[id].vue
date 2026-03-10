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

    <!-- Header -->
    <PageHeader :title="plan?.name || 'Plan'" back-to="/plans">
      <template #right>
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
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="recipesLoading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <!-- Closed plan: read-only view -->
    <div v-else-if="isClosed" class="page-content-wide" style="flex: 1; overflow: auto; padding: 22px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <div v-if="selectedRecipes.length === 0" style="text-align: center; padding: 60px 20px">
        <p style="font-size: 32px; margin-bottom: 12px">&#x1F4CB;</p>
        <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #2a2520; margin-bottom: 6px">
          No recipes in this plan
        </p>
      </div>

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
            <div
              v-for="sr in toCookRecipes"
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
              <button
                style="
                  width: 26px;
                  height: 26px;
                  border-radius: 50%;
                  border: 2px solid #d4cfc8;
                  background: #fff;
                  cursor: pointer;
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
                @click="toggleCooked(sr.recipe.id)"
              />
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

        <!-- Cooked (closed view) -->
        <div v-if="cookedRecipes.length > 0">
          <div style="display: flex; align-items: center; gap: 7px; margin-bottom: 10px">
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
              Cooked
            </span>
            <div style="flex: 1; height: 1px; background: #e8e2da" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px">
            <div
              v-for="sr in cookedRecipes"
              :key="sr.recipe.id"
              style="
                background: #fff;
                border-radius: 13px;
                padding: 14px 16px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
                display: flex;
                align-items: center;
                gap: 14px;
                opacity: 0.5;
              "
            >
              <button
                style="
                  width: 26px;
                  height: 26px;
                  border-radius: 50%;
                  border: 2px solid #2d6a4f;
                  background: #2d6a4f;
                  cursor: pointer;
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #fff;
                  font-size: 14px;
                  font-weight: 700;
                  line-height: 1;
                "
                @click="toggleCooked(sr.recipe.id)"
              >
                &#x2713;
              </button>
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
                <p style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; line-height: 1.3; text-decoration: line-through; color: #9b9590">
                  {{ sr.recipe.name }}
                </p>
                <p style="font-size: 11.5px; color: #9b9590; margin-top: 2px">
                  {{ sr.recipe.cookTime }} &middot; {{ sr.recipe.ingredients.length }} ingredients
                </p>
              </div>
              <span style="font-size: 14px; font-weight: 700; color: #9b9590; min-width: 20px; text-align: center">
                {{ sr.servings }}x
              </span>
            </div>
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
          <div
            v-for="sr in toCookRecipes"
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
            <button
              style="
                width: 26px;
                height: 26px;
                border-radius: 50%;
                border: 2px solid #d4cfc8;
                background: #fff;
                cursor: pointer;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
              "
              @click="toggleCooked(sr.recipe.id)"
            />
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

      <!-- Cooked -->
      <div v-if="cookedRecipes.length > 0" style="margin-bottom: 20px">
        <div style="display: flex; align-items: center; gap: 7px; margin-bottom: 10px">
          <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
            Cooked
          </span>
          <div style="flex: 1; height: 1px; background: #e8e2da" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px">
          <div
            v-for="sr in cookedRecipes"
            :key="sr.recipe.id"
            style="
              background: #fff;
              border-radius: 13px;
              padding: 14px 16px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
              display: flex;
              align-items: center;
              gap: 14px;
              opacity: 0.6;
            "
          >
            <button
              style="
                width: 26px;
                height: 26px;
                border-radius: 50%;
                border: 2px solid #2d6a4f;
                background: #2d6a4f;
                cursor: pointer;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 14px;
                font-weight: 700;
                line-height: 1;
              "
              @click="toggleCooked(sr.recipe.id)"
            >
              &#x2713;
            </button>
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
              <p style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; line-height: 1.3; text-decoration: line-through; color: #9b9590">
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
const { plan, basket, cooked, totalServings, fetchPlan, add: planAdd, remove: planRemove, toggleCooked, closePlan, reopenPlan } = usePlan()

const detailRecipeId = ref<string | null>(null)
const detailRecipe = computed(() =>
  detailRecipeId.value ? recipes.value.find((r) => r.id === detailRecipeId.value) ?? null : null,
)
const detailServings = computed(() =>
  detailRecipeId.value ? basket.value[detailRecipeId.value] || 1 : 1,
)
const showCloseConfirm = ref(false)
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

onMounted(async () => {
  await fetchRecipes()
  await fetchPlan(planId)
  fetchScores(plan.value?.start_date)
})
</script>
