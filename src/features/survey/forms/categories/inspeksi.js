// Inspeksi — legacy lpa/inspeksi/form.jsp (LpaInspeksiController, LpaInspeksiDto).
// Fields and paths from the lpa-forms skill (fields-by-category.md § Inspeksi, and the
// popup lpa/inspeksi/form-item-inspeksi.jsp / LpaItemInspeksiDto for the item rows).
// No valuation / marketability / negative list / opini tabs, and nothing Eksternal-specific.
import { dataUmumTab } from '../fragments/dataUmum.js'
import { dataLampiranTab } from '../fragments/dataLampiran.js'

const select = (name, label, section, optionsKey) =>
  ({ type: 'select', name, label, section, placeholder: '-- Select --', optionsKey })

function dataPersediaanTab() {
  return {
    title: 'Data Persediaan Barang',
    fields: [
      { type: 'text', name: 'jenisBarang', label: 'Jenis Barang', section: 'Daftar Persediaan', required: true },
      { type: 'text', name: 'nomorDaftar', label: 'Nomor Daftar Persediaan Barang', section: 'Daftar Persediaan' },
      { type: 'text', name: 'tanggalDaftar', label: 'Tanggal Daftar Persediaan Barang', section: 'Daftar Persediaan', inputType: 'date' },

      select('jenisTempat', 'Jenis Tempat Penyimpanan', 'Tempat Penyimpanan', 'INSPEKSI_JENIS_TEMPAT_SIMPAN'),
      select('infoAlamatTempat', 'Informasi Alamat Tempat Penyimpanan', 'Tempat Penyimpanan', 'INSPEKSI_INFO_ALAMAT_TEMPAT'),
      // Legacy shows this for a specific infoAlamatTempat choice; the trigger value is a DB
      // lookup we don't have yet, so no visibleIf for now.
      { type: 'text', name: 'alamatLain', label: 'Alamat Lain Yaitu Terletak di', section: 'Tempat Penyimpanan' },
      select('statusTempat', 'Status Tempat Penyimpanan', 'Tempat Penyimpanan', 'INSPEKSI_STATUS_TEMPAT_SIMPAN'),
      select('kondisiTempat', 'Kondisi Tempat Penyimpanan', 'Tempat Penyimpanan', 'INSPEKSI_KODISI_TEMPAT_SIMPAN'),
      select('aktifitasKerja', 'Aktifitas Kerja Tempat Penyimpanan', 'Tempat Penyimpanan', 'INSPEKSI_AKTIFITAS_KERJA'),
      select('peralatanGudang', 'Peralatan Gudang', 'Tempat Penyimpanan', 'INSPEKSI_PERALATAN_GUDANG'),
      select('alatPemadam', 'Alat Pemadam Kebakaran', 'Tempat Penyimpanan', 'INSPEKSI_ALAT_PEMADAM'),
      select('keamanan', 'Keamanan', 'Tempat Penyimpanan', 'INSPEKSI_KEAMANAN'),
      select('kondisiJalan', 'Kondisi Jalan Tempat Penyimpanan', 'Tempat Penyimpanan', 'INSPEKSI_KONDISI_JALAN'),
      select('lingkunganSekitar', 'Kawasan Lingkungan Sekitar', 'Tempat Penyimpanan', 'INSPEKSI_LINGKUNGAN_SEKITAR'),

      select('metodePeriksa', 'Metode Pemeriksaan', 'Pemeriksaan Barang', 'INSPEKSI_METODE_PERIKSA'),
      select('tempatPersediaan', 'Penempatan Persediaan Barang', 'Pemeriksaan Barang', 'INSPEKSI_PENEMPATAN_PERSEDIAAN'),
      select('susunanTempat', 'Susunan Penempatan Barang', 'Pemeriksaan Barang', 'INSPEKSI_SUSUSNAN_PENEMPATAN'),
      select('packing', 'Packing Barang', 'Pemeriksaan Barang', 'INSPEKSI_PACKING'),
      // Same path as marketability's catatanPoint, but Inspeksi has no Marketability tab — no collision.
      { type: 'textarea', name: 'catatanPoint', label: 'Catatan Hasil Kunjungan', section: 'Pemeriksaan Barang', placeholder: 'Maks. 1000 karakter' }
    ]
  }
}

// One row of form-item-inspeksi.jsp — `labelGoods` replaces the JSP's ${labelGoods} label.
function inspeksiItemFields(labelGoods) {
  return [
    { type: 'text', name: 'name', label: `Nama ${labelGoods}`, required: true },
    { type: 'number', name: 'totalDoc', label: 'Jumlah Sesuai Dokumen', mask: 'number', required: true },
    { type: 'number', name: 'totalFisik', label: 'Jumlah Sesuai Fisik', mask: 'number', required: true }
  ]
}

// Subtotals are readonly sums of the rows; the calculation is out of scope here (Form.vue
// computes nothing — the screen's code must set these values).
function itemTableTab({ title, listName, labelGoods, itemLabel, subTotal, subTotalFisik }) {
  return {
    title,
    fields: [
      {
        type: 'itemList',
        // TODO: confirm the list property name on LpaInspeksiDto.
        name: listName,
        label: `Lampiran Data ${labelGoods}`,
        itemLabel,
        // Not required: an inspection can legitimately have no rows in this category.
        itemFields: inspeksiItemFields(labelGoods),
        summary: { title: ['name'], subtitle: ['totalDoc', 'totalFisik'] },
        value: []
      },
      { type: 'number', name: subTotal, label: `Sub Total ${labelGoods}`, mask: 'number', computed: true },
      { type: 'number', name: subTotalFisik, label: `Sub Total ${labelGoods} Fisik`, mask: 'number', computed: true }
    ]
  }
}

export default {
  tabs: ({ isEksternal }) => [
    dataUmumTab({ isEksternal, lokasiLabel: 'Alamat Tempat Penyimpanan' }),
    dataPersediaanTab(),
    itemTableTab({ title: 'Barang Jadi', listName: 'itemBarangJadi', labelGoods: 'Barang Jadi', itemLabel: 'Barang', subTotal: 'subTotalGoods', subTotalFisik: 'subTotalGoodsFisik' }),
    itemTableTab({ title: 'Barang Setengah Jadi', listName: 'itemBarangSetengahJadi', labelGoods: 'Barang Setengah Jadi', itemLabel: 'Barang Setengah Jadi', subTotal: 'subTotalHalfGoods', subTotalFisik: 'subTotalHalfGoodsFisik' }),
    itemTableTab({ title: 'Bahan Baku', listName: 'itemBahanBaku', labelGoods: 'Bahan Baku', itemLabel: 'Bahan Baku', subTotal: 'subTotalRawMaterial', subTotalFisik: 'subTotalRawMaterialFisik' }),
    dataLampiranTab()
  ]
}
