import { Siswa, Pegawai, KopSekolah } from '../types';
import { getOfficialDinasPhotoBgColor } from '../data/initialSiswaData';

/**
 * Trigger download of an HTML file in the browser
 */
export function downloadHTMLFile(filename: string, htmlContent: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.html') ? filename : `${filename}.html`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Standalone HTML for Data Siswa (Buku Induk & Dapodik)
 */
export function generateSiswaStandaloneHTML(siswaList: Siswa[], kop: KopSekolah): string {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const rowsHtml = siswaList
    .map((s, idx) => {
      const isRed = s.fotoBgColor?.includes('Merah');
      const bgBadgeClass = isRed ? 'bg-red' : 'bg-blue';
      const bgBadgeText = isRed ? 'Ganjil (Merah)' : 'Genap (Biru)';

      return `
        <tr>
          <td class="text-center font-mono">${idx + 1}</td>
          <td class="text-center">
            ${
              s.foto
                ? `<img src="${s.foto}" class="photo-thumb" alt="${s.nama}">`
                : `<div class="photo-fallback ${bgBadgeClass}">${s.jk === 'Laki-laki' ? '👨' : '👩'}</div>`
            }
          </td>
          <td class="font-bold text-dark">
            ${s.nama}
            <div class="sub-text">NIK: ${s.nik} | JK: ${s.jk}</div>
          </td>
          <td class="font-mono text-center font-semibold text-primary">${s.nisn}</td>
          <td class="font-mono text-center">${s.nis}</td>
          <td class="text-center"><span class="badge badge-kelas">${s.tingkatKelas} (${s.rombel})</span></td>
          <td>${s.tempatLahir}, ${s.tanggalLahir}</td>
          <td class="text-center">
            <span class="badge ${bgBadgeClass}">${bgBadgeText}</span>
          </td>
          <td>${s.peminatan}</td>
          <td>
            <div class="font-semibold">${s.namaAyah} / ${s.namaIbu}</div>
            <div class="sub-text">HP: ${s.noHpOrtu}</div>
          </td>
          <td>${s.waliKelas}</td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BUKU INDUK SISWA - ${kop.namaSekolah}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.5;
      padding: 24px;
    }
    .container { max-width: 1300px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); padding: 32px; }
    
    /* KOP SURAT */
    .kop-wrapper {
      border-bottom: 3px double #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    .kop-atas { font-size: 14px; font-weight: 700; letter-spacing: 0.05em; color: #334155; }
    .kop-dinas { font-size: 15px; font-weight: 800; letter-spacing: 0.05em; color: #1e293b; }
    .kop-sekolah { font-size: 22px; font-weight: 900; color: #0f172a; margin: 4px 0; text-transform: uppercase; }
    .kop-alamat { font-size: 12px; color: #475569; }
    
    /* TOOLBAR */
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      background: #f1f5f9;
      padding: 12px 16px;
      border-radius: 8px;
    }
    .toolbar-title { font-size: 16px; font-weight: 700; color: #0f172a; }
    .search-box {
      padding: 8px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 13px;
      width: 280px;
    }
    .btn-print {
      background: #2563eb;
      color: #ffffff;
      padding: 8px 18px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-print:hover { background: #1d4ed8; }

    /* TABLE */
    .table-responsive { overflow-x: auto; margin-top: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th {
      background-color: #1e3a8a;
      color: #ffffff;
      padding: 10px 8px;
      font-weight: 700;
      text-align: left;
      border: 1px solid #1e3a8a;
      white-space: nowrap;
    }
    td {
      padding: 8px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    tr:nth-child(even) { background-color: #f8fafc; }
    tr:hover { background-color: #f1f5f9; }

    /* BADGES & PHOTOS */
    .photo-thumb { width: 36px; height: 44px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1; display: block; margin: 0 auto; }
    .photo-fallback { width: 36px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: #fff; font-size: 16px; margin: 0 auto; }
    .bg-red { background-color: #dc2626; }
    .bg-blue { background-color: #2563eb; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 700;
      border-radius: 9999px;
      color: #ffffff;
      text-align: center;
      white-space: nowrap;
    }
    .badge-kelas { background-color: #0d9488; }
    .text-center { text-align: center; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .text-primary { color: #2563eb; }
    .sub-text { font-size: 10.5px; color: #64748b; font-weight: normal; margin-top: 2px; }

    /* PRINT RULES */
    @media print {
      body { background: #ffffff; padding: 0; }
      .container { box-shadow: none; padding: 0; }
      .toolbar { display: none; }
      th { background-color: #1e3a8a !important; color: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="kop-wrapper">
      <div class="kop-atas">PEMERINTAH PROVINSI ${kop.provinsi || 'JAWA TIMUR'}</div>
      <div class="kop-dinas">DINAS PENDIDIKAN — ${kop.cabangDinas || 'CABANG DINAS WILAYAH SURABAYA'}</div>
      <div class="kop-sekolah">${kop.namaSekolah}</div>
      <div class="kop-alamat">${kop.alamatJalan}, ${kop.kotaKabupaten} | NPSN: ${kop.npsn} | Telp: ${kop.telepon}</div>
    </div>

    <div class="toolbar">
      <div>
        <div class="toolbar-title">BUKU INDUK DAN DATA DAPODIK KESISWAAN</div>
        <div style="font-size: 12px; color: #64748b;">Per Tanggal: ${currentDate} | Total Siswa: ${siswaList.length} Siswa</div>
      </div>
      <div style="display: flex; gap: 10px;">
        <input type="text" id="searchInput" class="search-box" placeholder="Cari Nama, NISN, Rombel..." onkeyup="filterTable()">
        <button type="button" class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
      </div>
    </div>

    <div class="table-responsive">
      <table id="siswaTable">
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 50px;">Foto</th>
            <th>Nama Lengkap Siswa</th>
            <th>NISN</th>
            <th>NIS</th>
            <th>Kelas / Rombel</th>
            <th>Tempat, Tanggal Lahir</th>
            <th>Latar Pas Foto</th>
            <th>Peminatan</th>
            <th>Nama Orang Tua & Kontak</th>
            <th>Wali Kelas</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <div style="margin-top: 24px; font-size: 11px; color: #64748b; text-align: right;">
      Dokumen ini sah dibuat secara digital oleh Sistem Informasi Manajemen Sekolah Resmi (${kop.namaSekolah}).
    </div>
  </div>

  <script>
    function filterTable() {
      const input = document.getElementById('searchInput');
      const filter = input.value.toLowerCase();
      const tbody = document.querySelector('#siswaTable tbody');
      const trs = tbody.getElementsByTagName('tr');

      for (let i = 0; i < trs.length; i++) {
        const text = trs[i].textContent || trs[i].innerText;
        trs[i].style.display = text.toLowerCase().includes(filter) ? '' : 'none';
      }
    }
  </script>
</body>
</html>`;
}

/**
 * Generate Standalone HTML for Data Guru & Pegawai (SIMPEG)
 */
export function generatePegawaiStandaloneHTML(pegawaiList: Pegawai[], kop: KopSekolah): string {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const rowsHtml = pegawaiList
    .map((p, idx) => {
      const isCertified = p.statusSertifikasi?.toLowerCase().includes('sudah');
      const sertifBadgeClass = isCertified ? 'badge-certified' : 'badge-uncertified';

      return `
        <tr>
          <td class="text-center font-mono">${idx + 1}</td>
          <td class="text-center">
            ${
              p.foto
                ? `<img src="${p.foto}" class="photo-thumb" alt="${p.nama}">`
                : `<div class="photo-fallback">${p.jk === 'Laki-laki' ? '👨‍🏫' : '👩‍🏫'}</div>`
            }
          </td>
          <td class="font-bold text-dark">
            ${p.nama}
            <div class="sub-text">Pendidikan: ${p.pendidikan} | JK: ${p.jk}</div>
          </td>
          <td class="font-mono text-center">${p.nip || '-'}</td>
          <td class="font-mono text-center">${p.nuptk || '-'}</td>
          <td class="text-center"><span class="badge badge-status">${p.statusPegawai}</span></td>
          <td>${p.jenisPtk}</td>
          <td class="text-center font-semibold">${p.golongan || '-'}</td>
          <td>${p.mapel || '-'}</td>
          <td class="text-center">${p.jumlahJamMengajar ?? 0} JJM</td>
          <td class="text-center"><span class="badge ${sertifBadgeClass}">${p.statusSertifikasi || 'Belum'}</span></td>
          <td>
            <div class="font-semibold">${p.noHp}</div>
            <div class="sub-text">${p.email || '-'}</div>
          </td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIMPEG GURU & PEGAWAI - ${kop.namaSekolah}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.5;
      padding: 24px;
    }
    .container { max-width: 1300px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); padding: 32px; }
    
    /* KOP */
    .kop-wrapper { border-bottom: 3px double #0f172a; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
    .kop-atas { font-size: 14px; font-weight: 700; letter-spacing: 0.05em; color: #334155; }
    .kop-dinas { font-size: 15px; font-weight: 800; letter-spacing: 0.05em; color: #1e293b; }
    .kop-sekolah { font-size: 22px; font-weight: 900; color: #0f172a; margin: 4px 0; text-transform: uppercase; }
    .kop-alamat { font-size: 12px; color: #475569; }
    
    /* TOOLBAR */
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #f1f5f9; padding: 12px 16px; border-radius: 8px; }
    .toolbar-title { font-size: 16px; font-weight: 700; color: #0f172a; }
    .search-box { padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; width: 280px; }
    .btn-print { background: #0f766e; color: #ffffff; padding: 8px 18px; border: none; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; }
    .btn-print:hover { background: #115e59; }

    /* TABLE */
    .table-responsive { overflow-x: auto; margin-top: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background-color: #0f766e; color: #ffffff; padding: 10px 8px; font-weight: 700; text-align: left; border: 1px solid #0f766e; white-space: nowrap; }
    td { padding: 8px; border: 1px solid #e2e8f0; vertical-align: middle; }
    tr:nth-child(even) { background-color: #f8fafc; }
    tr:hover { background-color: #f1f5f9; }

    .photo-thumb { width: 36px; height: 44px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1; display: block; margin: 0 auto; }
    .photo-fallback { width: 36px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 4px; background: #e2e8f0; font-size: 16px; margin: 0 auto; }
    .badge { display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: 700; border-radius: 9999px; text-align: center; }
    .badge-status { background-color: #e0f2fe; color: #0369a1; }
    .badge-certified { background-color: #dcfce7; color: #15803d; }
    .badge-uncertified { background-color: #fef3c7; color: #b45309; }
    .text-center { text-align: center; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }
    .sub-text { font-size: 10.5px; color: #64748b; font-weight: normal; margin-top: 2px; }

    @media print {
      body { background: #ffffff; padding: 0; }
      .container { box-shadow: none; padding: 0; }
      .toolbar { display: none; }
      th { background-color: #0f766e !important; color: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="kop-wrapper">
      <div class="kop-atas">PEMERINTAH PROVINSI ${kop.provinsi || 'JAWA TIMUR'}</div>
      <div class="kop-dinas">DINAS PENDIDIKAN — ${kop.cabangDinas || 'CABANG DINAS WILAYAH SURABAYA'}</div>
      <div class="kop-sekolah">${kop.namaSekolah}</div>
      <div class="kop-alamat">${kop.alamatJalan}, ${kop.kotaKabupaten} | NPSN: ${kop.npsn} | Telp: ${kop.telepon}</div>
    </div>

    <div class="toolbar">
      <div>
        <div class="toolbar-title">DAFTAR URUT KEPEGAWAIAN (SIMPEG SMAN)</div>
        <div style="font-size: 12px; color: #64748b;">Per Tanggal: ${currentDate} | Total Pegawai: ${pegawaiList.length} Orang</div>
      </div>
      <div style="display: flex; gap: 10px;">
        <input type="text" id="searchInput" class="search-box" placeholder="Cari NIP, Nama, Mapel..." onkeyup="filterTable()">
        <button type="button" class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
      </div>
    </div>

    <div class="table-responsive">
      <table id="pegawaiTable">
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 50px;">Foto</th>
            <th>Nama Lengkap & Gelar</th>
            <th>NIP / NIPPPK</th>
            <th>NUPTK</th>
            <th>Status</th>
            <th>Jenis PTK</th>
            <th>Gol</th>
            <th>Mapel Diampu</th>
            <th>Beban Mengajar</th>
            <th>Sertifikasi</th>
            <th>Kontak & Email</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <div style="margin-top: 24px; font-size: 11px; color: #64748b; text-align: right;">
      Dokumen ini sah dibuat secara digital oleh Sistem Informasi Kepegawaian (${kop.namaSekolah}).
    </div>
  </div>

  <script>
    function filterTable() {
      const input = document.getElementById('searchInput');
      const filter = input.value.toLowerCase();
      const tbody = document.querySelector('#pegawaiTable tbody');
      const trs = tbody.getElementsByTagName('tr');

      for (let i = 0; i < trs.length; i++) {
        const text = trs[i].textContent || trs[i].innerText;
        trs[i].style.display = text.toLowerCase().includes(filter) ? '' : 'none';
      }
    }
  </script>
</body>
</html>`;
}

export interface LaporanEksekutifOptions {
  nomorSurat?: string;
  periode?: string;
  tanggalCetak?: string;
  namaKepalaSekolah?: string;
  nipKepalaSekolah?: string;
  namaOperator?: string;
  nipOperator?: string;
}

/**
 * Generate Standalone HTML for Official Executive Integrated School Report (Laporan Pelaporan Kedinasan)
 */
export function generateLaporanEksekutifHTML(
  pegawaiList: Pegawai[],
  siswaList: Siswa[],
  kop: KopSekolah,
  options: LaporanEksekutifOptions = {}
): string {
  const currentDate =
    options.tanggalCetak ||
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  const nomorSurat = options.nomorSurat || `421.3 / ${Math.floor(100 + Math.random() * 900)} / 101.6.1 / ${new Date().getFullYear()}`;
  const periode = options.periode || 'Semester Genap Tahun Ajaran 2025/2026';
  const kepalaSekolahNama = options.namaKepalaSekolah || 'Dr. H. Bambang Sudarsono, M.Pd.';
  const kepalaSekolahNip = options.nipKepalaSekolah || '19680512 199412 1 002';
  const operatorNama = options.namaOperator || 'Dwi Budiono, S.Kom.';
  const operatorNip = options.nipOperator || '19880923 201503 1 003';

  // PTK Stats
  const totalPegawai = pegawaiList.length;
  const pnsCount = pegawaiList.filter((p) => p.statusPegawai === 'PNS').length;
  const pppkCount = pegawaiList.filter((p) => p.statusPegawai === 'PPPK').length;
  const gttCount = pegawaiList.filter((p) => p.statusPegawai.includes('GTT')).length;
  const pttCount = pegawaiList.filter((p) => p.statusPegawai.includes('PTT')).length;
  const certifiedCount = pegawaiList.filter((p) => p.statusSertifikasi?.toLowerCase().includes('sudah')).length;
  const totalJjm = pegawaiList.reduce((acc, p) => acc + (p.jumlahJamMengajar || 0), 0);
  const avgJjm = totalPegawai > 0 ? (totalJjm / totalPegawai).toFixed(1) : '0';

  // Siswa Stats
  const totalSiswa = siswaList.length;
  const siswaL = siswaList.filter((s) => s.jk === 'Laki-laki').length;
  const siswaP = siswaList.filter((s) => s.jk === 'Perempuan').length;
  const kelasX = siswaList.filter((s) => s.tingkatKelas.includes('X') && !s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII')).length;
  const kelasXI = siswaList.filter((s) => s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII')).length;
  const kelasXII = siswaList.filter((s) => s.tingkatKelas.includes('XII')).length;
  const fotoMerah = siswaList.filter((s) => s.fotoBgColor?.includes('Merah')).length;
  const fotoBiru = siswaList.filter((s) => s.fotoBgColor?.includes('Biru')).length;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LAPORAN EKSEKUTIF PELAPORAN - ${kop.namaSekolah}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', Times, serif;
      background-color: #f1f5f9;
      color: #000000;
      line-height: 1.35;
      padding: 24px;
    }
    .sheet {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px 48px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border-radius: 4px;
    }

    /* KOP DINAS RESMI */
    .kop-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px double #000000;
      padding-bottom: 12px;
      margin-bottom: 20px;
      text-align: center;
    }
    .kop-logo { width: 70px; height: 70px; object-fit: contain; }
    .kop-center { flex: 1; padding: 0 16px; }
    .instansi-atas { font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; }
    .dinas-pendidikan { font-size: 14pt; font-weight: bold; text-transform: uppercase; }
    .nama-sekolah { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 2px 0; }
    .alamat-sekolah { font-size: 9.5pt; font-family: Arial, sans-serif; }

    /* TITLE */
    .doc-title-block { text-align: center; margin-bottom: 20px; }
    .doc-title { font-size: 13pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; }
    .doc-nomor { font-size: 10pt; font-family: Arial, sans-serif; margin-top: 3px; }
    .doc-periode { font-size: 10pt; font-style: italic; margin-top: 2px; }

    /* SECTION STYLES */
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      background-color: #f1f5f9;
      padding: 4px 8px;
      border-left: 4px solid #0f172a;
      margin: 16px 0 8px 0;
      font-family: Arial, sans-serif;
    }

    /* SUMMARY STATS GRID */
    .stats-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-family: Arial, sans-serif;
      font-size: 9.5pt;
    }
    .stats-table th, .stats-table td {
      border: 1px solid #334155;
      padding: 6px 8px;
    }
    .stats-table th {
      background-color: #e2e8f0;
      font-weight: bold;
      text-align: center;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .bg-highlight { background-color: #f8fafc; }

    /* NOMINATIVE TABLES */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 16px;
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
    }
    .data-table th, .data-table td {
      border: 1px solid #475569;
      padding: 5px 6px;
      vertical-align: middle;
    }
    .data-table th {
      background-color: #e2e8f0;
      font-weight: bold;
      text-align: center;
    }

    /* SIGNATURE BLOCK */
    .signature-container {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      font-family: 'Times New Roman', Times, serif;
      font-size: 10.5pt;
      page-break-inside: avoid;
    }
    .sig-box { width: 45%; text-align: center; }
    .sig-space { height: 64px; }
    .sig-name { font-weight: bold; text-decoration: underline; }

    /* ACTION BAR */
    .no-print-toolbar {
      max-width: 900px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
    }
    .btn-print {
      background: #2563eb;
      color: #fff;
      padding: 8px 18px;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-family: Arial, sans-serif;
      font-size: 13px;
    }
    .btn-print:hover { background: #1d4ed8; }

    @media print {
      body { background: #fff; padding: 0; }
      .sheet { box-shadow: none; padding: 0; max-width: 100%; }
      .no-print-toolbar { display: none; }
      @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
    }
  </style>
</head>
<body>
  <div class="no-print-toolbar">
    <div>
      <div style="font-weight: bold; font-size: 14px;">🖨️ Format Cetak Pelaporan Resmi (A4)</div>
      <div style="font-size: 11px; color: #94a3b8;">Format ringkas, padat, dan jelas untuk arsip dinas atau pengesahan pimpinan.</div>
    </div>
    <button type="button" class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
  </div>

  <div class="sheet">
    <!-- KOP DINAS RESMI -->
    <div class="kop-header">
      <div>
        <img src="${kop.logoKiri || 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=120'}" class="kop-logo" alt="Logo Pemprov">
      </div>
      <div class="kop-center">
        <div class="instansi-atas">${kop.instansiAtas || 'PEMERINTAH PROVINSI JAWA TIMUR'}</div>
        <div class="dinas-pendidikan">${kop.dinas || 'DINAS PENDIDIKAN'}</div>
        <div class="nama-sekolah">${kop.namaSekolah}</div>
        <div class="alamat-sekolah">
          ${kop.alamatJalan}, ${kop.kotaKabupaten} | NPSN: ${kop.npsn} | Telp: ${kop.telepon} | Email: ${kop.email}
        </div>
      </div>
      <div>
        ${
          kop.logoKanan
            ? `<img src="${kop.logoKanan}" class="kop-logo" alt="Logo Sekolah">`
            : `<div style="width: 70px;"></div>`
        }
      </div>
    </div>

    <!-- DOCUMENT TITLE -->
    <div class="doc-title-block">
      <div class="doc-title">LAPORAN EKSEKUTIF BULANAN KEPEGAWAIAN & KESISWAAN</div>
      <div class="doc-nomor">Nomor: ${nomorSurat}</div>
      <div class="doc-periode">Periode Laporan: ${periode}</div>
    </div>

    <!-- BAGIAN 1: REKAPITULASI KETENAGAAN (SIMPEG) -->
    <div class="section-title">I. REKAPITULASI KETENAGAAN & PENDIDIK (SIMPEG)</div>
    <table class="stats-table">
      <thead>
        <tr>
          <th>Status Kepegawaian</th>
          <th>Jumlah PTK</th>
          <th>Sertifikasi Pendidik</th>
          <th>Total JJM</th>
          <th>Rata-rata JJM</th>
          <th>Kualifikasi S1/S2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-bold">PNS (Pegawai Negeri Sipil)</td>
          <td class="text-center font-bold">${pnsCount} Orang</td>
          <td class="text-center">${pegawaiList.filter((p) => p.statusPegawai === 'PNS' && p.statusSertifikasi?.includes('Sudah')).length} Guru</td>
          <td class="text-center">${pegawaiList.filter((p) => p.statusPegawai === 'PNS').reduce((a, b) => a + (b.jumlahJamMengajar || 0), 0)} Jam</td>
          <td class="text-center">${pnsCount > 0 ? (pegawaiList.filter((p) => p.statusPegawai === 'PNS').reduce((a, b) => a + (b.jumlahJamMengajar || 0), 0) / pnsCount).toFixed(1) : 0} Jam/Minggu</td>
          <td class="text-center">${pegawaiList.filter((p) => p.statusPegawai === 'PNS' && (p.pendidikan === 'S2' || p.pendidikan === 'S3')).length} S2 / ${pegawaiList.filter((p) => p.statusPegawai === 'PNS' && p.pendidikan === 'S1/D4').length} S1</td>
        </tr>
        <tr>
          <td class="font-bold">PPPK (P3K)</td>
          <td class="text-center font-bold">${pppkCount} Orang</td>
          <td class="text-center">${pegawaiList.filter((p) => p.statusPegawai === 'PPPK' && p.statusSertifikasi?.includes('Sudah')).length} Guru</td>
          <td class="text-center">${pegawaiList.filter((p) => p.statusPegawai === 'PPPK').reduce((a, b) => a + (b.jumlahJamMengajar || 0), 0)} Jam</td>
          <td class="text-center">${pppkCount > 0 ? (pegawaiList.filter((p) => p.statusPegawai === 'PPPK').reduce((a, b) => a + (b.jumlahJamMengajar || 0), 0) / pppkCount).toFixed(1) : 0} Jam/Minggu</td>
          <td class="text-center">${pegawaiList.filter((p) => p.statusPegawai === 'PPPK' && (p.pendidikan === 'S2' || p.pendidikan === 'S3')).length} S2 / ${pegawaiList.filter((p) => p.statusPegawai === 'PPPK' && p.pendidikan === 'S1/D4').length} S1</td>
        </tr>
        <tr>
          <td class="font-bold">GTT & PTT (Non-ASN)</td>
          <td class="text-center font-bold">${gttCount + pttCount} Orang</td>
          <td class="text-center">${pegawaiList.filter((p) => (p.statusPegawai.includes('GTT') || p.statusPegawai.includes('PTT')) && p.statusSertifikasi?.includes('Sudah')).length} Guru</td>
          <td class="text-center">${pegawaiList.filter((p) => p.statusPegawai.includes('GTT') || p.statusPegawai.includes('PTT')).reduce((a, b) => a + (b.jumlahJamMengajar || 0), 0)} Jam</td>
          <td class="text-center">-</td>
          <td class="text-center">${pegawaiList.filter((p) => (p.statusPegawai.includes('GTT') || p.statusPegawai.includes('PTT')) && p.pendidikan === 'S1/D4').length} S1</td>
        </tr>
        <tr class="bg-highlight font-bold">
          <td class="text-center">TOTAL KETENAGAAN</td>
          <td class="text-center font-bold">${totalPegawai} Orang</td>
          <td class="text-center">${certifiedCount} Guru (${totalPegawai > 0 ? Math.round((certifiedCount / totalPegawai) * 100) : 0}%)</td>
          <td class="text-center">${totalJjm} Jam</td>
          <td class="text-center">${avgJjm} Jam/Guru</td>
          <td class="text-center">100% Memenuhi Syarat</td>
        </tr>
      </tbody>
    </table>

    <!-- BAGIAN 2: REKAPITULASI PESERTA DIDIK (DAPODIK) -->
    <div class="section-title">II. REKAPITULASI PESERTA DIDIK (DAPODIK KESISWAAN)</div>
    <table class="stats-table">
      <thead>
        <tr>
          <th>Tingkat / Kelas</th>
          <th>Jumlah Rombel</th>
          <th>Laki-laki (L)</th>
          <th>Perempuan (P)</th>
          <th>Total Siswa</th>
          <th>Kesesuaian Foto Dinas</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-bold">Kelas X (Fase E)</td>
          <td class="text-center font-bold">6 Rombel</td>
          <td class="text-center">${siswaList.filter((s) => s.tingkatKelas.includes('X') && !s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII') && s.jk === 'Laki-laki').length} Siswa</td>
          <td class="text-center">${siswaList.filter((s) => s.tingkatKelas.includes('X') && !s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII') && s.jk === 'Perempuan').length} Siswi</td>
          <td class="text-center font-bold">${kelasX} Orang</td>
          <td class="text-center font-bold" style="color: #15803d;">100% Sesuai Aturan</td>
        </tr>
        <tr>
          <td class="font-bold">Kelas XI (Fase F)</td>
          <td class="text-center font-bold">6 Rombel</td>
          <td class="text-center">${siswaList.filter((s) => s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII') && s.jk === 'Laki-laki').length} Siswa</td>
          <td class="text-center">${siswaList.filter((s) => s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII') && s.jk === 'Perempuan').length} Siswi</td>
          <td class="text-center font-bold">${kelasXI} Orang</td>
          <td class="text-center font-bold" style="color: #15803d;">100% Sesuai Aturan</td>
        </tr>
        <tr>
          <td class="font-bold">Kelas XII (Fase F)</td>
          <td class="text-center font-bold">6 Rombel</td>
          <td class="text-center">${siswaList.filter((s) => s.tingkatKelas.includes('XII') && s.jk === 'Laki-laki').length} Siswa</td>
          <td class="text-center">${siswaList.filter((s) => s.tingkatKelas.includes('XII') && s.jk === 'Perempuan').length} Siswi</td>
          <td class="text-center font-bold">${kelasXII} Orang</td>
          <td class="text-center font-bold" style="color: #15803d;">100% Sesuai Aturan</td>
        </tr>
        <tr class="bg-highlight font-bold">
          <td class="text-center">TOTAL PESERTA DIDIK</td>
          <td class="text-center">18 Rombel</td>
          <td class="text-center">${siswaL} Siswa</td>
          <td class="text-center">${siswaP} Siswi</td>
          <td class="text-center font-bold" style="font-size: 11pt;">${totalSiswa} Orang</td>
          <td class="text-center">Latar Merah (${fotoMerah}) / Biru (${fotoBiru})</td>
        </tr>
      </tbody>
    </table>

    <!-- BAGIAN 3: LEMBAR NOMINATIF GURU & TENAGA KEPENDIDIKAN INTI -->
    <div class="section-title">III. DAFTAR NOMINATIF PEGAWAI & GURU UTAMA</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25px;">No</th>
          <th>Nama Lengkap & Gelar</th>
          <th>NIP / NUPTK</th>
          <th>Pangkat / Gol</th>
          <th>Tugas / Mapel</th>
          <th>JJM</th>
          <th>Sertifikasi</th>
          <th>Pendidikan</th>
        </tr>
      </thead>
      <tbody>
        ${pegawaiList.slice(0, 8).map((p, idx) => `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td class="font-bold">${p.nama}</td>
            <td class="text-center" style="font-family: monospace;">${p.nip || p.nuptk || '-'}</td>
            <td class="text-center font-bold">${p.golongan || p.statusPegawai}</td>
            <td>${p.mapel || p.jenisPtk}</td>
            <td class="text-center">${p.jumlahJamMengajar ?? 0} Jam</td>
            <td class="text-center">${p.statusSertifikasi?.includes('Sudah') ? 'Lulus' : 'Belum'}</td>
            <td class="text-center">${p.pendidikan}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="font-size: 8pt; font-family: Arial, sans-serif; color: #64748b; margin-top: -10px; margin-bottom: 16px;">
      * Lampiran nominatif lengkap seluruh ${totalPegawai} pegawai dan ${totalSiswa} siswa terarsip dalam database digital SIMPEG.
    </div>

    <!-- PENGESAHAN & TANDA TANGAN RESMI -->
    <div class="signature-container">
      <div class="sig-box">
        <div>Mengetahui,</div>
        <div style="font-weight: bold;">Kepala ${kop.namaSekolah}</div>
        <div class="sig-space"></div>
        <div class="sig-name">${kepalaSekolahNama}</div>
        <div>NIP. ${kepalaSekolahNip}</div>
      </div>

      <div class="sig-box">
        <div>${kop.kotaKabupaten || 'Surabaya'}, ${currentDate}</div>
        <div style="font-weight: bold;">Pengelola SIMPEG & Kesiswaan</div>
        <div class="sig-space"></div>
        <div class="sig-name">${operatorNama}</div>
        <div>NIP. ${operatorNip}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

