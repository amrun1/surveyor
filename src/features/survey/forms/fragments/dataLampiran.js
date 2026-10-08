// Data Lampiran — the photo-attachment tab every LPA category ends with (legacy:
// an image list with Kategori + Catatan per image). Rendered by PhotoList.vue.
// Kategori options: a SURVEY_IMAGE_CATEGORY* parameter group (options.js) —
// Kendaraan and Stock have their own.

export function dataLampiranTab({ kategoriKey = 'SURVEY_IMAGE_CATEGORY' } = {}) {
  return {
    title: 'Data Lampiran',
    fields: [
      {
        type: 'photoList',
        // TODO: confirm the list property name on the category DTOs.
        name: 'lampiranFoto',
        label: 'Foto Lampiran',
        itemLabel: 'Foto',
        required: true, // at least one photo
        itemFields: [
          { type: 'select', name: 'kategori', label: 'Kategori', placeholder: '-- Pilih kategori --', required: true, optionsKey: kategoriKey },
          { type: 'textarea', name: 'catatan', label: 'Catatan', placeholder: 'Keterangan foto (opsional)' }
        ],
        value: []
      }
    ]
  }
}
