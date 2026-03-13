<template>
  <div style="display: flex; gap: 5px; justify-content: center">
    <div
      v-for="i in 3"
      :key="i"
      class="pulse"
      :style="{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: color,
        animationDelay: `${(i - 1) * 0.22}s`,
      }"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ color?: string }>(), { color: '#2d6a4f' })
</script>
