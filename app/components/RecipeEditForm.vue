<template>
  <div>
    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileSelect"
    />

    <!-- Name -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px">
      <div class="input-wrap" style="flex: 1">
        <input
          v-model="editForm.name"
          class="form-input"
          style="font-family: 'Fraunces', serif; font-size: 21px; font-weight: 700; line-height: 1.3; padding: 4px 8px; padding-right: 32px"
        />
        <button v-if="editForm.name" type="button" class="input-clear-btn" aria-label="Clear name" @click="editForm.name = ''">&times;</button>
      </div>
      <div style="display: flex; gap: 6px; margin-left: 12px; flex-shrink: 0">
        <button
          class="modal-close-btn"
          aria-label="Close"
          @click="$emit('close')"
        >
          &times;
        </button>
      </div>
    </div>

    <!-- Photo upload -->
    <div style="margin-bottom: 12px">
      <label class="edit-label">Photo</label>
      <div style="display: flex; gap: 8px; align-items: center">
        <button
          :disabled="imageUploading"
          class="btn-sm-green"
          @click="fileInputRef?.click()"
        >
          {{ imageUploading ? 'Uploading...' : (editForm.imagePath ? 'Change photo' : 'Add photo') }}
        </button>
        <button
          v-if="editForm.imagePath && !imageUploading"
          class="btn-sm-red"
          @click="handleRemoveImage"
        >
          Remove photo
        </button>
      </div>
    </div>

    <!-- Emoji -->
    <div style="margin-bottom: 10px">
      <label class="edit-label">Emoji</label>
      <input
        v-model="editForm.emoji"
        class="form-input"
        style="width: 60px; font-size: 20px; text-align: center; padding: 4px"
      />
    </div>

    <!-- Cook time -->
    <div style="margin-bottom: 12px">
      <label class="edit-label">Cook time</label>
      <div class="input-wrap">
        <input
          v-model="editForm.cookTime"
          class="form-input"
          style="font-size: 16px; padding: 6px 8px; padding-right: 32px"
        />
        <button v-if="editForm.cookTime" type="button" class="input-clear-btn" aria-label="Clear cook time" @click="editForm.cookTime = ''">&times;</button>
      </div>
    </div>

    <!-- Description -->
    <div style="margin-bottom: 16px">
      <label class="edit-label">Description</label>
      <div class="input-wrap input-wrap--textarea">
        <textarea
          v-model="editForm.description"
          rows="3"
          class="form-input"
          style="font-size: 16px; padding: 8px; padding-right: 32px; line-height: 1.55; resize: vertical"
        />
        <button v-if="editForm.description" type="button" class="input-clear-btn" aria-label="Clear description" @click="editForm.description = ''">&times;</button>
      </div>
    </div>

    <!-- Source URL -->
    <div style="margin-bottom: 16px">
      <label class="edit-label">Source URL</label>
      <div class="input-wrap">
        <input
          v-model="editForm.sourceUrl"
          type="url"
          placeholder="https://..."
          class="form-input"
          style="font-size: 16px; padding: 6px 8px; padding-right: 32px"
        />
        <button v-if="editForm.sourceUrl" type="button" class="input-clear-btn" aria-label="Clear URL" @click="editForm.sourceUrl = ''">&times;</button>
      </div>
    </div>

    <!-- Ingredients -->
    <div style="margin-bottom: 16px">
      <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px">
        Ingredients <span style="font-weight: 400; color: #9b9590; font-family: 'DM Sans', sans-serif; font-size: 12px">(per serving)</span>
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px">
        <div
          v-for="(ing, i) in editForm.ingredients"
          :key="i"
          style="display: flex; gap: 6px; align-items: center"
        >
          <input
            v-model="ing.name"
            placeholder="Name"
            class="form-input"
            style="flex: 2; font-size: 16px; padding: 6px 8px"
          />
          <input
            v-model.number="ing.perServing"
            type="number"
            step="0.1"
            min="0"
            placeholder="Qty"
            class="form-input"
            style="width: 60px; font-size: 16px; padding: 6px 8px; text-align: center"
          />
          <input
            v-model="ing.unit"
            placeholder="Unit"
            class="form-input"
            style="width: 60px; font-size: 16px; padding: 6px 8px"
          />
          <input
            v-model.number="ing.calories"
            type="number"
            step="1"
            min="0"
            placeholder="kcal"
            class="form-input"
            style="width: 55px; font-size: 16px; padding: 6px 8px; text-align: center"
          />
          <input
            v-model.number="ing.protein"
            type="number"
            step="0.1"
            min="0"
            placeholder="prot"
            class="form-input"
            style="width: 55px; font-size: 16px; padding: 6px 8px; text-align: center"
          />
          <button
            style="width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #e8e2db; background: #fff; color: #c0392b; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0"
            @click="editForm.ingredients.splice(i, 1)"
          >
            &times;
          </button>
        </div>
      </div>
      <button
        class="btn-sm-green"
        style="margin-top: 8px"
        @click="editForm.ingredients.push({ name: '', perServing: 1, unit: '', calories: null, protein: null })"
      >
        + Add ingredient
      </button>
    </div>

    <!-- Instructions -->
    <div style="margin-top: 16px">
      <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px">
        Instructions
      </h3>
      <div class="input-wrap input-wrap--textarea">
        <textarea
          v-model="editForm.instructions"
          rows="6"
          placeholder="One step per line..."
          class="form-input"
          style="font-size: 16px; padding: 8px; padding-right: 32px; line-height: 1.55; resize: vertical"
        />
        <button v-if="editForm.instructions" type="button" class="input-clear-btn" aria-label="Clear instructions" @click="editForm.instructions = ''">&times;</button>
      </div>
    </div>

    <!-- Notes -->
    <div style="margin-top: 16px">
      <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px">
        Notes
      </h3>
      <div class="input-wrap input-wrap--textarea">
        <textarea
          v-model="editForm.notes"
          rows="4"
          placeholder="Personal notes, tips, variations..."
          class="form-input"
          style="font-size: 16px; padding: 8px; padding-right: 32px; line-height: 1.55; resize: vertical"
        />
        <button v-if="editForm.notes" type="button" class="input-clear-btn" aria-label="Clear notes" @click="editForm.notes = ''">&times;</button>
      </div>
    </div>

    <!-- Save / Cancel buttons -->
    <div style="display: flex; gap: 8px; margin-top: 24px">
      <button
        class="btn btn-secondary"
        style="flex: 1"
        @click="cancelEditing"
      >
        Cancel
      </button>
      <button
        class="btn btn-primary"
        style="flex: 1; font-size: 13px"
        @click="saveEdit"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeData } from '~/composables/useRecipes'
