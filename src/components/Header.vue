<script setup>
import { useUiStore } from '@/store/ui.js'
const ui = useUiStore()
</script>

<template>
    <header
        class="bg-primary text-white h-16 fixed top-0 left-0 right-0 z-40 px-4 flex items-center justify-between shadow-md">
        <div class="flex bg-red items-center gap-2">
            <span class="text-xl  font-bold tracking-tight text-white">Surveyor</span>
        </div>
        <button @click="ui.toggleMenu"
            class="lg:hidden p-2 rounded-lg text-white hover:bg-blue-900/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
            type="button">
            <svg v-if="!ui.isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
        </button>
    </header>
</template>