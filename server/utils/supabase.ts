import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

/**
 * Create a Supabase client scoped to the user's JWT.
 * RLS policies use auth.uid() from the token automatically.
 */
export function serverSupabaseClient(event: H3Event) {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Missing auth token' })
  }
  const token = authHeader.slice(7)

  return createClient(config.public.supabase.url, config.public.supabase.key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  })
}

/**
 * Get the authenticated user's ID (auth.uid()).
 */
export async function requireAuth(event: H3Event): Promise<string> {
  const client = serverSupabaseClient(event)
  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }
  return user.id
}
