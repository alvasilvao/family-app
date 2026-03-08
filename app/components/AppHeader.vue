<template>
  <div class="safe-top" style="background: #2d6a4f; flex-shrink: 0">
    <!-- Top row: week nav + add recipe -->
    <div style="padding: 18px 24px 12px; display: flex; align-items: center; justify-content: center; position: relative; gap: 10px">
      <WeekNavigator :week-key="weekKey" @prev="$emit('prevWeek')" @next="$emit('nextWeek')" />

      <button
        :style="{
          position: 'absolute',
          right: '24px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,.15)',
          border: '1.5px solid rgba(255,255,255,.3)',
          color: '#fff',
          fontSize: '20px',
          fontWeight: 300,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background .2s',
        }"
        @click="$emit('addRecipe')"
        @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.25)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.15)'"
      >
        +
      </button>
    </div>

    <!-- Tab bar -->
    <div style="display: flex; padding: 0 20px; gap: 4px">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :style="{
          flex: 1,
          padding: '12px 0 13px',
          background: activeTab === tab.id ? 'rgba(255,255,255,.15)' : 'transparent',
          border: 'none',
          borderRadius: '10px 10px 0 0',
          color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,.55)',
          fontSize: '12px',
          fontWeight: activeTab === tab.id ? 700 : 500,
          cursor: 'pointer',
          fontFamily: '\'DM Sans\', sans-serif',
          transition: 'all .2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
        }"
        @click="$emit('changeTab', tab.id)"
      >
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.id === 'plan' && totalServings > 0"
          style="
            background: #fff;
            color: #2d6a4f;
            border-radius: 999px;
            font-size: 10px;
            padding: 1px 6px;
            font-weight: 700;
          "
        >
          {{ totalServings }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  weekKey: string
  totalServings: number
  activeTab: string
}>()

defineEmits<{
  prevWeek: []
  nextWeek: []
  addRecipe: []
  changeTab: [tab: string]
}>()

const tabs = [
  { id: 'recipes', label: 'Recipes' },
  { id: 'plan', label: 'Weekly Plan' },
  { id: 'grocery', label: 'Grocery List' },
]
</script>
