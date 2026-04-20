<template>
  <BaseModal style="display: flex; flex-direction: column" @close="$emit('close')">
      <!-- Visual header -->
      <FoodVisual :recipe="displayRecipe" :loading="editing ? (editFormRef?.imageUploading ?? false) : imageUploading" />

      <!-- Scrollable content -->
      <div style="flex: 1; overflow-y: auto; padding: 20px 24px 24px">
        <!-- Editing mode -->
        <RecipeEditForm
          v-if="editing"
          ref="editFormRef"
          :recipe="recipe"
          @save="onSave"
          @cancel="editing = false"
          @image-updated="onImageUpdated"
          @close="$emit('close')"
        />

        <!-- Read-only mode -->
        <template v-else>
          <!-- Name + action buttons -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px">
            <h2 style="font-family: 'Fraunces', serif; font-size: 21px; font-weight: 700; line-height: 1.3; flex: 1">
              {{ recipe.name }}
            </h2>
            <div style="display: flex; gap: 6px; margin-left: 12px; flex-shrink: 0">
              <!-- Camera button -->
              <button
                v-if="editable"
                :disabled="imageUploading"
                aria-label="Upload photo"
                class="btn-icon"
                @click="fileInputRef?.click()"
              >
                &#x1F4F7;
              </button>
              <!-- Edit button -->
              <button
                v-if="editable"
                aria-label="Edit recipe"
                class="btn-icon"
                @click="editing = true"
              >
                &#x270E;
              </button>
              <!-- Close button -->
              <button
                class="modal-close-btn"
                aria-label="Close"
                @click="$emit('close')"
              >
                &times;
              </button>
            </div>
          </div>

          <!-- Hidden file input for standalone camera button -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onFileSelect"
          />

          <!-- Cook time -->
          <p v-if="recipe.cookTime" style="font-size: 13px; color: #9b9590; margin-bottom: 12px">
            &#x23F1; {{ recipe.cookTime }}
          </p>

          <!-- Tags -->
          <div v-if="recipe.tags?.length" style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 16px">
            <TagBadge v-for="t in recipe.tags" :key="t" :label="t" />
          </div>

          <!-- Rating -->
          <div style="margin-bottom: 16px">
            <RecipeRating
              :user-rating="recipe.rating?.userRating ?? null"
              :avg-rating="recipe.rating?.avgRating ?? null"
              :rating-count="recipe.rating?.ratingCount ?? 0"
              size="md"
              @rate="handleRate"
            />
          </div>

          <!-- Description -->
          <p v-if="recipe.description" style="font-size: 13.5px; color: #4a4540; line-height: 1.65; margin-bottom: 20px">
            {{ recipe.description }}
          </p>

          <!-- Source URL -->
          <a
            v-if="recipe.sourceUrl"
            :href="recipe.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="source-link"
          >
            &#x1F517; View original recipe
          </a>

          <!-- Ingredients -->
          <div v-if="loadingIngredients" style="font-size: 13px; color: #9b9590; margin-bottom: 16px">Loading ingredients…</div>
          <div v-else-if="recipe.ingredients?.length">
            <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px">
              Ingredients <span style="font-weight: 400; color: #9b9590; font-family: 'DM Sans', sans-serif; font-size: 12px">{{ displayServings > 1 ? `(for ${displayServings} servings)` : '(per serving)' }}</span>
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0">
              <div
                v-for="(ing, i) in recipe.ingredients"
                :key="ing.name"
                class="ing-detail-row"
              >
                <span style="font-size: 13.5px; color: #2a2520">{{ ing.name }}</span>
                <span style="font-size: 12.5px; color: #9b9590; flex-shrink: 0; margin-left: 12px">
                  {{ formatQuantity(ing.perServing * displayServings) }} {{ ing.unit }}
                  <template v-if="ing.calories != null">&middot; {{ formatQuantity(ing.calories * displayServings) }} kcal</template>
                  <template v-if="ing.protein != null">&middot; {{ formatQuantity(ing.protein * displayServings) }}g protein</template>
                </span>
              </div>
            </div>
            <div v-if="totalCalories > 0 || totalProtein > 0" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e8e2db; font-size: 13px; font-weight: 600; color: #2a2520; text-align: right">
              <template v-if="totalCalories > 0">~{{ formatQuantity(totalCalories * displayServings) }} kcal</template>
              <template v-if="totalCalories > 0 && totalProtein > 0"> &middot; </template>
              <template v-if="totalProtein > 0">~{{ formatQuantity(totalProtein * displayServings) }}g protein</template>
              {{ displayServings > 1 ? 'total' : 'per serving' }}
            </div>
          </div>

          <!-- Instructions -->
          <div v-if="recipe.instructions" style="margin-top: 20px">
            <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px">
              How to prepare
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0">
              <div
                v-for="(step, i) in instructionSteps"
                :key="i"
                class="instruction-step"
              >
                <span class="step-number">{{ i + 1 }}.</span>
                <span class="step-text">{{ step }}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="recipe.notes" style="margin-top: 20px">
            <h3 style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; margin-bottom: 10px">
              Notes
            </h3>
            <p style="font-size: 13.5px; color: #4a4540; line-height: 1.65; white-space: pre-wrap">{{ recipe.notes }}</p>
          </div>

          <!-- Delete button (compact) -->
          <div v-if="deletable && !confirmingDelete" style="display: flex; justify-content: flex-end; margin-top: 28px">
            <button
              class="btn btn-danger-outline"
              @click="confirmingDelete = true"
            >
              Delete recipe
            </button>
          </div>
          <div v-if="deletable && confirmingDelete" class="confirm-delete">
            <p style="font-size: 13px; color: #c0392b; margin-bottom: 10px">
              Delete <strong>{{ recipe.name }}</strong>?
            </p>
            <div style="display: flex; gap: 8px; justify-content: center">
              <button
                class="btn btn-secondary"
                style="padding: 8px 18px; border-radius: 8px; font-size: 12.5px"
                @click="confirmingDelete = false"
              >
                Cancel
              </button>
              <button
                class="btn btn-danger"
                @click="$emit('delete', recipe.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </template>
      </div>
  </BaseModal>
