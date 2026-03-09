<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <PageHeader title="Meal Plans">
      <template #right>
        <button
          style="
            background: #fff;
            border: none;
            border-radius: 10px;
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 600;
            color: #2d6a4f;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            box-shadow: 0 1px 4px rgba(0,0,0,.08);
          "
          @click="showForm = true"
        >
          + New Plan
        </button>
      </template>
    </PageHeader>

    <!-- New plan form -->
    <div v-if="showForm" style="padding: 16px 20px; background: #fff; margin: 0 0 2px; box-shadow: 0 2px 8px rgba(0,0,0,.06)">
      <form @submit.prevent="handleCreate" style="display: flex; flex-direction: column; gap: 10px">
        <div style="display: flex; gap: 10px">
          <div style="flex: 1">
            <label style="font-size: 11px; color: #9b9590; font-weight: 600; display: block; margin-bottom: 4px">Start date</label>
            <input
              v-model="newStartDate"
              type="date"
              class="form-input"
              style="padding: 10px 14px; font-size: 14px; border-radius: 10px; width: 100%"
            />
          </div>
          <div style="flex: 1">
            <label style="font-size: 11px; color: #9b9590; font-weight: 600; display: block; margin-bottom: 4px">End date</label>
            <input
              v-model="newEndDate"
              type="date"
              class="form-input"
              style="padding: 10px 14px; font-size: 14px; border-radius: 10px; width: 100%"
            />
          </div>
        </div>
        <div style="display: flex; gap: 10px">
          <button
            type="button"
            style="
              flex: 1;
              background: #f5f0eb;
              border: none;
              border-radius: 10px;
              padding: 10px;
              font-size: 14px;
              font-weight: 600;
              color: #9b9590;
              cursor: pointer;
              font-family: 'DM Sans', sans-serif;
            "
            @click="showForm = false"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!canCreate"
            :style="{
              flex: 1,
              background: canCreate ? '#2d6a4f' : '#d4ccc4',
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              cursor: canCreate ? 'pointer' : 'default',
              fontFamily: '\'DM Sans\', sans-serif',
            }"
          >
            Create
          </button>
        </div>
      </form>
    </div>

    <!-- Loading -->
    <div v-if="loading" style="flex: 1; display: flex; align-items: center; justify-content: center">
      <LoadingDots />
    </div>

    <div v-else style="flex: 1; overflow: auto; padding: 16px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Empty state -->
      <div v-if="plans.length === 0 && !showForm" style="text-align: center; padding: 60px 20px">
        <p style="font-size: 32px; margin-bottom: 12px">&#x1F4CB;</p>
        <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: #2a2520; margin-bottom: 6px">
          No meal plans yet
        </p>
        <p style="font-size: 13px; color: #9b9590; line-height: 1.5">
          Create a plan to start organizing your meals.
        </p>
      </div>

      <!-- Plans list -->
      <div style="display: flex; flex-direction: column; gap: 10px">
        <NuxtLink
          v-for="p in plans"
          :key="p.id"
          :to="`/plans/${p.id}`"
          style="
            background: #fff;
            border-radius: 13px;
            padding: 16px 18px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
            text-decoration: none;
            color: inherit;
            display: flex;
            align-items: center;
            gap: 14px;
          "
        >
          <div
            :style="{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: p.status === 'open' ? '#d1fae5' : '#f3f0ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
            }"
          >
            {{ p.status === 'open' ? '&#x1F4DD;' : '&#x2705;' }}
          </div>
          <div style="flex: 1; min-width: 0">
            <p style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; line-height: 1.3">
              {{ p.name }}
            </p>
            <p style="font-size: 11.5px; color: #9b9590; margin-top: 2px">
              {{ formatDateRange(p.start_date, p.end_date) }}
              &middot;
              {{ recipeCount(p) }} recipe{{ recipeCount(p) === 1 ? '' : 's' }}
            </p>
          </div>
          <span
            :style="{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px',
              flexShrink: 0,
              background: p.status === 'open' ? '#d1fae5' : '#f3f0ed',
              color: p.status === 'open' ? '#2d6a4f' : '#9b9590',
            }"
          >
            {{ p.status === 'open' ? 'Open' : 'Closed' }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MealPlan } from '~/composables/usePlans'

definePageMeta({ layout: false })

const router = useRouter()
const { plans, loading, fetchPlans, createPlan } = usePlans()

const showForm = ref(false)
const newStartDate = ref('')
const newEndDate = ref('')

const canCreate = computed(() => newStartDate.value && newEndDate.value && newStartDate.value <= newEndDate.value)

const autoName = computed(() => {
  if (!newStartDate.value || !newEndDate.value) return ''
  return formatDateRange(newStartDate.value, newEndDate.value)
})

function getNextMonday(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 1 : 8 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function initForm() {
  const monday = getNextMonday()
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  newStartDate.value = monday
  newEndDate.value = sunday.toISOString().slice(0, 10)
}

const newName = ref('')
watch(showForm, (v) => { if (v) initForm() })

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  if (start === end) return fmt(s)
  return `${fmt(s)} – ${fmt(e)}`
}

function recipeCount(p: MealPlan): number {
  return Object.values(p.basket || {}).filter((v) => v > 0).length
}

async function handleCreate() {
  if (!canCreate.value) return
  try {
    const plan = await createPlan(autoName.value, newStartDate.value, newEndDate.value)
    showForm.value = false
    router.push(`/plans/${plan.id}`)
  } catch (err) {
    console.error('Failed to create plan:', err)
  }
}

onMounted(() => {
  fetchPlans()
})
</script>
