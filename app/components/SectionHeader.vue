<template>
  <div class="section-divider">
    <span class="section-label">{{ label }}</span>
    <div class="section-line" />
    <span v-if="count !== undefined" class="section-count">{{ count }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  count?: number
}>()
</script>
