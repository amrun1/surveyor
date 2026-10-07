<!-- src/components/EmbedGate.vue -->
<!-- Wraps an embedOnly page: renders it only inside the parent app's iframe,
     once the parent has sent a valid session (embed/bridge.js). After the first
     session the page stays mounted through token refreshes, so a 401 mid-edit
     shows a banner instead of throwing away unsaved work. -->
<template>
    <div class="h-full flex flex-col bg-background">
        <div v-if="!isEmbedded" class="flex-1 flex items-center justify-center p-4">
            <div class="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
                <h1 class="text-lg font-bold text-slate-800">Halaman tidak tersedia</h1>
                <p class="text-sm text-slate-500">Halaman ini hanya dapat dibuka dari aplikasi induk.</p>
            </div>
        </div>

        <div v-else-if="!hasBeenReady" class="flex-1 flex items-center justify-center p-4">
            <div v-if="bridgeState === 'error'"
                class="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
                <h1 class="text-lg font-bold text-slate-800">Tidak dapat memuat sesi</h1>
                <p class="text-sm text-slate-500">Aplikasi induk belum mengirimkan sesi login yang valid.</p>
                <button type="button" @click="requestSession"
                    class="text-sm font-semibold px-4 py-2.5 rounded-lg bg-primary text-white hover:opacity-90">
                    Coba lagi
                </button>
            </div>
            <div v-else class="flex flex-col items-center gap-3 text-slate-500" role="status">
                <RefreshIcon class="w-6 h-6 animate-spin" />
                <p class="text-sm">Menunggu sesi dari aplikasi induk…</p>
            </div>
        </div>

        <template v-else>
            <div v-if="bridgeState !== 'ready'" role="status"
                class="shrink-0 flex items-center justify-center gap-3 px-4 py-2 text-xs font-semibold border-b"
                :class="bridgeState === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'">
                <template v-if="bridgeState === 'error'">
                    Sesi berakhir dan belum diperbarui oleh aplikasi induk.
                    <button type="button" @click="requestSession" class="underline">Coba lagi</button>
                </template>
                <template v-else>Memperbarui sesi…</template>
            </div>
            <div class="flex-1 min-h-0">
                <slot />
            </div>
        </template>
    </div>
</template>

<script setup>
import { isEmbedded } from '@/embed/embedMode.js'
import { bridgeState, hasBeenReady, requestSession } from '@/embed/bridge.js'
import RefreshIcon from '@/icons/RefreshIcon.vue'
</script>
