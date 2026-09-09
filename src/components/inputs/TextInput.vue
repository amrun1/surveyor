<template>
    <div class="w-full flex flex-col gap-1">

        <span class="text-slate-700 text-sm font-medium mb-1 block">
            {{ label }}
            <span v-if="required" class="text-red-500 font-bold ml-0.5">*</span>
        </span>

        <input v-model="inputValue" type="text" :placeholder="placeholder"
            class="border border-slate-300 rounded-xl p-2.5 w-full text-sm bg-white text-slate-900 focus:outline-primary focus:ring-1 focus:ring-primary transition-all duration-150 shadow-xs" />

        <span v-if="error" class="text-xs text-red-500 font-semibold mt-1 block">{{ error }}</span>

    </div>
</template>

<script setup>

const props = defineProps({
    placeholder: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    required: { type: Boolean, default: false },
    error: { type: String, default: '' }
})

const inputValue = defineModel({ type: String, default: '' })
</script>