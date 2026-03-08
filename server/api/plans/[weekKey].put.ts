export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await requireAuth(event)
  const weekKey = getRouterParam(event, 'weekKey')
  if (!weekKey) throw createError({ statusCode: 400, statusMessage: 'Missing weekKey' })

  const body = await readBody(event)
  const basket = body.basket || {}
  const groceryChecked = body.groceryChecked || {}

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
