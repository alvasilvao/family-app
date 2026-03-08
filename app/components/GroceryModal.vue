<template>
  <div
    style="
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 200;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    "
    @click="$emit('close')"
  >
    <div
      class="slide-up"
      style="
        background: #fff;
        border-radius: 22px 22px 0 0;
        width: 100%;
        max-width: 640px;
        max-height: 88vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      "
      @click.stop
    >
      <!-- Handle -->
      <div style="padding: 12px 0 0; display: flex; justify-content: center; flex-shrink: 0">
        <div style="width: 40px; height: 4px; border-radius: 999px; background: #e0d8d0" />
      </div>

      <!-- Header -->
      <div style="padding: 14px 24px 14px; border-bottom: 1px solid #f0ebe4; flex-shrink: 0">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px">
          <div>
            <p style="font-size: 10px; letter-spacing: 2px; color: #9b9590; text-transform: uppercase; margin-bottom: 3px">
              Week of {{ weekLabel }}
            </p>
            <h2 style="font-family: 'Fraunces', serif; font-size: 22px; font-weight: 700">
              &#x1f6d2; Grocery List
            </h2>
          </div>
          <div style="display: flex; align-items: center; gap: 10px">
            <button
              v-if="checkedCount > 0"
              style="
                font-size: 11px;
                color: #9b9590;
                background: none;
                border: none;
                cursor: pointer;
                font-family: 'DM Sans', sans-serif;
              "
              @click="clearChecked"
            >
              Clear ticks
            </button>
            <button
              style="
                background: #f5f0eb;
                border: none;
                border-radius: 50%;
                width: 33px;
                height: 33px;
                cursor: pointer;
                font-size: 16px;
                color: #6b6560;
                display: flex;
                align-items: center;
                justify-content: center;
              "
              @click="$emit('close')"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Progress -->
        <div style="margin-bottom: 10px">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px">
            <span style="font-size: 11px; color: #9b9590">{{ checkedCount }} of {{ total }} items ticked off</span>
            <span v-if="checkedCount === total && total > 0" style="font-size: 11px; color: #2d6a4f; font-weight: 600">
              &#x2713; All done!
            </span>
          </div>
          <div style="height: 4px; background: #f0ebe4; border-radius: 999px">
            <div
              :style="{
                height: '4px',
                background: '#2d6a4f',
                borderRadius: '999px',
                width: `${total > 0 ? (checkedCount / total) * 100 : 0}%`,
                transition: 'width .3s',
              }"
            />
          </div>
        </div>

        <!-- Recipe pills -->
        <div style="display: flex; flex-wrap: wrap; gap: 5px">
          <span
            v-for="sr in selectedRecipes"
            :key="sr.recipe.id"
            style="background: #f5f0eb; border-radius: 999px; padding: 3px 10px; font-size: 11px; color: #4a4540"
          >
            {{ sr.recipe.emoji }}
            <span style="color: #2d6a4f; font-weight: 700">{{ sr.servings }}&times;</span>
            {{ sr.recipe.name }}
          </span>
        </div>
      </div>

      <!-- List -->
      <div style="overflow: auto; flex: 1; padding-bottom: 28px">
        <div v-for="section in sections" :key="section.label">
          <div style="display: flex; align-items: center; gap: 7px; padding: 13px 20px 5px">
            <span style="font-size: 15px">{{ section.icon }}</span>
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
              {{ section.label }}
            </span>
            <div style="flex: 1; height: 1px; background: #f0ebe4; margin-left: 4px" />
            <span style="font-size: 11px; color: #b0a89e">{{ section.items.length }}</span>
          </div>
          <div
            v-for="(item, idx) in section.items"
            :key="`${section.label}:${idx}`"
            class="ing-row"
            style="cursor: pointer"
            @click="toggle(`${section.label}:${idx}`)"
          >
            <div style="display: flex; align-items: center; gap: 11px">
              <div
                :style="{
                  width: '19px',
                  height: '19px',
                  borderRadius: '5px',
                  flexShrink: 0,
                  transition: 'all .15s',
                  border: `1.5px solid ${checked[`${section.label}:${idx}`] ? '#2d6a4f' : '#d4ccc4'}`,
                  background: checked[`${section.label}:${idx}`] ? '#2d6a4f' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }"
              >
                <span v-if="checked[`${section.label}:${idx}`]" style="color: #fff; font-size: 11px">&#x2713;</span>
              </div>
              <span
                :style="{
                  fontSize: '13.5px',
                  color: checked[`${section.label}:${idx}`] ? '#b0a89e' : '#1a1a1a',
                  textDecoration: checked[`${section.label}:${idx}`] ? 'line-through' : 'none',
                  transition: 'all .15s',
                }"
              >
                {{ item.name }}
              </span>
            </div>
            <span
              :style="{
                fontSize: '13px',
                fontWeight: 700,
                color: checked[`${section.label}:${idx}`] ? '#b0a89e' : '#2d6a4f',
                background: checked[`${section.label}:${idx}`] ? '#f5f5f5' : '#e8f5ee',
                padding: '2px 11px',
                borderRadius: '999px',
                flexShrink: 0,
                transition: 'all .15s',
              }"
            >
              {{ item.qty }} {{ item.unit }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { weekKeyLabel } from '~/utils/week'
import type { GrocerySection } from '~/utils/ingredients'

const props = defineProps<{
  weekKey: string
  sections: GrocerySection[]
  basket: Record<string, number>
  recipes: Array<{ id: string; name: string; emoji: string }>
}>()

defineEmits<{ close: [] }>()

const weekLabel = computed(() => weekKeyLabel(props.weekKey))

const total = computed(() => props.sections.reduce((sum, s) => sum + s.items.length, 0))

const selectedRecipes = computed(() =>
  Object.entries(props.basket)
    .filter(([, s]) => s > 0)
    .map(([id, servings]) => ({
      recipe: props.recipes.find((r) => r.id === id)!,
      servings,
    }))
    .filter((x) => x.recipe),
)

const checked = ref<Record<string, boolean>>({})
const checkedCount = computed(() => Object.values(checked.value).filter(Boolean).length)

function toggle(key: string) {
  checked.value = { ...checked.value, [key]: !checked.value[key] }
}

function clearChecked() {
  checked.value = {}
}
</script>
