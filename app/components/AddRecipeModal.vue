<template>
  <div
    style="
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.48);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    "
    @click="$emit('close')"
  >
    <div
      class="slide-up"
      style="
        background: #fff;
        border-radius: 20px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      "
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
          style="
            background: #f5f0eb;
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font-size: 16px;
            color: #6b6560;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 12px;
            flex-shrink: 0;
          "
          @click="$emit('close')"
        >
          &times;
        </button>
      </div>

      <div style="padding: 18px 24px 24px; display: flex; flex-direction: column; gap: 13px">
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
            fontSize: '12.5px',
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
