<template>
  <div
    class="modal-overlay"
    @click="$emit('close')"
  >
    <div
      class="slide-up modal-panel"
      style="max-width: 500px; overflow-y: auto"
      @click.stop
    >
      <div style="padding: 24px 24px 0; display: flex; justify-content: space-between; align-items: flex-start">
        <div>
          <h2 style="font-family: 'Fraunces', serif; font-size: 21px; font-weight: 700">Add a Recipe</h2>
          <p style="font-size: 13px; color: #9b9590; margin-top: 4px">
            Paste a recipe as JSON to add it to your collection.
          </p>
        </div>
        <button
          class="modal-close-btn"
          style="margin-left: 12px; flex-shrink: 0"
          @click="$emit('close')"
        >
          &times;
        </button>
      </div>

      <div style="padding: 18px 24px 24px; display: flex; flex-direction: column; gap: 13px">
        <!-- Copyable AI prompt -->
        <div style="background: #f5f0eb; border-radius: 10px; overflow: hidden">
          <button
            style="
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 10px 14px;
              background: none;
              border: none;
              cursor: pointer;
              font-family: 'DM Sans', sans-serif;
              font-size: 12.5px;
              color: #6b6560;
            "
            @click="showPrompt = !showPrompt"
          >
            <span>Use this prompt with an AI to format your recipe</span>
            <span style="font-size: 11px; transition: transform .2s" :style="{ transform: showPrompt ? 'rotate(180deg)' : '' }">&#x25BC;</span>
          </button>
          <div v-if="showPrompt" class="fade-in" style="padding: 0 14px 12px">
            <div
              style="
                background: #fff;
                border: 1.5px solid #e8e2db;
                border-radius: 8px;
                padding: 10px 12px;
                font-size: 11.5px;
                line-height: 1.6;
                color: #4a4540;
                white-space: pre-wrap;
                max-height: 180px;
                overflow-y: auto;
              "
            >{{ aiPromptText }}</div>
            <button
              style="
                margin-top: 8px;
                padding: 6px 14px;
                border-radius: 7px;
                background: #2d6a4f;
                border: none;
                color: #fff;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                font-family: 'DM Sans', sans-serif;
              "
              @click="copyPrompt"
            >
              {{ promptCopied ? 'Copied!' : 'Copy prompt' }}
            </button>
          </div>
        </div>

        <textarea
          v-model="input"
          placeholder='Paste recipe JSON here...\n{"name":"...","cookTime":"...","description":"...","tags":[...],"ingredients":{...}}'
          class="import-focus"
          rows="8"
          :style="{
            width: '100%',
            border: '1.5px solid #e8e2db',
            borderRadius: '10px',
            padding: '11px 14px',
            fontSize: '16px',
            color: '#1a1a1a',
            resize: 'vertical',
            lineHeight: '1.65',
            background: '#faf8f5',
            transition: 'border-color .2s',
          }"
          @input="resetState"
        />

        <p
          v-if="status === 'error'"
          style="font-size: 13px; color: #c0392b; background: #fdecea; padding: 10px 14px; border-radius: 8px"
        >
          &#x26a0;&#xfe0f; {{ errMsg }}
        </p>

        <!-- Preview -->
        <div v-if="status === 'done' && preview" class="fade-in" style="background: #f5f0eb; border-radius: 12px; padding: 14px">
          <div style="display: flex; align-items: center; gap: 11px; margin-bottom: 9px">
            <div style="font-size: 26px">{{ preview.emoji }}</div>
            <div>
              <p style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600">{{ preview.name }}</p>
              <p style="font-size: 11.5px; color: #6b6560">
                {{ preview.cookTime }} &middot; {{ preview.ingredients.length }} ingredients
              </p>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 9px">
            <TagBadge v-for="t in preview.tags" :key="t" :label="t" />
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px">
            <span
              v-for="ing in preview.ingredients"
              :key="ing.name"
              style="font-size: 11px; background: #fff; border: 1px solid #e8e2db; border-radius: 6px; padding: 2px 8px; color: #4a4540"
            >
              {{ ing.name }}
            </span>
          </div>
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <button
            style="
              padding: 10px 18px;
              border-radius: 10px;
              background: transparent;
              border: 1.5px solid #e8e2db;
              color: #6b6560;
              font-size: 13px;
              cursor: pointer;
              font-family: 'DM Sans', sans-serif;
            "
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            v-if="status === 'done'"
            style="
              padding: 10px 20px;
              border-radius: 10px;
              background: #2d6a4f;
              border: none;
              color: #fff;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              font-family: 'DM Sans', sans-serif;
            "
            @click="confirmImport"
          >
            &#x2713; Add to My Recipes
          </button>
          <button
            v-else
            :disabled="!input.trim()"
            :style="{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              background: input.trim() ? '#2d6a4f' : '#d4ccc4',
              color: '#fff',
              cursor: input.trim() ? 'pointer' : 'default',
              fontFamily: '\'DM Sans\', sans-serif',
              transition: 'background .2s',
            }"
            @click="parseRecipe"
          >
            Parse Recipe &rarr;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EMOJIS, IMPORT_COLORS } from '~/utils/constants'

