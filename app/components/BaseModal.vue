<template>
  <div
    class="modal-overlay"
    @click="$emit('close')"
  >
    <div
      class="slide-up modal-panel"
      v-bind="$attrs"
      @click.stop
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  close: []
}>()

defineOptions({
  inheritAttrs: false,
})
</script>
