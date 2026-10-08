// BV — legacy lpa/bv/form.jsp (LpaBvController, LpaBvDto).
// BV has its own Data Umum (not form-umum.jsp); its Sumber Informasi tab is the
// same as RV's, so it's imported from rv.js. No Eksternal-specific tabs or fields.
import { dataLampiranTab } from '../fragments/dataLampiran.js'
import { orderInfoFields, aplikanFields, surveyKursFields, sumberInformasiTab } from './rv.js'

// Option lists: `optionsKey` names a list in ../options.js (all placeholders).

function dataUmumBvTab() {
  return {
    title: 'Data Umum',
    fields: [
      ...orderInfoFields(),
      ...aplikanFields(),
      { type: 'radio', name: 'papanNama', label: 'Papan Nama Usaha', section: 'Aplikan', optionsKey: 'ADA_TIDAK' },
      { type: 'select', name: 'kegiatanUsaha', label: 'Kegiatan Usaha Saat Survey', section: 'Aplikan', placeholder: '-- Select --', optionsKey: 'BV_KEGIATAN_USAHA' },
      ...surveyKursFields()
    ]
  }
}

const select = (name, label, section, optionsKey) => ({ type: 'select', name, label, section, placeholder: '-- Select --', optionsKey })

function tempatUsahaTab() {
  return {
    title: 'Tempat Usaha',
    fields: [
      select('surveyorDiterimaDi', 'Surveyor Diterima di', 'Usaha', 'BV_DITERIMA_DI'),
      select('jumlahKaryawan', 'Jumlah Karyawan', 'Usaha', 'BV_JUMLAH_KARYAWAN'),
      select('omzetPenjualan', 'Omzet Penjualan Perbulan', 'Usaha', 'BV_OMZET_PENJUALAN'),
      { type: 'text', name: 'detailOmzet', label: 'Detail Omzet Perbulan', section: 'Usaha' },
      { type: 'radio', name: 'kondisiUsaha', label: 'Kondisi Tempat Usaha', section: 'Usaha', optionsKey: 'KONDISI' },
      select('jenisUsaha', 'Jenis Usaha', 'Usaha', 'BV_JENIS_USAHA'),
      { type: 'text', name: 'bidangUsaha', label: 'Bidang Usaha', section: 'Usaha' },
      select('lamaPenempatan', 'Lama Penempatan', 'Usaha', 'BV_LAMA_PENEMPATAN'),
      select('statusUsaha', 'Status Kepemilikan Usaha', 'Usaha', 'BV_STATUS_KEPEMILIKAN_USAHA'),
      select('statusLokasi', 'Status Kepemilikan Lokasi Usaha', 'Usaha', 'BV_STATUS_LOKASI_USAHA'),

      select('lingkunganSekitar', 'Lingkungan Sekitar Tempat Usaha', 'Lokasi & Bangunan', 'BV_LINGKUNGAN_SEKITAR'),
      { type: 'radio', name: 'masukMobil', label: 'Kondisi Jalan (bisa masuk mobil?)', section: 'Lokasi & Bangunan', optionsKey: 'YA_TIDAK' },
      select('jalanTempatUsaha', 'Kondisi Jalan Tempat Usaha', 'Lokasi & Bangunan', 'BV_JALAN_TEMPAT_USAHA'),
      { type: 'radio', name: 'bertingkat', label: 'Kondisi Bangunan (bertingkat?)', section: 'Lokasi & Bangunan', optionsKey: 'YA_TIDAK' },
      select('luasBangunan', 'Luas Bangunan', 'Lokasi & Bangunan', 'BV_LUAS_BANGUNAN'),
      select('luasTanah', 'Luas Tanah', 'Lokasi & Bangunan', 'BV_LUAS_TANAH'),
      select('jenisBangunan', 'Jenis Bangunan', 'Lokasi & Bangunan', 'BV_JENIS_BANGUNAN'),

      { type: 'checkboxes', name: 'fasilitas', label: 'Fasilitas', section: 'Fasilitas & Kendaraan', optionsKey: 'BV_FASILITAS', value: [] },
      { type: 'number', name: 'jumlahMotor', label: 'Jumlah Motor', section: 'Fasilitas & Kendaraan', mask: 'luas-tanah', suffix: 'unit' },
      { type: 'number', name: 'jumlahMobil', label: 'Jumlah Mobil', section: 'Fasilitas & Kendaraan', mask: 'luas-tanah', suffix: 'unit' },
      { type: 'number', name: 'jumlahTruk', label: 'Jumlah Truk', section: 'Fasilitas & Kendaraan', mask: 'luas-tanah', suffix: 'unit' }
    ]
  }
}

function informasiTambahanTab() {
  return {
    title: 'Informasi Tambahan',
    fields: [
      { type: 'checkboxes', name: 'fotoPada', label: 'Foto Dilakukan Pada', optionsKey: 'BV_FOTO_PADA', value: [] },
      { type: 'textarea', name: 'infoS1', label: 'Info SI 1', placeholder: 'Maks. 1000 karakter' },
      { type: 'textarea', name: 'infoS2', label: 'Info SI 2', placeholder: 'Maks. 1000 karakter' },
      { type: 'textarea', name: 'infoS3', label: 'Info SI 3', placeholder: 'Maks. 1000 karakter' },
      { type: 'textarea', name: 'note', label: 'Note', placeholder: 'Maks. 255 karakter' }
    ]
  }
}

export default {
  // isEksternal unused: BV has no Eksternal-specific tabs or fields.
  tabs: () => [
    dataUmumBvTab(),
    sumberInformasiTab({ prefix: 'BV' }),
    tempatUsahaTab(),
    informasiTambahanTab(),
    dataLampiranTab()
  ]
}