</template>

<script setup lang="ts">
import type { RecipeData } from '~/composables/useRecipes'
import { compressImage } from '~/utils/compressImage'

const props = defineProps<{
  recipe: RecipeData
  deletable?: boolean
  editable?: boolean
  servings?: number
}>()

const emit = defineEmits<{
  close: []
  delete: [id: string]
  update: [recipe: RecipeData]
}>()

const { uploadRecipeImage, setRating, fetchRecipeIngredients } = useRecipes()
const toast = useToast()

const loadingIngredients = ref(false)
onMounted(async () => {
  if (props.recipe.ingredients === undefined) {
    loadingIngredients.value = true
    try {
      await fetchRecipeIngredients(props.recipe.id)
    } finally {
      loadingIngredients.value = false
    }
  }
})

async function handleRate(value: number) {
  await setRating(props.recipe.id, value)
}

const confirmingDelete = ref(false)
const editing = ref(false)
const editFormRef = ref<InstanceType<typeof RecipeEditForm> | null>(null)
const localImagePath = ref<string | null>(null)

// Standalone camera button (read-only mode)
const imageUploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const displayRecipe = computed(() => {
  if (editing.value && editFormRef.value) {
    return { ...editFormRef.value.displayData }
  }
  return { ...props.recipe, imagePath: localImagePath.value ?? props.recipe.imagePath }
})

const displayServings = computed(() => props.servings && props.servings > 1 ? props.servings : 1)

const totalCalories = computed(() =>
  props.recipe.ingredients?.reduce((sum, ing) => sum + (ing.calories ?? 0), 0) ?? 0,
)

const totalProtein = computed(() =>
  props.recipe.ingredients?.reduce((sum, ing) => sum + (ing.protein ?? 0), 0) ?? 0,
)

const instructionSteps = computed(() =>
  props.recipe.instructions
    ? props.recipe.instructions.split('\n').map(s => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean)
    : [],
)

function formatQuantity(val: number): string {
  return Number.isInteger(val) ? String(val) : val.toFixed(1)
}

function onSave(recipe: RecipeData) {
  emit('update', recipe)
  editing.value = false
}

function onImageUpdated(imagePath: string | null) {
  localImagePath.value = imagePath
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
    toast.error('Image upload failed')
  } finally {
    imageUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}
</script>
