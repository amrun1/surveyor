<script setup>
import { ref, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import { useUiStore } from '@/store/ui.js'
import HomeIcon from '@/icons/HomeIcon.vue'
import SurveyIcon from '@/icons/SurveyIcon.vue'

const ui = useUiStore()

const activeDropdownName = ref('Home')

// DYNAMIC MENU CONFIGURATION OBJECT
const menuItems = ref([
    {
        name: 'Home',
        routeName: 'dashboard',
        isDropdown: false,
        icon: shallowRef(HomeIcon)
    },
    {
        name: 'Survey',
        isDropdown: true,
        icon: shallowRef(SurveyIcon),
        children: [
            { name: 'Inquiry', routeName: 'inquiry' },
            { name: 'Form', routeName: 'form' }
        ]
    }
])

const handleMenuToggle = (item) => {
    if (activeDropdownName.value === item.name) {
        activeDropdownName.value = null
    } else {
        activeDropdownName.value = item.name
    }
}

const handleFlatLinkClick = () => {
    activeDropdownName.value = null
    ui.closeMenu()
}
</script>

<template>
    <aside :class="ui.isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        class="fixed inset-y-0 left-0 pt-16 lg:pt-0 w-72 bg-white border-r border-slate-200/80 z-30 transition-transform duration-300 ease-in-out flex flex-col lg:static select-none h-screen overflow-hidden">
        <nav class="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">

            <div v-for="(item, index) in menuItems" :key="index">

                <!-- APPROACH A: STANDARD FLAT LINK -->
                <RouterLink v-if="!item.isDropdown" :to="{ name: item.routeName }" @click="handleFlatLinkClick"
                    class="group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
                    active-class="bg-blue-50/70 text-primary font-semibold">
                    <component :is="item.icon" />
                    {{ item.name }}
                </RouterLink>

                <!-- APPROACH B: MUTUALLY EXCLUSIVE COLLAPSIBLE ACCORDION -->
                <div v-else class="space-y-1">
                    <button @click="handleMenuToggle(item)" type="button"
                        class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-semibold text-slate-800 hover:bg-slate-50 transition-all duration-200">
                        <div class="flex items-center gap-3.5">
                            <component :is="item.icon" class="text-slate-600" />
                            <span>{{ item.name }}</span>
                        </div>

                        <!-- Chevron rotates dynamically based on central activeDropdownName evaluation -->
                        <svg :class="{ 'rotate-180': activeDropdownName !== item.name }"
                            class="w-4 h-4 text-slate-500 transition-transform duration-200" fill="none"
                            stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                    </button>

                    <!-- Dropdown Children Loop Frame bound directly to central visibility state -->
                    <div v-show="activeDropdownName === item.name" class="pl-4 pr-1 py-1 space-y-1">
                        <RouterLink v-for="(child, childIndex) in item.children" :key="childIndex"
                            :to="{ name: child.routeName }" @click="ui.closeMenu"
                            class="block px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150"
                            active-class="bg-blue-50/80 text-primary font-semibold">
                            {{ child.name }}
                        </RouterLink>
                    </div>
                </div>

            </div>

        </nav>
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