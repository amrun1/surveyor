// RAB — legacy lpa/rab/form.jsp (LpaRabController, LpaRabDto).
// Tabs: Data Umum (form-umum.jsp), Data RAB, Data Lampiran. The legacy file's
// Marketability / Negative List tabs are commented out, so they're not built here.
// No Eksternal-specific tabs or fields.
import { dataUmumTab } from '../fragments/dataUmum.js'
import { dataLampiranTab } from '../fragments/dataLampiran.js'

const BIAYA_TIDAK = 'Biaya Yang Tidak Diperhitungkan'

// One uraian + nilai pair per row (legacy: five fixed rows, all labelled the same).
const tidakDiperhitungkanRow = (n) => [
  { type: 'text', name: `tidakDiperhitungkan${n}txt`, label: BIAYA_TIDAK, section: BIAYA_TIDAK, placeholder: `Uraian biaya ${n}` },
  { type: 'number', name: `tidakDiperhitungkan${n}`, label: BIAYA_TIDAK, section: BIAYA_TIDAK, mask: 'luas-tanah', prefix: 'Rp', placeholder: `Nilai biaya ${n}` }
]

function dataRabTab() {
  return {
    title: 'Data RAB',
    fields: [
      // Legacy mask is luas-tanah (2 decimals, grouped) — used for money outside T&B.
      { type: 'number', name: 'biayaDilampirkan', label: 'Biaya Yang Dilampirkan', section: 'Biaya', mask: 'luas-tanah', prefix: 'Rp' },
      // Readonly in the JSP — a derived total; the screen's code must set its value.
      { type: 'number', name: 'biayaTidakDiperhitungkan', label: BIAYA_TIDAK, section: 'Biaya', mask: 'luas-tanah', prefix: 'Rp', computed: true },
      { type: 'number', name: 'biayaDiperhitungkan', label: 'Biaya Yang Diperhitungkan', section: 'Biaya', mask: 'luas-tanah', prefix: 'Rp', computed: true },

      ...[1, 2, 3, 4, 5].flatMap(tidakDiperhitungkanRow),

      // DTO path is spelled `luasBangungan` (sic).
      { type: 'number', name: 'luasBangungan', label: 'Luas Bangunan Sesuai Gambar Denah', section: 'Review RAB', mask: 'luas-tanah', suffix: 'm²' },
      { type: 'number', name: 'hargaBangunanRab', label: 'Harga Bangunan per-M2 Sesuai RAB', section: 'Review RAB', mask: 'luas-tanah', prefix: 'Rp' },
      { type: 'number', name: 'hargaBangunanInternal', label: 'Harga Bangunan per-M2 Sesuai Internal', section: 'Review RAB', mask: 'luas-tanah', prefix: 'Rp' },
      { type: 'number', name: 'nilaiReviewCustomer', label: 'Nilai Review RAB By Customer', section: 'Review RAB', mask: 'luas-tanah', prefix: 'Rp' },
      { type: 'number', name: 'nilaiReviewInternal', label: 'Nilai Review RAB By Internal', section: 'Review RAB', mask: 'luas-tanah', prefix: 'Rp' },
      { type: 'select', name: 'kewajaranNilai', label: 'Kewajaran Nilai RAB', section: 'Review RAB', placeholder: '-- Select --', optionsKey: 'RAB_KEWAJARAN_NILAI' }
    ]
  }
}

export default {
  tabs: ({ isEksternal }) => [
    dataUmumTab({ isEksternal }),
    dataRabTab(),
    dataLampiranTab()
  ]
}
