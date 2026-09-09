<!-- src/components/DynamicTable.vue -->
<template>
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">

        <!-- DYNAMIC CONTROLS SLOTTED CONTROL STRIP -->
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

        <!-- MAIN CORE DATA DATATABLE GRID -->
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse select-none">
                <thead>
                    <tr
                        class="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th v-for="col in headers" :key="col.key" :class="col.class" class="px-6 py-3.5">
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-slate-100 text-[14px]">
                    <!-- EMPTY GRID STATE FRAME MAPPING -->
                    <tr v-if="rows.length === 0">
                        <td :colspan="headers.length"
                            class="px-6 py-10 text-center text-slate-400 font-medium bg-white">
                            {{ emptyMessage || 'No active data log registers located.' }}
                        </td>
                    </tr>

                    <!-- REAL-TIME CELL LOOP RENDERINGS -->
                    <tr v-for="(row, rowIndex) in rows" :key="row.id || rowIndex"
                        class="hover:bg-slate-50/80 transition-colors">
                        <td v-for="col in headers" :key="col.key" class="px-6 py-3.5">
                            <!-- DYNAMIC ENTRY SLOT: Allows caller modules to inject custom structures like badges -->
                            <slot :name="`cell(${col.key})`" :row="row" :value="row[col.key]">
                                <!-- Fallback: Renders raw text parameter if no custom slot is mapped -->
                                {{ row[col.key] }}
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</template>

<script setup>
defineProps({
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    emptyMessage: { type: String, default: '' },
    // Expects array format: [ { key: 'timestamp', label: 'Time' }, { key: 'operator', label: 'Operator' } ]
    headers: { type: Array, required: true },
    // Expects a flat array of row data objects
    rows: { type: Array, required: true }
})
</script>
