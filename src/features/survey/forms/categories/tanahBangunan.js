// Tanah & Bangunan — legacy app-valuer/lpa-lnb-internal.jsp (AppValuerController,
// LpaInternalCreateDto). Paths from the lpa-forms skill reference (fields-by-category.md).
import { dataUmumTab } from '../fragments/dataUmum.js'
import { marketabilityTab } from '../fragments/marketability.js'
import { negativeListTab } from '../fragments/negativeList.js'
import { opiniTab } from '../fragments/opini.js'
import { dataLampiranTab } from '../fragments/dataLampiran.js'

// Option lists: `optionsKey` names a list in ../options.js (all placeholders).

function dataTanahTab() {
  const s1 = 'Data Dokumen Tanah'
  const s2 = 'Lampiran Data Dokumen Tanah Lainnya'
  const s3 = 'Data Fisik'
  const s4 = 'Batas Tanah'
  return {
    title: 'Data Tanah',
    fields: [
      { type: 'select', name: 'readDocTanah', label: 'Status Document', section: s1, placeholder: '-- Select --', optionsKey: 'STATUS_DOKUMEN' },
      { type: 'select', name: 'dokumenTanah.jenisDokumenId', label: 'Jenis Dokumen', section: s1, placeholder: '-- Select --', required: true, optionsKey: 'JENIS_DOKUMEN_TANAH' },
      { type: 'text', name: 'dokumenTanah.namaDokumen', label: 'Nomer Dokumen', section: s1, required: true },
      { type: 'text', name: 'dokumenTanah.tanggalSertipikat', label: 'Tanggal Sertipikat', section: s1, inputType: 'date' },
      { type: 'text', name: 'dokumenTanah.namaJalan', label: 'Nama Jalan', section: s1 },
      { type: 'text', name: 'dokumenTanah.blockGangLantai', label: 'Block/Gang/Lantai', section: s1 },
      { type: 'text', name: 'dokumenTanah.nomor', label: 'Nomor', section: s1 },
      { type: 'text', name: 'dokumenTanah.rt', label: 'RT', section: s1, inputmode: 'numeric' },
      { type: 'text', name: 'dokumenTanah.rw', label: 'RW', section: s1, inputmode: 'numeric' },
      { type: 'text', name: 'dokumenTanah.kelurahan', label: 'Desa/Kelurahan', section: s1 },
      { type: 'text', name: 'dokumenTanah.kecamatan', label: 'Kecamatan', section: s1 },
      { type: 'text', name: 'dokumenTanah.kota', label: 'Kota/Kabupaten', section: s1 },
      { type: 'text', name: 'dokumenTanah.propinsi', label: 'Propinsi', section: s1 },
      { type: 'text', name: 'dokumenTanah.namaPemegangHak', label: 'Nama Pemegang Hak', section: s1 },
      { type: 'text', name: 'dokumenTanah.tanggalBerakhirHak', label: 'Tanggal Berakhir Hak', section: s1, inputType: 'date' },
      { type: 'text', name: 'dokumenTanah.suratUkur', label: 'Gbr Situasi/Surat Ukur', section: s1 },
      { type: 'text', name: 'dokumenTanah.tanggalSuratUkur', label: 'Tanggal Surat Ukur', section: s1, inputType: 'date' },
      { type: 'number', name: 'dokumenTanah.luasTanah', label: 'Luas Tanah Sesuai Dokumen', section: s1, mask: 'luas-tanah', suffix: 'm²', required: true },

      // TODO: other land documents (popup lpa/tanah-bangunan/form-doc-tanah.jsp, LpaDokumenTanahDto) — fields not in the reference yet; add as an itemList once known.
      { type: 'number', name: 'totalLuasTanahDokumen', label: 'Total Luas Tanah Sesuai Dokumen', section: s2, mask: 'luas-tanah', suffix: 'm²', computed: true },
      { type: 'number', name: 'luasTanahSesuaiTataKota', label: 'Luas Tanah Terkena Rencana Jalan', section: s2, mask: 'luas-tanah', suffix: 'm²' },

      { type: 'select', name: 'bentukTanah', label: 'Bentuk Tanah', section: s3, placeholder: '-- Select --', optionsKey: 'BENTUK_TANAH_FISIK' },
      { type: 'select', name: 'konturTanah', label: 'Kontur Tanah', section: s3, placeholder: '-- Select --', optionsKey: 'KONTUR_TANAH' },
      { type: 'select', name: 'ketinggianTanah', label: 'Ketinggian dari Jalan', section: s3, placeholder: '-- Select --', optionsKey: 'KETINGGIAN_TANAH' },
      { type: 'select', name: 'peruntukanTanah', label: 'Peruntukan', section: s3, placeholder: '-- Select --', optionsKey: 'PERUNTUKAN_TANAH' },
      { type: 'select', name: 'batasTanah', label: 'Kesesuaian Batas Tanah', section: s3, placeholder: '-- Select --', optionsKey: 'SESUAI_BATAS_TANAH' },

      { type: 'text', name: 'batasUtaraTanah', label: 'Utara', section: s4, layout: 'compass', compassGroup: 'batasTanah', compassRole: 'north' },
      { type: 'text', name: 'batasSelatanTanah', label: 'Selatan', section: s4, layout: 'compass', compassGroup: 'batasTanah', compassRole: 'south' },
      { type: 'text', name: 'batasBaratTanah', label: 'Barat', section: s4, layout: 'compass', compassGroup: 'batasTanah', compassRole: 'west' },
      { type: 'text', name: 'batasTimurTanah', label: 'Timur', section: s4, layout: 'compass', compassGroup: 'batasTanah', compassRole: 'east' },
      { type: 'select', name: 'posisiTanah', label: 'Posisi Tanah', section: s4, placeholder: '-- Select --', optionsKey: 'POSISI_TANAH' },
      { type: 'select', name: 'kondisiTanah', label: 'Kondisi Tanah', section: s4, placeholder: '-- Select --', optionsKey: 'KONDISI_TANAH' },
      { type: 'select', name: 'jenisTanah', label: 'Jenis Tanah', section: s4, placeholder: '-- Select --', optionsKey: 'JENIS_TANAH' }
    ]
  }
}

