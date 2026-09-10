<template>
    <div class="w-full flex flex-col gap-1 relative select-none" ref="dropdownRef">

        <span class="text-slate-700 text-sm font-medium mb-1 block">
            {{ label }}
            <span v-if="required" class="text-red-500 font-bold ml-0.5">*</span>
        </span>

        <!-- Selection Trigger Button Container Link -->
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

        <!-- Dropdown Options Floating Layer Container Menu -->
        <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-2">
            <div v-if="isOpen"
                class="absolute left-0 right-0 top-[76px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-50">

                <div v-if="normalizedOptions.length === 0"
                    class="px-4 py-3.5 text-center text-xs text-slate-400 font-medium bg-slate-50/40 select-none italic">
                    No active options available.
                </div>

                <template v-else>
                    <button v-for="opt in normalizedOptions" :key="opt.value" type="button" @click="selectOption(opt)"
                        :class="inputValue === opt.value ? 'bg-blue-50/70 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50'"
                        class="w-full text-left px-4 py-3 text-sm transition-colors duration-100 flex items-center justify-between cursor-pointer">
                        <span>{{ opt.label }}</span>

                        <CheckIcon v-if="inputValue === opt.value" />
                    </button>
                </template>
            </div>
        </transition>

        <span v-if="error" class="text-xs text-red-500 font-semibold mt-1 block">
            {{ error }}
        </span>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const toggleDropdown = () => { isOpen.value = !isOpen.value }

const selectOption = (option) => {
    inputValue.value = option.value
    isOpen.value = false
}

const handleOutsideClick = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false
    }
}

onMounted(() => { window.addEventListener('click', handleOutsideClick) })
onUnmounted(() => { window.removeEventListener('click', handleOutsideClick) })
</script>