// Opini Internal — legacy lpa/form-opini.jsp. Eksternal orders only: categories
// include it as `isEksternal && opiniTab()` (the builder drops false tabs).
// Kendaraan/Mesin/Kapal inline the same three fields in the legacy JSPs.

export function opiniTab({ title = 'Opini Internal' } = {}) {
  return {
    title,
    fields: [
      { type: 'select', name: 'opini', label: 'Opini Internal Atas Nilai Eksternal', placeholder: '-- Select --', optionsKey: 'OPINI_INTERNAL_ATAS_EKSTERNAL' },
      { type: 'number', name: 'deviasiDoc', label: 'Deviasi Nilai Dokumen', mask: 'devisiasi' },
      { type: 'number', name: 'deviasiFisik', label: 'Deviasi Nilai Fisik', mask: 'devisiasi' }
    ]
  }
}
