import { type Ref } from 'vue'

interface AsyncFetchOptions {
  cacheKey?: string
}

export function useAsyncFetch<T>(
  data: Ref<T[]>,
  loading: Ref<boolean>,
  fetchFn: () => Promise<T[]>,
  errorMessage: string,
  options?: AsyncFetchOptions,
) {
  const toast = useToast()

  function readCache(): T[] | null {
    if (!options?.cacheKey || import.meta.server) return null
    try {
      const raw = localStorage.getItem(options.cacheKey)
      if (raw) return JSON.parse(raw) as T[]
    } catch { /* ignore corrupt cache */ }
    return null
  }

  function writeCache(items: T[]) {
    if (!options?.cacheKey || import.meta.server) return
    try {
      localStorage.setItem(options.cacheKey, JSON.stringify(items))
    } catch { /* storage full — ignore */ }
  }

  async function fetch() {
    // Show cached data immediately instead of clearing
    const cached = readCache()
    if (cached && data.value.length === 0) {
      data.value = cached
    }

    // Only show loading spinner if we have no data at all
    if (data.value.length === 0) {
      loading.value = true
    }

    try {
      const fresh = await fetchFn()
      data.value = fresh
      writeCache(fresh)
    } catch (err: unknown) {
      console.error(errorMessage, err)
      // Only show error and clear data if we had no cached fallback
      if (data.value.length === 0) {
        toast.error(errorMessage)
        data.value = []
      }
    } finally {
      loading.value = false
    }
  }

  return { data, loading, fetch, writeCache }
}
