export interface Todo {
  id: string
  title: string
  due_date: string | null
  completed_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

const todos = ref<Todo[]>([])
const loading = ref(false)

export function useTodos() {
  const { authFetch } = useAuth()
  const { fetch: fetchTodos } = useAsyncFetch<Todo>(
    todos,
    loading,
    () => authFetch<Todo[]>('/api/todos'),
    'Failed to load todos',
  )

  async function addTodo(title: string, dueDate?: string) {
    const todo = await authFetch<Todo>('/api/todos', {
      method: 'POST',
      body: { title, due_date: dueDate || null },
    })
    todos.value = [todo, ...todos.value]
    return todo
  }

  async function toggleTodo(id: string) {
    const todo = await authFetch<Todo>(`/api/todos/${id}/toggle`, {
      method: 'POST',
    })
    todos.value = todos.value.map((t) => (t.id === id ? todo : t))
  }

  async function updateTodo(id: string, title: string, dueDate?: string | null) {
    const todo = await authFetch<Todo>(`/api/todos/${id}`, {
      method: 'PUT',
      body: { title, due_date: dueDate ?? null },
    })
    todos.value = todos.value.map((t) => (t.id === id ? todo : t))
  }

  async function deleteTodo(id: string) {
    await authFetch(`/api/todos/${id}`, { method: 'DELETE' })
    todos.value = todos.value.filter((t) => t.id !== id)
  }

  return { todos, loading, fetchTodos, addTodo, toggleTodo, updateTodo, deleteTodo }
}
