<template>
    <div class="rounded-xl border border-slate-200 p-4">
        <p v-if="title" class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">{{ title }}</p>
        <div class="grid grid-cols-3 gap-2.5 items-center">
            <div></div>
            <div class="text-center">
                <label class="text-[10px] font-bold text-slate-400 block mb-1">UTARA</label>
                <input v-model="group.north.value"
                    class="w-full text-center border border-slate-300 rounded-lg py-1.5 px-1 text-sm bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div></div>

            <div class="text-center">
                <label class="text-[10px] font-bold text-slate-400 block mb-1">BARAT</label>
                <input v-model="group.west.value"
                    class="w-full text-center border border-slate-300 rounded-lg py-1.5 px-1 text-sm bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div class="flex items-center justify-center text-slate-300">
                <CrosshairIcon width="26" height="26" stroke-width="1.5" />
            </div>
            <div class="text-center">
                <label class="text-[10px] font-bold text-slate-400 block mb-1">TIMUR</label>
                <input v-model="group.east.value"
                    class="w-full text-center border border-slate-300 rounded-lg py-1.5 px-1 text-sm bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>

            <div></div>
            <div class="text-center">
                <label class="text-[10px] font-bold text-slate-400 block mb-1">SELATAN</label>
                <input v-model="group.south.value"
                    class="w-full text-center border border-slate-300 rounded-lg py-1.5 px-1 text-sm bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div></div>
        </div>
    </div>
</template>

<script setup>
import CrosshairIcon from '@/icons/CrosshairIcon.vue'

defineProps({
    group: { type: Object, required: true }, // { north, south, west, east }
    title: { type: String, default: '' }
})
</script>