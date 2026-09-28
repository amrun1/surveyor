<!-- src/features/auth/Login.vue -->
<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-5">
    <div class="w-full max-w-sm bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      <div class="mb-6 text-center">
        <h1 class="text-xl font-extrabold text-slate-900">Web Appraisal</h1>
        <p class="text-sm text-slate-500 mt-1">Sign in to continue</p>
      </div>

      <!-- Persistent, non-alarming banner while offline — sets expectation before
           they even try to submit, rather than only failing after the fact. -->
      <div v-if="!isOnline" class="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl px-3 py-2.5">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
          <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
        </svg>
        You're offline — connect to the internet to sign in
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <TextInput v-model="username" label="Username" placeholder="e.g., 43903-00" autocomplete="username"
          :error="fieldErrors.username" />
        <TextInput v-model="password" label="Password" inputType="password" autocomplete="current-password"
          :error="fieldErrors.password" />

        <div v-if="formError" class="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          {{ formError }}
        </div>

        <button type="submit" :disabled="isSubmitting || !isOnline"
          class="w-full bg-primary text-white text-sm font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
          {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TextInput from '@/components/inputs/TextInput.vue'
import { useAuthStore } from '@/store/auth.js'
import { useSync } from '@/composables/useSync.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = inject('toast')
const { resolvePendingAuthRecords } = useSync()

const username = ref('')
const password = ref('')
const isSubmitting = ref(false)
const formError = ref('')
const fieldErrors = ref({})
const isOnline = ref(navigator.onLine)

// navigator.onLine can be wrong in both directions (e.g. connected to wifi with
// no real internet), so it gates the UI (disables the button, shows the banner)
// but the actual submit handler below still independently distinguishes a network
// failure from a real 401 — this isn't the only line of defense.
const updateOnlineStatus = () => { isOnline.value = navigator.onLine }
onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})
onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

const validate = () => {
  fieldErrors.value = {}
  if (!username.value.trim()) fieldErrors.value.username = 'Required'
  if (!password.value.trim()) fieldErrors.value.password = 'Required'
  return Object.keys(fieldErrors.value).length === 0
}

const handleSubmit = async () => {
  formError.value = ''
  if (!validate()) return

  // Belt-and-suspenders: even though the button is disabled while offline,
  // don't let a request slip through on a stale isOnline read.
  if (!navigator.onLine) {
    formError.value = "You're offline — connect to the internet to sign in."
    return
  }

  isSubmitting.value = true
  try {
    const baseUrl = `${import.meta.env.BASE_URL}api/`
    const response = await fetch(`${baseUrl}auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value.trim(), password: password.value })
    })

    if (response.status === 401 || response.status === 403) {
      formError.value = 'Incorrect username or password.'
      return
    }
    if (!response.ok) {
      formError.value = 'Something went wrong on our end. Please try again.'
      return
    }

    const data = await response.json()
    // Expected shape: { token, expiresAt? }. If your backend doesn't send
    // expiresAt explicitly, auth.setSession() falls back to decoding the JWT's
    // own exp claim.
    await auth.setSession({ token: data.token, expiresAt: data.expiresAt })

    const resolvedCount = await resolvePendingAuthRecords()
    if (resolvedCount > 0) {
      toast?.success('Submissions Resumed', `${resolvedCount} submission(s) saved while signed out are now syncing.`)
    }

    const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirectTo)

  } catch (err) {
    // A thrown fetch (TypeError: Failed to fetch, or similar) means the request
    // never reached the server at all — that's a connectivity problem, not a
    // credentials problem, and should never be shown as "wrong password."
    formError.value = "Couldn't reach the server. Check your connection and try again."
  } finally {
    isSubmitting.value = false
  }
}
</script>