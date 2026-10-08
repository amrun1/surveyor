<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useUiStore } from '@/store/ui.js'
import { useAuthStore } from '@/store/auth.js'
import { MD_BREAKPOINT_PX } from '@/constants/breakpoints.js'
import SurveyIcon from '@/icons/SurveyIcon.vue'
import CheckIcon from '@/icons/CheckIcon.vue'
import ChartIcon from '@/icons/ChartIcon.vue'
import FolderIcon from '@/icons/FolderIcon.vue'
import ChevronDownIcon from '@/icons/ChevronDownIcon.vue'
import ChevronLeftIcon from '@/icons/ChevronLeftIcon.vue'

const ui = useUiStore()
const auth = useAuthStore()
const route = useRoute()

// --- Menu data ---------------------------------------------------------
// Comes from /auth/login (auth.menus), already filtered to the active role.
// Two levels: a node with children is a group (toggle — its own uri is
// ignored), a node without is a link. Deeper nesting isn't rendered.
const menuEntries = computed(() => auth.visibleMenus)

// The backend sends no icons — keyed by uri here, generic folder otherwise.
const ICONS_BY_URI = {
    '/': SurveyIcon,
    '/monitoring': ChartIcon,
    '/survey/inquiry': CheckIcon
}
const iconFor = (item) => ICONS_BY_URI[item.uri] ?? FolderIcon

// Sub-pages (e.g. /survey/form) light up the menu entry they belong to.
const currentMenuUri = computed(() => route.meta.menuUri ?? route.path)
const isActive = (item) => item.uri === currentMenuUri.value
const isGroupActive = (group) => group.children.some(isActive)

// --- Viewport tier -----------------------------------------------------
// Two tiers, one breakpoint (Tailwind's default md: = 768px):
//   below md → overlay drawer (ui.isMenuOpen), always full labels
//   md and up → static sidebar; compact or full is purely the user's choice
// Tracked in JS because isCompact combines "which tier" with "did they choose
// to collapse it". MD_BREAKPOINT_PX is shared with SelectInput.vue.
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

// --- Accordion (full sidebar + mobile drawer) --------------------------
// Several groups may be open at once; the one holding the current page opens itself.
const openGroups = ref(new Set())
const toggleGroup = (id) => {
    const next = new Set(openGroups.value)
    next.has(id) ? next.delete(id) : next.add(id)
    openGroups.value = next
}
watch([currentMenuUri, menuEntries], () => {
    const active = menuEntries.value.find(item => item.children.length && isGroupActive(item))
    if (active && !openGroups.value.has(active.id)) toggleGroup(active.id)
}, { immediate: true })

// --- Flyout (compact sidebar) ------------------------------------------
// Teleported to <body>: the <aside> clips overflow and its transform would
// make position:fixed relative to it, so an in-place flyout can't escape it.
const flyoutGroup = ref(null)
const flyoutStyle = ref({})
const flyoutRef = ref(null)

const toggleFlyout = (group, event) => {
    if (flyoutGroup.value?.id === group.id) return closeFlyout()
    const rect = event.currentTarget.getBoundingClientRect()
    flyoutStyle.value = { top: `${rect.top}px`, left: `${rect.right + 8}px` }
    flyoutGroup.value = group
}
const closeFlyout = () => { flyoutGroup.value = null }

const onDocumentClick = (event) => {
    if (!flyoutGroup.value) return
    if (flyoutRef.value?.contains(event.target) || event.target.closest('[data-flyout-trigger]')) return
    closeFlyout()
}
const onKeydown = (event) => { if (event.key === 'Escape') closeFlyout() }

watch([() => route.fullPath, isCompact], closeFlyout)

const onLinkClick = () => {
    closeFlyout()
    ui.closeMenu()
}

