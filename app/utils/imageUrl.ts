const BUCKET = 'recipe-images'

export function getRecipeImageUrl(path: string, bustCache = false): string {
  const config = useRuntimeConfig()
  const base = config.public.supabase.url
  const url = `${base}/storage/v1/object/public/${BUCKET}/${path}`
  return bustCache ? `${url}?t=${Date.now()}` : url
}
