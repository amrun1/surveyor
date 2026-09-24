<!-- src/components/inputs/SelectInput.vue -->
<template>
    <div class="w-full flex flex-col gap-1 relative select-none" ref="dropdownRef">

        <!-- Field Header Label -->
        <span class="text-slate-700 text-sm font-medium mb-1 block">
            {{ label }}
            <span v-if="required" class="text-red-500 font-bold ml-0.5">*</span>
        </span>

        <!-- Selection Trigger Button -->
        <button type="button" @click="toggleDropdown" :class="[
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary focus:border-primary',
            isOpen ? 'ring-1 ring-primary border-primary bg-white' : 'bg-white'
        ]"
            class="border rounded-xl p-2.5 w-full text-sm text-slate-900 text-left flex justify-between items-center transition-all duration-150 shadow-xs cursor-pointer focus:outline-none h-[42px]">
            <span :class="selectedLabel ? 'text-slate-900 font-medium' : 'text-slate-400'">
                {{ selectedLabel || placeholder || 'Select an option' }}
            </span>
            <ChevronIcon :class="{ 'rotate-180': isOpen }" />
        </button>

        <!-- ============================================================================
      DESKTOP INTERFACE LAYER: FLOATING CARD MENU DROPDOWN (>= 1024px Large Screens)
    ============================================================================ -->
        <div class="hidden lg:block">
            <transition enter-active-class="transition duration-150 ease-out"
                enter-from-class="transform scale-95 opacity-0 -translate-y-2"
                enter-to-class="transform scale-100 opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="transform scale-100 opacity-100 translate-y-0"
                leave-to-class="transform scale-95 opacity-0 -translate-y-2">
                <div v-if="isOpen"
                    class="absolute left-0 right-0 top-[76px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-50">
                    <div v-if="normalizedOptions.length === 0"
                        class="px-4 py-3.5 text-center text-xs text-slate-400 font-medium bg-slate-50/40 italic">
                        No active options available.
                    </div>
                    <template v-else>
                        <button v-for="opt in normalizedOptions" :key="opt.value" type="button"
                            @click="selectOption(opt)"
                            :class="inputValue === opt.value ? 'bg-blue-50/70 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50'"
                            class="w-full text-left px-4 py-3 text-sm transition-colors duration-100 flex items-center justify-between cursor-pointer">
                            <span>{{ opt.label }}</span>
                            <CheckIcon v-if="inputValue === opt.value" />
                        </button>
                    </template>
                </div>
            </transition>
        </div>

        <!-- ============================================================================
      MOBILE INTERFACE LAYER: HARDWARE-ACCELERATED SLIDE BOTTOM SHEET (< 1024px)
    ============================================================================ -->
        <div class="block lg:hidden">
            <dialog ref="mobileSheetRef" :class="[
                isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            ]" class="w-full max-w-full m-0 mt-auto bg-transparent border-none p-0 outline-none fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.32,0.94,0.6,1)]"
                @click.self="closeMobileDropdown">
                <!-- Content panel sheet featuring custom dynamic transform configurations -->
                <div :class="isOpen ? 'translate-y-0' : 'translate-y-full'"
                    class="w-full bg-white rounded-t-3xl border-t border-slate-200/60 flex flex-col max-h-[75vh] h-fit transition-transform duration-300 ease-[cubic-bezier(0.32,0.94,0.6,1)] shadow-2xl overflow-hidden pb-6">
                    <!-- Dragging anchor interface pill line -->
                    <div class="w-full flex justify-center py-3 bg-white shrink-0">
                        <div class="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>

                    <!-- Bottom Sheet Header View -->
                    <div
                        class="px-5 pb-3 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm tracking-tight">{{ label || 'Select Option' }}
                            </h4>
                            <p class="text-[11px] text-slate-400 mt-0.5">Choose appraisal workspace metrics</p>
                        </div>
                        <button type="button" @click="closeMobileDropdown"
                            class="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl active:bg-slate-200 transition-colors">
                            Dismiss
                        </button>
                    </div>

                    <!-- Options Content Scroll Loop Container -->
                    <div class="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 bg-white">
                        <div v-if="normalizedOptions.length === 0"
                            class="px-4 py-8 text-center text-sm text-slate-400 italic">
                            No active options available.
                        </div>
                        <template v-else>
                            <button v-for="opt in normalizedOptions" :key="opt.value" type="button"
                                @click="selectOption(opt)"
                                :class="inputValue === opt.value ? 'bg-blue-50/70 text-primary font-bold' : 'text-slate-700 active:bg-slate-50/60'"
                                class="w-full text-left px-5 py-4 text-[15px] transition-colors duration-100 flex items-center justify-between cursor-pointer rounded-xl">
                                <span>{{ opt.label }}</span>
                                <CheckIcon v-if="inputValue === opt.value" />
                            </button>
                        </template>
                    </div>
                </div>
            </dialog>
        </div>

        <!-- Field Validation Errors -->
        <span v-if="error" class="text-xs text-red-500 font-semibold mt-1 block">
            {{ error }}
        </span>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import ChevronIcon from '@/icons/ChevronIcon.vue'
