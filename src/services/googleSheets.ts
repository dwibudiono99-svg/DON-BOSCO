import { Pegawai, Siswa, KopSekolah, GoogleSheetItem, GoogleSpreadsheetDetail, GoogleSheetTab } from '../types';
import { getOfficialDinasPhotoBgColor } from '../data/initialSiswaData';

/**
 * List all Google Spreadsheets from user's Google Drive
 */
export async function listGoogleSpreadsheets(accessToken: string): Promise<GoogleSheetItem[]> {
  try {
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const fields = encodeURIComponent('files(id, name, webViewLink, createdTime, modifiedTime, size)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime%20desc&pageSize=30`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Gagal mengambil daftar spreadsheet (${res.status})`);
    }

    const data = await res.json();
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      size: file.size
    }));
  } catch (error: any) {
    console.error('Error listGoogleSpreadsheets:', error);
    throw error;
  }
}

/**
 * Fetch spreadsheet metadata including sheet tabs
 */
export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<GoogleSpreadsheetDetail> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,spreadsheetUrl,sheets.properties`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Gagal mengambil detail spreadsheet (${res.status})`);
    }

    const data = await res.json();
    const sheets: GoogleSheetTab[] = (data.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      index: s.properties.index,
      rowCount: s.properties.gridProperties?.rowCount,
      columnCount: s.properties.gridProperties?.columnCount
    }));

    return {
      spreadsheetId: data.spreadsheetId,
      title: data.properties?.title || 'Spreadsheet Tanpa Judul',
      spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      sheets
    };
  } catch (error: any) {
    console.error('Error getSpreadsheetDetails:', error);
    throw error;
  }
}

/**
 * Read values from a specific sheet range
 */
