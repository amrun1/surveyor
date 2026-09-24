<template>
    <div v-if="autoFilledFields.length" class="rounded-xl border border-slate-200 overflow-hidden bg-white">
        <button type="button" @click="isOpen = !isOpen"
            class="w-full flex items-center justify-between gap-4 px-3.5 py-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-100 transition-colors cursor-pointer">
            <div v-if="pinnedFields.length" class="flex gap-5 text-left overflow-x-auto no-scrollbar">
                <div v-for="field in pinnedFields" :key="field.name" class="flex flex-col gap-0.5 shrink-0">
                    <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{{ field.label }}</span>
                    <span class="text-xs font-semibold text-slate-800">{{ field.value || '—' }}</span>
                </div>
            </div>
            <span v-else class="text-sm font-medium text-slate-500">From order</span>

            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                class="shrink-0 text-slate-400 transition-transform duration-200"
                :class="{ 'rotate-180': isOpen }">
                <path d="M6 9l6 6 6-6" />
            </svg>
        </button>

        <div v-show="isOpen" class="px-3.5 py-1 divide-y divide-slate-100">
            <div v-for="field in restFields" :key="field.name"
                class="flex justify-between gap-4 py-2.5 text-sm">
                <span class="text-slate-500">{{ field.label }}</span>
                <span class="text-slate-800 font-medium text-right">{{ field.value || '—' }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
// Renders a collapsed reference card for read-only/auto-filled data pulled straight
// from a formConfig.fields array (the same array Form.vue already consumes).
//
// Flag fields in your formConfig rather than passing separate props:
//   { name: 'orderNumber', label: 'No. Order', value: '2025062500106', autoFilled: true, pinned: true }
//
// - autoFilled: true  -> included in this card instead of the editable form flow
// - pinned: true      -> stays visible in the collapsed summary row (use sparingly —
//                        1-2 fields the person needs at a glance without expanding,
//                        e.g. an order number or the on-site contact person)
//
// Fields with autoFilled but no `pinned` only show once the card is expanded.
import { ref, computed } from 'vue'

const props = defineProps({
    fields: { type: Array, default: () => [] }, // pass formConfig.fields directly
    defaultOpen: { type: Boolean, default: false }
})

const isOpen = ref(props.defaultOpen)

const autoFilledFields = computed(() => props.fields.filter(f => f.autoFilled))
const pinnedFields = computed(() => autoFilledFields.value.filter(f => f.pinned))
const restFields = computed(() => autoFilledFields.value.filter(f => !f.pinned))
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>