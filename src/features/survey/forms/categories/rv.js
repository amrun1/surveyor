// RV — legacy lpa/rv/form.jsp (LpaRvController, LpaRvDto).
// RV has its own Data Umum (not form-umum.jsp). Names match form-umum's where the
// path is identical, so DATA_UMUM_TASK_PREFILL still prefills them.
// No Eksternal-specific tabs or fields.
import { dataLampiranTab } from '../fragments/dataLampiran.js'

// Option lists: `optionsKey` names a list in ../options.js (all placeholders).

// Readonly order-derived block shared by RV/BV's own Data Umum.
export const orderInfoFields = () => [
  { type: 'text', name: 'orderNumber', label: 'No. Order', autoFilled: true, pinned: true },
  { type: 'text', name: 'lpaNumber', label: 'Nomer LPA', autoFilled: true },
  { type: 'text', name: 'kodePos', label: 'Kode Pos', autoFilled: true },
  { type: 'text', name: 'propinsi', label: 'Propinsi', autoFilled: true },
  { type: 'text', name: 'kota', label: 'Kabupaten/Kotamadya', autoFilled: true },
  { type: 'text', name: 'kecamatan', label: 'Kecamatan', autoFilled: true },
  { type: 'text', name: 'kelurahan', label: 'Desa/Kelurahan', autoFilled: true },
  { type: 'text', name: 'namaPerumahan', label: 'Nama Perumahan/Apartment', autoFilled: true },
  { type: 'text', name: 'namaCluster', label: 'Nama Cluster/Tower', autoFilled: true },
  { type: 'text', name: 'block', label: 'Blok/Gang/Lantai', autoFilled: true },
  { type: 'text', name: 'nomor', label: 'Nomor', autoFilled: true },
  { type: 'text', name: 'rt', label: 'RT', autoFilled: true },
  { type: 'text', name: 'rw', label: 'RW', autoFilled: true },
  { type: 'text', name: 'tanggalOrder', label: 'Tanggal Order', autoFilled: true }
]

// Aplikan + survey fields shared by RV/BV's Data Umum (before the category-specific ones).
export const aplikanFields = () => [
  { type: 'text', name: 'namaDebitur', label: 'Nama Aplikan', section: 'Aplikan', required: true },
  { type: 'textarea', name: 'lokasiFisik', label: 'Alamat Survey', section: 'Aplikan', placeholder: 'Maks. 255 karakter', required: true },
  { type: 'text', name: 'vendor', label: 'Nama Vendor', section: 'Aplikan' },
  { type: 'select', name: 'ditinjau', label: 'ID Surveyor', section: 'Aplikan', placeholder: '-- Select --', optionsKey: 'DITINJAU' },
  { type: 'radio', name: 'sudahPindah', label: 'Aplikan Pindah Rumah', section: 'Aplikan', optionsKey: 'YA_TIDAK' },
  { type: 'radio', name: 'lokasiDitemukan', label: 'Lokasi Objek Survey', section: 'Aplikan', optionsKey: 'YA_TIDAK' }
]

// Survey dates + kurs, shared by RV/BV's Data Umum.
export const surveyKursFields = () => [
  { type: 'text', name: 'tanggalSurvey', label: 'Tanggal Survey', section: 'Survey', inputType: 'date', required: true },
  { type: 'text', name: 'tanggalTerimaDariEksternal', label: 'Tanggal Terima Hasil', section: 'Survey', inputType: 'date' },
  { type: 'radio', name: 'mataUang', label: 'Mata Uang', section: 'Kurs', optionsKey: 'MATA_UANG', value: 'IDR' },
  { type: 'text', name: 'tanggalRate', label: 'Tanggal Rate', section: 'Kurs', inputType: 'date' },
  { type: 'number', name: 'nilaiRate', label: 'Nilai Rate', section: 'Kurs', mask: 'luas-tanah', value: '1' }
]

function dataUmumRvTab() {
  return {
    title: 'Data Umum',
    fields: [
      ...orderInfoFields(),
      ...aplikanFields(),
      { type: 'select', name: 'umur', label: 'Umur Aplikan', section: 'Aplikan', placeholder: '-- Select --', optionsKey: 'RV_LIST_UMUR_APLIKAN' },
      { type: 'text', name: 'namaPasangan', label: 'Nama Pasangan Aplikan', section: 'Aplikan' },
      ...surveyKursFields()
    ]
  }
}

