<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 13px">
    <div
      v-for="(recipe, i) in recipes"
      :key="recipe.id"
      class="fade-in"
      :style="{ animationDelay: `${i * 0.07}s` }"
    >
      <RecipeCard
        :recipe="recipe"
        :servings="basket[recipe.id] || 0"
        @add="$emit('add', $event)"
        @remove="$emit('remove', $event)"
        @view="$emit('view', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeData } from '~/composables/useRecipes'

defineProps<{
  recipes: RecipeData[]
  basket: Record<string, number>
}>()

defineEmits<{
  add: [id: string]
  remove: [id: string]
  view: [id: string]
}>()
</script>
