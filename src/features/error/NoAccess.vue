<template>
    <div class="flex items-center justify-center py-16">
        <div class="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
            <h1 class="text-lg font-bold text-slate-800">Tidak ada menu untuk peran ini</h1>
            <p class="text-sm text-slate-500">
                Peran <span class="font-semibold text-slate-700">{{ auth.activeRole || '-' }}</span> belum memiliki
                akses ke halaman mana pun.
                <template v-if="auth.roles.length > 1">Ganti peran melalui profil di kanan atas.</template>
            </p>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth.js'

const auth = useAuthStore()
</script>
