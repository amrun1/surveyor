<template>
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div v-if="$slots.header || title"
            class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
                <h2 v-if="title" class="text-lg font-bold text-slate-800">{{ title }}</h2>
                <p v-if="subtitle" class="text-xs text-slate-500 mt-0.5">{{ subtitle }}</p>
            </div>
            <div class="flex items-center gap-2">
                <slot name="header-actions" />
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse select-none">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                        <th v-for="col in headers" :key="col.key" :class="col.class" class="px-6 py-3.5">{{ col.label }}
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-[14px]">
                    <tr v-if="rows.length === 0">
                        <td :colspan="headers.length" class="px-6 py-10 text-center text-slate-400 bg-white">{{
                            emptyMessage || 'No records located.' }}</td>
                    </tr>
                    <tr v-for="(row, rIdx) in rows" :key="row.id || rIdx"
                        class="hover:bg-slate-50/80 transition-colors">
                        <td v-for="col in headers" :key="col.key" class="px-6 py-3.5">
                            <slot :name="`cell(${col.key})`" :row="row" :value="row[col.key]">{{ row[col.key] }}</slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
defineProps({ title: String, subtitle: String, emptyMessage: String, headers: Array, rows: Array })
</script>