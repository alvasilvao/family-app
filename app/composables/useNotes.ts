export interface Note {
  id: string
  title: string
  body: string
  created_by: string
  updated_by: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

const notes = ref<Note[]>([])
const loading = ref(false)

export function useNotes() {
  const { authFetch } = useAuth()

  async function fetchNotes() {
    loading.value = true
    try {
      notes.value = await authFetch<Note[]>('/api/notes')
    } catch (err) {
      console.error('Failed to fetch notes:', err)
      notes.value = []
    } finally {
      loading.value = false
    }
  }

  async function createNote(title: string, body: string) {
    const note = await authFetch<Note>('/api/notes', {
      method: 'POST',
      body: { title, body },
    })
    notes.value = [note, ...notes.value]
    return note
  }

  async function updateNote(id: string, title: string, body: string) {
    const note = await authFetch<Note>(`/api/notes/${id}`, {
      method: 'PUT',
      body: { title, body },
    })
    notes.value = notes.value.map((n) => (n.id === id ? note : n))
    return note
  }

  async function archiveNote(id: string) {
    const note = await authFetch<Note>(`/api/notes/${id}/archive`, {
      method: 'POST',
    })
    notes.value = notes.value.map((n) => (n.id === id ? note : n))
  }

  async function unarchiveNote(id: string) {
    const note = await authFetch<Note>(`/api/notes/${id}/unarchive`, {
      method: 'POST',
    })
    notes.value = notes.value.map((n) => (n.id === id ? note : n))
  }

  return { notes, loading, fetchNotes, createNote, updateNote, archiveNote, unarchiveNote }
}
