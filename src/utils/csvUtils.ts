import { Pegawai, JenisKelamin, StatusPegawai, JenisPtk, Pendidikan, Siswa, TingkatKelas } from '../types';
import { createOfficialSiswaPhoto } from '../data/initialSiswaData';

export function exportPegawaiToCSV(data: Pegawai[], filenamePrefix = 'SIMPEG_SMAN_Data_Pegawai'): void {
  if (data.length === 0) {
    throw new Error('Tidak ada data untuk diekspor.');
  }

  // UTF-8 BOM for Microsoft Excel Indonesian locale compatibility
  let csvContent = '\uFEFF';
  const headers = [
    'No',
    'NIP/NIPPPK',
    'Nama Lengkap & Gelar',
    'Jenis Kelamin',
    'Status Kepegawaian',
    'Jenis PTK',
    'Mata Pelajaran / Tugas Utama',
    'Golongan',
    'Pendidikan',
    'No HP/WhatsApp',
    'Email',
    'NUPTK',
    'TMT'
  ];

  csvContent += headers.join(';') + '\n';

  data.forEach((item, index) => {
    const row = [
      (index + 1).toString(),
      `'${item.nip || ''}`, // Prefix with single quote to preserve leading zeros in Excel
      `"${(item.nama || '').replace(/"/g, '""')}"`,
      `"${item.jk || 'Laki-laki'}"`,
      `"${item.statusPegawai || 'PNS'}"`,
      `"${item.jenisPtk || 'Guru Mapel'}"`,
      `"${(item.mapel || '').replace(/"/g, '""')}"`,
      `"${item.golongan || '-'}"`,
      `"${item.pendidikan || 'S1/D4'}"`,
      `'${item.noHp || ''}`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `'${item.nuptk || ''}`,
      `"${item.tmt || ''}"`
    ];
    csvContent += row.join(';') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${filenamePrefix}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTemplateCSV(): void {
  let csvContent = '\uFEFF';
  const headers = [
    'NIP/NIPPPK',
    'Nama Lengkap & Gelar',
    'Jenis Kelamin',
    'Status Kepegawaian',
    'Jenis PTK',
    'Mata Pelajaran / Tugas Utama',
    'Golongan',
    'Pendidikan',
    'No HP/WhatsApp',
    'Email',
    'NUPTK',
    'TMT'
  ];

  csvContent += headers.join(';') + '\n';
  csvContent += `'198501152010011005;"Ahmad Syaifullah, M.Pd.";"Laki-laki";"PNS";"Guru Mapel";"Matematika";"III/c (Penata)";"S2";'081234567890;"ahmad@sman.sch.id";'4534754656200032;"2010-01-01"\n`;
  csvContent += `'199203102023212004;"Dewi Lestari, S.Pd.";"Perempuan";"PPPK";"Guru Mapel";"Bahasa Inggris";"IX (PPPK)";"S1/D4";'081987654321;"dewi@sman.sch.id";'9845760662210023;"2023-04-01"\n`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Template_Import_Pegawai_SIMPEG.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parsePegawaiCSV(file: File): Promise<Pegawai[]> {
  const text = await file.text();
  const cleanText = text.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r\n|\n/);

  if (lines.length < 2) {
    throw new Error('File CSV kosong atau tidak memiliki baris data.');
  }

  // Detect delimiter: semicolon or comma
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  const importedList: Pegawai[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Parse respecting quoted strings
    const cols = parseCSVRow(rawLine, delimiter);
    if (cols.length < 3) continue;

    // Check if first column is numeric row number (like 'No')
    let colOffset = 0;
    if (!isNaN(Number(cols[0])) && cols[0].length <= 4 && cols.length >= 6) {
      colOffset = 1;
    }

    const nip = cleanCol(cols[0 + colOffset]) || `PTK-${Date.now().toString().slice(-6)}-${i}`;
    const nama = cleanCol(cols[1 + colOffset]);
    if (!nama) continue;

    const rawJk = cleanCol(cols[2 + colOffset]).toLowerCase();
    const jk: JenisKelamin = rawJk.startsWith('p') ? 'Perempuan' : 'Laki-laki';

    const rawStatus = cleanCol(cols[3 + colOffset]);
    let statusPegawai: StatusPegawai = 'PNS';
    if (rawStatus.toUpperCase().includes('PPPK')) statusPegawai = 'PPPK';
    else if (rawStatus.toUpperCase().includes('GTT')) statusPegawai = 'GTT (Guru Tidak Tetap)';
    else if (rawStatus.toUpperCase().includes('PTT')) statusPegawai = 'PTT (Pegawai Tidak Tetap)';
    else if (rawStatus.toUpperCase().includes('PNS')) statusPegawai = 'PNS';

    const rawPtk = cleanCol(cols[4 + colOffset]);
    let jenisPtk: JenisPtk = 'Guru Mapel';
    if (rawPtk.toLowerCase().includes('bk')) jenisPtk = 'Guru BK';
    else if (rawPtk.toLowerCase().includes('kepala sekolah') && !rawPtk.toLowerCase().includes('wakil')) jenisPtk = 'Kepala Sekolah';
    else if (rawPtk.toLowerCase().includes('wakil')) jenisPtk = 'Wakil Kepala Sekolah';
    else if (rawPtk.toLowerCase().includes('tu') || rawPtk.toLowerCase().includes('administrasi')) jenisPtk = 'Tenaga Administrasi (TU)';
    else if (rawPtk.toLowerCase().includes('perpus') || rawPtk.toLowerCase().includes('pustakawan')) jenisPtk = 'Pustakawan';
    else if (rawPtk.toLowerCase().includes('labor')) jenisPtk = 'Laboran';
    else if (rawPtk.toLowerCase().includes('keamanan') || rawPtk.toLowerCase().includes('satpam')) jenisPtk = 'Petugas Keamanan';
    else if (rawPtk.toLowerCase().includes('bersih')) jenisPtk = 'Kebersihan';

    const mapel = cleanCol(cols[5 + colOffset]) || 'Umum';
    const golongan = cleanCol(cols[6 + colOffset]) || '-';
    
    const rawPend = cleanCol(cols[7 + colOffset]).toUpperCase();
    let pendidikan: Pendidikan = 'S1/D4';
    if (rawPend.includes('S3')) pendidikan = 'S3';
    else if (rawPend.includes('S2')) pendidikan = 'S2';
    else if (rawPend.includes('D3')) pendidikan = 'D3';
    else if (rawPend.includes('SMA') || rawPend.includes('SMK')) pendidikan = 'SMA/SMK';

    const noHp = cleanCol(cols[8 + colOffset]);
    const email = cleanCol(cols[9 + colOffset]);
    const nuptk = cleanCol(cols[10 + colOffset]);
    const tmt = cleanCol(cols[11 + colOffset]);

    importedList.push({
      id: Date.now() + i + Math.floor(Math.random() * 1000),
      nip,
      nama,
      jk,
      statusPegawai,
      jenisPtk,
      mapel,
      golongan,
      pendidikan,
      noHp,
      email: email || undefined,
      nuptk: nuptk || undefined,
      tmt: tmt || undefined
    });
  }

  if (importedList.length === 0) {
    throw new Error('Tidak ada data valid yang dapat dibaca dari file CSV.');
  }

  return importedList;
}

function cleanCol(val?: string): string {
  if (!val) return '';
  return val.replace(/^["']|["']$/g, '').trim();
}

function parseCSVRow(row: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ==========================================
// CSV UTILITIES UNTUK DATA SISWA SMA
// ==========================================

export function exportSiswaToCSV(data: Siswa[], filenamePrefix = 'SIMPEG_SMAN_Data_Siswa'): void {
  if (data.length === 0) {
    throw new Error('Tidak ada data siswa untuk diekspor.');
  }

  let csvContent = '\uFEFF';
  const headers = [
    'No',
    'NISN',
    'NIS',
    'NIK',
    'Nama Lengkap Siswa',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Agama',
    'Tingkat Kelas',
    'Rombel',
    'Peminatan',
    'Status Siswa',
    'Alamat Lengkap',
    'Kota/Kabupaten',
    'No HP Siswa',
    'Email Belajar.id',
    'Nama Ayah',
    'Pekerjaan Ayah',
    'Nama Ibu',
    'Pekerjaan Ibu',
    'No HP Ortu/Wali',
    'Wali Kelas',
    'Prestasi & Ekskul'
  ];

  csvContent += headers.join(';') + '\n';

  data.forEach((item, index) => {
    const row = [
      (index + 1).toString(),
      `'${item.nisn || ''}`,
      `'${item.nis || ''}`,
      `'${item.nik || ''}`,
      `"${(item.nama || '').replace(/"/g, '""')}"`,
      `"${item.jk || 'Laki-laki'}"`,
      `"${(item.tempatLahir || '').replace(/"/g, '""')}"`,
      `"${item.tanggalLahir || ''}"`,
      `"${item.agama || 'Islam'}"`,
      `"${item.tingkatKelas || 'Kelas X'}"`,
      `"${item.rombel || 'X-1'}"`,
      `"${(item.peminatan || '').replace(/"/g, '""')}"`,
      `"${item.statusSiswa || 'Aktif'}"`,
      `"${(item.alamat || '').replace(/"/g, '""')}"`,
      `"${(item.kotaKab || 'Kota Surabaya').replace(/"/g, '""')}"`,
      `'${item.noHpSiswa || ''}`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.namaAyah || '').replace(/"/g, '""')}"`,
      `"${(item.pekerjaanAyah || '').replace(/"/g, '""')}"`,
      `"${(item.namaIbu || '').replace(/"/g, '""')}"`,
      `"${(item.pekerjaanIbu || '').replace(/"/g, '""')}"`,
      `'${item.noHpOrtu || ''}`,
      `"${(item.waliKelas || '').replace(/"/g, '""')}"`,
      `"${(item.prestasi ? `${item.prestasi} (${item.ekskul || ''})` : item.ekskul || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(';') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${filenamePrefix}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTemplateSiswaCSV(): void {
  let csvContent = '\uFEFF';
  const headers = [
    'NISN',
    'NIS',
    'NIK',
    'Nama Lengkap Siswa',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Agama',
    'Tingkat Kelas',
    'Rombel',
    'Peminatan',
    'Status Siswa',
    'Alamat Lengkap',
    'Kota/Kabupaten',
    'No HP Siswa',
    'Email Belajar.id',
    'Nama Ayah',
    'Pekerjaan Ayah',
    'Nama Ibu',
    'Pekerjaan Ibu',
    'No HP Ortu/Wali',
    'Wali Kelas'
  ];

  csvContent += headers.join(';') + '\n';
  csvContent += `'0075421980;'23241001;'3578011505070001;"Muhammad Arya Pratama";"Laki-laki";"Surabaya";"2007-05-15";"Islam";"Kelas XI";"XI MIPA 1";"MIPA (Fisika, Kimia, Biologi)";"Aktif";"Jl. Dharmawangsa No. 42";"Kota Surabaya";'081234987650;"m.arya@siswa.sma.belajar.id";"Bambang Sudarmanto";"Wiraswasta";"Endang Sri Wahyuni";"Guru";'081233445566;"Siti Rahmawati, S.Pd."\n`;
  csvContent += `'0081239845;'23241002;'3578024808080002;"Aisyah Putri Azzahra";"Perempuan";"Surabaya";"2008-08-18";"Islam";"Kelas X";"X-1";"Kurikulum Merdeka";"Aktif";"Jl. Menur Pumpungan V No. 12";"Kota Surabaya";'082199887766;"aisyah.putri@siswa.sma.belajar.id";"Ahmad Syukron";"Karyawan BUMN";"Nurul Azizah";"Ibu Rumah Tangga";'081377889900;"Ahmad Fauzi, S.Pd."\n`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Template_Import_Siswa_SMA.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parseSiswaCSV(file: File): Promise<Siswa[]> {
  const text = await file.text();
  const cleanText = text.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r\n|\n/);

  if (lines.length < 2) {
    throw new Error('File CSV kosong atau tidak memiliki baris data.');
  }

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const importedList: Siswa[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVRow(line, delimiter).map(cleanCol);
    if (cols.length < 5) continue;

    const nisn = cols[0] || `008${Math.floor(1000000 + Math.random() * 9000000)}`;
    const nis = cols[1] || `2324${1100 + i}`;
    const nik = cols[2] || `35780${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    const nama = cols[3] || `Siswa #${i}`;
    const rawJk = cols[4]?.toLowerCase();
    const jk: JenisKelamin = rawJk.includes('perempuan') || rawJk === 'p' ? 'Perempuan' : 'Laki-laki';
    const tempatLahir = cols[5] || 'Surabaya';
    const tanggalLahir = cols[6] || '2008-01-01';
    const agama: any = cols[7] || 'Islam';
    const tingkatKelas: TingkatKelas = (cols[8] as TingkatKelas) || 'Kelas X';
    const rombel = cols[9] || 'X-1';
    const peminatan = cols[10] || 'Kurikulum Merdeka';
    const statusSiswa: any = cols[11] || 'Aktif';
    const alamat = cols[12] || 'Jl. Raya Surabaya';
    const kotaKab = cols[13] || 'Kota Surabaya';
    const noHpSiswa = cols[14] || '';
    const email = cols[15] || '';
    const namaAyah = cols[16] || 'Orang Tua Siswa';
    const pekerjaanAyah = cols[17] || '';
    const namaIbu = cols[18] || 'Ibu Siswa';
    const pekerjaanIbu = cols[19] || '';
    const noHpOrtu = cols[20] || '';
    const waliKelas = cols[21] || 'Wali Kelas SMA';

    const birthYear = parseInt(tanggalLahir.split('-')[0]) || 2008;
    const isOdd = birthYear % 2 !== 0;
    const photoBg = isOdd ? 'red' : 'blue';

    importedList.push({
      id: Date.now() + i,
      nisn,
      nis,
      nik,
      nama,
      jk,
      tempatLahir,
      tanggalLahir,
      agama,
      tingkatKelas,
      rombel,
      faseKurikulum: tingkatKelas === 'Kelas X' ? 'Fase E (Kelas X)' : 'Fase F (Kelas XI - XII)',
      peminatan,
      statusSiswa,
      alamat,
      kotaKab,
      noHpSiswa,
      email,
      namaAyah,
      pekerjaanAyah,
      namaIbu,
      pekerjaanIbu,
      noHpOrtu,
      waliKelas,
      fotoBgColor: isOdd ? 'Merah (Tahun Lahir Ganjil)' : 'Biru (Tahun Lahir Genap)',
      foto: createOfficialSiswaPhoto(photoBg, jk === 'Laki-laki' ? 'L' : 'P', i)
    });
  }

  if (importedList.length === 0) {
    throw new Error('Tidak ada data siswa valid yang dapat dibaca dari file CSV.');
  }

  return importedList;
}

