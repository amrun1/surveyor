<!-- src/components/Toast.vue -->
<template>
    <transition enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-4 opacity-0 scale-95"
        enter-to-class="transform translate-y-0 opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100 scale-100"
        leave-to-class="transform translate-y-2 opacity-0 scale-95">
        
        <div v-if="isVisible" :class="statusStyles[type]"
            class="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 px-5 py-4 rounded-2xl border shadow-xl max-w-md w-[calc(100vw-48px)] select-none animate-fade-in">
            
            <div :class="iconStyles[type]"
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                <!-- Success Icon Check -->
                <svg v-if="type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>

                <!-- Offline Warning Buffering Save Icon -->
                <svg v-else-if="type === 'offline'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>

                <!-- General Failure Alert Icon -->
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
            </div>

            <!-- TEXT DESCRIPTION CONTAINER LAYER -->
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-slate-800 text-[14px] leading-tight">{{ title }}</h4>
                <p class="text-xs text-slate-500 mt-0.5 leading-normal">{{ message }}</p>
            </div>

            <!-- DISMISS BUTTON LINK SWITCH -->
            <button type="button" @click="dismissToastNotification"
                class="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>

        </div>
    </transition>
</template>

<script setup>
import { ref } from 'vue'

const isVisible = ref(false)
const title = ref('')
const message = ref('')
const type = ref('success') // Supported status modes: 'success', 'offline', 'error'
let dismissTimerTimeoutPointer = null

const statusStyles = {
    success: 'bg-white border-emerald-100 text-slate-800 shadow-emerald-100/30',
    offline: 'bg-white border-amber-100 text-slate-800 shadow-amber-100/30',
    error: 'bg-white border-red-100 text-slate-800 shadow-red-100/30'
}

const iconStyles = {
    success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    offline: 'bg-amber-50 text-amber-600 border border-amber-100',
    error: 'bg-red-50 text-red-600 border border-red-100'
}

/**
 * Triggers notification visibility stream card rendering overlay properties configuration maps
 * @param {string} toastTitle - Header notification string text
 * @param {string} toastMessage - Inner details string text 
 * @param {string} toastType - Visual formatting palette configuration parameter ('success' | 'offline' | 'error')
 * @param {number} delayDuration - Lifespan delay tracking milliseconds block
 */
const triggerNotificationAlert = (toastTitle, toastMessage, toastType = 'success', delayDuration = 3500) => {
    // Clear any existing active timing counters to avoid race conditions execution crashes
    if (dismissTimerTimeoutPointer) clearTimeout(dismissTimerTimeoutPointer)

    title.value = toastTitle
    message.value = toastMessage
    type.value = toastType
    isVisible.value = true

    // Set up automatic self-destruction tracking loop parameters blocks
    dismissTimerTimeoutPointer = setTimeout(() => {
        isVisible.value = false
    }, delayDuration)
}

const dismissToastNotification = () => {
    isVisible.value = false
    if (dismissTimerTimeoutPointer) clearTimeout(dismissTimerTimeoutPointer)
}

defineExpose({ show: triggerNotificationAlert, hide: dismissToastNotification })
</script>
