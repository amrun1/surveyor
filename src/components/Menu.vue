<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUiStore } from '@/store/ui.js'
import SurveyIcon from '@/icons/SurveyIcon.vue'
import CheckIcon from '@/icons/CheckIcon.vue'
import ChevronLeftIcon from '@/icons/ChevronLeftIcon.vue'

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
// Two tiers, one breakpoint (Tailwind's default md: = 768px):
//   below md → overlay drawer (ui.isMenuOpen), always full labels
//   md and up → static sidebar; compact or full is purely the user's choice
// Tracked in JS because isCompact combines "which tier" with "did they choose
// to collapse it". MD_BREAKPOINT_PX agrees with Tailwind's md: by convention
// only — if md is ever customized in @theme, update this too.
const MD_BREAKPOINT_PX = 768
const isMdUp = ref(false)
let mdQuery
const updateMdUp = (e) => { isMdUp.value = e.matches }

// --- Collapse (persisted; irrelevant below md, see isCompact) ----------
const isCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true')
const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('sidebarCollapsed', String(isCollapsed.value))
}

// Never true on phone: the overlay drawer always shows full labels.
const isCompact = computed(() => isMdUp.value && isCollapsed.value)

onMounted(() => {
    mdQuery = window.matchMedia(`(min-width: ${MD_BREAKPOINT_PX}px)`)
    isMdUp.value = mdQuery.matches
    mdQuery.addEventListener('change', updateMdUp)
})

onUnmounted(() => {
    mdQuery?.removeEventListener('change', updateMdUp)
})
</script>

<template>
    <aside :class="[
        ui.isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isCompact ? 'w-[76px]' : 'w-64'
    ]"
        class="fixed inset-y-0 left-0 pt-16 md:pt-3 bg-white border-r border-slate-200/80 z-50 transition-all duration-300 ease-in-out flex flex-col md:static select-none overflow-hidden shrink-0">
        <nav class="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">

            <RouterLink v-for="item in menuItems" :key="item.routeName" :to="{ name: item.routeName }"
                @click="ui.closeMenu" :class="isCompact ? 'flex-col gap-1 px-1 text-center' : 'gap-3.5 px-4'"
                class="group flex items-center py-3 rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-200"
                active-class="bg-blue-50/70 text-primary font-semibold">
                <component :is="item.icon" class="w-5 h-5 shrink-0" />
                <span :class="isCompact ? 'text-[11px] leading-tight' : 'text-[15px] font-medium'">{{ item.name
                    }}</span>
            </RouterLink>

        </nav>

        <button @click="toggleCollapsed" type="button"
            :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            class="hidden md:flex items-center justify-center mx-3 mb-3 w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shrink-0 self-start">
            <ChevronLeftIcon :class="{ 'rotate-180': isCollapsed }" class="w-4 h-4 transition-transform duration-200" />
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