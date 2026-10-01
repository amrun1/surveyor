<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUiStore } from '@/store/ui.js'
import SurveyIcon from '@/icons/SurveyIcon.vue'
import CheckIcon from '@/icons/CheckIcon.vue'

const ui = useUiStore()

// Static — no backend fetch. There's no menu-structure endpoint in
// appraisal-backend, and this app is scoped to a single role (surveyor), so
// there's nothing to vary per-person yet. If a second role/menu ever exists,
// that's the moment to reintroduce fetching — not before, since backend-driven
// menus were solving a problem this app doesn't actually have right now.
//
// Icons are placeholders (no dedicated Task List/Inquiry icon exists yet in
// src/icons/) — swap freely once real ones exist.
const menuItems = [
    { name: 'Task List', routeName: 'tasklist', icon: SurveyIcon },
    { name: 'Inquiry', routeName: 'inquiry', icon: CheckIcon }
]

// --- Viewport tier -----------------------------------------------------
// Tracked in JS (not left as pure CSS breakpoints) because desktop's
// collapsed state is a user toggle, not something a media query alone can
// express — isCompact below needs to combine "which tier" with "did they
// choose to collapse it," so both need to be readable from the same place.
const isMdUp = ref(false)
const isLgUp = ref(false)
let mdQuery, lgQuery
const updateMdUp = (e) => { isMdUp.value = e.matches }
const updateLgUp = (e) => { isLgUp.value = e.matches }

// --- Desktop collapse (persisted; irrelevant below lg, see isCompact) --
const isCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true')
const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('sidebarCollapsed', String(isCollapsed.value))
}

// True on the tablet tier (forced — no room for the full sidebar there),
// or on desktop specifically when the person has chosen to collapse it.
// Never true on phone: opening the overlay drawer there always shows full
// labels, since phone has no "compact but visible" state to fall back to.
const isCompact = computed(() => (isMdUp.value && !isLgUp.value) || (isLgUp.value && isCollapsed.value))

onMounted(() => {
    mdQuery = window.matchMedia('(min-width: 768px)')
    lgQuery = window.matchMedia('(min-width: 1024px)')
    isMdUp.value = mdQuery.matches
    isLgUp.value = lgQuery.matches
    mdQuery.addEventListener('change', updateMdUp)
    lgQuery.addEventListener('change', updateLgUp)
})

onUnmounted(() => {
    mdQuery?.removeEventListener('change', updateMdUp)
    lgQuery?.removeEventListener('change', updateLgUp)
})
</script>

<template>
    <aside :class="[
        ui.isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        isCompact ? 'w-[76px]' : 'w-64'
    ]"
        class="fixed inset-y-0 left-0 pt-16 lg:pt-3 bg-white border-r border-slate-200/80 z-50 transition-all duration-300 ease-in-out flex flex-col lg:static select-none overflow-hidden shrink-0">
        <nav class="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">

            <RouterLink v-for="item in menuItems" :key="item.routeName" :to="{ name: item.routeName }"
                @click="ui.closeMenu" :class="isCompact ? 'flex-col gap-1 px-1 text-center' : 'gap-3.5 px-4'"
                class="group flex items-center py-3 rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-200"
                active-class="bg-blue-50/70 text-primary font-semibold">
                <component :is="item.icon" />
                <span :class="isCompact ? 'text-[11px] leading-tight' : 'text-[15px] font-medium'">{{ item.name
                    }}</span>
            </RouterLink>

        </nav>

        <button @click="toggleCollapsed" type="button"
            :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            class="hidden lg:flex items-center justify-center mx-3 mb-3 w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shrink-0 self-start">
            <svg :class="{ 'rotate-180': isCollapsed }" class="w-4 h-4 transition-transform duration-200" fill="none"
                stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>