export async function readSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  try {
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Gagal membaca sel spreadsheet (${res.status})`);
    }

    const data = await res.json();
    return data.values || [];
  } catch (error: any) {
    console.error('Error readSheetValues:', error);
    throw error;
  }
}

/**
 * Helper to build Pegawai header and data rows
 */
export function buildPegawaiSheetData(pegawaiList: Pegawai[], kop: KopSekolah): any[][] {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const rows: any[][] = [
    [`PEMERINTAH PROVINSI ${kop.provinsi || 'JAWA TIMUR'}`],
    [`DINAS PENDIDIKAN — ${kop.cabangDinas || 'CABANG DINAS WILAYAH KOTA SURABAYA'}`],
    [kop.namaSekolah],
    [`Alamat: ${kop.alamatJalan}, ${kop.kotaKabupaten} | Telp: ${kop.telepon} | Email: ${kop.email}`],
    ['DATA KEPEGAWAIAN PENDIDIK & TENAGA KEPENDIDIKAN (SIMPEG SMAN)'],
    [`Tanggal Pembaruan: ${currentDate} | Total Pegawai: ${pegawaiList.length} Orang`],
    [], // Blank separator row
    [
      'No',
      'NIP / NIPPPK',
      'Nama Lengkap Beserta Gelar',
      'NUPTK',
      'Jenis Kelamin',
      'Status Kepegawaian',
      'Jenis PTK',
      'Pangkat / Golongan',
      'Mata Pelajaran',
      'Rumpun Kurikulum',
      'Pendidikan Terakhir',
      'TMT',
      'Sertifikasi Pendidik',
      'Jumlah Jam Mengajar (JJM)',
      'Tugas Tambahan',
      'Nomor Handphone / WhatsApp',
      'Email Resmi',
      'NIK Pegawai',
      'No KK',
      'Status Pernikahan'
    ]
  ];

  pegawaiList.forEach((p, idx) => {
    rows.push([
      idx + 1,
      p.nip || '-',
      p.nama,
      p.nuptk || '-',
      p.jk,
      p.statusPegawai,
      p.jenisPtk,
      p.golongan,
      p.mapel || '-',
      p.rumpunMapel || '-',
      p.pendidikan,
      p.tmt || '-',
      p.statusSertifikasi || 'Belum Sertifikasi',
      p.jumlahJamMengajar ?? 0,
      p.tugasTambahan || '-',
      p.noHp,
      p.email || '-',
      p.nikPegawai || '-',
      p.nomorKK || '-',
      p.statusPernikahan || '-'
    ]);
  });

  return rows;
}

/**
 * Helper to build Siswa header and data rows
 */
export function buildSiswaSheetData(siswaList: Siswa[], kop: KopSekolah): any[][] {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const rows: any[][] = [
    [`PEMERINTAH PROVINSI ${kop.provinsi || 'JAWA TIMUR'}`],
    [`DINAS PENDIDIKAN — ${kop.cabangDinas || 'CABANG DINAS WILAYAH KOTA SURABAYA'}`],
    [kop.namaSekolah],
    [`Alamat: ${kop.alamatJalan}, ${kop.kotaKabupaten} | Telp: ${kop.telepon} | NPSN: ${kop.npsn}`],
    ['BUKU INDUK SISWA & DATA DAPODIK KESISWAAN SMA NEGERI'],
    [`Tanggal Sinkronisasi: ${currentDate} | Total Siswa Terdata: ${siswaList.length} Siswa`],
    [], // Blank separator row
    [
      'No',
      'NISN',
      'NIS',
      'NIK',
      'Nama Lengkap Siswa',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Aturan Pas Foto Dinas',
      'Agama',
      'Tingkat Kelas',
      'Rombel',
      'Fase Kurikulum',
      'Peminatan / Jurusan',
      'Status Siswa',
      'Nama Ayah',
      'Pekerjaan Ayah',
      'Nama Ibu',
      'Pekerjaan Ibu',
      'No. HP Orang Tua / Wali',
      'Guru Wali Kelas',
      'No. HP Siswa',
      'Email Siswa (belajar.id)',
      'Alamat Domisili',
      'Kecamatan',
      'Kota / Kabupaten',
      'Prestasi Siswa',
      'Ekstrakurikuler',
      'Catatan Khusus'
    ]
  ];

  siswaList.forEach((s, idx) => {
    const dinasBg = getOfficialDinasPhotoBgColor(s.tanggalLahir);
    rows.push([
      idx + 1,
      s.nisn,
      s.nis,
      s.nik,
      s.nama,
      s.jk,
      s.tempatLahir,
      s.tanggalLahir,
      dinasBg,
      s.agama,
      s.tingkatKelas,
      s.rombel,
      s.faseKurikulum,
      s.peminatan,
      s.statusSiswa,
      s.namaAyah,
      s.pekerjaanAyah || '-',
      s.namaIbu,
      s.pekerjaanIbu || '-',
      s.noHpOrtu,
      s.waliKelas,
      s.noHpSiswa || '-',
      s.email || '-',
      s.alamat,
      s.kecamatan || '-',
      s.kotaKab,
      s.prestasi || '-',
      s.ekskul || '-',
      s.catatanKhusus || '-'
    ]);
  });

  return rows;
}

/**
 * Format headers, colors, and freeze rows in Google Sheets
 */
function getFormatRequests(sheetId: number, numCols: number, headerRowIndex: number = 7) {
  return [
    // Freeze rows up to table header
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: {
            frozenRowCount: headerRowIndex + 1
          }
        },
        fields: 'gridProperties.frozenRowCount'
      }
    },
    // Banner styling (Rows 0-5)
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: numCols
        },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 13, foregroundColor: { red: 0.05, green: 0.2, blue: 0.4 } }
          }
        },
        fields: 'userEnteredFormat(textFormat)'
      }
    },
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 4,
          endRowIndex: 5,
          startColumnIndex: 0,
          endColumnIndex: numCols
        },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14, foregroundColor: { red: 0.1, green: 0.35, blue: 0.2 } }
          }
        },
        fields: 'userEnteredFormat(textFormat)'
      }
    },
    // Table Header styling (Row 7)
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: headerRowIndex,
          endRowIndex: headerRowIndex + 1,
          startColumnIndex: 0,
          endColumnIndex: numCols
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.12, green: 0.35, blue: 0.65 },
            textFormat: {
              foregroundColor: { red: 1, green: 1, blue: 1 },
              bold: true,
              fontSize: 10
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
      }
    },
    // Set auto-resize / min column width on first few columns
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: numCols
        }
      }
    }
  ];
}

/**
 * Create a new Google Spreadsheet containing both Pegawai and Siswa tabs
 */
export async function createIntegratedSchoolSpreadsheet(
  accessToken: string,
  title: string,
  pegawaiList: Pegawai[],
  siswaList: Siswa[],
  kop: KopSekolah
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  try {
    // 1. Create spreadsheet with two sheets
    const createPayload = {
      properties: {
        title: title || `DATABASE RESMI ${kop.namaSekolah.toUpperCase()} (SIMPEG & SISWA)`
      },
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: 'Data Siswa & Dapodik',
            index: 0
          }
        },
        {
          properties: {
            sheetId: 1,
            title: 'Data Guru & Pegawai',
            index: 1
          }
        }
      ]
    };

    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal membuat spreadsheet (${createRes.status})`);
    }

    const sheetObj = await createRes.json();
    const spreadsheetId = sheetObj.spreadsheetId;
    const spreadsheetUrl = sheetObj.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // 2. Populate values
    const siswaData = buildSiswaSheetData(siswaList, kop);
    const pegawaiData = buildPegawaiSheetData(pegawaiList, kop);

    const valuesPayload = {
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: "'Data Siswa & Dapodik'!A1",
          values: siswaData
        },
        {
          range: "'Data Guru & Pegawai'!A1",
          values: pegawaiData
        }
      ]
    };

    const valRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(valuesPayload)
      }
    );

    if (!valRes.ok) {
      console.warn('Batch values update warning:', await valRes.text());
    }

    // 3. Apply professional format requests
    try {
      const formatRequests = [
        ...getFormatRequests(0, 29, 7),
        ...getFormatRequests(1, 25, 7)
      ];

      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: formatRequests })
      });
    } catch (fmtErr) {
      console.warn('Styling format applied with fallback:', fmtErr);
    }

    return { spreadsheetId, spreadsheetUrl };
  } catch (error: any) {
    console.error('Error createIntegratedSchoolSpreadsheet:', error);
    throw error;
  }
}

