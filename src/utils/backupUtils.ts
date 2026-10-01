import { Pegawai, Siswa, KopSekolah } from '../types';

export interface BackupMetadata {
  version: string;
  appName: string;
  exportDate: string;
  exportTimestamp: number;
  exportedBy: string;
  npsn: string;
  namaSekolah: string;
  summary: {
    totalPegawai: number;
    totalSiswa: number;
    totalPns: number;
    totalPppk: number;
    totalGtt: number;
    totalPtt: number;
    totalBerkasPegawai: number;
    totalFotoSiswa: number;
  };
}

export interface FullBackupPayload {
  metadata: BackupMetadata;
  pegawai: Pegawai[];
  siswa: Siswa[];
  kop: KopSekolah;
  syncHistory?: any[];
}

export interface LocalSnapshot {
  id: string;
  label: string;
  createdAt: string;
  timestamp: number;
  totalPegawai: number;
  totalSiswa: number;
  payload: FullBackupPayload;
}

export const SNAPSHOTS_STORAGE_KEY = 'SIMPEG_QUICK_SNAPSHOTS_V1';

/**
 * Creates full backup payload with rich metadata and summary statistics
 */
export function createFullBackupPayload(
  pegawaiList: Pegawai[],
  siswaList: Siswa[],
  kop: KopSekolah,
  exportedBy = 'Admin SIMPEG'
): FullBackupPayload {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalBerkas = pegawaiList.reduce((acc, p) => acc + (p.berkas?.length || 0), 0);
  const totalFotoSiswa = siswaList.filter((s) => Boolean(s.foto)).length;

  return {
    metadata: {
      version: '2.5',
      appName: 'SIMPEG & KESISWAAN SMAN 9 SURABAYA',
      exportDate: dateFormatted,
      exportTimestamp: now.getTime(),
      exportedBy,
      npsn: kop.npsn || '20532252',
      namaSekolah: kop.namaSekolah || 'SMAN 9 SURABAYA',
      summary: {
        totalPegawai: pegawaiList.length,
        totalSiswa: siswaList.length,
        totalPns: pegawaiList.filter((p) => p.statusPegawai === 'PNS').length,
        totalPppk: pegawaiList.filter((p) => p.statusPegawai === 'PPPK').length,
        totalGtt: pegawaiList.filter((p) => p.statusPegawai.includes('GTT')).length,
        totalPtt: pegawaiList.filter((p) => p.statusPegawai.includes('PTT')).length,
        totalBerkasPegawai: totalBerkas,
        totalFotoSiswa: totalFotoSiswa
      }
    },
    pegawai: pegawaiList,
    siswa: siswaList,
    kop: kop
  };
}

/**
 * Generates formatted filename for backup file
 */
export function generateBackupFileName(namaSekolah: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  const cleanSchool = namaSekolah.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  return `BACKUP-FULL-SIMPEG-${cleanSchool}-${year}${month}${day}-${hour}${min}.json`;
}

/**
 * Downloads the backup payload as a .json file to client machine
 */
