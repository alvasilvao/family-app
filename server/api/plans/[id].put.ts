export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing plan id' })

  const body = await readBody(event)
  const basket = body.basket || {}
  const cooked = body.cooked || {}

  // Validate basket: must be Record<string, number>
  if (typeof basket !== 'object' || Array.isArray(basket)) {
    throw createError({ statusCode: 400, statusMessage: 'basket must be an object' })
  }
  const basketKeys = Object.keys(basket)
  if (basketKeys.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'basket exceeds max of 200 entries' })
  }
  for (const [key, val] of Object.entries(basket)) {
    if (key.length > 100) {
      throw createError({ statusCode: 400, statusMessage: 'basket key too long' })
    }
    if (typeof val !== 'number' || !isFinite(val as number) || (val as number) < 1) {
      throw createError({ statusCode: 400, statusMessage: 'basket values must be positive numbers' })
    }
  }

  // Validate cooked: must be Record<string, boolean | string (ISO timestamp)>
  if (typeof cooked !== 'object' || Array.isArray(cooked)) {
    throw createError({ statusCode: 400, statusMessage: 'cooked must be an object' })
  }
  for (const [key, val] of Object.entries(cooked)) {
    if (key.length > 100) {
      throw createError({ statusCode: 400, statusMessage: 'cooked key too long' })
    }
    if (typeof val !== 'boolean' && typeof val !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'cooked values must be booleans or ISO timestamps' })
    }
  }

  // Fetch current plan to check status transitions
  const { data: current, error: fetchError } = await client
    .from('meal_plans')
    .select('status')
    .eq('id', id)
    .single()

  if (fetchError || !current) throw createError({ statusCode: 400, statusMessage: 'Plan not found' })

  // Determine if all recipes are cooked
  const activeRecipeIds = Object.entries(basket).filter(([, v]) => (v as number) > 0).map(([k]) => k)
  const allCooked = activeRecipeIds.length > 0 && activeRecipeIds.every((rid) => cooked[rid])

  // Auto-transition status
  let status = current.status
  if (allCooked && (status === 'closed' || status === 'closed_no_shop')) {
    status = 'cooked'
  } else if (!allCooked && status === 'cooked') {
    status = 'closed'
  }

  const { data, error } = await client
    .from('meal_plans')
    .update({ basket, cooked, status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 400, statusMessage: 'Plan not found' })
  return data
})
