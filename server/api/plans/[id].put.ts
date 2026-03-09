export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const client = serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing plan id' })

  const body = await readBody(event)
  const basket = body.basket || {}

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
    if (typeof val !== 'number' || !isFinite(val as number) || (val as number) < 0) {
      throw createError({ statusCode: 400, statusMessage: 'basket values must be non-negative numbers' })
    }
  }

  const { data, error } = await client
    .from('meal_plans')
    .update({ basket, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'open')
    .select()
    .single()

  if (error) throw createError({ statusCode: 400, statusMessage: 'Plan not found or is closed' })
  return data
})
