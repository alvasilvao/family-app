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

      <!-- Notifications -->
      <div
        v-if="notificationsSupported"
        style="
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          margin-bottom: 24px;
        "
      >
        <div style="display: flex; align-items: center; justify-content: space-between">
          <div>
            <p style="font-family: 'Fraunces', serif; font-size: 16px; font-weight: 600; line-height: 1.3">
              Notifications
            </p>
            <p style="font-size: 13px; color: #9b9590; margin-top: 2px">
              Weekly meal plan reminder
            </p>
          </div>
          <button
            :disabled="notificationsLoading"
            :style="{
              width: '52px',
              height: '30px',
              borderRadius: '15px',
              border: 'none',
              background: notificationsSubscribed ? '#2d6a4f' : '#d1ccc5',
              position: 'relative',
              cursor: notificationsLoading ? 'wait' : 'pointer',
              transition: 'background .2s',
              flexShrink: 0,
            }"
            @click="toggleNotifications"
          >
            <div
              :style="{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '3px',
                left: notificationsSubscribed ? '25px' : '3px',
                transition: 'left .2s',
                boxShadow: '0 1px 3px rgba(0,0,0,.2)',
              }"
            />
          </button>
        </div>
        <button
          v-if="notificationsSubscribed"
          :disabled="testLoading"
          style="
            margin-top: 14px;
            width: 100%;
            padding: 10px 16px;
            background: #f0ebe5;
            border: 1.5px solid #e8e2db;
            border-radius: 10px;
            font-family: 'DM Sans', sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: #5c524a;
            cursor: pointer;
            transition: background 0.2s;
          "
          @click="sendTest"
        >
          {{ testLoading ? 'Sending...' : testSent ? 'Sent! Check your notifications' : 'Send test notification' }}
        </button>
        <p v-if="notificationsDenied" style="font-size: 12px; color: #c0392b; margin-top: 8px">
          Notifications are blocked. Enable them in your browser settings.
        </p>
        <p v-if="notificationsError" style="font-size: 12px; color: #c0392b; margin-top: 8px">
          {{ notificationsError }}
        </p>
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
const { user, signOut } = useAuth()

const { isSupported: notificationsSupported, isSubscribed: notificationsSubscribed, permission, loading: notificationsLoading, error: notificationsError, subscribe, unsubscribe, testLoading, testSent, sendTest } = useNotifications()
const notificationsDenied = computed(() => permission.value === 'denied')

function toggleNotifications() {
  if (notificationsSubscribed.value) {
    unsubscribe()
  } else {
    subscribe()
  }
}
</script>
