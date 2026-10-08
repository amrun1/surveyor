// Data Umum — legacy lpa/form-umum.jsp, shared by every category except RV/BV
// (which have their own Data Umum; see their category files). Paths are the real
// JSP/DTO paths from the lpa-forms skill reference (fields-shared.md).
// Readonly-in-the-JSP fields come from the order → `autoFilled` (info card, not
// typed); the ones the cached task row carries are prefilled via DATA_UMUM_TASK_PREFILL.

// Cached task field (domain/mappers.js mapTaskListResponse) → autoFilled form field.
// No task-detail endpoint exists yet, so the cached /app-surveyor/find row is the
// only source (and works offline). Shared by RV/BV's own Data Umum where names match.
export const DATA_UMUM_TASK_PREFILL = {
  orderNumber: 'orderNo',
  namaDebitur: 'debtorName',
  jenisObjectPenilain: 'assetType',
  propinsi: 'province',
  kota: 'city',
  kecamatan: 'district',
  kelurahan: 'village'
}

/**
 * @param {{ isEksternal?: boolean, lokasiLabel?: string, objekFisikKey?: string }} options
 *   lokasiLabel — Stock/Inspeksi call lokasiFisik "Alamat Tempat Penyimpanan".
 *   objekFisikKey — parameter group for Jenis Object Penilaian (Fisik); Kendaraan
 *                   has its own (JENIS_PENILAIAN_FISIK_KENDARAAN).
 */
export function dataUmumTab({ isEksternal = false, lokasiLabel = 'Lokasi Agunan (Fisik)', objekFisikKey = 'JENIS_PENILAIAN_FISIK' } = {}) {
  const fields = [
    // From the order (readonly in the legacy form)
    { type: 'text', name: 'orderNumber', label: 'No. Order', autoFilled: true, pinned: true },
    // Nomer LPA: editable only for Eksternal orders
    isEksternal
      ? { type: 'text', name: 'lpaNumber', label: 'Nomer LPA', section: 'Data Order' }
      : { type: 'text', name: 'lpaNumber', label: 'Nomer LPA', autoFilled: true },
    { type: 'text', name: 'contactPerson', label: 'CP yang ditemui', autoFilled: true, pinned: true },
    { type: 'text', name: 'namaDebitur', label: 'Nama Debitur', autoFilled: true },
    { type: 'text', name: 'jenisObjectPenilain', label: 'Jenis Object Penilaian (Order)', autoFilled: true },
    { type: 'text', name: 'namaPerumahan', label: 'Nama Perumahan/Apartment', autoFilled: true },
    { type: 'text', name: 'namaCluster', label: 'Nama Cluster/Tower', autoFilled: true },
    { type: 'text', name: 'block', label: 'Blok/Gang/Lantai', autoFilled: true },
    { type: 'text', name: 'nomor', label: 'Nomor', autoFilled: true },
    { type: 'text', name: 'rt', label: 'RT', autoFilled: true },
    { type: 'text', name: 'rw', label: 'RW', autoFilled: true },
    { type: 'text', name: 'kodePos', label: 'Kode Pos', autoFilled: true },
    { type: 'text', name: 'propinsi', label: 'Propinsi', autoFilled: true },
    { type: 'text', name: 'kota', label: 'Kabupaten/Kotamadya', autoFilled: true },
    { type: 'text', name: 'kecamatan', label: 'Kecamatan', autoFilled: true },
    { type: 'text', name: 'kelurahan', label: 'Desa/Kelurahan', autoFilled: true },
    // disabled select in the JSP → shown, not editable
    { type: 'text', name: 'statusJaminan', label: 'Status Jaminan', autoFilled: true },
    { type: 'text', name: 'kategoriSla', label: 'Kategori SLA Agunan', autoFilled: true },
    { type: 'text', name: 'sla', label: 'SLA', autoFilled: true },
    { type: 'text', name: 'tanggalOrder', label: 'Tanggal Order', autoFilled: true },

    // Filled in / confirmed on-site
    { type: 'select', name: 'idObjectPenilaiFisik', label: 'Jenis Object Penilaian (Fisik)', section: 'Objek & Lokasi', placeholder: '-- Select --', required: true, optionsKey: objekFisikKey },
    { type: 'select', name: 'branchId', label: 'Lokasi Cabang', section: 'Objek & Lokasi', placeholder: '-- Select --', optionsKey: 'CABANG' },
    { type: 'textarea', name: 'lokasiFisik', label: lokasiLabel, section: 'Objek & Lokasi', placeholder: 'Maks. 255 karakter' },
    { type: 'radio', name: 'posisiLokasiAgunan', label: 'Posisi Lokasi Agunan', section: 'Objek & Lokasi', optionsKey: 'POSISI_LOKASI_AKTIVA' },

    { type: 'text', name: 'tanggalSurvey', label: 'Tanggal Survey', section: 'Survey', inputType: 'date', required: true },
    ...(isEksternal ? [
      { type: 'text', name: 'tanggalPenilaian', label: 'Tanggal Penilaian', section: 'Survey', inputType: 'date' },
      { type: 'text', name: 'tanggalOrderKeEksternal', label: 'Tanggal Order Ke Eksternal', section: 'Survey', inputType: 'date' },
      { type: 'text', name: 'tanggalTerimaDariEksternal', label: 'Tanggal Terima Dari Eksternal', section: 'Survey', inputType: 'date' }
    ] : []),
    { type: 'text', name: 'ditujuke', label: 'Penilaian ditujukan ke', section: 'Survey' },
    isEksternal
      ? { type: 'select', name: 'idKjpp', label: 'KJPP', section: 'Survey', placeholder: '-- Select --', optionsKey: 'KJPP' }
      : { type: 'select', name: 'ditinjau', label: 'Ditinjau Oleh', section: 'Survey', placeholder: '-- Select --', optionsKey: 'DITINJAU' },
    { type: 'text', name: 'ditemui', label: 'Diantar/Ditemui Oleh', section: 'Survey' },
    { type: 'text', name: 'catatanSurvey', label: 'Catatan Hasil Survey', section: 'Survey' },

    { type: 'radio', name: 'mataUang', label: 'Mata Uang', section: 'Kurs', optionsKey: 'MATA_UANG', value: 'IDR' },
    { type: 'text', name: 'tanggalRate', label: 'Tanggal Rate', section: 'Kurs', inputType: 'date' },
    { type: 'number', name: 'nilaiRate', label: 'Nilai Rate', section: 'Kurs', mask: 'luas-tanah', value: '1' }
  ]
  return { title: 'Data Umum', fields }
}
