<template>
  <div style="background: #2d6a4f; flex-shrink: 0; padding: calc(14px + env(safe-area-inset-top, 0px)) 20px 16px; display: flex; align-items: center; gap: 10px">
    <NuxtLink :to="backTo || '/'" aria-label="Go back" class="page-header__back">&larr;</NuxtLink>
    <h1 style="font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; color: #fff; flex: 1; text-align: center">
      {{ title }}
    </h1>
    <slot name="right" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  backTo?: string
}>()
</script>

<style scoped>
.page-header__back {
  color: #fff;
  text-decoration: none;
  font-size: 20px;
  display: flex;
  align-items: center;
}

@media (max-width: 767px) {
  .page-header__back {
    display: none;
  }
}
</style>
