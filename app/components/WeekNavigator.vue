<template>
  <div style="display: flex; align-items: center; gap: 10px">
    <button class="week-nav-btn" @click="$emit('prev')">&lsaquo;</button>
    <div style="text-align: center; min-width: 190px; cursor: pointer" @click="$emit('goToday')">
      <p
        style="
          font-size: 12px;
          color: #95d5b2;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        "
      >
        Week {{ weekInfo.week }}{{ isNextWeek ? ' · Next week' : '' }}
      </p>
      <p style="font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700; color: #fff; line-height: 1.1">
        {{ label }}
      </p>
    </div>
    <button class="week-nav-btn" @click="$emit('next')">&rsaquo;</button>
  </div>
</template>

<script setup lang="ts">
import { parseWeekKey, weekKeyLabel, nextWeekKey } from '~/utils/week'

const props = defineProps<{ weekKey: string }>()
defineEmits<{ prev: []; next: []; goToday: [] }>()

const weekInfo = computed(() => parseWeekKey(props.weekKey))
const label = computed(() => weekKeyLabel(props.weekKey))
const isNextWeek = computed(() => props.weekKey === nextWeekKey())
</script>
