<template>
  <span class="tag" :style="{ background: colors.bg, color: colors.text }">{{ label }}</span>
</template>

<script setup lang="ts">
import { TAG_COLORS } from '~/utils/constants'

const props = defineProps<{ label: string }>()
const colors = computed(() => TAG_COLORS[props.label] || { bg: '#eee', text: '#555' })
</script>
