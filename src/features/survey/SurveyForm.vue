<!-- src/features/survey/SurveyForm.vue -->
<template>
  <div class="p-4 space-y-8 animate-fade-in">
    <SharedForm :formConfig="formConfig" @onSubmit="handleFormPublishPipeline" @onDraftChange="handleDraftChange" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SharedForm from '@/components/Form.vue'
import { addRecord, getCachedDropdownOptions, saveDraft, getDraft, deleteDraft } from '@/database/db.js'
import { transformFacilityDropdownOptions } from '@/domain/mappers.js'
import { useAuthStore } from '@/store/auth.js'
import { getCachedTask } from '@/services/taskService.js'

const toast = inject('toast')
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formConfig = ref({
  title: 'LPA Internal Appraisal Processing Node',
  // Surveyors fill sections in whatever order they meet them on-site; required
  // fields are enforced on submit only (see Form.vue isFreeNavigation).
  navigation: 'free',
  
  tabs: [
    { title: '1. Data Umum', fields: ['noOrder', 'nomerLPA', 'cpDitemui', 'namaDebitur', 'jenisObjekOrder', 'jenisObjekFisik', 'lokasiCabang', 'lokasiAgunanFisik', 'namaPerumahan', 'namaCluster', 'blokGangLantai', 'nomorUnit', 'rt', 'rw', 'posisiLokasi', 'kodePos', 'propinsi', 'kabupaten', 'kecamatan', 'desaKelurahan', 'statusJaminan', 'kategoriSLA', 'sla', 'tanggalOrder', 'tanggalSurvey', 'penilaianDitujukanKe', 'ditinjauOleh', 'diantarOleh', 'catatanHasilSurvey', 'mataUang', 'tanggalRate', 'nilaiRate'] },
    { title: '2. Data Tanah', fields: ['jenisDokumenTanah', 'nomerDokumenTanah', 'tanggalSertipikat', 'namaJalan', 'blokGangLantaiTanah', 'nomorTanah', 'rtTanah', 'rwTanah', 'desaKelurahanTanah', 'kecamatanTanah', 'kotaKabupatenTanah', 'propinsiTanah', 'namaPemegangHak', 'tanggalBerakhirHak', 'gbrSituasiSuratUkur', 'tanggalSuratUkur', 'luasTanahSesuaiDokumen', 'totalLuasTanahSesuaiDokumen', 'luasTanahTerkenaRencanaJalan', 'luasTanahBersih', 'bentukTanah', 'konturTanah', 'ketinggianDariJalan', 'peruntukanTanah', 'kesesuaianBatasTanah', 'batasUtara', 'batasSelatan', 'batasBarat', 'batasTimur'] },
    { title: '3. Data Bangunan', fields: ['facilityType', 'tahunKonstruksi'] },
    { title: '4. Data Lingkungan', fields: ['lebarJalan', 'kondisiBanjir'] },
    { title: '5. Nilai Agunan', fields: ['nilaiPasar', 'nilaiLikuidasi'] },
    { title: '6. Marketability', fields: ['marketabilityClass', 'catatanPasar'] },
    { title: '7. Negative List', fields: ['isNearCemetery', 'jarakSUTET'] },
    { title: '8. Data Lampiran', fields: ['worksheetRAB', 'catatanHasilReview', 'propertyFacadePhoto', 'landBlueprints', 'auditLocation'] }
  ],
  
  fields: [
    // Tab 1: Data Umum — matches "Generate LPA Internal Appraisal" screenshot exactly.
    // autoFilled: comes from the assigned order, not typed by the surveyor -> rendered
    // in CollapsedInfoCard instead of the editable flow below.
    // pinned: stays visible in the card's collapsed summary row.
    { type: 'text', name: 'noOrder', label: 'No. Order', value: '2025062500106', autoFilled: true, pinned: true },
    { type: 'text', name: 'nomerLPA', label: 'Nomer LPA', value: '', autoFilled: true },
    { type: 'text', name: 'cpDitemui', label: 'CP yang ditemui', value: 'DIRGA', autoFilled: true, pinned: true },
    { type: 'text', name: 'namaDebitur', label: 'Nama Debitur', value: 'LAY SUSANTO', autoFilled: true },
    { type: 'text', name: 'jenisObjekOrder', label: 'Jenis Object Penilaian (Order)', value: 'Rumah Tinggal', autoFilled: true },
    { type: 'text', name: 'propinsi', label: 'Propinsi', value: 'BANTEN', autoFilled: true },
    { type: 'text', name: 'kabupaten', label: 'Kabupaten/Kotamadya', value: 'TANGERANG', autoFilled: true },
    { type: 'text', name: 'kecamatan', label: 'Kecamatan', value: 'CISAUK', autoFilled: true },
    { type: 'text', name: 'desaKelurahan', label: 'Desa/Kelurahan', value: 'CISAUK', autoFilled: true },
    { type: 'text', name: 'kategoriSLA', label: 'Kategori SLA Agunan', value: '', autoFilled: true },
    { type: 'text', name: 'sla', label: 'SLA', value: '0', autoFilled: true },
    { type: 'text', name: 'tanggalOrder', label: 'Tanggal Order', value: '25-06-2025', autoFilled: true },

    // Editable fields the surveyor actually fills in or confirms on-site.
    { type: 'select', name: 'jenisObjekFisik', label: 'Jenis Object Penilaian (Fisik)', placeholder: '-- Select --', required: true, options: ['Rumah Tinggal', 'Apartemen', 'Ruko/Rukan', 'Gudang'], value: '' },
    { type: 'select', name: 'lokasiCabang', label: 'Lokasi Cabang', placeholder: 'Pilih cabang...', options: ['Jakarta', 'Tangerang', 'Bekasi', 'Surabaya'], value: 'Jakarta' },
    { type: 'textarea', name: 'lokasiAgunanFisik', label: 'Lokasi Agunan (Fisik)', value: 'GIANTARA SERPONG CITY CLUSTER NERIN JALAN NERIN III NO 8 TYPE MAIRA STANDARD' },

    // Only relevant for apartment/tower-type properties — hidden otherwise.
    { type: 'text', name: 'namaPerumahan', label: 'Nama Perumahan/Apartment', value: '', visibleIf: { field: 'jenisObjekFisik', value: 'Apartemen' } },
    { type: 'text', name: 'namaCluster', label: 'Nama Cluster/Tower', value: '', visibleIf: { field: 'jenisObjekFisik', value: 'Apartemen' } },

    { type: 'text', name: 'blokGangLantai', label: 'Blok/Gang/Lantai', value: 'NERIN III NO 8 TYPE MAIRA STANDARD' },
    { type: 'text', name: 'nomorUnit', label: 'Nomor', inputmode: 'numeric', value: '' },
    { type: 'text', name: 'rt', label: 'RT', inputmode: 'numeric', value: '' },
    { type: 'text', name: 'rw', label: 'RW', inputmode: 'numeric', value: '' },
    { type: 'select', name: 'posisiLokasi', label: 'Posisi Lokasi Agunan', placeholder: '-- Select --', required: true, options: ['Dalam Kota', 'Luar Kota', 'Pinggir Kota'], value: '' },
    { type: 'text', name: 'kodePos', label: 'Kode Pos', inputmode: 'numeric', value: '15341' },
    { type: 'select', name: 'statusJaminan', label: 'Status Jaminan', options: ['Baru', 'Existing'], value: 'Baru' },
    { type: 'text', name: 'tanggalSurvey', label: 'Tanggal Survey', inputType: 'date', required: true, value: '' },
    { type: 'text', name: 'penilaianDitujukanKe', label: 'Penilaian ditujukan ke', value: 'Cici Dwi Astuti' },
    { type: 'select', name: 'ditinjauOleh', label: 'Ditinjau Oleh', options: ['Achmad MasNullud', 'Dwinofeli Agustiawan', 'Fani Yofrisa Ismar'], value: 'Achmad MasNullud' },
    { type: 'text', name: 'diantarOleh', label: 'Diantar/Ditemui Oleh', value: '' },
    { type: 'text', name: 'catatanHasilSurvey', label: 'Catatan Hasil Survey', value: '' },
    { type: 'select', name: 'mataUang', label: 'Mata Uang', options: ['IDR', 'USD'], value: 'IDR' },
    { type: 'text', name: 'tanggalRate', label: 'Tanggal Rate', inputType: 'date', value: '2025-06-26' },
    { type: 'text', name: 'nilaiRate', label: 'Nilai Rate', inputmode: 'decimal', value: '1' },

    // Tab 2: Data Tanah — matches the "Generate LPA Internal Appraisal" Data Tanah
    // screenshot, grouped into the same four sections the source design already uses.
    { type: 'select', name: 'jenisDokumenTanah', label: 'Jenis Dokumen', section: 'Data Dokumen Tanah', options: ['Surat Pesanan', 'Sertifikat', 'AJB', 'Girik'], value: 'Surat Pesanan' },
    { type: 'text', name: 'nomerDokumenTanah', label: 'Nomer Dokumen', section: 'Data Dokumen Tanah', value: 'SPR20230901_112454' },
    { type: 'text', name: 'tanggalSertipikat', label: 'Tanggal Sertipikat', section: 'Data Dokumen Tanah', inputType: 'date', computed: true, value: '' },
    { type: 'text', name: 'namaJalan', label: 'Nama Jalan', section: 'Data Dokumen Tanah', value: 'GIANTARA SERPONG CITY CLUSTER NERIN' },
    { type: 'text', name: 'blokGangLantaiTanah', label: 'Block/Gang/Lantai', section: 'Data Dokumen Tanah', value: 'JALAN NERIN III NO 8 TYPE MAIRA STANDARD' },
    { type: 'text', name: 'nomorTanah', label: 'Nomor', section: 'Data Dokumen Tanah', value: '' },
    { type: 'text', name: 'rtTanah', label: 'RT', section: 'Data Dokumen Tanah', inputmode: 'numeric', value: '' },
    { type: 'text', name: 'rwTanah', label: 'RW', section: 'Data Dokumen Tanah', inputmode: 'numeric', value: '' },
    { type: 'text', name: 'desaKelurahanTanah', label: 'Desa/Kelurahan', section: 'Data Dokumen Tanah', value: 'CISAUK' },
    { type: 'text', name: 'kecamatanTanah', label: 'Kecamatan', section: 'Data Dokumen Tanah', value: 'CISAUK' },
    { type: 'text', name: 'kotaKabupatenTanah', label: 'Kota/Kabupaten', section: 'Data Dokumen Tanah', value: 'TANGERANG' },
    { type: 'text', name: 'propinsiTanah', label: 'Propinsi', section: 'Data Dokumen Tanah', value: 'BANTEN' },
    { type: 'text', name: 'namaPemegangHak', label: 'Nama Pemegang Hak', section: 'Data Dokumen Tanah', value: '' },
    { type: 'text', name: 'tanggalBerakhirHak', label: 'Tanggal Berakhir Hak', section: 'Data Dokumen Tanah', inputType: 'date', computed: true, value: '' },
    { type: 'text', name: 'gbrSituasiSuratUkur', label: 'Gbr Situasi/Surat Ukur', section: 'Data Dokumen Tanah', value: '' },
    { type: 'text', name: 'tanggalSuratUkur', label: 'Tanggal Surat Ukur', section: 'Data Dokumen Tanah', inputType: 'date', computed: true, value: '' },
    { type: 'text', name: 'luasTanahSesuaiDokumen', label: 'Luas Tanah Sesuai Dokumen', section: 'Data Dokumen Tanah', inputmode: 'decimal', value: '' },

    // "Lampiran Data Dokumen Tanah Lainnya" (repeatable attachment table) isn't built
    // as a dynamic add/remove list yet — the screenshot's own rollups follow directly.
    { type: 'text', name: 'totalLuasTanahSesuaiDokumen', label: 'Total Luas Tanah Sesuai Dokumen', section: 'Lampiran Data Dokumen Tanah Lainnya', computed: true, value: '0.0' },
    { type: 'text', name: 'luasTanahTerkenaRencanaJalan', label: 'Luas Tanah Terkena Rencana Jalan', section: 'Lampiran Data Dokumen Tanah Lainnya', inputmode: 'decimal', value: '' },
    { type: 'text', name: 'luasTanahBersih', label: 'Luas Tanah Bersih', section: 'Lampiran Data Dokumen Tanah Lainnya', computed: true, value: '' },

    { type: 'select', name: 'bentukTanah', label: 'Bentuk Tanah', section: 'Data Fisik', placeholder: '-- Select --', options: ['Persegi', 'Persegi Panjang', 'Trapesium', 'Tidak Beraturan'], value: '' },
    { type: 'select', name: 'konturTanah', label: 'Kontur Tanah', section: 'Data Fisik', placeholder: '-- Select --', options: ['Datar', 'Berbukit', 'Miring'], value: '' },
    { type: 'select', name: 'ketinggianDariJalan', label: 'Ketinggian dari Jalan', section: 'Data Fisik', placeholder: '-- Select --', options: ['Lebih Tinggi', 'Sama Rata', 'Lebih Rendah'], value: '' },
    { type: 'select', name: 'peruntukanTanah', label: 'Peruntukan', section: 'Data Fisik', placeholder: '-- Select --', options: ['Perumahan', 'Komersial', 'Industri', 'Campuran'], value: '' },
    { type: 'select', name: 'kesesuaianBatasTanah', label: 'Kesesuaian Batas Tanah', section: 'Data Fisik', placeholder: '-- Select --', options: ['Sesuai', 'Tidak Sesuai'], value: '' },

    { type: 'text', name: 'batasUtara', label: 'Utara', section: 'Batas Tanah', layout: 'compass', compassGroup: 'batasTanah', compassRole: 'north', value: '' },
    { type: 'text', name: 'batasSelatan', label: 'Selatan', section: 'Batas Tanah', layout: 'compass', compassGroup: 'batasTanah', compassRole: 'south', value: '' },
    { type: 'text', name: 'batasBarat', label: 'Barat', section: 'Batas Tanah', layout: 'compass', compassGroup: 'batasTanah', compassRole: 'west', value: '' },
    { type: 'text', name: 'batasTimur', label: 'Timur', section: 'Batas Tanah', layout: 'compass', compassGroup: 'batasTanah', compassRole: 'east', value: '' },

    // Tab 3: Data Bangunan
    { type: 'select', name: 'facilityType', label: 'Jenis Objek Penilaian (Fisik)', placeholder: 'Select architectural class...', required: true, options: [], value: '' },
    { type: 'text', name: 'tahunKonstruksi', label: 'Tahun Konstruksi Bangunan', placeholder: 'e.g., 2018', required: true },

    // Tab 4: Data Lingkungan
    { type: 'text', name: 'lebarJalan', label: 'Lebar Jalan Depan Aset (Meter)', placeholder: 'e.g., 6', required: true },
    { type: 'select', name: 'kondisiBanjir', label: 'Status Bebas Potensi Banjir', placeholder: 'Pilih status...', required: true, options: ['Bebas Banjir', 'Rawan Banjir Seasonal', 'Pernah Banjir ( < 5 Tahun)'], value: '' },

    // Tab 5: Nilai Agunan
    { type: 'text', name: 'nilaiPasar', label: 'Estimasi Nilai Pasar Properti (IDR)', placeholder: 'e.g., 1500000000', required: true },
    { type: 'text', name: 'nilaiLikuidasi', label: 'Estimasi Nilai Likuidasi Bank (IDR)', placeholder: 'e.g., 1050000000', required: true },

    // Tab 6: Marketability & Catatan
    { type: 'select', name: 'marketabilityClass', label: 'Tingkat Marketability Agunan', placeholder: 'Pilih kelas...', required: true, options: ['Tinggi / Sangat Likuid', 'Sedang / Normal Market', 'Rendah / Penjualan Terbatas'], value: '' },
    { type: 'textarea', name: 'catatanPasar', label: 'Catatan & Analisis Dinamika Pasar Lokal', placeholder: 'Ketik observasi perkembangan harga properti sekitar...', required: false, value: '' },

    // Tab 7: Negative List & Pertimbangan Khusus
    { type: 'select', name: 'isNearCemetery', label: 'Dekat dengan Makam / Kuburan ( < 50m)', placeholder: 'Pilih...', required: true, options: ['Tidak', 'Ya / Menempel'], value: '' },
    { type: 'text', name: 'jarakSUTET', label: 'Jarak Aman ke Jaringan SUTET (Meter)', placeholder: 'Ketik 0 jika tidak ada SUTET', required: true },

    // Tab 8: Data Lampiran (Heavy Media Inputs)
    { type: 'attachment', name: 'worksheetRAB', label: 'Worksheet RAB', value: '' },
    { type: 'attachment', name: 'catatanHasilReview', label: 'Catatan Hasil Review', value: '' },
    { type: 'camera', name: 'propertyFacadePhoto', label: 'Foto Fasad Utama Exterior Agunan (16:9)', required: true, value: '' },
    { type: 'map', name: 'auditLocation', label: 'Audit Pinpoint Geolocation Telemetry', displayValue: '-6.208840, 106.845580', hidden: false, value: '' },
    { type: 'canvas', name: 'landBlueprints', label: 'Plot Outline Perimeter Blueprint Sketch', required: true, multi: false, value: '' }
  ]
})

