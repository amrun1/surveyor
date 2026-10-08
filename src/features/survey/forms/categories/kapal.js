// Kapal / Vessel — legacy lpa/kapal/form.jsp (LpaKapalController, LpaKapalDto).
// Fields and paths from the lpa-forms skill (fields-by-category.md § Kapal).
import { dataUmumTab } from '../fragments/dataUmum.js'
import { marketabilityTab } from '../fragments/marketability.js'
import { negativeListTab } from '../fragments/negativeList.js'
import { opiniTab } from '../fragments/opini.js'
import { dataLampiranTab } from '../fragments/dataLampiran.js'

// TODO: DTO stores a boolean — confirm value mapping

function dataKapalTab() {
  return {
    title: 'Data Kapal',
    fields: [
      { type: 'text', name: 'nama', label: 'Nama Kapal', section: 'Identitas Kapal', required: true },
      { type: 'text', name: 'pemilik', label: 'Nama Pemilik', section: 'Identitas Kapal' },
      { type: 'text', name: 'kebangsaan', label: 'Kebangsaan', section: 'Identitas Kapal' },
      { type: 'text', name: 'selar', label: 'Selar Kapal', section: 'Identitas Kapal' },
      { type: 'text', name: 'galangan', label: 'Galangan Kapal', section: 'Identitas Kapal' },
      { type: 'select', name: 'kelas', label: 'Kelas Kapal', section: 'Identitas Kapal', placeholder: '-- Select --', optionsKey: 'KELAS_KAPAL_VESSEL' },
      { type: 'number', name: 'tahun', label: 'Tahun Pembuatan', section: 'Identitas Kapal', mask: 'number', maxlength: 4, placeholder: 'Contoh: 2015' },
      { type: 'text', name: 'manufaktur', label: 'Manufaktur', section: 'Identitas Kapal' },

      { type: 'number', name: 'panjang', label: 'Panjang', section: 'Dimensi & Tonase', mask: 'luas-tanah', suffix: 'm' },
      { type: 'number', name: 'lebar', label: 'Lebar', section: 'Dimensi & Tonase', mask: 'luas-tanah', suffix: 'm' },
      { type: 'number', name: 'tinggi', label: 'Tinggi', section: 'Dimensi & Tonase', mask: 'luas-tanah', suffix: 'm' },
      { type: 'number', name: 'isiKotor', label: 'Berat Isi Kotor', section: 'Dimensi & Tonase', mask: 'luas-tanah', suffix: 'GT' },
      { type: 'number', name: 'isiBersih', label: 'Berat Isi Bersih', section: 'Dimensi & Tonase', mask: 'luas-tanah', suffix: 'GT' },

      { type: 'select', name: 'statusAgunan', label: 'Status Agunan Kapal', section: 'Status & Kondisi', placeholder: '-- Select --', optionsKey: 'STATUS_AGUNAN_VESSEL' },
      { type: 'select', name: 'statusJaminanKapal', label: 'Status Jaminan Kapal', section: 'Status & Kondisi', placeholder: '-- Select --', optionsKey: 'STATUS_JAMINAN_VESSEL' },
      { type: 'select', name: 'kondisiUmum', label: 'Kondisi Umum', section: 'Status & Kondisi', placeholder: '-- Select --', optionsKey: 'KONDISI_UMUM_VESSEL' }
    ]
  }
}

function dataLegalitasTab() {
  return {
    title: 'Data Legalitas',
    fields: [
      { type: 'select', name: 'jenis', label: 'Jenis Kapal', placeholder: '-- Select --', optionsKey: 'JENIS_VESSEL' },

      { type: 'text', name: 'noGrossAkta', label: 'No. Gross Akta', section: 'Gross Akta' },
      { type: 'text', name: 'tanggalGrossAkta', label: 'Tgl. Gross Akta', section: 'Gross Akta', inputType: 'date' },

      { type: 'text', name: 'noSuratUkur', label: 'No. Surat Ukur', section: 'Surat Ukur' },
      { type: 'text', name: 'tanggalSuratUkur', label: 'Tgl. Surat Ukur', section: 'Surat Ukur', inputType: 'date' },

      { type: 'text', name: 'noSertifikatLambung', label: 'No. Sertifikat Lambung', section: 'Sertifikat Lambung' },
      { type: 'text', name: 'tanggalSertifikatLambung', label: 'Tgl. Sertifikat Lambung', section: 'Sertifikat Lambung', inputType: 'date' },
      { type: 'text', name: 'expiredSertifikatLambung', label: 'Expired Sertifikat Lambung', section: 'Sertifikat Lambung', inputType: 'date' },

      { type: 'text', name: 'noSertifikatGaris', label: 'No. Sertifikat Garis', section: 'Sertifikat Garis' },
      { type: 'text', name: 'tanggalSertifikatGaris', label: 'Tgl. Sertifikat Garis', section: 'Sertifikat Garis', inputType: 'date' },

      { type: 'text', name: 'noSertifikatMesin', label: 'No. Sertifikat Mesin', section: 'Sertifikat Mesin' },
      { type: 'text', name: 'tanggalSertifikatMesin', label: 'Tgl. Sertifikat Mesin', section: 'Sertifikat Mesin', inputType: 'date' },
      { type: 'text', name: 'expiredSertifikatMesin', label: 'Expired Sertifikat Mesin', section: 'Sertifikat Mesin', inputType: 'date' }
    ]
  }
}

