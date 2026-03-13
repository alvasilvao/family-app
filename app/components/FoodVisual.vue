<template>
  <div
    :style="{
      width: '100%',
      height: `${size}px`,
      borderRadius: '12px 12px 0 0',
      background: recipe.imagePath ? '#f0ebe5' : `linear-gradient(135deg, ${recipe.color}28, ${recipe.color}66)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Loading overlay -->
    <div
      v-if="loading"
      :style="{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(240,235,229,0.85)',
        zIndex: 10,
      }"
    >
      <div :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }">
        <div class="food-visual-spinner" />
        <span :style="{ fontSize: '12px', color: '#6b6560', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }">Processing photo...</span>
      </div>
    </div>
    <!-- Recipe photo -->
    <img
      v-if="recipe.imagePath"
      :src="imageUrl"
      alt="Recipe photo"
      :style="{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }"
      @error="imgFailed = true"
    />
    <!-- Emoji fallback -->
    <template v-if="!recipe.imagePath || imgFailed">
      <div
        :style="{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: recipe.color + '18',
          top: '-16px',
          right: '-16px',
        }"
      />
      <div
        :style="{
          position: 'absolute',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: recipe.color + '28',
          bottom: '-10px',
          left: '6px',
        }"
      />
      <div
        :style="{
          fontSize: `${size * 0.36}px`,
          filter: 'drop-shadow(0 3px 10px rgba(0,0,0,.13))',
          position: 'relative',
          zIndex: 1,
        }"
      >
        {{ recipe.emoji }}
      </div>
    </template>
    <div
      :style="{
        position: 'absolute',
        bottom: '8px',
        right: '10px',
        fontSize: '10px',
        fontWeight: 600,
        color: recipe.color,
        background: '#fff',
        padding: '2px 8px',
        borderRadius: '999px',
        boxShadow: '0 1px 6px rgba(0,0,0,.1)',
      }"
    >
      {{ recipe.cookTime }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    recipe: { emoji: string; color: string; cookTime: string; imagePath?: string | null }
    size?: number
    loading?: boolean
  }>(),
  { size: 100, loading: false },
)

const imgFailed = ref(false)

// Reset error state when imagePath changes
watch(() => props.recipe.imagePath, () => {
  imgFailed.value = false
})

const imageUrl = computed(() => {
  if (!props.recipe.imagePath) return ''
  return getRecipeImageUrl(props.recipe.imagePath, true)
})
</script>

<style scoped>
@keyframes food-visual-spin {
  to { transform: rotate(360deg); }
}
.food-visual-spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid #e8e2db;
  border-top-color: #2d6a4f;
  border-radius: 50%;
  animation: food-visual-spin 0.7s linear infinite;
}
</style>
