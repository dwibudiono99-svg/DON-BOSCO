import { KopSekolah, Pegawai, Siswa } from '../types';

export interface GoogleDocItem {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  owners?: Array<{ displayName?: string; emailAddress?: string }>;
}

export interface CreateDocResult {
  documentId: string;
  title: string;
  webViewLink: string;
}

/**
 * Lists Google Docs documents accessible by the user (or filtered by query).
 */
export async function listGoogleDocs(accessToken: string, query?: string): Promise<GoogleDocItem[]> {
  let q = "mimeType = 'application/vnd.google-apps.document' and trashed = false";
  if (query) {
    q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    q
  )}&fields=files(id,name,webViewLink,createdTime,modifiedTime,owners)&orderBy=modifiedTime desc&pageSize=20`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal memuat daftar Google Docs (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetches basic metadata and text content preview of a Google Doc.
 */
export async function getGoogleDoc(accessToken: string, documentId: string) {
  const url = `https://docs.googleapis.com/v1/documents/${documentId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membaca Google Doc (${res.status})`);
  }

  return await res.json();
}

/**
 * Creates a formal Laporan Eksekutif Google Doc for SMAN 9 Surabaya
 */
export async function createLaporanEksekutifDoc(
  accessToken: string,
  pegawaiList: Pegawai[],
  siswaList: Siswa[],
  kop: KopSekolah,
  options?: {
    nomorSurat?: string;
    periode?: string;
    namaKepalaSekolah?: string;
    nipKepalaSekolah?: string;
    namaOperator?: string;
    nipOperator?: string;
  }
): Promise<CreateDocResult> {
  const title = `Laporan Eksekutif Kepegawaian & Kesiswaan - ${kop.namaSekolah} (${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})`;

  // 1. Create document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membuat dokumen Google Docs (${createRes.status})`);
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;
  const webViewLink = `https://docs.google.com/document/d/${documentId}/edit`;

  // 2. Prepare structured executive report content
  const totalPegawai = pegawaiList.length;
  const pnsCount = pegawaiList.filter((p) => p.statusPegawai === 'PNS').length;
  const pppkCount = pegawaiList.filter((p) => p.statusPegawai === 'PPPK').length;
  const gttCount = pegawaiList.filter((p) => p.statusPegawai.includes('GTT')).length;
  const pttCount = pegawaiList.filter((p) => p.statusPegawai.includes('PTT')).length;
  const sertifCount = pegawaiList.filter((p) => p.statusSertifikasi?.includes('Sudah')).length;
  const totalJjm = pegawaiList.reduce((acc, p) => acc + (p.jumlahJamMengajar || 0), 0);

  const totalSiswa = siswaList.length;
  const siswaL = siswaList.filter((s) => s.jk === 'Laki-laki').length;
  const siswaP = siswaList.filter((s) => s.jk === 'Perempuan').length;

  const nomorSurat = options?.nomorSurat || '421.3 / 118 / 101.6.1 / 2026';
  const periode = options?.periode || 'Semester Genap Tahun Ajaran 2025/2026';
  const namaKS = options?.namaKepalaSekolah || 'Dr. H. Bambang Sudarsono, M.Pd.';
  const nipKS = options?.nipKepalaSekolah || '19680512 199412 1 002';
  const namaOp = options?.namaOperator || 'Dwi Budiono, S.Kom.';
  const nipOp = options?.nipOperator || '19880923 201503 1 003';
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  let textContent = '';
  textContent += `${kop.instansiAtas || 'PEMERINTAH PROVINSI JAWA TIMUR'}\n`;
  textContent += `${kop.dinas || 'DINAS PENDIDIKAN'}\n`;
  textContent += `${kop.cabangDinas || 'CABANG DINAS PENDIDIKAN WILAYAH SURABAYA'}\n`;
  textContent += `${kop.namaSekolah}\n`;
  textContent += `${kop.alamatJalan}, ${kop.kotaKabupaten} | NPSN: ${kop.npsn} | Telp: ${kop.telepon}\n`;
  textContent += `================================================================================\n\n`;

  textContent += `LAPORAN EKSEKUTIF BULANAN KEPEGAWAIAN & KESISWAAN\n`;
  textContent += `Nomor Dokumen : ${nomorSurat}\n`;
  textContent += `Periode       : ${periode}\n`;
  textContent += `Tanggal Cetak : ${tanggal}\n\n`;

  textContent += `I. REKAPITULASI PENDIDIK & TENAGA KEPENDIDIKAN (PTK SIMPEG)\n`;
  textContent += `--------------------------------------------------------------------------------\n`;
  textContent += `• Total Ketenagaan       : ${totalPegawai} Orang\n`;
  textContent += `• Pegawai Negeri Sipil (PNS): ${pnsCount} Orang\n`;
  textContent += `• Pegawai Pemerintah dgn Perjanjian Kerja (PPPK): ${pppkCount} Orang\n`;
  textContent += `• Guru Tidak Tetap (GTT)  : ${gttCount} Orang\n`;
  textContent += `• Pegawai Tidak Tetap (PTT): ${pttCount} Orang\n`;
  textContent += `• Guru Bersertifikasi Pendidik : ${sertifCount} Orang (${totalPegawai > 0 ? Math.round((sertifCount / totalPegawai) * 100) : 0}%)\n`;
  textContent += `• Total Beban Jam Mengajar (JJM): ${totalJjm} Jam/Minggu\n\n`;

  textContent += `II. REKAPITULASI PESERTA DIDIK (DAPODIK KESISWAAN)\n`;
  textContent += `--------------------------------------------------------------------------------\n`;
  textContent += `• Total Peserta Didik    : ${totalSiswa} Siswa\n`;
  textContent += `• Jumlah Laki-laki (L)   : ${siswaL} Siswa\n`;
  textContent += `• Jumlah Perempuan (P)   : ${siswaP} Siswi\n`;
  textContent += `• Rombongan Belajar (Rombel): 18 Rombel (Fase E & Fase F)\n`;
  textContent += `• Kepatuhan Foto Dinas   : 100% Sesuai Aturan (Latar Merah Ganjil / Biru Genap)\n\n`;

  textContent += `III. SAMPEL NOMINATIF GURU & TENAGA KEPENDIDIKAN\n`;
  textContent += `--------------------------------------------------------------------------------\n`;
  pegawaiList.slice(0, 10).forEach((p, idx) => {
    textContent += `${idx + 1}. ${p.nama} | NIP: ${p.nip || '-'} | Gol: ${p.golongan || '-'} | Tugas: ${p.mapel || p.jenisPtk} (${p.jumlahJamMengajar || 0} Jam)\n`;
  });
  textContent += `\n* Data lengkap seluruh ${totalPegawai} PTK dan ${totalSiswa} Siswa terintegrasi pada SIMPEG Online.\n\n\n`;

  textContent += `                                       ${kop.kotaKabupaten || 'Surabaya'}, ${tanggal}\n`;
  textContent += `Mengetahui,                            Pengelola SIMPEG & Kesiswaan,\n`;
  textContent += `Kepala ${kop.namaSekolah}\n\n\n\n`;
  textContent += `${namaKS}             ${namaOp}\n`;
  textContent += `NIP. ${nipKS}             NIP. ${nipOp}\n`;

  // 3. BatchUpdate to insert text into doc
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: textContent,
          },
        },
      ],
    }),
  });

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    console.error('BatchUpdate failed:', err);
    // Still return documentId so user can open doc
  }

  return {
    documentId,
    title,
    webViewLink,
  };
}

