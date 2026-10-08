// Every option list used by the LPA survey forms — the ONE place to edit them.
//
// Fields don't carry their options; they name a list with `optionsKey` and
// buildFormConfig (forms/index.js) resolves it via resolveOptions().
//
// PARAMETER_OPTIONS: copied from the legacy `parameter` table (export of
// 2026-10-08) — one key per `code_group`, spelled EXACTLY like the DB (typos
// included), active rows only, ordered by `sorting`. These are the lists legacy
// selects load via parameterFacade.findLvByGroup(GroupParameter.X). This is the
// FALLBACK: at runtime services/parameterOptions.js loads the same groups from
// the parameter service (cached in IndexedDB for offline) and resolveOptions()
// prefers those, key for key — which is why the keys must stay exact code_groups.
//
// Stored value: the row's `code` when it has one, otherwise its `value` text,
// byte for byte (a few BV_FOTO_PADA rows end in a space — kept in `value`,
// trimmed only in `label`). TODO: confirm against what legacy actually saves.
//
// LOCAL_OPTIONS: lists with no `parameter` group — they come from other tables
// (branches, users, KJPP) or are fixed answers in the legacy JSPs. The ones
// built with unknown() are still placeholders.
//
// Not here: the exclusive "Tidak ada" of a checkbox list is app behaviour — see
// `exclusiveNone` in forms/index.js.

// Obviously-fake list for a lookup whose values aren't known at all yet — so it's
// spotted in testing rather than mistaken for real data.
const unknown = (label) => [`${label} 1 (placeholder)`, `${label} 2 (placeholder)`, `${label} 3 (placeholder)`]

