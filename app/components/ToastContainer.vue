<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast-item', `toast-${toast.type}`]"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: calc(16px + env(safe-area-inset-top, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
  width: calc(100% - 32px);
  max-width: 420px;
}

.toast-item {
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  text-align: center;
}

.toast-error {
  background: #c0392b;
  color: #fff;
}

.toast-success {
  background: #2d6a4f;
  color: #fff;
}

.toast-info {
  background: #fff;
  color: #1a1a1a;
  border: 1px solid #e8e2db;
}

.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