export function downloadBackupFile(payload: FullBackupPayload, customFileName?: string) {
  const fileName = customFileName || generateBackupFileName(payload.metadata.namaSekolah);
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates any uploaded backup file content (supports modern and legacy formats)
 */
export function validateBackupFile(jsonString: string): {
  isValid: boolean;
  payload?: FullBackupPayload;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'Berkas bukan format JSON yang valid.' };
    }

    // Check if modern FullBackupPayload
    if (parsed.pegawai || parsed.siswa || parsed.kop) {
      const pegawai: Pegawai[] = Array.isArray(parsed.pegawai) ? parsed.pegawai : [];
      const siswa: Siswa[] = Array.isArray(parsed.siswa) ? parsed.siswa : [];
      const kop: KopSekolah = parsed.kop && typeof parsed.kop === 'object' ? parsed.kop : ({} as KopSekolah);

      // Construct normalized payload
      const normalizedPayload: FullBackupPayload = {
        metadata: parsed.metadata || {
          version: '1.0-imported',
          appName: 'SIMPEG SMAN 9 SURABAYA',
          exportDate: new Date().toLocaleDateString('id-ID'),
          exportTimestamp: Date.now(),
          exportedBy: 'Berkas JSON Cadangan',
          npsn: kop.npsn || '20532252',
          namaSekolah: kop.namaSekolah || 'SMAN 9 SURABAYA',
          summary: {
            totalPegawai: pegawai.length,
            totalSiswa: siswa.length,
            totalPns: pegawai.filter((p) => p.statusPegawai === 'PNS').length,
            totalPppk: pegawai.filter((p) => p.statusPegawai === 'PPPK').length,
            totalGtt: pegawai.filter((p) => p.statusPegawai?.includes('GTT')).length,
            totalPtt: pegawai.filter((p) => p.statusPegawai?.includes('PTT')).length,
            totalBerkasPegawai: pegawai.reduce((a, b) => a + (b.berkas?.length || 0), 0),
            totalFotoSiswa: siswa.filter((s) => Boolean(s.foto)).length
          }
        },
        pegawai,
        siswa,
        kop,
        syncHistory: parsed.syncHistory || []
      };

      return { isValid: true, payload: normalizedPayload };
    }

    // Check if it was directly an array of Pegawai
    if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].nip || parsed[0].nama)) {
      const normalizedPayload: FullBackupPayload = {
        metadata: {
          version: '1.0-pegawai-only',
          appName: 'SIMPEG SMAN 9 SURABAYA',
          exportDate: new Date().toLocaleDateString('id-ID'),
          exportTimestamp: Date.now(),
          exportedBy: 'Array Pegawai Eksternal',
          npsn: '20532252',
          namaSekolah: 'SMAN 9 SURABAYA',
          summary: {
            totalPegawai: parsed.length,
            totalSiswa: 0,
            totalPns: parsed.filter((p: any) => p.statusPegawai === 'PNS').length,
            totalPppk: parsed.filter((p: any) => p.statusPegawai === 'PPPK').length,
            totalGtt: 0,
            totalPtt: 0,
            totalBerkasPegawai: 0,
            totalFotoSiswa: 0
          }
        },
        pegawai: parsed,
        siswa: [],
        kop: {} as KopSekolah
      };
      return { isValid: true, payload: normalizedPayload };
    }

    return {
      isValid: false,
      error: 'Berkas JSON tidak memiliki data Pegawai, Siswa, maupun KOP Sekolah yang dikenali.'
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Gagal membaca berkas: ${err.message || 'Format JSON tidak valid'}`
    };
  }
}

/**
 * Merge new data into existing list without creating duplicate IDs, NIPs, or NISNs
 */
export function mergePegawaiData(existing: Pegawai[], imported: Pegawai[]): Pegawai[] {
  const existingMap = new Map<string, Pegawai>();

  // Use NIP, NUPTK, or unique ID as key
  existing.forEach((p) => {
    const key = p.nip ? `nip-${p.nip}` : p.nuptk ? `nuptk-${p.nuptk}` : `id-${p.id}`;
    existingMap.set(key, p);
  });

  let maxId = existing.reduce((max, p) => Math.max(max, p.id || 0), 100);

  imported.forEach((p) => {
    const key = p.nip ? `nip-${p.nip}` : p.nuptk ? `nuptk-${p.nuptk}` : `id-${p.id}`;
    if (!existingMap.has(key)) {
      maxId++;
      existingMap.set(key, { ...p, id: p.id || maxId });
    }
  });

  return Array.from(existingMap.values());
}

export function mergeSiswaData(existing: Siswa[], imported: Siswa[]): Siswa[] {
  const existingMap = new Map<string, Siswa>();

  // Use NISN, NIS, or ID as key
  existing.forEach((s) => {
    const key = s.nisn ? `nisn-${s.nisn}` : s.nis ? `nis-${s.nis}` : `id-${s.id}`;
    existingMap.set(key, s);
  });

  let maxId = existing.reduce((max, s) => Math.max(max, s.id || 0), 1000);

  imported.forEach((s) => {
    const key = s.nisn ? `nisn-${s.nisn}` : s.nis ? `nis-${s.nis}` : `id-${s.id}`;
    if (!existingMap.has(key)) {
      maxId++;
      existingMap.set(key, { ...s, id: s.id || maxId });
    }
  });

  return Array.from(existingMap.values());
}

/**
 * Snapshot Management (Local Quick Recovery Points)
 */
export function getLocalSnapshots(): LocalSnapshot[] {
  try {
    const saved = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading snapshots:', e);
  }
  return [];
}

export function saveLocalSnapshot(label: string, payload: FullBackupPayload): LocalSnapshot[] {
  const current = getLocalSnapshots();
  const newSnapshot: LocalSnapshot = {
    id: `snap-${Date.now()}`,
    label: label.trim() || `Titik Pemulihan ${new Date().toLocaleDateString('id-ID')}`,
    createdAt: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    timestamp: Date.now(),
    totalPegawai: payload.pegawai.length,
    totalSiswa: payload.siswa.length,
    payload
  };

  // Keep latest 5 snapshots to save space
  const updated = [newSnapshot, ...current].slice(0, 5);
  try {
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage snapshot storage full, trying to store latest only', e);
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify([newSnapshot]));
  }

  return updated;
}

export function deleteLocalSnapshot(id: string): LocalSnapshot[] {
  const current = getLocalSnapshots();
  const updated = current.filter((s) => s.id !== id);
  try {
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting snapshot:', e);
  }
  return updated;
}

/**
 * Storage metrics calculation for localStorage
 */
export function getStorageMetrics(): {
  totalBytes: number;
  formattedTotal: string;
  items: { key: string; name: string; size: string }[];
} {
  let totalBytes = 0;
  const items: { key: string; name: string; size: string }[] = [];

  const keysToCheck = [
    { key: 'SIMPEG_SMAN_DATA_V1', name: 'Data Pegawai (PTK)' },
    { key: 'SIMPEG_SMAN_SISWA_DATA_V1', name: 'Data Siswa (Buku Induk & Foto)' },
    { key: 'SIMPEG_SMAN_KOP_V1', name: 'KOP & Pengaturan Surat' },
    { key: 'SIMPEG_QUICK_SNAPSHOTS_V1', name: 'Titik Pemulihan (Snapshots)' },
    { key: 'SMAN_SHEETS_SYNC_HISTORY_V1', name: 'Riwayat Sinkronisasi Google Sheets' }
  ];

  if (typeof window !== 'undefined' && window.localStorage) {
    keysToCheck.forEach((item) => {
      const val = localStorage.getItem(item.key);
      const bytes = val ? new Blob([val]).size : 0;
      totalBytes += bytes;
      items.push({
        key: item.key,
        name: item.name,
        size: formatBytes(bytes)
      });
    });
  }

  return {
    totalBytes,
    formattedTotal: formatBytes(totalBytes),
    items
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Uploads full backup JSON to Google Drive
 */
export async function uploadBackupToGoogleDrive(
  accessToken: string,
  payload: FullBackupPayload,
  customFileName?: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const fileName = customFileName || generateBackupFileName(payload.metadata.namaSekolah);
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `Cadangan Penuh SIMPEG & Kesiswaan ${payload.kop?.namaSekolah || 'SMAN 9 Surabaya'} - Diekspor ${payload.metadata.exportDate}`
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: form
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengunggah cadangan ke Google Drive (${res.status})`);
  }

  return await res.json();
}
