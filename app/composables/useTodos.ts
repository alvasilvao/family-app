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
  const toast = useToast()

  async function fetchTodos() {
    loading.value = true
    try {
      todos.value = await authFetch<Todo[]>('/api/todos')
    } catch (err) {
      console.error('Failed to fetch todos:', err)
      toast.error('Failed to load todos')
      todos.value = []
    } finally {
      loading.value = false
    }
  }

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
