<template>
  <div
    style="
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.48);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    "
    @click="$emit('close')"
  >
    <div
      class="slide-up"
      style="
        background: #fff;
        border-radius: 20px;
        width: 100%;
        max-width: 480px;
        max-height: 90dvh;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      "
      @click.stop
    >
      <!-- Visual header -->
      <FoodVisual :recipe="recipe" />

      <!-- Scrollable content -->
      <div style="flex: 1; overflow-y: auto; padding: 20px 24px 24px">
        <!-- Name + close -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px">
          <h2 style="font-family: 'Fraunces', serif; font-size: 21px; font-weight: 700; line-height: 1.3; flex: 1">
            {{ recipe.name }}
          </h2>
          <button
            style="
              background: #f5f0eb;
              border: none;
              border-radius: 50%;
              width: 36px;
              height: 36px;
              cursor: pointer;
              font-size: 18px;
              color: #6b6560;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: 12px;
              flex-shrink: 0;
            "
            @click="$emit('close')"
          >
            &times;
          </button>
        </div>

        <!-- Cook time -->
        <p v-if="recipe.cookTime" style="font-size: 13px; color: #9b9590; margin-bottom: 12px">
          &#x23F1; {{ recipe.cookTime }}
        </p>

        <!-- Tags -->
        <div v-if="recipe.tags?.length" style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 16px">
          <TagBadge v-for="t in recipe.tags" :key="t" :label="t" />
        </div>

        <!-- Description -->
        <p v-if="recipe.description" style="font-size: 13.5px; color: #4a4540; line-height: 1.65; margin-bottom: 20px">
          {{ recipe.description }}
        </p>

        <!-- Ingredients -->
        <div v-if="recipe.ingredients?.length">
          <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px">
            Ingredients <span style="font-weight: 400; color: #9b9590; font-family: 'DM Sans', sans-serif; font-size: 12px">(per serving)</span>
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0">
            <div
              v-for="(ing, i) in recipe.ingredients"
              :key="ing.name"
              :style="{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 0',
                borderBottom: i < recipe.ingredients.length - 1 ? '1px solid #f0ebe5' : 'none',
              }"
            >
              <span style="font-size: 13.5px; color: #2a2520">{{ ing.name }}</span>
              <span style="font-size: 12.5px; color: #9b9590; flex-shrink: 0; margin-left: 12px">
                {{ formatQuantity(ing.perServing) }} {{ ing.unit }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeData } from '~/composables/useRecipes'

defineProps<{
  recipe: RecipeData
}>()

defineEmits<{
  close: []
}>()

function formatQuantity(val: number): string {
  if (Number.isInteger(val)) return String(val)
  return val % 1 === 0 ? String(val) : val.toFixed(1).replace(/\.0$/, '')
}
</script>
