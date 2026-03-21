<template>
  <div
    :style="{
      background: todo.completed_at ? '#f5f0eb' : '#fff',
      borderRadius: '13px',
      padding: '14px 16px',
      boxShadow: todo.completed_at ? 'none' : '0 2px 10px rgba(0,0,0,.06)',
      opacity: todo.completed_at ? 0.7 : 1,
      transition: 'opacity .2s, box-shadow .2s',
    }"
  >
    <div style="display: flex; align-items: flex-start; gap: 11px">
      <!-- Checkbox -->
      <button
        :aria-label="todo.completed_at ? `Mark '${todo.title}' as incomplete` : `Mark '${todo.title}' as complete`"
        :style="{
          width: '22px',
          height: '22px',
          borderRadius: '5px',
          flexShrink: 0,
          marginTop: '1px',
          border: todo.completed_at ? '1.5px solid #2d6a4f' : '1.5px solid #d4ccc4',
          background: todo.completed_at ? '#2d6a4f' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
        }"
        @click="$emit('toggle', todo.id)"
      >
        <span v-if="todo.completed_at" style="color: #fff; font-size: 11px">&#x2713;</span>
      </button>

      <!-- Content -->
      <div style="flex: 1; min-width: 0">
        <!-- Title: display or edit -->
        <div v-if="editingTitle" class="input-wrap" style="margin: -3px 0 0 -6px">
          <input
            ref="titleInput"
            v-model="editTitleValue"
            type="text"
            class="form-input"
            style="
              width: 100%;
              padding: 2px 6px;
              padding-right: 28px;
              font-size: 16px;
              border-radius: 6px;
            "
            @blur="saveTitle"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
            @keydown.escape="cancelTitleEdit"
          />
          <button v-if="editTitleValue" type="button" class="input-clear-btn" aria-label="Clear" @click="editTitleValue = ''" style="width: 18px; height: 18px; font-size: 12px; right: 5px">&times;</button>
        </div>
        <p
          v-else
          :style="{
            fontSize: '14px',
            lineHeight: '1.4',
            color: todo.completed_at ? '#b0a89e' : '#1a1a1a',
            textDecoration: todo.completed_at ? 'line-through' : 'none',
            cursor: todo.completed_at ? 'default' : 'pointer',
            margin: 0,
            wordBreak: 'break-word',
          }"
          @click="!todo.completed_at && startTitleEdit()"
        >
          {{ todo.title }}
        </p>

        <!-- Due date row -->
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px">
          <input
            v-if="editingDate"
            ref="dateInput"
            v-model="editDateValue"
            type="date"
            class="form-input"
            style="
              padding: 2px 6px;
              font-size: 16px;
              border-radius: 6px;
              color: #6b6560;
              width: 130px;
            "
            @blur="saveDate"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
            @keydown.escape="cancelDateEdit"
          />
          <template v-else>
            <span
              v-if="todo.due_date && !todo.completed_at"
              :style="{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: isOverdue ? '#fef2f2' : '#f0f4f0',
                color: isOverdue ? '#dc2626' : '#7a9e7e',
                cursor: 'pointer',
              }"
              @click="startDateEdit()"
            >
              {{ formatDueDate(todo.due_date) }}
            </span>
            <button
              v-if="!todo.due_date && !todo.completed_at"
              style="
                background: none;
                border: none;
                font-size: 11px;
                color: #b0a89e;
                cursor: pointer;
                padding: 2px 0;
                font-family: 'DM Sans', sans-serif;
              "
              @click="startDateEdit()"
            >
              + Add date
            </button>
          </template>
        </div>
      </div>

      <!-- Delete button -->
      <button
        v-if="todo.created_by === userId"
        :aria-label="`Delete '${todo.title}'`"
        style="
          background: none;
          border: none;
          font-size: 16px;
          color: #b0a89e;
          cursor: pointer;
          padding: 0 2px;
          flex-shrink: 0;
          line-height: 1;
        "
        @click="$emit('delete', todo.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/composables/useTodos'

const props = defineProps<{
  todo: Todo
  userId?: string
}>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  update: [id: string, title: string, dueDate: string | null]
}>()

const today = new Date().toISOString().slice(0, 10)
const isOverdue = computed(() => props.todo.due_date ? props.todo.due_date < today : false)

// Title editing
const editingTitle = ref(false)
const editTitleValue = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

function startTitleEdit() {
  editTitleValue.value = props.todo.title
  editingTitle.value = true
  nextTick(() => titleInput.value?.focus())
}

function saveTitle() {
  editingTitle.value = false
  const newTitle = editTitleValue.value.trim()
  if (newTitle && newTitle !== props.todo.title) {
    emit('update', props.todo.id, newTitle, props.todo.due_date)
  }
}

function cancelTitleEdit() {
  editingTitle.value = false
}

// Date editing
const editingDate = ref(false)
const editDateValue = ref('')
const dateInput = ref<HTMLInputElement | null>(null)

function startDateEdit() {
  editDateValue.value = props.todo.due_date || ''
  editingDate.value = true
  nextTick(() => dateInput.value?.focus())
}

function saveDate() {
  editingDate.value = false
  const newDate = editDateValue.value || null
  if (newDate !== props.todo.due_date) {
    emit('update', props.todo.id, props.todo.title, newDate)
  }
}

function cancelDateEdit() {
  editingDate.value = false
}

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