// s1 = sumber informasi 1, s2/s3 = tetangga. Same fields in BV (imported there).
// `prefix` picks RV's or BV's parameter groups: "Hubungan Dengan Aplikan" is a
// different list per source (RV_SI1/2/3_HUBUNGAN vs BV_SI1/2/3_HUBUNGAN).
export function sumberInformasiTab({ prefix = 'RV' } = {}) {
  return {
    title: 'Sumber Informasi',
    fields: [
      { type: 'radio', name: 's1Ditemukan', label: 'Ditemukan', section: 'Sumber 1', optionsKey: 'YA_TIDAK' },
      { type: 'text', name: 's1Nama', label: 'Nama', section: 'Sumber 1' },
      { type: 'radio', name: 's1Kelamin', label: 'Jenis Kelamin', section: 'Sumber 1', optionsKey: 'JENIS_KELAMIN' },
      { type: 'select', name: 's1Hubungan', label: 'Hubungan Dengan Aplikan', section: 'Sumber 1', placeholder: '-- Select --', optionsKey: `${prefix}_SI1_HUBUNGAN` },
      { type: 'radio', name: 's1Kooperatif', label: 'Kooperatif', section: 'Sumber 1', optionsKey: 'YA_TIDAK' },

      { type: 'radio', name: 's2Ditemukan', label: 'Ditemukan', section: 'Tetangga 1', optionsKey: 'YA_TIDAK' },
      { type: 'text', name: 's2Nama', label: 'Nama', section: 'Tetangga 1' },
      { type: 'radio', name: 's2Kelamin', label: 'Jenis Kelamin', section: 'Tetangga 1', optionsKey: 'JENIS_KELAMIN' },
      { type: 'radio', name: 's2Kenal', label: 'Kenal Dengan Aplikan?', section: 'Tetangga 1', optionsKey: 'YA_TIDAK' },
      { type: 'select', name: 's2Hubungan', label: 'Hubungan Dengan Aplikan', section: 'Tetangga 1', placeholder: '-- Select --', optionsKey: `${prefix}_SI2_HUBUNGAN` },
      { type: 'radio', name: 's2Kooperatif', label: 'Kooperatif', section: 'Tetangga 1', optionsKey: 'YA_TIDAK' },

      { type: 'radio', name: 's3Ditemukan', label: 'Ditemukan', section: 'Tetangga 2', optionsKey: 'YA_TIDAK' },
      { type: 'text', name: 's3Nama', label: 'Nama', section: 'Tetangga 2' },
      { type: 'radio', name: 's3Kelamin', label: 'Jenis Kelamin', section: 'Tetangga 2', optionsKey: 'JENIS_KELAMIN' },
      { type: 'radio', name: 's3Kenal', label: 'Kenal Dengan Aplikan?', section: 'Tetangga 2', optionsKey: 'YA_TIDAK' },
      { type: 'select', name: 's3Hubungan', label: 'Hubungan Dengan Aplikan', section: 'Tetangga 2', placeholder: '-- Select --', optionsKey: `${prefix}_SI3_HUBUNGAN` },
      { type: 'radio', name: 's3Kooperatif', label: 'Kooperatif', section: 'Tetangga 2', optionsKey: 'YA_TIDAK' }
    ]
  }
}

function rumahTab() {
  return {
    title: 'Rumah',
    fields: [
      { type: 'select', name: 'surveyorDiterimaDi', label: 'Surveyor Diterima di', placeholder: '-- Select --', optionsKey: 'RV_DITERIMA_DI' },
      { type: 'radio', name: 'kondisiRumah', label: 'Kondisi Rumah', optionsKey: 'KONDISI' },
      { type: 'select', name: 'penghuni', label: 'Penghuni', placeholder: '-- Select --', optionsKey: 'RV_PENGHUNI' },
      { type: 'select', name: 'lingkunganSekitar', label: 'Lingkungan Sekitar Rumah', placeholder: '-- Select --', optionsKey: 'RV_LINGKUNGAN_SEKITAR' },
      { type: 'select', name: 'jenisBangunan', label: 'Jenis Bangunan', placeholder: '-- Select --', optionsKey: 'RV_JENIS_BANGUNAN' },
      { type: 'select', name: 'luasBangunan', label: 'Luas Bangunan', placeholder: '-- Select --', optionsKey: 'RV_LUAS_BANGUNAN' },
      { type: 'select', name: 'luasTanah', label: 'Luas Tanah', placeholder: '-- Select --', optionsKey: 'RV_LUAS_TANAH' },
      { type: 'text', name: 'telepon', label: 'Telepon (Isi jika ada)', inputType: 'tel' },
      { type: 'radio', name: 'garasi', label: 'Apakah Ada Garasi?', optionsKey: 'ADA_TIDAK' },
      { type: 'radio', name: 'carport', label: 'Apakah Ada Carport?', optionsKey: 'ADA_TIDAK' },
      { type: 'select', name: 'statusKepemilikan', label: 'Status Kepemilikan', placeholder: '-- Select --', optionsKey: 'RV_STATUS_KEPEMILIKAN' },
      { type: 'select', name: 'lamaPenempatan', label: 'Lama Penempatan', placeholder: '-- Select --', optionsKey: 'RV_LAMA_PENEMPATAN' }
    ]
  }
}

function informasiTambahanTab() {
  return {
    title: 'Informasi Tambahan',
    fields: [
      { type: 'radio', name: 'dikenalNamaSama', label: 'Dikenal Dengan Nama Sama?', optionsKey: 'YA_TIDAK' },
      { type: 'text', name: 'namaPanggilan', label: 'Jika Jawaban Di Atas Tidak, Tulis Nama Panggilan', visibleIf: { field: 'dikenalNamaSama', value: 'Tidak' } },
      { type: 'select', name: 'didatangiDebtCollector', label: 'Pernah Didatangi Debt Collector', placeholder: '-- Select --', optionsKey: 'RV_DATANG_DEBTCOLLECTOR' },
      { type: 'checkboxes', name: 'fotoPada', label: 'Foto Dilakukan Pada', optionsKey: 'RV_FOTO_PADA', value: [] },
      { type: 'textarea', name: 'infoS1', label: 'Info SI 1', placeholder: 'Maks. 1000 karakter' },
      { type: 'textarea', name: 'infoS2', label: 'Info SI 2', placeholder: 'Maks. 1000 karakter' },
      { type: 'textarea', name: 'infoS3', label: 'Info SI 3', placeholder: 'Maks. 1000 karakter' },
      { type: 'textarea', name: 'note', label: 'Note', placeholder: 'Maks. 1000 karakter' }
    ]
  }
}

export default {
  // isEksternal unused: RV has no Eksternal-specific tabs or fields.
  tabs: () => [
    dataUmumRvTab(),
    sumberInformasiTab(),
    rumahTab(),
    informasiTambahanTab(),
    dataLampiranTab()
  ]
}
