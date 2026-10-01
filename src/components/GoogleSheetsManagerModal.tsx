import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Table,
  Plus,
  Search,
  Users,
  GraduationCap,
  Sparkles,
  X,
  FileCheck,
  Check,
  Shield,
  Layers,
  Clock
} from 'lucide-react';
import { Pegawai, Siswa, KopSekolah, GoogleSheetItem, GoogleSpreadsheetDetail, SyncHistoryEntry } from '../types';
import {
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  getGoogleAccessToken,
  getCurrentGoogleUser,
  hasGoogleWorkspaceAccess
} from '../services/googleAuth';
import {
  listGoogleSpreadsheets,
  getSpreadsheetDetails,
  readSheetValues,
  createIntegratedSchoolSpreadsheet,
  exportPegawaiToNewSheet,
  exportSiswaToNewSheet,
  syncPegawaiToExistingSheet,
  syncSiswaToExistingSheet,
  parseSheetRowsToSiswa
} from '../services/googleSheets';

interface GoogleSheetsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pegawaiList: Pegawai[];
  siswaList: Siswa[];
  kop: KopSekolah;
  onImportSiswaFromSheets: (imported: Siswa[]) => void;
}

const SYNC_HISTORY_KEY = 'SMAN_SHEETS_SYNC_HISTORY_V1';

