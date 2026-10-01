export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export type StatusPegawai =
  | 'PNS'
  | 'PPPK'
  | 'GTT (Guru Tidak Tetap)'
  | 'PTT (Pegawai Tidak Tetap)';

export type JenisPtk =
  | 'Guru Mapel'
  | 'Guru BK'
  | 'Kepala Sekolah'
  | 'Wakil Kepala Sekolah'
  | 'Tenaga Administrasi (TU)'
  | 'Pustakawan'
  | 'Laboran'
  | 'Petugas Keamanan'
  | 'Kebersihan';

export type Pendidikan = 'SMA/SMK' | 'D3' | 'S1/D4' | 'S2' | 'S3';

export type RumpunMapel =
  | 'Umum/Wajib'
  | 'MIPA'
  | 'IPS'
  | 'Bahasa & Budaya'
  | 'Vokasi & Mulok'
  | 'Bimbingan Konseling (BK)'
  | 'Lainnya';

export type TingkatKelas = 'Kelas X' | 'Kelas XI' | 'Kelas XII';

export type StatusSertifikasi = 'Sudah Sertifikasi' | 'Belum Sertifikasi';

export type StatusPernikahan = 'Menikah' | 'Belum Menikah' | 'Duda / Janda';

export interface DataPasangan {
  nama: string;
  nik?: string;
  pekerjaan?: string;
  pekerjaanKategori?: 'PNS/ASN' | 'TNI/Polri' | 'BUMN' | 'Karyawan Swasta' | 'Wiraswasta' | 'Ibu Rumah Tangga' | 'Tidak Bekerja' | 'Lainnya';
  tempatLahir?: string;
  tanggalLahir?: string;
  noHp?: string;
  statusTunjangan?: 'Dapat Tunjangan' | 'Tidak Dapat Tunjangan';
  instansiTempatKerja?: string;
}

export interface DataAnak {
  id: string;
  nama: string;
  nik?: string;
  jk: JenisKelamin;
  tempatLahir?: string;
  tanggalLahir?: string;
  statusAnak: 'Anak Kandung' | 'Anak Tiri' | 'Anak Angkat';
  statusTunjangan: 'Dapat Tunjangan' | 'Tidak Dapat Tunjangan' | 'Sudah Bekerja/Menikah';
  pendidikan?: 'Belum Sekolah' | 'PAUD/TK' | 'SD/MI' | 'SMP/MTs' | 'SMA/SMK' | 'Diploma/Sarjana';
  akteKelahiranData?: string; // Data URL file akte anak
  akteKelahiranName?: string;
}

export interface DokumenKeluarga {
  kartuKeluarga?: string; // Data URL or base64
  kartuKeluargaName?: string;
  bukuNikah?: string;
  bukuNikahName?: string;
  akteKelahiranPegawai?: string;
  akteKelahiranPegawaiName?: string;
  akteKelahiranPasangan?: string;
  akteKelahiranPasanganName?: string;
}

export interface BerkasPegawai {
  id: string;
  nama: string;
  kategori: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileData: string; // Base64 data URL
  uploadedAt: string;
}

