<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <div style="display: flex; gap: 2px">
      <span
        v-for="star in 5"
        :key="star"
        :style="{
          position: 'relative',
          fontSize: size === 'sm' ? '14px' : '20px',
          lineHeight: 1,
          cursor: readonly ? 'default' : 'pointer',
          userSelect: 'none',
        }"
      >
        <!-- Empty star (background) -->
        <span :style="{ color: '#d5d0cb' }">&#x2605;</span>

        <!-- Filled overlay, clipped to the fill fraction -->
        <span
          v-if="fillFor(star) > 0"
          :style="{
            position: 'absolute',
            left: 0,
            top: 0,
            overflow: 'hidden',
            width: fillFor(star) * 100 + '%',
            color: '#2d6a4f',
            pointerEvents: 'none',
          }"
        >&#x2605;</span>

        <!-- Left-half click zone (gives n - 0.5) -->
        <span
          v-if="!readonly"
          :style="{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '50%',
            height: '100%',
            cursor: 'pointer',
          }"
          :aria-label="`Rate ${star - 0.5} out of 5 stars`"
          role="button"
          @click="$emit('rate', Math.max(1, star - 0.5))"
        />

        <!-- Right-half click zone (gives n) -->
        <span
          v-if="!readonly"
          :style="{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '50%',
            height: '100%',
            cursor: 'pointer',
          }"
          :aria-label="`Rate ${star} out of 5 stars`"
          role="button"
          @click="$emit('rate', star)"
        />
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
const props = defineProps<{
  userRating: number | null
  avgRating: number | null
  ratingCount: number
  readonly?: boolean
  size?: 'sm' | 'md'
}>()

defineEmits<{
  rate: [value: number]
}>()

function fillFor(star: number): number {
  const rating = props.userRating ?? 0
  if (rating >= star) return 1
  if (rating >= star - 0.5) return 0.5
  return 0
}
</script>
