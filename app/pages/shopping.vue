<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Header -->
    <PageHeader title="Shopping List" />

    <!-- Loading -->
    <div v-if="loading" class="flex-center" style="flex: 1">
      <LoadingDots />
    </div>

    <div v-else class="page-content" style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Add item form -->
      <form style="padding: 16px 20px; display: flex; gap: 10px" @submit.prevent="handleAdd">
        <input
          v-model="newItemName"
          type="text"
          placeholder="Add an item..."
          class="form-input"
          style="flex: 1; padding: 10px 14px; font-size: 16px; border-radius: 10px"
        />
        <button
          type="submit"
          :disabled="!newItemName.trim()"
          :style="{
            background: newItemName.trim() ? '#2d6a4f' : '#d4ccc4',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: newItemName.trim() ? 'pointer' : 'default',
            fontFamily: '\'DM Sans\', sans-serif',
            transition: 'background .2s',
          }"
        >
          Add
        </button>
      </form>

      <!-- Empty state -->
      <div v-if="items.length === 0" class="empty-state">
        <p class="empty-emoji">&#x1f6d2;</p>
        <p class="empty-title">
          Shopping list is empty
        </p>
        <p class="empty-subtitle">
          Add items above to get started.
        </p>
      </div>

      <!-- Items list -->
      <div v-else>
        <!-- Sort selector + progress -->
        <div style="padding: 0 20px 12px">
          <!-- Sort pills -->
          <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              :class="['pill', sortMode === opt.value ? 'pill-active' : '']"
              @click="sortMode = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>

          <!-- Plan filter -->
          <div v-if="availablePlans.length > 0" style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap">
            <button
              :class="['pill', 'pill-amber', planFilter === 'all' ? 'pill-amber-active' : '']"
              @click="planFilter = 'all'"
            >
              All plans
            </button>
            <button
              v-for="p in availablePlans"
              :key="p.id"
              :class="['pill', 'pill-amber', planFilter === p.id ? 'pill-amber-active' : '']"
              @click="planFilter = p.id"
            >
              {{ p.name }}
            </button>
          </div>

          <!-- Progress -->
          <div v-if="boughtCount > 0">
            <div class="flex-between" style="margin-bottom: 4px">
              <span class="text-xs text-muted">{{ boughtCount }} of {{ filteredItems.length }} bought</span>
              <span v-if="boughtCount === filteredItems.length" class="text-xs" style="color: #2d6a4f; font-weight: 600">
                &#x2713; All done!
              </span>
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: `${(boughtCount / filteredItems.length) * 100}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Check all (single group mode) -->
        <div
          v-if="unboughtGroups.length === 1 && unboughtItems.length > 1"
          style="padding: 0 20px 8px; display: flex; justify-content: flex-end"
        >
          <button
            class="check-all-btn"
            style="padding: 3px 10px; font-size: 11px"
            @click="handleBulkCheck(unboughtItems)"
          >
            Check all
          </button>
        </div>

        <!-- Grouped unbought items -->
        <template v-for="group in unboughtGroups" :key="group.label">
          <!-- Group header (only when there are multiple groups) -->
          <div
            v-if="unboughtGroups.length > 1"
            class="section-divider"
            style="padding: 10px 20px 4px"
          >
            <span class="section-label">
              {{ group.label }}
            </span>
            <div class="section-line" />
            <span class="section-count">{{ group.items.length }}</span>
            <button
              class="check-all-btn"
              @click="handleBulkCheck(group.items)"
            >
              Check all
            </button>
          </div>

          <div
            v-for="item in group.items"
            :key="item.id"
            class="ing-row"
            style="cursor: pointer"
            @click="handleToggle(item)"
          >
            <div style="display: flex; align-items: center; gap: 11px; flex: 1; min-width: 0">
              <div class="checkbox" />
              <div style="min-width: 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap">
                <span style="font-size: 13.5px; color: #1a1a1a">{{ item.name }}</span>
                <span
                  v-for="r in item.recipes"
                  :key="r.id"
                  style="cursor: pointer; font-size: 14px; flex-shrink: 0"
                  :title="r.name"
                  @click.stop="openRecipe(r.id)"
                >{{ r.emoji }}</span>
                <span
                  v-if="item.plan_name"
                  class="plan-badge"
                >{{ item.plan_name }}</span>
              </div>
            </div>
            <button
              v-if="canDelete(item)"
              class="del-btn delete-btn"
              @click.stop="handleDelete(item.id)"
            >
              &times;
            </button>
          </div>
        </template>

        <!-- Bought items -->
        <div v-if="boughtItems.length > 0">
          <div class="section-divider" style="padding: 16px 20px 5px">
            <span class="section-label">
              Bought
            </span>
            <div class="section-line" />
            <span class="section-count">{{ boughtItems.length }}</span>
          </div>
          <div v-for="item in boughtItems" :key="item.id" class="ing-row" style="cursor: pointer" @click="handleToggle(item)">
            <div style="display: flex; align-items: center; gap: 11px; flex: 1; min-width: 0">
              <div class="checkbox-checked">
                <span style="color: #fff; font-size: 11px">&#x2713;</span>
              </div>
              <div style="min-width: 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap">
                <span style="font-size: 13.5px; color: #b0a89e; text-decoration: line-through">{{ item.name }}</span>
                <span
                  v-for="r in item.recipes"
                  :key="r.id"
                  style="cursor: pointer; font-size: 14px; flex-shrink: 0; opacity: 0.5"
                  :title="r.name"
                  @click.stop="openRecipe(r.id)"
                >{{ r.emoji }}</span>
                <span
                  v-if="item.plan_name"
                  class="plan-badge-faded"
                >{{ item.plan_name }}</span>
                <span style="font-size: 11px; color: #c8c0b8">
                  {{ formatBoughtDate(item.bought_at!) }}
                </span>
              </div>
            </div>
            <button
              v-if="canDelete(item)"
              class="del-btn delete-btn"
              @click.stop="handleDelete(item.id)"
            >
              &times;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recipe detail modal -->
    <RecipeDetailModal
      v-if="selectedRecipe"
      :recipe="selectedRecipe"
      @close="selectedRecipe = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { ShoppingItem } from '~/composables/useShopping'
import type { RecipeData } from '~/composables/useRecipes'
import { CATEGORY_ORDER, getIngredientName, categorize } from '~/utils/shoppingCategories'

definePageMeta({ layout: false })

const { user } = useAuth()
const { items, loading, fetchItems, addItem, toggleBought, bulkMarkBought, deleteItem } = useShopping()
const { recipes, fetchRecipes } = useRecipes()

const selectedRecipe = ref<RecipeData | null>(null)

type SortMode = 'default' | 'alphabetical' | 'category' | 'recipe'
const sortMode = ref<SortMode>('default')

const sortOptions: Array<{ label: string; value: SortMode }> = [
  { label: 'Default', value: 'default' },
  { label: 'A-Z', value: 'alphabetical' },
  { label: 'Category', value: 'category' },
  { label: 'By recipe', value: 'recipe' },
]

// --- Plan filter ---
const planFilter = ref<string>('all')

const availablePlans = computed(() => {
  const plans = new Map<string, string>()
  for (const item of items.value) {
    if (item.plan_id && item.plan_name) {
      plans.set(item.plan_id, item.plan_name)
    }
  }
  return Array.from(plans, ([id, name]) => ({ id, name }))
})

const filteredItems = computed(() => {
  if (planFilter.value === 'all') return items.value
  if (planFilter.value === 'manual') return items.value.filter((i) => i.type === 'manual')
  return items.value.filter((i) => i.plan_id === planFilter.value || i.type === 'manual')
})

// Category mapping imported from ~/utils/shoppingCategories

interface ItemGroup {
  label: string
  items: ShoppingItem[]
}

const unboughtItems = computed(() => filteredItems.value.filter((i) => !i.bought_at))
const boughtItems = computed(() => filteredItems.value.filter((i) => i.bought_at))
const boughtCount = computed(() => boughtItems.value.length)

const unboughtGroups = computed<ItemGroup[]>(() => {
  const list = unboughtItems.value

  if (sortMode.value === 'alphabetical') {
    const sorted = [...list].sort((a, b) =>
      getIngredientName(a).localeCompare(getIngredientName(b)),
    )
    return [{ label: 'All', items: sorted }]
  }

  if (sortMode.value === 'category') {
    const groups: Record<string, ShoppingItem[]> = {}
    for (const item of list) {
      const cat = categorize(item)
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    }
    // Fixed order for categories
    return CATEGORY_ORDER
      .filter((cat) => groups[cat]?.length)
      .map((cat) => ({ label: cat, items: groups[cat]! }))
  }

  if (sortMode.value === 'recipe') {
    const recipeGroups: Record<string, { label: string; items: ShoppingItem[] }> = {}
    const manualItems: ShoppingItem[] = []

    for (const item of list) {
      if (item.recipes?.length) {
        // Add item under each contributing recipe
        for (const r of item.recipes) {
          if (!recipeGroups[r.id]) {
            recipeGroups[r.id] = { label: `${r.emoji} ${r.name}`, items: [] }
          }
          recipeGroups[r.id]!.items.push(item)
        }
      } else {
        manualItems.push(item)
      }
    }

    const result: ItemGroup[] = Object.values(recipeGroups)
      .sort((a, b) => a.label.localeCompare(b.label))
    if (manualItems.length > 0) {
      result.push({ label: 'Other items', items: manualItems })
    }
    return result
  }

  // Default
  return [{ label: 'All', items: list }]
})

function openRecipe(recipeId: string) {
  const recipe = recipes.value.find((r) => r.id === recipeId)
  if (recipe) selectedRecipe.value = recipe
}

const newItemName = ref('')

function canDelete(item: ShoppingItem) {
  return item.type === 'manual' && item.added_by === user.value?.id
}

function formatBoughtDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

async function handleAdd() {
  const name = newItemName.value.trim()
  if (!name) return
  newItemName.value = ''
  await addItem(name)
}

async function handleToggle(item: ShoppingItem) {
  await toggleBought(item)
}

async function handleBulkCheck(groupItems: ShoppingItem[]) {
  const unbought = groupItems.filter((i) => !i.bought_at)
  if (unbought.length === 0) return
  await bulkMarkBought(unbought)
}

async function handleDelete(id: string) {
  await deleteItem(id)
}

onMounted(() => {
  fetchItems()
  fetchRecipes()
})
</script>
