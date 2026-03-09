<template>
  <div
    :class="['card', { selected: servings && servings > 0 }]"
    :style="{
      background: '#fff',
      borderRadius: '13px',
      overflow: 'hidden',
      boxShadow: servings && servings > 0 ? '0 6px 28px rgba(45,106,79,.16)' : '0 3px 16px rgba(0,0,0,.07)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }"
  >
    <div style="cursor: pointer" @click="$emit('view', recipe.id)">
      <FoodVisual :recipe="recipe" />
    </div>

    <div style="padding: 12px 14px 16px; flex: 1; display: flex; flex-direction: column; gap: 7px">
      <div style="display: flex; flex-wrap: wrap; gap: 4px">
        <TagBadge v-for="t in recipe.tags" :key="t" :label="t" />
      </div>
      <h3
        style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; line-height: 1.3; cursor: pointer"
        @click="$emit('view', recipe.id)"
      >
        {{ recipe.name }}
      </h3>
      <p
        style="font-size: 11.5px; color: #6b6560; line-height: 1.6; flex: 1; cursor: pointer"
        @click="$emit('view', recipe.id)"
      >
        {{ recipe.description }}
      </p>
      <div v-if="recipe.stats" style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 2px">
        <span style="font-size: 10px; color: #9b9590; background: #f5f0eb; border-radius: 999px; padding: 2px 8px">
          {{ recipe.stats.totalCount }}x cooked
        </span>
        <span
          v-if="recipe.stats.lastUsedDate"
          style="font-size: 10px; color: #9b9590; background: #f5f0eb; border-radius: 999px; padding: 2px 8px"
        >
          {{ recipe.stats.weeksSinceLast === 0 ? 'this week' : recipe.stats.weeksSinceLast === 1 ? '1 week ago' : `${recipe.stats.weeksSinceLast}w ago` }}
        </span>
        <span
          v-else
          style="font-size: 10px; color: #b0a89e; background: #f5f0eb; border-radius: 999px; padding: 2px 8px"
        >
          never cooked
        </span>
        <span style="font-size: 10px; color: #2d6a4f; background: #e8f5ee; border-radius: 999px; padding: 2px 8px; font-weight: 600">
          {{ recipe.stats.score }}
        </span>
      </div>
      <div v-if="servings != null" style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px">
        <span
          :style="{
            fontSize: '11px',
            color: servings > 0 ? '#2d6a4f' : '#9b9590',
            fontWeight: servings > 0 ? 600 : 400,
          }"
        >
          {{ servings > 0 ? `${servings} serving${servings > 1 ? 's' : ''}` : 'Add to basket' }}
        </span>
        <div style="display: flex; align-items: center; gap: 6px">
          <button
            v-if="servings > 0"
            class="counter-btn counter-btn-circle"
            style="width: 34px; height: 34px; transition: all .18s"
            @click="$emit('remove', recipe.id)"
          >
            &minus;
          </button>
          <span
            v-if="servings > 0"
            style="font-size: 14px; font-weight: 700; color: #2d6a4f; min-width: 16px; text-align: center"
          >
            {{ servings }}
          </span>
          <button
            class="counter-btn counter-btn-circle"
            :style="{
              width: '34px',
              height: '34px',
              background: servings > 0 ? '#fff' : '#2d6a4f',
              color: servings > 0 ? '#2d6a4f' : '#fff',
              transition: 'all .18s',
            }"
            @click="$emit('add', recipe.id)"
          >
            +
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { RecipeData } from '~/composables/useRecipes'

defineProps<{
  recipe: RecipeData
  servings?: number
}>()

defineEmits<{
  add: [id: string]
  remove: [id: string]
  view: [id: string]
}>()
</script>