/**
 * Export only Pegawai to a new dedicated Google Spreadsheet
 */
export async function exportPegawaiToNewSheet(
  accessToken: string,
  title: string,
  pegawaiList: Pegawai[],
  kop: KopSekolah
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  try {
    const createPayload = {
      properties: {
        title: title || `SIMPEG ${kop.namaSekolah.toUpperCase()} - DAFTAR GURU & PEGAWAI`
      },
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: 'Daftar Pegawai & Guru',
            index: 0
          }
        }
      ]
    };

    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal membuat spreadsheet (${createRes.status})`);
    }

    const sheetObj = await createRes.json();
    const spreadsheetId = sheetObj.spreadsheetId;
    const spreadsheetUrl = sheetObj.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    const pegawaiData = buildPegawaiSheetData(pegawaiList, kop);

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daftar Pegawai & Guru'!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: pegawaiData })
      }
    );

    // Apply formatting
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: getFormatRequests(0, 25, 7) })
      });
    } catch (fmtErr) {
      console.warn('Formatting fallback:', fmtErr);
    }

    return { spreadsheetId, spreadsheetUrl };
  } catch (error: any) {
    console.error('Error exportPegawaiToNewSheet:', error);
    throw error;
  }
}

/**
 * Export only Siswa to a new dedicated Google Spreadsheet
 */
export async function exportSiswaToNewSheet(
  accessToken: string,
  title: string,
  siswaList: Siswa[],
  kop: KopSekolah
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  try {
    const createPayload = {
      properties: {
        title: title || `DAPODIK ${kop.namaSekolah.toUpperCase()} - BUKU INDUK SISWA`
      },
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: 'Buku Induk Siswa',
            index: 0
          }
        }
      ]
    };

    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal membuat spreadsheet (${createRes.status})`);
    }

    const sheetObj = await createRes.json();
    const spreadsheetId = sheetObj.spreadsheetId;
    const spreadsheetUrl = sheetObj.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    const siswaData = buildSiswaSheetData(siswaList, kop);

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Buku Induk Siswa'!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: siswaData })
      }
    );

    // Apply formatting
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: getFormatRequests(0, 29, 7) })
      });
    } catch (fmtErr) {
      console.warn('Formatting fallback:', fmtErr);
    }

    return { spreadsheetId, spreadsheetUrl };
  } catch (error: any) {
    console.error('Error exportSiswaToNewSheet:', error);
    throw error;
  }
}

