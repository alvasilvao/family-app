<template>
  <div
    style="
      min-height: 100dvh;
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
      <div style="font-size: 48px; margin-bottom: 16px">&#x1F3E0;</div>
      <h1 style="font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700; margin-bottom: 8px">
        Family App
      </h1>
      <p style="color: #9b9590; font-size: 14px; margin-bottom: 28px">
        Organize meals, tasks, and more for the family
      </p>

      <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 12px">
        <label for="login-email" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0)">Email</label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          placeholder="your@email.com"
          required
          class="import-focus"
          :style="inputStyle"
        />
        <label for="login-password" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0)">Password</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          placeholder="Password"
          required
          minlength="6"
          class="import-focus"
          :style="inputStyle"
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
          {{ loading ? 'Please wait...' : 'Sign In' }}
        </button>
        <p v-if="error" style="font-size: 13px; color: #c0392b">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const inputStyle = {
  width: '100%',
  border: '1.5px solid #e8e2db',
  borderRadius: '10px',
  padding: '12px 16px',
  fontSize: '16px',
  color: '#1a1a1a',
  background: '#faf8f5',
  transition: 'border-color .2s',
}

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await signIn(email.value, password.value)
    navigateTo('/')
  } catch (err: any) {
    error.value = err.message || 'Authentication failed'
  } finally {
    loading.value = false
  }
}
</script>