import { compressImage } from '~/utils/compressImage'

const props = defineProps<{
  recipe: RecipeData
}>()

const emit = defineEmits<{
  save: [recipe: RecipeData]
  cancel: []
  'image-updated': [imagePath: string | null]
  close: []
}>()

const { uploadRecipeImage, removeRecipeImage } = useRecipes()
const toast = useToast()

const fileInputRef = ref<HTMLInputElement | null>(null)
const imageUploading = ref(false)

const editForm = ref<Omit<RecipeData, 'id' | 'isBuiltIn'>>({
  name: '',
  cookTime: '',
  description: '',
  tags: [],
  emoji: '',
  color: '',
  sourceUrl: '',
  instructions: '',
  notes: '',
  ingredients: [],
  imagePath: null,
})

// Expose state for parent (FoodVisual binding)
const displayData = computed(() => ({
  ...editForm.value,
}))

defineExpose({ imageUploading, displayData, fileInputRef })

function initForm() {
  editForm.value = {
    name: props.recipe.name,
    cookTime: props.recipe.cookTime,
    description: props.recipe.description,
    tags: [...(props.recipe.tags || [])],
    emoji: props.recipe.emoji,
    color: props.recipe.color,
    sourceUrl: props.recipe.sourceUrl,
    instructions: props.recipe.instructions,
    notes: props.recipe.notes,
    ingredients: (props.recipe.ingredients || []).map(ing => ({ ...ing })),
    imagePath: props.recipe.imagePath,
  }
}

// Initialize on mount
initForm()

async function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageUploading.value = true
  try {
    const blob = await compressImage(file)
    const updated = await uploadRecipeImage(props.recipe.id, blob)
    editForm.value.imagePath = updated.imagePath
    emit('image-updated', updated.imagePath)
  } catch (err) {
    console.error('Image upload failed:', err)
    toast.error('Image upload failed')
  } finally {
    imageUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

async function handleRemoveImage() {
  imageUploading.value = true
  try {
    await removeRecipeImage(props.recipe.id)
    editForm.value.imagePath = null
    emit('image-updated', null)
  } catch (err) {
    console.error('Image remove failed:', err)
    toast.error('Failed to remove image')
  } finally {
    imageUploading.value = false
  }
}

function cancelEditing() {
  emit('cancel')
}

function saveEdit() {
  emit('save', { ...editForm.value, id: props.recipe.id, isBuiltIn: false } as RecipeData)
}
</script>
