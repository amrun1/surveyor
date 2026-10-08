<!-- src/components/inputs/NumberInput.vue -->
<!-- Masked number field (formConfig `type: 'number'`, `mask: 'currency' | 'luas-tanah' | …`).
     Shows Indonesian formatting (1.250.000,50) while v-model holds the canonical
     string ('1250000.5') — see domain/numberMask.js for the masks and that contract. -->
<template>
    <div class="w-full flex flex-col gap-1">
        <label :for="inputId" class="text-slate-700 text-sm font-medium mb-1 block">
            {{ label }}<span v-if="required" class="text-red-500 font-bold ml-0.5">*</span>
        </label>

        <div :class="shownError ? 'border-red-500' : 'border-slate-300 focus-within:ring-1 focus-within:ring-primary'"
            class="flex items-stretch border rounded-xl bg-white shadow-xs overflow-hidden">
            <!-- iOS numeric/decimal keyboards have no minus key -->
            <button v-if="maskDef.signed" type="button" @click="toggleSign" aria-label="Ubah tanda plus/minus"
                class="px-3 text-base font-semibold text-slate-600 border-r border-slate-200 active:bg-slate-50">±</button>
            <span v-if="prefix" class="pl-3 flex items-center text-base text-slate-400 select-none"
                aria-hidden="true">{{ prefix }}</span>

            <input ref="inputRef" :id="inputId" type="text" :inputmode="maskDef.inputmode" enterkeyhint="next"
                autocomplete="off" :value="display" :placeholder="placeholder" :aria-invalid="!!shownError"
                :aria-describedby="shownError ? errorId : (magnitude ? hintId : undefined)"
                :class="prefix ? 'pl-1.5' : 'pl-2.5'"
                class="flex-1 min-w-0 py-2.5 pr-2.5 text-base text-slate-900 bg-transparent focus:outline-none tabular-nums"
                @input="onInput" @blur="onBlur" />

            <span v-if="effectiveSuffix" class="pr-3 flex items-center text-base text-slate-400 select-none"
                aria-hidden="true">{{ effectiveSuffix }}</span>
        </div>

        <span v-if="shownError" :id="errorId" class="text-xs text-red-500 font-semibold mt-1 block">{{ shownError }}</span>
        <!-- Big amounts spelled out, so a missing/extra zero is obvious at a glance -->
        <span v-else-if="magnitude" :id="hintId" class="text-xs text-slate-500 mt-0.5 block">
            ≈ {{ prefix }} {{ magnitude }}
        </span>
    </div>
</template>

<script setup>
import { ref, computed, watch, useId, onMounted } from 'vue'
import {
    getMask, DEFAULT_MASK, applyEdit, sanitizeInput, formatForDisplay, checkBounds, describeMagnitude
} from '@/domain/numberMask.js'

// Form.vue v-binds the whole field object; don't spray type/name/section/… onto the DOM.
defineOptions({ inheritAttrs: false })

const props = defineProps({
    label: String,
    required: Boolean,
    error: String,
    placeholder: String,
    mask: { type: String, default: DEFAULT_MASK },
    prefix: String, // e.g. 'Rp'
    suffix: String, // e.g. 'm²' — persen gets '%' automatically
    maxlength: [Number, String] // max integer digits, e.g. 4 for a year
})
const model = defineModel({ type: String, default: '' })

const maskDef = computed(() => getMask(props.mask))
const effectiveSuffix = computed(() => props.suffix ?? maskDef.value.suffix)
const normalizeOptions = computed(() => ({ maxDigits: props.maxlength }))

const inputId = useId()
const errorId = `${inputId}-error`
const hintId = `${inputId}-hint`
const inputRef = ref(null)

const display = ref(formatForDisplay(model.value, props.mask))
let lastEmitted = model.value

const emitCanonical = (canonical) => {
    lastEmitted = canonical
    if (model.value !== canonical) model.value = canonical
}

// Bounds are checked on blur, never per keystroke — reaching 50 means passing through 5.
const boundsError = ref(null)
const shownError = computed(() => props.error || boundsError.value)

const magnitude = computed(() => (props.prefix === 'Rp' ? describeMagnitude(model.value) : null))

// Values that didn't come from typing here — the initial value, a restored draft,
// a task prefill, or one saved before this field was masked (e.g. '1.500.000'
// typed into a plain text field) — are sanitised, so mappers.js only ever sees
// canonical numbers.
const adoptExternalValue = (value) => {
    const canonical = value ? sanitizeInput(value, props.mask, normalizeOptions.value) : ''
    display.value = formatForDisplay(canonical, props.mask)
    boundsError.value = null
    emitCanonical(canonical)
}

watch(model, (value) => {
    if (value !== lastEmitted) adoptExternalValue(value)
})
onMounted(() => adoptExternalValue(model.value))

// Every keystroke/paste goes through applyEdit (domain/numberMask.js): it diffs
// the edit against the last display, rebuilds the canonical value, and works out
// where the caret belongs after re-grouping.
const onInput = (event) => {
    const el = event.target
    const result = applyEdit({
        prev: display.value,
        raw: el.value,
        caret: el.selectionStart ?? el.value.length,
        inputType: event.inputType
    }, props.mask, normalizeOptions.value)

    // Set the DOM value directly too: if the display string didn't change (e.g. a
    // rejected 3rd decimal), Vue wouldn't patch it and the stray character would stay.
    display.value = result.display
    el.value = result.display
    el.setSelectionRange(result.caret, result.caret)

    if (boundsError.value && !checkBounds(result.canonical, props.mask)) boundsError.value = null
    emitCanonical(result.canonical)
}

const onBlur = () => {
    // Drop transient states: a trailing decimal point ('1250.') or a lone '-'.
    let canonical = model.value
    if (canonical === '-') canonical = ''
    if (canonical.endsWith('.')) canonical = canonical.slice(0, -1)
    if (canonical !== model.value) {
        display.value = formatForDisplay(canonical, props.mask)
        emitCanonical(canonical)
    }
    boundsError.value = checkBounds(canonical, props.mask)
}

const toggleSign = () => {
    const value = model.value
    const canonical = value.startsWith('-') ? value.slice(1) : `-${value}`
    display.value = formatForDisplay(canonical, props.mask)
    emitCanonical(canonical)
    inputRef.value?.focus()
}
</script>
