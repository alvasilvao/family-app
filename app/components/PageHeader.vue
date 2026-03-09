<template>
  <div class="safe-top" style="background: #2d6a4f; flex-shrink: 0; padding: 14px 20px 16px; display: flex; align-items: center; gap: 10px">
    <NuxtLink to="/" style="color: #fff; text-decoration: none; font-size: 20px; display: flex; align-items: center">&larr;</NuxtLink>
    <h1 style="font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; color: #fff; flex: 1">
      {{ title }}
    </h1>
    <slot name="right" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