const emit = defineEmits<{
  close: []
  import: [recipe: any]
}>()

const input = ref('')
const status = ref<'idle' | 'done' | 'error'>('idle')
const errMsg = ref('')
const preview = ref<any>(null)
const showPrompt = ref(false)
const promptCopied = ref(false)

const aiPromptText = `Convert the following recipe into this exact JSON format. Do NOT include salt, pepper, or olive oil in the ingredients list (we always have those). Output ONLY the JSON, no extra text.

{
  "name": "Recipe Name",
  "cookTime": "30 min",
  "description": "Short description of the dish.",
  "sourceUrl": "https://example.com/recipe",
  "instructions": "Step 1: Do this.\\nStep 2: Do that.\\nStep 3: Serve.",
  "tags": ["Vegetarian", "Quick"],
  "emoji": "🥘",
  "color": "#7ba7a7",
  "ingredients": [
    { "name": "Ingredient name", "unit": "g", "perServing": 150 }
  ]
}

Rules:
- "perServing" is the quantity needed for 1 serving
- Use these units: g, ml, tbsp, tsp, pcs, slices
- Tags can include: Vegetarian, Vegan, Healthy, Spicy, Quick, High Protein, Comfort Food, Classic
- Pick an emoji that matches the dish
- Pick a hex color that matches the dish theme
- All quantities MUST use metric units (g, ml, etc.) — convert from imperial if needed
- Do NOT include: salt, pepper, olive oil
- "sourceUrl": the original URL of the recipe (if available, otherwise empty string)
- "instructions": step-by-step preparation instructions, each step separated by \\n

Here is the recipe:`

function copyPrompt() {
  navigator.clipboard.writeText(aiPromptText)
  promptCopied.value = true
  setTimeout(() => { promptCopied.value = false }, 2000)
}

function resetState() {
  status.value = 'idle'
  preview.value = null
  errMsg.value = ''
}

function parseRecipe() {
  if (!input.value.trim()) return
  try {
    const parsed = JSON.parse(input.value.trim())
    if (!parsed.name || !parsed.ingredients) {
      throw new Error('Missing name or ingredients')
    }

    // Convert ingredients from object format to array format if needed
    let ingredients: Array<{ name: string; unit: string; perServing: number }>
    if (Array.isArray(parsed.ingredients)) {
      ingredients = parsed.ingredients
    } else {
      ingredients = Object.entries(parsed.ingredients).map(([name, val]: [string, any]) => ({
        name,
        unit: val.unit || 'pcs',
        perServing: val.perServing || 0,
      }))
    }

    // Ensure "Imported" tag is present
    const tags = parsed.tags || []
    if (!tags.includes('Imported')) tags.push('Imported')

    preview.value = {
      name: parsed.name,
      cookTime: parsed.cookTime || '',
      description: parsed.description || '',
      sourceUrl: parsed.sourceUrl || '',
      instructions: parsed.instructions || '',
      tags,
      emoji: parsed.emoji || EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      color: parsed.color || IMPORT_COLORS[Math.floor(Math.random() * IMPORT_COLORS.length)],
      ingredients,
    }
    status.value = 'done'
  } catch {
    status.value = 'error'
    errMsg.value = 'Invalid JSON. Make sure it includes "name" and "ingredients" fields.'
  }
}

function confirmImport() {
  if (preview.value) {
    emit('import', preview.value)
    emit('close')
  }
}
</script>