// Opened from Tasklist.vue with ?taskId=… → one draft slot per task (Tasklist
// reads the same key for its "Draft tersimpan" badge). Without a taskId, falls
// back to the original single shared slot.
const taskId = route.query.taskId ?? null
const DRAFT_KEY = taskId ? `task-${taskId}` : 'survey-draft-data-umum'

// Cached task field → autoFilled form field. No task-detail endpoint exists yet,
// so the cached /app-surveyor/find row is the only source (and works offline).
const TASK_PREFILL = {
  noOrder: 'orderNo',
  namaDebitur: 'debtorName',
  jenisObjekOrder: 'assetType',
  propinsi: 'province',
  kabupaten: 'city',
  kecamatan: 'district',
  desaKelurahan: 'village'
}

const prefillFromTask = async () => {
  if (!taskId) return
  const task = await getCachedTask(auth.userId, taskId)
  if (!task) {
    toast.error('Tugas tidak ditemukan', 'Data tugas ini belum tersimpan di perangkat. Buka Task List saat online.')
    return
  }
  Object.entries(TASK_PREFILL).forEach(([fieldName, taskKey]) => {
    const field = formConfig.value.fields.find(f => f.name === fieldName)
    if (field) field.value = task[taskKey] ?? ''
  })
}

// Bypasses the debounce entirely — called by the router guard right before a
// forced redirect to /login, so an expired-token navigation can't lose whatever
// was typed in the last half-second before the debounced autosave would fire.
const flushDraftImmediately = () =>
  saveDraft(DRAFT_KEY, formConfig.value.fields.map(f => ({ name: f.name, value: f.value })))

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
    payload: taskId ? { ...flattenedFormData, taskId } : flattenedFormData
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
      field.value = ''
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
  await prefillFromTask()

  const cachedClassifications = await getCachedDropdownOptions('facilityTypesList')
  const classificationField = formConfig.value.fields.find(f => f.name === 'facilityType')
  if (classificationField && cachedClassifications) {
    classificationField.options = transformFacilityDropdownOptions(cachedClassifications)
  }

  // Restore any in-progress draft from a previous session (autosaved fields only —
  // autoFilled/order-derived fields are never overwritten by a stale draft).
  const draft = await getDraft(DRAFT_KEY)
  if (draft?.fieldsSnapshot?.length) {
    let restoredCount = 0
    draft.fieldsSnapshot.forEach(({ name, value }) => {
      const field = formConfig.value.fields.find(f => f.name === name)
      if (field && !field.autoFilled && value) {
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