function dataBangunanTab() {
  const s1 = 'Data Dokumen Bangunan'
  const s2 = 'Lampiran Dokumen Bangunan'
  const s3 = 'Data Luas Bangunan Fisik'
  const s4 = 'Konstruksi'
  return {
    title: 'Data Bangunan',
    fields: [
      { type: 'select', name: 'readDocBangunan', label: 'Status Document', section: s1, placeholder: '-- Select --', optionsKey: 'STATUS_DOKUMEN' },
      { type: 'text', name: 'dokumenBangunan.nomorImb', label: 'Nomor IMB', section: s1 },
      { type: 'text', name: 'dokumenBangunan.tanggalImb', label: 'Tanggal IMB', section: s1, inputType: 'date' },
      { type: 'select', name: 'dokumenBangunan.ijinSesuaiImb', label: 'Ijin Sesuai IMB', section: s1, placeholder: '-- Select --', optionsKey: 'IJIN_SESUAI_IMB' },
      { type: 'number', name: 'dokumenBangunan.luasBangunan', label: 'Luas Bangunan Sesuai IMB', section: s1, mask: 'luas-tanah', suffix: 'm²' },
      // Legacy uses the luas-tanah mask for a floor count; kept as-is, no unit.
      { type: 'number', name: 'dokumenBangunan.jumlahLantai', label: 'Jumlah Lantai Sesuai IMB', section: s1, mask: 'luas-tanah' },

      // TODO: other building documents (LpaDokumenBangunanDto) — fields not in the reference yet.
      { type: 'number', name: 'luasBangunanImb', label: 'Luas Bangunan Sesuai Dokumen', section: s2, mask: 'luas-tanah', suffix: 'm²', computed: true },

      { type: 'number', name: 'luasLantai1', label: 'Luas Lantai 1', section: s3, mask: 'luas-tanah', suffix: 'm²' },
      { type: 'number', name: 'luasLantai2', label: 'Luas Lantai 2', section: s3, mask: 'luas-tanah', suffix: 'm²' },
      { type: 'number', name: 'luasLantai3', label: 'Luas Lantai 3', section: s3, mask: 'luas-tanah', suffix: 'm²' },
      { type: 'number', name: 'luasLantai4', label: 'Luas Lantai 4', section: s3, mask: 'luas-tanah', suffix: 'm²' },
      { type: 'number', name: 'luasLantai5', label: 'Luas Lantai 5', section: s3, mask: 'luas-tanah', suffix: 'm²' },
      { type: 'number', name: 'luasBangunan', label: 'Luas Bangunan Sesuai Fisik', section: s3, mask: 'luas-tanah', suffix: 'm²' },
      { type: 'number', name: 'jumlahLantaiFisik', label: 'Jumlah Lantai Sesuai Fisik', section: s3, mask: 'luas-tanah' },
      { type: 'number', name: 'jumlahLantaiTampakDepan', label: 'Jumlah Lantai Tampak Depan', section: s3, mask: 'luas-tanah' },
      { type: 'select', name: 'jenisBangunan', label: 'Jenis Bangunan', section: s3, placeholder: '-- Select --', optionsKey: 'JENIS_BANGUNAN' },
      { type: 'select', name: 'digunakanSebagai', label: 'Dipergunakan Sebagai', section: s3, placeholder: '-- Select --', optionsKey: 'DIGUNAKAN_SEBAGAI' },
      { type: 'select', name: 'dihuniOleh', label: 'Dihuni Oleh', section: s3, placeholder: '-- Select --', optionsKey: 'DIHUNI_OLEH' },
      { type: 'number', name: 'tahunDibangun', label: 'Tahun Dibangun', section: s3, mask: 'number', maxlength: 4 },
      { type: 'number', name: 'tahunDirenov', label: 'Tahun Direnovasi', section: s3, mask: 'number', maxlength: 4 },
      { type: 'select', name: 'kelasBangunan', label: 'Kelas Bangunan', section: s3, placeholder: '-- Select --', optionsKey: 'KELAS_BANGUNAN' },
      { type: 'text', name: 'kondisiUmum', label: 'Kondisi Umum', section: s3 },
      { type: 'select', name: 'peruntukanBangunan', label: 'Peruntukan', section: s3, placeholder: '-- Select --', optionsKey: 'PERUNTUKAN_BANGUNAN' },

      { type: 'select', name: 'prosesPembangunan', label: 'Proses Pembangunan', section: s4, placeholder: '-- Select --', optionsKey: 'PROSES_PEMBANGUNAN' },
      { type: 'select', name: 'statusBangunan', label: 'Status Bangunan', section: s4, placeholder: '-- Select --', optionsKey: 'STATUS_BANGUNAN' },
      { type: 'number', name: 'prosesKonstruksi', label: 'Proses Konstruksi', section: s4, mask: 'persen' },
      { type: 'text', name: 'tanggalProsesKonstruksi', label: 'Tanggal Progress Konstruksi', section: s4, inputType: 'date' }
    ]
  }
}

