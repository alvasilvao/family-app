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
        :deletable="deletableIds ? deletableIds.has(recipe.id) : false"
        @add="$emit('add', $event)"
        @remove="$emit('remove', $event)"
        @delete="$emit('delete', $event)"
        @view="$emit('view', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeStats } from '~/composables/useRecipes'

defineProps<{
  recipes: Array<{
    id: string
    name: string
    description: string
    cookTime: string
    emoji: string
    color: string
    tags: string[]
    stats?: RecipeStats
  }>
  basket: Record<string, number>
  deletableIds?: Set<string>
}>()

defineEmits<{
  add: [id: string]
  remove: [id: string]
  delete: [id: string]
  view: [id: string]
}>()
</script>
