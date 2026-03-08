<template>
  <div class="safe-top" style="background: #2d6a4f; flex-shrink: 0">
    <!-- Top row: week nav + add recipe -->
    <div style="padding: 18px 24px 12px; display: flex; align-items: center; justify-content: center; position: relative; gap: 10px">
      <WeekNavigator :week-key="weekKey" @prev="$emit('prevWeek')" @next="$emit('nextWeek')" @go-today="$emit('goToday')" />
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
          v-if="tab.id === 'recipes' && activeTab === 'recipes'"
          style="
            background: rgba(255,255,255,.25);
            color: #fff;
            border-radius: 999px;
            font-size: 13px;
            width: 18px;
            height: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 300;
            line-height: 1;
          "
          @click.stop="$emit('addRecipe')"
        >
          +
        </span>
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
  goToday: []
  addRecipe: []
  changeTab: [tab: string]
}>()

const tabs = [
  { id: 'recipes', label: 'Recipes' },
  { id: 'plan', label: 'Weekly Plan' },
  { id: 'grocery', label: 'Grocery List' },
]
</script>
