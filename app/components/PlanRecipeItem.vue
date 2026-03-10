<template>
  <div
    :style="{
      background: '#fff',
      borderRadius: '13px',
      padding: '14px 16px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      opacity: cooked ? 0.6 : 1,
    }"
  >
    <!-- Cooked toggle checkbox -->
    <button
      v-if="!cooked"
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
      @click="$emit('toggle-cooked', recipe.id)"
    />
    <button
      v-else
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
      @click="$emit('toggle-cooked', recipe.id)"
    >
      &#x2713;
    </button>

    <!-- Emoji avatar -->
    <div
      :style="{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: recipe.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        flexShrink: 0,
        cursor: 'pointer',
      }"
      @click="$emit('view', recipe.id)"
    >
      {{ recipe.emoji }}
    </div>

    <!-- Name & meta -->
    <div style="flex: 1; min-width: 0; cursor: pointer" @click="$emit('view', recipe.id)">
      <p
        :style="{
          fontFamily: '\'Fraunces\', serif',
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: '1.3',
          textDecoration: cooked ? 'line-through' : 'none',
          color: cooked ? '#9b9590' : undefined,
        }"
      >
        {{ recipe.name }}
      </p>
      <p style="font-size: 11.5px; color: #9b9590; margin-top: 2px">
        {{ recipe.cookTime || recipe.cook_time }} &middot; {{ recipe.ingredients?.length ?? 0 }} ingredients
      </p>
    </div>

    <!-- Servings controls (editable) or static count -->
    <div v-if="!planClosed" style="display: flex; align-items: center; gap: 6px; flex-shrink: 0">
      <button class="counter-btn counter-btn-circle" @click="$emit('remove', recipe.id)">&minus;</button>
      <span style="font-size: 14px; font-weight: 700; color: #2d6a4f; min-width: 20px; text-align: center">
        {{ servings }}
      </span>
      <button class="counter-btn counter-btn-circle" @click="$emit('update-servings', recipe.id)">+</button>
    </div>
    <span
      v-else
      :style="{
        fontSize: '14px',
        fontWeight: 700,
        color: cooked ? '#9b9590' : '#2d6a4f',
        minWidth: '20px',
        textAlign: 'center',
      }"
    >
      {{ servings }}x
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  recipe: {
    id: string
    name: string
    emoji: string
    color: string
    cookTime?: string
    cook_time?: string
    ingredients?: any[]
    [key: string]: any
  }
  servings: number
  cooked: boolean
  planClosed: boolean
}>()

defineEmits<{
  view: [id: string]
  'toggle-cooked': [id: string]
  'update-servings': [id: string]
  remove: [id: string]
}>()
</script>