function dataLingkunganTab() {
  return {
    title: 'Data Lingkungan',
    fields: [
      { type: 'select', name: 'lingkunganSekitar', label: 'Lingkungan Sekitar', placeholder: '-- Select --', optionsKey: 'LINGKUNGAN_SEKITAR' },
      { type: 'select', name: 'tingkatKepadatan', label: 'Tingkat Kepadatan', placeholder: '-- Select --', optionsKey: 'KEPADATAN_PENDUDUK' },
      { type: 'select', name: 'tingkatKemacetan', label: 'Tingkat Kemacetan', placeholder: '-- Select --', optionsKey: 'TINGKAT_KEMACETAN' },
      { type: 'select', name: 'rencanaJalan', label: 'Terkena Rencana Jalan', placeholder: '-- Select --', optionsKey: 'YA_TIDAK' },
      { type: 'number', name: 'lebarJalan', label: 'Lebar Jalan', mask: 'luas-tanah', suffix: 'm' },
      { type: 'number', name: 'gsb', label: 'Bangunan Terkena GSB', mask: 'luas-tanah', suffix: 'm' },
      { type: 'number', name: 'gss', label: 'Garis Sempadan Sungai', mask: 'luas-tanah', suffix: 'm' },
      { type: 'select', name: 'kendaraanRoda4', label: 'Dilalui Kendaraan Roda 4', placeholder: '-- Select --', optionsKey: 'YA_TIDAK' }
    ]
  }
}