export interface Pegawai {
  id: number;
  nip: string;
  nama: string;
  jk: JenisKelamin;
  statusPegawai: StatusPegawai;
  jenisPtk: JenisPtk;
  mapel: string;
  golongan: string;
  pendidikan: Pendidikan;
  noHp: string;
  email?: string;
  nuptk?: string;
  tmt?: string; // Tanggal Mulai Tugas
  foto?: string; // Base64 data URL atau URL gambar
  berkas?: BerkasPegawai[];
  // Rincian Guru Mapel SMA (Kurikulum Merdeka / Nasional SMA)
  rumpunMapel?: RumpunMapel;
  tingkatKelas?: TingkatKelas[];
  jumlahJamMengajar?: number; // JJM per minggu (standar 24 jam untuk sertifikasi)
  statusSertifikasi?: StatusSertifikasi;
  tugasTambahan?: string; // e.g., 'Wali Kelas X-1', 'Kepala Lab Fisika', 'Pembina OSIS'
  // Data Keluarga & Kependudukan PTK
  nikPegawai?: string; // 16 digit NIK KTP Pegawai
  nomorKK?: string; // 16 digit No Kartu Keluarga
  statusPernikahan?: StatusPernikahan;
  pasangan?: DataPasangan;
  anak?: DataAnak[];
  dokumenKeluarga?: DokumenKeluarga;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface KopSekolah {
  instansiAtas: string; // e.g. "PEMERINTAH PROVINSI JAWA TIMUR"
  dinas: string; // e.g. "DINAS PENDIDIKAN"
  cabangDinas: string; // e.g. "CABANG DINAS PENDIDIKAN WILAYAH KOTA MALANG"
  namaSekolah: string; // e.g. "SMA NEGERI 1 TELADAN"
  statusAkreditasi: string; // e.g. "Akreditasi A"
  npsn: string; // e.g. "20533812"
  nss?: string; // e.g. "301056001001"
  alamatJalan: string; // e.g. "Jl. Pendidikan No. 45, Kompleks Pendidikan Nasional"
  kelurahanDesa?: string; // e.g. "Kelurahan Lowokwaru"
  kecamatan?: string; // e.g. "Kecamatan Lowokwaru"
  kotaKabupaten: string; // e.g. "Kota Malang"
  provinsi: string; // e.g. "Jawa Timur"
  kodePos: string; // e.g. "65141"
  telepon: string; // e.g. "(0341) 551234"
  faks?: string; // e.g. "(0341) 551235"
  email: string; // e.g. "info@sman1teladan.sch.id"
  website: string; // e.g. "www.sman1teladan.sch.id"
  logoKiri: string; // Data URL or SVG string (e.g. Lambang Provinsi / Tut Wuri Handayani)
  logoKanan?: string; // Data URL or SVG string (e.g. Logo Sekolah SMA)
  tampilkanLogoKanan: boolean;
}

// ==========================================
// TIPE DATA KESISWAAN (SISWA / PESERTA DIDIK)
// SESUAI ATURAN DINAS PENDIDIKAN & DAPODIK
// ==========================================

export type StatusSiswa = 'Aktif' | 'Lulus' | 'Mutasi/Pindah' | 'Non-Aktif';

export type AgamaSiswa =
  | 'Islam'
  | 'Kristen Protestan'
  | 'Katolik'
  | 'Hindu'
  | 'Buddha'
  | 'Konghucu';

export type FaseKurikulum = 'Fase E (Kelas X)' | 'Fase F (Kelas XI - XII)';

export interface Siswa {
  id: number;
  nisn: string; // 10 digit resmi Kemendikbud
  nis: string; // Nomor Induk Siswa Sekolah
  nik: string; // 16 digit NIK Dukcapil
  nama: string;
  jk: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string; // Format YYYY-MM-DD
  agama: AgamaSiswa;
  tingkatKelas: TingkatKelas;
  rombel: string; // e.g. "X-1", "XI MIPA 1", "XII IPS 2"
  faseKurikulum: FaseKurikulum;
  peminatan: string; // e.g. "MIPA (Fisika, Kimia, Biologi)", "IPS (Ekonomi, Sosiologi)"
  statusSiswa: StatusSiswa;
  alamat: string;
  kelurahan?: string;
  kecamatan?: string;
  kotaKab: string;
  noHpSiswa?: string;
  email?: string; // e.g. akun belajar.id siswa
  // Data Orang Tua / Wali
  namaAyah: string;
  pekerjaanAyah?: string;
  namaIbu: string;
  pekerjaanIbu?: string;
  namaWali?: string;
  noHpOrtu: string;
  waliKelas: string;
  prestasi?: string;
  ekskul?: string;
  // Pas foto resmi aturan dinas (Latar Merah / Biru, Seragam Putih Abu-abu SMA dengan badge OSIS)
  foto?: string;
  fotoBgColor?: 'Merah (Tahun Lahir Ganjil)' | 'Biru (Tahun Lahir Genap)';
  berkasSiswa?: BerkasPegawai[];
  catatanKhusus?: string;
}

// ==========================================
// GOOGLE FORMS INTEGRATION TYPES
// ==========================================

export interface GoogleFormItem {
  id: string;
  name: string;
  title?: string;
  responderUri?: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  responseCount?: number;
}

export interface GoogleFormQuestion {
  questionId: string;
  title: string;
  type: string;
}

export interface GoogleFormDetail {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle?: string;
  };
  responderUri?: string;
  items?: Array<{
    itemId: string;
    title: string;
    description?: string;
    questionItem?: {
      question: {
        questionId: string;
        required?: boolean;
      };
    };
  }>;
}

export interface GoogleFormResponseAnswer {
  questionId: string;
  textAnswers?: {
    answers: Array<{ value: string }>;
  };
}

export interface GoogleFormSubmission {
  responseId: string;
  createTime: string;
  lastSubmittedTime?: string;
  respondentEmail?: string;
  answers?: Record<string, GoogleFormResponseAnswer>;
}

// ==========================================
// GOOGLE SHEETS INTEGRATION TYPES
// ==========================================

export interface GoogleSheetItem {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

export interface GoogleSheetTab {
  sheetId: number;
  title: string;
  index: number;
  rowCount?: number;
  columnCount?: number;
}

export interface GoogleSpreadsheetDetail {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheets: GoogleSheetTab[];
}

export interface SyncHistoryEntry {
  id: string;
  timestamp: string;
  type: 'export_pegawai' | 'export_siswa' | 'import_pegawai' | 'import_siswa' | 'create_sheet';
  spreadsheetId: string;
  spreadsheetTitle: string;
  rowCount: number;
  status: 'success' | 'error';
  details?: string;
}