function dataMesinTab() {
  const mesin = (prefix, idx, section) => [
    { type: 'text', name: `${prefix}Merk${idx}`, label: `Merk ${section}`, section },
    { type: 'text', name: `${prefix}Nomor${idx}`, label: `No. ${section}`, section },
    { type: 'text', name: `${prefix}Kapasitas${idx}`, label: `Kapasitas ${section}`, section }
  ]
  return {
    title: 'Data Mesin',
    fields: [
      ...mesin('mesin', 1, 'Mesin 1'),
      ...mesin('mesin', 2, 'Mesin 2'),
      ...mesin('mesin', 3, 'Mesin 3'),
      ...mesin('mesinBackup', 1, 'Backup Mesin 1'),
      ...mesin('mesinBackup', 2, 'Backup Mesin 2')
    ]
  }
}

// Single-block valuation (shared shape with Mesin). `sfx` is '' (Internal) or 'Eks'.
// Calculations (likuidasi values) are out of scope here; the legacy JSP doesn't mark
// them readonly, so they stay editable.
function nilaiAgunanFields(sfx) {
  return [
    { type: 'radio', name: `manual${sfx}`, label: 'Hitung Manual', optionsKey: 'YA_TIDAK_FLAG' },
    { type: 'number', name: `nilaiDocPasar${sfx}`, label: 'Nilai Dokumen Pasar', mask: 'luas-tanah', prefix: 'Rp' },
    { type: 'radio', name: `beriNilaiDoc${sfx}`, label: 'Diberi Nilai (Dokumen)', optionsKey: 'DIBERI_NILAI' },
    { type: 'number', name: `nilaiFisikPasar${sfx}`, label: 'Nilai Fisik Pasar', mask: 'luas-tanah', prefix: 'Rp' },
    { type: 'radio', name: `beriNilaiFisik${sfx}`, label: 'Diberi Nilai (Fisik)', optionsKey: 'DIBERI_NILAI' },
    { type: 'number', name: `likuidasi${sfx}`, label: 'Persen Likuidasi', mask: 'persen' },
    { type: 'number', name: `nilaiDocLikuidasi${sfx}`, label: 'Nilai Dokumen Likuidasi', mask: 'luas-tanah', prefix: 'Rp' },
    { type: 'number', name: `nilaiFisikLikuidasi${sfx}`, label: 'Nilai Fisik Likuidasi', mask: 'luas-tanah', prefix: 'Rp' }
  ]
}

function nilaiAgunanTab() {
  return { title: 'Nilai Agunan', fields: nilaiAgunanFields('') }
}

function nilaiAgunanEksTab() {
  return { title: 'Nilai Agunan (Eksternal)', fields: nilaiAgunanFields('Eks') }
}

export default {
  tabs: ({ isEksternal }) => [
    dataUmumTab({ isEksternal }),
    dataKapalTab(),
    dataLegalitasTab(),
    dataMesinTab(),
    nilaiAgunanTab(),
    isEksternal && nilaiAgunanEksTab(),
    marketabilityTab({ isEksternal, unmarketabilityKey: 'FAKTOR_UNMARKETABILITY_KAPAL' }),
    negativeListTab({ negativeKey: 'NEGATIVE_LIST_VESSEL', pertimbanganKey: 'PROPERTI_PERTIMBANGAN_VESSEL' }),
    isEksternal && opiniTab(),
    dataLampiranTab()
  ]
}
