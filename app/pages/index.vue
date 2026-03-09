<template>
  <div style="display: flex; flex-direction: column; min-height: 100dvh; background: #f7f3ee">
    <!-- Header -->
    <div style="background: #2d6a4f; padding: calc(40px + env(safe-area-inset-top, 0px)) 24px 36px; text-align: center">
      <h1 style="font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 4px">
        Food Planner
      </h1>
      <p style="font-size: 13px; color: rgba(255,255,255,.65)">Plan meals, shop smarter</p>
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

      <!-- Profile link -->
      <NuxtLink
        to="/profile"
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
          animationDelay: '.18s',
          marginTop: '6px',
        }"
      >
        <div
          style="
            width: 52px;
            height: 52px;
            border-radius: 14px;
            background: #f3f0ed;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            flex-shrink: 0;
          "
        >
          &#x1F464;
        </div>
        <div>
          <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; line-height: 1.3">
            Profile
          </p>
          <p style="font-size: 13px; color: #9b9590; margin-top: 3px; line-height: 1.4">
            Account settings and sign out
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

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
    to: '/plans',
    icon: '\uD83D\uDCC5',
    title: 'Meal Plans',
    description: 'Create plans and generate grocery lists',
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
