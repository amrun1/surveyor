// Stock — legacy lpa/stock/form.jsp (LpaStockController, LpaStockDto).
// Fields and paths from the lpa-forms skill (fields-by-category.md § Stock).
import { dataUmumTab } from '../fragments/dataUmum.js'
import { marketabilityTab } from '../fragments/marketability.js'
import { negativeListTab } from '../fragments/negativeList.js'
import { opiniTab } from '../fragments/opini.js'
import { dataLampiranTab } from '../fragments/dataLampiran.js'

const select = (name, label, section, optionsKey) =>
  ({ type: 'select', name, label, section, placeholder: '-- Select --', optionsKey })

function stockTab() {
  return {
    title: 'Stock/Uraian Barang',
    fields: [
      { type: 'text', name: 'jenisPersedian', label: 'Jenis Persediaan', section: 'Uraian Barang', required: true },
      { type: 'text', name: 'asalPembuatan', label: 'Asal Pembuatan', section: 'Uraian Barang' },
      select('penempatanBarang', 'Penempatan Barang', 'Uraian Barang', 'PENEMPATAN_BARANG'),
      select('kemasanBarang', 'Kemasan Barang', 'Uraian Barang', 'KEMASAN_BARANG'),
      select('kondisiBarang', 'Kondisi Barang', 'Uraian Barang', 'KONDISI_BARANG'),
      select('metodePemeriksaan', 'Metode Pemeriksaan', 'Uraian Barang', 'METODE_PEMERIKSAAN'),
      select('jumlahPersedian', 'Jumlah Persediaan', 'Uraian Barang', 'JUMLAH_PERSEDIAAN'),

      select('jenisPenyimpanan', 'Tempat Penyimpanan', 'Tempat Penyimpanan', 'TEMPAT_PENYIMPANAN'),
      select('kondisiPenyimpanan', 'Kondisi Tempat Penyimpanan', 'Tempat Penyimpanan', 'KONDISI_PENYIMPANAN'),
      select('lingkunganSekitar', 'Lingkungan Sekitar', 'Tempat Penyimpanan', 'LINGKUNGAN_PENYIMPANAN'),
      select('peralatanGudang', 'Peralatan Gudang', 'Tempat Penyimpanan', 'PERALATAN_GUDANG'),

      { type: 'text', name: 'jenisDokumen', label: 'Jenis Dokumen', section: 'Dokumen' },
      { type: 'text', name: 'nomorDokumen', label: 'Nomor Dokumen', section: 'Dokumen' },
      { type: 'text', name: 'tanggalDokumen', label: 'Tanggal Dokumen', section: 'Dokumen', inputType: 'date' }
    ]
  }
}

// Stock single-block valuation. `sfx` is '' (Internal) or 'Eks'. Likuidasi values are
// readonly in the legacy JSP (derived); the calculation is out of scope here.
function penilaianFields(sfx) {
  return [
    { type: 'number', name: `nilaiDokumen${sfx}`, label: 'Nilai Dokumen Pasar', mask: 'luas-tanah', prefix: 'Rp' },
    { type: 'radio', name: `berinilaiDokumen${sfx}`, label: 'Diberi Nilai (Dokumen)', optionsKey: 'DIBERI_NILAI' },
    { type: 'number', name: `nilaiFisik${sfx}`, label: 'Nilai Fisik Pasar', mask: 'luas-tanah', prefix: 'Rp' },
    { type: 'radio', name: `berinilaiFisik${sfx}`, label: 'Diberi Nilai (Fisik)', optionsKey: 'DIBERI_NILAI' },
    { type: 'number', name: `persentase${sfx}`, label: 'Persentase Likuidasi', mask: 'persen' },
    { type: 'number', name: `likuidasiDokumen${sfx}`, label: 'Nilai Dokumen Likuidasi', mask: 'luas-tanah', prefix: 'Rp', computed: true },
    { type: 'number', name: `likuidasiFisik${sfx}`, label: 'Nilai Fisik Likuidasi', mask: 'luas-tanah', prefix: 'Rp', computed: true }
  ]
}

function penilaianTab() {
  return { title: 'Penilaian Agunan', fields: penilaianFields('') }
}

function penilaianEksTab() {
  return { title: 'Penilaian Agunan (Eksternal)', fields: penilaianFields('Eks') }
}

export default {
  tabs: ({ isEksternal }) => [
    dataUmumTab({ isEksternal, lokasiLabel: 'Alamat Tempat Penyimpanan' }),
    stockTab(),
    penilaianTab(),
    isEksternal && penilaianEksTab(),
    marketabilityTab({ isEksternal, variant: 'stock', unmarketabilityKey: 'FAKTOR_UNMARKETABILITY_STOCK' }),
    negativeListTab({ negativeKey: 'NEGATIVE_LIST_STOCK', pertimbanganKey: 'PROPERTI_PERTIMBANGAN_STOCK' }),
    isEksternal && opiniTab(),
    dataLampiranTab({ kategoriKey: 'SURVEY_IMAGE_CATEGORY_STOCK' })
  ]
}
