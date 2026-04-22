<template>
  <nav v-if="visible" class="mobile-bottom-nav" aria-label="Primary">
    <div class="mobile-bottom-nav__inner">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="mobile-bottom-nav__item"
        :class="{ 'mobile-bottom-nav__item--active': isActive(item) }"
      >
        <span class="mobile-bottom-nav__icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="mobile-bottom-nav__label">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

type NavItem = { to: string; icon: string; label: string; match?: string[] }

const items: readonly NavItem[] = [
  { to: '/recipes', icon: '🍳', label: 'Recipes' },
  { to: '/plans', icon: '📅', label: 'Plans', match: ['/plans'] },
  { to: '/shopping', icon: '🛒', label: 'Shopping' },
  { to: '/history', icon: '📊', label: 'History' },
  { to: '/profile', icon: '👤', label: 'Profile', match: ['/profile', '/media', '/notes', '/todos'] },
] as const

function isActive(item: NavItem) {
  const path = route.path
  if (item.match) {
    return item.match.some((p) => path === p || path.startsWith(`${p}/`))
  }
  return path === item.to
}

const hiddenPaths = ['/login', '/confirm']
const visible = computed(() => !hiddenPaths.includes(route.path))
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  background: #f7f3ee;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.mobile-bottom-nav__inner {
  display: flex;
  background: #fff;
  border-top: 1px solid #e8e2db;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
}

.mobile-bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px;
  text-decoration: none;
  color: #9b9590;
  font-family: var(--font-sans);
  transition: color 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.mobile-bottom-nav__item--active {
  color: var(--color-primary);
}

.mobile-bottom-nav__icon {
  font-size: 20px;
  line-height: 1;
  filter: grayscale(0.4) opacity(0.7);
  transition: filter 0.15s;
}

.mobile-bottom-nav__item--active .mobile-bottom-nav__icon {
  filter: none;
}

.mobile-bottom-nav__label {
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.1px;
}

@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }
}
</style>
