<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/store/ui.js'
import { useAuthStore } from '@/store/auth.js'
import { logout } from '@/services/authService.js'

const ui = useUiStore()
const auth = useAuthStore()
const router = useRouter()

const logoUrl = `${import.meta.env.BASE_URL}permata-logo.svg`

// SURVEYOR → Surveyor, SENIOR_SURVEYOR → Senior Surveyor
const formatRole = (role) => (role || '')
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const canSwitchRole = computed(() => auth.roles.length > 1)

const isRoleMenuOpen = ref(false)
const profileRef = ref(null)

const toggleRoleMenu = () => {
    if (canSwitchRole.value) isRoleMenuOpen.value = !isRoleMenuOpen.value
}

const selectRole = async (role) => {
    isRoleMenuOpen.value = false
    await auth.setActiveRole(role)
}

const onDocumentClick = (event) => {
    if (profileRef.value && !profileRef.value.contains(event.target)) isRoleMenuOpen.value = false
}
const onKeydown = (event) => {
    if (event.key === 'Escape') isRoleMenuOpen.value = false
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
})

// The backend call revokes the token server-side, but a failed/offline call
// must never trap someone who explicitly asked to sign out — local logout
// and the redirect always happen regardless.
const isLoggingOut = ref(false)
const handleLogout = async () => {
    if (isLoggingOut.value) return
    isLoggingOut.value = true
    try {
        await logout()
    } catch {
        // offline or server unreachable — proceed with local logout anyway
    } finally {
        await auth.flushPendingSaves()
        await auth.clearAuth()
        isLoggingOut.value = false
        router.replace({ name: 'login' })
    }
}
</script>

<template>
    <header
        class="bg-primary text-white h-16 fixed top-0 left-0 right-0 z-40 px-4 flex items-center justify-between gap-3 shadow-md">
        <div class="flex items-center min-w-0">
            <img :src="logoUrl" alt="Permata Bank" class="h-7 md:h-8 w-auto" />
        </div>

        <div class="flex items-center gap-1 sm:gap-2">
            <!-- Profile block -->
            <div ref="profileRef" class="relative">
                <div class="flex items-center gap-2.5 px-2 py-1">
                    <button type="button" @click="toggleRoleMenu" :disabled="!canSwitchRole"
                        :aria-label="canSwitchRole ? 'Switch role' : 'User profile'"
                        class="w-9 h-9 shrink-0 rounded-full bg-white/15 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50 disabled:cursor-default">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                        </svg>
                    </button>
                    <div class="hidden sm:flex flex-col items-start leading-tight min-w-0">
                        <span class="text-sm font-semibold truncate max-w-40">{{ auth.userId || '-' }}</span>
                        <button v-if="canSwitchRole" type="button" @click="toggleRoleMenu"
                            :aria-expanded="isRoleMenuOpen" aria-haspopup="listbox"
                            class="flex items-center gap-1 text-xs text-white/80 hover:text-white focus:outline-none focus:underline transition-colors">
                            {{ formatRole(auth.activeRole) }}
                            <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': isRoleMenuOpen }"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" />
                            </svg>
                        </button>
                        <span v-else class="text-xs text-white/80">{{ formatRole(auth.activeRole) }}</span>
                    </div>
                </div>

                <!-- Role switcher dropdown -->
                <ul v-if="isRoleMenuOpen" role="listbox"
                    class="absolute right-0 mt-1 w-56 bg-white text-slate-700 rounded-xl shadow-lg ring-1 ring-black/5 py-1 overflow-hidden">
                    <li class="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <span class="sm:hidden normal-case text-sm text-slate-700 block mb-1">{{ auth.userId }}</span>
                        Switch role
                    </li>
                    <li v-for="role in auth.roles" :key="role">
                        <button type="button" role="option" :aria-selected="role === auth.activeRole"
                            @click="selectRole(role)"
                            class="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-100 transition-colors"
                            :class="{ 'font-semibold text-primary': role === auth.activeRole }">
                            {{ formatRole(role) }}
                            <svg v-if="role === auth.activeRole" class="w-4 h-4" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" />
                            </svg>
                        </button>
                    </li>
                </ul>
            </div>

            <!-- Logout -->
            <button type="button" @click="handleLogout" :disabled="isLoggingOut" aria-label="Logout"
                class="flex items-center gap-2 p-2 md:px-3 rounded-lg text-white hover:bg-blue-900/60 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
                <span class="hidden md:inline text-sm font-medium">Logout</span>
            </button>

            <button @click="ui.toggleMenu"
                class="md:hidden p-2 rounded-lg text-white hover:bg-blue-900/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                type="button">
                <svg v-if="!ui.isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
            </button>
        </div>
    </header>
</template>
