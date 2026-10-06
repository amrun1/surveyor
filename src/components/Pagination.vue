<template>
    <nav class="flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
        <p class="text-xs text-slate-500">
            Menampilkan {{ rangeStart }}–{{ rangeEnd }} dari {{ total }}
        </p>
        <div class="flex items-center gap-1">
            <button type="button" :disabled="page <= 1" @click="go(page - 1)" aria-label="Sebelumnya"
                class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <template v-for="(item, idx) in pageItems" :key="idx">
                <span v-if="item === '…'" class="w-9 h-9 flex items-center justify-center text-sm text-slate-400">…</span>
                <button v-else type="button" @click="go(item)" :aria-current="item === page ? 'page' : undefined"
                    :class="item === page ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-700 hover:bg-white'"
                    class="min-w-9 h-9 px-2 flex items-center justify-center rounded-lg border text-sm font-semibold">
                    {{ item }}
                </button>
            </template>
            <button type="button" :disabled="page >= pageCount" @click="go(page + 1)" aria-label="Berikutnya"
                class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    page: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    total: { type: Number, required: true }
})
const emit = defineEmits(['update:page'])

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const rangeStart = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1)
const rangeEnd = computed(() => Math.min(props.page * props.pageSize, props.total))

// First, last, and current ±1, with '…' filling any gap: 1 … 4 5 6 … 9
const pageItems = computed(() => {
    const last = pageCount.value
    const pages = [...new Set([1, props.page - 1, props.page, props.page + 1, last])]
        .filter(p => p >= 1 && p <= last)
        .sort((a, b) => a - b)
    return pages.flatMap((p, i) => (i > 0 && p - pages[i - 1] > 1 ? ['…', p] : [p]))
})

const go = (p) => { if (p >= 1 && p <= pageCount.value && p !== props.page) emit('update:page', p) }
</script>
