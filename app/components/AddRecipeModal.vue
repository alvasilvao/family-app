<template>
  <BaseModal style="max-width: 500px; overflow-y: auto" @close="$emit('close')">
      <div style="padding: 24px 24px 0; display: flex; justify-content: space-between; align-items: flex-start">
        <div>
          <h2 style="font-family: 'Fraunces', serif; font-size: 21px; font-weight: 700">Import a Recipe</h2>
          <p style="font-size: 13px; color: #9b9590; margin-top: 4px">
            Paste a recipe URL and we'll extract it automatically.
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

        <!-- URL Input (step: input) -->
        <template v-if="step === 'input'">
          <div style="display: flex; flex-direction: column; gap: 8px">
            <input
              v-model="url"
              type="url"
              placeholder="https://example.com/recipe..."
              class="import-focus"
              :style="{
                width: '100%',
                border: '1.5px solid #e8e2db',
                borderRadius: '10px',
                padding: '11px 14px',
                fontSize: '16px',
                color: '#1a1a1a',
                background: '#faf8f5',
                transition: 'border-color .2s',
              }"
              @keydown.enter="importFromUrl"
            />
            <button
              style="align-self: flex-start; font-size: 12px; color: #6b6560; background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0"
              @click="step = 'text'"
            >
              Or paste recipe text manually
            </button>
          </div>
        </template>

        <!-- Text Fallback (step: text) -->
        <template v-if="step === 'text'">
          <div style="background: #fef9e7; border-radius: 10px; padding: 12px 14px">
            <p style="font-size: 12.5px; color: #7a6c00; line-height: 1.5">
              {{ fetchErrorMsg || 'Paste the recipe content below — ingredients, instructions, and all.' }}
            </p>
          </div>
          <textarea
            v-model="text"
            placeholder="Paste the full recipe here (ingredients, instructions, etc.)..."
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
          />
          <button
            style="align-self: flex-start; font-size: 12px; color: #6b6560; background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0"
            @click="step = 'input'; fetchErrorMsg = ''"
          >
            Back to URL import
          </button>
        </template>

        <!-- Loading (step: loading) -->
        <template v-if="step === 'loading'">
          <div style="text-align: center; padding: 32px 0">
            <LoadingDots />
            <p style="font-size: 13px; color: #9b9590; margin-top: 12px">Extracting recipe...</p>
          </div>
        </template>

        <!-- Error message -->
        <p
          v-if="errMsg && step !== 'loading'"
          style="font-size: 13px; color: #c0392b; background: #fdecea; padding: 10px 14px; border-radius: 8px"
        >
          {{ errMsg }}
        </p>

        <!-- Preview (step: preview) -->
        <template v-if="step === 'preview' && preview">
          <div class="fade-in" style="background: #f5f0eb; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px">
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 11px">
              <div style="font-size: 26px">{{ preview.emoji }}</div>
              <div style="flex: 1">
                <p style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600">{{ preview.name }}</p>
                <p style="font-size: 11.5px; color: #6b6560">
                  {{ preview.cookTime || 'No cook time' }} &middot; {{ preview.ingredients.length }} ingredients
                </p>
              </div>
            </div>

            <!-- Description -->
            <p v-if="preview.description" style="font-size: 12.5px; color: #4a4540; line-height: 1.5">
              {{ preview.description }}
            </p>

            <!-- Tags -->
            <div v-if="preview.tags.length" style="display: flex; flex-wrap: wrap; gap: 4px">
              <TagBadge v-for="t in preview.tags" :key="t" :label="t" />
            </div>

            <!-- Ingredients -->
            <div>
              <p style="font-size: 11.5px; font-weight: 600; color: #6b6560; margin-bottom: 4px">Ingredients (per serving)</p>
              <div style="display: flex; flex-wrap: wrap; gap: 4px">
                <span
                  v-for="ing in preview.ingredients"
                  :key="ing.name"
                  style="font-size: 11px; background: #fff; border: 1px solid #e8e2db; border-radius: 6px; padding: 2px 8px; color: #4a4540"
                >
                  {{ ing.perServing }} {{ ing.unit }} {{ ing.name }}
                </span>
              </div>
            </div>

            <!-- Instructions preview -->
            <div v-if="preview.instructions">
              <p style="font-size: 11.5px; font-weight: 600; color: #6b6560; margin-bottom: 4px">Instructions</p>
              <p style="font-size: 11.5px; color: #4a4540; line-height: 1.6; white-space: pre-line; max-height: 120px; overflow-y: auto">
                {{ preview.instructions }}
              </p>
            </div>

            <!-- Source URL -->
            <p v-if="preview.sourceUrl" style="font-size: 11px; color: #9b9590">
              Source: {{ preview.sourceUrl }}
            </p>
          </div>
        </template>

        <!-- Action buttons -->
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <button
            v-if="step === 'preview'"
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
            @click="goBack"
          >
            Back
          </button>
          <button
            v-else-if="step !== 'loading'"
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
            v-if="step === 'preview'"
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
            v-else-if="step === 'input'"
            :disabled="!url.trim()"
            :style="{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              background: url.trim() ? '#2d6a4f' : '#d4ccc4',
              color: '#fff',
              cursor: url.trim() ? 'pointer' : 'default',
              fontFamily: '\'DM Sans\', sans-serif',
              transition: 'background .2s',
            }"
            @click="importFromUrl"
          >
            Import
          </button>
          <button
            v-else-if="step === 'text'"
            :disabled="!text.trim()"
            :style="{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              background: text.trim() ? '#2d6a4f' : '#d4ccc4',
              color: '#fff',
              cursor: text.trim() ? 'pointer' : 'default',
              fontFamily: '\'DM Sans\', sans-serif',
              transition: 'background .2s',
            }"
            @click="importFromText"
          >
            Extract Recipe
          </button>
        </div>
      </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { EMOJIS, IMPORT_COLORS } from '~/utils/constants'

