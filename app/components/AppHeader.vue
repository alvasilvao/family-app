<template>
  <div style="background: #2d6a4f; padding: 18px 24px 16px; flex-shrink: 0">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px">
      <WeekNavigator :week-key="weekKey" @prev="$emit('prevWeek')" @next="$emit('nextWeek')" />

      <div style="display: flex; gap: 8px">
        <button
          :style="{
            padding: '8px 15px',
            borderRadius: '9px',
            background: 'rgba(255,255,255,.15)',
            border: '1.5px solid rgba(255,255,255,.3)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: '\'DM Sans\', sans-serif',
            transition: 'background .2s',
          }"
          @click="$emit('addRecipe')"
          @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.25)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.15)'"
        >
          + Add Recipe
        </button>
        <button
          :disabled="totalServings === 0"
          :style="{
            padding: '8px 15px',
            borderRadius: '9px',
            background: totalServings > 0 ? '#fff' : 'rgba(255,255,255,.1)',
            border: 'none',
            color: totalServings > 0 ? '#2d6a4f' : 'rgba(255,255,255,.4)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: totalServings > 0 ? 'pointer' : 'default',
            fontFamily: '\'DM Sans\', sans-serif',
            transition: 'all .2s',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }"
          @click="$emit('showGrocery')"
        >
          <span>&#x1f6d2; Grocery List</span>
          <span
            v-if="totalServings > 0"
            style="
              background: #2d6a4f;
              color: #fff;
              border-radius: 999px;
              font-size: 10px;
              padding: 1px 6px;
            "
          >
            {{ totalServings }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  weekKey: string
  totalServings: number
}>()

defineEmits<{
  prevWeek: []
  nextWeek: []
  addRecipe: []
  showGrocery: []
}>()
</script>
