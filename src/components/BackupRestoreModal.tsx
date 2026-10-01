import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  FileCheck,
  HardDrive,
  Cloud,
  FileSpreadsheet,
  Trash2,
  History,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  Calendar,
  Building,
  Check,
  ExternalLink
} from 'lucide-react';
import { Pegawai, Siswa, KopSekolah } from '../types';
import {
  createFullBackupPayload,
  downloadBackupFile,
  validateBackupFile,
  mergePegawaiData,
  mergeSiswaData,
  getLocalSnapshots,
  saveLocalSnapshot,
  deleteLocalSnapshot,
  getStorageMetrics,
  uploadBackupToGoogleDrive,
  FullBackupPayload,
  LocalSnapshot
} from '../utils/backupUtils';
import {
  hasGoogleWorkspaceAccess,
  getCurrentGoogleUser,
  getGoogleAccessToken,
  signInWithGoogleWorkspace
} from '../services/googleAuth';
import { exportPegawaiToCSV, exportSiswaToCSV } from '../utils/csvUtils';
import { ExcelWorksheetViewer } from './ExcelWorksheetViewer';
import { initialPegawaiData } from '../data/initialData';
import { initialSiswaData } from '../data/initialSiswaData';
import { defaultKopSekolah } from '../data/defaultKopData';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  pegawaiList: Pegawai[];
  siswaList: Siswa[];
  kop: KopSekolah;
  onRestoreData: (restored: {
    pegawai?: Pegawai[];
    siswa?: Siswa[];
    kop?: KopSekolah;
  }, mode: 'replace' | 'merge') => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  pegawaiList,
  siswaList,
  kop,
  onRestoreData,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'snapshots' | 'storage'>('backup');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // File Upload State for Restore
  const [uploadedPayload, setUploadedPayload] = useState<FullBackupPayload | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [restoreOptions, setRestoreOptions] = useState({
    restorePegawai: true,
    restoreSiswa: true,
    restoreKop: true
  });
  const [confirmReplace, setConfirmReplace] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Snapshots State
  const [snapshots, setSnapshots] = useState<LocalSnapshot[]>([]);
  const [newSnapshotLabel, setNewSnapshotLabel] = useState('');

  // Storage Metrics
  const [storageMetrics, setStorageMetrics] = useState(getStorageMetrics());

  // Google Workspace Integration for Cloud Backup
  const [isGoogleAuthed, setIsGoogleAuthed] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [driveUploadResult, setDriveUploadResult] = useState<{ id: string; name: string; webViewLink?: string } | null>(null);

  // Reset Factory Dialog
  const [isFactoryResetModalOpen, setIsFactoryResetModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setSnapshots(getLocalSnapshots());
      setStorageMetrics(getStorageMetrics());
      checkGoogleAuth();
    }
  }, [isOpen]);

  const checkGoogleAuth = async () => {
    try {
      const authed = hasGoogleWorkspaceAccess();
      setIsGoogleAuthed(authed);
      if (authed) {
        setGoogleUser(getCurrentGoogleUser());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Download Full JSON Backup
  const handleDownloadFullBackup = () => {
    try {
      setLoading(true);
      const payload = createFullBackupPayload(pegawaiList, siswaList, kop, googleUser?.email || 'Admin SMAN 9 Surabaya');
      downloadBackupFile(payload);
      setSuccessMsg(`Berkas cadangan penuh berhasil dibuat & diunduh (${payload.metadata.summary.totalPegawai} Pegawai, ${payload.metadata.summary.totalSiswa} Siswa, KOP Sekolah).`);
      onShowToast('Cadangan Penuh Diunduh', 'Berkas cadangan penuh (.json) berhasil diunduh.', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat berkas cadangan.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Upload Backup to Google Drive
  const handleUploadToDrive = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let token = await getGoogleAccessToken();
      if (!token) {
        const authRes = await signInWithGoogleWorkspace();
        if (authRes) {
          token = authRes.accessToken;
          setIsGoogleAuthed(true);
          setGoogleUser(authRes.user);
        }
      }

      if (!token) {
        throw new Error('Izin Google Drive belum diberikan.');
      }

      const payload = createFullBackupPayload(pegawaiList, siswaList, kop, googleUser?.email || 'Admin SMAN 9 Surabaya');
      const result = await uploadBackupToGoogleDrive(token, payload);
      setDriveUploadResult(result);
      setSuccessMsg(`Cadangan berhasil diunggah langsung ke Google Drive: "${result.name}"`);
      onShowToast('Google Drive Berhasil', 'Cadangan berhasil tersimpan di Google Drive!', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan cadangan ke Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle File Selection for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);
    setUploadedPayload(null);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const validation = validateBackupFile(text);

        if (!validation.isValid || !validation.payload) {
          setErrorMsg(validation.error || 'Format berkas tidak valid.');
          return;
        }

        setUploadedPayload(validation.payload);
        setSuccessMsg(`Berkas valid: ${validation.payload.metadata.appName} (${validation.payload.metadata.exportDate})`);
      } catch (err: any) {
        setErrorMsg('Gagal membaca isi berkas JSON: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Gagal membaca berkas.');
      setLoading(false);
    };

    reader.readAsText(file);
    // Reset file input so same file can be selected again if needed
    e.target.value = '';
  };

  // 4. Execute Restore
  const handleExecuteRestore = () => {
    if (!uploadedPayload) {
      setErrorMsg('Pilih berkas cadangan terlebih dahulu.');
      return;
    }

    if (restoreMode === 'replace' && !confirmReplace) {
      setErrorMsg('Harap beri centang pada kotak konfirmasi sebelum melakukan Timpa Bersih.');
      return;
    }

    setLoading(true);
    try {
      const dataToRestore: {
        pegawai?: Pegawai[];
        siswa?: Siswa[];
        kop?: KopSekolah;
      } = {};

      if (restoreOptions.restorePegawai) {
        dataToRestore.pegawai =
          restoreMode === 'merge'
            ? mergePegawaiData(pegawaiList, uploadedPayload.pegawai)
            : uploadedPayload.pegawai;
      }

      if (restoreOptions.restoreSiswa) {
        dataToRestore.siswa =
          restoreMode === 'merge'
            ? mergeSiswaData(siswaList, uploadedPayload.siswa)
            : uploadedPayload.siswa;
      }

      if (restoreOptions.restoreKop && uploadedPayload.kop?.namaSekolah) {
        dataToRestore.kop = uploadedPayload.kop;
      }

      onRestoreData(dataToRestore, restoreMode);

      setSuccessMsg(
        `Pemulihan berhasil! (${dataToRestore.pegawai?.length || pegawaiList.length} Pegawai, ${
          dataToRestore.siswa?.length || siswaList.length
        } Siswa diperbarui).`
      );
      onShowToast('Pemulihan Selesai', 'Data berhasil dipulihkan ke sistem!', 'success');

      // Clear uploaded state
      setUploadedPayload(null);
      setUploadedFileName('');
      setConfirmReplace(false);
      setStorageMetrics(getStorageMetrics());
    } catch (err: any) {
      setErrorMsg('Gagal memulihkan data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Create Local Snapshot
  const handleCreateSnapshot = () => {
    try {
      const payload = createFullBackupPayload(pegawaiList, siswaList, kop, 'Lokal Snapshot');
      const updated = saveLocalSnapshot(newSnapshotLabel, payload);
      setSnapshots(updated);
      setNewSnapshotLabel('');
      setSuccessMsg('Titik pemulihan (snapshot) lokal berhasil dibuat.');
      setStorageMetrics(getStorageMetrics());
      onShowToast('Snapshot Disimpan', 'Titik pemulihan lokal berhasil disimpan.', 'success');
    } catch (err: any) {
      setErrorMsg('Gagal membuat snapshot: ' + err.message);
    }
  };

  // 6. Restore from Local Snapshot
  const handleRestoreSnapshot = (snap: LocalSnapshot) => {
    if (!window.confirm(`Pulihkan data dari titik "${snap.label}" (${snap.createdAt})? Data yang ada saat ini akan digantikan.`)) {
      return;
    }

    try {
      onRestoreData(
        {
          pegawai: snap.payload.pegawai,
          siswa: snap.payload.siswa,
          kop: snap.payload.kop
        },
        'replace'
      );
      setSuccessMsg(`Data berhasil dipulihkan dari snapshot "${snap.label}".`);
      setStorageMetrics(getStorageMetrics());
      onShowToast('Snapshot Dipulihkan', `Data dipulihkan dari snapshot "${snap.label}"`, 'success');
    } catch (err: any) {
      setErrorMsg('Gagal memulihkan snapshot: ' + err.message);
    }
  };

  // 7. Delete Local Snapshot
  const handleDeleteSnapshot = (id: string) => {
    const updated = deleteLocalSnapshot(id);
    setSnapshots(updated);
    setStorageMetrics(getStorageMetrics());
    onShowToast('Snapshot Dihapus', 'Titik pemulihan berhasil dihapus.', 'info');
  };

  // 8. Factory Reset
  const handleExecuteFactoryReset = () => {
    try {
      onRestoreData(
        {
          pegawai: initialPegawaiData,
          siswa: initialSiswaData,
          kop: defaultKopSekolah
        },
        'replace'
      );
      setIsFactoryResetModalOpen(false);
      setSuccessMsg('Data telah direset kembali ke data awal simulasi SMAN 9 Surabaya.');
      setStorageMetrics(getStorageMetrics());
      onShowToast('Reset Pabrik', 'Sistem direset ke data awal simulasi.', 'info');
    } catch (err: any) {
      setErrorMsg('Gagal mereset data: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Database className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Pusat Cadangan & Pemulihan (Backup & Restore)
                </h2>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-200 font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  SMAN 9 Surabaya
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Amankan seluruh data PTK Kepegawaian, Kesiswaan Dapodik, KOP surat, dan berkas sekolah
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs font-bold overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('backup');
              setErrorMsg(null);
            }}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'backup'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>1. Backup Keseluruhan (Ekspor)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('restore');
              setErrorMsg(null);
            }}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'restore'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>2. Restore / Pulihkan (Impor)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('snapshots');
              setErrorMsg(null);
            }}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'snapshots'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>3. Titik Pemulihan Cepat ({snapshots.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('storage');
              setErrorMsg(null);
            }}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'storage'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>4. Status Penyimpanan & Reset</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Notifications */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-red-400 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="text-emerald-400 hover:text-emerald-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: BACKUP KESELURUHAN */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Summary of Data to Backup */}
              <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-slate-50 border border-indigo-200/90 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-600" />
                      Ringkasan Data Siap Cadang
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Satu berkas mandiri mencakup seluruh database tanpa ada data yang terlewat
                    </p>
                  </div>
                  <span className="text-[11px] font-mono bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full border border-indigo-200 self-start sm:self-auto">
                    Format: .JSON Terenkapsulasi
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">PTK Pegawai & Guru</div>
                    <div className="text-lg font-black text-indigo-600 mt-0.5">{pegawaiList.length} Orang</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      PNS: {pegawaiList.filter((p) => p.statusPegawai === 'PNS').length} | PPPK: {pegawaiList.filter((p) => p.statusPegawai === 'PPPK').length}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Siswa & Dapodik</div>
                    <div className="text-lg font-black text-emerald-600 mt-0.5">{siswaList.length} Siswa</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Foto Lengkap: {siswaList.filter((s) => Boolean(s.foto)).length}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">KOP & Profil Dinas</div>
                    <div className="text-sm font-black text-slate-800 mt-1 truncate">
                      {kop.namaSekolah || 'SMAN 9 Surabaya'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">NPSN: {kop.npsn || '20532252'}</div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Perkiraan Ukuran</div>
                    <div className="text-lg font-black text-slate-700 mt-0.5">
                      {storageMetrics.formattedTotal}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Penyimpanan Browser</div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-5 pt-4 border-t border-indigo-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-indigo-950 font-medium">
                    ✨ Berkas JSON dapat disimpan di komputer, flashdisk, atau diunggah kembali saat pemulihan.
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadFullBackup}
                    disabled={loading}
                    className="btn-3d btn-3d-indigo text-white text-xs font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Cadangan Penuh (.JSON)</span>
                  </button>
                </div>
              </div>

              {/* Cloud Drive Backup Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        Simpan Cadangan ke Google Drive (Cloud Backup)
                        {isGoogleAuthed && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                            Aktif: {googleUser?.email}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Menyimpan salinan berkas cadangan secara otomatis ke folder Google Drive akun Anda sebagai proteksi dari kehilangan perangkat.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUploadToDrive}
                    disabled={loading}
                    className="btn-3d btn-3d-blue text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>{isGoogleAuthed ? 'Upload ke Google Drive' : 'Hubungkan & Simpan ke Drive'}</span>
                  </button>
                </div>

                {driveUploadResult && (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-emerald-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Tersimpan di Google Drive: {driveUploadResult.name}</span>
                    </div>
                    {driveUploadResult.webViewLink && (
                      <a
                        href={driveUploadResult.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                      >
                        <span>Buka Berkas</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Individual CSV & Formatted Excel Worksheet Section */}
              <ExcelWorksheetViewer
                pegawaiList={pegawaiList}
                siswaList={siswaList}
                kop={kop}
                onShowToast={onShowToast}
              />
            </div>
          )}

          {/* TAB 2: RESTORE / PULIHKAN */}
          {activeTab === 'restore' && (
            <div className="space-y-6">
              {/* File Input Box */}
              <div className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-2xl p-6 text-center bg-indigo-50/30 transition">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="backupFileInput"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Pilih atau Tarik Berkas Cadangan (.JSON) ke Sini
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Sistem mendukung berkas cadangan resmi SIMPEG SMAN 9 Surabaya yang sebelumnya telah Anda unduh.
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <label
                    htmlFor="backupFileInput"
                    className="btn-3d btn-3d-indigo text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pilih Berkas Cadangan</span>
                  </label>
                  {uploadedFileName && (
                    <span className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                      {uploadedFileName}
                    </span>
                  )}
                </div>
              </div>

              {/* Inspection of Uploaded Payload */}
              {uploadedPayload && (
                <div className="bg-slate-50 border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="text-sm font-black text-slate-900">
                          Berkas Terverifikasi: {uploadedPayload.metadata.namaSekolah}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Dibuat pada: {uploadedPayload.metadata.exportDate} oleh{' '}
                          {uploadedPayload.metadata.exportedBy} (Versi {uploadedPayload.metadata.version})
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                      Format Valid
                    </span>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-500 uppercase text-[10px]">Data Pegawai</div>
                      <div className="text-base font-black text-indigo-600 mt-0.5">
                        {uploadedPayload.pegawai.length} PTK
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Siap dipulihkan ke SIMPEG
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-500 uppercase text-[10px]">Data Kesiswaan</div>
                      <div className="text-base font-black text-emerald-600 mt-0.5">
                        {uploadedPayload.siswa.length} Siswa
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Buku Induk & Pas Foto
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-500 uppercase text-[10px]">KOP & NPSN</div>
                      <div className="text-xs font-black text-slate-800 mt-1 truncate">
                        {uploadedPayload.kop?.namaSekolah || 'KOP Standar'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        NPSN: {uploadedPayload.kop?.npsn || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Choose Restore Mode */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Pilih Metode Pemulihan:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                          restoreMode === 'replace'
                            ? 'border-indigo-600 bg-indigo-50/50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="restoreMode"
                          value="replace"
                          checked={restoreMode === 'replace'}
                          onChange={() => setRestoreMode('replace')}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-black text-xs text-slate-900">
                            1. Timpa Penuh (Full Replace)
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Menghapus database lokal saat ini dan menggantinya 100% dengan isi berkas cadangan ini.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                          restoreMode === 'merge'
                            ? 'border-emerald-600 bg-emerald-50/50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="restoreMode"
                          value="merge"
                          checked={restoreMode === 'merge'}
                          onChange={() => setRestoreMode('merge')}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-black text-xs text-slate-900">
                            2. Gabungkan Data (Merge)
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Menambahkan pegawai & siswa baru dari berkas cadangan tanpa menghapus data yang sudah ada di sistem.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Selective options */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="font-bold text-slate-700">Komponen yang Ingin Dipulihkan:</div>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={restoreOptions.restorePegawai}
                            onChange={(e) =>
                              setRestoreOptions({ ...restoreOptions, restorePegawai: e.target.checked })
                            }
                            className="rounded text-indigo-600"
                          />
                          <span>Data Pegawai ({uploadedPayload.pegawai.length})</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={restoreOptions.restoreSiswa}
                            onChange={(e) =>
                              setRestoreOptions({ ...restoreOptions, restoreSiswa: e.target.checked })
                            }
                            className="rounded text-emerald-600"
                          />
                          <span>Data Siswa ({uploadedPayload.siswa.length})</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={restoreOptions.restoreKop}
                            onChange={(e) =>
                              setRestoreOptions({ ...restoreOptions, restoreKop: e.target.checked })
                            }
                            className="rounded text-blue-600"
                          />
                          <span>KOP & Pengaturan Sekolah</span>
                        </label>
                      </div>
                    </div>

                    {/* Safety confirmation if replace */}
                    {restoreMode === 'replace' && (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1.5 flex-1">
                          <div className="font-bold">Konfirmasi Keamanan Timpa Bersih:</div>
                          <label className="flex items-center gap-2 cursor-pointer font-medium">
                            <input
                              type="checkbox"
                              checked={confirmReplace}
                              onChange={(e) => setConfirmReplace(e.target.checked)}
                              className="rounded text-amber-600"
                            />
                            <span>
                              Saya mengerti bahwa data saat ini ({pegawaiList.length} Pegawai & {siswaList.length} Siswa) akan digantikan secara penuh oleh berkas cadangan ini.
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Execute Button */}
                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setUploadedPayload(null)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteRestore}
                        disabled={loading || (restoreMode === 'replace' && !confirmReplace)}
                        className="btn-3d btn-3d-indigo text-white font-black text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Eksekusi Pemulihan Sekarang</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TITIK PEMULIHAN CEPAT (SNAPSHOTS) */}
          {activeTab === 'snapshots' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Buat Titik Pemulihan Cepat (Snapshot Lokal)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Menyimpan status database saat ini ke dalam memori peramban tanpa perlu mengunduh berkas.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Label/Nama titik (cth: Sebelum Ujian)"
                    value={newSnapshotLabel}
                    onChange={(e) => setNewSnapshotLabel(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white w-52 outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateSnapshot}
                    className="btn-3d btn-3d-indigo text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Simpan Snapshot</span>
                  </button>
                </div>
              </div>

              {/* Snapshots List */}
              <div className="space-y-3">
                <div className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Daftar Titik Pemulihan Tersimpan ({snapshots.length}/5):
                </div>

                {snapshots.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                    Belum ada titik pemulihan cepat yang dibuat. Buat satu di atas untuk memudahkan pengembalian data kapan saja.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    {snapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                            <History className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{snap.label}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>Waktu: {snap.createdAt}</span>
                              <span>•</span>
                              <span className="font-bold text-indigo-700">
                                {snap.totalPegawai} Pegawai
                              </span>
                              <span>•</span>
                              <span className="font-bold text-emerald-700">
                                {snap.totalSiswa} Siswa
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => downloadBackupFile(snap.payload, `${snap.label.replace(/\s+/g, '-')}.json`)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            title="Unduh Berkas JSON dari Snapshot Ini"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh JSON</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRestoreSnapshot(snap)}
                            className="btn-3d btn-3d-emerald text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                            title="Pulihkan data dari titik ini"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Pulihkan</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Hapus Snapshot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: STATUS PENYIMPANAN & RESET PABRIK */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              {/* Storage Metrics */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Status Memori Lokal (LocalStorage)</h4>
                      <p className="text-xs text-slate-500">
                        Total pemakaian penyimpanan peramban untuk aplikasi SMAN 9 Surabaya
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">Total Ukuran</div>
                    <div className="text-base font-black text-indigo-600">{storageMetrics.formattedTotal}</div>
                  </div>
                </div>

                <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {storageMetrics.items.map((item) => (
                    <div key={item.key} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <div className="font-mono text-[10px] text-slate-400">{item.key}</div>
                      </div>
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                        {item.size}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone: Factory Reset */}
              <div className="border border-red-200 bg-red-50/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-950 text-sm">Opsi Darurat: Reset ke Data Bawaan Pabrik</h4>
                    <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                      Jika terjadi kerusakan data yang tidak dapat diperbaiki, Anda dapat mengembalikan sistem ke data awal simulasi resmi SMAN 9 Surabaya. Semua perubahan data lokal yang belum dicadangkan akan hilang.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsFactoryResetModalOpen(true)}
                    className="btn-3d btn-3d-red text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reset ke Data Bawaan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Data tersimpan aman di peramban Anda dan dapat dicadangkan kapan saja.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Factory Reset */}
      {isFactoryResetModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">Konfirmasi Reset Pabrik</h3>
              <p className="text-xs text-slate-600 mt-1">
                Apakah Anda yakin ingin mereset seluruh database ke pengaturan awal SMAN 9 Surabaya? Tindakan ini tidak dapat dibatalkan kecuali Anda memiliki berkas cadangan JSON.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsFactoryResetModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteFactoryReset}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
