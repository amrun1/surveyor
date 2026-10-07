<template>
    <div class="flex items-center justify-center py-16">
        <div class="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
            <p class="text-xs font-bold uppercase tracking-wide text-slate-400">Segera hadir</p>
            <h1 class="text-lg font-bold text-slate-800">{{ route.meta.title || 'Halaman ini' }}</h1>
            <p class="text-sm text-slate-500">Halaman ini sedang dalam pengembangan.</p>
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
