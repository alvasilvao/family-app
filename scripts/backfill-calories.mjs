/**
 * One-off script to backfill calories for existing recipe ingredients.
 *
 * Usage:
 *   node --env-file=.env scripts/backfill-calories.mjs
 *
 * Requires NUXT_SUPABASE_SERVICE_ROLE_KEY in .env (bypasses RLS).
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY
const openaiKey = process.env.NUXT_OPENAI_API_KEY

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('Missing env vars. Need: SUPABASE_URL, NUXT_SUPABASE_SERVICE_ROLE_KEY, NUXT_OPENAI_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const openai = new OpenAI({ apiKey: openaiKey })

// Fetch recipes that have at least one ingredient with null calories
const { data: ingredients, error } = await supabase
  .from('ingredients')
  .select('id, name, unit, per_serving, recipe_id')
  .is('calories', null)

if (error) {
  console.error('Failed to fetch ingredients:', error.message)
  process.exit(1)
}

if (!ingredients || ingredients.length === 0) {
  console.log('No ingredients with null calories found. Nothing to do.')
  process.exit(0)
}

// Group ingredients by recipe_id
const byRecipe = new Map()
for (const ing of ingredients) {
  if (!byRecipe.has(ing.recipe_id)) byRecipe.set(ing.recipe_id, [])
  byRecipe.get(ing.recipe_id).push(ing)
}

// Fetch recipe names for logging
const recipeIds = [...byRecipe.keys()]
const { data: recipes } = await supabase
  .from('recipes')
  .select('id, name')
  .in('id', recipeIds)

const recipeNames = new Map()
for (const r of recipes || []) recipeNames.set(r.id, r.name)

console.log(`Found ${ingredients.length} ingredients across ${byRecipe.size} recipes to backfill.\n`)

let totalUpdated = 0

for (const [recipeId, recipeIngredients] of byRecipe) {
  const recipeName = recipeNames.get(recipeId) || recipeId

  const ingredientList = recipeIngredients
    .map((ing, i) => `${i + 1}. ${ing.per_serving}${ing.unit} ${ing.name}`)
    .join('\n')

  const prompt = `Estimate the calories (kcal) for each ingredient at the given quantity per serving.
Return ONLY a JSON array of numbers, one per ingredient, in the same order.

Ingredients:
${ingredientList}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [{ role: 'user', content: prompt }],
    }, { timeout: 30_000 })

    const text = response.choices[0]?.message?.content?.trim()
    if (!text) {
      console.error(`  [SKIP] ${recipeName}: empty LLM response`)
      continue
    }

    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const calories = JSON.parse(cleaned)

    if (!Array.isArray(calories) || calories.length !== recipeIngredients.length) {
      console.error(`  [SKIP] ${recipeName}: expected ${recipeIngredients.length} values, got ${Array.isArray(calories) ? calories.length : 'non-array'}`)
      continue
    }

    // Update each ingredient
    const updates = recipeIngredients.map((ing, i) => {
      const cal = typeof calories[i] === 'number' && calories[i] >= 0 ? calories[i] : null
      return supabase
        .from('ingredients')
        .update({ calories: cal })
        .eq('id', ing.id)
    })

    await Promise.all(updates)

    const calSummary = recipeIngredients
      .map((ing, i) => `${ing.name}: ${calories[i]} kcal`)
      .join(', ')

    console.log(`  ✓ ${recipeName}: ${calSummary}`)
    totalUpdated += recipeIngredients.length
  } catch (err) {
    console.error(`  [ERROR] ${recipeName}: ${err.message}`)
  }
}

console.log(`\nDone. Updated ${totalUpdated} ingredients.`)
