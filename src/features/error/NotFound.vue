<!-- src/features/error/NotFound.vue -->
<template>
    <div class="h-full overflow-y-auto bg-background flex items-center justify-center p-4">
        <div class="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
            <p class="text-5xl font-bold text-primary">404</p>
            <h1 class="text-lg font-bold text-slate-800">Halaman tidak ditemukan</h1>
            <p class="text-sm text-slate-500">
                Alamat <span class="font-mono text-xs break-all text-slate-700">{{ route.fullPath }}</span> tidak tersedia.
            </p>
            <RouterLink :to="{ name: 'tasklist' }"
                class="inline-block mt-2 text-sm font-semibold px-4 py-2.5 rounded-lg bg-primary text-white hover:opacity-90">
                Kembali ke Task List
            </RouterLink>
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
