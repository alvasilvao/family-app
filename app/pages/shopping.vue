<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Header -->
    <PageHeader title="Shopping List" />

    <!-- Loading -->
    <div v-if="loading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <div v-else style="flex: 1; overflow: auto; padding: 0 0 calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Add item form -->
      <form style="padding: 16px 20px; display: flex; gap: 10px" @submit.prevent="handleAdd">
        <input
          v-model="newItemName"
          type="text"
          placeholder="Add an item..."
          class="form-input"
          style="flex: 1; padding: 10px 14px; font-size: 14px; border-radius: 10px"
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
        <!-- Progress -->
        <div v-if="boughtCount > 0" style="padding: 0 20px 12px">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px">
            <span style="font-size: 11px; color: #9b9590">{{ boughtCount }} of {{ items.length }} bought</span>
            <span v-if="boughtCount === items.length" style="font-size: 11px; color: #2d6a4f; font-weight: 600">
              &#x2713; All done!
            </span>
          </div>
          <div style="height: 4px; background: #f0ebe4; border-radius: 999px">
            <div
              :style="{
                height: '4px',
                background: '#2d6a4f',
                borderRadius: '999px',
                width: `${(boughtCount / items.length) * 100}%`,
                transition: 'width .3s',
              }"
            />
          </div>
        </div>

        <!-- Unbought items -->
        <div v-for="item in unboughtItems" :key="item.id" class="ing-row" style="cursor: pointer" @click="handleToggle(item.id)">
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
            <span style="font-size: 13.5px; color: #1a1a1a">{{ item.name }}</span>
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

        <!-- Bought items -->
        <div v-if="boughtItems.length > 0">
          <div style="display: flex; align-items: center; gap: 7px; padding: 16px 20px 5px">
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9b9590">
              Bought
            </span>
            <div style="flex: 1; height: 1px; background: #f0ebe4; margin-left: 4px" />
            <span style="font-size: 11px; color: #b0a89e">{{ boughtItems.length }}</span>
          </div>
          <div v-for="item in boughtItems" :key="item.id" class="ing-row" style="cursor: pointer" @click="handleToggle(item.id)">
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
              <div style="min-width: 0">
                <span style="font-size: 13.5px; color: #b0a89e; text-decoration: line-through">{{ item.name }}</span>
                <span style="font-size: 11px; color: #c8c0b8; margin-left: 8px">
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
  </div>
</template>

<script setup lang="ts">
import type { ShoppingItem } from '~/composables/useShopping'

definePageMeta({ layout: false })

const { user } = useAuth()
const { items, loading, fetchItems, addItem, toggleBought, deleteItem } = useShopping()

const newItemName = ref('')

const unboughtItems = computed(() => items.value.filter((i) => !i.bought_at))
const boughtItems = computed(() => items.value.filter((i) => i.bought_at))
const boughtCount = computed(() => boughtItems.value.length)

function canDelete(item: ShoppingItem) {
  return item.added_by === user.value?.id
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

async function handleToggle(id: string) {
  await toggleBought(id)
}

async function handleDelete(id: string) {
  await deleteItem(id)
}

onMounted(() => {
  fetchItems()
})
</script>
