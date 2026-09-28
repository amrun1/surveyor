<template>
    <div class="space-y-4 animate-fade-in">

        <!-- RENDER GENERIC ABSTRACT TABLE COMPONENT -->
        <GlobalTable title="Appraisal Submission Logs" subtitle="Device queue registry mappings"
            emptyMessage="No historical submission logs detected on this device workspace." :headers="tableHeaders"
            :rows="flattenedLogList">
            <!-- HEADER INTERACTION SLOT ACTION ROW -->
            <template #header-actions>
                <!-- Dynamic Sync Spinner indicator bound directly to the global useSync composable state -->
                <span v-if="isSyncing"
                    class="text-xs font-bold text-primary flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl animate-pulse">
                    <div class="w-3 h-3 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
                    Syncing to Tomcat...
                </span>

                <span
                    class="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
                    Total Logs: {{ flattenedLogList.length }}
                </span>
            </template>

            <!-- CUSTOM CELL INTERCEPTION A: TIMESTAMP FORMATTING -->
            <template #cell(formattedTime)="{ value }">
                <span class="font-mono text-xs text-slate-600">{{ value }}</span>
            </template>

            <!-- CUSTOM CELL INTERCEPTION B: STATUS BADGE MAPPING -->
            <template #cell(status)="{ value }">
                <span :class="statusBadgeClass(value)"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-2xs">
                    <!-- Small status dot decoration inside badge box -->
                    <span :class="statusDotClass(value)" class="w-1.5 h-1.5 rounded-full"></span>
                    {{ statusLabel(value) }}
                </span>
            </template>

        </GlobalTable>

    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import GlobalTable from '@/components/Table.vue'
import { useSync } from '@/composables/useSync.js'
import { getAllRecords } from '@/database/db.js'
import { transformSubmissionHistoryLogs } from '@/domain/mappers.js'

// ============================================================================
// 1. CONFIGURATIONS & STATE REGISTRIES
// ============================================================================
const { isSyncing } = useSync()
const flattenedLogList = ref([])

// Column meta definitions matching Table.vue headers loop contract map
const tableHeaders = ref([
    { key: 'formattedTime', label: 'Timestamp' },
    { key: 'operator', label: 'Surveyor ID' },
    { key: 'facilityType', label: 'Asset Class' },
    { key: 'status', label: 'Sync Status' }
])

// ============================================================================
// 2. CORE STORAGE READ OPERATIONS LAYER
// ============================================================================
const STATUS_META = {
    pending: { label: 'Pending Sync', badge: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500' },
    pending_auth: { label: 'Needs Sign-in', badge: 'bg-red-50 text-red-700 border-red-200/60', dot: 'bg-red-500' },
    synced: { label: 'Synced', badge: 'bg-teal-50 text-teal-700 border-teal-200/60', dot: 'bg-teal-500' }
}
const statusLabel = (value) => STATUS_META[value]?.label ?? value
const statusBadgeClass = (value) => STATUS_META[value]?.badge ?? STATUS_META.pending.badge
const statusDotClass = (value) => STATUS_META[value]?.dot ?? STATUS_META.pending.dot

/**
 * Pulls raw data out of IndexedDB and maps it through our Anti-Corruption 
 * domain transformer script to ensure clean table bindings.
 */
const loadSubmissionLogs = async () => {
    try {
        const cachedItems = await getAllRecords('syncQueue')

        // 🛠️ DATA SERVICE DOMAIN MAPPER REFACTOR FIX:
        // Transforms payload structures cleanly before handing over to display loops
        flattenedLogList.value = transformSubmissionHistoryLogs(cachedItems)
    } catch (err) {
        console.error('Failed to parse queue log records matrix:', err)
    }
}

// ============================================================================
// 3. REACTIVE STATE WATCHERS & INITIAL LIFECYCLES
// ============================================================================
/**
 * Automatically triggers a full UI log table re-query the exact millisecond 
 * the background worker completes its batch synchronization task.
 */
watch(isSyncing, (syncingInProgress) => {
    if (!syncingInProgress) {
        loadSubmissionLogs()
    }
})

onMounted(() => {
    loadSubmissionLogs()
})
</script>