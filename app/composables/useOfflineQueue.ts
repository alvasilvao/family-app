interface QueuedMutation {
  id: number
  execute: () => Promise<void>
}

const queue = ref<QueuedMutation[]>([])
const isOnline = ref(true)
let nextId = 0
let flushing = false

function setupListeners() {
  if (import.meta.server) return
  isOnline.value = navigator.onLine
  window.addEventListener('online', () => {
    isOnline.value = true
    flushQueue()
  })
  window.addEventListener('offline', () => {
    isOnline.value = false
  })
}

async function flushQueue() {
  if (flushing || queue.value.length === 0) return
  flushing = true
  try {
    while (queue.value.length > 0 && isOnline.value) {
      const mutation = queue.value[0]!
      try {
        await mutation.execute()
        queue.value = queue.value.filter((m) => m.id !== mutation.id)
      } catch {
        // Still failing — stop flushing, will retry on next online event
        break
      }
    }
  } finally {
    flushing = false
  }
}

export function useOfflineQueue() {
  setupListeners()

  function enqueue(execute: () => Promise<void>) {
    queue.value = [...queue.value, { id: nextId++, execute }]
  }

  return { isOnline, queue, enqueue, flushQueue }
}
