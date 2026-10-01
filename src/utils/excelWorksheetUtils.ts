import { Pegawai, Siswa, KopSekolah } from '../types';

/**
 * Utility untuk mengekspor data ke Microsoft Excel (.xls) dengan styling lembar kerja profesional,
 * border tabel, warna header resmi, format teks NIP/NISN/No HP (mso-number-format: "\@")
 * agar angka nol di depan tidak terpotong saat dibuka di Microsoft Excel atau LibreOffice Calc.
 */

// Helper untuk format tanggal Indonesia
function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Ekspor Lembar Kerja Excel PTK Kepegawaian (Format DUK & Pelaporan Dinas)
 */
export function exportPegawaiToExcelFormatted(
  data: Pegawai[],
  kop: KopSekolah,
  filename = `LEMBAR_KERJA_EXCEL_PTK_${kop.namaSekolah.replace(/\s+/g, '_')}`
): void {
  if (data.length === 0) {
    throw new Error('Tidak ada data pegawai untuk diekspor ke Excel.');
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const pnsCount = data.filter((p) => p.statusPegawai === 'PNS').length;
  const pppkCount = data.filter((p) => p.statusPegawai === 'PPPK').length;
  const gttCount = data.filter((p) => p.statusPegawai.includes('GTT')).length;
  const pttCount = data.filter((p) => p.statusPegawai.includes('PTT')).length;
  const totalJjm = data.reduce((acc, p) => acc + (p.jumlahJamMengajar || 0), 0);

  const excelHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Lembar Kerja PTK Pegawai</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:FitToPage/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; }
    table { border-collapse: collapse; width: 100%; }
    .kop-instansi { font-size: 12pt; font-weight: bold; text-align: center; color: #0f172a; }
    .kop-dinas { font-size: 13pt; font-weight: bold; text-align: center; color: #0f172a; }
    .kop-sekolah { font-size: 15pt; font-weight: 900; text-align: center; color: #1e3a8a; }
    .kop-alamat { font-size: 9pt; text-align: center; color: #475569; font-style: italic; }
    .kop-border { border-bottom: 2.5pt solid #0f172a; border-top: none; }
    .doc-title { font-size: 13pt; font-weight: bold; text-align: center; color: #107c41; padding: 10px 0 4px 0; }
    .doc-subtitle { font-size: 9.5pt; text-align: center; color: #64748b; margin-bottom: 12px; }
    
    .th-excel {
      background-color: #107c41;
      color: #ffffff;
      font-weight: bold;
      text-align: center;
      vertical-align: middle;
      border: 1pt solid #0a522a;
      padding: 8px 6px;
      font-size: 10pt;
    }
    .th-sub {
      background-color: #21a366;
      color: #ffffff;
      font-weight: bold;
      text-align: center;
      border: 1pt solid #0a522a;
      padding: 6px;
      font-size: 9.5pt;
    }
    .td-cell {
      border: 0.5pt solid #cbd5e1;
      padding: 6px 8px;
      font-size: 10pt;
      vertical-align: middle;
    }
    .td-center {
      text-align: center;
      border: 0.5pt solid #cbd5e1;
      padding: 6px;
      font-size: 10pt;
      vertical-align: middle;
    }
    .td-number {
      text-align: right;
      border: 0.5pt solid #cbd5e1;
      padding: 6px 8px;
      font-size: 10pt;
      vertical-align: middle;
    }
    .td-text {
      mso-number-format:"\\@";
      border: 0.5pt solid #cbd5e1;
      padding: 6px 8px;
      font-size: 10pt;
      vertical-align: middle;
    }
    .tr-even { background-color: #f8fafc; }
    .tr-odd { background-color: #ffffff; }
    .tr-total {
      background-color: #e2e8f0;
      font-weight: bold;
      border-top: 1.5pt solid #475569;
      border-bottom: 2pt double #0f172a;
    }
    .badge-pns { color: #166534; font-weight: bold; }
    .badge-pppk { color: #1e40af; font-weight: bold; }
    .badge-honorer { color: #b45309; font-weight: bold; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="15" class="kop-instansi">${kop.instansiAtas || 'PEMERINTAH PROVINSI JAWA TIMUR'}</td>
    </tr>
    <tr>
      <td colspan="15" class="kop-dinas">${kop.dinas || 'DINAS PENDIDIKAN'}</td>
    </tr>
    <tr>
      <td colspan="15" class="kop-sekolah">${kop.namaSekolah || 'SMA NEGERI 9 SURABAYA'}</td>
    </tr>
    <tr>
      <td colspan="15" class="kop-alamat">
        ${kop.alamatJalan || 'Jl. Wijaya Kusuma No. 48'}, ${kop.kotaKabupaten || 'Surabaya'}, ${kop.provinsi || 'Jawa Timur'} | Telp: ${kop.telepon || '(031) 5342112'} | NPSN: ${kop.npsn || '20532252'}
      </td>
    </tr>
    <tr>
      <td colspan="15" class="kop-border">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="15" class="doc-title">LEMBAR KERJA DATA PENDIDIK DAN TENAGA KEPENDIDIKAN (PTK)</td>
    </tr>
    <tr>
      <td colspan="15" class="doc-subtitle">Rekapitulasi Pelaporan SIMPEG BKN & Dapodik SMA | Tanggal Ekspor: ${currentDate}</td>
    </tr>
    <tr><td colspan="15">&nbsp;</td></tr>
  </table>

  <table>
    <thead>
      <tr>
        <th class="th-excel" style="width: 40px;">No</th>
        <th class="th-excel" style="width: 170px;">NIP / NIPPPK</th>
        <th class="th-excel" style="width: 220px;">Nama Lengkap & Gelar</th>
        <th class="th-excel" style="width: 60px;">L/P</th>
        <th class="th-excel" style="width: 110px;">Status</th>
        <th class="th-excel" style="width: 140px;">Jenis PTK</th>
        <th class="th-excel" style="width: 180px;">Mata Pelajaran / Tugas Utama</th>
        <th class="th-excel" style="width: 90px;">Golongan</th>
        <th class="th-excel" style="width: 80px;">Pendidikan</th>
        <th class="th-excel" style="width: 120px;">No HP/WA</th>
        <th class="th-excel" style="width: 180px;">Email</th>
        <th class="th-excel" style="width: 150px;">NUPTK</th>
        <th class="th-excel" style="width: 100px;">TMT</th>
        <th class="th-excel" style="width: 120px;">Sertifikasi</th>
        <th class="th-excel" style="width: 70px;">JJM</th>
      </tr>
    </thead>
    <tbody>
      ${data
        .map((p, idx) => {
          const rowClass = idx % 2 === 0 ? 'tr-even' : 'tr-odd';
          const statusClass =
            p.statusPegawai === 'PNS'
              ? 'badge-pns'
              : p.statusPegawai === 'PPPK'
              ? 'badge-pppk'
              : 'badge-honorer';
          const lp = p.jk === 'Perempuan' ? 'P' : 'L';
          return `
      <tr class="${rowClass}">
        <td class="td-center">${idx + 1}</td>
        <td class="td-text">${p.nip || '-'}</td>
        <td class="td-cell" style="font-weight: 600;">${p.nama || '-'}</td>
        <td class="td-center">${lp}</td>
        <td class="td-center ${statusClass}">${p.statusPegawai}</td>
        <td class="td-cell">${p.jenisPtk}</td>
        <td class="td-cell">${p.mapel || '-'}</td>
        <td class="td-center">${p.golongan || '-'}</td>
        <td class="td-center">${p.pendidikan}</td>
        <td class="td-text">${p.noHp || '-'}</td>
        <td class="td-cell">${p.email || '-'}</td>
        <td class="td-text">${p.nuptk || '-'}</td>
        <td class="td-center">${p.tmt ? formatDateIndo(p.tmt) : '-'}</td>
        <td class="td-center">${p.statusSertifikasi || 'Belum'}</td>
        <td class="td-number">${p.jumlahJamMengajar || 0} Jam</td>
      </tr>`;
        })
        .join('')}
      <tr class="tr-total">
        <td colspan="4" class="td-cell" style="font-weight: bold; text-align: center;">TOTAL DATA PEGAWAI: ${data.length} ORANG</td>
        <td class="td-center" style="font-weight: bold;">PNS: ${pnsCount} | PPPK: ${pppkCount}</td>
        <td colspan="9" class="td-cell" style="font-size: 9pt; color: #334155;">
          GTT: ${gttCount} | PTT: ${pttCount} | JJM Akumulasi: ${totalJjm} Jam Pembelajaran
        </td>
        <td class="td-number" style="font-weight: bold;">${totalJjm} Jam</td>
      </tr>
    </tbody>
  </table>

  <br/><br/>
  <table>
    <tr>
      <td colspan="10">&nbsp;</td>
      <td colspan="5" style="text-align: center; font-size: 10pt;">
        ${kop.kotaKabupaten || 'Surabaya'}, ${currentDate}<br/>
        Mengetahui,<br/>
        <strong>Kepala ${kop.namaSekolah || 'SMAN 9 Surabaya'}</strong>
        <br/><br/><br/><br/>
        <u><strong>Dr. H. Bambang Sudarsono, M.Pd.</strong></u><br/>
        NIP. 19680512 199412 1 002
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  downloadExcelBlob(excelHtml, `${filename}_${new Date().toISOString().slice(0, 10)}.xls`);
}

/**
 * Ekspor Lembar Kerja Excel Kesiswaan & Buku Induk Dapodik
 */
export function exportSiswaToExcelFormatted(
  data: Siswa[],
  kop: KopSekolah,
  filename = `LEMBAR_KERJA_EXCEL_SISWA_${kop.namaSekolah.replace(/\s+/g, '_')}`
): void {
  if (data.length === 0) {
    throw new Error('Tidak ada data siswa untuk diekspor ke Excel.');
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const countL = data.filter((s) => s.jk === 'Laki-laki').length;
  const countP = data.filter((s) => s.jk === 'Perempuan').length;
  const countX = data.filter((s) => s.tingkatKelas?.includes('X') && !s.tingkatKelas?.includes('XI') && !s.tingkatKelas?.includes('XII')).length;
  const countXI = data.filter((s) => s.tingkatKelas?.includes('XI') && !s.tingkatKelas?.includes('XII')).length;
  const countXII = data.filter((s) => s.tingkatKelas?.includes('XII')).length;

  const excelHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Lembar Kerja Siswa Dapodik</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:FitToPage/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; }
    table { border-collapse: collapse; width: 100%; }
    .kop-instansi { font-size: 12pt; font-weight: bold; text-align: center; color: #0f172a; }
    .kop-dinas { font-size: 13pt; font-weight: bold; text-align: center; color: #0f172a; }
    .kop-sekolah { font-size: 15pt; font-weight: 900; text-align: center; color: #0f766e; }
    .kop-alamat { font-size: 9pt; text-align: center; color: #475569; font-style: italic; }
    .kop-border { border-bottom: 2.5pt solid #0f172a; border-top: none; }
    .doc-title { font-size: 13pt; font-weight: bold; text-align: center; color: #0f766e; padding: 10px 0 4px 0; }
    .doc-subtitle { font-size: 9.5pt; text-align: center; color: #64748b; margin-bottom: 12px; }
    
    .th-excel {
      background-color: #0f766e;
      color: #ffffff;
      font-weight: bold;
      text-align: center;
      vertical-align: middle;
      border: 1pt solid #042f2e;
      padding: 8px 6px;
      font-size: 10pt;
    }
    .td-cell {
      border: 0.5pt solid #cbd5e1;
      padding: 6px 8px;
      font-size: 10pt;
      vertical-align: middle;
    }
    .td-center {
      text-align: center;
      border: 0.5pt solid #cbd5e1;
      padding: 6px;
      font-size: 10pt;
      vertical-align: middle;
    }
    .td-number {
      text-align: right;
      border: 0.5pt solid #cbd5e1;
      padding: 6px 8px;
      font-size: 10pt;
      vertical-align: middle;
    }
    .td-text {
      mso-number-format:"\\@";
      border: 0.5pt solid #cbd5e1;
      padding: 6px 8px;
      font-size: 10pt;
      vertical-align: middle;
    }
    .tr-even { background-color: #f8fafc; }
    .tr-odd { background-color: #ffffff; }
    .tr-total {
      background-color: #ccfbf1;
      font-weight: bold;
      border-top: 1.5pt solid #0f766e;
      border-bottom: 2pt double #042f2e;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="16" class="kop-instansi">${kop.instansiAtas || 'PEMERINTAH PROVINSI JAWA TIMUR'}</td>
    </tr>
    <tr>
      <td colspan="16" class="kop-dinas">${kop.dinas || 'DINAS PENDIDIKAN'}</td>
    </tr>
    <tr>
      <td colspan="16" class="kop-sekolah">${kop.namaSekolah || 'SMA NEGERI 9 SURABAYA'}</td>
    </tr>
    <tr>
      <td colspan="16" class="kop-alamat">
        ${kop.alamatJalan || 'Jl. Wijaya Kusuma No. 48'}, ${kop.kotaKabupaten || 'Surabaya'}, ${kop.provinsi || 'Jawa Timur'} | Telp: ${kop.telepon || '(031) 5342112'} | NPSN: ${kop.npsn || '20532252'}
      </td>
    </tr>
    <tr>
      <td colspan="16" class="kop-border">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="16" class="doc-title">LEMBAR KERJA DATA KESISWAAN (BUKU INDUK DAPODIK SMA)</td>
    </tr>
    <tr>
      <td colspan="16" class="doc-subtitle">Buku Induk Registrasi Peserta Didik SMA Negeri 9 Surabaya | Tanggal Ekspor: ${currentDate}</td>
    </tr>
    <tr><td colspan="16">&nbsp;</td></tr>
  </table>

  <table>
    <thead>
      <tr>
        <th class="th-excel" style="width: 40px;">No</th>
        <th class="th-excel" style="width: 120px;">NISN</th>
        <th class="th-excel" style="width: 90px;">NIS</th>
        <th class="th-excel" style="width: 220px;">Nama Lengkap Siswa</th>
        <th class="th-excel" style="width: 50px;">L/P</th>
        <th class="th-excel" style="width: 80px;">Kelas</th>
        <th class="th-excel" style="width: 70px;">Rombel</th>
        <th class="th-excel" style="width: 130px;">Peminatan</th>
        <th class="th-excel" style="width: 80px;">Status</th>
        <th class="th-excel" style="width: 150px;">TTL</th>
        <th class="th-excel" style="width: 80px;">Agama</th>
        <th class="th-excel" style="width: 200px;">Alamat Siswa</th>
        <th class="th-excel" style="width: 120px;">No HP Siswa</th>
        <th class="th-excel" style="width: 160px;">Nama Orang Tua / Wali</th>
        <th class="th-excel" style="width: 120px;">No HP Ortu</th>
        <th class="th-excel" style="width: 140px;">Wali Kelas</th>
      </tr>
    </thead>
    <tbody>
      ${data
        .map((s, idx) => {
          const rowClass = idx % 2 === 0 ? 'tr-even' : 'tr-odd';
          const lp = s.jk === 'Perempuan' ? 'P' : 'L';
          const ttl = `${s.tempatLahir || ''}, ${s.tanggalLahir ? formatDateIndo(s.tanggalLahir) : ''}`;
          const ortu = s.namaAyah || s.namaIbu || 'Orang Tua';
          return `
      <tr class="${rowClass}">
        <td class="td-center">${idx + 1}</td>
        <td class="td-text">${s.nisn || '-'}</td>
        <td class="td-text">${s.nis || '-'}</td>
        <td class="td-cell" style="font-weight: 600;">${s.nama || '-'}</td>
        <td class="td-center">${lp}</td>
        <td class="td-center">${s.tingkatKelas}</td>
        <td class="td-center" style="font-weight: bold;">${s.rombel}</td>
        <td class="td-cell">${s.peminatan || '-'}</td>
        <td class="td-center" style="color: #047857; font-weight: bold;">${s.statusSiswa || 'Aktif'}</td>
        <td class="td-cell">${ttl}</td>
        <td class="td-center">${s.agama || 'Islam'}</td>
        <td class="td-cell">${s.alamat || '-'}</td>
        <td class="td-text">${s.noHpSiswa || '-'}</td>
        <td class="td-cell">${ortu}</td>
        <td class="td-text">${s.noHpOrtu || '-'}</td>
        <td class="td-cell">${s.waliKelas || '-'}</td>
      </tr>`;
        })
        .join('')}
      <tr class="tr-total">
        <td colspan="4" class="td-cell" style="font-weight: bold; text-align: center;">TOTAL SISWA: ${data.length} PESERTA DIDIK</td>
        <td class="td-center" style="font-weight: bold;">L: ${countL} | P: ${countP}</td>
        <td colspan="4" class="td-cell" style="font-weight: bold;">
          Kelas X: ${countX} | Kelas XI: ${countXI} | Kelas XII: ${countXII}
        </td>
        <td colspan="7" class="td-cell" style="font-size: 9pt; color: #0f766e;">
          Status: 100% Terdaftar di Sistem Dapodik Kemendikbudristek
        </td>
      </tr>
    </tbody>
  </table>

  <br/><br/>
  <table>
    <tr>
      <td colspan="11">&nbsp;</td>
      <td colspan="5" style="text-align: center; font-size: 10pt;">
        ${kop.kotaKabupaten || 'Surabaya'}, ${currentDate}<br/>
        Waka Kesiswaan / Staf Administrasi Kesiswaan,<br/>
        <strong>${kop.namaSekolah || 'SMA NEGERI 9 SURABAYA'}</strong>
        <br/><br/><br/><br/>
        <u><strong>Dwi Budiono, S.Kom.</strong></u><br/>
        NIP. 19880923 201503 1 003
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  downloadExcelBlob(excelHtml, `${filename}_${new Date().toISOString().slice(0, 10)}.xls`);
}

/**
 * Salin Lembar Kerja ke Clipboard dalam format TSV (Tab Separated Values)
 * Sangat presisi sehingga saat user menekan Ctrl+V di Excel atau Google Sheets,
 * seluruh data langsung otomatis mengisi baris & kolom dengan rapi tanpa pecah!
 */
export async function copyWorksheetToClipboard(
  type: 'pegawai' | 'siswa',
  data: Pegawai[] | Siswa[]
): Promise<number> {
  let tsvContent = '';

  if (type === 'pegawai') {
    const list = data as Pegawai[];
    const headers = [
      'No',
      'NIP/NIPPPK',
      'Nama Lengkap & Gelar',
      'L/P',
      'Status Kepegawaian',
      'Jenis PTK',
      'Mata Pelajaran / Tugas Utama',
      'Golongan',
      'Pendidikan',
      'No HP/WhatsApp',
      'Email',
      'NUPTK',
      'TMT',
      'Status Sertifikasi',
      'JJM'
    ];
    tsvContent = headers.join('\t') + '\n';

    list.forEach((p, index) => {
      const row = [
        (index + 1).toString(),
        p.nip || '',
        p.nama || '',
        p.jk || 'Laki-laki',
        p.statusPegawai || 'PNS',
        p.jenisPtk || 'Guru Mapel',
        p.mapel || '',
        p.golongan || '-',
        p.pendidikan || 'S1/D4',
        p.noHp || '',
        p.email || '',
        p.nuptk || '',
        p.tmt || '',
        p.statusSertifikasi || 'Belum Sertifikasi',
        (p.jumlahJamMengajar || 0).toString()
      ];
      tsvContent += row.join('\t') + '\n';
    });

    await navigator.clipboard.writeText(tsvContent);
    return list.length;
  } else {
    const list = data as Siswa[];
    const headers = [
      'No',
      'NISN',
      'NIS',
      'NIK',
      'Nama Lengkap Siswa',
      'L/P',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Agama',
      'Tingkat Kelas',
      'Rombel',
      'Peminatan',
      'Status Siswa',
      'Alamat Lengkap',
      'Kota/Kab',
      'No HP Siswa',
      'Email',
      'Nama Ayah',
      'Nama Ibu',
      'No HP Ortu',
      'Wali Kelas'
    ];
    tsvContent = headers.join('\t') + '\n';

    list.forEach((s, index) => {
      const row = [
        (index + 1).toString(),
        s.nisn || '',
        s.nis || '',
        s.nik || '',
        s.nama || '',
        s.jk || 'Laki-laki',
        s.tempatLahir || '',
        s.tanggalLahir || '',
        s.agama || 'Islam',
        s.tingkatKelas || 'Kelas X',
        s.rombel || 'X-1',
        s.peminatan || '',
        s.statusSiswa || 'Aktif',
        s.alamat || '',
        s.kotaKab || 'Kota Surabaya',
        s.noHpSiswa || '',
        s.email || '',
        s.namaAyah || '',
        s.namaIbu || '',
        s.noHpOrtu || '',
        s.waliKelas || ''
      ];
      tsvContent += row.join('\t') + '\n';
    });

    await navigator.clipboard.writeText(tsvContent);
    return list.length;
  }
}

function downloadExcelBlob(content: string, filename: string): void {
  const blob = new Blob([content], {
    type: 'application/vnd.ms-excel;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
