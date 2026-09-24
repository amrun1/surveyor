<script setup>
import { ref, provide } from 'vue'
import { RouterView } from 'vue-router'
import { useUiStore } from '@/store/ui.js'
import { APP_COLORS } from '@/constants/colors.js'
import Header from './components/Header.vue'
import Menu from './components/Menu.vue'
import AppToast from '@/components/Toast.vue'

const ui = useUiStore()
const globalToastComponentRef = ref(null)

provide('toast', {
  success: (title, msg) => globalToastComponentRef.value?.show(title, msg, 'success'),
  offline: (title, msg) => globalToastComponentRef.value?.show(title, msg, 'offline'),
  error: (title, msg) => globalToastComponentRef.value?.show(title, msg, 'error')
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

    <AppToast ref="globalToastComponentRef" />
  </div>
</template>