// Kendaraan — legacy lpa/kendaraan/form.jsp (LpaKendaraanController, LpaKendaraanDto).
// The JSP inlines Marketability, Negative List and Opini; the shared fragments are
// reused for them. Eksternal adds Nilai Agunan (Eksternal) and Opini Internal.
import { dataUmumTab } from '../fragments/dataUmum.js'
import { marketabilityTab } from '../fragments/marketability.js'
import { negativeListTab } from '../fragments/negativeList.js'
import { opiniTab } from '../fragments/opini.js'
import { dataLampiranTab } from '../fragments/dataLampiran.js'

// One vehicle row — fields and paths from the popup lpa/kendaraan/form-kendaraan.jsp
// (LpaItemKendaraanDto). Which ones are required is an assumption (enough to
// identify the vehicle); adjust once the business rule is confirmed.
const KENDARAAN_ITEM_FIELDS = [
  { type: 'text', name: 'jenisKendaraan', label: 'Jenis', section: 'Identitas Kendaraan' },
  { type: 'text', name: 'merkKendaraan', label: 'Merk', section: 'Identitas Kendaraan', required: true },
  { type: 'text', name: 'modelType', label: 'Model Tipe', section: 'Identitas Kendaraan', required: true },
  { type: 'text', name: 'isiSilinder', label: 'Isi Silinder', section: 'Identitas Kendaraan', inputmode: 'numeric' },
  { type: 'number', name: 'tahunPembuatan', label: 'Tahun Pembuatan', section: 'Identitas Kendaraan', mask: 'number', maxlength: 4, placeholder: 'Contoh: 2018', required: true },
  { type: 'text', name: 'asalPembuatan', label: 'Asal Pembuatan', section: 'Identitas Kendaraan' },
  { type: 'text', name: 'warna', label: 'Warna Kendaraan', section: 'Identitas Kendaraan' },
  { type: 'text', name: 'noPolisi', label: 'No. Polisi', section: 'Identitas Kendaraan', placeholder: 'B 1234 XYZ', required: true },
  { type: 'text', name: 'noRangka', label: 'No. Chasis', section: 'Identitas Kendaraan' },
  { type: 'text', name: 'noMesin', label: 'No. Engine', section: 'Identitas Kendaraan' },
  { type: 'text', name: 'bahanBakar', label: 'Jenis Bahan Bakar', section: 'Identitas Kendaraan' },

  { type: 'text', name: 'pajakStnk', label: 'Nomor STNK', section: 'Dokumen' },
  { type: 'text', name: 'jatuhTempoStnk', label: 'Jatuh Tempo STNK', section: 'Dokumen', inputType: 'date' },
  { type: 'text', name: 'jatuhTempoPajak', label: 'Jatuh Tempo Pajak', section: 'Dokumen', inputType: 'date' },
  { type: 'text', name: 'noFaktur', label: 'No Faktur', section: 'Dokumen' },
  { type: 'text', name: 'noBpkb', label: 'No BPKB', section: 'Dokumen' },
  { type: 'text', name: 'tanggalBpkb', label: 'Tanggal Penerbitan BPKB', section: 'Dokumen', inputType: 'date' },
  { type: 'text', name: 'atasNamaBpkb', label: 'Atas Nama BPKB', section: 'Dokumen' },
  { type: 'textarea', name: 'alamatBpkb', label: 'Alamat BPKB', section: 'Dokumen' },

  { type: 'radio', name: 'penggunaan', label: 'Penggunaan', section: 'Pemakaian & Kondisi', optionsKey: 'PENGGUNAAN_KENDARAAN' },
  { type: 'radio', name: 'pemakaian', label: 'Frekuensi Pemakaian', section: 'Pemakaian & Kondisi', optionsKey: 'PEMAKAIAN_KENDARAAN' },
  { type: 'number', name: 'kilometer', label: 'Kilometer', section: 'Pemakaian & Kondisi', mask: 'numeric', suffix: 'km' },
  { type: 'radio', name: 'body', label: 'Kondisi Body', section: 'Pemakaian & Kondisi', optionsKey: 'KONDISI_BODY_KENDARAAN' },
  { type: 'radio', name: 'bumper', label: 'Kondisi Bumper', section: 'Pemakaian & Kondisi', optionsKey: 'KONDISI_BUMPER_KENDARAAN' },
  { type: 'radio', name: 'cat', label: 'Kondisi Cat', section: 'Pemakaian & Kondisi', optionsKey: 'KONDISI_CAT_KENDARAAN' },
  { type: 'radio', name: 'interior', label: 'Kondisi Interior', section: 'Pemakaian & Kondisi', optionsKey: 'KONDISI_INTERIOR_KENDARAAN' },
  { type: 'radio', name: 'eksterior', label: 'Kondisi Eksterior', section: 'Pemakaian & Kondisi', optionsKey: 'KONDISI_EKSTERIOR_KENDARAAN' },
  { type: 'radio', name: 'mesin', label: 'Kondisi Mesin', section: 'Pemakaian & Kondisi', optionsKey: 'KONDISI_MESIN_KENDARAAN' },
  { type: 'radio', name: 'ban', label: 'Kondisi Ban', section: 'Pemakaian & Kondisi', optionsKey: 'KONDISI_BAN_KENDARAAN' },

  { type: 'textarea', name: 'catatan', label: 'Catatan', section: 'Catatan & Nilai' },
  // Legacy mask is luas-tanah (2 decimals, grouped) — used for money outside T&B.
  { type: 'number', name: 'nilaiPasar', label: 'Nilai Pasar', section: 'Catatan & Nilai', mask: 'luas-tanah', prefix: 'Rp' },
  { type: 'number', name: 'nilaiDokumen', label: 'Nilai Dokumen', section: 'Catatan & Nilai', mask: 'luas-tanah', prefix: 'Rp' }
]

