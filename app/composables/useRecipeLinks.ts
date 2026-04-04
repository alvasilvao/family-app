export interface RecipeLink {
  id: string
  url: string
  title: string
  note: string
  created_by: string
  created_at: string
}

const links = ref<RecipeLink[]>([])
const loading = ref(false)

export function useRecipeLinks() {
  const { authFetch } = useAuth()
  const { fetch: fetchLinks } = useAsyncFetch<RecipeLink>(
    links,
    loading,
    () => authFetch<RecipeLink[]>('/api/recipe-links'),
    'Failed to load inspiration links',
  )

  async function addLink(url: string, title?: string, note?: string) {
    const link = await authFetch<RecipeLink>('/api/recipe-links', {
      method: 'POST',
      body: { url, title: title || '', note: note || '' },
    })
    links.value = [link, ...links.value]
    return link
  }

  async function deleteLink(id: string) {
    await authFetch(`/api/recipe-links/${id}`, { method: 'DELETE' })
    links.value = links.value.filter((l) => l.id !== id)
  }

  return { links, loading, fetchLinks, addLink, deleteLink }
}
