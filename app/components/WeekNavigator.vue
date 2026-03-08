<template>
  <div style="display: flex; align-items: center; gap: 10px">
    <button
      class="week-btn"
      :style="{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,.15)',
        border: 'none',
        color: '#fff',
        fontSize: '18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background .2s',
      }"
      @click="$emit('prev')"
    >
      &lsaquo;
    </button>
    <div style="text-align: center; min-width: 190px">
      <p
        style="
          font-size: 12px;
          color: #95d5b2;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        "
      >
        {{ label }}{{ isNextWeek ? ' · Next week' : '' }}
      </p>
      <p style="font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700; color: #fff; line-height: 1.1">
        Week {{ weekInfo.week }}
      </p>
    </div>
    <button
      class="week-btn"
      :style="{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,.15)',
        border: 'none',
        color: '#fff',
        fontSize: '18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background .2s',
      }"
      @click="$emit('next')"
    >
      &rsaquo;
    </button>
  </div>
</template>

<script setup lang="ts">
import { parseWeekKey, weekKeyLabel, nextWeekKey } from '~/utils/week'

const props = defineProps<{ weekKey: string }>()
defineEmits<{ prev: []; next: [] }>()

const weekInfo = computed(() => parseWeekKey(props.weekKey))
const label = computed(() => weekKeyLabel(props.weekKey))
const isNextWeek = computed(() => props.weekKey === nextWeekKey())
</script>