export const GoogleSheetsManagerModal: React.FC<GoogleSheetsManagerModalProps> = ({
  isOpen,
  onClose,
  pegawaiList,
  siswaList,
  kop,
  onImportSiswaFromSheets
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'browse' | 'import' | 'history'>('export');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{ displayName: string; email: string; photoURL: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Browse & Details
  const [spreadsheets, setSpreadsheets] = useState<GoogleSheetItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<GoogleSheetItem | null>(null);
  const [selectedSheetDetail, setSelectedSheetDetail] = useState<GoogleSpreadsheetDetail | null>(null);
  const [selectedTabTitle, setSelectedTabTitle] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<any[][]>([]);
  const [isReadingSheet, setIsReadingSheet] = useState(false);

  // Confirmation dialog state (Per workspace-integration skill rule)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'export_dual' | 'export_pegawai' | 'export_siswa' | 'sync_existing' | 'import_rows';
    onConfirm: () => void;
  } | null>(null);

  // Sync History
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(SYNC_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'hist-demo-1',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        type: 'export_siswa',
        spreadsheetId: 'demo-sheet-1',
        spreadsheetTitle: `DAPODIK ${kop.namaSekolah} - BUKU INDUK SISWA`,
        rowCount: siswaList.length,
        status: 'success',
        details: 'Sinkronisasi awal data kesiswaan dengan aturan latar belakang pas foto dinas'
      }
    ];
  });

  // Save history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(syncHistory));
    } catch (e) {
      console.error(e);
    }
  }, [syncHistory]);

  // Check auth state on open
  useEffect(() => {
    if (isOpen) {
      const token = getGoogleAccessToken();
      const user = getCurrentGoogleUser();
      if (token && user) {
        setIsSignedIn(true);
        setAccessToken(token);
        setUserProfile({
          displayName: user.displayName || 'dwibudiono99@admin.sma.belajar.id',
          email: user.email || 'dwibudiono99@admin.sma.belajar.id',
          photoURL: user.photoURL || ''
        });
        loadSpreadsheets(token);
      } else {
        // Preset default info if signed in on browser
        setIsSignedIn(hasGoogleWorkspaceAccess());
      }
    }
  }, [isOpen]);

  const addHistory = (entry: Omit<SyncHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: SyncHistoryEntry = {
      ...entry,
      id: `sync-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setSyncHistory((prev) => [newEntry, ...prev.slice(0, 19)]);
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await signInWithGoogleWorkspace();
      if (res) {
        setIsSignedIn(true);
        setAccessToken(res.accessToken);
        setUserProfile({
          displayName: res.user.displayName || 'dwibudiono99@admin.sma.belajar.id',
          email: res.user.email || 'dwibudiono99@admin.sma.belajar.id',
          photoURL: res.user.photoURL || ''
        });
        setSuccessMsg('Berhasil terhubung dengan Google Workspace (Google Sheets & Drive API)!');
        await loadSpreadsheets(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMsg(err.message || 'Gagal login dengan akun Google Workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogleWorkspace();
    setIsSignedIn(false);
    setAccessToken(null);
    setUserProfile(null);
    setSpreadsheets([]);
    setSuccessMsg('Akun Google berhasil diputuskan.');
  };

  const loadSpreadsheets = async (token?: string) => {
    const currentToken = token || accessToken || (await getGoogleAccessToken());
    if (!currentToken) return;

    try {
      setIsLoading(true);
      setErrorMsg('');
      const list = await listGoogleSpreadsheets(currentToken);
      setSpreadsheets(list);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal memuat daftar Google Spreadsheet dari Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION: EXPORT DUAL SPREADSHEET (Siswa + Pegawai)
  // -------------------------------------------------------------
  const promptExportDual = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Buat Google Spreadsheet Sekolah Terpadu (2 Tab)?',
      description: `Aplikasi akan membuat spreadsheet baru di Google Drive Anda dengan 2 lembar kerja terpisah:\n• Tab 1: Data Siswa & Kesiswaan (${siswaList.length} siswa)\n• Tab 2: Data Guru & Pegawai (${pegawaiList.length} pegawai)\nDilengkapi format kop resmi dan penataan sel standar dinas.`,
      actionType: 'export_dual',
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeExportDual();
      }
    });
  };

  const executeExportDual = async () => {
    const token = accessToken || (await getGoogleAccessToken());
    if (!token) {
      setErrorMsg('Silakan hubungkan akun Google Workspace terlebih dahulu.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const title = `DATABASE TERPADU ${kop.namaSekolah.toUpperCase()} (SISWA & SIMPEG)`;
      const res = await createIntegratedSchoolSpreadsheet(token, title, pegawaiList, siswaList, kop);

      setSuccessMsg(`Spreadsheet berhasil dibuat di Google Drive! ID: ${res.spreadsheetId}`);
      addHistory({
        type: 'create_sheet',
        spreadsheetId: res.spreadsheetId,
        spreadsheetTitle: title,
        rowCount: siswaList.length + pegawaiList.length,
        status: 'success',
        details: `Dibuat 2 Tab: Data Siswa (${siswaList.length}) & Guru/Pegawai (${pegawaiList.length})`
      });

      // Reload drive list
      await loadSpreadsheets(token);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal membuat Google Spreadsheet terpadu.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION: EXPORT SISWA ONLY
  // -------------------------------------------------------------
  const promptExportSiswa = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Ekspor Buku Induk Siswa ke Google Spreadsheet Baru?',
      description: `Aplikasi akan membuat spreadsheet baru di Google Drive Anda dengan judul "DAPODIK ${kop.namaSekolah} - BUKU INDUK SISWA" berisi ${siswaList.length} data siswa lengkap dengan aturan pas foto dinas.`,
      actionType: 'export_siswa',
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeExportSiswa();
      }
    });
  };

  const executeExportSiswa = async () => {
    const token = accessToken || (await getGoogleAccessToken());
    if (!token) {
      setErrorMsg('Silakan hubungkan akun Google Workspace terlebih dahulu.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const title = `DAPODIK ${kop.namaSekolah.toUpperCase()} - BUKU INDUK SISWA`;
      const res = await exportSiswaToNewSheet(token, title, siswaList, kop);

      setSuccessMsg(`Buku Induk Siswa berhasil dibuat di Google Drive!`);
      addHistory({
        type: 'export_siswa',
        spreadsheetId: res.spreadsheetId,
        spreadsheetTitle: title,
        rowCount: siswaList.length,
        status: 'success',
        details: `Berisi ${siswaList.length} data siswa dengan verifikasi warna pas foto dinas`
      });

      await loadSpreadsheets(token);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal mengekspor data siswa ke Google Spreadsheet.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION: EXPORT PEGAWAI ONLY
  // -------------------------------------------------------------
  const promptExportPegawai = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Ekspor SIMPEG Guru & Pegawai ke Google Spreadsheet Baru?',
      description: `Aplikasi akan membuat spreadsheet baru di Google Drive Anda dengan judul "SIMPEG ${kop.namaSekolah} - DAFTAR GURU & PEGAWAI" berisi ${pegawaiList.length} data pegawai lengkap.`,
      actionType: 'export_pegawai',
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeExportPegawai();
      }
    });
  };

  const executeExportPegawai = async () => {
    const token = accessToken || (await getGoogleAccessToken());
    if (!token) {
      setErrorMsg('Silakan hubungkan akun Google Workspace terlebih dahulu.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const title = `SIMPEG ${kop.namaSekolah.toUpperCase()} - DAFTAR GURU & PEGAWAI`;
      const res = await exportPegawaiToNewSheet(token, title, pegawaiList, kop);

      setSuccessMsg(`Data Kepegawaian berhasil dibuat di Google Drive!`);
      addHistory({
        type: 'export_pegawai',
        spreadsheetId: res.spreadsheetId,
        spreadsheetTitle: title,
        rowCount: pegawaiList.length,
        status: 'success',
        details: `Berisi ${pegawaiList.length} data guru dan tenaga kependidikan`
      });

      await loadSpreadsheets(token);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal mengekspor data kepegawaian ke Google Spreadsheet.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION: SELECT SPREADSHEET FOR INSPECTION / IMPORT
  // -------------------------------------------------------------
  const handleSelectSpreadsheet = async (sheet: GoogleSheetItem) => {
    setSelectedSheet(sheet);
    setSelectedSheetDetail(null);
    setPreviewRows([]);
    setErrorMsg('');
    setSuccessMsg('');

    const token = accessToken || (await getGoogleAccessToken());
    if (!token) return;

    try {
      setIsReadingSheet(true);
      const detail = await getSpreadsheetDetails(token, sheet.id);
      setSelectedSheetDetail(detail);

      if (detail.sheets.length > 0) {
        const firstTab = detail.sheets[0].title;
        setSelectedTabTitle(firstTab);
        const rows = await readSheetValues(token, sheet.id, `'${firstTab}'!A1:Z30`);
        setPreviewRows(rows);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal membaca isi spreadsheet yang dipilih.');
    } finally {
      setIsReadingSheet(false);
    }
  };

  const handleChangeTab = async (tabTitle: string) => {
    if (!selectedSheet) return;
    setSelectedTabTitle(tabTitle);
    const token = accessToken || (await getGoogleAccessToken());
    if (!token) return;

    try {
      setIsReadingSheet(true);
      const rows = await readSheetValues(token, selectedSheet.id, `'${tabTitle}'!A1:Z30`);
      setPreviewRows(rows);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal membaca tab yang dipilih.');
    } finally {
      setIsReadingSheet(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION: OVERWRITE / SYNC DATA TO SELECTED EXISTING SHEET
  // -------------------------------------------------------------
  const promptSyncToExisting = (targetType: 'siswa' | 'pegawai') => {
    if (!selectedSheet || !selectedTabTitle) return;

    const count = targetType === 'siswa' ? siswaList.length : pegawaiList.length;
    const label = targetType === 'siswa' ? 'Data Siswa' : 'Data Guru & Pegawai';

    setConfirmDialog({
      isOpen: true,
      title: `Perbarui Lembar Kerja "${selectedTabTitle}"?`,
      description: `PERINGATAN: Tindakan ini akan menimpa (overwrite) isi lembar kerja "${selectedTabTitle}" pada file "${selectedSheet.name}" dengan ${count} ${label} terbaru dari aplikasi ini.\n\nPastikan Anda memilih tab yang tepat sebelum melanjutkan.`,
      actionType: 'sync_existing',
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeSyncToExisting(targetType);
      }
    });
  };

  const executeSyncToExisting = async (targetType: 'siswa' | 'pegawai') => {
    if (!selectedSheet || !selectedTabTitle) return;
    const token = accessToken || (await getGoogleAccessToken());
    if (!token) return;

    try {
      setIsLoading(true);
      setErrorMsg('');

      if (targetType === 'siswa') {
        await syncSiswaToExistingSheet(token, selectedSheet.id, selectedTabTitle, siswaList, kop);
        setSuccessMsg(`Lembar kerja "${selectedTabTitle}" berhasil diperbarui dengan ${siswaList.length} data siswa!`);
        addHistory({
          type: 'export_siswa',
          spreadsheetId: selectedSheet.id,
          spreadsheetTitle: `${selectedSheet.name} [${selectedTabTitle}]`,
          rowCount: siswaList.length,
          status: 'success',
          details: 'Data siswa disinkronkan ke tab yang sudah ada'
        });
      } else {
        await syncPegawaiToExistingSheet(token, selectedSheet.id, selectedTabTitle, pegawaiList, kop);
        setSuccessMsg(`Lembar kerja "${selectedTabTitle}" berhasil diperbarui dengan ${pegawaiList.length} data pegawai!`);
        addHistory({
          type: 'export_pegawai',
          spreadsheetId: selectedSheet.id,
          spreadsheetTitle: `${selectedSheet.name} [${selectedTabTitle}]`,
          rowCount: pegawaiList.length,
          status: 'success',
          details: 'Data pegawai disinkronkan ke tab yang sudah ada'
        });
      }

      // Refresh preview
      const refreshed = await readSheetValues(token, selectedSheet.id, `'${selectedTabTitle}'!A1:Z30`);
      setPreviewRows(refreshed);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal menyinkronkan data ke spreadsheet.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION: IMPORT ROWS FROM GOOGLE SHEET TO APP
  // -------------------------------------------------------------
  const promptImportFromSheet = () => {
    if (!selectedSheet || !selectedTabTitle || previewRows.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: `Impor Baris dari Tab "${selectedTabTitle}"?`,
      description: `Aplikasi akan membaca seluruh baris dari lembar kerja "${selectedTabTitle}", mencocokkan kolom identitas (NISN, Nama Siswa, Rombel, dsb.), dan memasukkan data tersebut ke dalam Database Kesiswaan lokal.\n\nSiswa dengan NISN yang sudah ada akan dilewati agar tidak terjadi duplikasi.`,
      actionType: 'import_rows',
      onConfirm: async () => {
        setConfirmDialog(null);
        await executeImportFromSheet();
      }
    });
  };

  const executeImportFromSheet = async () => {
    if (!selectedSheet || !selectedTabTitle) return;
    const token = accessToken || (await getGoogleAccessToken());
    if (!token) return;

    try {
      setIsLoading(true);
      setErrorMsg('');

      // Fetch all rows from this tab
      const allRows = await readSheetValues(token, selectedSheet.id, `'${selectedTabTitle}'!A1:AC500`);
      const parsedSiswa = parseSheetRowsToSiswa(allRows);

      if (parsedSiswa.length === 0) {
        throw new Error('Tidak ada baris data siswa yang berhasil diidentifikasi dari sheet ini.');
      }

      onImportSiswaFromSheets(parsedSiswa);
      setSuccessMsg(`Berhasil mengimpor ${parsedSiswa.length} data siswa dari spreadsheet ke database aplikasi!`);

      addHistory({
        type: 'import_siswa',
        spreadsheetId: selectedSheet.id,
        spreadsheetTitle: `${selectedSheet.name} [${selectedTabTitle}]`,
        rowCount: parsedSiswa.length,
        status: 'success',
        details: `Impor ${parsedSiswa.length} siswa ke database sekolah`
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal memproses impor data dari spreadsheet.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredSheets = spreadsheets.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-inner border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Integrasi Google Sheets & Drive
                </h2>
                <span className="bg-emerald-500/30 text-emerald-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  Google Workspace API
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Ekspor, Sinkronisasi 2-Arah, dan Kelola Spreadsheet Buku Induk Siswa & SIMPEG Guru
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-emerald-700/60 p-2 rounded-xl transition-all"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GOOGLE ACCOUNT CONNECTION BAR */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isSignedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            {isSignedIn && userProfile ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Terhubung sebagai:</span>
                <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {userProfile.email}
                </span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Aktif (Drive & Sheets)
                </span>
              </div>
            ) : (
              <span className="text-slate-600">
                Belum terhubung ke akun Google Workspace. Masuk untuk mengakses Google Sheets & Drive.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => loadSpreadsheets()}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1.5 transition-all text-xs"
                  title="Segarkan data spreadsheet dari Drive"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Segarkan Drive</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition-all text-xs"
                >
                  Putuskan Akun
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoading}
                className="bg-white border border-slate-300 hover:border-slate-400 text-slate-800 px-3 py-1.5 rounded-xl font-bold shadow-xs hover:shadow-sm flex items-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Masuk dengan Google Workspace</span>
              </button>
            )}
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
            <button type="button" onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1 font-medium">{successMsg}</div>
            <button type="button" onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/50 flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor ke Google Sheets</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('browse');
              if (isSignedIn && spreadsheets.length === 0) loadSpreadsheets();
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'browse'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Jelajahi Drive & Sinkronisasi ({spreadsheets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Riwayat Sinkronisasi</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">

          {/* ======================================================== */}
          {/* TAB 1: EKSPOR KE GOOGLE SPREADSHEETS */}
          {/* ======================================================== */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 p-5 rounded-2xl border border-emerald-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Format Standar Kedinasan & Penataan Otomatis
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setiap spreadsheet yang dibuat langsung diformat dengan KOP Surat Resmi Provinsi Jawa Timur, header biru kedinasan, baris terbekukan (frozen row), dan pewarnaan otomatis (termasuk verifikasi aturan warna latar pas foto merah/biru).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Integrated Dual Sheet */}
                <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Paling Direkomendasikan
                  </div>

                  <div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Spreadsheet Terpadu Sekolah
                    </h4>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      Membuat 1 Google Spreadsheet resmi dengan 2 lembar kerja (Tab Siswa Dapodik & Tab Guru SIMPEG).
                    </p>
                    <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mb-4">
                      <div className="flex justify-between">
                        <span>Tab 1 (Siswa):</span>
                        <span className="font-bold text-slate-800">{siswaList.length} Siswa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tab 2 (Pegawai):</span>
                        <span className="font-bold text-slate-800">{pegawaiList.length} Pegawai</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={promptExportDual}
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Buat Spreadsheet Terpadu</span>
                  </button>
                </div>

                {/* 2. Siswa Only */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Buku Induk Siswa (Dapodik)
                    </h4>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      Mengekspor seluruh arsip kesiswaan lengkap (NISN, NIK, Rombel, Peminatan, Wali, Kontak, Foto Dinas).
                    </p>
                    <div className="text-[11px] text-slate-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 mb-4">
                      Total: <strong className="text-blue-900">{siswaList.length} Siswa</strong> siap diekspor ke Google Sheets
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={promptExportSiswa}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ekspor Data Siswa Saja</span>
                  </button>
                </div>

                {/* 3. Pegawai Only */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Data SIMPEG Guru & Pegawai
                    </h4>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      Mengekspor data NIP, NUPTK, Pangkat/Golongan, JJMS, Sertifikasi, Jabatan, dan Rumpun Mapel SMA.
                    </p>
                    <div className="text-[11px] text-slate-600 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 mb-4">
                      Total: <strong className="text-indigo-900">{pegawaiList.length} Guru & Tendik</strong> siap diekspor
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={promptExportPegawai}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ekspor Data Pegawai Saja</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: JELAJAHI GOOGLE DRIVE & SINKRONISASI */}
          {/* ======================================================== */}
          {activeTab === 'browse' && (
            <div className="space-y-5">
              {/* Search & Info Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari spreadsheet di Google Drive..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1.5 self-end sm:self-center">
                  <span>Ditemukan: <strong>{filteredSheets.length}</strong> Spreadsheet di Drive</span>
                </div>
              </div>

              {/* Grid: List on Left, Details & Sync on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[380px]">
                {/* List of Spreadsheets (Col 5) */}
                <div className="lg:col-span-5 border border-slate-200 rounded-xl bg-slate-50/50 p-2 max-h-[460px] overflow-y-auto space-y-1.5">
                  {spreadsheets.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      {isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                          <span>Mengambil daftar file spreadsheet dari Drive...</span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-600 mb-1">Belum ada spreadsheet terdeteksi</p>
                          <p className="text-[11px]">Pastikan Anda telah masuk dengan Google Workspace, atau klik "Buat Spreadsheet Terpadu" pada tab Ekspor.</p>
                        </div>
                      )}
                    </div>
                  ) : filteredSheets.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Tidak ada file yang cocok dengan pencarian "{searchQuery}"
                    </div>
                  ) : (
                    filteredSheets.map((sheet) => {
                      const isSelected = selectedSheet?.id === sheet.id;
                      return (
                        <div
                          key={sheet.id}
                          onClick={() => handleSelectSpreadsheet(sheet)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 font-bold text-slate-800 truncate">
                              <FileSpreadsheet className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span className="truncate">{sheet.name}</span>
                            </div>
                            <a
                              href={sheet.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-emerald-600 p-1"
                              title="Buka langsung di Google Sheets"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Diperbarui: {sheet.modifiedTime ? new Date(sheet.modifiedTime).toLocaleDateString('id-ID') : '-'}</span>
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">{sheet.id}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Details & Actions Panel (Col 7) */}
                <div className="lg:col-span-7 border border-slate-200 rounded-xl bg-white p-4 flex flex-col justify-between space-y-4">
                  {selectedSheet ? (
                    <div className="space-y-4">
                      {/* Selected Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm truncate max-w-sm">
                              {selectedSheet.name}
                            </h4>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Terpilih
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            ID: <span className="font-mono">{selectedSheet.id}</span>
                          </p>
                        </div>

                        <a
                          href={selectedSheet.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-3d btn-3d-emerald text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                        >
                          <span>Buka di Google Sheets</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Sheet Tabs Selector */}
                      {selectedSheetDetail && (
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Pilih Lembar Kerja / Tab:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedSheetDetail.sheets.map((tab) => (
                              <button
                                key={tab.sheetId}
                                type="button"
                                onClick={() => handleChangeTab(tab.title)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                  selectedTabTitle === tab.title
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {tab.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sync Actions Bar */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Aksi Sinkronisasi pada Tab "{selectedTabTitle || '...'}"</span>
                          <span className="text-[10px] font-normal text-slate-500">Memerlukan konfirmasi pengguna</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => promptSyncToExisting('siswa')}
                            disabled={isLoading || isReadingSheet || !selectedTabTitle}
                            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                            title="Timpa tab ini dengan data siswa terbaru"
                          >
                            <Upload className="w-3.5 h-3.5 text-blue-600" />
                            <span>Push Siswa ({siswaList.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => promptSyncToExisting('pegawai')}
                            disabled={isLoading || isReadingSheet || !selectedTabTitle}
                            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                            title="Timpa tab ini dengan data pegawai terbaru"
                          >
                            <Upload className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Push Pegawai ({pegawaiList.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={promptImportFromSheet}
                            disabled={isLoading || isReadingSheet || !selectedTabTitle}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all text-center shadow-xs"
                            title="Baca dan impor baris data siswa ke database aplikasi"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Impor ke Siswa</span>
                          </button>
                        </div>
                      </div>

                      {/* Preview Table of Rows */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Table className="w-3.5 h-3.5 text-slate-500" />
                            Pratinjau Isi Sel (Maksimal 15 baris pertama)
                          </span>
                          {isReadingSheet && (
                            <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Membaca data...
                            </span>
                          )}
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[160px] text-[11px]">
                          {previewRows.length === 0 ? (
                            <div className="p-4 text-center text-slate-400">
                              Tidak ada data atau lembar kerja kosong.
                            </div>
                          ) : (
                            <table className="w-full text-left divide-y divide-slate-200">
                              <tbody className="divide-y divide-slate-100">
                                {previewRows.slice(0, 15).map((row, rIdx) => (
                                  <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'}>
                                    <td className="px-2 py-1 text-slate-400 font-mono text-[10px] w-8 border-r border-slate-200">
                                      {rIdx + 1}
                                    </td>
                                    {row.slice(0, 6).map((cell: any, cIdx: number) => (
                                      <td key={cIdx} className="px-2 py-1 truncate max-w-[140px] text-slate-700">
                                        {String(cell || '')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                      <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600 text-sm">Pilih Spreadsheet dari Daftar Kiri</p>
                      <p className="text-xs text-slate-400 max-w-xs mt-1">
                        Pilih salah satu file untuk melihat lembar kerja, pratinjau isi tabel, melakukan ekspor/impor baris, atau sinkronisasi 2-arah.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: RIWAYAT SINKRONISASI */}
          {/* ======================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Riwayat Aktivitas Google Sheets</h3>
                  <p className="text-xs text-slate-500">Catatan pembuatan spreadsheet, ekspor, dan impor data sekolah</p>
                </div>
                {syncHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Kosongkan riwayat sinkronisasi?')) {
                        setSyncHistory([]);
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-rose-600 font-semibold"
                  >
                    Hapus Riwayat
                  </button>
                )}
              </div>

              {syncHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  Belum ada catatan aktivitas sinkronisasi Google Sheets.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                  {syncHistory.map((item) => (
                    <div key={item.id} className="p-4 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 text-xs transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{item.spreadsheetTitle}</span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.2 rounded font-mono">
                              {item.rowCount} Baris
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{item.details || 'Aktivitas sinkronisasi'}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(item.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>

                      {item.spreadsheetId && !item.spreadsheetId.startsWith('demo-') && (
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${item.spreadsheetId}/edit`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-3d btn-3d-dark text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0"
                        >
                          <span>Buka File</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Koneksi aman melalui Google Workspace OAuth 2.0 & Firebase Client Auth</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-all text-xs"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* EXPLICIT USER CONFIRMATION DIALOG (Mandatory per Skill) */}
      {/* ======================================================== */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Konfirmasi Tindakan Operasi Spreadsheet</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
              {confirmDialog.description}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
