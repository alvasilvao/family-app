import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

/**
 * Create a Supabase client scoped to the user's JWT.
 * This ensures RLS policies apply per-user.
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
 * Ensure the authenticated user exists in the users table, return their DB id.
 */
export async function ensureUser(event: H3Event): Promise<string> {
  const client = serverSupabaseClient(event)

  // Get user from Supabase Auth
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  // Upsert into users table
  const { data, error } = await client
    .from('users')
    .upsert(
      { supabase_id: user.id, email: user.email || '' },
      { onConflict: 'supabase_id' }
    )
    .select('id')
    .single()

  if (error || !data) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to upsert user' })
  }

  return data.id
}
