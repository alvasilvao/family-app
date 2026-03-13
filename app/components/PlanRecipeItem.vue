<template>
  <div
    :style="{
      background: '#fff',
      borderRadius: '14px',
      padding: '14px 16px',
      boxShadow: '0 2px 12px rgba(0,0,0,.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      opacity: cooked ? 0.6 : 1,
    }"
  >
    <!-- Cooked toggle checkbox -->
    <template v-if="showCookedToggle">
      <button
        v-if="!cooked"
        style="
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #d4cfc8;
          background: #fff;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        @click="$emit('toggle-cooked', recipe.id)"
      />
      <button
        v-else
        style="
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #2d6a4f;
          background: #2d6a4f;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          line-height: 1;
        "
        @click="$emit('toggle-cooked', recipe.id)"
      >
        &#x2713;
      </button>
    </template>

    <!-- Recipe visual: image or emoji -->
    <div
      v-if="recipe.imagePath || recipe.image_path"
      :style="{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        overflow: 'hidden',
        flexShrink: 0,
        cursor: 'pointer',
      }"
      @click="handleView"
    >
      <img
        :src="imageUrl"
        alt=""
        style="width: 100%; height: 100%; object-fit: cover"
      />
    </div>
    <div
      v-else
      :style="{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${recipe.color}28, ${recipe.color}66)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        flexShrink: 0,
        cursor: 'pointer',
      }"
      @click="handleView"
    >
      {{ recipe.emoji }}
    </div>

    <!-- Name & meta -->
    <div
      :style="{ flex: 1, minWidth: 0, cursor: 'pointer' }"
      @click="handleView"
    >
      <p
        class="plan-recipe-name"
        :style="{
          fontFamily: '\'Fraunces\', serif',
          fontSize: '15px',
          fontWeight: 600,
          lineHeight: '1.3',
          textDecoration: cooked ? 'line-through' : 'none',
          color: cooked ? '#9b9590' : undefined,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }"
      >
        {{ recipe.name }}
      </p>
      <div style="font-size: 12px; color: #9b9590; margin-top: 3px; display: flex; align-items: center; gap: 6px">
        <span v-if="subtitle">{{ subtitle }}</span>
        <template v-else>
          <span>{{ recipe.cookTime || recipe.cook_time }}</span>
          <span v-if="recipe.ingredients?.length" style="color: #c4bdb6">&#xB7;</span>
          <span v-if="recipe.ingredients?.length">{{ recipe.ingredients.length }} ingredients</span>
        </template>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="tags.length > 0" class="plan-recipe-tags" style="display: flex; gap: 4px; flex-shrink: 0">
      <span
        v-for="tag in tags.slice(0, 2)"
        :key="tag"
        :style="{
          fontSize: '10px',
          fontWeight: 600,
          color: recipe.color,
          background: recipe.color + '18',
          padding: '2px 8px',
          borderRadius: '999px',
          whiteSpace: 'nowrap',
        }"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Servings controls (editable) or static count -->
    <div v-if="servings != null && !planClosed" style="display: flex; align-items: center; gap: 6px; flex-shrink: 0">
      <button class="counter-btn counter-btn-circle" @click="$emit('remove', recipe.id)">&minus;</button>
      <span style="font-size: 14px; font-weight: 700; color: #2d6a4f; min-width: 20px; text-align: center">
        {{ servings }}
      </span>
      <button class="counter-btn counter-btn-circle" @click="$emit('update-servings', recipe.id)">+</button>
    </div>
    <span
      v-else-if="servings != null && planClosed"
      :style="{
        fontSize: '14px',
        fontWeight: 700,
        color: cooked ? '#9b9590' : '#2d6a4f',
        minWidth: '20px',
        textAlign: 'center',
      }"
    >
      {{ servings }}x
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    recipe: {
      id: string
      name: string
      emoji: string
      color: string
      cookTime?: string
      cook_time?: string
      imagePath?: string | null
      image_path?: string | null
      ingredients?: any[]
      tags?: string[]
      [key: string]: any
    }
    servings?: number
    cooked?: boolean
    planClosed?: boolean
    subtitle?: string
    showCookedToggle?: boolean
  }>(),
  {
    servings: undefined,
    cooked: false,
    planClosed: false,
    subtitle: undefined,
    showCookedToggle: false,
  },
)

const emit = defineEmits<{
  view: [id: string]
  'toggle-cooked': [id: string]
  'update-servings': [id: string]
  remove: [id: string]
}>()

const tags = computed(() => props.recipe.tags || [])

const imageUrl = computed(() => {
  const path = props.recipe.imagePath || props.recipe.image_path
  if (!path) return ''
  return getRecipeImageUrl(path)
})

function handleView() {
  emit('view', props.recipe.id)
}
</script>

<style scoped>
@media (max-width: 480px) {
  .plan-recipe-tags {
    display: none !important;
  }
}
</style>
