export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  await requireAuth(event)
  const weekKey = getRouterParam(event, 'weekKey')
  if (!weekKey) throw createError({ statusCode: 400, statusMessage: 'Missing weekKey' })

  const { data } = await client
    .from('weekly_plans')
    .select('basket, grocery_checked')
    .eq('week_key', weekKey)
    .maybeSingle()

  return {
    basket: (data?.basket as Record<string, number>) || {},
    groceryChecked: (data?.grocery_checked as Record<string, boolean>) || {},
  }
})
