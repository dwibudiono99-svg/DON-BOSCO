import React, { useState, useEffect } from 'react';
import { Pegawai, BerkasPegawai, ToastMessage, KopSekolah, Siswa } from './types';
import { initialPegawaiData } from './data/initialData';
import { defaultKopSekolah } from './data/defaultKopData';
import { initialSiswaData } from './data/initialSiswaData';
import { Header } from './components/Header';
import { KopSekolahBanner } from './components/KopSekolahBanner';
import { KopSekolahModal } from './components/KopSekolahModal';
import { StatCards } from './components/StatCards';
import { PegawaiFormSection } from './components/PegawaiFormSection';
import { PegawaiTable } from './components/PegawaiTable';
import { PegawaiDetailModal } from './components/PegawaiDetailModal';
import { PegawaiFotoModal } from './components/PegawaiFotoModal';
import { PegawaiBerkasModal } from './components/PegawaiBerkasModal';
import { RincianMapelModal } from './components/RincianMapelModal';
import { SiswaStatCards } from './components/SiswaStatCards';
import { SiswaTable } from './components/SiswaTable';
import { SiswaDetailModal } from './components/SiswaDetailModal';
import { SiswaFormModal } from './components/SiswaFormModal';
import { SiswaFotoModal } from './components/SiswaFotoModal';
import { GoogleFormsManagerModal } from './components/GoogleFormsManagerModal';
import { GoogleSheetsManagerModal } from './components/GoogleSheetsManagerModal';
import { GoogleDocsManagerModal } from './components/GoogleDocsManagerModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { HtmlAddressBar } from './components/HtmlAddressBar';
import { WebAddressModal } from './components/WebAddressModal';
import { CetakCenter } from './components/CetakCenter';
import { Toast } from './components/Toast';
import { Printer } from 'lucide-react';
import {
  exportPegawaiToCSV,
  parsePegawaiCSV,
  downloadTemplateCSV,
  exportSiswaToCSV,
  parseSiswaCSV,
  downloadTemplateSiswaCSV
} from './utils/csvUtils';

const STORAGE_KEY = 'SIMPEG_SMAN_DATA_V1';
const SISWA_STORAGE_KEY = 'SIMPEG_SMAN_SISWA_DATA_V1';
const KOP_STORAGE_KEY = 'SIMPEG_SMAN_KOP_V1';

// Helper to detect initial module from URL pathname or hash (.html friendly)
const getInitialModuleFromUrl = (): 'pegawai' | 'siswa' | 'cetak' => {
  if (typeof window === 'undefined') return 'pegawai';
  const path = (window.location.pathname + window.location.hash).toLowerCase();
  if (path.includes('siswa')) return 'siswa';
  if (path.includes('cetak')) return 'cetak';
  return 'pegawai';
};

