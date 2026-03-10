<template>
  <div
    class="modal-overlay"
    @click="$emit('close')"
  >
    <div
      class="slide-up modal-panel"
      style="display: flex; flex-direction: column"
      @click.stop
    >
      <!-- Visual header -->
      <FoodVisual :recipe="displayRecipe" :loading="imageUploading" />

      <!-- Scrollable content -->
      <div style="flex: 1; overflow-y: auto; padding: 20px 24px 24px">
        <!-- Name + action buttons -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px">
          <!-- Name: editing -->
          <input
            v-if="editing"
            v-model="editForm.name"
            class="form-input"
            style="font-family: 'Fraunces', serif; font-size: 21px; font-weight: 700; line-height: 1.3; flex: 1; padding: 4px 8px"
          />
          <!-- Name: read-only -->
          <h2 v-else style="font-family: 'Fraunces', serif; font-size: 21px; font-weight: 700; line-height: 1.3; flex: 1">
            {{ recipe.name }}
          </h2>
          <div style="display: flex; gap: 6px; margin-left: 12px; flex-shrink: 0">
            <!-- Camera button -->
            <button
              v-if="editable && !editing"
              :disabled="imageUploading"
              style="
                background: #f5f0eb;
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;
                font-size: 15px;
                color: #6b6560;
                display: flex;
                align-items: center;
                justify-content: center;
              "
              @click="fileInputRef?.click()"
            >
              &#x1F4F7;
            </button>
            <!-- Edit button -->
            <button
              v-if="editable && !editing"
              style="
                background: #f5f0eb;
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;
                font-size: 15px;
                color: #6b6560;
                display: flex;
                align-items: center;
                justify-content: center;
              "
              @click="startEditing"
            >
              &#x270E;
            </button>
            <!-- Close button -->
            <button
              class="modal-close-btn"
              @click="$emit('close')"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Hidden file input (always in DOM for camera button + edit mode) -->
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          style="display: none"
          @change="onFileSelect"
        />

        <!-- Photo upload (editing) -->
        <div v-if="editing" style="margin-bottom: 12px">
          <label style="font-size: 11px; color: #9b9590; display: block; margin-bottom: 4px">Photo</label>
          <div style="display: flex; gap: 8px; align-items: center">
            <button
              :disabled="imageUploading"
              style="
                font-size: 12.5px;
                color: #2d6a4f;
                background: #e8f5ee;
                border: none;
                border-radius: 8px;
                padding: 6px 12px;
                cursor: pointer;
                font-family: 'DM Sans', sans-serif;
                font-weight: 500;
              "
              @click="fileInputRef?.click()"
            >
              {{ imageUploading ? 'Uploading...' : (displayRecipe.imagePath ? 'Change photo' : 'Add photo') }}
            </button>
            <button
              v-if="displayRecipe.imagePath && !imageUploading"
              style="
                font-size: 12.5px;
                color: #c0392b;
                background: #fdecea;
                border: none;
                border-radius: 8px;
                padding: 6px 12px;
                cursor: pointer;
                font-family: 'DM Sans', sans-serif;
                font-weight: 500;
              "
              @click="handleRemoveImage"
            >
              Remove photo
            </button>
          </div>
        </div>

        <!-- Emoji (editing) -->
        <div v-if="editing" style="margin-bottom: 10px">
          <label style="font-size: 11px; color: #9b9590; display: block; margin-bottom: 4px">Emoji</label>
          <input
            v-model="editForm.emoji"
            class="form-input"
            style="width: 60px; font-size: 20px; text-align: center; padding: 4px"
          />
        </div>

        <!-- Cook time -->
        <div v-if="editing" style="margin-bottom: 12px">
          <label style="font-size: 11px; color: #9b9590; display: block; margin-bottom: 4px">Cook time</label>
          <input
            v-model="editForm.cookTime"
            class="form-input"
            style="width: 100%; font-size: 13px; padding: 6px 8px"
          />
        </div>
        <p v-else-if="recipe.cookTime" style="font-size: 13px; color: #9b9590; margin-bottom: 12px">
          &#x23F1; {{ recipe.cookTime }}
        </p>

        <!-- Tags -->
        <div v-if="!editing && recipe.tags?.length" style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 16px">
          <TagBadge v-for="t in recipe.tags" :key="t" :label="t" />
        </div>

        <!-- Rating -->
        <div v-if="!editing" style="margin-bottom: 16px">
          <RecipeRating
            :user-rating="recipe.rating?.userRating ?? null"
            :avg-rating="recipe.rating?.avgRating ?? null"
            :rating-count="recipe.rating?.ratingCount ?? 0"
            size="md"
            @rate="handleRate"
          />
        </div>

        <!-- Description -->
        <div v-if="editing" style="margin-bottom: 16px">
          <label style="font-size: 11px; color: #9b9590; display: block; margin-bottom: 4px">Description</label>
          <textarea
            v-model="editForm.description"
            rows="3"
            class="form-input"
            style="width: 100%; font-size: 13.5px; padding: 8px; line-height: 1.55; resize: vertical"
          />
        </div>
        <p v-else-if="recipe.description" style="font-size: 13.5px; color: #4a4540; line-height: 1.65; margin-bottom: 20px">
          {{ recipe.description }}
        </p>

        <!-- Source URL -->
        <div v-if="editing" style="margin-bottom: 16px">
          <label style="font-size: 11px; color: #9b9590; display: block; margin-bottom: 4px">Source URL</label>
          <input
            v-model="editForm.sourceUrl"
            type="url"
            placeholder="https://..."
            class="form-input"
            style="width: 100%; font-size: 13px; padding: 6px 8px"
          />
        </div>
        <a
          v-else-if="recipe.sourceUrl"
          :href="recipe.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #2d6a4f;
            text-decoration: none;
            background: #e8f5ee;
            padding: 6px 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
          "
        >
          &#x1F517; View original recipe
        </a>

        <!-- Ingredients -->
        <div v-if="editing" style="margin-bottom: 16px">
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
                style="flex: 2; font-size: 13px; padding: 6px 8px"
              />
              <input
                v-model.number="ing.perServing"
                type="number"
                step="0.1"
                min="0"
                placeholder="Qty"
                class="form-input"
                style="width: 60px; font-size: 13px; padding: 6px 8px; text-align: center"
              />
              <input
                v-model="ing.unit"
                placeholder="Unit"
                class="form-input"
                style="width: 60px; font-size: 13px; padding: 6px 8px"
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
            style="margin-top: 8px; font-size: 12.5px; color: #2d6a4f; background: #e8f5ee; border: none; border-radius: 8px; padding: 6px 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500"
            @click="editForm.ingredients.push({ name: '', perServing: 1, unit: '' })"
          >
            + Add ingredient
          </button>
        </div>
        <div v-else-if="recipe.ingredients?.length">
          <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px">
            Ingredients <span style="font-weight: 400; color: #9b9590; font-family: 'DM Sans', sans-serif; font-size: 12px">(per serving)</span>
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0">
            <div
              v-for="(ing, i) in recipe.ingredients"
              :key="ing.name"
              :style="{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 0',
                borderBottom: i < recipe.ingredients.length - 1 ? '1px solid #f0ebe5' : 'none',
              }"
            >
              <span style="font-size: 13.5px; color: #2a2520">{{ ing.name }}</span>
              <span style="font-size: 12.5px; color: #9b9590; flex-shrink: 0; margin-left: 12px">
                {{ formatQuantity(ing.perServing) }} {{ ing.unit }}
              </span>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div v-if="editing" style="margin-top: 16px">
          <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px">
            Instructions
          </h3>
          <textarea
            v-model="editForm.instructions"
            rows="6"
            placeholder="One step per line..."
            class="form-input"
            style="width: 100%; font-size: 13.5px; padding: 8px; line-height: 1.55; resize: vertical"
          />
        </div>
        <div v-else-if="recipe.instructions" style="margin-top: 20px">
          <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px">
            How to prepare
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0">
            <div
              v-for="(step, i) in instructionSteps"
              :key="i"
              style="display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0ebe5"
            >
              <span style="font-size: 12px; font-weight: 700; color: #2d6a4f; min-width: 22px; flex-shrink: 0">{{ i + 1 }}.</span>
              <span style="font-size: 13.5px; color: #4a4540; line-height: 1.55">{{ step }}</span>
            </div>
          </div>
        </div>

        <!-- Bottom actions: editing mode -->
        <div v-if="editing" style="display: flex; gap: 8px; margin-top: 24px">
          <button
            style="
              flex: 1;
              padding: 10px;
              border-radius: 10px;
              border: 1.5px solid #e8e2db;
              background: #fff;
              color: #6b6560;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              font-family: 'DM Sans', sans-serif;
            "
            @click="cancelEditing"
          >
            Cancel
          </button>
          <button
            style="
              flex: 1;
              padding: 10px;
              border-radius: 10px;
              border: none;
              background: #2d6a4f;
              color: #fff;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              font-family: 'DM Sans', sans-serif;
            "
            @click="saveEdit"
          >
            Save
          </button>
        </div>

        <!-- Bottom actions: read-only mode -->
        <template v-else>
          <!-- Delete button (compact) -->
          <div v-if="deletable && !confirmingDelete" style="display: flex; justify-content: flex-end; margin-top: 28px">
            <button
              style="
                padding: 7px 16px;
                border-radius: 8px;
                border: 1.5px solid #e8e2db;
                background: #fff;
                color: #c0392b;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                font-family: 'DM Sans', sans-serif;
              "
              @click="confirmingDelete = true"
            >
              Delete recipe
            </button>
          </div>
          <div v-if="deletable && confirmingDelete" style="margin-top: 28px; background: #fdecea; border-radius: 10px; padding: 14px; text-align: center">
            <p style="font-size: 13px; color: #c0392b; margin-bottom: 10px">
              Delete <strong>{{ recipe.name }}</strong>?
            </p>
            <div style="display: flex; gap: 8px; justify-content: center">
              <button
                style="
                  padding: 8px 18px;
                  border-radius: 8px;
                  border: 1.5px solid #e8e2db;
                  background: #fff;
                  color: #6b6560;
                  font-size: 12.5px;
                  cursor: pointer;
                  font-family: 'DM Sans', sans-serif;
                "
                @click="confirmingDelete = false"
              >
                Cancel
              </button>
              <button
                style="
                  padding: 8px 18px;
                  border-radius: 8px;
                  border: none;
                  background: #c0392b;
                  color: #fff;
                  font-size: 12.5px;
                  font-weight: 600;
                  cursor: pointer;
                  font-family: 'DM Sans', sans-serif;
                "
                @click="$emit('delete', recipe.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeData } from '~/composables/useRecipes'
