export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await requireAuth(event)
  const weekKey = validateWeekKey(getRouterParam(event, 'weekKey'))

  const body = await readBody(event)
  const basket = body.basket || {}
  const groceryChecked = body.groceryChecked || {}

  // Validate basket: must be Record<string, number> with reasonable limits
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

  // Validate groceryChecked: must be Record<string, boolean> with reasonable limits
  if (typeof groceryChecked !== 'object' || Array.isArray(groceryChecked)) {
    throw createError({ statusCode: 400, statusMessage: 'groceryChecked must be an object' })
  }
  const checkedKeys = Object.keys(groceryChecked)
  if (checkedKeys.length > 1000) {
    throw createError({ statusCode: 400, statusMessage: 'groceryChecked exceeds max of 1000 entries' })
  }
  for (const [key, val] of Object.entries(groceryChecked)) {
    if (key.length > 200) {
      throw createError({ statusCode: 400, statusMessage: 'groceryChecked key too long' })
    }
    if (typeof val !== 'boolean') {
      throw createError({ statusCode: 400, statusMessage: 'groceryChecked values must be booleans' })
    }
  }

  const { data, error } = await client
    .from('weekly_plans')
    .upsert(
      { week_key: weekKey, basket, grocery_checked: groceryChecked },
      { onConflict: 'week_key' }
    )
    .select('basket, grocery_checked')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { basket: data.basket, groceryChecked: data.grocery_checked }
})