// Note: several groups in the DB are test data themselves (KELAS_KAPAL_VESSEL,
// *_VESSEL, MESIN_NEGATIVE_LIST, MESIN_FAKTOR_UNMARKETABILITY, …) — copied as-is.
const PARAMETER_OPTIONS = {
    // --- Shared (Data Umum, Marketability, Opini, Data Lampiran) ---
    JENIS_PENILAIAN_FISIK: [
        'LPA Indikasis',
        'Rumah Tinggal',
        'Ruko/Rukan',
        'Apartemen',
        'Ruang Perkantoran',
        'Kios',
        'Pabrik / Gudang',
        'Workshop',
        'Tanah Kosong, dll',
        'Pabrik > 10.000 M2',
        'Gedung/Hotel',
        'Kapal Laut (Ship)',
        'Pesawat Terbang (Air Plane), dll',
        'Semua Collateral dengan jarak > 60 KM.'
    ],
    POSISI_LOKASI_AKTIVA: ['Dalam Kota', 'Luar Kota'],
    FAKTOR_MARKETABILITY: ['Rendah', 'Sedang', 'Tinggi', 'Tidak Marketable'],
    FAKTOR_UNMARKETABILITY: [
        'Lokasi terletak di daerah rawan longsor, pasang surut air laut, cagar alam, tambang',
        'Dekat Tempat Pembuangan Akhir/TPA (s/d 500 M), Limbah (s/d 100 M) ;',
        'Lokasi dilintasi/dekat dengan Kabel Listrik Tegangan Tinggi ; Jalur Pipa Gas dengan jarak +/- 20 M dari batas terluar bidang tanah.',
        'Lokasi tidak memiliki akses jalan.',
        'Dekat Rel Kereta Api (s/d 15 M dari batas rel).'
    ],
    CATATAN_KEWAJARAN: [
        'Nilai Eksternal Wajar',
        'Nilai Eksternal Tergolong Tinggi',
        'Nilai Eksternal Tergolong Rendah',
        'Internal tidak melakukan review karena bukan merupakan Kompetensi Internal',
        'Internal tidak melakukan review karena belum pernah Survey',
        'Internal tidak melakukan review karena sudah ada Penilaian Internal',
        'Internal tidak melakukan review karena tidak dimintakan.'
    ],
    CATATAN_KESESUAIAN: ['Sesuai', 'Tidak Sesuai'],
    OPINI_INTERNAL_ATAS_EKSTERNAL: ['Nilai Tergolong Wajar', 'Nilai Terlalu Rendah', 'Nilai Terlalu Tinggi', 'Tidak Di Review'],
    SURVEY_IMAGE_CATEGORY: [
        'Tampak Depan',
        'Tampak Belakang',
        'Tampak Samping Kanan',
        'Tampak Samping Kiri',
        'Tampak Jalan Depan',
        'Tampak Jalan Gang Masuk',
        'Lain - lain'
    ],
    // --- Tanah & Bangunan ---
    BENTUK_TANAH_FISIK: [
        'Bujur Sangkar',
        'Letter L',
        'Persegi Panjang',
        'Tidak Beraturan',
        'Tidak Normal',
        'Trapesium',
        'Segitiga',
        'Jajaran Genjang',
        'Ngantong',
        'Setengah Lingkaran',
        'Letter U'
    ],
    KONTUR_TANAH: ['Rata/Datar', 'Naik Turun', 'Berundak', 'Berbukit', 'Menanjak', 'Menurun', 'Lereng/Tebing', 'Lain-lain'],
    KETINGGIAN_TANAH: ['Sama Tinggi', 'Tinggi <= 50 cm', 'Tinggi > 50 cm', 'Lebih Rendah < 50 cm', 'Lebih Rendah > 50 cm'],
    PERUNTUKAN_TANAH: [
        'Residensial',
        'Komersial',
        'Perindustrian',
        'Pergudangan',
        'Pertanian',
        'Perkebunan',
        'Penghijauan Umum',
        'Sarana Umum'
    ],
    SESUAI_BATAS_TANAH: ['Sesuai', 'Tidak Sesuai'],
    POSISI_TANAH: ['Hoek', 'Jalan Buntu', 'Kuldesak', 'Normal', 'Tusuk Sate', 'Rata'],
    KONDISI_TANAH: ['Darat/Matang', 'Sawah/Rawa', 'Tambak', 'Empang', 'Berbukit', 'Curam/Menurun'],
    JENIS_TANAH: ['Tanah Liat / Padat', 'Tanah Kapur', 'Tanah Berbatu', 'Tanah Pasir', 'Tanah Cadas'],
    IJIN_SESUAI_IMB: [
        'Rumah Tinggal',
        'Rumah Kantor',
        'Kantor',
        'Rumah Toko',
        'Toko',
        'Apartemen',
        'Kios',
        'Kios',
        'Gudang',
        'Pabrik',
        'Small Office Home Office (SOHO)',
        'Plaza',
        'Mall',
        'Gedung Perkantoran (Office Building)',
        'Gedung Komersial',
        'Condotel',
        'Tidak Ada',
        'Tidak Dilampirkan',
        'Tidak Jelas',
        'Lain-lain'
    ],
    JENIS_BANGUNAN: [
        'Rumah Tinggal',
        'Rumah Toko',
        'Rumah Kantor',
        'Apartemen',
        'Kios',
        'Pabrik',
        'Gudang',
        'Bengkel',
        'Gedung',
        'Flat',
        'Ruang Kantor',
        'Condotel',
        'Lain - lain'
    ],
    DIGUNAKAN_SEBAGAI: [
        'Rumah Tinggal',
        'Kantor',
        'Gudang',
        'Bengkel',
        'Tempat Kost',
        'Toko',
        'Rumah Tinggal & Toko',
        'Rumah Tinggal & Kantor',
        'Rumah Tinggal & Kost',
        'Small Office Home Office (SOHO)',
        'Kosong',
        'Tinjau Luar',
        'Tempat Usaha',
        'Pabrik',
        'RUMAH SUSUN',
        'RUMAH SEWA',
        'VILLA',
        'BUNGALOW',
        'TANAH DARAT, SAWAH',
        'KEBUN/LADANG',
        'TAMBAK',
        'Office (KANTOR)',
        'SHOPPING CENTER/MALL/DEPARTMENT STORE',
        'BANGUNAN LAINNYA',
        'Apartment',
        'Hotel',
        'Kios',
        'Kosong',
        'Tidak Terinformasikan',
        'Lain-Lain',
        'Ruko / Rukan',
        'Tidak Jelas',
        'Tidak Dilampirkan',
        'Workshop'
    ],
    DIHUNI_OLEH: [
        'Pemilik',
        'Debitur',
        'Saudara Pemilik',
        'Keluarga Pemilik',
        'Saudara Debitur',
        'Keluarga Debitur',
        'Kosong',
        'Karyawan',
        'Tinjau Luar',
        'Pengontrak',
        'Saudara',
        'Direksi / Komisaris',
        'Pihak Lain',
        'Karyawan Pemilik',
        'Karyawan Pengontrak/Penyewa'
    ],
    KELAS_BANGUNAN: [
        'Rumah Standar',
        'Rumah Menengah',
        'Rumah Mewah',
        'Ruko/Rukan 2 Lantai',
        'Ruko/Rukan 3 Lantai',
        'Ruko/Rukan > 3 Lantai',
        'Apartemen',
        'Kios',
        'Gudang Sederhana',
        'Gudang Standar',
        'Gudang Baik',
        'Bengkel/Workshop Sederhana',
        'Bengkel/Workshop Standar',
        'Bengkel/Workshop Baik',
        'Small Office',
        'Gedung',
        'Ruang Kantor',
        'Condotel',
        'Rumah Susun',
        'Lain-lain',
        'Pabrik',
        'Gedung Komersil',
        'Ruko > 3 Lantai',
        'Tanah',
        'Home Office',
        'Rumah Sederhana'
    ],
    PERUNTUKAN_BANGUNAN: ['Rumah Tinggal', 'Hunian', 'Rukan', 'Kantor', 'Ruko', 'Pabrik', 'Kios'],
    PROSES_PEMBANGUNAN: [
        'Pengurugan/Perataan',
        'Pondasi Selesai',
        'Konstruksi < 30%',
        'Konstruksi 31 - 60%',
        'Konstruksi 61 - 90%',
        'Konstruksi 90 - 99%',
        'Pekerjaan < 100%',
        'Pekerjaan Finishing',
        'Pekerjaan Struktur',
        'Pekerjaan Dinding & Keramik',
        'Unit Siap Serah Terima',
        'Topping Off/ Naik Atap',
        'Pilling (Apartement/Condotel/Kios)',
        'Rough (Apartement/Condotel/Kios)',
        'Tidak Ada'
    ],
    STATUS_BANGUNAN: ['Bangunan Lama', 'Bangunan Baru', 'Kavling/Perpetakan', 'Proses Pembangunan', 'Lain-lain'],
    LINGKUNGAN_SEKITAR: [
        'Perumahan',
        'Pemukiman (Non Perumahan)',
        'Komersial',
        'Pergudangan',
        'Campuran',
        'Apartemen',
        'Lain - Lain',
        'Industri'
    ],
    KEPADATAN_PENDUDUK: ['Jarang', 'Padat', 'Sedang'],
    TINGKAT_KEMACETAN: ['Lancar', 'Macet Jam Tertentu', 'Selalu Macet', 'Sedang'],
    NEGATIVE_LIST: [
        'Berlokasi di daerah/kawasan rawan longsor.',
        'Berlokasi di daerah pasang surut air laut.',
        'Berlokasi di daerah cagar alam atau cagar budaya atau hutan lindung atau konservasi.',
        'Berlokasi di dalam kawasan tambang aktif.',
        'Berlokasi atau merupakan kawasan jalur hijau.',
        'Berlokasi dekat Tempat Pembuangan Sampah Akhir (TPA) atau limbah radius < = 200 meter dari batas terluar bidang tanah.',
        'Berlokasi dekat Saluran Utama Listrik Tegangan Tinggi (SUTET)/atau Base Transceiver Station (BTS), dengan radius antara kabel SUTET/atau tiang BTS adalah < =  20 meter dari batas terluar bidang tanah',
        'Berlokasi dekat jalur kereta api komersial aktif dalam radius < = 15 meter dari batas terluar.',
        'Lokasi jaminan atau jaminan termasuk daerah aliran sungai atau melanggar Garis Sempadan Sungai (GSS) sebagaimana ditetapkan oleh Dinas Pengairan atau Balai Besar Sungai',
        'Lokasi jaminan digunakan sebagai tempat peribadatan umum (mesjid. gereja, pura, kuil, dll) atau di dalam lokasi jaminan terdapat tempat peribadatan (mesjid, gereja, pura, kuil, dll).',
        'Lokasi jaminan dekat jalur pipa gas (bahan bakar) dengan jarak < = 20 meter dari batas terluar bidang.',
        'Lokasi jaminan dilintasi saluran irigasi induk sebagaimana ditetapkan oleh dinas pengairan atau Balai Besar Sungai Pengairan dengan jarak < = 5 meter dari batas terluar bidang.',
        'Di dalam lokasi jaminan terdapat makam atau merupakan lahan pemakaman, atau terdapat pemakaman umum dalam radius < = 100 meter.',
        'Pemanfaatan bangunan tidak sesuai dengan peruntukkan Tata Kota/Rencana Tata Ruang Wilayah atau lokasi properti terkena rencana peremajaan kota sesuai Peraturan Pemerintah Kota atau Peraturan Pemerintah Daerah.',
        'Kondisi bangunan tergolong tidak permanen atau semi permanen.',
        'Kondisi jaminan tidak memiliki batas-batas yang jelas atau tidak terdapat sudut-sudut jelas yang menandai batas bidang tanah tersebut, termasuk batas-batas pada sertipikat.',
        'Pemanfaatan fisik bangunan tidak sesuai dengan IMB.',
        'Tidak Ada',
        'Properti / Tanah tidak memiliki jalan akses yang sesuai (jalan akses <  3 m)',
        'Jaminan bermasalah secara hukum',
        'Lokasi dekat dengan dengan rawa atau di hutan, radius 100 m',
        'Akses jalan di muka jaminan lebih tinggi > 50cm',
        'Berada di bawah jembatan / fly over'
    ],
    PROPERTI_PERTIMBANGAN: [
        'Sebagian dari properti termasuk dalam Garis Sempadan Jalan (GSJ/Rencana Jalan).',
        'Sebagian dari properti termasuk dalam Garis Sempadan Bangunan (GSB).',
        'Area properti berpotensi berkurang akibat Rencana Tata Ruang Wilayah (RTRW).',
        'Lokasi properti terkena rencana proyek peremajaan kota (Perkot atau Perda).',
        'Bangunan permanen tetapi masih dalam pembangunan.',
        'Akses jalan ke lokasi jaminan dengan lebar jalan kurang dari 3 meter.',
        'Terdapat ketidaksesuaian antara batas-batas sesuai sertipikat dengan kondisi fisik.',
        'Tidak Ada'
    ],
    // --- Kendaraan ---
    JENIS_PENILAIAN_FISIK_KENDARAAN: ['Satu', 'Dua', 'Tiga'],
    PENGGUNAAN_KENDARAAN: ['Pribadi', 'Operasional'],
    PEMAKAIAN_KENDARAAN: ['Jarang', 'Kadang', 'Sering'],
    KONDISI_BODY_KENDARAAN: ['Baik/Mulus', 'Lecet - Sedikit', 'Lecet - Banyak', 'Penyok', 'Pernah Tabrakan'],
    KONDISI_BUMPER_KENDARAAN: ['Mulus', 'Lecet - Sedikit', 'Lecet - Banyak', 'Penyok', 'Pernah Tabrakan'],
    KONDISI_CAT_KENDARAAN: ['Baik', 'Pudar', 'Berdempul', 'Tidak Terawat', 'Belang - Belang'],
    KONDISI_INTERIOR_KENDARAAN: ['Standar', 'Modifikasi - Full', 'Modifikasi - Half', 'Modifikasi - Small', 'Full Dress Up'],
    KONDISI_EKSTERIOR_KENDARAAN: ['Standar', 'Modifikasi - Full', 'Modifikasi - Half', 'Modifikasi - Small', 'Full Dress Up'],
    KONDISI_MESIN_KENDARAAN: ['Baik/Terawat', 'Perlu Perbaikan', 'Rusak', 'Tidak Terawat', 'Kurang Terawat'],
    KONDISI_BAN_KENDARAAN: ['Baik', 'Sedang', 'Buruk'],
    FAKTOR_UNMARKETABILITY_KENDARAAN: ['Susah terjual kembali', 'Barang antik'],
    NEGATIVE_LIST_KENDARAAN: ['Tidak Ada', 'BPKB Duplikat', 'STNK Duplikat', 'Nomor mesin berbeda', 'Nomor rangka berbeda', 'Rusak'],
    PROPERTI_PERTIMBANGAN_KENDARAAN: [
        'Tidak Ada',
        'Bekas armada taksi',
        'Usia mobil > 5 tahun',
        'Pernah Tabrakan',
        'Pernah terkena banjir'
    ],
    SURVEY_IMAGE_CATEGORY_KENDARAAN: ['Gambar Mesin', 'Gambar Interior', 'Gambar Depan', 'Lain - lain'],
    // --- Mesin ---
    MESIN_TEMPAT: ['Pabrik / Workshop', 'Rumah / Ruko', 'Kios / Toko'],
    MESIN_KONDISI_TEMPAT: ['Memadai', 'Cukup Memadai', 'Kurang Memadai'],
    MESIN_LINGKUNGAN_SEKITAR: ['Aman', 'Tidak Aman'],
    MESIN_TEKNISI: ['Dalam Negeri', 'Luar Negeri'],
    MESIN_SUKU_CADANG: ['Dalam Negeri', 'Luar Negeri'],
    MESIN_KONDISI: ['Beroperasi Dengan Baik', 'Sedang Diperbaiki', 'Rusak'],
    MESIN_RANGKAIAN: [
        'Mesin yang Berdiri Sendiri',
        'Bag dr Rangkaian Mesin ttp Dpt Berdiri Sendiri',
        'Bag dr Rangk Mesin dan TDK Dpt Brdri Sndri'
    ],
    MESIN_FAKTOR_MARKETABILITY: ['Rendah', 'Sedang', 'Tinggi', 'Tidak Marketable'],
    MESIN_FAKTOR_UNMARKETABILITY: ['Faktor ke-1', 'Faktor ke-2'],
    MESIN_NEGATIVE_LIST: ['Tidak Ada', 'Negative ke-1', 'Negative ke-2'],
    MESIN_PERTIMBANGAN: ['Tidak Ada', 'Pertimbangan ke-1', 'Pertimbangan ke-2'],
    // --- Kapal ---
    KELAS_KAPAL_VESSEL: ['Kelas Kapal 1', 'Kelas Kapal 2', 'Kelas Kapal 3'],
    STATUS_AGUNAN_VESSEL: ['Status Agunan Vessel 1', 'Status Agunan Vessel 2', 'Status Agunan Vessel 3'],
    STATUS_JAMINAN_VESSEL: ['Status Jaminan Vessel 1', 'Status Jaminan Vessel 2', 'Status Jaminan Vessel 3'],
    KONDISI_UMUM_VESSEL: ['Kondisi Umum Vessel 1', 'Kondisi Umum Vessel 2', 'Kondisi Umum Vessel 3'],
    JENIS_VESSEL: ['Jenis Vessel 1', 'Jenis Vessel 2', 'Jenis Vessel 3'],
    NEGATIVE_LIST_VESSEL: ['Tidak Ada', 'Negative Ke-1', 'Negative Ke-2'],
    PROPERTI_PERTIMBANGAN_VESSEL: ['Tidak Ada', 'Pertimbangan Ke-1', 'Pertimbangan Ke-2'],
    // --- Stock ---
    PENEMPATAN_BARANG: ['Teratur', 'Cukup Teratur', 'Kurang Teratur'],
    KEMASAN_BARANG: ['Rapi', 'Kurang Rapi', 'Tidak Terbungkus'],
    KONDISI_BARANG: ['Baik', 'Cukup', 'Kurang'],
    METODE_PEMERIKSAAN: ['Dihitung Seluruhnya', 'Dihitung Secara Acak'],
    JUMLAH_PERSEDIAAN: ['Sesuai dengan Dokumen', 'Tidak Sesuai Karena Perputaran Barang', 'Tidak Sesuai Karena Kesalahan Dokumen'],
    TEMPAT_PENYIMPANAN: ['Pabrik / Workshop', 'Rumah / Ruko', 'Kios / Toko', 'Luar Ruangan'],
    KONDISI_PENYIMPANAN: ['Memadai', 'Cukup Memadai', 'Kurang Memadai'],
    LINGKUNGAN_PENYIMPANAN: ['Aman', 'Tidak Aman'],
    PERALATAN_GUDANG: ['Tersedia', 'Tidak Tersedia'],
    FAKTOR_UNMARKETABILITY_STOCK: ['Stock Alasan Ke-1', 'Stock Alasan Ke-2', 'Stock Alasan Ke-3', 'Stock Alasan Ke-4'],
    NEGATIVE_LIST_STOCK: [
        'Tidak ada',
        'Stock / Persediaan Barang tidak ada',
        'Stock / Persediaan Barang Hilang',
        'Stock / Persediaan Barang tidak dapat di periksa'
    ],
    PROPERTI_PERTIMBANGAN_STOCK: [
        'Tidak ada',
        'Stock / Persediaan Barang rusak',
        'Stock / Persediaan Barang sebagian ditempat lain',
        'Stock / Persediaan Barang sebagian ada di luar negri'
    ],
    SURVEY_IMAGE_CATEGORY_STOCK: ['Foto Hasil Survey', 'Peta Lokasi', 'Denah', 'Lain - lain'],
    // --- Inspeksi (DB group names kept exactly, typos included: KODISI, SUSUSNAN) ---
    INSPEKSI_JENIS_TEMPAT_SIMPAN: ['RUKO', 'GUDANG', 'Kios', 'PABRIK', 'WORK SHOP', 'Lainnya'],
    INSPEKSI_INFO_ALAMAT_TEMPAT: ['SESUAI DOKUMEN', 'TIDAK SESUAI DOKUMEN'],
    INSPEKSI_STATUS_TEMPAT_SIMPAN: ['MILIK SENDIRI', 'SEWA'],
    INSPEKSI_KODISI_TEMPAT_SIMPAN: ['BAIK', 'KOTOR', 'RAPIH', 'TERATUR', 'TERAWAT', 'TIDAK TERAWAT'],
    INSPEKSI_AKTIFITAS_KERJA: ['NORMAL', 'RAMAI', 'SEPI'],
    INSPEKSI_PERALATAN_GUDANG: ['TERSEDIA', 'TIDAK TERSEDIA'],
    INSPEKSI_ALAT_PEMADAM: ['ADA', 'TIDAK ADA'],
    INSPEKSI_KEAMANAN: ['SATPAM LOKASI PENYIMPANAN', 'SATPAM LINGKUNGAN', 'TIDAK ADA'],
    INSPEKSI_KONDISI_JALAN: ['BAIK', 'BETON', 'TANAH', 'RUSAK', 'ASPAL'],
    INSPEKSI_LINGKUNGAN_SEKITAR: ['PERUMAHAN', 'INDUSTRI', 'KOMERSIL', 'PERGUDANGAN', 'CAMPURAN'],
    INSPEKSI_METODE_PERIKSA: ['DI HITUNG SECARA ACAK', 'DI HITUNG SELURUHNYA', 'SAMPLING  10 %'],
    INSPEKSI_PENEMPATAN_PERSEDIAAN: ['TERSUSUN RAPI', 'TIDAK TERSUSUN RAPI', 'DI DALAM RUANGAN', 'DI LUAR RUANGAN'],
    INSPEKSI_SUSUSNAN_PENEMPATAN: ['TERSUSUN RAPI SESUAI JENIS BARANG', 'TIDAK TERSUSUN RAPI'],
    INSPEKSI_PACKING: ['BAIK', 'TERBUNGKUS', 'TIDAK TERBUNGKUS'],
    // --- RAB ---
    RAB_KEWAJARAN_NILAI: ['Wajar', 'Tidak Wajar', 'Tidak Tahu', 'Tergolong  Tinggi', 'Tergolong  Rendah'],
    // --- RV ---
    RV_LIST_UMUR_APLIKAN: ['< 17 - 25 tahun', '> 25 - 40 tahun', '> 40 - 60 tahun', '> 60 - 70 tahun', '> 70 tahun', 'Tidak Tahu'],
    RV_SI1_HUBUNGAN: ['Aplikan', 'Suami Aplikan', 'Istri Aplikan'],
    RV_SI2_HUBUNGAN: ['Kerabat Aplikan (Usia Min. 17 Thn)', 'Anak Aplikan (Usia Min. 17 Thn)', 'Pembantu Aplikan', 'Supir Aplikan'],
    RV_SI3_HUBUNGAN: ['Pengurus RT/RW', 'Tetangga Radius Max 100 m', 'Security Radius Max 100 m'],
    RV_DITERIMA_DI: ['Ruang Tamu', 'Teras', 'Halaman', 'Luar Pagar'],
    RV_PENGHUNI: ['Dihuni Aplikan', 'Dihuni Keluarga / Orang Lain', 'Dijual / Disewakan'],
    RV_LINGKUNGAN_SEKITAR: ['Pemukiman', 'Komp. Perumahan', 'Pertokoan / Ruko', 'Kawasan Industri', 'Pergudangan'],
    RV_JENIS_BANGUNAN: ['Permanen', 'Semi Permanen', 'Belum Jadi'],
    RV_LUAS_BANGUNAN: ['< 100 m', '100 - 500 m', '501 - 1000 m', '> 1000 m'],
    RV_LUAS_TANAH: ['< 100 m', '100 - 500 m', '501 - 1000 m', '> 1000 m'],
    RV_STATUS_KEPEMILIKAN: ['Sendiri', 'Orang Tua/Mertua', 'Perusahaan', 'Keluarga', 'Sewa / Kontrak', 'Tidak Tahu'],
    RV_LAMA_PENEMPATAN: ['< 4 Tahun', '4 - 7 Tahun', '> 7 Tahun', 'Tidak tahu'],
    RV_DATANG_DEBTCOLLECTOR: ['Tidak Tahu', 'Tidak', 'Ya'],
    RV_FOTO_PADA: [
        'Tampak depan rumah dan terlihat nomor',
        'Tampak plang nama jalan (jika ada)',
        'Tampak dalam rumah',
        'Tampak lingkungan sekitar'
    ],
    // --- BV ---
    BV_KEGIATAN_USAHA: ['Ramai/Sibuk', 'Normal', 'Tidak Beroperasi'],
    BV_SI1_HUBUNGAN: ['Aplikan', 'Suami Aplikan', 'Istri Aplikan'],
    BV_SI2_HUBUNGAN: ['Kerabat Aplikan (Min umur 17 tahun)', 'Anak Aplikan (Min umur 17 tahun)', 'Orang Tua Aplikan', 'Karyawan Aplikan'],
    BV_SI3_HUBUNGAN: [
        'Pengelola/Operator/Resepsionis Gedung',
        'Tetangga Radius Max 100 meter',
        'Security Radius Max 100 meter',
        'Pengurus RT/RW'
    ],
    BV_DITERIMA_DI: ['Ruang Tamu', 'Dalam Kantor', 'Halaman', 'Lokasi Aktifitas Usaha'],
    BV_JUMLAH_KARYAWAN: ['< 3 Orang', '3 - 10 Orang', '11 - 20 Orang', '> 20 Orang'],
    BV_OMZET_PENJUALAN: ['< Rp. 100 Juta', 'Rp. 101 Juta - Rp. 1 Milyar', '> Rp. 1 Milyar'],
    BV_JENIS_USAHA: ['Perdagangan', 'Jasa / Service', 'Produksi / Manufaktur'],
    BV_LAMA_PENEMPATAN: ['< 4 tahun', '4 - 7 tahun', '> 7 tahun', 'Tidak tahu'],
    BV_STATUS_KEPEMILIKAN_USAHA: ['Sendiri', 'Orang Tua/Mertua', 'Perusahaan', 'Keluarga', 'Tidak Tahu'],
    BV_STATUS_LOKASI_USAHA: ['Sendiri', 'Orang Tua/Mertua', 'Sewa/Kontrak', 'Keluarga', 'Tidak tahu', 'Perusahaan'],
    BV_LINGKUNGAN_SEKITAR: [
        'Pemukiman',
        'Pertokoan/Ruko',
        'Kawasan Industri/Pergudangan',
        'Komp. Perumahan',
        'Pasar',
        'Apartemen / Perkantoran'
    ],
    BV_JALAN_TEMPAT_USAHA: ['Jalan Utama', 'Jalan Raya', 'Jalan Komplek'],
    BV_LUAS_BANGUNAN: ['< 100 m2', '100 - 500 m2', '> 500 - 1000 m2', '> 1000 m2'],
    BV_LUAS_TANAH: ['< 100 m2', '100 - 500 m2', '> 500 - 1000 m2', '> 1000 m2'],
    BV_JENIS_BANGUNAN: ['Permanen', 'Semi Permanen', 'Belum Jadi'],
    BV_FASILITAS: ['Telepon', 'Komputer', 'Photocopy', 'Internet', 'Kendaraan Operasional'],
    BV_FOTO_PADA: [
        { value: 'Tampak depan terlihat nomor ', label: 'Tampak depan terlihat nomor' },
        { value: 'Tampak plang nama jalan (jika ada) ', label: 'Tampak plang nama jalan (jika ada)' },
        { value: 'Stok Barang (di dalam kotak / dus) ', label: 'Stok Barang (di dalam kotak / dus)' },
        { value: 'Tampak lingkungan lokasi usaha ', label: 'Tampak lingkungan lokasi usaha' },
        { value: 'Tampak depan terlihat papan nama usaha ', label: 'Tampak depan terlihat papan nama usaha' },
        { value: 'Aktifitas usaha ', label: 'Aktifitas usaha' },
        { value: 'Stok Barang (di luar kotak / dus) ', label: 'Stok Barang (di luar kotak / dus)' },
        { value: 'Mesin / peralatan usaha yang digunakan ', label: 'Mesin / peralatan usaha yang digunakan' }
    ],
}

