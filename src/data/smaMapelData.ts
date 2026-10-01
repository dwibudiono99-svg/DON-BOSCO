import { RumpunMapel, TingkatKelas } from '../types';

export interface MapelSMAItem {
  nama: string;
  rumpun: RumpunMapel;
  jamStandarPerMinggu?: number; // Beban jam tatap muka per rombel di SMA (Kurikulum Merdeka)
  kategori: 'Wajib' | 'Peminatan/Pilihan' | 'Muatan Lokal' | 'Layanan';
  deskripsi?: string;
}

export const RUMPUN_MAPEL_LIST: {
  id: RumpunMapel;
  label: string;
  badgeClass: string;
  bgLight: string;
  borderClass: string;
  textClass: string;
  deskripsi: string;
}[] = [
  {
    id: 'Umum/Wajib',
    label: 'Mapel Umum / Wajib',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    bgLight: 'bg-blue-50/60',
    borderClass: 'border-blue-300',
    textClass: 'text-blue-700',
    deskripsi: 'Mata pelajaran fondasi wajib untuk seluruh siswa Fase E & Fase F SMA'
  },
  {
    id: 'MIPA',
    label: 'MIPA (Sains & Teknologi)',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bgLight: 'bg-emerald-50/60',
    borderClass: 'border-emerald-300',
    textClass: 'text-emerald-700',
    deskripsi: 'Matematika Lanjut, Fisika, Kimia, dan Biologi untuk peminatan sains'
  },
  {
    id: 'IPS',
    label: 'IPS (Sosial & Humaniora)',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    bgLight: 'bg-amber-50/60',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-700',
    deskripsi: 'Sosiologi, Ekonomi, Geografi, Sejarah Lanjut, dan Antropologi'
  },
  {
    id: 'Bahasa & Budaya',
    label: 'Bahasa & Budaya',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    bgLight: 'bg-purple-50/60',
    borderClass: 'border-purple-300',
    textClass: 'text-purple-700',
    deskripsi: 'Bahasa Indonesia/Inggris Lanjut dan Bahasa Asing pilihan (Jepang, Jerman, dll)'
  },
  {
    id: 'Vokasi & Mulok',
    label: 'PKWU & Muatan Lokal',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    bgLight: 'bg-rose-50/60',
    borderClass: 'border-rose-300',
    textClass: 'text-rose-700',
    deskripsi: 'Prakarya Kewirausahaan, Bahasa Daerah, dan kearifan lokal sekolah'
  },
  {
    id: 'Bimbingan Konseling (BK)',
    label: 'Bimbingan & Konseling (BK)',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    bgLight: 'bg-teal-50/60',
    borderClass: 'border-teal-300',
    textClass: 'text-teal-700',
    deskripsi: 'Layanan bimbingan pribadi, sosial, belajar, dan karir/studi lanjut'
  },
  {
    id: 'Lainnya',
    label: 'Lainnya / Tugas Khusus',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    bgLight: 'bg-slate-50/60',
    borderClass: 'border-slate-300',
    textClass: 'text-slate-700',
    deskripsi: 'Tugas kepemimpinan manajemen sekolah atau penugasan khusus'
  }
];

export const TINGKAT_KELAS_SMA: { id: TingkatKelas; fase: string; label: string }[] = [
  { id: 'Kelas X', fase: 'Fase E (Pondasi Umum SMA)', label: 'Kelas X' },
  { id: 'Kelas XI', fase: 'Fase F (Peminatan / Pilihan)', label: 'Kelas XI' },
  { id: 'Kelas XII', fase: 'Fase F (Peminatan / Persiapan PTN)', label: 'Kelas XII' }
];

