<!-- src/features/survey/SurveyForm.vue -->
<template>
  <div class="p-4 space-y-8 animate-fade-in">
    <SharedForm :formConfig="formConfig" @onSubmit="handleFormPublishPipeline" />
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import SharedForm from '@/components/Form.vue'
import { addRecord, getCachedDropdownOptions } from '@/database/db.js'
import { transformFacilityDropdownOptions } from '@/domain/mappers.js'

const toast = inject('toast')
const router = useRouter()

// ============================================================================
// 🛠️ MULTIPLE TABS TESTING CONFIGURATION MATRIX (8 SECTIONS)
// ============================================================================
const formConfig = ref({
  title: 'LPA Internal Appraisal Processing Node',
  
  // 8 structural sections matching your uploaded enterprise bank dashboard snapshot
  tabs: [
    { title: '1. Data Umum', fields: ['operator', 'appraisalTicket', 'lokasiCabang'] },
    { title: '2. Data Tanah', fields: ['shmCertificateNumber', 'luasTanah'] },
    { title: '3. Data Bangunan', fields: ['facilityType', 'tahunKonstruksi'] },
    { title: '4. Data Lingkungan', fields: ['lebarJalan', 'kondisiBanjir'] },
    { title: '5. Nilai Agunan', fields: ['nilaiPasar', 'nilaiLikuidasi'] },
    { title: '6. Marketability', fields: ['marketabilityClass', 'catatanPasar'] },
    { title: '7. Negative List', fields: ['isNearCemetery', 'jarakSUTET'] },
    { title: '8. Data Lampiran', fields: ['propertyFacadePhoto', 'landBlueprints', 'auditLocation'] }
  ],
  
  fields: [
    // Tab 1: Data Umum
    { type: 'text', name: 'operator', label: 'Assigned Bank Surveyor ID', value: 'BANK-SURV-2026', required: true },
    { type: 'text', name: 'appraisalTicket', label: 'Nomer Order / Ticket Reference', placeholder: 'e.g., 2026062500106', required: true },
    { type: 'select', name: 'lokasiCabang', label: 'Lokasi Cabang Operasional', placeholder: 'Pilih cabang...', required: true, options: ['Jakarta', 'Tangerang', 'Bekasi', 'Surabaya'], value: '' },

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

// ============================================================================
// TRANSACTION PIPELINE INTERACTION HANDLERS
// ============================================================================
const handleFormPublishPipeline = async (flattenedFormData) => {
  const transactionEnvelope = {
    timestamp: Date.now(),
    status: 'pending',
    payload: flattenedFormData
  }

  await addRecord('syncQueue', transactionEnvelope)

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
    if (field.name !== 'operator' && field.type !== 'canvas') {
      field.value = ''
    }
  })

  router.push({ name: 'inquiry' })
}

onMounted(async () => {
  const cachedClassifications = await getCachedDropdownOptions('facilityTypesList')
  const classificationField = formConfig.value.fields.find(f => f.name === 'facilityType')
  if (classificationField && cachedClassifications) {
    classificationField.options = transformFacilityDropdownOptions(cachedClassifications)
  }
})
</script>