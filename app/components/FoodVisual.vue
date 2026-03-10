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
    <!-- Recipe photo -->
    <img
      v-if="recipe.imagePath"
      :src="imageUrl"
      :style="{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }"
    />
    <!-- Emoji fallback -->
    <template v-else>
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
  }>(),
  { size: 100 },
)

const config = useRuntimeConfig()

const imageUrl = computed(() => {
  if (!props.recipe.imagePath) return ''
  const base = config.public.supabase.url
  return `${base}/storage/v1/object/public/recipe-images/${props.recipe.imagePath}?t=${Date.now()}`
})
</script>
