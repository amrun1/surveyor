<!-- src/features/task/Tasklist.vue -->
<template>
    <div class="space-y-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <h1 class="text-xl font-bold text-slate-800">Task List</h1>
                    <p class="text-xs text-slate-500 mt-1">
                        {{ fetchedAt ? `Diperbarui ${formatTime(fetchedAt)}` : 'Belum pernah disinkronkan' }}
                        <span v-if="tasks.length"> · {{ tasks.length }} tugas</span>
                    </p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <span v-if="!isOnline"
                        class="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                        Offline
                    </span>
                    <span v-else-if="refreshError" :title="refreshError"
                        class="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                        Gagal memuat
                    </span>
                    <button type="button" @click="refresh" :disabled="isRefreshing || !isOnline"
                        class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        aria-label="Muat ulang">
                        <svg :class="{ 'animate-spin': isRefreshing }" class="w-4 h-4" fill="none" stroke="currentColor"
                            stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            <p v-if="refreshError" class="text-xs text-red-600">{{ refreshError }}</p>

            <input v-model="search" type="search" placeholder="Cari no. order, debitur, atau lokasi..."
                class="w-full text-base px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary" />
        </div>

        <div v-if="isLoadingCache" class="text-center text-sm text-slate-400 py-10">Memuat...</div>

        <template v-else>
            <!-- Below md: tappable cards -->
            <div class="space-y-3 md:hidden">
                <p v-if="filteredTasks.length === 0" class="text-center text-sm text-slate-400 py-10 bg-white rounded-xl border border-slate-200">
                    {{ emptyMessage }}
                </p>
                <button v-for="task in mobileTasks" :key="task.id" type="button" @click="openTask(task)"
                    class="w-full text-left bg-white p-4 rounded-xl border border-slate-200 shadow-xs active:bg-slate-50">
                    <div class="flex items-center justify-between gap-2">
                        <span class="font-mono text-xs text-slate-500">{{ task.orderNo }}</span>
                        <span v-if="draftTaskIds.has(String(task.id))"
                            class="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-primary border border-blue-200 rounded-full">
                            Draft tersimpan
                        </span>
                    </div>
                    <p class="font-semibold text-slate-800 mt-1">{{ task.debtorName }}</p>
                    <p class="text-sm text-slate-600">{{ task.assetType }} · {{ task.reportType }}</p>
                    <p class="text-xs text-slate-500 mt-1">{{ task.location }}</p>
                </button>

                <!-- Scrolling near this appends the next batch; the button is the explicit fallback. -->
                <template v-if="remainingCount > 0">
                    <div ref="loadMoreSentinel" aria-hidden="true"></div>
                    <button type="button" @click="showMore"
                        class="w-full py-3 text-sm font-semibold text-primary bg-white rounded-xl border border-slate-200 active:bg-slate-50">
                        Tampilkan lebih banyak ({{ remainingCount }} lagi)
                    </button>
                </template>
                <p v-else-if="filteredTasks.length > PAGE_SIZE" class="text-center text-xs text-slate-400 py-2">
                    Semua {{ filteredTasks.length }} tugas ditampilkan
                </p>
            </div>

            <!-- md and up: table -->
            <div class="hidden md:block">
                <GlobalTable :headers="tableHeaders" :rows="pagedTasks" :emptyMessage="emptyMessage">
                    <template #cell(orderNo)="{ row, value }">
                        <span class="font-mono text-xs text-slate-600">{{ value }}</span>
                        <span v-if="draftTaskIds.has(String(row.id))"
                            class="ml-2 text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-primary border border-blue-200 rounded-full">
                            Draft
                        </span>
                    </template>
                    <template #cell(action)="{ row }">
                        <button type="button" @click="openTask(row)"
                            class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:opacity-90">
                            Buka
                        </button>
                    </template>
                    <template v-if="filteredTasks.length > PAGE_SIZE" #footer>
                        <Pagination v-model:page="page" :pageSize="PAGE_SIZE" :total="filteredTasks.length" />
                    </template>
                </GlobalTable>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GlobalTable from '@/components/Table.vue'
import Pagination from '@/components/Pagination.vue'
import { useAuthStore } from '@/store/auth.js'
import { useSync } from '@/composables/useSync.js'
import { loadCachedTasks, refreshTasks } from '@/services/taskService.js'
import { getDraft } from '@/database/db.js'

const router = useRouter()
const auth = useAuthStore()
const { isOnline } = useSync()

const tasks = ref([])
const fetchedAt = ref(null)
const isLoadingCache = ref(true)
const isRefreshing = ref(false)
const refreshError = ref('')
const search = ref('')
let isFreshFromServer = false
const draftTaskIds = ref(new Set())

