<!-- src/features/survey/SurveyForm.vue -->
<template>
  <div class="p-4 space-y-8 animate-fade-in">
    <SharedForm v-if="formConfig" :formConfig="formConfig" @onSubmit="handleFormPublishPipeline"
      @onDraftChange="handleDraftChange" />

    <div v-else-if="unsupportedCategory"
      class="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
      <h1 class="text-lg font-bold text-slate-800">Form belum tersedia</h1>
      <p class="text-sm text-slate-500">
        Form LPA untuk kategori
        <span class="font-semibold text-slate-700">{{ LPA_CATEGORY_LABEL[unsupportedCategory] ?? unsupportedCategory }}</span>
        belum tersedia di aplikasi ini.
      </p>
    </div>

    <p v-else class="text-center text-sm text-slate-400 py-10">Memuat form...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SharedForm from '@/components/Form.vue'
import { addRecord, saveDraft, getDraft, deleteDraft } from '@/database/db.js'
import { useAuthStore } from '@/store/auth.js'
import { getCachedTask } from '@/services/taskService.js'
import { LPA_CATEGORY, LPA_CATEGORY_LABEL, resolveLpaCategory } from '@/domain/lpaCategory.js'
import { buildFormConfig } from './forms/index.js'
import { loadCachedParameterOptions } from '@/services/parameterOptions.js'
import { DATA_UMUM_TASK_PREFILL } from './forms/fragments/dataUmum.js'
import { toPlainValue } from '@/components/inputs/itemList.js'

const toast = inject('toast')
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Built once the task is known (onMounted) — the task's category decides which form.
const formConfig = ref(null)
const unsupportedCategory = ref(null)

// Opened from Tasklist.vue with ?taskId=… → one draft slot per task (Tasklist
// reads the same key for its "Draft tersimpan" badge). Without a taskId, falls
// back to the original single shared slot.
const taskId = route.query.taskId ?? null
const DRAFT_KEY = taskId ? `task-${taskId}` : 'survey-draft-data-umum'

// Which form to build: the task's own category (legacy routing rules, see
// domain/lpaCategory.js). Opened without a task, ?category=<LPA_CATEGORY value>
// (and ?eksternal=true) pick one — Tanah & Bangunan Internal by default.
const resolveFormCategory = (task) => {
  if (task) return resolveLpaCategory(task)
  return {
    category: typeof route.query.category === 'string' ? route.query.category : LPA_CATEGORY.TANAH_BANGUNAN,
    isEksternal: route.query.eksternal === 'true'
  }
}

// Order-derived Data Umum fields come from the cached task row (no task-detail
// endpoint exists yet, so this also works offline).
const prefillFromTask = (task) => {
  Object.entries(DATA_UMUM_TASK_PREFILL).forEach(([fieldName, taskKey]) => {
    const field = formConfig.value.fields.find(f => f.name === fieldName)
    if (field) field.value = task[taskKey] ?? ''
  })
}

// Bypasses the debounce entirely — called by the router guard right before a
// forced redirect to /login, so an expired-token navigation can't lose whatever
// was typed in the last half-second before the debounced autosave would fire.
const flushDraftImmediately = () => {
  if (!formConfig.value) return
  // Arrays/objects (checkboxes, item lists) deep-copied — IndexedDB can't clone a reactive Proxy.
  return saveDraft(DRAFT_KEY, formConfig.value.fields.map(f => ({ name: f.name, value: toPlainValue(f.value) })))
}

onMounted(() => { auth.registerFlushHandler(flushDraftImmediately) })
onUnmounted(() => { auth.unregisterFlushHandler(flushDraftImmediately) })

const handleFormPublishPipeline = async (flattenedFormData) => {
  // Offline submissions are marked pending_auth rather than plain pending —
  // even if the token happens to still look valid right now, there's no way to
  // confirm that without connectivity, and it may well have expired by the time
  // this actually gets a chance to sync. pending_auth requires an explicit
  // successful login to resolve (see resolvePendingAuthRecords in useSync.js),
  // rather than syncing the moment connectivity alone returns.
  const transactionEnvelope = {
    timestamp: Date.now(),
    status: navigator.onLine ? 'pending' : 'pending_auth',
    payload: {
      ...flattenedFormData,
      ...(taskId ? { taskId } : {}),
      lpaCategory: formConfig.value.category,
      isEksternal: formConfig.value.isEksternal
    }
  }

  await addRecord('syncQueue', transactionEnvelope)
  await deleteDraft(DRAFT_KEY) // submitted successfully -> no draft left to restore

  let isBackgroundSyncRegistered = false
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('tomcat-form-flush')
      isBackgroundSyncRegistered = true
    } catch {
      isBackgroundSyncRegistered = false
    }
  }

  if (navigator.onLine && isBackgroundSyncRegistered) {
    toast.success('Appraisal Record Synchronized', `LPA Ticket reference successfully sent to Tomcat.`)
  } else if (transactionEnvelope.status === 'pending_auth') {
    toast.offline('Cached Securely Offline', "Saved locally. You'll need to sign in again before this syncs.")
  } else {
    toast.offline('Cached Securely Offline', 'Data encrypted inside IndexedDB repository. Pending recovery loop flush.')
  }

  formConfig.value.fields.forEach(field => {
    if (!field.autoFilled && field.type !== 'canvas') {
      field.value = Array.isArray(field.value) ? [] : ''
    }
  })

  router.push({ name: 'inquiry' })
}

// Fired (debounced) by Form.vue on every field change, and immediately on the
// "Save draft" tap. Persists straight to IndexedDB — this is the real autosave;
// "Save draft" is now just a way to force an immediate flush + confirmation toast.
const handleDraftChange = async (fieldsSnapshot) => {
  try {
    await saveDraft(DRAFT_KEY, fieldsSnapshot)
  } catch (err) {
    console.error('Draft autosave failed:', err)
  }
}

onMounted(async () => {
  const task = taskId ? await getCachedTask(auth.userId, taskId) : null
  if (taskId && !task) {
    toast.error('Tugas tidak ditemukan', 'Data tugas ini belum tersimpan di perangkat. Buka Task List saat online.')
  }

  const { category, isEksternal } = resolveFormCategory(task)
  // Option lists from the parameter service's offline cache (snapshot fallback).
  await loadCachedParameterOptions()
  const config = buildFormConfig(category, { isEksternal })
  if (!config) {
    unsupportedCategory.value = category
    return
  }
  formConfig.value = config
  if (task) prefillFromTask(task)

  // Restore any in-progress draft from a previous session (autosaved fields only —
  // autoFilled/order-derived fields are never overwritten by a stale draft).
  const draft = await getDraft(DRAFT_KEY)
  if (draft?.fieldsSnapshot?.length) {
    let restoredCount = 0
    draft.fieldsSnapshot.forEach(({ name, value }) => {
      const field = formConfig.value.fields.find(f => f.name === name)
      const hasValue = Array.isArray(value) ? value.length > 0 : !!value
      if (field && !field.autoFilled && hasValue) {
        field.value = value
        restoredCount++
      }
    })
    if (restoredCount > 0) {
      toast.success('Draft Restored', `${restoredCount} field(s) recovered from your last session.`)
    }
  }
})
</script>