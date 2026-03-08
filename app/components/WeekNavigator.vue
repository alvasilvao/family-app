<template>
  <div style="display: flex; align-items: center; gap: 10px">
    <button
      class="week-btn"
      :style="{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,.15)',
        border: 'none',
        color: '#fff',
        fontSize: '16px',
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
    <div style="text-align: center; min-width: 170px">
      <p
        style="
          font-size: 10px;
          letter-spacing: 2.5px;
          color: #95d5b2;
          text-transform: uppercase;
          margin-bottom: 2px;
        "
      >
        Week {{ weekInfo.week }} &middot; {{ weekInfo.year }}
        {{ isNextWeek ? '&middot; Next week' : '' }}
      </p>
      <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #fff; line-height: 1.2">
        {{ label }}
      </p>
    </div>
    <button
      class="week-btn"
      :style="{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,.15)',
        border: 'none',
        color: '#fff',
        fontSize: '16px',
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
