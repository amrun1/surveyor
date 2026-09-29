<script setup>
import { ref, provide, onUnmounted, onMounted } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useUiStore } from '@/store/ui.js'
import { useAuthStore } from '@/store/auth.js'
import { APP_COLORS } from '@/constants/colors.js'
import Header from './components/Header.vue'
import Menu from './components/Menu.vue'
import AppToast from '@/components/Toast.vue'

import { runInitialServerSync } from '@/services/bootstrap.js'
import { useSync } from '@/composables/useSync.js'

const { flushPendingSyncQueue, setupSyncListeners, cleanupSyncListeners } = useSync()

const ui = useUiStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const globalToastComponentRef = ref(null)

onMounted(() => {
  runInitialServerSync()
  setupSyncListeners()
  flushPendingSyncQueue()
})

onUnmounted(() => {
  cleanupSyncListeners()
})

provide('toast', {
  success: (title, msg) => globalToastComponentRef.value?.show(title, msg, 'success'),
  offline: (title, msg) => globalToastComponentRef.value?.show(title, msg, 'offline'),
  error: (title, msg) => globalToastComponentRef.value?.show(title, msg, 'error')
})

// The router guard let someone through offline with an invalid token so they
// could keep working locally — this is what makes that state visible instead
// of silent. The moment connectivity actually returns (not just a flag flip,
// the real browser event), send them to sign in properly.
window.addEventListener('online', () => {
  if (auth.needsReauthWhenOnline && !auth.isTokenValid) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
  }
})
</script>

<template>
  <div :style="{
    '--color-primary': APP_COLORS.primary,
    '--color-secondary': APP_COLORS.secondary,
    '--color-accent': APP_COLORS.accent,
    '--color-danger': APP_COLORS.danger,
    '--color-background': APP_COLORS.background
  }" class="min-h-screen flex flex-col antialiased">

    <!-- Fullscreen routes (e.g. /login) render with none of the app shell — no
         Header, no sidebar Menu, no reauth banner (redundant if you're already
         looking at the sign-in screen). Toasts still work everywhere. -->
    <template v-if="route.meta.layout === 'fullscreen'">
      <RouterView />
    </template>

    <template v-else>
      <div v-if="auth.needsReauthWhenOnline"
        class="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-semibold text-center py-2 px-4">
        Working offline on a saved session — you'll need to sign in again once you're back online.
      </div>

      <Header />

      <div class="flex flex-1 pt-16 h-screen overflow-hidden">
        <Menu />

        <div v-if="ui.isMenuOpen" @click="ui.closeMenu" class="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"></div>

        <main class="flex-1 bg-sky overflow-y-auto p-4 md:p-8">
          <div class="max-w-5xl">
            <RouterView />
          </div>
        </main>
      </div>
    </template>

    <AppToast ref="globalToastComponentRef" />
  </div>
</template>