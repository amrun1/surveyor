<!-- src/components/inputs/RadioGroup.vue -->
<!-- formConfig `type: 'radio'`: a single choice with every option visible —
     one tap instead of select's open-sheet-then-pick. Segmented pills for short
     2–3 option questions (Ada/Tidak Ada), stacked rows otherwise. Real native
     radios underneath (visually hidden), so arrow keys, screen readers and the
     focus order work without custom code. -->
<template>
    <fieldset class="w-full min-w-0 flex flex-col gap-1" :aria-describedby="error ? errorId : undefined">
        <legend class="text-slate-700 text-sm font-medium mb-2 block">
            {{ label }}<span v-if="required" class="text-red-500 font-bold ml-0.5">*</span>
        </legend>

        <!-- Segmented: ≤3 short options side by side -->
        <div v-if="isSegmented" :class="error ? 'border-red-500' : 'border-slate-300'"
            class="flex gap-1 p-1 rounded-xl border bg-white shadow-xs">
            <label v-for="opt in normalizedOptions" :key="opt.value" :class="isSelected(opt)
                ? 'bg-blue-50 text-primary font-semibold ring-1 ring-primary'
                : 'text-slate-700 active:bg-slate-50'"
                class="relative flex-1 min-w-0 min-h-11 px-2 flex items-center justify-center gap-1.5 rounded-lg text-base text-center leading-tight cursor-pointer select-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
                <input type="radio" class="sr-only" :name="groupName" :value="opt.value" :checked="isSelected(opt)"
                    @change="select(opt.value)" />
                <CheckIcon v-if="isSelected(opt)" class="w-4 h-4 shrink-0" stroke-width="2.5" />
                <span>{{ opt.label }}</span>
            </label>
        </div>

        <!-- List: full-width rows, labels never squeezed -->
        <div v-else :class="error ? 'border-red-500' : 'border-slate-300'"
            class="rounded-xl border bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
            <label v-for="opt in normalizedOptions" :key="opt.value"
                :class="isSelected(opt) ? 'bg-blue-50/60' : 'active:bg-slate-50'"
                class="relative min-h-11 px-3.5 py-3 flex items-start gap-3 cursor-pointer select-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-primary">
                <input type="radio" class="sr-only" :name="groupName" :value="opt.value" :checked="isSelected(opt)"
                    @change="select(opt.value)" />
                <span :class="isSelected(opt) ? 'border-primary' : 'border-slate-300'"
                    class="mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 bg-white flex items-center justify-center"
                    aria-hidden="true">
                    <span v-if="isSelected(opt)" class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                </span>
                <span class="flex flex-col min-w-0">
                    <span :class="isSelected(opt) ? 'text-primary font-semibold' : 'text-slate-800'" class="text-base">
                        {{ opt.label }}
                    </span>
                    <span v-if="opt.description" class="text-xs text-slate-500 mt-0.5">{{ opt.description }}</span>
                </span>
            </label>
        </div>

        <div v-if="error || canClear" class="flex items-start justify-between gap-3 mt-1">
            <span v-if="error" :id="errorId" class="text-xs text-red-500 font-semibold">{{ error }}</span>
            <!-- Native radios can't be unselected; optional fields get a way back from a mis-tap. -->
            <button v-if="canClear" type="button" @click="select('')"
                class="ml-auto text-xs font-semibold text-slate-500 underline underline-offset-2 py-1">
                Hapus pilihan
            </button>
        </div>
    </fieldset>
</template>

<script setup>
import { computed, useId } from 'vue'
import CheckIcon from '@/icons/CheckIcon.vue'
import { normalizeOptions } from './normalizeOptions.js'

// Form.vue v-binds the whole field object; don't spray type/name/section/… onto the DOM.
defineOptions({ inheritAttrs: false })

const props = defineProps({
    label: String,
    required: Boolean,
    error: String,
    options: { type: Array, default: () => [] }, // strings, or { value, label, description? }
    layout: { type: String, default: 'auto' } // 'auto' | 'segmented' | 'list'
})
// The selected option's value, or '' — same string contract as every other input.
const model = defineModel({ type: String, default: '' })

const groupName = useId()
const errorId = `${groupName}-error`

const normalizedOptions = computed(() => normalizeOptions(props.options))

// Segmented only when it fits a phone row comfortably: ≤3 options, short labels,
// no descriptions. Anything else stacks.
const SEGMENTED_MAX_OPTIONS = 3
const SEGMENTED_MAX_LABEL = 12
const isSegmented = computed(() => {
    if (props.layout !== 'auto') return props.layout === 'segmented'
    const opts = normalizedOptions.value
    return opts.length > 0 && opts.length <= SEGMENTED_MAX_OPTIONS &&
        opts.every(opt => opt.label.length <= SEGMENTED_MAX_LABEL && !opt.description)
})

const isSelected = (opt) => opt.value === model.value
const canClear = computed(() => !props.required && model.value !== '')
const select = (value) => { model.value = value }
</script>
