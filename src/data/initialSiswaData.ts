import { Siswa } from '../types';

// Helper to calculate official background color according to East Java Education Department standard:
// Odd Birth Year -> Red background, Even Birth Year -> Blue background
export const getOfficialDinasPhotoBgColor = (
  birthDateOrYear: string | number
): 'Merah (Tahun Lahir Ganjil)' | 'Biru (Tahun Lahir Genap)' => {
  let year: number;
  if (typeof birthDateOrYear === 'number') {
    year = birthDateOrYear;
  } else {
    const parsed = parseInt(String(birthDateOrYear).substring(0, 4), 10);
    year = isNaN(parsed) ? 2008 : parsed;
  }
  return year % 2 !== 0 ? 'Merah (Tahun Lahir Ganjil)' : 'Biru (Tahun Lahir Genap)';
};

// Helper to create official Dinas Pendidikan student photo SVG (Merah / Biru)
export const createOfficialSiswaPhoto = (
  bgColor: 'red' | 'blue',
  gender: 'L' | 'P',
  variant: number = 1
): string => {
  const bgFill = bgColor === 'red' ? '#dc2626' : '#2563eb'; // Dinas standard: Red (ganjil) / Blue (genap)
  const skinTone = variant % 2 === 0 ? '#f5d0b5' : '#ebd1b8';
  const hairColor = '#1f2937';

  // SVG representation with formal SMA white shirt, grey accents, OSIS badge, formal collar
  let personSvg = '';

  if (gender === 'L') {
    personSvg = `
      <!-- Neck -->
      <path d="M42 56 L58 56 L58 72 L42 72 Z" fill="${skinTone}" />
      <!-- Head / Face -->
      <ellipse cx="50" cy="42" rx="16" ry="19" fill="${skinTone}" />
      <!-- Hair -->
      <path d="M34 38 C34 24 66 24 66 38 C63 27 37 27 34 38 Z" fill="${hairColor}" />
      <path d="M33 36 C32 30 38 23 50 23 C62 23 68 30 67 36 C65 31 59 28 50 28 C41 28 35 31 33 36 Z" fill="${hairColor}" />
      <!-- Ears -->
      <ellipse cx="33" cy="43" rx="2.5" ry="4" fill="${skinTone}" />
      <ellipse cx="67" cy="43" rx="2.5" ry="4" fill="${skinTone}" />
      <!-- Eyebrows -->
      <path d="M38 35 Q43 33 46 35" stroke="#1f2937" stroke-width="1.2" fill="none" stroke-linecap="round" />
      <path d="M54 35 Q57 33 62 35" stroke="#1f2937" stroke-width="1.2" fill="none" stroke-linecap="round" />
      <!-- Eyes -->
      <ellipse cx="42" cy="39" rx="2" ry="1.4" fill="#111827" />
      <ellipse cx="58" cy="39" rx="2" ry="1.4" fill="#111827" />
      <!-- Nose -->
      <path d="M50 39 L49 46 L52 46" stroke="#c49774" stroke-width="1" fill="none" stroke-linecap="round" />
      <!-- Mouth / Smile -->
      <path d="M45 51 Q50 54 55 51" stroke="#a35749" stroke-width="1.4" fill="none" stroke-linecap="round" />
      <!-- Shirt (Putih SMA) -->
      <path d="M22 100 L26 72 C32 68 40 68 44 70 L48 72 L50 82 L52 72 L56 70 C60 68 68 68 74 72 L78 100 Z" fill="#ffffff" />
      <!-- Collar Left & Right -->
      <polygon points="42,68 50,82 46,71 34,73" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.8" />
      <polygon points="58,68 50,82 54,71 66,73" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.8" />
      <!-- Tie / Dasi Abu-Abu SMA -->
      <polygon points="48,82 52,82 54,98 50,102 46,98" fill="#475569" stroke="#334155" stroke-width="0.5" />
      <!-- OSIS Badge (Pocket Left) -->
      <rect x="62" y="86" width="9" height="11" rx="1.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.6" />
      <circle cx="66.5" cy="91" r="2.5" fill="#eab308" />
      <path d="M65 91 L68 91" stroke="#1e3a8a" stroke-width="0.8" />
    `;
  } else {
    // Siswa Perempuan (Pilihan Jilbab Putih atau Rambut Rapi)
    const isJilbab = variant % 2 === 1;
    if (isJilbab) {
      personSvg = `
        <!-- Jilbab Putih SMA -->
        <path d="M28 42 C28 22 72 22 72 42 C72 65 68 76 68 84 L76 100 L24 100 L32 84 C32 76 28 65 28 42 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
        <!-- Face Opening -->
        <ellipse cx="50" cy="45" rx="13" ry="16" fill="${skinTone}" />
        <!-- Ciput / Underscarf -->
        <path d="M38 34 C42 32 58 32 62 34 C58 31 42 31 38 34 Z" fill="#e2e8f0" />
        <!-- Eyebrows -->
        <path d="M39 37 Q43 35 46 37" stroke="#1f2937" stroke-width="1.1" fill="none" stroke-linecap="round" />
        <path d="M54 37 Q57 35 61 37" stroke="#1f2937" stroke-width="1.1" fill="none" stroke-linecap="round" />
        <!-- Eyes -->
        <ellipse cx="43" cy="41" rx="2" ry="1.4" fill="#111827" />
        <ellipse cx="57" cy="41" rx="2" ry="1.4" fill="#111827" />
        <!-- Nose -->
        <path d="M50 41 L49.5 47 L51.5 47" stroke="#c49774" stroke-width="0.9" fill="none" stroke-linecap="round" />
        <!-- Smile -->
        <path d="M46 53 Q50 56 54 53" stroke="#be185d" stroke-width="1.2" fill="none" stroke-linecap="round" />
        <!-- Jilbab Folds / Hijab Drape -->
        <path d="M32 80 Q50 86 68 80" stroke="#cbd5e1" stroke-width="1" fill="none" />
        <!-- OSIS Pin on Hijab -->
        <circle cx="50" cy="74" r="3" fill="#eab308" stroke="#ca8a04" stroke-width="0.6" />
      `;
    } else {
      personSvg = `
        <!-- Neck -->
        <path d="M43 56 L57 56 L57 72 L43 72 Z" fill="${skinTone}" />
        <!-- Long Hair Back -->
        <path d="M30 40 C30 24 70 24 70 40 L73 75 L67 75 L67 55 L33 55 L33 75 L27 75 Z" fill="${hairColor}" />
        <!-- Head / Face -->
        <ellipse cx="50" cy="43" rx="14.5" ry="17" fill="${skinTone}" />
        <!-- Front Hair -->
        <path d="M34 38 C34 25 66 25 66 38 C60 30 40 30 34 38 Z" fill="${hairColor}" />
        <!-- Ears -->
        <ellipse cx="35" cy="44" rx="2" ry="3.5" fill="${skinTone}" />
        <ellipse cx="65" cy="44" rx="2" ry="3.5" fill="${skinTone}" />
        <!-- Eyebrows -->
        <path d="M39 37 Q43 35 46 37" stroke="#1f2937" stroke-width="1.1" fill="none" stroke-linecap="round" />
        <path d="M54 37 Q57 35 61 37" stroke="#1f2937" stroke-width="1.1" fill="none" stroke-linecap="round" />
        <!-- Eyes -->
        <ellipse cx="43" cy="41" rx="1.9" ry="1.4" fill="#111827" />
        <ellipse cx="57" cy="41" rx="1.9" ry="1.4" fill="#111827" />
        <!-- Nose -->
        <path d="M50 41 L49.5 47 L51.5 47" stroke="#c49774" stroke-width="0.9" fill="none" stroke-linecap="round" />
        <!-- Smile -->
        <path d="M46 53 Q50 56 54 53" stroke="#e11d48" stroke-width="1.3" fill="none" stroke-linecap="round" />
        <!-- White SMA Shirt with Collar -->
        <path d="M22 100 L26 72 C32 68 40 68 44 70 L48 72 L50 82 L52 72 L56 70 C60 68 68 68 74 72 L78 100 Z" fill="#ffffff" />
        <polygon points="42,68 50,82 46,71 34,73" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
        <polygon points="58,68 50,82 54,71 66,73" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
        <!-- OSIS Badge -->
        <rect x="62" y="86" width="9" height="11" rx="1.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.6" />
        <circle cx="66.5" cy="91" r="2.5" fill="#eab308" />
      `;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
    <!-- Formal Background Aturan Dinas (Merah/Biru) -->
    <rect width="100" height="120" fill="${bgFill}" />
    <!-- Gradient Depth -->
    <radialGradient id="vignette" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
    </radialGradient>
    <rect width="100" height="120" fill="url(#vignette)" />
    ${personSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const initialSiswaData: Siswa[] = [
  {
    id: 1,
    nisn: '0075421980',
    nis: '23241001',
    nik: '3578011505070001',
    nama: 'Muhammad Arya Pratama',
    jk: 'Laki-laki',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2007-05-15', // Tahun ganjil 2007 -> Merah
    agama: 'Islam',
    tingkatKelas: 'Kelas XI',
    rombel: 'XI MIPA 1',
    faseKurikulum: 'Fase F (Kelas XI - XII)',
    peminatan: 'MIPA (Fisika, Kimia, Biologi, Matematika Lanjut)',
    statusSiswa: 'Aktif',
    alamat: 'Jl. Dharmawangsa No. 42, RT 03 / RW 05',
    kelurahan: 'Airlangga',
    kecamatan: 'Gubeng',
    kotaKab: 'Kota Surabaya',
    noHpSiswa: '081234987650',
    email: 'm.arya.pratama@siswa.sma.belajar.id',
    namaAyah: 'Bambang Sudarmanto, S.T.',
    pekerjaanAyah: 'Wiraswasta / Kontraktor',
    namaIbu: 'Dra. Endang Sri Wahyuni',
    pekerjaanIbu: 'Guru PNS',
    noHpOrtu: '081233445566',
    waliKelas: 'Siti Rahmawati, S.Pd., M.Si.',
    prestasi: 'Medali Perak Olimpiade Sains Nasional (OSN) Bidang Fisika Tingkat Kota Surabaya 2024',
    ekskul: 'KIR (Karya Ilmiah Remaja) & Robotika',
    fotoBgColor: 'Merah (Tahun Lahir Ganjil)',
    foto: createOfficialSiswaPhoto('red', 'L', 1),
    catatanKhusus: 'Ketua Tim KIR Sekolah, siswa penerima beasiswa prestasi akademik.'
  },
  {
    id: 2,
    nisn: '0081239845',
    nis: '23241002',
    nik: '3578024808080002',
    nama: 'Aisyah Putri Azzahra',
    jk: 'Perempuan',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2008-08-18', // Tahun genap 2008 -> Biru
    agama: 'Islam',
    tingkatKelas: 'Kelas X',
    rombel: 'X-1',
    faseKurikulum: 'Fase E (Kelas X)',
    peminatan: 'Kurikulum Merdeka (Eksplorasi Minat & Bakat Fase E)',
    statusSiswa: 'Aktif',
    alamat: 'Jl. Menur Pumpungan V No. 12',
    kelurahan: 'Menur Pumpungan',
    kecamatan: 'Sukolilo',
    kotaKab: 'Kota Surabaya',
    noHpSiswa: '082199887766',
    email: 'aisyah.putri.a@siswa.sma.belajar.id',
    namaAyah: 'H. Ahmad Syukron, S.E.',
    pekerjaanAyah: 'Karyawan Swasta BUMN',
    namaIbu: 'Hj. Nurul Azizah, S.Pd.',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    noHpOrtu: '081377889900',
    waliKelas: 'Ahmad Fauzi, S.Pd.',
    prestasi: 'Juara 1 Lomba Pidato Bahasa Inggris (English Speech) FLS2N Tingkat Cabang Dinas Surabaya 2024',
    ekskul: 'English Club & Paskibraka',
    fotoBgColor: 'Biru (Tahun Lahir Genap)',
    foto: createOfficialSiswaPhoto('blue', 'P', 1),
    catatanKhusus: 'Anggota aktif MPK (Majelis Perwakilan Kelas) Sie Hubungan Masyarakat.'
  },
  {
    id: 3,
    nisn: '0069871234',
    nis: '22231015',
    nik: '3578031203060003',
    nama: 'Kevin Jonathan Tanuwidjaja',
    jk: 'Laki-laki',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2006-03-12', // Tahun genap 2006 -> Biru
    agama: 'Kristen Protestan',
    tingkatKelas: 'Kelas XII',
    rombel: 'XII IPS 1',
    faseKurikulum: 'Fase F (Kelas XI - XII)',
    peminatan: 'IPS (Ekonomi, Sosiologi, Geografi, Sejarah Tingkat Lanjut)',
    statusSiswa: 'Aktif',
    alamat: 'Jl. Kertajaya Indah Timur Blok G-18',
    kelurahan: 'Gebang Putih',
    kecamatan: 'Sukolilo',
    kotaKab: 'Kota Surabaya',
    noHpSiswa: '081765432109',
    email: 'kevin.jonathan@siswa.sma.belajar.id',
    namaAyah: 'Hendrik Tanuwidjaja',
    pekerjaanAyah: 'Pengusaha / Wiraswasta',
    namaIbu: 'Silvia Hartono',
    pekerjaanIbu: 'Wiraswasta',
    noHpOrtu: '081288990011',
    waliKelas: 'Dra. Sri Mulyani',
    prestasi: 'Finalis National Stock Challenge & Juara 2 Debat Ekonomi Universitas Airlangga 2024',
    ekskul: 'Basket & Kelompok Studi Ekonomi',
    fotoBgColor: 'Biru (Tahun Lahir Genap)',
    foto: createOfficialSiswaPhoto('blue', 'L', 2),
    catatanKhusus: 'Kapten Tim Basket Putra SMAN, target kuliah SNBP Manajemen FEB UI/UNAIR.'
  },
  {
    id: 4,
    nisn: '0078901235',
    nis: '23241045',
    nik: '3578046111070004',
    nama: 'Dewi Anindya Cantika',
    jk: 'Perempuan',
    tempatLahir: 'Malang',
    tanggalLahir: '2007-11-21', // Tahun ganjil 2007 -> Merah
    agama: 'Islam',
    tingkatKelas: 'Kelas XI',
    rombel: 'XI MIPA 2',
    faseKurikulum: 'Fase F (Kelas XI - XII)',
    peminatan: 'MIPA (Biologi, Kimia, Matematika Lanjut, Informatika)',
    statusSiswa: 'Aktif',
    alamat: 'Jl. Raya Manyar Sabrangan No. 88',
    kelurahan: 'Manyar Sabrangan',
    kecamatan: 'Mulyorejo',
    kotaKab: 'Kota Surabaya',
    noHpSiswa: '085712349000',
    email: 'dewi.anindya@siswa.sma.belajar.id',
    namaAyah: 'dr. Agus Santoso, Sp.A.',
    pekerjaanAyah: 'Dokter Spesialis Anak',
    namaIbu: 'drg. Maya Pratiwi, Sp.KGA.',
    pekerjaanIbu: 'Dokter Gigi',
    noHpOrtu: '08113456789',
    waliKelas: 'Budi Santoso, S.Kom., M.T.',
    prestasi: 'Juara 1 Lomba Desain Poster Lingkungan Hidup SMA Se-Jawa Timur 2024',
    ekskul: 'PMR (Palang Merah Remaja) & Desain Grafis',
    fotoBgColor: 'Merah (Tahun Lahir Ganjil)',
    foto: createOfficialSiswaPhoto('red', 'P', 2),
    catatanKhusus: 'Koordinator Unit Kesehatan Siswa (UKS) & PMR Wira SMAN.'
  },
  {
    id: 5,
    nisn: '0083456789',
    nis: '23241088',
    nik: '3578051909080005',
    nama: 'Rifky Aditya Pratama',
    jk: 'Laki-laki',
    tempatLahir: 'Sidoarjo',
    tanggalLahir: '2008-09-19', // Tahun genap 2008 -> Biru
    agama: 'Islam',
    tingkatKelas: 'Kelas X',
    rombel: 'X-2',
    faseKurikulum: 'Fase E (Kelas X)',
    peminatan: 'Kurikulum Merdeka (Eksplorasi Minat & Bakat Fase E)',
    statusSiswa: 'Aktif',
    alamat: 'Perumahan Wisma Permai Barat V Blok QQ No. 5',
    kelurahan: 'Mulyorejo',
    kecamatan: 'Mulyorejo',
    kotaKab: 'Kota Surabaya',
    noHpSiswa: '089612345678',
    email: 'rifky.aditya@siswa.sma.belajar.id',
    namaAyah: 'Ir. Joko Susilo, M.T.',
    pekerjaanAyah: 'PNS Balai Besar Wilayah Sungai Brantas',
    namaIbu: 'Siti Aminah, S.Sos.',
    pekerjaanIbu: 'Karyawan Swasta Perbankan',
    noHpOrtu: '081298761234',
    waliKelas: 'Dewi Lestari, S.Pd.',
    prestasi: 'Anggota Paskibraka Peringatan HUT RI Tingkat Kota Surabaya 2024',
    ekskul: 'Paskibra & Pramuka Bantara',
    fotoBgColor: 'Biru (Tahun Lahir Genap)',
    foto: createOfficialSiswaPhoto('blue', 'L', 3),
    catatanKhusus: 'Pradana Gugus Depan Pramuka SMAN, aktif kedisiplinan sekolah.'
  },
  {
    id: 6,
    nisn: '0065432190',
    nis: '22231089',
    nik: '3578065402060006',
    nama: 'Ni Putu Ayu Saraswati',
    jk: 'Perempuan',
    tempatLahir: 'Denpasar',
    tanggalLahir: '2006-02-14', // Tahun genap 2006 -> Biru
    agama: 'Hindu',
    tingkatKelas: 'Kelas XII',
    rombel: 'XII MIPA 1',
    faseKurikulum: 'Fase F (Kelas XI - XII)',
    peminatan: 'MIPA (Kimia, Biologi, Fisika, Matematika Lanjut)',
    statusSiswa: 'Aktif',
    alamat: 'Jl. Rungkut Asri Timur IV No. 20',
    kelurahan: 'Rungkut Kidul',
    kecamatan: 'Rungkut',
    kotaKab: 'Kota Surabaya',
    noHpSiswa: '081333444555',
    email: 'ayu.saraswati@siswa.sma.belajar.id',
    namaAyah: 'I Made Sudarsana, S.H.',
    pekerjaanAyah: 'Advokat / Pengacara',
    namaIbu: 'Ni Ketut Ratnadi, S.E.',
    pekerjaanIbu: 'Pegawai BUMN Pertamina',
    noHpOrtu: '081230011223',
    waliKelas: 'Drs. Supriyanto, M.M.',
    prestasi: 'Juara 1 Festival Seni Tari Tradisional Bali & Nusantara Tingkat Jawa Timur 2024',
    ekskul: 'Seni Tari Nusantara & Paduan Suara Gita SMAN',
    fotoBgColor: 'Biru (Tahun Lahir Genap)',
    foto: createOfficialSiswaPhoto('blue', 'P', 3),
    catatanKhusus: 'Ketua Divisi Kesenian OSIS SMAN, peraih peringkat paralel 1 Kelas XII MIPA.'
  },
  {
    id: 7,
    nisn: '0071122334',
    nis: '23241099',
    nik: '3578071807070007',
    nama: 'Farel Rizky Ramadhan',
    jk: 'Laki-laki',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2007-07-18', // Tahun ganjil 2007 -> Merah
    agama: 'Islam',
    tingkatKelas: 'Kelas XI',
    rombel: 'XI IPS 2',
    faseKurikulum: 'Fase F (Kelas XI - XII)',
    peminatan: 'IPS (Sosiologi, Geografi, Ekonomi, Antropologi)',
    statusSiswa: 'Aktif',
    alamat: 'Jl. Pacar Kembang II No. 17',
    kelurahan: 'Pacar Kembang',
    kecamatan: 'Tambaksari',
    kotaKab: 'Kota Surabaya',
    noHpSiswa: '087812345678',
    email: 'farel.rizky@siswa.sma.belajar.id',
    namaAyah: 'Supriyadi',
    pekerjaanAyah: 'Pedagang / Wiraswasta',
    namaIbu: 'Waginah',
    pekerjaanIbu: 'Pedagang',
    noHpOrtu: '085612348901',
    waliKelas: 'Ratna Wulandari, S.Pd.',
    prestasi: 'Juara 3 Lomba Esai Sosiologi Kritis Universitas Negeri Malang 2024',
    ekskul: 'Jurnalistik Sekolah (Majalah SMAN) & Futsal',
    fotoBgColor: 'Merah (Tahun Lahir Ganjil)',
    foto: createOfficialSiswaPhoto('red', 'L', 4),
    catatanKhusus: 'Pemimpin Redaksi Majalah Sekolah "Gema SMAN".'
  },
  {
    id: 8,
    nisn: '0089988776',
    nis: '23241105',
    nik: '3578086512080008',
    nama: 'Maria Gabriella Michelle',
    jk: 'Perempuan',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2008-12-25', // Tahun genap 2008 -> Biru
    agama: 'Katolik',
    tingkatKelas: 'Kelas X',
    rombel: 'X-3',
    faseKurikulum: 'Fase E (Kelas X)',
    peminatan: 'Kurikulum Merdeka (Eksplorasi Minat & Bakat Fase E)',
    statusSiswa: 'Aktif',
    alamat: 'Jl. Kusuma Bangsa No. 71',
    kelurahan: 'Kapasari',
    kecamatan: 'Genteng',
    kotaKab: 'Kota Surabaya',
    noHpSiswa: '081223344556',
    email: 'maria.gabriella@siswa.sma.belajar.id',
    namaAyah: 'FX Yohanes Kristanto, Ak.',
    pekerjaanAyah: 'Akuntan Publik',
    namaIbu: 'Theresia Maria Linda, S.E.',
    pekerjaanIbu: 'Dosen Perguruan Tinggi Swasta',
    noHpOrtu: '081344556677',
    waliKelas: 'Budi Santoso, S.Kom., M.T.',
    prestasi: 'Pemenang Best Speaker English Debate Competition SMA Surabaya 2024',
    ekskul: 'Debat Bahasa Inggris & Musik Ensemble',
    fotoBgColor: 'Biru (Tahun Lahir Genap)',
    foto: createOfficialSiswaPhoto('blue', 'P', 4),
    catatanKhusus: 'Wakil Ketua OSIS Bidang Komunikasi & Hubungan Eksternal.'
  }
];

export const ROMBEL_OPTIONS = [
  'X-1',
  'X-2',
  'X-3',
  'X-4',
  'X-5',
  'XI MIPA 1',
  'XI MIPA 2',
  'XI IPS 1',
  'XI IPS 2',
  'XI Bahasa & Budaya',
  'XII MIPA 1',
  'XII MIPA 2',
  'XII IPS 1',
  'XII IPS 2'
];

export const PEMINATAN_OPTIONS = [
  'Kurikulum Merdeka (Eksplorasi Minat & Bakat Fase E)',
  'MIPA (Fisika, Kimia, Biologi, Matematika Lanjut)',
  'IPS (Ekonomi, Sosiologi, Geografi, Sejarah Tingkat Lanjut)',
  'Bahasa & Budaya (Bahasa Asing, Sastra Indonesia, Antropologi)',
  'Lintas Minat / Peminatan Khusus'
];

export const AGAMA_OPTIONS = [
  'Islam',
  'Kristen Protestan',
  'Katolik',
  'Hindu',
  'Buddha',
  'Konghucu'
] as const;
