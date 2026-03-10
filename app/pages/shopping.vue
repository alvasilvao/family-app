<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Header -->
    <PageHeader title="Shopping List" />

    <!-- Loading -->
    <div v-if="loading" style="flex: 1; display: flex; align-items: center; justify-content: center">
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
      <div v-if="items.length === 0" style="text-align: center; padding: 60px 20px">
        <p style="font-size: 32px; margin-bottom: 12px">&#x1f6d2;</p>
        <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #2a2520; margin-bottom: 6px">
          Shopping list is empty
        </p>
        <p style="font-size: 13px; color: #9b9590; line-height: 1.5">
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
              :style="{
                padding: '5px 12px',
                borderRadius: '999px',
                border: sortMode === opt.value ? '1.5px solid #2d6a4f' : '1.5px solid #e8e2db',
                background: sortMode === opt.value ? '#e8f5ee' : '#fff',
                color: sortMode === opt.value ? '#2d6a4f' : '#6b6560',
                fontSize: '12px',
                fontWeight: sortMode === opt.value ? 600 : 400,
                cursor: 'pointer',
                fontFamily: '\'DM Sans\', sans-serif',
                transition: 'all .2s',
              }"
              @click="sortMode = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>

          <!-- Plan filter -->
          <div v-if="availablePlans.length > 0" style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap">
            <button
              :style="{
                padding: '5px 12px',
                borderRadius: '999px',
                border: planFilter === 'all' ? '1.5px solid #b45309' : '1.5px solid #e8e2db',
                background: planFilter === 'all' ? '#fef3c7' : '#fff',
                color: planFilter === 'all' ? '#b45309' : '#6b6560',
                fontSize: '12px',
                fontWeight: planFilter === 'all' ? 600 : 400,
                cursor: 'pointer',
                fontFamily: '\'DM Sans\', sans-serif',
                transition: 'all .2s',
              }"
              @click="planFilter = 'all'"
            >
              All plans
            </button>
            <button
              v-for="p in availablePlans"
              :key="p.id"
              :style="{
                padding: '5px 12px',
                borderRadius: '999px',
                border: planFilter === p.id ? '1.5px solid #b45309' : '1.5px solid #e8e2db',
                background: planFilter === p.id ? '#fef3c7' : '#fff',
                color: planFilter === p.id ? '#b45309' : '#6b6560',
                fontSize: '12px',
                fontWeight: planFilter === p.id ? 600 : 400,
                cursor: 'pointer',
                fontFamily: '\'DM Sans\', sans-serif',
                transition: 'all .2s',
              }"
              @click="planFilter = p.id"
            >
              {{ p.name }}
            </button>
          </div>

          <!-- Progress -->
          <div v-if="boughtCount > 0">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px">
              <span style="font-size: 11px; color: #9b9590">{{ boughtCount }} of {{ filteredItems.length }} bought</span>
              <span v-if="boughtCount === filteredItems.length" style="font-size: 11px; color: #2d6a4f; font-weight: 600">
                &#x2713; All done!
              </span>
            </div>
            <div style="height: 4px; background: #f0ebe4; border-radius: 999px">
              <div
                :style="{
                  height: '4px',
                  background: '#2d6a4f',
                  borderRadius: '999px',
                  width: `${(boughtCount / filteredItems.length) * 100}%`,
                  transition: 'width .3s',
                }"
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
            style="background: none; border: 1.5px solid #d4ccc4; border-radius: 5px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: #9b9590; cursor: pointer; font-family: 'DM Sans', sans-serif"
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
            style="display: flex; align-items: center; gap: 7px; padding: 10px 20px 4px"
          >
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
              {{ group.label }}
            </span>
            <div style="flex: 1; height: 1px; background: #f0ebe4; margin-left: 4px" />
            <span style="font-size: 11px; color: #b0a89e">{{ group.items.length }}</span>
            <button
              style="background: none; border: 1.5px solid #d4ccc4; border-radius: 5px; padding: 2px 8px; font-size: 10px; font-weight: 600; color: #9b9590; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap"
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
              <div
                style="
                  width: 22px;
                  height: 22px;
                  border-radius: 5px;
                  flex-shrink: 0;
                  border: 1.5px solid #d4ccc4;
                  background: #fff;
                "
              />
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
                  style="display: inline-block; font-size: 10px; color: #7a9e7e; background: #e8f0e8; border-radius: 4px; padding: 1px 6px; vertical-align: middle; white-space: nowrap"
                >{{ item.plan_name }}</span>
              </div>
            </div>
            <button
              v-if="canDelete(item)"
              class="del-btn"
              style="background: none; border: none; font-size: 16px; color: #b0a89e; cursor: pointer; padding: 4px 8px"
              @click.stop="handleDelete(item.id)"
            >
              &times;
            </button>
          </div>
        </template>

        <!-- Bought items -->
        <div v-if="boughtItems.length > 0">
          <div style="display: flex; align-items: center; gap: 7px; padding: 16px 20px 5px">
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
              Bought
            </span>
            <div style="flex: 1; height: 1px; background: #f0ebe4; margin-left: 4px" />
            <span style="font-size: 11px; color: #b0a89e">{{ boughtItems.length }}</span>
          </div>
          <div v-for="item in boughtItems" :key="item.id" class="ing-row" style="cursor: pointer" @click="handleToggle(item)">
            <div style="display: flex; align-items: center; gap: 11px; flex: 1; min-width: 0">
              <div
                style="
                  width: 22px;
                  height: 22px;
                  border-radius: 5px;
                  flex-shrink: 0;
                  border: 1.5px solid #2d6a4f;
                  background: #2d6a4f;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
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
                  style="display: inline-block; font-size: 10px; color: #a8bfa9; background: #f0f4f0; border-radius: 4px; padding: 1px 6px; vertical-align: middle; white-space: nowrap"
                >{{ item.plan_name }}</span>
                <span style="font-size: 11px; color: #c8c0b8">
                  {{ formatBoughtDate(item.bought_at!) }}
                </span>
              </div>
            </div>
            <button
              v-if="canDelete(item)"
              class="del-btn"
              style="background: none; border: none; font-size: 16px; color: #b0a89e; cursor: pointer; padding: 4px 8px"
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

