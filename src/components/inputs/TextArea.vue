<template>
    <div class="w-full flex flex-col gap-1">
        <span class="text-slate-700 text-sm font-medium mb-1 block">{{ label }}<span v-if="required"
                class="text-red-500 font-bold ml-0.5">*</span></span>
        <textarea ref="textareaRef" v-model="inputValue" :placeholder="placeholder" @input="adjustHeight"
            :class="error ? 'border-red-500' : 'border-slate-300 focus:ring-primary'"
            class="border rounded-xl p-2.5 w-full text-base bg-white text-slate-900 focus:outline-none focus:ring-1 shadow-xs resize-none overflow-hidden"
            rows="4"></textarea>
        <span v-if="error" class="text-xs text-red-500 font-semibold mt-1 block">{{ error }}</span>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

defineProps({ placeholder: String, label: String, required: Boolean, error: String })
const inputValue = defineModel({ type: String, default: '' })
const textareaRef = ref(null)
let resizeObserver = null

const adjustHeight = () => {
    if (!textareaRef.value) return
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
}

watch(inputValue, async () => {
    await nextTick()
    adjustHeight()
})

onMounted(() => {
    adjustHeight()
    if (textareaRef.value && window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
            adjustHeight()
        })
        resizeObserver.observe(textareaRef.value)
    }
})

onUnmounted(() => {
    if (resizeObserver && textareaRef.value) {
        resizeObserver.disconnect()
    }
})
</script>