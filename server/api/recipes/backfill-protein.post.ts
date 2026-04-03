import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const config = useRuntimeConfig()
  const client = createClient(
    String(process.env.SUPABASE_URL),
    String(config.supabaseServiceRoleKey),
  )
  const body = await readBody(event)

  // If estimates are provided, update them
  if (body?.estimates && Array.isArray(body.estimates)) {
    let updated = 0
    for (const est of body.estimates) {
      const protein = est.protein === null ? 0 : est.protein
      if (typeof protein !== 'number' || !isFinite(protein) || protein < 0) continue
      const { error } = await client
        .from('ingredients')
        .update({ protein })
        .eq('id', est.id)
      if (error) {
        console.error(`Failed to update ingredient ${est.id}:`, error.message)
      } else {
        updated++
      }
    }
    return { updated }
  }

  // Otherwise, return ingredients that need protein estimates
  const { data: ingredients, error } = await client
    .from('ingredients')
    .select('id, name, unit, per_serving')
    .is('protein', null)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch ingredients' })
  }

  return { ingredients: ingredients || [] }
})
