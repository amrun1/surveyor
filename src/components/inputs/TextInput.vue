<template>
    <div class="w-full flex flex-col gap-1">
        <span class="text-slate-700 text-sm font-medium mb-1 block">{{ label }}<span v-if="required"
                class="text-red-500 font-bold ml-0.5">*</span></span>
        <input v-model="inputValue" :type="inputType" :inputmode="inputmode" :autocomplete="autocomplete"
            :placeholder="placeholder"
            :class="error ? 'border-red-500' : 'border-slate-300 focus:ring-primary'"
            class="border rounded-xl p-2.5 w-full text-base bg-white text-slate-900 focus:outline-none focus:ring-1 shadow-xs" />
        <span v-if="error" class="text-xs text-red-500 font-semibold mt-1 block">{{ error }}</span>
    </div>
</template>

<script setup>
defineProps({
    placeholder: String,
    label: String,
    required: Boolean,
    error: String,
    inputType: { type: String, default: 'text' }, // 'text' | 'date' | 'tel' | 'email' | ...
    inputmode: { type: String, default: undefined }, // 'numeric' | 'decimal' | 'tel' | ...
    autocomplete: { type: String, default: 'off' }
})
const inputValue = defineModel({ type: String, default: '' })
</script>