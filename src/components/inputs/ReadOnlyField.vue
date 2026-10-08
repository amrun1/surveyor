<template>
    <div class="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
        <span class="text-xs text-slate-400 font-medium block mb-0.5">{{ label }}</span>
        <span class="text-sm text-slate-700 font-semibold block" :class="{ 'tabular-nums': isNumber }">{{ shownValue }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatForDisplay, getMask } from '@/domain/numberMask.js'

// Presentational only — no input, no v-model write-back, no validation. This is what
// Form.vue routes any field with `computed: true` to, regardless of that field's
// underlying `type` (text, select, ...), since a derived/rolled-up value should never
// look like an editable control that merely happens to be disabled.
const props = defineProps({
    label: String,
    modelValue: { type: String, default: '' },
    computed: Boolean, // consumed here only to stop it falling through as a DOM attribute
    // A computed `type: 'number'` field (totals, liquidation values) is shown
    // formatted exactly like its editable NumberInput counterparts: 'Rp 1.250.000'.
    type: String,
    mask: String,
    prefix: String,
    suffix: String
})

const isNumber = computed(() => props.type === 'number')

const shownValue = computed(() => {
    if (!props.modelValue) return '—'
    if (!isNumber.value) return props.modelValue
    const suffix = props.suffix ?? getMask(props.mask).suffix
    return [props.prefix, formatForDisplay(props.modelValue, props.mask), suffix].filter(Boolean).join(' ')
})
</script>
