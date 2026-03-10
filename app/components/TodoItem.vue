<template>
  <div
    class="ing-row"
    style="cursor: pointer"
    @click="$emit('toggle', todo.id)"
  >
    <div style="display: flex; align-items: center; gap: 11px; flex: 1; min-width: 0">
      <!-- Checkbox -->
      <div
        :style="{
          width: '22px',
          height: '22px',
          borderRadius: '5px',
          flexShrink: 0,
          border: todo.completed_at ? '1.5px solid #2d6a4f' : '1.5px solid #d4ccc4',
          background: todo.completed_at ? '#2d6a4f' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }"
      >
        <span v-if="todo.completed_at" style="color: #fff; font-size: 11px">&#x2713;</span>
      </div>
      <div style="min-width: 0; flex: 1">
        <span
          :style="{
            fontSize: '13.5px',
            color: todo.completed_at ? '#b0a89e' : '#1a1a1a',
            textDecoration: todo.completed_at ? 'line-through' : 'none',
          }"
        >{{ todo.title }}</span>
        <span
          v-if="todo.due_date && !todo.completed_at"
          :style="{
            display: 'inline-block',
            marginLeft: '8px',
            fontSize: '11px',
            padding: '1px 6px',
            borderRadius: '4px',
            background: isOverdue ? '#fef2f2' : '#f0f4f0',
            color: isOverdue ? '#dc2626' : '#7a9e7e',
          }"
        >
          {{ formatDueDate(todo.due_date) }}
        </span>
      </div>
    </div>
    <button
      v-if="todo.created_by === userId"
      class="del-btn"
      style="background: none; border: none; font-size: 16px; color: #b0a89e; cursor: pointer; padding: 4px 8px"
      @click.stop="$emit('delete', todo.id)"
    >
      &times;
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/composables/useTodos'

const props = defineProps<{
  todo: Todo
  userId?: string
}>()

defineEmits<{
  toggle: [id: string]
  delete: [id: string]
}>()

const today = new Date().toISOString().slice(0, 10)
const isOverdue = computed(() => props.todo.due_date ? props.todo.due_date < today : false)

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const diffDays = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1 && diffDays <= 6) return date.toLocaleDateString(undefined, { weekday: 'short' })

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
