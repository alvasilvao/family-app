<template>
  <div class="empty-state">
    <p class="empty-emoji">{{ emoji }}</p>
    <p class="empty-title">{{ title }}</p>
    <p v-if="message" class="empty-subtitle">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  emoji: string
  title: string
  message?: string
}>()
</script>
