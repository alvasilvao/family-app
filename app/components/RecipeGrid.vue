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
        :deletable="deletable"
        @add="$emit('add', $event)"
        @remove="$emit('remove', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  recipes: Array<{
    id: string
    name: string
    description: string
    cookTime: string
    emoji: string
    color: string
    tags: string[]
  }>
  basket: Record<string, number>
  deletable?: boolean
}>()

defineEmits<{
  add: [id: string]
  remove: [id: string]
  delete: [id: string]
}>()
</script>
