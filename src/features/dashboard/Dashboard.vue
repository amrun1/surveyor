<script setup>
import { ref } from 'vue'
// import { useSync } from '@/composables/useSync.js'

// const title = ref('')
// const { isOnline, saveTask } = useSync()

// const handleSubmit = async () => {
//     await saveTask({
//         title: title.value,
//         timestamp: new Date().toISOString()
//     })
//     title.value = ''
// }
</script>

<template>
    <div class="space-y-6">
        <!-- <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div>
                <h1 class="text-2xl font-bold text-slate-800">Operational Space</h1>
                <p class="text-sm text-slate-500">Standalone subpath data dashboard</p>
            </div>

            <span :style="{ backgroundColor: isOnline ? 'var(--color-secondary)' : 'var(--color-danger)' }"
                class="text-white text-xs px-3 py-1 rounded-full font-semibold shadow-xs">
                {{ isOnline ? 'Tomcat Direct Connected' : 'IndexedDB Local Buffer Active' }}
            </span>
        </div>

        <form @submit.prevent="handleSubmit"
            class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Queue Transaction Heading</label>
                <input v-model="title" type="text" required
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-primary focus:ring-1 focus:ring-primary" />
            </div>
            <button type="submit"
                class="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-xs">
                Submit Record
            </button>
        </form> -->
    </div>
</template>