// Per-m² valuation, two rows (1 = Tanah, 2 = Bangunan). The Eksternal tab is the same
// with `Eks`-suffixed paths, except the manual flag (hitungManual1 vs hitungManualEks)
// and the percentage mask (persen vs numeric), which differ in the legacy JSP.
// Readonly totals/likuidasi/toleransi are computed by screen code, not Form.vue.
function nilaiAgunanFields({ sfx, hitungManualName, prosentaseMask }) {
  const money = { type: 'number', mask: 'currency', prefix: 'Rp' }
  const rp = (name, label, section, extra = {}) => ({ ...money, name: name + sfx, label, section, ...extra })
  const row = (n, uraian) => {
    const s = `Baris ${n} — ${uraian}`
    return [
      { type: 'text', name: `uraian${n}${sfx}`, label: 'Uraian', section: s, computed: true },
      rp(`nilaiDokumen${n}`, 'Nilai Sesuai Dokumen', s),
      { type: 'radio', name: `diberiNilaiDokumen${n}${sfx}`, label: 'Diberi Nilai Dokumen', section: s, optionsKey: 'DIBERI_NILAI' },
      rp(`nilaiFisik${n}`, 'Nilai Sesuai Fisik', s),
      { type: 'radio', name: `diberiNilaiFisik${n}${sfx}`, label: 'Diberi Nilai Fisik', section: s, optionsKey: 'DIBERI_NILAI' },
      { type: 'number', name: `prosentase${n}${sfx}`, label: 'Prosentase Likuidasi', section: s, mask: prosentaseMask, maxlength: 3 },
      rp(`likuidasiDokumen${n}`, 'Nilai Likuidasi Dokumen', s, { computed: true }),
      rp(`likuidasiFisik${n}`, 'Nilai Likuidasi Fisik', s, { computed: true })
    ]
  }
  const sHarga = 'Harga per m²'
  const sTotal = 'Total'
  return [
    rp('hargaTanah', 'Nilai Tanah', sHarga, { computed: true }),
    rp('hargaBangunan', 'Nilai Bangunan', sHarga, { computed: true }),
    // TODO: DTO stores a boolean — confirm value mapping
    { type: 'radio', name: hitungManualName, label: 'Hitung Manual', section: sHarga, optionsKey: 'YA_TIDAK_FLAG' },
    ...row(1, 'Tanah'),
    ...row(2, 'Bangunan'),
    rp('totalSesuaiDokumen', 'Total Nilai Sesuai Dokumen', sTotal, { computed: true }),
    rp('totalSesuaiFisik', 'Total Nilai Sesuai Fisik', sTotal, { computed: true }),
    rp('totalLikuidasiDokumen', 'Total Nilai Likuidasi Dokumen', sTotal, { computed: true }),
    rp('totalLikuidasiFisik', 'Total Nilai Likuidasi Fisik', sTotal, { computed: true }),
    rp('toleransi1', 'Toleransi 20%', sTotal, { computed: true }),
    rp('toleransi2', 'Toleransi 30%', sTotal, { computed: true })
  ]
}

function nilaiAgunanTab() {
  return { title: 'Nilai Agunan', fields: nilaiAgunanFields({ sfx: '', hitungManualName: 'hitungManual1', prosentaseMask: 'persen' }) }
}

function nilaiAgunanEksternalTab() {
  return { title: 'Nilai Agunan (Eksternal)', fields: nilaiAgunanFields({ sfx: 'Eks', hitungManualName: 'hitungManualEks', prosentaseMask: 'numeric' }) }
}

export default {
  tabs: ({ isEksternal }) => [
    dataUmumTab({ isEksternal }),
    dataTanahTab(),
    dataBangunanTab(),
    dataLingkunganTab(),
    nilaiAgunanTab(),
    isEksternal && nilaiAgunanEksternalTab(),
    marketabilityTab({ isEksternal }),
    negativeListTab(),
    isEksternal && opiniTab(),
    dataLampiranTab()
  ]
}