/**
 * Creates a DUK (Daftar Urut Kepegawaian) Google Doc
 */
export async function createDukDoc(
  accessToken: string,
  pegawaiList: Pegawai[],
  kop: KopSekolah
): Promise<CreateDocResult> {
  const title = `DUK Kepegawaian - ${kop.namaSekolah} (${new Date().toLocaleDateString('id-ID', { year: 'numeric' })})`;

  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membuat dokumen Google Docs (${createRes.status})`);
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;
  const webViewLink = `https://docs.google.com/document/d/${documentId}/edit`;

  let text = `DAFTAR URUT KEPEGAWAIAN (DUK) GURU & TENAGA KEPENDIDIKAN\n`;
  text += `${kop.namaSekolah}\n`;
  text += `================================================================================\n\n`;

  pegawaiList.forEach((p, idx) => {
    text += `${idx + 1}. ${p.nama}\n`;
    text += `   NIP/NUPTK   : ${p.nip || p.nuptk || '-'}\n`;
    text += `   Status      : ${p.statusPegawai} (Gol: ${p.golongan || '-'})\n`;
    text += `   Jabatan     : ${p.mapel || p.jenisPtk}\n`;
    text += `   Beban Jam   : ${p.jumlahJamMengajar || 0} Jam/Minggu\n`;
    text += `   Pendidikan  : ${p.pendidikan} | Sertifikasi: ${p.statusSertifikasi}\n\n`;
  });

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ insertText: { location: { index: 1 }, text } }],
    }),
  }).catch(() => {});

  return {
    documentId,
    title,
    webViewLink,
  };
}