// --- Category mapping ---
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Produce': [
    'tomato', 'onion', 'garlic', 'pepper', 'carrot', 'potato', 'lettuce', 'spinach',
    'broccoli', 'zucchini', 'cucumber', 'celery', 'mushroom', 'avocado', 'lemon',
    'lime', 'ginger', 'basil', 'cilantro', 'parsley', 'mint', 'thyme', 'rosemary',
    'oregano', 'dill', 'chive', 'scallion', 'shallot', 'leek', 'cabbage', 'kale',
    'arugula', 'beetroot', 'beet', 'radish', 'turnip', 'squash', 'pumpkin',
    'eggplant', 'aubergine', 'corn', 'pea', 'bean sprout', 'spring onion',
    'apple', 'banana', 'orange', 'berry', 'strawberr', 'blueberr', 'raspberr',
    'mango', 'pineapple', 'grape', 'melon', 'watermelon', 'peach', 'pear',
    'plum', 'cherry', 'fig', 'date', 'pomegranate', 'kiwi', 'papaya',
    'fennel', 'artichoke', 'asparagus', 'chard', 'endive', 'watercress',
    'coriander', 'sage', 'bay lea', 'tarragon', 'chili', 'jalape',
  ],
  'Dairy & Eggs': [
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'egg',
    'mozzarella', 'parmesan', 'cheddar', 'feta', 'ricotta', 'gouda',
    'brie', 'mascarpone', 'sour cream', 'cr??me fra', 'creme frai',
    'whipping cream', 'cottage cheese', 'cream cheese', 'quark',
  ],
  'Meat & Fish': [
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'veal',
    'bacon', 'sausage', 'ham', 'salami', 'prosciutto', 'chorizo',
    'mince', 'ground meat', 'steak', 'fillet', 'filet', 'thigh', 'breast',
    'salmon', 'tuna', 'shrimp', 'prawn', 'cod', 'tilapia', 'trout',
    'sardine', 'anchov', 'mussel', 'clam', 'squid', 'octopus', 'crab',
    'lobster', 'mackerel', 'halibut', 'sea bass', 'haddock',
  ],
  'Grains & Bread': [
    'rice', 'pasta', 'bread', 'flour', 'noodle', 'oat', 'cereal',
    'tortilla', 'wrap', 'pita', 'couscous', 'quinoa', 'bulgur',
    'barley', 'polenta', 'cornmeal', 'semolina', 'spaghetti',
    'penne', 'fusilli', 'macaroni', 'lasagna', 'fettuccine',
    'ramen', 'udon', 'soba', 'gnocchi', 'cracker', 'breadcrumb',
    'panko', 'baguette', 'ciabatta', 'focaccia', 'sourdough',
    'croissant', 'brioche', 'muesli', 'granola',
  ],
  'Pantry': [
    'oil', 'vinegar', 'sauce', 'soy sauce', 'ketchup', 'mustard',
    'mayonnaise', 'honey', 'sugar', 'salt', 'pepper', 'spice',
    'cumin', 'paprika', 'turmeric', 'cinnamon', 'nutmeg', 'clove',
    'curry', 'chili flake', 'red pepper flake', 'cayenne',
    'vanilla', 'baking', 'yeast', 'cocoa', 'chocolate',
    'can', 'tinned', 'tomato paste', 'passata', 'stock', 'broth',
    'bouillon', 'coconut milk', 'coconut cream',
    'nut', 'almond', 'walnut', 'cashew', 'peanut', 'pistachio',
    'seed', 'sesame', 'sunflower', 'chia', 'flax', 'lentil',
    'chickpea', 'bean', 'kidney', 'black bean', 'white bean',
    'tahini', 'pesto', 'miso', 'fish sauce', 'oyster sauce',
    'worcestershire', 'hot sauce', 'sriracha', 'sambal',
    'jam', 'preserve', 'syrup', 'maple', 'molasses',
    'cornstarch', 'corn starch', 'gelatine', 'gelatin',
    'dried', 'canned', 'jarred',
  ],
}

function getIngredientName(item: ShoppingItem): string {
  // Plan items have format "Name - qty unit", manual items are just the name
  if (item.type === 'plan') {
    const dashIdx = item.name.lastIndexOf(' - ')
    return dashIdx > 0 ? item.name.substring(0, dashIdx) : item.name
  }
  return item.name
}

function categorize(item: ShoppingItem): string {
  const name = getIngredientName(item).toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => name.includes(kw))) return category
  }
  return 'Other'
}

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
    const order = ['Produce', 'Dairy & Eggs', 'Meat & Fish', 'Grains & Bread', 'Pantry', 'Other']
    return order
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
