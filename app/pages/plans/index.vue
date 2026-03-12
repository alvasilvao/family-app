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
    <div v-if="showForm" style="padding: 16px 20px; background: #fff; margin: 0 auto 2px; max-width: 480px; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,.06)">
      <p style="font-size: 12.5px; color: #9b9590; line-height: 1.5; margin-bottom: 12px">
        Pick the dates for your plan. After creating it, you'll add recipes and set servings. When you're done, close the plan to send ingredients to the shopping list.
      </p>
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

    <div v-else class="page-content" style="flex: 1; overflow: auto; padding: 16px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- Empty state -->
      <EmptyState
        v-if="plans.length === 0 && !showForm"
        emoji="&#x1F4CB;"
        title="No meal plans yet"
        message="Create a plan to start organizing your meals."
      />

      <!-- Active plans (have uncooked recipes) -->
      <template v-if="activePlans.length">
        <p style="font-size: 12px; font-weight: 700; color: #9b9590; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px">
          Active
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px">
          <NuxtLink
            v-for="p in activePlans"
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
            <div style="flex: 1; min-width: 0">
              <p style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; line-height: 1.3">
                {{ p.name }}
              </p>
              <p style="font-size: 11.5px; color: #9b9590; margin-top: 3px">
                {{ formatDateRange(p.start_date, p.end_date) }}
                &middot;
                {{ recipeCount(p) }} recipe{{ recipeCount(p) === 1 ? '' : 's' }}
                &middot;
                {{ cookedCount(p) }}/{{ recipeCount(p) }} cooked
              </p>
              <!-- Progress bar -->
              <div style="margin-top: 8px; height: 4px; background: #f3f0ed; border-radius: 2px; overflow: hidden">
                <div
                  :style="{
                    height: '100%',
                    width: recipeCount(p) > 0 ? (cookedCount(p) / recipeCount(p) * 100) + '%' : '0%',
                    background: '#2d6a4f',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }"
                />
              </div>
            </div>
            <span
              :style="{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                flexShrink: 0,
                background: p.status === 'open' ? '#d1fae5' : p.status === 'cooked' ? '#fef3c7' : '#f3f0ed',
                color: p.status === 'open' ? '#2d6a4f' : p.status === 'cooked' ? '#92400e' : '#9b9590',
              }"
            >
              {{ p.status === 'open' ? 'Open' : p.status === 'cooked' ? 'Cooked' : 'Closed' }}
            </span>
          </NuxtLink>
        </div>
      </template>

      <!-- Past plans (all recipes cooked) -->
      <template v-if="pastPlans.length">
        <p style="font-size: 12px; font-weight: 700; color: #9b9590; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px">
          Past
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px">
          <NuxtLink
            v-for="p in pastPlans"
            :key="p.id"
            :to="`/plans/${p.id}`"
            style="
              background: #fff;
              border-radius: 13px;
              padding: 14px 18px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
              text-decoration: none;
              color: inherit;
              display: flex;
              align-items: center;
              gap: 14px;
              opacity: 0.7;
            "
          >
            <div style="flex: 1; min-width: 0">
              <p style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; line-height: 1.3">
                {{ p.name }}
              </p>
              <p style="font-size: 11.5px; color: #9b9590; margin-top: 3px">
                {{ formatDateRange(p.start_date, p.end_date) }}
                &middot;
                {{ recipeCount(p) }} recipe{{ recipeCount(p) === 1 ? '' : 's' }}
                &middot;
                All cooked
              </p>
            </div>
            <span
              :style="{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                flexShrink: 0,
                background: p.status === 'cooked' ? '#fef3c7' : '#f3f0ed',
                color: p.status === 'cooked' ? '#92400e' : '#9b9590',
              }"
            >
              {{ p.status === 'cooked' ? 'Cooked' : 'Closed' }}
            </span>
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MealPlan } from '~/composables/usePlans'

definePageMeta({ layout: false })

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

watch(showForm, (v) => { if (v) initForm() })

function recipeCount(p: MealPlan): number {
  return Object.values(p.basket || {}).filter((v) => v > 0).length
}

function cookedCount(p: MealPlan): number {
  const activeRecipeIds = Object.entries(p.basket || {}).filter(([, v]) => v > 0).map(([k]) => k)
  return activeRecipeIds.filter((id) => p.cooked?.[id]).length
}

function isAllCooked(p: MealPlan): boolean {
  const total = recipeCount(p)
  return total > 0 && cookedCount(p) === total
}

const activePlans = computed(() => plans.value.filter((p) => !isAllCooked(p)))
const pastPlans = computed(() => plans.value.filter((p) => isAllCooked(p)))

async function handleCreate() {
  if (!canCreate.value) return
  try {
    const plan = await createPlan(autoName.value, newStartDate.value, newEndDate.value)
    showForm.value = false
    navigateTo(`/plans/${plan.id}`)
  } catch (err) {
    console.error('Failed to create plan:', err)
  }
}

onMounted(() => {
  fetchPlans()
})
</script>
