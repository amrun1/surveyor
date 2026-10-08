// Mesin — legacy lpa/mesin/form.jsp (LpaMesinController, LpaMesinDto).
// Tab order follows the category matrix (Lampiran Mesin before Nilai Agunan), not
// the JSP pane ids (#menu2, #menu6, #menu3, #menu10). Opini is inline in the JSP;
// the shared fragment is reused for it.
import { dataUmumTab } from '../fragments/dataUmum.js'
import { marketabilityTab } from '../fragments/marketability.js'
import { negativeListTab } from '../fragments/negativeList.js'
import { opiniTab } from '../fragments/opini.js'
import { dataLampiranTab } from '../fragments/dataLampiran.js'

function dokumenUraianTab() {
  return {
    title: 'Dokumen & Uraian Mesin',
    fields: [
      { type: 'text', name: 'rangkaian', label: 'Rangkaian Mesin' },
      { type: 'select', name: 'tempat', label: 'Tempat Operasional', placeholder: '-- Select --', optionsKey: 'MESIN_TEMPAT' },
      { type: 'select', name: 'kondisi', label: 'Kondisi Tempat Operasional', placeholder: '-- Select --', optionsKey: 'MESIN_KONDISI_TEMPAT' },
      { type: 'select', name: 'lingkungan', label: 'Lingkungan Sekitar', placeholder: '-- Select --', optionsKey: 'MESIN_LINGKUNGAN_SEKITAR' },
      { type: 'select', name: 'teknisi', label: 'Teknisi', placeholder: '-- Select --', optionsKey: 'MESIN_TEKNISI' },
      { type: 'select', name: 'cukuCadang', label: 'Penyedia Suku Cadang', placeholder: '-- Select --', optionsKey: 'MESIN_SUKU_CADANG' },
      { type: 'text', name: 'waktuPemakaian', label: 'Waktu Penggunaan' }
    ]
  }
}

// One machine row — popup lpa/mesin/form-lampiran.jsp (LpaMesinLampiranDto). Which
// ones are required is an assumption (enough to identify the machine).
const MESIN_ITEM_FIELDS = [
  { type: 'text', name: 'jenis', label: 'Jenis Mesin', section: 'Identitas Mesin', required: true },
  { type: 'text', name: 'merk', label: 'Merk', section: 'Identitas Mesin', required: true },
  { type: 'text', name: 'typeModel', label: 'Type', section: 'Identitas Mesin', required: true },
  { type: 'text', name: 'noSeri', label: 'No. Seri', section: 'Identitas Mesin', required: true },
  { type: 'number', name: 'tahun', label: 'Tahun Pembuatan', section: 'Identitas Mesin', mask: 'number', maxlength: 4, placeholder: 'Contoh: 2018' },
  { type: 'text', name: 'asal', label: 'Asal Pembuatan', section: 'Identitas Mesin' },
  { type: 'text', name: 'kegunaan', label: 'Kegunaan', section: 'Identitas Mesin' },
  { type: 'select', name: 'kondisi', label: 'Kondisi Mesin', section: 'Identitas Mesin', placeholder: '-- Select --', optionsKey: 'MESIN_KONDISI' },
  { type: 'select', name: 'rangkaian', label: 'Rangkaian Mesin', section: 'Identitas Mesin', placeholder: '-- Select --', optionsKey: 'MESIN_RANGKAIAN' },

  { type: 'text', name: 'noInvoice', label: 'No. Invoice / Faktur', section: 'Dokumen' },
  { type: 'text', name: 'tanggal', label: 'Tanggal Invoice / Faktur', section: 'Dokumen', inputType: 'date' },
  { type: 'text', name: 'pemilik', label: 'Pemilik Sesuai Faktur', section: 'Dokumen' },

  { type: 'number', name: 'nilaiDoc', label: 'Nilai Dokumen Pasar', section: 'Nilai', mask: 'luas-tanah', prefix: 'Rp' },
  { type: 'number', name: 'nilaiFisik', label: 'Nilai Fisik Pasar', section: 'Nilai', mask: 'luas-tanah', prefix: 'Rp' }
]

function lampiranMesinTab() {
  return {
    title: 'Lampiran Mesin',
    fields: [
      {
        type: 'itemList',
        // TODO: confirm the list property name on LpaMesinDto.
        name: 'itemMesin',
        label: 'Daftar Mesin',
        itemLabel: 'Mesin',
        required: true, // at least one machine
        itemFields: MESIN_ITEM_FIELDS,
        summary: { title: ['jenis', 'merk'], subtitle: ['typeModel', 'noSeri', 'tahun', 'nilaiFisik'] },
        value: []
      },
      // Readonly in the JSP — the row count; calculation is out of scope.
      { type: 'number', name: 'jumlahUnit', label: 'Jumlah Unit', mask: 'number', computed: true }
    ]
  }
}

function nilaiAgunanTab({ eks = false } = {}) {
  const s = eks ? 'Eks' : ''
  return {
    title: eks ? 'Nilai Agunan (Eksternal)' : 'Nilai Agunan (Internal)',
    fields: [
      // TODO: DTO stores a boolean — confirm value mapping
      { type: 'radio', name: `manual${s}`, label: 'Hitung Manual', optionsKey: 'YA_TIDAK_FLAG' },
      { type: 'number', name: `nilaiDocPasar${s}`, label: 'Nilai Dokumen Pasar', mask: 'luas-tanah', prefix: 'Rp' },
      { type: 'radio', name: `beriNilaiDoc${s}`, label: 'Diberi Nilai (Dokumen)', optionsKey: 'DIBERI_NILAI' },
      { type: 'number', name: `nilaiFisikPasar${s}`, label: 'Nilai Fisik Pasar', mask: 'luas-tanah', prefix: 'Rp' },
      { type: 'radio', name: `beriNilaiFisik${s}`, label: 'Diberi Nilai (Fisik)', optionsKey: 'DIBERI_NILAI' },
      { type: 'number', name: `likuidasi${s}`, label: 'Persen Likuidasi', mask: 'persen' },
      { type: 'number', name: `nilaiDocLikuidasi${s}`, label: 'Nilai Dokumen Likuidasi', mask: 'luas-tanah', prefix: 'Rp' },
      { type: 'number', name: `nilaiFisikLikuidasi${s}`, label: 'Nilai Fisik Likuidasi', mask: 'luas-tanah', prefix: 'Rp' }
    ]
  }
}

export default {
  tabs: ({ isEksternal }) => [
    dataUmumTab({ isEksternal }),
    dokumenUraianTab(),
    lampiranMesinTab(),
    nilaiAgunanTab(),
    isEksternal && nilaiAgunanTab({ eks: true }),
    marketabilityTab({ isEksternal, marketabilityKey: 'MESIN_FAKTOR_MARKETABILITY', unmarketabilityKey: 'MESIN_FAKTOR_UNMARKETABILITY' }),
    negativeListTab({ negativeKey: 'MESIN_NEGATIVE_LIST', pertimbanganKey: 'MESIN_PERTIMBANGAN' }),
    isEksternal && opiniTab(),
    dataLampiranTab()
  ]
}