export const DAFTAR_MAPEL_SMA_STANDAR: MapelSMAItem[] = [
  // 1. Rumpun Umum / Wajib
  { nama: 'Pendidikan Agama Islam & Budi Pekerti', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 3, kategori: 'Wajib' },
  { nama: 'Pendidikan Agama Kristen & Budi Pekerti', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 3, kategori: 'Wajib' },
  { nama: 'Pendidikan Agama Katolik & Budi Pekerti', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 3, kategori: 'Wajib' },
  { nama: 'Pendidikan Pancasila (PPKn)', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 2, kategori: 'Wajib' },
  { nama: 'Bahasa Indonesia', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 4, kategori: 'Wajib' },
  { nama: 'Matematika (Umum)', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 4, kategori: 'Wajib' },
  { nama: 'Bahasa Inggris', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 2, kategori: 'Wajib' },
  { nama: 'Sejarah (Umum)', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 2, kategori: 'Wajib' },
  { nama: 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 3, kategori: 'Wajib' },
  { nama: 'Seni Rupa', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 2, kategori: 'Wajib' },
  { nama: 'Seni Musik', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 2, kategori: 'Wajib' },
  { nama: 'Seni Tari', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 2, kategori: 'Wajib' },
  { nama: 'Seni Teater', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 2, kategori: 'Wajib' },
  { nama: 'Informatika', rumpun: 'Umum/Wajib', jamStandarPerMinggu: 3, kategori: 'Wajib' },

  // 2. Rumpun MIPA
  { nama: 'Matematika Tingkat Lanjut', rumpun: 'MIPA', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Fisika', rumpun: 'MIPA', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Kimia', rumpun: 'MIPA', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Biologi', rumpun: 'MIPA', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },

  // 3. Rumpun IPS
  { nama: 'Sosiologi', rumpun: 'IPS', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Ekonomi', rumpun: 'IPS', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Geografi', rumpun: 'IPS', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Sejarah Tingkat Lanjut', rumpun: 'IPS', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Antropologi', rumpun: 'IPS', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },

  // 4. Rumpun Bahasa & Budaya
  { nama: 'Bahasa & Sastra Indonesia Tingkat Lanjut', rumpun: 'Bahasa & Budaya', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Bahasa & Sastra Inggris Tingkat Lanjut', rumpun: 'Bahasa & Budaya', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Bahasa Jepang', rumpun: 'Bahasa & Budaya', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Bahasa Jerman', rumpun: 'Bahasa & Budaya', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Bahasa Mandarin', rumpun: 'Bahasa & Budaya', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Bahasa Prancis', rumpun: 'Bahasa & Budaya', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Bahasa Arab', rumpun: 'Bahasa & Budaya', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },
  { nama: 'Bahasa Korea', rumpun: 'Bahasa & Budaya', jamStandarPerMinggu: 5, kategori: 'Peminatan/Pilihan' },

  // 5. Vokasi / PKWU / Mulok
  { nama: 'Prakarya dan Kewirausahaan (PKWU)', rumpun: 'Vokasi & Mulok', jamStandarPerMinggu: 2, kategori: 'Muatan Lokal' },
  { nama: 'Bahasa Daerah / Bahasa Jawa', rumpun: 'Vokasi & Mulok', jamStandarPerMinggu: 2, kategori: 'Muatan Lokal' },
  { nama: 'Bahasa Sunda', rumpun: 'Vokasi & Mulok', jamStandarPerMinggu: 2, kategori: 'Muatan Lokal' },
  { nama: 'Pendidikan Lingkungan Hidup (PLH)', rumpun: 'Vokasi & Mulok', jamStandarPerMinggu: 2, kategori: 'Muatan Lokal' },

  // 6. Bimbingan Konseling (BK)
  { nama: 'Bimbingan dan Konseling (BK)', rumpun: 'Bimbingan Konseling (BK)', jamStandarPerMinggu: 24, kategori: 'Layanan' }
];

export function detectRumpunMapel(mapelName: string): RumpunMapel {
  const str = mapelName.toLowerCase();

  // BK
  if (str.includes('bk') || str.includes('bimbingan') || str.includes('konseling')) {
    return 'Bimbingan Konseling (BK)';
  }

  // MIPA
  if (
    str.includes('fisika') ||
    str.includes('kimia') ||
    str.includes('biologi') ||
    str.includes('matematika peminatan') ||
    str.includes('matematika tingkat lanjut') ||
    str.includes('ipa')
  ) {
    return 'MIPA';
  }

  // IPS
  if (
    str.includes('sosiologi') ||
    str.includes('ekonomi') ||
    str.includes('geografi') ||
    str.includes('antropologi') ||
    str.includes('sejarah lanjut') ||
    str.includes('ips')
  ) {
    return 'IPS';
  }

  // Bahasa & Budaya
  if (
    str.includes('jepang') ||
    str.includes('jerman') ||
    str.includes('mandarin') ||
    str.includes('prancis') ||
    str.includes('arab') ||
    str.includes('korea') ||
    str.includes('sastra inggris') ||
    str.includes('sastra indonesia')
  ) {
    return 'Bahasa & Budaya';
  }

  // Vokasi & Mulok
  if (
    str.includes('pkwu') ||
    str.includes('prakarya') ||
    str.includes('kewirausahaan') ||
    str.includes('daerah') ||
    str.includes('jawa') ||
    str.includes('sunda') ||
    str.includes('plh')
  ) {
    return 'Vokasi & Mulok';
  }

  // Umum
  if (
    str.includes('agama') ||
    str.includes('pancasila') ||
    str.includes('ppkn') ||
    str.includes('matematika') ||
    str.includes('indonesia') ||
    str.includes('inggris') ||
    str.includes('sejarah') ||
    str.includes('pjok') ||
    str.includes('olahraga') ||
    str.includes('penjas') ||
    str.includes('seni') ||
    str.includes('informatika') ||
    str.includes('tik')
  ) {
    return 'Umum/Wajib';
  }

  return 'Lainnya';
}

export function getRumpunMeta(rumpun?: RumpunMapel) {
  const found = RUMPUN_MAPEL_LIST.find((r) => r.id === rumpun);
  if (found) return found;
  return RUMPUN_MAPEL_LIST[RUMPUN_MAPEL_LIST.length - 1]; // Lainnya
}