import CheckIcon from '@/icons/CheckIcon.vue'

const props = defineProps({
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    required: { type: Boolean, default: false },
    error: { type: String, default: '' },
    options: { type: Array, default: () => [] }
})

const inputValue = defineModel({ default: '' })
const isOpen = ref(false)
const dropdownRef = ref(null)
const mobileSheetRef = ref(null)
const windowWidth = ref(window.innerWidth)

const normalizedOptions = computed(() => {
    return props.options.map(opt => {
        if (typeof opt === 'object' && opt !== null) {
            return {
                value: String(opt.value !== undefined ? opt.value : opt.id || ''),
                label: String(opt.label !== undefined ? opt.label : opt.title || opt.name || '')
            }
        }
        return { value: String(opt), label: String(opt) }
    })
})

const selectedLabel = computed(() => {
    const matchingOption = normalizedOptions.value.find(opt => opt.value === String(inputValue.value))
    return matchingOption ? matchingOption.label : ''
})

/**
 * Clean Native Dialog Opening Framework Manager
 */
const syncMobileDialogState = (shouldOpen) => {
    if (!mobileSheetRef.value) return

    if (shouldOpen && windowWidth.value < 1024) {
        mobileSheetRef.value.showModal()
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
        // Retain thread open for exactly 300ms to allow CSS transitions to translate downward fully
        setTimeout(() => {
            if (!isOpen.value && mobileSheetRef.value?.open) {
                mobileSheetRef.value.close()
            }
        }, 300)
    }
}

// Watch active toggle changes to handle dialog presentation states
watch(isOpen, (newVal) => {
    syncMobileDialogState(newVal)
})

const toggleDropdown = () => { isOpen.value = !isOpen.value }
const closeMobileDropdown = () => { isOpen.value = false }

const selectOption = (option) => {
    inputValue.value = option.value
    isOpen.value = false
}

// ============================================================================
// 🛠️ REAL-TIME WINDOW ORIENTATION & RESIZE RESPONSIVE INTERCEPTOR ENGINE
// ============================================================================
const handleViewportResizeCheck = () => {
    windowWidth.value = window.innerWidth

    // If the window scales up beyond the lg breakpoint while open, convert state parameters
    if (windowWidth.value >= 1024 && mobileSheetRef.value?.open) {
        document.body.style.overflow = ''
        mobileSheetRef.value.close()
    } else if (windowWidth.value < 1024 && isOpen.value && !mobileSheetRef.value?.open) {
        // If scaled down onto mobile landscape lines, re-mount the modal backdrop mask layer
        syncMobileDialogState(true)
    }
}

const handleOutsideClick = (event) => {
    if (windowWidth.value >= 1024 && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false
    }
}

onMounted(() => {
    window.addEventListener('click', handleOutsideClick)
    window.addEventListener('resize', handleViewportResizeCheck) // Monitor active display swaps
})

onUnmounted(() => {
    window.removeEventListener('click', handleOutsideClick)
    window.removeEventListener('resize', handleViewportResizeCheck)
    document.body.style.overflow = ''
})
</script>

<style scoped>
dialog::backdrop {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.3s ease-[cubic-bezier(0.32, 0.94, 0.6, 1)];
}

dialog[open]::backdrop {
    opacity: 1;
}
</style>
