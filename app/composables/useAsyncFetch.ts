import { type Ref } from 'vue'

export function useAsyncFetch<T>(
  data: Ref<T[]>,
  loading: Ref<boolean>,
  fetchFn: () => Promise<T[]>,
  errorMessage: string,
) {
  const toast = useToast()

  async function fetch() {
    data.value = [] as unknown as T[]
    loading.value = true
    try {
      data.value = await fetchFn()
    } catch (err: unknown) {
      console.error(errorMessage, err)
      toast.error(errorMessage)
      data.value = []
    } finally {
      loading.value = false
    }
  }

  return { data, loading, fetch }
}
