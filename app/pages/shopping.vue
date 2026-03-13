<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Header -->
    <PageHeader title="Shopping List" />

    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        :class="['tab-btn', activeTab === 'shopping' ? 'tab-btn-active' : '']"
        @click="activeTab = 'shopping'"
      >
        Shopping List
      </button>
      <button
        :class="['tab-btn', activeTab === 'favorites' ? 'tab-btn-active' : '']"
        @click="activeTab = 'favorites'"
      >
        Favorites
      </button>
    </div>

    <!-- Loading -->
    <div v-if="activeTab === 'shopping' && loading" class="flex-center" style="flex: 1">
      <LoadingDots />
    </div>
    <div v-else-if="activeTab === 'favorites' && favLoading" class="flex-center" style="flex: 1">
      <LoadingDots />
    </div>

    <!-- ===== FAVORITES TAB ===== -->
    <div v-else-if="activeTab === 'favorites'" class="page-content" style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <p style="padding: 14px 20px 0; font-size: 12.5px; color: #9b9590; line-height: 1.5">
        Keep your go-to ingredients here. Tap + to add them to your shopping list.
      </p>

      <!-- Add favorite form -->
      <form style="padding: 12px 20px; display: flex; gap: 10px" @submit.prevent="handleAddFavorite">
        <input
          v-model="newFavName"
          type="text"
          placeholder="Add a favorite..."
          class="form-input"
          style="flex: 1; padding: 10px 14px; font-size: 16px; border-radius: 10px"
        />
        <button
          type="submit"
          :disabled="!newFavName.trim()"
          :style="{
            background: newFavName.trim() ? '#2d6a4f' : '#d4ccc4',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: newFavName.trim() ? 'pointer' : 'default',
            fontFamily: '\'DM Sans\', sans-serif',
            transition: 'background .2s',
          }"
        >
          Add
        </button>
      </form>

      <!-- Empty state -->
      <EmptyState
        v-if="favorites.length === 0"
        emoji="&#x2B50;"
        title="No favorites yet"
        message="Add ingredients you buy often to quickly build your shopping list."
      />

      <div v-else>
        <!-- Add all button -->
        <div style="padding: 0 20px 8px; display: flex; justify-content: flex-end">
          <button
            class="check-all-btn"
            style="padding: 3px 10px; font-size: 11px"
            @click="handleAddAllFavorites"
          >
            Add all to list
          </button>
        </div>

        <!-- Grouped favorites -->
        <template v-for="group in favoriteGroups" :key="group.label">
          <SectionHeader
            v-if="favoriteGroups.length > 1"
            :label="group.label"
            :count="group.items.length"
            style="padding: 10px 20px 4px"
          />

          <div
            v-for="fav in group.items"
            :key="fav.id"
            class="ing-row"
          >
            <div style="display: flex; align-items: center; gap: 11px; flex: 1; min-width: 0">
              <span style="font-size: 13.5px; color: #1a1a1a">{{ fav.name }}</span>
              <span v-if="addedFavIds.has(fav.id)" style="font-size: 11px; color: #2d6a4f; font-weight: 600">
                &#x2713; added
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px">
              <button
                class="fav-action-btn fav-add-btn"
                aria-label="Add to shopping list"
                @click="handleAddFavToShopping(fav)"
              >
                +
              </button>
              <button
                class="del-btn delete-btn"
                aria-label="Remove favorite"
                @click="handleRemoveFavorite(fav.id)"
              >
                &times;
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ===== SHOPPING TAB ===== -->
    <div v-else class="page-content" style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Explanation -->
      <p style="padding: 14px 20px 0; font-size: 12.5px; color: #9b9590; line-height: 1.5">
        Ingredients from closed meal plans appear here automatically. You can also add items manually.
      </p>

      <!-- Add item form -->
      <form style="padding: 12px 20px; display: flex; gap: 10px" @submit.prevent="handleAdd">
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
      <EmptyState
        v-if="items.length === 0"
        emoji="&#x1f6d2;"
        title="Shopping list is empty"
        message="Add items above to get started."
      />

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
            <ProgressBar :value="boughtCount / filteredItems.length" />
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
          <SectionHeader
            v-if="unboughtGroups.length > 1"
            :label="group.label"
            :count="group.items.length"
            style="padding: 10px 20px 4px"
          >
            <button
              class="check-all-btn"
              @click="handleBulkCheck(group.items)"
            >
              Check all
            </button>
          </SectionHeader>

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
              aria-label="Delete item"
              @click.stop="handleDelete(item.id)"
            >
              &times;
            </button>
          </div>
        </template>

        <!-- Bought items -->
        <div v-if="boughtItems.length > 0">
          <SectionHeader label="Bought" :count="boughtItems.length" style="padding: 16px 20px 5px" />
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
              aria-label="Delete item"
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
import type { FavoriteIngredient } from '~/composables/useFavorites'
import type { RecipeData } from '~/composables/useRecipes'
import { CATEGORY_ORDER, getIngredientName, categorize } from '~/utils/shoppingCategories'

definePageMeta({ layout: false })

const { user } = useAuth()
const { items, loading, fetchItems, addItem, toggleBought, bulkMarkBought, deleteItem } = useShopping()
const { favorites, loading: favLoading, fetchFavorites, addFavorite, removeFavorite } = useFavorites()
const { recipes, fetchRecipes } = useRecipes()

const selectedRecipe = ref<RecipeData | null>(null)
const activeTab = ref<'shopping' | 'favorites'>('shopping')

// --- Favorites ---
const newFavName = ref('')
const addedFavIds = ref(new Set<string>())

const favoriteGroups = computed(() => {
  const groups: Record<string, FavoriteIngredient[]> = {}
  for (const fav of favorites.value) {
    const cat = fav.category || 'Other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(fav)
  }
  return CATEGORY_ORDER
    .filter((cat) => groups[cat]?.length)
    .map((cat) => ({ label: cat, items: groups[cat]! }))
})

async function handleAddFavorite() {
  const name = newFavName.value.trim()
  if (!name) return
  newFavName.value = ''
  await addFavorite(name)
}

async function handleRemoveFavorite(id: string) {
  addedFavIds.value.delete(id)
  await removeFavorite(id)
}

async function handleAddFavToShopping(fav: FavoriteIngredient) {
  await addItem(fav.name)
  addedFavIds.value = new Set([...addedFavIds.value, fav.id])
}

async function handleAddAllFavorites() {
  for (const fav of favorites.value) {
    await addItem(fav.name)
  }
  addedFavIds.value = new Set(favorites.value.map((f) => f.id))
}

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
  fetchFavorites()
})
</script>
