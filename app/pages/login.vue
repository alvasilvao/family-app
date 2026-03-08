<template>
  <div
    style="
      min-height: 100vh;
      background: #f7f3ee;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    "
  >
    <div
      style="
        background: #fff;
        border-radius: 20px;
        padding: 40px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        text-align: center;
      "
    >
      <div style="font-size: 48px; margin-bottom: 16px">&#x1f96b;</div>
      <h1 style="font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700; margin-bottom: 8px">
        Meal Kit
      </h1>
      <p style="color: #9b9590; font-size: 14px; margin-bottom: 28px">
        Plan your weekly meals and generate grocery lists
      </p>

      <div v-if="sent" class="fade-in" style="padding: 20px 0">
        <p style="font-size: 15px; color: #2d6a4f; font-weight: 600; margin-bottom: 8px">
          &#x2709;&#xfe0f; Check your email!
        </p>
        <p style="font-size: 13px; color: #6b6560">
          We sent a magic link to <strong>{{ email }}</strong>
        </p>
      </div>

      <form v-else @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 12px">
        <input
          v-model="email"
          type="email"
          placeholder="your@email.com"
          required
          class="import-focus"
          :style="{
            width: '100%',
            border: '1.5px solid #e8e2db',
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '14px',
            color: '#1a1a1a',
            background: '#faf8f5',
            transition: 'border-color .2s',
          }"
        />
        <button
          type="submit"
          :disabled="loading"
          :style="{
            padding: '12px 20px',
            borderRadius: '10px',
            background: '#2d6a4f',
            border: 'none',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            fontFamily: '\'DM Sans\', sans-serif',
            opacity: loading ? 0.7 : 1,
          }"
        >
          {{ loading ? 'Sending...' : 'Send Magic Link' }}
        </button>
        <p v-if="error" style="font-size: 13px; color: #c0392b">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { signIn } = useAuth()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await signIn(email.value)
    sent.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to send magic link'
  } finally {
    loading.value = false
  }
}
</script>
