import { ref } from 'vue'
import { getAllRecords, addRecord, deleteRecord } from '@/database/db.js'

const isOnline = ref(navigator.onLine)
const isSyncing = ref(false)

export function useSync() {

    const checkTomcatHeartbeat = async () => {
        if (!navigator.onLine) return false
        const baseUrl = `${import.meta.env.BASE_URL}api/`
        try {
            // 0-byte network footprint verification header call protects cellular usage
            const pingCheck = await fetch(`${baseUrl}lookup/facility-types`, { method: 'HEAD', cache: 'no-store' })
            return pingCheck.ok
        } catch {
            return false
        }
    }

    const flushPendingSyncQueue = async () => {
        if (isSyncing.value) return
        const hasTruePath = await checkTomcatHeartbeat()
        isOnline.value = hasTruePath
        if (!hasTruePath) return

        try {
            const pendingItems = await getAllRecords('syncQueue')
            const targetFlushes = pendingItems.filter(item => item.status === 'pending')
            if (targetFlushes.length === 0) return

            isSyncing.value = true
            const baseUrl = `${import.meta.env.BASE_URL}api/`

            for (const item of targetFlushes) {
                try {
                    const response = await fetch(`${baseUrl}survey/submit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item.payload)
                    })

                    if (response.ok) {
                        await deleteRecord('syncQueue', item.id)
                        item.status = 'synced'
                        await addRecord('syncQueue', { ...item })
                    }
                } catch {
                    console.warn('Tomcat pipeline drop identified during batch transmission loop. Pausing.')
                    break
                }
            }
        } catch (err) {
            console.error('IndexedDB buffer transaction extraction error:', err)
        } finally {
            isSyncing.value = false
        }
    }

    const handleNetworkOnline = async () => {
        const hasPath = await checkTomcatHeartbeat()
        isOnline.value = hasPath
        if (hasPath) await flushPendingSyncQueue()
    }

    const handleNetworkOffline = () => { isOnline.value = false }

    // Called by Login.vue right after a successful sign-in. pending_auth items are
    // deliberately excluded from the normal pending-status flush above — they need
    // an explicit successful login, not just connectivity, since connectivity alone
    // can't confirm the session is actually valid again. This is what "graduates"
    // them back into the normal sync path once that's actually happened.
    const resolvePendingAuthRecords = async () => {
        const items = await getAllRecords('syncQueue')
        const pendingAuthItems = items.filter(item => item.status === 'pending_auth')

        for (const item of pendingAuthItems) {
            await deleteRecord('syncQueue', item.id)
            await addRecord('syncQueue', { ...item, status: 'pending' })
        }

        if (pendingAuthItems.length > 0) await flushPendingSyncQueue()
        return pendingAuthItems.length
    }

    const setupSyncListeners = () => {
        window.addEventListener('online', handleNetworkOnline)
        window.addEventListener('offline', handleNetworkOffline)
    }

    const cleanupSyncListeners = () => {
        window.removeEventListener('online', handleNetworkOnline)
        window.removeEventListener('offline', handleNetworkOffline)
    }

    return { isOnline, isSyncing, checkTomcatHeartbeat, flushPendingSyncQueue, resolvePendingAuthRecords, setupSyncListeners, cleanupSyncListeners }
}