import { compressImage } from '~/utils/compressImage'

const props = defineProps<{
  recipe: RecipeData
  deletable?: boolean
  editable?: boolean
}>()

const emit = defineEmits<{
  close: []
  delete: [id: string]
  update: [recipe: RecipeData]
}>()

const { uploadRecipeImage, removeRecipeImage, setRating } = useRecipes()

async function handleRate(value: number) {
  await setRating(props.recipe.id, value)
}

const confirmingDelete = ref(false)
const editing = ref(false)
const imageUploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const localImagePath = ref<string | null>(null)
const editForm = ref<Omit<RecipeData, 'id' | 'isBuiltIn'>>({
  name: '',
  cookTime: '',
  description: '',
  tags: [],
  emoji: '',
  color: '',
  sourceUrl: '',
  instructions: '',
  ingredients: [],
  imagePath: null,
})

const displayRecipe = computed(() => {
  if (editing.value) {
    return { ...editForm.value, imagePath: localImagePath.value }
  }
  return { ...props.recipe, imagePath: localImagePath.value ?? props.recipe.imagePath }
})

const instructionSteps = computed(() =>
  props.recipe.instructions
    ? props.recipe.instructions.split('\n').map(s => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean)
    : [],
)

function formatQuantity(val: number): string {
  return Number.isInteger(val) ? String(val) : val.toFixed(1)
}

