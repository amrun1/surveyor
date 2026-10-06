import { fetchSurveyorTaskList } from './syncService.js'
import { mapTaskListResponse } from '@/domain/mappers.js'
import { saveTaskCache, getTaskCache } from '@/database/db.js'

const PAGE_SIZE = 100
// Guards against a backend that keeps reporting more pages than it really has.
const MAX_PAGES = 20

// Offline-first read: whatever was last cached for this user, instantly, with
// no network involved. Returns { tasks, fetchedAt } (fetchedAt null = never synced).
export async function loadCachedTasks(userId) {
    if (!userId) return { tasks: [], fetchedAt: null }
    const cached = await getTaskCache(userId)
    return { tasks: cached?.tasks ?? [], fetchedAt: cached?.fetchedAt ?? null }
}

// Pulls the surveyor's *whole* queue (offline use needs every task, not just
// page 1), then replaces the cache, walking pages via the response's pageCount.
// Throws on network failure / non-ok / status:false — the caller keeps showing
// the cached list in that case.
export async function refreshTasks(userId) {
    const tasks = []
    let currentPage = 1
    let pageCount = 1

    do {
        const response = await fetchSurveyorTaskList({
            pagingInfo: { currentPage, pageCount: 0, pageSize: PAGE_SIZE, retrieveAll: false }
        })
        if (!response.ok) {
            const error = new Error(`Task list request failed (${response.status})`)
            error.status = response.status
            throw error
        }
        const page = mapTaskListResponse(await response.json())
        tasks.push(...page.tasks)
        pageCount = page.pageCount
        if (page.tasks.length === 0) break
        currentPage++
    } while (currentPage <= pageCount && currentPage <= MAX_PAGES)

    // A failed cache write shouldn't hide a list the server just returned.
    if (userId) {
        try { await saveTaskCache(userId, tasks) } catch (err) { console.error('Could not cache task list:', err) }
    }
    return { tasks, fetchedAt: Date.now() }
}

// Lookup for SurveyForm.vue: there's no task-detail endpoint yet, so the cached
// list row is the task's detail — which also means opening a task works offline.
export async function getCachedTask(userId, taskId) {
    const { tasks } = await loadCachedTasks(userId)
    return tasks.find(task => String(task.id) === String(taskId)) ?? null
}
