<template>
  <div style="display: flex; flex-direction: column; min-height: 100dvh; background: #f7f3ee">
    <!-- Header -->
    <div class="safe-top" style="background: #2d6a4f; padding: 40px 24px 36px; text-align: center; position: relative">
      <h1 style="font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 4px">
        Food Planner
      </h1>
      <p style="font-size: 13px; color: rgba(255,255,255,.65)">Plan meals, shop smarter</p>
      <button
        style="
          position: absolute;
          top: 18px;
          right: 20px;
          background: rgba(255,255,255,.15);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        @click="signOut()"
      >
        &#x2192;
      </button>
    </div>

    <!-- Nav cards -->
    <div style="flex: 1; padding: 24px 20px; display: flex; flex-direction: column; gap: 14px; max-width: 480px; margin: 0 auto; width: 100%">
      <NuxtLink
        v-for="section in sections"
        :key="section.to"
        :to="section.to"
        class="card fade-in"
        :style="{
          background: '#fff',
          borderRadius: '16px',
          padding: '22px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,.06)',
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          animationDelay: section.delay,
        }"
      >
        <div
          :style="{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: section.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            flexShrink: 0,
          }"
        >
          {{ section.icon }}
        </div>
        <div>
          <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; line-height: 1.3">
            {{ section.title }}
          </p>
          <p style="font-size: 13px; color: #9b9590; margin-top: 3px; line-height: 1.4">
            {{ section.description }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { signOut } = useAuth()

const sections = [
  {
    to: '/recipes',
    icon: '\uD83C\uDF73',
    title: 'Recipes',
    description: 'Browse and manage your recipe collection',
    bg: '#fef3c7',
    delay: '0s',
  },
  {
    to: '/plan',
    icon: '\uD83D\uDCC5',
    title: 'Weekly Plan',
    description: 'Plan meals and generate grocery lists',
    bg: '#d1fae5',
    delay: '.06s',
  },
  {
    to: '/shopping',
    icon: '\uD83D\uDED2',
    title: 'Shopping List',
    description: 'Shared list for grocery shopping',
    bg: '#e0e7ff',
    delay: '.12s',
  },
]
</script>