onMounted(() => {
    mdQuery = window.matchMedia(`(min-width: ${MD_BREAKPOINT_PX}px)`)
    isMdUp.value = mdQuery.matches
    mdQuery.addEventListener('change', updateMdUp)
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
    mdQuery?.removeEventListener('change', updateMdUp)
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
    <aside :class="[
        ui.isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isCompact ? 'w-[76px]' : 'w-64'
    ]"
        class="fixed inset-y-0 left-0 pt-16 md:pt-3 bg-white border-r border-slate-200/80 z-50 transition-all duration-300 ease-in-out flex flex-col md:static select-none overflow-hidden shrink-0">
        <nav class="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">

            <p v-if="menuEntries.length === 0" :class="isCompact ? 'px-1 text-center text-[11px]' : 'px-4 text-sm'"
                class="py-3 text-slate-400">
                Tidak ada menu.
            </p>

            <template v-for="item in menuEntries" :key="item.id">
                <!-- Link -->
                <RouterLink v-if="item.children.length === 0" :to="item.uri" @click="onLinkClick"
                    :aria-current="isActive(item) ? 'page' : undefined" :class="[
                        isCompact ? 'flex-col gap-1 px-1 text-center' : 'gap-3.5 px-4',
                        isActive(item) ? 'bg-blue-50/70 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    ]" class="group flex items-center py-3 rounded-xl transition-all duration-200">
                    <component :is="iconFor(item)" class="w-5 h-5 shrink-0" />
                    <span :class="isCompact ? 'text-[11px] leading-tight' : 'text-[15px] font-medium'">{{ item.name }}</span>
                </RouterLink>

                <!-- Group: accordion (full / drawer) or flyout trigger (compact) -->
                <div v-else>
                    <button type="button" data-flyout-trigger
                        @click="isCompact ? toggleFlyout(item, $event) : toggleGroup(item.id)"
                        :aria-expanded="isCompact ? flyoutGroup?.id === item.id : openGroups.has(item.id)"
                        :aria-controls="`menu-group-${item.id}`" :class="[
                            isCompact ? 'flex-col gap-1 px-1 text-center' : 'gap-3.5 px-4',
                            isGroupActive(item) ? 'bg-blue-50/40 text-primary' : 'text-slate-700 hover:bg-slate-50'
                        ]" class="relative w-full flex items-center py-3 rounded-xl transition-all duration-200">
                        <component :is="iconFor(item)" class="w-5 h-5 shrink-0" />
                        <span :class="isCompact ? 'text-[11px] leading-tight' : 'flex-1 text-left text-[15px] font-medium'">
                            {{ item.name }}
                        </span>
                        <ChevronDownIcon v-if="!isCompact" :class="{ 'rotate-180': openGroups.has(item.id) }"
                            class="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0" />
                        <span v-else-if="isGroupActive(item)" class="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-primary"
                            aria-hidden="true"></span>
                    </button>

                    <ul v-if="!isCompact && openGroups.has(item.id)" :id="`menu-group-${item.id}`"
                        class="mt-1 ml-6 pl-3 border-l border-slate-200 space-y-0.5">
                        <li v-for="child in item.children" :key="child.id">
                            <RouterLink :to="child.uri" @click="onLinkClick"
                                :aria-current="isActive(child) ? 'page' : undefined"
                                :class="isActive(child) ? 'bg-blue-50/70 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-50'"
                                class="block px-3 py-2.5 rounded-lg text-[14px] transition-colors">
                                {{ child.name }}
                            </RouterLink>
                        </li>
                    </ul>
                </div>
            </template>

        </nav>

        <button @click="toggleCollapsed" type="button"
            :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            class="hidden md:flex items-center justify-center mx-3 mb-3 w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shrink-0 self-start">
            <ChevronLeftIcon :class="{ 'rotate-180': isCollapsed }" class="w-4 h-4 transition-transform duration-200" />
        </button>
    </aside>

    <Teleport to="body">
        <div v-if="flyoutGroup" ref="flyoutRef" :id="`menu-group-${flyoutGroup.id}`" :style="flyoutStyle"
            class="fixed z-[60] w-56 bg-white rounded-xl shadow-lg ring-1 ring-black/5 py-1.5">
            <p class="px-4 pt-1.5 pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{{ flyoutGroup.name }}</p>
            <RouterLink v-for="child in flyoutGroup.children" :key="child.id" :to="child.uri" @click="onLinkClick"
                :aria-current="isActive(child) ? 'page' : undefined"
                :class="isActive(child) ? 'bg-blue-50/70 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50'"
                class="block px-4 py-2 text-sm transition-colors">
                {{ child.name }}
            </RouterLink>
        </div>
    </Teleport>
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
