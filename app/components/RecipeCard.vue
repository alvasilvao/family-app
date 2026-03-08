<template>
  <div
    :class="['card', { selected: servings > 0 }]"
    :style="{
      background: '#fff',
      borderRadius: '13px',
      overflow: 'hidden',
      boxShadow: servings > 0 ? '0 6px 28px rgba(45,106,79,.16)' : '0 3px 16px rgba(0,0,0,.07)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }"
  >
    <FoodVisual :recipe="recipe" />

    <button
      v-if="deletable"
      class="del-btn"
      :style="{
        position: 'absolute',
        top: '7px',
        right: '7px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'rgba(0,0,0,.45)',
        border: 'none',
        color: '#fff',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }"
      @click="$emit('delete', recipe.id)"
    >
      &times;
    </button>

    <div style="padding: 12px 14px 16px; flex: 1; display: flex; flex-direction: column; gap: 7px">
      <div style="display: flex; flex-wrap: wrap; gap: 4px">
        <TagBadge v-for="t in recipe.tags" :key="t" :label="t" />
      </div>
      <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; line-height: 1.3">
        {{ recipe.name }}
      </h3>
      <p style="font-size: 11.5px; color: #6b6560; line-height: 1.6; flex: 1">
        {{ recipe.description }}
      </p>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px">
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
            class="counter-btn"
            :style="{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '1.5px solid #2d6a4f',
              background: '#fff',
              color: '#2d6a4f',
              fontSize: '17px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .18s',
            }"
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
            class="counter-btn"
            :style="{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '1.5px solid #2d6a4f',
              background: servings > 0 ? '#fff' : '#2d6a4f',
              color: servings > 0 ? '#2d6a4f' : '#fff',
              fontSize: '17px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
defineProps<{
  recipe: {
    id: string
    name: string
    description: string
    cookTime: string
    emoji: string
    color: string
    tags: string[]
  }
  servings: number
  deletable?: boolean
}>()

defineEmits<{
  add: [id: string]
  remove: [id: string]
  delete: [id: string]
}>()
</script>