async function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageUploading.value = true
  try {
    const blob = await compressImage(file)
    const updated = await uploadRecipeImage(props.recipe.id, blob)
    localImagePath.value = updated.imagePath
  } catch (err) {
    console.error('Image upload failed:', err)
  } finally {
    imageUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

async function handleRemoveImage() {
  imageUploading.value = true
  try {
    await removeRecipeImage(props.recipe.id)
    localImagePath.value = null
  } catch (err) {
    console.error('Image remove failed:', err)
  } finally {
    imageUploading.value = false
  }
}

function startEditing() {
  localImagePath.value = props.recipe.imagePath
  editForm.value = {
    name: props.recipe.name,
    cookTime: props.recipe.cookTime,
    description: props.recipe.description,
    tags: [...(props.recipe.tags || [])],
    emoji: props.recipe.emoji,
    color: props.recipe.color,
    sourceUrl: props.recipe.sourceUrl,
    instructions: props.recipe.instructions,
    ingredients: (props.recipe.ingredients || []).map(ing => ({ ...ing })),
    imagePath: props.recipe.imagePath,
  }
  editing.value = true
}

function cancelEditing() {
  editing.value = false
}

function saveEdit() {
  emit('update', { ...editForm.value, id: props.recipe.id, isBuiltIn: false } as RecipeData)
  editing.value = false
}
</script>
