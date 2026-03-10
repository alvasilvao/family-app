<template>
  <div style="display: flex; flex-direction: column; height: 100dvh; background: #f7f3ee">
    <!-- Header -->
    <PageHeader title="Profile" />

    <!-- Content -->
    <div class="page-content-narrow" style="flex: 1; overflow: auto; padding: 24px 20px calc(48px + env(safe-area-inset-bottom, 0px))">
      <!-- User info -->
      <div
        style="
          background: #fff;
          border-radius: 16px;
          padding: 24px 20px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        "
      >
        <div
          style="
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #d1fae5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
          "
        >
          &#x1F464;
        </div>
        <div style="min-width: 0">
          <p style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; line-height: 1.3">
            {{ user?.email }}
          </p>
        </div>
      </div>

      <!-- Sign out -->
      <button
        style="
          width: 100%;
          padding: 16px;
          background: #fff;
          border: 1.5px solid #e8e2db;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #c0392b;
          cursor: pointer;
          transition: background 0.2s;
        "
        @click="signOut()"
      >
        Sign out
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { user, signOut } = useAuth()
</script>