/**
 * Overwrite existing sheet tab with updated Pegawai data
 */
export async function syncPegawaiToExistingSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  pegawaiList: Pegawai[],
  kop: KopSekolah
): Promise<void> {
  const pegawaiData = buildPegawaiSheetData(pegawaiList, kop);

  // Clear first
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetTitle)}'!A1:Z500:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  // Write new
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetTitle)}'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: pegawaiData })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal menyinkronkan data pegawai ke spreadsheet');
  }
}

/**
 * Overwrite existing sheet tab with updated Siswa data
 */
export async function syncSiswaToExistingSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  siswaList: Siswa[],
  kop: KopSekolah
): Promise<void> {
  const siswaData = buildSiswaSheetData(siswaList, kop);

  // Clear first
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetTitle)}'!A1:AC1000:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  // Write new
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetTitle)}'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: siswaData })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal menyinkronkan data siswa ke spreadsheet');
  }
}

/**
 * Smart Parser to convert raw Google Sheets table rows to Siswa list
 */
export function parseSheetRowsToSiswa(rows: any[][]): Siswa[] {
  if (!rows || rows.length === 0) return [];

  // Find header row by searching for NISN or Nama
  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    const rowStr = (rows[i] || []).join(' ').toLowerCase();
    if (rowStr.includes('nisn') || (rowStr.includes('nama') && rowStr.includes('kelamin'))) {
      headerRowIdx = i;
      break;
    }
  }

  if (headerRowIdx === -1) {
    throw new Error('Tidak dapat menemukan baris judul/header kolom (NISN, Nama Siswa, Rombel) dalam sheet ini.');
  }

  const headers = rows[headerRowIdx].map((h: any) => String(h || '').trim().toLowerCase());
  const dataRows = rows.slice(headerRowIdx + 1);

  const getCol = (patterns: string[]): number => {
    return headers.findIndex((h) => patterns.some((p) => h.includes(p)));
  };

  const cNisn = getCol(['nisn']);
  const cNis = getCol(['nis']);
  const cNik = getCol(['nik']);
  const cNama = getCol(['nama lengkap', 'nama']);
  const cJk = getCol(['jenis kelamin', 'jk']);
  const cTempat = getCol(['tempat lahir', 'tempat']);
  const cTgl = getCol(['tanggal lahir', 'tgl lahir']);
  const cAgama = getCol(['agama']);
  const cTingkat = getCol(['tingkat kelas', 'tingkat', 'kelas']);
  const cRombel = getCol(['rombel', 'rombongan']);
  const cFase = getCol(['fase']);
  const cPeminatan = getCol(['peminatan', 'jurusan']);
  const cStatus = getCol(['status siswa', 'status']);
  const cAyah = getCol(['nama ayah', 'ayah']);
  const cIbu = getCol(['nama ibu', 'ibu']);
  const cNoHpOrtu = getCol(['hp orang tua', 'hp ortu', 'no ortu']);
  const cWali = getCol(['wali kelas', 'wali']);
  const cNoHpSiswa = getCol(['hp siswa', 'no hp']);
  const cEmail = getCol(['email']);
  const cAlamat = getCol(['alamat']);
  const cPrestasi = getCol(['prestasi']);
  const cEkskul = getCol(['ekstrakurikuler', 'ekskul']);

  const result: Siswa[] = [];

  dataRows.forEach((row, idx) => {
    if (!row || row.length === 0) return;
    const nama = cNama !== -1 && row[cNama] ? String(row[cNama]).trim() : '';
    if (!nama || nama.toLowerCase().startsWith('total') || nama.toLowerCase().startsWith('pemerintah')) return;

    const nisn = cNisn !== -1 && row[cNisn] ? String(row[cNisn]).trim() : `00${idx + 1}0000000`.slice(0, 10);
    const tanggalLahir = cTgl !== -1 && row[cTgl] ? String(row[cTgl]).trim() : '2008-01-01';
    const jkRaw = cJk !== -1 && row[cJk] ? String(row[cJk]).trim().toLowerCase() : 'l';
    const jk: 'Laki-laki' | 'Perempuan' =
      jkRaw.startsWith('p') || jkRaw.includes('wanita') || jkRaw.includes('perempuan') ? 'Perempuan' : 'Laki-laki';
    const officialBg = getOfficialDinasPhotoBgColor(tanggalLahir);

    result.push({
      id: Date.now() + idx,
      nisn,
      nis: cNis !== -1 && row[cNis] ? String(row[cNis]).trim() : `240${idx + 1}`,
      nik: cNik !== -1 && row[cNik] ? String(row[cNik]).trim() : `357801000000000${idx + 1}`.slice(0, 16),
      nama,
      jk,
      tempatLahir: cTempat !== -1 && row[cTempat] ? String(row[cTempat]).trim() : 'Surabaya',
      tanggalLahir,
      agama: (cAgama !== -1 && row[cAgama] ? String(row[cAgama]).trim() : 'Islam') as any,
      tingkatKelas: (cTingkat !== -1 && row[cTingkat] ? String(row[cTingkat]).trim() : 'X') as any,
      rombel: cRombel !== -1 && row[cRombel] ? String(row[cRombel]).trim() : 'X-1',
      faseKurikulum: (cFase !== -1 && row[cFase] ? String(row[cFase]).trim() : 'Fase E (Kelas 10)') as any,
      peminatan: cPeminatan !== -1 && row[cPeminatan] ? String(row[cPeminatan]).trim() : 'Kurikulum Merdeka (Umum)',
      statusSiswa: (cStatus !== -1 && row[cStatus] ? String(row[cStatus]).trim() : 'Aktif') as any,
      alamat: cAlamat !== -1 && row[cAlamat] ? String(row[cAlamat]).trim() : 'Surabaya',
      kotaKab: 'Kota Surabaya',
      noHpSiswa: cNoHpSiswa !== -1 && row[cNoHpSiswa] ? String(row[cNoHpSiswa]).trim() : undefined,
      email: cEmail !== -1 && row[cEmail] ? String(row[cEmail]).trim() : undefined,
      namaAyah: cAyah !== -1 && row[cAyah] ? String(row[cAyah]).trim() : '-',
      namaIbu: cIbu !== -1 && row[cIbu] ? String(row[cIbu]).trim() : '-',
      noHpOrtu: cNoHpOrtu !== -1 && row[cNoHpOrtu] ? String(row[cNoHpOrtu]).trim() : '081234567890',
      waliKelas: cWali !== -1 && row[cWali] ? String(row[cWali]).trim() : 'Drs. Supriyanto, M.M.',
      prestasi: cPrestasi !== -1 && row[cPrestasi] ? String(row[cPrestasi]).trim() : undefined,
      ekskul: cEkskul !== -1 && row[cEkskul] ? String(row[cEkskul]).trim() : undefined,
      fotoBgColor: officialBg
    });
  });

  return result;
}