const LOCAL_OPTIONS = {
    // TODO: from other tables (branches / users with the reviewer role / KJPP).
    CABANG: unknown('Cabang'),
    DITINJAU: unknown('Ditinjau Oleh'),
    KJPP: unknown('KJPP'),
    // TODO: no parameter group found — confirm the source of these lists.
    STATUS_DOKUMEN: unknown('Status Document'),
    JENIS_DOKUMEN_TANAH: unknown('Jenis Dokumen'),
    FAKTOR_UNMARKETABILITY_KAPAL: unknown('Faktor Unmarketability Kapal'),
    // Fixed answers (legacy JSP radios / hardcoded lists).
    MATA_UANG: ['IDR', 'USD'],
    KONDISI: ['Baik', 'Cukup', 'Kurang'],
    YA_TIDAK: ['Ya', 'Tidak'],
    ADA_TIDAK: ['Ada', 'Tidak Ada'],
    JENIS_KELAMIN: ['Laki-laki', 'Perempuan'],
    DIBERI_NILAI: ['Ya', 'Tidak'],
    // A DTO boolean shown as Ya/Tidak (Hitung Manual). TODO: confirm the mapping.
    YA_TIDAK_FLAG: [{ value: 'Y', label: 'Ya' }, { value: 'N', label: 'Tidak' }]
}

export const OPTIONS = Object.freeze({ ...PARAMETER_OPTIONS, ...LOCAL_OPTIONS })

// Lists from the parameter service (services/parameterOptions.js), by code_group.
// Replaced wholesale, never mutated; empty until the cache or network loads it.
let remoteOptions = {}

/** Called by services/parameterOptions.js with the cached or freshly fetched groups. */
export function setRemoteOptions(groups) {
    remoteOptions = groups && typeof groups === 'object' ? groups : {}
}

/**
 * The options for a field's `optionsKey`: the parameter service's list when it
 * sent a non-empty one for that group, otherwise the snapshot above (first
 * offline run, endpoint missing, or a group the backend doesn't have). Throws on
 * a key that's in neither — a typo would otherwise render an empty select.
 */
export function resolveOptions(key) {
    const remote = remoteOptions[key]
    if (Array.isArray(remote) && remote.length) return remote
    const options = OPTIONS[key]
    if (!options) throw new Error(`Unknown optionsKey "${key}" — add it to forms/options.js`)
    return options
}
