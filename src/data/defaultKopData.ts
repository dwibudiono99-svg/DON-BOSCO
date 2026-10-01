import { KopSekolah } from '../types';

// Preset Vector SVGs for Official School Logos
export const PRESET_LOGOS = {
  tutWuri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="46" fill="%230F4C81" stroke="%23F59E0B" stroke-width="4"/>
    <circle cx="50" cy="50" r="38" fill="%231E3A8A"/>
    <!-- Garuda / Belencong Flame -->
    <path d="M50 18 L55 32 L68 35 L58 44 L60 58 L50 50 L40 58 L42 44 L32 35 L45 32 Z" fill="%23FBBF24"/>
    <!-- Wings / Sayap Tut Wuri -->
    <path d="M22 62 C32 52 42 66 50 72 C58 66 68 52 78 62 C70 76 58 78 50 84 C42 78 30 76 22 62 Z" fill="%23F59E0B"/>
    <path d="M30 60 C38 52 46 62 50 68 C54 62 62 52 70 60 C64 70 56 72 50 78 C44 72 36 70 30 60 Z" fill="%23FFFFFF"/>
    <!-- Buku Terbuka -->
    <path d="M32 72 Q50 68 50 76 Q50 68 68 72 Q50 82 32 72 Z" fill="%23FDE68A"/>
  </svg>`,

  smanCrest: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M50 6 L86 22 V54 C86 76 68 90 50 96 C32 90 14 76 14 54 V22 Z" fill="%231E293B" stroke="%233B82F6" stroke-width="4"/>
    <path d="M50 12 L80 26 V52 C80 72 64 84 50 90 C36 84 20 72 20 52 V26 Z" fill="%230284C7"/>
    <!-- Star of Excellence -->
    <polygon points="50,22 53,30 62,31 55,37 57,46 50,41 43,46 45,37 38,31 47,30" fill="%23FDE047"/>
    <!-- Obor Pendidikan -->
    <path d="M48 42 L52 42 L53 66 L47 66 Z" fill="%23E2E8F0"/>
    <path d="M46 66 L54 66 L52 74 L48 74 Z" fill="%2394A3B8"/>
    <!-- Lidah Api -->
    <path d="M50 34 C54 38 56 42 50 44 C44 42 46 38 50 34 Z" fill="%23EF4444"/>
    <path d="M50 36 C52 39 53 42 50 43 C47 42 48 39 50 36 Z" fill="%23F59E0B"/>
    <!-- Pita Buku SMAN -->
    <path d="M26 62 Q50 56 50 64 Q50 56 74 62 L74 68 Q50 62 50 70 Q50 62 26 68 Z" fill="%23FFFFFF"/>
  </svg>`,

  pemdaJatim: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M50 8 L84 26 L76 78 L50 94 L24 78 L16 26 Z" fill="%2315803D" stroke="%23EAB308" stroke-width="3"/>
    <circle cx="50" cy="48" r="28" fill="%23F8FAFC" stroke="%23EAB308" stroke-width="2"/>
    <!-- Tugu Pahlawan / Monumen -->
    <path d="M47 30 L53 30 L54 66 L46 66 Z" fill="%23B91C1C"/>
    <!-- Padi & Kapas -->
    <path d="M30 48 Q34 64 50 68 Q66 64 70 48" fill="none" stroke="%23EAB308" stroke-width="3" stroke-linecap="round"/>
    <!-- Bintang Semboyan -->
    <polygon points="50,20 52,24 57,25 53,28 54,33 50,30 46,33 47,28 43,25 48,24" fill="%23EAB308"/>
  </svg>`,

  garudaKuningan: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="20" fill="%2378350F"/>
    <circle cx="50" cy="50" r="40" fill="%23B45309" stroke="%23FDE68A" stroke-width="3"/>
    <!-- Lambang Bintang -->
    <polygon points="50,22 56,38 72,40 60,50 64,66 50,57 36,66 40,50 28,40 44,38" fill="%23FEF08A"/>
    <circle cx="50" cy="50" r="16" fill="%23F59E0B"/>
    <text x="50" y="54" font-size="10" font-weight="bold" fill="%2378350F" text-anchor="middle" font-family="sans-serif">SMA</text>
  </svg>`
};

export const defaultKopSekolah: KopSekolah = {
  instansiAtas: 'PEMERINTAH PROVINSI JAWA TIMUR',
  dinas: 'DINAS PENDIDIKAN',
  cabangDinas: 'CABANG DINAS PENDIDIKAN WILAYAH KOTA MALANG DAN KOTA BATU',
  namaSekolah: 'SMA NEGERI 1 TELADAN',
  statusAkreditasi: 'Akreditasi A',
  npsn: '20533812',
  nss: '301056001001',
  alamatJalan: 'Jl. Pendidikan Nasional No. 45, Kompleks Pendidikan Terpadu',
  kelurahanDesa: 'Kelurahan Lowokwaru',
  kecamatan: 'Kecamatan Lowokwaru',
  kotaKabupaten: 'Kota Malang',
  provinsi: 'Jawa Timur',
  kodePos: '65141',
  telepon: '(0341) 551234',
  faks: '(0341) 551235',
  email: 'info@sman1teladan.sch.id',
  website: 'www.sman1teladan.sch.id',
  logoKiri: PRESET_LOGOS.tutWuri,
  logoKanan: PRESET_LOGOS.smanCrest,
  tampilkanLogoKanan: true
};