interface ImportedRecipe {
  name: string
  cookTime: string
  description: string
  sourceUrl: string
  instructions: string
  tags: string[]
  emoji: string
  color: string
  ingredients: Array<{ name: string; unit: string; perServing: number }>
  imagePath: string | null
  createdAt: string | null
}

const emit = defineEmits<{
  close: []
  import: [recipe: ImportedRecipe]
}>()

const { importRecipe } = useRecipes()
const toast = useToast()

const step = ref<'input' | 'text' | 'loading' | 'preview'>('input')
const url = ref('')
const text = ref('')
const errMsg = ref('')
const fetchErrorMsg = ref('')
const preview = ref<ImportedRecipe | null>(null)
const previousStep = ref<'input' | 'text'>('input')

function goBack() {
  step.value = previousStep.value
  preview.value = null
  errMsg.value = ''
}

async function importFromUrl() {
  if (!url.value.trim()) return
  errMsg.value = ''
  previousStep.value = 'input'
  step.value = 'loading'

  try {
    const result = await importRecipe({ url: url.value.trim() })

    if (result.error === 'fetch_failed') {
      // Show text fallback
      fetchErrorMsg.value = result.message || 'Could not access that page. Paste the recipe content below.'
      step.value = 'text'
      return
    }

    if (result.recipe) {
      setPreview(result.recipe)
      step.value = 'preview'
    } else {
      errMsg.value = 'Could not extract a recipe from that page.'
      step.value = 'input'
    }
  } catch (err: any) {
    errMsg.value = err?.data?.statusMessage || 'Something went wrong. Try pasting the recipe text instead.'
    step.value = 'input'
  }
}

async function importFromText() {
  if (!text.value.trim()) return
  errMsg.value = ''
  previousStep.value = 'text'
  step.value = 'loading'

  try {
    const result = await importRecipe({ text: text.value.trim() })

    if (result.recipe) {
      setPreview(result.recipe)
      step.value = 'preview'
    } else {
      errMsg.value = 'Could not extract a recipe from that text.'
      step.value = 'text'
    }
  } catch (err: any) {
    errMsg.value = err?.data?.statusMessage || 'Failed to extract the recipe. Please check the content and try again.'
    step.value = 'text'
  }
}

function setPreview(recipe: any) {
  const tags = recipe.tags || []
  if (!tags.includes('Imported')) tags.push('Imported')

  preview.value = {
    name: recipe.name,
    cookTime: recipe.cookTime || '',
    description: recipe.description || '',
    sourceUrl: recipe.sourceUrl || url.value.trim() || '',
    instructions: recipe.instructions || '',
    tags,
    emoji: recipe.emoji || EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    color: recipe.color || IMPORT_COLORS[Math.floor(Math.random() * IMPORT_COLORS.length)],
    ingredients: recipe.ingredients || [],
    imagePath: null,
    createdAt: null,
  }
}

function confirmImport() {
  if (preview.value) {
    emit('import', preview.value)
    emit('close')
  }
}
</script>