export default function App() {
  // Active Module: 'pegawai' (/index.html) | 'siswa' (/siswa.html) | 'cetak' (/cetak.html)
  const [activeModule, setActiveModule] = useState<'pegawai' | 'siswa' | 'cetak'>(getInitialModuleFromUrl);

  const handleNavigate = (newModule: 'pegawai' | 'siswa' | 'cetak') => {
    setActiveModule(newModule);
    const targetHtml = newModule === 'siswa' ? '/siswa.html' : newModule === 'cetak' ? '/cetak.html' : '/index.html';
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      window.history.pushState({ module: newModule }, '', targetHtml);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveModule(getInitialModuleFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Pegawai State
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load local storage pegawai data', e);
    }
    return initialPegawaiData;
  });

  // Siswa State
  const [siswaList, setSiswaList] = useState<Siswa[]>(() => {
    try {
      const saved = localStorage.getItem(SISWA_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load local storage siswa data', e);
    }
    return initialSiswaData;
  });

  // KOP Sekolah State
  const [kopSekolah, setKopSekolah] = useState<KopSekolah>(() => {
    try {
      const saved = localStorage.getItem(KOP_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load KOP from local storage', e);
    }
    return defaultKopSekolah;
  });

  // Pegawai Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  const [detailPegawai, setDetailPegawai] = useState<Pegawai | null>(null);
  const [fotoPegawaiModal, setFotoPegawaiModal] = useState<Pegawai | null>(null);
  const [berkasPegawaiModal, setBerkasPegawaiModal] = useState<Pegawai | null>(null);
  const [isRincianMapelOpen, setIsRincianMapelOpen] = useState(false);
  const [isKopModalOpen, setIsKopModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Siswa Modals State
  const [isSiswaFormOpen, setIsSiswaFormOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [detailSiswa, setDetailSiswa] = useState<Siswa | null>(null);
  const [fotoSiswaModal, setFotoSiswaModal] = useState<Siswa | null>(null);
  const [selectedSiswaCategoryFilter, setSelectedSiswaCategoryFilter] = useState<string>('ALL');

  // Google Forms Modal State
  const [isGoogleFormsModalOpen, setIsGoogleFormsModalOpen] = useState(false);

  // Google Sheets Modal State
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);

  // Google Docs Modal State
  const [isGoogleDocsModalOpen, setIsGoogleDocsModalOpen] = useState(false);

  // Backup & Restore Modal State
  const [isBackupRestoreModalOpen, setIsBackupRestoreModalOpen] = useState(false);

  // Web Address List Modal State
  const [isWebAddressModalOpen, setIsWebAddressModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Handle Restore Data from BackupRestoreModal
  const handleRestoreData = (
    restored: {
      pegawai?: Pegawai[];
      siswa?: Siswa[];
      kop?: KopSekolah;
    },
    _mode: 'replace' | 'merge'
  ) => {
    if (restored.pegawai) {
      setPegawaiList(restored.pegawai);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restored.pegawai));
      } catch (e) {
        console.error('Failed to save restored pegawai data', e);
      }
    }
    if (restored.siswa) {
      setSiswaList(restored.siswa);
      try {
        localStorage.setItem(SISWA_STORAGE_KEY, JSON.stringify(restored.siswa));
      } catch (e) {
        console.error('Failed to save restored siswa data', e);
      }
    }
    if (restored.kop) {
      setKopSekolah(restored.kop);
      try {
        localStorage.setItem(KOP_STORAGE_KEY, JSON.stringify(restored.kop));
      } catch (e) {
        console.error('Failed to save restored kop data', e);
      }
    }
  };

  // Synchronize Pegawai with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pegawaiList));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [pegawaiList]);

  // Synchronize Siswa with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(SISWA_STORAGE_KEY, JSON.stringify(siswaList));
    } catch (e) {
      console.error('Failed to save siswa to local storage', e);
    }
  }, [siswaList]);

  // Synchronize KOP with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(KOP_STORAGE_KEY, JSON.stringify(kopSekolah));
    } catch (e) {
      console.error('Failed to save KOP to local storage', e);
    }
  }, [kopSekolah]);

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'success'
  ) => {
    setToast({
      id: Date.now().toString(),
      title,
      message,
      type
    });
  };

  const handleSaveKop = (updatedKop: KopSekolah) => {
    setKopSekolah(updatedKop);
    showToast(
      'KOP Sekolah Diperbarui',
      `KOP resmi untuk ${updatedKop.namaSekolah} berhasil disimpan.`
    );
  };

  // -------------------------------------------------------------
  // PEGAWAI HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddPegawai = () => {
    setEditingPegawai(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleOpenEditPegawai = (pegawai: Pegawai) => {
    setEditingPegawai(pegawai);
    setIsFormOpen(true);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSavePegawai = (savedItem: Pegawai) => {
    if (editingPegawai) {
      setPegawaiList((prev) =>
        prev.map((item) => (item.id === savedItem.id ? savedItem : item))
      );
      if (detailPegawai?.id === savedItem.id) {
        setDetailPegawai(savedItem);
      }
      showToast('Data Diperbarui', `Profil ${savedItem.nama} berhasil diperbarui.`);
    } else {
      setPegawaiList((prev) => [savedItem, ...prev]);
      showToast('Pegawai Ditambahkan', `${savedItem.nama} berhasil dimasukkan ke daftar.`);
    }
    setIsFormOpen(false);
    setEditingPegawai(null);
  };

  const handleUpdateFotoPegawai = (pegawaiId: number, fotoDataUrl?: string) => {
    setPegawaiList((prev) =>
      prev.map((p) => {
        if (p.id === pegawaiId) {
          const updated = { ...p, foto: fotoDataUrl };
          if (detailPegawai?.id === pegawaiId) setDetailPegawai(updated);
          if (fotoPegawaiModal?.id === pegawaiId) setFotoPegawaiModal(updated);
          return updated;
        }
        return p;
      })
    );
    showToast(
      fotoDataUrl ? 'Foto Berhasil Disimpan' : 'Foto Dihapus',
      fotoDataUrl
        ? 'Pas foto formal pegawai berhasil diunggah.'
        : 'Foto pegawai telah dihapus.',
      fotoDataUrl ? 'success' : 'info'
    );
  };

  const handleUpdateBerkasPegawai = (pegawaiId: number, updatedBerkas: BerkasPegawai[]) => {
    setPegawaiList((prev) =>
      prev.map((p) => {
        if (p.id === pegawaiId) {
          const updated = { ...p, berkas: updatedBerkas };
          if (detailPegawai?.id === pegawaiId) setDetailPegawai(updated);
          if (berkasPegawaiModal?.id === pegawaiId) setBerkasPegawaiModal(updated);
          return updated;
        }
        return p;
      })
    );
  };

  const handleDeletePegawai = (id: number) => {
    const target = pegawaiList.find((p) => p.id === id);
    if (!target) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus data pegawai "${target.nama}" (NIP: ${target.nip})?`
    );
    if (confirmed) {
      setPegawaiList((prev) => prev.filter((p) => p.id !== id));
      showToast('Data Dihapus', `Data pegawai ${target.nama} telah dihapus.`, 'warning');
    }
  };

  const handleResetAllPegawai = () => {
    const confirmed = window.confirm(
      'Peringatan: Ini akan mengembalikan seluruh data kepegawaian ke data awal simulasi SMA. Lanjutkan?'
    );
    if (confirmed) {
      setPegawaiList(initialPegawaiData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPegawaiData));
      showToast('Data Di-reset', 'Seluruh data kepegawaian dikembalikan ke data awal simulasi.');
    }
  };

  const handleExportPegawai = () => {
    try {
      exportPegawaiToCSV(pegawaiList);
      showToast(
        'Export Berhasil',
        `File Excel/CSV dengan ${pegawaiList.length} data pegawai berhasil diunduh.`
      );
    } catch (err: any) {
      showToast('Gagal Export', err.message || 'Terjadi kesalahan saat ekspor.', 'error');
    }
  };

  const handleImportPegawai = async (file: File) => {
    try {
      const imported = await parsePegawaiCSV(file);
      setPegawaiList((prev) => {
        const existingNips = new Set(prev.map((p) => p.nip.toLowerCase().trim()));
        const uniqueImported = imported.filter(
          (imp) => !existingNips.has(imp.nip.toLowerCase().trim())
        );
        return [...uniqueImported, ...prev];
      });
      showToast(
        'Import Berhasil',
        `Berhasil memuat ${imported.length} data pegawai dari file ${file.name}.`
      );
    } catch (err: any) {
      showToast('Gagal Import', err.message || 'Format file CSV tidak valid.', 'error');
    }
  };

  // -------------------------------------------------------------
  // SISWA HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddSiswa = () => {
    setEditingSiswa(null);
    setIsSiswaFormOpen(true);
  };

  const handleOpenEditSiswa = (siswa: Siswa) => {
    setEditingSiswa(siswa);
    setIsSiswaFormOpen(true);
  };

  const handleSaveSiswa = (savedSiswa: Siswa) => {
    if (editingSiswa) {
      setSiswaList((prev) =>
        prev.map((s) => (s.id === savedSiswa.id ? savedSiswa : s))
      );
      if (detailSiswa?.id === savedSiswa.id) {
        setDetailSiswa(savedSiswa);
      }
      showToast('Data Siswa Diperbarui', `Biodata ${savedSiswa.nama} (NISN: ${savedSiswa.nisn}) berhasil disimpan.`);
    } else {
      setSiswaList((prev) => [savedSiswa, ...prev]);
      showToast('Siswa Baru Terdaftar', `${savedSiswa.nama} berhasil didaftarkan ke kelas ${savedSiswa.rombel}.`);
    }
    setIsSiswaFormOpen(false);
    setEditingSiswa(null);
  };

  const handleDeleteSiswa = (id: number) => {
    const target = siswaList.find((s) => s.id === id);
    if (!target) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus data siswa "${target.nama}" (NISN: ${target.nisn})?`
    );
    if (confirmed) {
      setSiswaList((prev) => prev.filter((s) => s.id !== id));
      showToast('Data Siswa Dihapus', `Data siswa ${target.nama} telah dihapus.`, 'warning');
    }
  };

  const handleSaveFotoSiswa = (
    siswaId: number,
    fotoDataUrl: string,
    fotoBgColor: 'Merah (Tahun Lahir Ganjil)' | 'Biru (Tahun Lahir Genap)'
  ) => {
    setSiswaList((prev) =>
      prev.map((s) => {
        if (s.id === siswaId) {
          const updated = { ...s, foto: fotoDataUrl, fotoBgColor };
          if (detailSiswa?.id === siswaId) setDetailSiswa(updated);
          return updated;
        }
        return s;
      })
    );
    showToast(
      'Pas Foto Siswa Berhasil Diperbarui',
      `Pas foto resmi sesuai aturan dinas (${fotoBgColor}) berhasil diterapkan.`
    );
  };

  const handleResetAllSiswa = () => {
    const confirmed = window.confirm(
      'Peringatan: Ini akan mengembalikan data kesiswaan ke data awal simulasi SMA Negeri dengan foto resmi berlatar merah/biru. Lanjutkan?'
    );
    if (confirmed) {
      setSiswaList(initialSiswaData);
      localStorage.setItem(SISWA_STORAGE_KEY, JSON.stringify(initialSiswaData));
      showToast('Data Siswa Di-reset', 'Seluruh data kesiswaan dikembalikan ke data awal simulasi.');
    }
  };

  const handleExportSiswa = () => {
    try {
      exportSiswaToCSV(siswaList);
      showToast(
        'Export Siswa Berhasil',
        `File Excel/CSV dengan ${siswaList.length} data siswa berhasil diunduh.`
      );
    } catch (err: any) {
      showToast('Gagal Export', err.message || 'Terjadi kesalahan saat ekspor.', 'error');
    }
  };

  const handleImportSiswa = async (file: File) => {
    try {
      const imported = await parseSiswaCSV(file);
      setSiswaList((prev) => {
        const existingNisns = new Set(prev.map((s) => s.nisn.trim()));
        const uniqueImported = imported.filter((imp) => !existingNisns.has(imp.nisn.trim()));
        return [...uniqueImported, ...prev];
      });
      showToast(
        'Import Siswa Berhasil',
        `Berhasil memuat ${imported.length} data siswa dari file ${file.name}.`
      );
    } catch (err: any) {
      showToast('Gagal Import', err.message || 'Format file CSV tidak valid.', 'error');
    }
  };

  const handleImportSiswaFromGoogleForms = (newSiswaList: Siswa[]) => {
    setSiswaList((prev) => {
      const existingNisns = new Set(prev.map((s) => s.nisn.trim()));
      const uniqueNew = newSiswaList.filter((s) => !existingNisns.has(s.nisn.trim()));
      return [...uniqueNew, ...prev];
    });
    showToast(
      'Sinkronisasi Google Forms Sukses',
      `Berhasil menambahkan ${newSiswaList.length} siswa dari Google Form ke Database Sekolah!`
    );
    setActiveModule('siswa');
  };

  const handleImportSiswaFromGoogleSheets = (newSiswaList: Siswa[]) => {
    setSiswaList((prev) => {
      const existingNisns = new Set(prev.map((s) => s.nisn.trim()));
      const uniqueNew = newSiswaList.filter((s) => !existingNisns.has(s.nisn.trim()));
      return [...uniqueNew, ...prev];
    });
    showToast(
      'Sinkronisasi Google Sheets Berhasil',
      `Berhasil mengimpor ${newSiswaList.length} data siswa dari spreadsheet ke database sekolah!`
    );
    setActiveModule('siswa');
  };

  // Derive Wali Kelas options from Guru in pegawaiList
  const guruNames = pegawaiList
    .filter((p) => p.jenisPtk.toLowerCase().includes('guru') || p.nama.includes('S.Pd'))
    .map((p) => p.nama);
  const waliKelasOptions = guruNames.length > 0 ? guruNames : [
    'Drs. Supriyanto, M.M.',
    'Siti Rahmawati, S.Pd., M.Si.',
    'Ahmad Fauzi, S.Pd.',
    'Dra. Sri Mulyani',
    'Budi Santoso, S.Kom., M.T.',
    'Dewi Lestari, S.Pd.'
  ];

  return (
    <div className="bg-slate-100/90 text-slate-800 min-h-screen flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header with Switcher between Pegawai, Siswa & Cetak + Google Forms Button */}
      <Header
        activeModule={activeModule}
        onSelectModule={handleNavigate}
        onOpenGoogleForms={() => setIsGoogleFormsModalOpen(true)}
        onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
        onOpenGoogleDocs={() => setIsGoogleDocsModalOpen(true)}
        onOpenBackupRestore={() => setIsBackupRestoreModalOpen(true)}
        siswaCount={siswaList.length}
        totalCount={pegawaiList.length}
        kop={kopSekolah}
        onOpenAddModal={activeModule === 'pegawai' ? handleOpenAddPegawai : handleOpenAddSiswa}
        onExport={activeModule === 'pegawai' ? handleExportPegawai : handleExportSiswa}
        onImport={activeModule === 'pegawai' ? handleImportPegawai : handleImportSiswa}
        onDownloadTemplate={activeModule === 'pegawai' ? downloadTemplateCSV : downloadTemplateSiswaCSV}
        onOpenRincianMapel={() => setIsRincianMapelOpen(true)}
        onOpenFuturisticPreview={() => {
          if (activeModule === 'pegawai' && pegawaiList.length > 0) {
            setDetailPegawai(pegawaiList[0]);
          } else if (activeModule === 'siswa' && siswaList.length > 0) {
            setDetailSiswa(siswaList[0]);
          }
        }}
        onOpenEditKop={() => setIsKopModalOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full space-y-6">
        {/* Simple .html Web Address Bar & Standalone Exporter */}
        <HtmlAddressBar
          activeModule={activeModule}
          onNavigate={handleNavigate}
          siswaList={siswaList}
          pegawaiList={pegawaiList}
          kop={kopSekolah}
          onOpenWebAddressModal={() => setIsWebAddressModalOpen(true)}
        />

        {/* KOP Surat Resmi SMAN Banner */}
        <KopSekolahBanner
          kop={kopSekolah}
          onOpenEditKop={() => setIsKopModalOpen(true)}
          totalPegawai={pegawaiList.length}
        />

        {/* Quick Reporting Callout Banner (Screen Only) */}
        {activeModule === 'pegawai' && (
          <div className="no-print bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-blue-300 tracking-wider">
                    Format Pelaporan Resmi (A4)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.2 rounded-full border border-emerald-500/30">
                    Singkat, Padat & Jelas
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Siap dicetak untuk pelaporan ke Dinas Pendidikan, Pengawas, maupun Kepala Sekolah lengkap dengan KOP dinas dan lembar tanda tangan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModule('cetak')}
              className="btn-3d btn-3d-blue text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Lihat Format Cetak Pelaporan</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODULE 1: DATA GURU & PEGAWAI (SIMPEG) */}
        {/* ======================================================== */}
        {activeModule === 'pegawai' && (
          <>
            {/* Statistics Dashboard Cards */}
            <StatCards
              pegawaiList={pegawaiList}
              selectedFilter={selectedCategoryFilter}
              onFilterSelect={(filter) => setSelectedCategoryFilter(filter)}
              onOpenRincianMapel={() => setIsRincianMapelOpen(true)}
            />

            {/* Pegawai Form Section (collapsible / toggleable) */}
            {isFormOpen && (
              <PegawaiFormSection
                editingPegawai={editingPegawai}
                isOpen={isFormOpen}
                onClose={() => {
                  setIsFormOpen(false);
                  setEditingPegawai(null);
                }}
                onSave={handleSavePegawai}
              />
            )}

            {/* Main Personnel Table & Gallery */}
            <PegawaiTable
              pegawaiList={pegawaiList}
              selectedCategoryFilter={selectedCategoryFilter}
              onClearCategoryFilter={() => setSelectedCategoryFilter('ALL')}
              onEdit={handleOpenEditPegawai}
              onDelete={handleDeletePegawai}
              onViewDetail={(pegawai) => setDetailPegawai(pegawai)}
              onManageFoto={(pegawai) => setFotoPegawaiModal(pegawai)}
              onManageBerkas={(pegawai) => setBerkasPegawaiModal(pegawai)}
              onResetAll={handleResetAllPegawai}
              onOpenRincianMapel={() => setIsRincianMapelOpen(true)}
              onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
            />
          </>
        )}

        {/* ======================================================== */}
        {/* MODULE 2: DATA SISWA & KESISWAAN (DAPODIK & ATURAN DINAS) */}
        {/* ======================================================== */}
        {activeModule === 'siswa' && (
          <>
            {/* Siswa Stat Cards */}
            <SiswaStatCards
              siswaList={siswaList}
              selectedFilter={selectedSiswaCategoryFilter}
              onFilterSelect={(filter) => setSelectedSiswaCategoryFilter(filter)}
            />

            {/* Siswa Table */}
            <SiswaTable
              siswaList={siswaList}
              selectedCategoryFilter={selectedSiswaCategoryFilter}
              onClearCategoryFilter={() => setSelectedSiswaCategoryFilter('ALL')}
              onEdit={handleOpenEditSiswa}
              onDelete={handleDeleteSiswa}
              onViewDetail={(siswa) => setDetailSiswa(siswa)}
              onManageFoto={(siswa) => setFotoSiswaModal(siswa)}
              onOpenAdd={handleOpenAddSiswa}
              onExport={handleExportSiswa}
              onImport={handleImportSiswa}
              onDownloadTemplate={downloadTemplateSiswaCSV}
              onResetAll={handleResetAllSiswa}
              onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
              kop={kopSekolah}
              onShowToast={showToast}
            />
          </>
        )}

        {/* ======================================================== */}
        {/* MODULE 3: PUSAT CETAK DOKUMEN & KARTU (/cetak.html) */}
        {/* ======================================================== */}
        {activeModule === 'cetak' && (
          <CetakCenter
            siswaList={siswaList}
            pegawaiList={pegawaiList}
            kop={kopSekolah}
            onViewSiswaDetail={(siswa) => setDetailSiswa(siswa)}
            onViewPegawaiDetail={(pegawai) => setDetailPegawai(pegawai)}
            onOpenGoogleDocs={() => setIsGoogleDocsModalOpen(true)}
            onOpenBackupRestore={() => setIsBackupRestoreModalOpen(true)}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* Pegawai Detail / KTA Modal */}
      <PegawaiDetailModal
        pegawai={detailPegawai}
        isOpen={!!detailPegawai}
        onClose={() => setDetailPegawai(null)}
        onEdit={(pegawai) => {
          setDetailPegawai(null);
          handleOpenEditPegawai(pegawai);
        }}
        onManageFoto={(pegawai) => {
          setFotoPegawaiModal(pegawai);
        }}
        onManageBerkas={(pegawai) => {
          setBerkasPegawaiModal(pegawai);
        }}
        kop={kopSekolah}
      />

      {/* Siswa Detail / KTA Kartu Pelajar Modal */}
      <SiswaDetailModal
        siswa={detailSiswa}
        isOpen={!!detailSiswa}
        onClose={() => setDetailSiswa(null)}
        onEdit={(siswa) => {
          setDetailSiswa(null);
          handleOpenEditSiswa(siswa);
        }}
        onManageFoto={(siswa) => {
          setFotoSiswaModal(siswa);
        }}
        kop={kopSekolah}
      />

      {/* Siswa Form Modal (Add / Edit) */}
      <SiswaFormModal
        isOpen={isSiswaFormOpen}
        onClose={() => {
          setIsSiswaFormOpen(false);
          setEditingSiswa(null);
        }}
        onSave={handleSaveSiswa}
        editingSiswa={editingSiswa}
        waliKelasOptions={waliKelasOptions}
      />

      {/* Siswa Foto Modal (Manage Photo & Red/Blue Dinas background) */}
      <SiswaFotoModal
        siswa={fotoSiswaModal}
        isOpen={!!fotoSiswaModal}
        onClose={() => setFotoSiswaModal(null)}
        onSaveFoto={handleSaveFotoSiswa}
      />

      {/* Google Forms Integration Modal */}
      <GoogleFormsManagerModal
        isOpen={isGoogleFormsModalOpen}
        onClose={() => setIsGoogleFormsModalOpen(false)}
        onImportSiswa={handleImportSiswaFromGoogleForms}
        kop={kopSekolah}
        existingSiswaCount={siswaList.length}
      />

      {/* Google Sheets Integration Modal */}
      <GoogleSheetsManagerModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        pegawaiList={pegawaiList}
        siswaList={siswaList}
        kop={kopSekolah}
        onImportSiswaFromSheets={handleImportSiswaFromGoogleSheets}
      />

      {/* Modal Edit KOP Sekolah */}
      <KopSekolahModal
        isOpen={isKopModalOpen}
        onClose={() => setIsKopModalOpen(false)}
        kopData={kopSekolah}
        onSaveKop={handleSaveKop}
      />

      {/* Modal Rincian Guru Mapel SMA (Kurikulum Merdeka) */}
      <RincianMapelModal
        isOpen={isRincianMapelOpen}
        onClose={() => setIsRincianMapelOpen(false)}
        pegawaiList={pegawaiList}
        onSelectPegawai={(pegawai: Pegawai) => {
          setIsRincianMapelOpen(false);
          setDetailPegawai(pegawai);
        }}
        onEditPegawai={(pegawai: Pegawai) => {
          setIsRincianMapelOpen(false);
          handleOpenEditPegawai(pegawai);
        }}
      />

      {/* Modal Upload & Kelola Foto Pegawai */}
      <PegawaiFotoModal
        pegawai={fotoPegawaiModal}
        isOpen={!!fotoPegawaiModal}
        onClose={() => setFotoPegawaiModal(null)}
        onUpdateFoto={handleUpdateFotoPegawai}
        onShowToast={showToast}
      />

      {/* Modal Upload & Kelola Berkas / Dokumen Pegawai */}
      <PegawaiBerkasModal
        pegawai={berkasPegawaiModal}
        isOpen={!!berkasPegawaiModal}
        onClose={() => setBerkasPegawaiModal(null)}
        onUpdateBerkas={handleUpdateBerkasPegawai}
        onShowToast={showToast}
      />

      {/* Modal Daftar Alamat Web (.html) & QR Code */}
      <WebAddressModal
        isOpen={isWebAddressModalOpen}
        onClose={() => setIsWebAddressModalOpen(false)}
        siswaList={siswaList}
        pegawaiList={pegawaiList}
        kop={kopSekolah}
      />

      {/* Modal Google Docs Manager */}
      <GoogleDocsManagerModal
        isOpen={isGoogleDocsModalOpen}
        onClose={() => setIsGoogleDocsModalOpen(false)}
        pegawaiList={pegawaiList}
        siswaList={siswaList}
        kop={kopSekolah}
      />

      {/* Modal Backup & Restore Keseluruhan */}
      <BackupRestoreModal
        isOpen={isBackupRestoreModalOpen}
        onClose={() => setIsBackupRestoreModalOpen(false)}
        pegawaiList={pegawaiList}
        siswaList={siswaList}
        kop={kopSekolah}
        onRestoreData={handleRestoreData}
        onShowToast={(msg, type) => showToast(msg, type)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            &copy; 2026 <strong>SIMPEG & KESISWAAN SMAN</strong> — Sistem Informasi Terpadu SMA Negeri
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <button
              type="button"
              onClick={() => setIsBackupRestoreModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer flex items-center gap-1"
            >
              💾 Backup & Restore Data
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setIsWebAddressModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
            >
              🌐 Alamat Web (.html)
            </button>
            <span>&bull;</span>
            <span>Standar Dapodik Kemendikbudristek</span>
            <span>&bull;</span>
            <span>Dinas Pendidikan Provinsi Jawa Timur</span>
            <span>&bull;</span>
            <span className="text-purple-700 font-semibold">Google Workspace API Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