function lampiranKendaraanTab() {
  return {
    title: 'Lampiran Kendaraan',
    fields: [
      {
        type: 'itemList',
        // TODO: confirm the list property name on LpaKendaraanDto.
        name: 'itemKendaraan',
        label: 'Daftar Kendaraan',
        itemLabel: 'Kendaraan',
        required: true, // at least one vehicle
        itemFields: KENDARAAN_ITEM_FIELDS,
        summary: { title: ['merkKendaraan', 'modelType'], subtitle: ['noPolisi', 'tahunPembuatan', 'nilaiPasar'] },
        value: []
      }
    ]
  }
}

// totalDokumen/totalFisik are sums over the vehicle list and likuidasi* follow from
// persenLikuidasi — the calculation itself is out of scope (Form.vue computes nothing).
// The Eksternal totals are not readonly in the JSP, so they stay editable there.
function nilaiAgunanTab({ eks = false } = {}) {
  const s = eks ? 'Eks' : ''
  const totalComputed = eks ? {} : { computed: true }
  return {
    title: eks ? 'Nilai Agunan (Eksternal)' : 'Nilai Agunan (Internal)',
    fields: [
      { type: 'number', name: `totalDokumen${s}`, label: 'Total Nilai Dokumen', mask: 'luas-tanah', prefix: 'Rp', ...totalComputed },
      { type: 'radio', name: `beriNilaiDokumen${s}`, label: 'Diberi Nilai (Dokumen)', optionsKey: 'DIBERI_NILAI' },
      { type: 'number', name: `totalFisik${s}`, label: 'Total Nilai Fisik', mask: 'luas-tanah', prefix: 'Rp', ...totalComputed },
      { type: 'radio', name: `beriNilaiFisik${s}`, label: 'Diberi Nilai (Fisik)', optionsKey: 'DIBERI_NILAI' },
      { type: 'number', name: `persenLikuidasi${s}`, label: 'Persen Likuidasi', mask: 'persen' },
      { type: 'number', name: `likuidasiDokumen${s}`, label: 'Nilai Likuidasi Dokumen', mask: 'luas-tanah', prefix: 'Rp', computed: true },
      { type: 'number', name: `likuidasiFisik${s}`, label: 'Nilai Likuidasi Fisik', mask: 'luas-tanah', prefix: 'Rp', computed: true }
    ]
  }
}

export default {
  tabs: ({ isEksternal }) => [
    dataUmumTab({ isEksternal, objekFisikKey: 'JENIS_PENILAIAN_FISIK_KENDARAAN' }),
    lampiranKendaraanTab(),
    nilaiAgunanTab(),
    isEksternal && nilaiAgunanTab({ eks: true }),
    marketabilityTab({ isEksternal, eksternalCatatan: false, title: 'Faktor Marketability & Catatan', unmarketabilityKey: 'FAKTOR_UNMARKETABILITY_KENDARAAN' }),
    negativeListTab({ title: 'Negative List Appraisal', negativeKey: 'NEGATIVE_LIST_KENDARAAN', pertimbanganKey: 'PROPERTI_PERTIMBANGAN_KENDARAAN' }),
    isEksternal && opiniTab(),
    dataLampiranTab({ kategoriKey: 'SURVEY_IMAGE_CATEGORY_KENDARAAN' })
  ]
}
