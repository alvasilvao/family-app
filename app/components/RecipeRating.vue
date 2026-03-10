<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <div style="display: flex; gap: 2px">
      <span
        v-for="star in 5"
        :key="star"
        :style="{
          fontSize: size === 'sm' ? '14px' : '20px',
          color: star <= (userRating ?? 0) ? '#2d6a4f' : '#d5d0cb',
          cursor: readonly ? 'default' : 'pointer',
          transition: 'color .15s',
        }"
        @click="!readonly && $emit('rate', star)"
      >
        &#x2605;
      </span>
    </div>
    <span
      v-if="ratingCount > 0"
      :style="{
        fontSize: size === 'sm' ? '10px' : '12px',
        color: '#9b9590',
      }"
    >
      {{ avgRating }} avg · {{ ratingCount }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  userRating: number | null
  avgRating: number | null
  ratingCount: number
  readonly?: boolean
  size?: 'sm' | 'md'
}>()

defineEmits<{
  rate: [value: number]
}>()
</script>
