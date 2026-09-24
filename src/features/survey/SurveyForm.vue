<!-- src/features/survey/SurveyForm.vue -->
<template>
  <div class="p-4 space-y-8 animate-fade-in">
    <SharedForm :formConfig="formConfig" @onSubmit="handleFormPublishPipeline" @onDraftChange="handleDraftChange" />
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import SharedForm from '@/components/Form.vue'
import { addRecord, getCachedDropdownOptions, saveDraft, getDraft, deleteDraft } from '@/database/db.js'
import { transformFacilityDropdownOptions } from '@/domain/mappers.js'

const toast = inject('toast')
const router = useRouter()

const formConfig = ref({
  title: 'LPA Internal Appraisal Processing Node',
  
  tabs: [
    { title: '1. Data Umum', fields: ['noOrder', 'nomerLPA', 'cpDitemui', 'namaDebitur', 'jenisObjekOrder', 'jenisObjekFisik', 'lokasiCabang', 'lokasiAgunanFisik', 'namaPerumahan', 'namaCluster', 'blokGangLantai', 'nomorUnit', 'rt', 'rw', 'posisiLokasi', 'kodePos', 'propinsi', 'kabupaten', 'kecamatan', 'desaKelurahan', 'statusJaminan', 'kategoriSLA', 'sla', 'tanggalOrder', 'tanggalSurvey', 'penilaianDitujukanKe', 'ditinjauOleh', 'diantarOleh', 'catatanHasilSurvey', 'mataUang', 'tanggalRate', 'nilaiRate'] },
    { title: '2. Data Tanah', fields: ['shmCertificateNumber', 'luasTanah'] },
    { title: '3. Data Bangunan', fields: ['facilityType', 'tahunKonstruksi'] },
    { title: '4. Data Lingkungan', fields: ['lebarJalan', 'kondisiBanjir'] },
    { title: '5. Nilai Agunan', fields: ['nilaiPasar', 'nilaiLikuidasi'] },
    { title: '6. Marketability', fields: ['marketabilityClass', 'catatanPasar'] },
    { title: '7. Negative List', fields: ['isNearCemetery', 'jarakSUTET'] },
    { title: '8. Data Lampiran', fields: ['propertyFacadePhoto', 'landBlueprints', 'auditLocation'] }
  ],
  
  fields: [
    // Tab 1: Data Umum — matches "Generate LPA Internal Appraisal" screenshot exactly.
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

    { type: 'select', name: 'jenisObjekFisik', label: 'Jenis Object Penilaian (Fisik)', placeholder: '-- Select --', required: true, options: ['Rumah Tinggal', 'Apartemen', 'Ruko/Rukan', 'Gudang'], value: '' },
    { type: 'select', name: 'lokasiCabang', label: 'Lokasi Cabang', placeholder: 'Pilih cabang...', options: ['Jakarta', 'Tangerang', 'Bekasi', 'Surabaya'], value: 'Jakarta' },
    { type: 'textarea', name: 'lokasiAgunanFisik', label: 'Lokasi Agunan (Fisik)', value: 'GIANTARA SERPONG CITY CLUSTER NERIN JALAN NERIN III NO 8 TYPE MAIRA STANDARD' },

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

    // Tab 2: Data Tanah
    { type: 'text', name: 'shmCertificateNumber', label: 'Sertifikat Hak Milik (SHM) Code', placeholder: 'Enter official land book certificate number', required: true },
    { type: 'text', name: 'luasTanah', label: 'Luas Tanah (M2)', placeholder: 'e.g., 120', required: true },

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
    { type: 'camera', name: 'propertyFacadePhoto', label: 'Foto Fasad Utama Exterior Agunan (16:9)', required: true, value: '' },
    { type: 'map', name: 'auditLocation', label: 'Audit Pinpoint Geolocation Telemetry', displayValue: '-6.208840, 106.845580', hidden: false, value: '' },
    { type: 'canvas', name: 'landBlueprints', label: 'Plot Outline Perimeter Blueprint Sketch', required: true, multi: false, value: '' }
  ]
})

// Single draft slot for this form; a real multi-order flow would key this per
// order/ticket (e.g. `survey-draft-${appraisalTicket}`) once orders are dynamic.
const DRAFT_KEY = 'survey-draft-data-umum'

const handleFormPublishPipeline = async (flattenedFormData) => {
  const transactionEnvelope = {
    timestamp: Date.now(),
    status: 'pending',
    payload: flattenedFormData
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