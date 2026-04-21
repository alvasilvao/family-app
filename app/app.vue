<template>
  <div
    v-if="!appReady"
    class="app-splash"
    aria-hidden="true"
  >
    <div class="app-splash__logo">&#x1F3E0;</div>
    <div class="app-splash__title">Family App</div>
  </div>

  <NuxtPage />
  <ToastContainer />
</template>

<script setup lang="ts">
const appReady = ref(false)

onMounted(() => {
  nextTick(() => {
    appReady.value = true
  })
})
</script>

<style>
.app-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #f7f3ee;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  /* system font so we paint before Google Fonts arrives */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.app-splash__logo {
  font-size: 56px;
  line-height: 1;
}

.app-splash__title {
  font-size: 18px;
  font-weight: 600;
  color: #2d6a4f;
  letter-spacing: 0.3px;
}
</style>