const tableHeaders = [
    { key: 'orderNo', label: 'No. Order' },
    { key: 'debtorName', label: 'Debitur' },
    { key: 'assetType', label: 'Jenis Aktiva' },
    { key: 'reportType', label: 'Laporan' },
    { key: 'location', label: 'Lokasi' },
    { key: 'action', label: '' }
]

const filteredTasks = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return tasks.value
    return tasks.value.filter(task =>
        [task.orderNo, task.debtorName, task.location, task.assetType]
            .some(value => String(value).toLowerCase().includes(q))
    )
})

// Pagination is client-side over the full cached list — paging the server
// instead would leave unfetched pages empty when offline, and search would only
// see the current page.
const PAGE_SIZE = 10

// md and up: numbered pages.
const page = ref(1)
const pagedTasks = computed(() => filteredTasks.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// Below md: one growing list ("load more" on scroll) — page-number buttons are
// poor tap targets, and people scroll/search on a phone rather than jump to page 4.
const visibleCount = ref(PAGE_SIZE)
const mobileTasks = computed(() => filteredTasks.value.slice(0, visibleCount.value))
const remainingCount = computed(() => Math.max(0, filteredTasks.value.length - visibleCount.value))
const showMore = () => { visibleCount.value += PAGE_SIZE }

// New search or refreshed list → rows shifted, start from the top again.
watch([search, tasks], () => {
    page.value = 1
    visibleCount.value = PAGE_SIZE
})

const loadMoreSentinel = ref(null)
let loadMoreObserver = null
// The sentinel only exists while there's more to show, so (re)observe whenever it mounts.
watch(loadMoreSentinel, (el, oldEl) => {
    if (oldEl) loadMoreObserver?.unobserve(oldEl)
    if (el) loadMoreObserver?.observe(el)
})

const emptyMessage = computed(() => {
    if (search.value.trim()) return 'Tidak ada tugas yang cocok.'
    if (!fetchedAt.value && !isOnline.value) return 'Belum ada data tersimpan. Hubungkan ke internet untuk memuat tugas.'
    return 'Tidak ada tugas.'
})

const formatTime = (ts) => new Date(ts).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

// Draft keys match SurveyForm.vue's per-task key.
const loadDraftBadges = async () => {
    const ids = await Promise.all(tasks.value.map(async task =>
        (await getDraft(`task-${task.id}`)) ? String(task.id) : null
    ))
    draftTaskIds.value = new Set(ids.filter(Boolean))
}

const refresh = async () => {
    if (isRefreshing.value || !navigator.onLine) return
    isRefreshing.value = true
    try {
        const result = await refreshTasks(auth.userId)
        tasks.value = result.tasks
        fetchedAt.value = result.fetchedAt
        isFreshFromServer = true
        isLoadingCache.value = false
        refreshError.value = ''
        await loadDraftBadges()
    } catch (err) {
        // Network drop, 401 (api.js already cleared the session), or status:false —
        // either way the cached list stays on screen.
        console.warn('Task list refresh failed, keeping cached list:', err)
        refreshError.value = err.status === 401
            ? 'Sesi berakhir — silakan login ulang.'
            : `Gagal memuat tugas: ${err.message}`
    } finally {
        isRefreshing.value = false
    }
}

const openTask = (task) => router.push({ name: 'form', query: { taskId: task.id } })

const handleOnline = () => refresh()
const handleVisibility = () => { if (document.visibilityState === 'visible') refresh() }

onMounted(async () => {
    if ('IntersectionObserver' in window) {
        loadMoreObserver = new IntersectionObserver(
            entries => { if (entries.some(e => e.isIntersecting)) showMore() },
            { rootMargin: '200px' }
        )
    }

    window.addEventListener('online', handleOnline)
    document.addEventListener('visibilitychange', handleVisibility)

    // Server revalidation runs regardless of whether the cache read below
    // succeeds — a broken/blocked IndexedDB must never stop the list loading.
    refresh()

    // Cache first — renders instantly, works with no signal. Skipped if the
    // network already answered (fetchedAt set) so stale rows never overwrite fresh ones.
    try {
        const cached = await loadCachedTasks(auth.userId)
        if (!isFreshFromServer) {
            tasks.value = cached.tasks
            fetchedAt.value = cached.fetchedAt
            await loadDraftBadges()
        }
    } catch (err) {
        console.error('Could not read cached task list:', err)
    } finally {
        isLoadingCache.value = false
    }

})

onUnmounted(() => {
    loadMoreObserver?.disconnect()
    window.removeEventListener('online', handleOnline)
    document.removeEventListener('visibilitychange', handleVisibility)
})
</script>
