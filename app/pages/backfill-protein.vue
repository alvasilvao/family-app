<template>
  <div style="max-width: 600px; margin: 40px auto; padding: 0 20px; font-family: 'DM Sans', sans-serif">
    <h1 style="font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 20px">Backfill Protein</h1>

    <!-- Step 1: Loading -->
    <div v-if="step === 'loading'" style="text-align: center; padding: 40px 0; color: #9b9590">
      Loading ingredients...
    </div>

    <div v-else-if="step === 'empty'" style="text-align: center; padding: 40px 0; color: #2d6a4f; font-weight: 600">
      All ingredients already have protein data!
    </div>

    <template v-else-if="step === 'show'">
      <p style="font-size: 14px; color: #6b6560; margin-bottom: 16px">
        {{ ingredients.length }} ingredients need protein estimates.
      </p>

      <!-- AI Backfill -->
      <div style="background: #f5f0eb; border-radius: 12px; padding: 16px; margin-bottom: 24px">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px">
          <span style="font-weight: 600; font-size: 14px">AI Estimate (OpenAI)</span>
          <span style="font-size: 12px; color: #9b9590">
            Next batch: {{ Math.min(BATCH_SIZE, ingredients.length) }} of {{ ingredients.length }} remaining
          </span>
        </div>

        <!-- Last batch feedback -->
        <div v-if="ai.lastResult" style="margin-bottom: 12px; padding: 10px 12px; border-radius: 8px; font-size: 13px" :style="{ background: ai.lastResult.error ? '#fdecea' : '#e8f5ee', color: ai.lastResult.error ? '#c0392b' : '#2d6a4f' }">
          {{ ai.lastResult.message }}
        </div>

        <!-- Ingredient preview for next batch -->
        <div style="margin-bottom: 12px; font-size: 12px; color: #6b6560; max-height: 100px; overflow-y: auto">
          <div v-for="ing in nextBatch" :key="ing.id" style="padding: 2px 0">
            {{ ing.per_serving }}{{ ing.unit }} {{ ing.name }}
          </div>
        </div>

        <button
          :disabled="ai.running"
          :style="{
            padding: '10px 24px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            background: ai.running ? '#d4ccc4' : '#2d6a4f',
            color: '#fff',
            cursor: ai.running ? 'default' : 'pointer',
            width: '100%',
          }"
          @click="runAiBackfill"
        >
          {{ ai.running ? 'Estimating...' : `Estimate next ${Math.min(BATCH_SIZE, ingredients.length)} ingredients` }}
        </button>
      </div>

      <!-- Manual fallback (collapsed) -->
      <details style="margin-bottom: 16px">
        <summary style="font-size: 13px; color: #9b9590; cursor: pointer; margin-bottom: 8px">
          Or paste estimates manually
        </summary>
        <div style="position: relative">
          <pre style="background: #f5f0eb; border-radius: 10px; padding: 14px; font-size: 12px; max-height: 200px; overflow-y: auto; white-space: pre-wrap; word-break: break-all">{{ ingredientJson }}</pre>
          <button
            style="position: absolute; top: 8px; right: 8px; padding: 4px 12px; border-radius: 6px; border: 1px solid #e8e2db; background: #fff; font-size: 12px; cursor: pointer"
            @click="copyIngredients"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <textarea
          v-model="estimatesText"
          placeholder='[{ "id": "...", "protein": 12.5 }, ...]'
          rows="6"
          style="width: 100%; border: 1.5px solid #e8e2db; border-radius: 10px; padding: 12px; font-size: 13px; font-family: monospace; resize: vertical; background: #faf8f5; margin-top: 8px"
        />
        <button
          :disabled="!estimatesText.trim() || submitting"
          :style="{
            marginTop: '8px',
            padding: '10px 24px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            background: estimatesText.trim() && !submitting ? '#2d6a4f' : '#d4ccc4',
            color: '#fff',
            cursor: estimatesText.trim() && !submitting ? 'pointer' : 'default',
          }"
          @click="submitEstimates"
        >
          {{ submitting ? 'Updating...' : 'Update protein values' }}
        </button>
      </details>
    </template>

    <!-- Result -->
    <div v-if="result" style="margin-top: 16px; padding: 12px 14px; border-radius: 10px; font-size: 14px" :style="{ background: result.error ? '#fdecea' : '#e8f5ee', color: result.error ? '#c0392b' : '#2d6a4f' }">
      {{ result.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { authFetch } = useAuth()

const BATCH_SIZE = 10

const step = ref<'loading' | 'empty' | 'show'>('loading')
const ingredients = ref<Array<{ id: string; name: string; unit: string; per_serving: number }>>([])
const copied = ref(false)
const estimatesText = ref('')
const submitting = ref(false)
const result = ref<{ message: string; error?: boolean } | null>(null)

const ai = reactive({
  running: false,
  lastResult: null as { message: string; error?: boolean } | null,
})

const nextBatch = computed(() => ingredients.value.slice(0, BATCH_SIZE))
const ingredientJson = computed(() => JSON.stringify(ingredients.value, null, 2))

async function fetchIngredients(showLoading = true) {
  if (showLoading) step.value = 'loading'
  const data = await authFetch<{ ingredients: typeof ingredients.value }>('/api/recipes/backfill-protein', {
    method: 'POST',
  })
  ingredients.value = data.ingredients || []
  step.value = ingredients.value.length > 0 ? 'show' : 'empty'
}

function copyIngredients() {
  navigator.clipboard.writeText(ingredientJson.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function runAiBackfill() {
  result.value = null
  ai.lastResult = null
  ai.running = true

  const batch = ingredients.value.slice(0, BATCH_SIZE)

  try {
    // Get AI estimates
    const { estimates } = await authFetch<{ estimates: Array<{ id: string; protein: number | null }> }>(
      '/api/recipes/estimate-protein',
      { method: 'POST', body: { ingredients: batch } },
    )

    // Build feedback showing what was estimated
    const details = batch.map((ing, i) => {
      const est = estimates[i]
      const val = est?.protein !== null ? `${est.protein}g` : 'unknown'
      return `${ing.name}: ${val}`
    }).join(', ')

    // Save estimates to DB
    const { updated } = await authFetch<{ updated: number }>('/api/recipes/backfill-protein', {
      method: 'POST',
      body: { estimates },
    })

    ai.lastResult = { message: `Updated ${updated}/${batch.length}: ${details}` }
  } catch (err: any) {
    ai.lastResult = {
      message: err?.data?.statusMessage || err?.message || 'Unknown error',
      error: true,
    }
  }

  ai.running = false
  await fetchIngredients(false)
}

async function submitEstimates() {
  result.value = null
  let estimates: Array<{ id: string; protein: number | null }>
  try {
    estimates = JSON.parse(estimatesText.value)
    if (!Array.isArray(estimates)) throw new Error()
  } catch {
    result.value = { message: 'Invalid JSON. Paste a valid array.', error: true }
    return
  }

  submitting.value = true
  try {
    const data = await authFetch<{ updated: number }>('/api/recipes/backfill-protein', {
      method: 'POST',
      body: { estimates },
    })
    result.value = { message: `Updated ${data.updated} ingredients with protein data.` }
    await fetchIngredients()
    estimatesText.value = ''
  } catch (err: any) {
    result.value = { message: err?.data?.statusMessage || 'Failed to update.', error: true }
  } finally {
    submitting.value = false
  }
}

onMounted(fetchIngredients)
</script>
