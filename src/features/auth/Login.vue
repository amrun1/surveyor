<!-- src/features/auth/Login.vue -->
<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden bg-cover bg-no-repeat"
    :style="{ backgroundColor: '#1e3a8a', backgroundImage: `url('${bgImageUrl}')`, backgroundPosition: 'right center' }">
    <!-- The photo's objects (houses, calculator) sit toward its left; background-position
         keeps the emptier blue area on the right under the card, matching the reference
         screenshot. On narrow/mobile widths the card is centered instead (see <main>
         below), so it may partially sit over the objects — acceptable since the image
         itself is a wide banner not designed for portrait crops. -->

    <!-- Darkens the image slightly for text contrast without a hard color swap. -->
    <div class="absolute inset-0 bg-black/10 pointer-events-none"></div>

    <header class="flex items-center px-5 pt-6 pb-2 lg:px-10 lg:pt-8">
      <img :src="logoUrl" alt="Permata Bank" class="h-8 lg:h-9 w-auto" />
    </header>

    <main class="flex-1 flex items-center justify-center lg:justify-end px-5 pb-10 lg:pr-16 lg:pb-0">
      <div class="w-full max-w-sm lg:max-w-md bg-primary/90 backdrop-blur-sm rounded-2xl p-7 lg:p-9 shadow-2xl">
        <h1 class="text-white text-xl lg:text-2xl font-bold mb-6">Welcome To Web Appraisal</h1>

        <div v-if="!isOnline"
          class="mb-5 flex items-center gap-2 bg-amber-400/15 border border-amber-300/30 text-amber-200 text-xs font-semibold rounded-lg px-3 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
            <path
              d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
          </svg>
          You're offline — connect to the internet to sign in
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-white/90 text-sm font-medium mb-1.5">User ID</label>
            <input v-model="userId" type="text" placeholder="Key in User ID" autocomplete="username"
              :class="fieldErrors.userId ? 'border-red-400' : 'border-white/30 focus:border-white'"
              class="w-full bg-transparent border-0 border-b pb-2 text-white placeholder-white/40 text-base focus:outline-none transition-colors" />
            <span v-if="fieldErrors.userId" class="text-red-300 text-xs font-medium mt-1 block">{{
              fieldErrors.userId }}</span>
          </div>

          <div>
            <label class="block text-white/90 text-sm font-medium mb-1.5">Password</label>
            <input v-model="password" type="password" placeholder="Key in Password" autocomplete="current-password"
              :class="fieldErrors.password ? 'border-red-400' : 'border-white/30 focus:border-white'"
              class="w-full bg-transparent border-0 border-b pb-2 text-white placeholder-white/40 text-base focus:outline-none transition-colors" />
            <span v-if="fieldErrors.password" class="text-red-300 text-xs font-medium mt-1 block">{{
              fieldErrors.password }}</span>
          </div>

          <div v-if="formError" class="text-xs text-red-300 font-medium">
            {{ formError }}
          </div>

          <button type="submit" :disabled="isSubmitting || !isOnline"
            class="bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-8 py-2.5 rounded-lg transition-colors active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-2">
            {{ isSubmitting ? 'Signing in…' : 'Login' }}
          </button>
        </form>
      </div>
    </main>

    <footer class="bg-primary/80 text-white/90 text-xs font-medium px-5 py-3 lg:px-10">
      Collateral Valuation - PT. Bank Permata, Tbk
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { useSync } from '@/composables/useSync.js'
import { login } from '@/services/authService.js'
import { mapLoginResponseToSession } from '@/domain/mappers.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = inject('toast')
const { resolvePendingAuthRecords } = useSync()

// Needed because this app deploys under a subpath (base: '/surveyor/' in
// vite.config.js) — a hardcoded '/login-bg.jpg' would resolve to the domain
// root instead of where the file actually gets served from.
const bgImageUrl = `${import.meta.env.BASE_URL}login-bg.jpg`
const logoUrl = `${import.meta.env.BASE_URL}permata-logo.svg`

const userId = ref('')
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
  if (!userId.value.trim()) fieldErrors.value.userId = 'Required'
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
    const response = await login(userId.value.trim(), password.value)

    if (response.status === 401 || response.status === 403) {
      formError.value = 'Incorrect username or password.'
      return
    }
    if (!response.ok) {
      formError.value = 'Something went wrong on our end. Please try again.'
      return
    }

    const data = await response.json()
    await auth.setSession(mapLoginResponseToSession(data))
    console.log('Login response:', auth)

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