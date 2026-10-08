<!-- src/components/inputs/CheckboxGroup.vue -->
<!-- formConfig `type: 'checkboxes'`: pick any number of options. The value is an
     ARRAY of option-value strings ([] when empty) — the one input whose value
     isn't a plain string; see the array notes in Form.vue / SurveyForm.vue.
     Chips for a few short options, full-width rows otherwise. Real native
     checkboxes underneath (visually hidden), same pattern as RadioGroup.vue. -->
<template>
    <fieldset class="w-full min-w-0 flex flex-col gap-1" :aria-describedby="error ? errorId : undefined">
        <legend class="w-full text-slate-700 text-sm font-medium mb-2 flex items-baseline justify-between gap-3">
            <span>{{ label }}<span v-if="required" class="text-red-500 font-bold ml-0.5">*</span></span>
            <!-- State of a long list readable without scrolling through it -->
            <span v-if="selected.length" class="shrink-0 text-xs font-semibold text-primary">
                {{ selected.length }} dipilih
            </span>
        </legend>

        <!-- Chips: a few short options, wrapping -->
        <div v-if="isChips" :class="error ? 'border-red-500 p-2' : 'border-transparent'"
            class="flex flex-wrap gap-2 rounded-xl border">
            <label v-for="opt in visibleOptions" :key="opt.value" :class="isChecked(opt)
                ? 'bg-blue-50 text-primary font-semibold border-primary'
                : 'bg-white text-slate-700 border-slate-300 active:bg-slate-50'"
                class="relative min-h-11 px-3.5 flex items-center gap-1.5 rounded-full border text-base cursor-pointer select-none transition-colors shadow-xs has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
                <input type="checkbox" class="sr-only" :value="opt.value" :checked="isChecked(opt)"
                    @change="toggle(opt, $event.target.checked)" />
                <CheckIcon v-if="isChecked(opt)" class="w-4 h-4 shrink-0" stroke-width="2.5" />
                <span>{{ opt.label }}</span>
            </label>
        </div>

        <!-- List: full-width rows, long labels get the width they need -->
        <div v-else :class="error ? 'border-red-500' : 'border-slate-300'"
            class="rounded-xl border bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
            <label v-for="opt in visibleOptions" :key="opt.value"
                :class="isChecked(opt) ? 'bg-blue-50/60' : 'active:bg-slate-50'"
                class="relative min-h-11 px-3.5 py-3 flex items-start gap-3 cursor-pointer select-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-primary">
                <input type="checkbox" class="sr-only" :value="opt.value" :checked="isChecked(opt)"
                    @change="toggle(opt, $event.target.checked)" />
                <span :class="isChecked(opt) ? 'bg-primary border-primary text-white' : 'bg-white border-slate-300'"
                    class="mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center"
                    aria-hidden="true">
                    <CheckIcon v-if="isChecked(opt)" class="w-3.5 h-3.5" stroke-width="3" />
                </span>
                <span class="flex flex-col min-w-0">
                    <span :class="isChecked(opt) ? 'text-primary font-semibold' : 'text-slate-800'" class="text-base">
                        {{ opt.label }}
                    </span>
                    <span v-if="opt.description" class="text-xs text-slate-500 mt-0.5">{{ opt.description }}</span>
                </span>
            </label>

            <button v-if="isCollapsible" type="button" @click="isExpanded = !isExpanded"
                :aria-expanded="isExpanded"
                class="w-full min-h-11 px-3.5 text-sm font-semibold text-primary text-left active:bg-slate-50">
                {{ isExpanded ? 'Sembunyikan' : `Tampilkan semua (${normalizedOptions.length})` }}
            </button>
        </div>

        <div v-if="error || canClearAll" class="flex items-start justify-between gap-3 mt-1">
            <span v-if="error" :id="errorId" class="text-xs text-red-500 font-semibold">{{ error }}</span>
            <button v-if="canClearAll" type="button" @click="clearAll"
                class="ml-auto text-xs font-semibold text-slate-500 underline underline-offset-2 py-1">
                Hapus semua
            </button>
        </div>
    </fieldset>
</template>

<script setup>
import { ref, computed, useId } from 'vue'
import CheckIcon from '@/icons/CheckIcon.vue'
import { normalizeOptions, toSelectionArray, toggleSelection } from './normalizeOptions.js'

// Form.vue v-binds the whole field object; don't spray type/name/section/… onto the DOM.
defineOptions({ inheritAttrs: false })

const props = defineProps({
    label: String,
    required: Boolean,
    error: String,
    // strings, or { value, label, description?, exclusive? } — `exclusive` marks a
    // "nothing applies" answer (e.g. 'Tidak ada') that excludes every other option
    options: { type: Array, default: () => [] },
    layout: { type: String, default: 'auto' } // 'auto' | 'chips' | 'list'
})
// Array of selected values. String accepted only to tolerate '' / legacy values.
const model = defineModel({ type: [Array, String], default: () => [] })

const errorId = `${useId()}-error`

const normalizedOptions = computed(() => normalizeOptions(props.options))
const selected = computed(() => toSelectionArray(model.value))
const isChecked = (opt) => selected.value.includes(opt.value)

// Every change goes through toggleSelection, which always returns a NEW array —
// Form.vue only notices a field changed when its value is replaced.
const toggle = (opt, checked) => {
    model.value = toggleSelection(selected.value, opt, checked, normalizedOptions.value)
}

// Chips only for a few short, description-less options; otherwise rows.
const CHIPS_MAX_OPTIONS = 6
const CHIPS_MAX_LABEL = 16
const isChips = computed(() => {
    if (props.layout !== 'auto') return props.layout === 'chips'
    const opts = normalizedOptions.value
    return opts.length > 0 && opts.length <= CHIPS_MAX_OPTIONS &&
        opts.every(opt => opt.label.length <= CHIPS_MAX_LABEL && !opt.description)
})

// Long lists (list layout) show the first few plus anything already selected
// (a ticked option is never hidden) plus any exclusive "Tidak ada" option — it's
// usually last, and the one-tap honest answer must not need an expand first.
// Options are never reordered.
const COLLAPSE_ABOVE = 8
const COLLAPSED_COUNT = 6
const isExpanded = ref(false)
const isCollapsible = computed(() => !isChips.value && normalizedOptions.value.length > COLLAPSE_ABOVE)
const visibleOptions = computed(() => {
    if (!isCollapsible.value || isExpanded.value) return normalizedOptions.value
    return normalizedOptions.value.filter((opt, idx) => idx < COLLAPSED_COUNT || isChecked(opt) || opt.exclusive)
})

const canClearAll = computed(() => selected.value.length >= 2)
const clearAll = () => { model.value = [] }
</script>
