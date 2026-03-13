<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <PageHeader title="To-dos" />

    <!-- Loading -->
    <div v-if="loading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <div v-else class="page-content" style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Add form -->
      <form style="padding: 16px 20px; display: flex; gap: 10px" @submit.prevent="handleAdd">
        <input
          v-model="newTitle"
          type="text"
          placeholder="Add a to-do..."
          class="form-input"
          style="flex: 1; padding: 10px 14px; font-size: 16px; border-radius: 10px"
        />
        <input
          v-model="newDueDate"
          type="date"
          class="form-input"
          style="width: 130px; padding: 10px 10px; font-size: 13px; border-radius: 10px; color: #6b6560"
        />
        <button
          type="submit"
          :disabled="!newTitle.trim()"
          :style="{
            background: newTitle.trim() ? '#2d6a4f' : '#d4ccc4',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: newTitle.trim() ? 'pointer' : 'default',
            fontFamily: '\'DM Sans\', sans-serif',
            transition: 'background .2s',
          }"
        >
          Add
        </button>
      </form>

      <!-- Empty state -->
      <EmptyState
        v-if="allTodos.length === 0"
        emoji="&#x2705;"
        title="All clear!"
        message="Add a to-do above to get started."
      />

      <div v-else>
        <!-- Progress -->
        <div v-if="completedTodos.length > 0" style="padding: 0 20px 12px">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px">
            <span style="font-size: 11px; color: #9b9590">{{ completedTodos.length }} of {{ allTodos.length }} done</span>
            <span v-if="completedTodos.length === allTodos.length" style="font-size: 11px; color: #2d6a4f; font-weight: 600">
              &#x2713; All done!
            </span>
          </div>
          <ProgressBar :value="completedTodos.length / allTodos.length" />
        </div>

        <!-- Overdue -->
        <template v-if="overdueTodos.length > 0">
          <div style="display: flex; align-items: center; gap: 7px; padding: 10px 20px 4px">
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #dc2626">
              Overdue
            </span>
            <div style="flex: 1; height: 1px; background: #fecaca; margin-left: 4px" />
            <span style="font-size: 11px; color: #dc2626">{{ overdueTodos.length }}</span>
          </div>
          <div style="padding: 6px 20px; display: flex; flex-direction: column; gap: 10px">
            <TodoItem
              v-for="todo in overdueTodos"
              :key="todo.id"
              :todo="todo"
              :user-id="user?.id"
              @toggle="handleToggle"
              @update="handleUpdate"
              @delete="handleDelete"
            />
          </div>
        </template>

        <!-- Upcoming (with due date, not overdue) -->
        <template v-if="upcomingTodos.length > 0">
          <SectionHeader label="Upcoming" :count="upcomingTodos.length" style="padding: 10px 20px 4px" />
          <div style="padding: 6px 20px; display: flex; flex-direction: column; gap: 10px">
            <TodoItem
              v-for="todo in upcomingTodos"
              :key="todo.id"
              :todo="todo"
              :user-id="user?.id"
              @toggle="handleToggle"
              @update="handleUpdate"
              @delete="handleDelete"
            />
          </div>
        </template>

        <!-- No due date -->
        <template v-if="noDueDateTodos.length > 0">
          <SectionHeader
            v-if="overdueTodos.length > 0 || upcomingTodos.length > 0"
            label="No date"
            :count="noDueDateTodos.length"
            style="padding: 10px 20px 4px"
          />
          <div style="padding: 6px 20px; display: flex; flex-direction: column; gap: 10px">
            <TodoItem
              v-for="todo in noDueDateTodos"
              :key="todo.id"
              :todo="todo"
              :user-id="user?.id"
              @toggle="handleToggle"
              @update="handleUpdate"
              @delete="handleDelete"
            />
          </div>
        </template>

        <!-- Completed -->
        <template v-if="completedTodos.length > 0">
          <SectionHeader label="Done" :count="completedTodos.length" style="padding: 16px 20px 4px" />
          <div style="padding: 6px 20px; display: flex; flex-direction: column; gap: 10px">
            <TodoItem
              v-for="todo in completedTodos"
              :key="todo.id"
              :todo="todo"
              :user-id="user?.id"
              @toggle="handleToggle"
              @update="handleUpdate"
              @delete="handleDelete"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/composables/useTodos'

const { user } = useAuth()
const { todos, loading, fetchTodos, addTodo, toggleTodo, updateTodo, deleteTodo } = useTodos()

const newTitle = ref('')
const newDueDate = ref('')

const today = computed(() => new Date().toISOString().slice(0, 10))

const allTodos = computed(() => todos.value)
const pendingTodos = computed(() => todos.value.filter((t) => !t.completed_at))
const completedTodos = computed(() => todos.value.filter((t) => t.completed_at))

const overdueTodos = computed(() =>
  pendingTodos.value.filter((t) => t.due_date && t.due_date < today.value),
)
const upcomingTodos = computed(() =>
  pendingTodos.value.filter((t) => t.due_date && t.due_date >= today.value),
)
const noDueDateTodos = computed(() =>
  pendingTodos.value.filter((t) => !t.due_date),
)

async function handleAdd() {
  const title = newTitle.value.trim()
  if (!title) return
  newTitle.value = ''
  const dueDate = newDueDate.value || undefined
  newDueDate.value = ''
  await addTodo(title, dueDate)
}

async function handleToggle(id: string) {
  await toggleTodo(id)
}

async function handleUpdate(id: string, title: string, dueDate: string | null) {
  await updateTodo(id, title, dueDate)
}

async function handleDelete(id: string) {
  await deleteTodo(id)
}

onMounted(() => {
  fetchTodos()
})
</script>
