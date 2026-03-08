<template>
  <div
    :class="['card', { selected: servings > 0 }]"
    :style="{
      background: '#fff',
      borderRadius: '13px',
      overflow: 'hidden',
      boxShadow: servings > 0 ? '0 6px 28px rgba(45,106,79,.16)' : '0 3px 16px rgba(0,0,0,.07)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }"
  >
    <div style="cursor: pointer" @click="$emit('view', recipe.id)">
      <FoodVisual :recipe="recipe" />
    </div>

    <button
      v-if="deletable"
      class="del-btn"
      :style="{
        position: 'absolute',
        top: '6px',
        right: '6px',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(0,0,0,.45)',
        border: 'none',
        color: '#fff',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }"
      @click="confirmingDelete = true"
    >
      &times;
    </button>

    <div style="padding: 12px 14px 16px; flex: 1; display: flex; flex-direction: column; gap: 7px">
      <div style="display: flex; flex-wrap: wrap; gap: 4px">
        <TagBadge v-for="t in recipe.tags" :key="t" :label="t" />
      </div>
      <h3
        style="font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; line-height: 1.3; cursor: pointer"
        @click="$emit('view', recipe.id)"
      >
        {{ recipe.name }}
      </h3>
      <p
        style="font-size: 11.5px; color: #6b6560; line-height: 1.6; flex: 1; cursor: pointer"
        @click="$emit('view', recipe.id)"
      >
        {{ recipe.description }}
      </p>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px">
        <span
          :style="{
            fontSize: '11px',
            color: servings > 0 ? '#2d6a4f' : '#9b9590',
            fontWeight: servings > 0 ? 600 : 400,
          }"
        >
          {{ servings > 0 ? `${servings} serving${servings > 1 ? 's' : ''}` : 'Add to basket' }}
        </span>
        <div style="display: flex; align-items: center; gap: 6px">
          <button
            v-if="servings > 0"
            class="counter-btn"
            :style="{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: '1.5px solid #2d6a4f',
              background: '#fff',
              color: '#2d6a4f',
              fontSize: '17px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .18s',
            }"
            @click="$emit('remove', recipe.id)"
          >
            &minus;
          </button>
          <span
            v-if="servings > 0"
            style="font-size: 14px; font-weight: 700; color: #2d6a4f; min-width: 16px; text-align: center"
          >
            {{ servings }}
          </span>
          <button
            class="counter-btn"
            :style="{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: '1.5px solid #2d6a4f',
              background: servings > 0 ? '#fff' : '#2d6a4f',
              color: servings > 0 ? '#2d6a4f' : '#fff',
              fontSize: '17px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .18s',
            }"
            @click="$emit('add', recipe.id)"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation overlay -->
    <div
      v-if="confirmingDelete"
      style="
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        border-radius: 13px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        z-index: 20;
        padding: 20px;
      "
      @click.stop
    >
      <p style="font-size: 13px; color: #fff; text-align: center; line-height: 1.5">
        Delete <strong>{{ recipe.name }}</strong>?
      </p>
      <div style="display: flex; gap: 8px">
        <button
          style="
            padding: 7px 16px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.15);
            border: 1.5px solid rgba(255, 255, 255, 0.3);
            color: #fff;
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
            padding: 7px 16px;
            border-radius: 8px;
            background: #c0392b;
            border: none;
            color: #fff;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
          "
          @click="$emit('delete', recipe.id); confirmingDelete = false"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const confirmingDelete = ref(false)

defineProps<{
  recipe: {
    id: string
    name: string
    description: string
    cookTime: string
    emoji: string
    color: string
    tags: string[]
  }
  servings: number
  deletable?: boolean
}>()

defineEmits<{
  add: [id: string]
  remove: [id: string]
  delete: [id: string]
  view: [id: string]
}>()
</script>
