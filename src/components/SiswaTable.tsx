import React, { useState, useMemo } from 'react';
import { Siswa, KopSekolah } from '../types';
import {
  Search,
  Filter,
  UserCheck,
  IdCard,
  Camera,
  Edit2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Phone,
  MapPin,
  Award,
  Copy,
  Check,
  Printer,
  Maximize2,
  Minimize2,
  Table as TableIcon,
  LayoutGrid,
  Layers,
  ChevronRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { defaultKopSekolah } from '../data/defaultKopData';
import { exportSiswaToCSV } from '../utils/csvUtils';
import {
  exportSiswaToExcelFormatted,
  copyWorksheetToClipboard
} from '../utils/excelWorksheetUtils';

interface SiswaTableProps {
  siswaList: Siswa[];
  selectedCategoryFilter: string;
  onClearCategoryFilter: () => void;
  onEdit: (siswa: Siswa) => void;
  onDelete: (id: number) => void;
  onViewDetail: (siswa: Siswa) => void;
  onManageFoto: (siswa: Siswa) => void;
  onOpenAdd: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onDownloadTemplate: () => void;
  onResetAll: () => void;
  onOpenGoogleSheets?: () => void;
  kop?: KopSekolah;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const SiswaTable: React.FC<SiswaTableProps> = ({
  siswaList,
  selectedCategoryFilter,
  onClearCategoryFilter,
  onEdit,
  onDelete,
  onViewDetail,
  onManageFoto,
  onOpenAdd,
  onExport,
  onImport,
  onDownloadTemplate,
  onResetAll,
  onOpenGoogleSheets,
  kop = defaultKopSekolah,
  onShowToast = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('ALL');
  const [filterJk, setFilterJk] = useState('ALL');
  const [filterPeminatan, setFilterPeminatan] = useState('ALL');
  
  // View mode: 'worksheet' (Spreadsheet reporting) or 'cards' (web card grid)
  const [viewMode, setViewMode] = useState<'worksheet' | 'cards'>('worksheet');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Selected cell coordinates for authentic Excel interaction
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; val: string }>({
    row: 1,
    col: 'A',
    val: '1'
  });

  const filteredData = useMemo(() => {
    return siswaList.filter((item) => {
      // Category filter from top stat cards
      if (selectedCategoryFilter === 'Kelas X' && item.tingkatKelas !== 'Kelas X') return false;
      if (selectedCategoryFilter === 'Kelas XI' && item.tingkatKelas !== 'Kelas XI') return false;
      if (selectedCategoryFilter === 'Kelas XII' && item.tingkatKelas !== 'Kelas XII') return false;
      if (selectedCategoryFilter === 'PRESTASI' && !item.prestasi) return false;

      // Table specific dropdown filters
      if (filterKelas !== 'ALL' && item.tingkatKelas !== filterKelas) return false;
      if (filterJk !== 'ALL' && item.jk !== filterJk) return false;
      if (filterPeminatan !== 'ALL' && !item.peminatan.toLowerCase().includes(filterPeminatan.toLowerCase())) {
        return false;
      }

      // Search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchNama = item.nama.toLowerCase().includes(term);
        const matchNisn = item.nisn.toLowerCase().includes(term);
        const matchNis = item.nis.toLowerCase().includes(term);
        const matchNik = item.nik?.toLowerCase().includes(term);
        const matchRombel = item.rombel.toLowerCase().includes(term);
        const matchWali = item.waliKelas.toLowerCase().includes(term);
        const matchPeminatan = item.peminatan.toLowerCase().includes(term);
        const matchAlamat = item.alamat.toLowerCase().includes(term);

        if (!matchNama && !matchNisn && !matchNis && !matchNik && !matchRombel && !matchWali && !matchPeminatan && !matchAlamat) {
          return false;
        }
      }

      return true;
    });
  }, [siswaList, selectedCategoryFilter, filterKelas, filterJk, filterPeminatan, searchTerm]);

  // Statistics calculation for footer formula row
  const countL = filteredData.filter((s) => s.jk === 'Laki-laki').length;
  const countP = filteredData.filter((s) => s.jk === 'Perempuan').length;
  const countX = filteredData.filter((s) => s.tingkatKelas.includes('X') && !s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII')).length;
  const countXI = filteredData.filter((s) => s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII')).length;
  const countXII = filteredData.filter((s) => s.tingkatKelas.includes('XII')).length;
  const countFoto = filteredData.filter((s) => Boolean(s.foto)).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const handleExportExcelFormatted = () => {
    try {
      exportSiswaToExcelFormatted(siswaList, kop);
      onShowToast('Ekspor Excel Selesai', `Lembar Kerja Excel Siswa (${siswaList.length} data) dengan KOP resmi siap dibuka.`, 'success');
    } catch (err: any) {
      onShowToast('Gagal Ekspor Excel', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const handleCopyClipboard = async () => {
    try {
      const count = await copyWorksheetToClipboard('siswa', filteredData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      onShowToast(
        'Tabel Disalin!',
        `${count} data siswa berhasil disalin ke clipboard. Siap ditempel (Ctrl+V) langsung ke Excel atau Google Sheets.`,
        'success'
      );
    } catch (err: any) {
      onShowToast('Gagal Salin', 'Tidak dapat menyalin ke clipboard: ' + err.message, 'error');
    }
  };

  const handlePrintWorksheet = () => {
    window.print();
  };

  // Excel coordinate columns definition for Siswa Worksheet
  const worksheetColumns = [
    { col: 'A', title: 'No', width: 'w-12 text-center' },
    { col: 'B', title: 'Pas Foto Dinas', width: 'w-24 text-center' },
    { col: 'C', title: 'NISN (10 Digit)', width: 'w-32' },
    { col: 'D', title: 'NIS', width: 'w-20' },
    { col: 'E', title: 'NIK Kependudukan', width: 'w-36' },
    { col: 'F', title: 'Nama Lengkap Peserta Didik', width: 'w-56' },
    { col: 'G', title: 'L/P', width: 'w-14 text-center' },
    { col: 'H', title: 'Tingkat', width: 'w-20 text-center' },
    { col: 'I', title: 'Rombel', width: 'w-20 text-center' },
    { col: 'J', title: 'Peminatan / Fase', width: 'w-36' },
    { col: 'K', title: 'Status Siswa', width: 'w-24 text-center' },
    { col: 'L', title: 'Tempat Lahir', width: 'w-32' },
    { col: 'M', title: 'Tanggal Lahir', width: 'w-28 text-center' },
    { col: 'N', title: 'Agama', width: 'w-24 text-center' },
    { col: 'O', title: 'Alamat Lengkap Domisili', width: 'w-60' },
    { col: 'P', title: 'Kota / Kabupaten', width: 'w-32' },
    { col: 'Q', title: 'No. HP Siswa', width: 'w-32' },
    { col: 'R', title: 'Email Belajar.id', width: 'w-48' },
    { col: 'S', title: 'Nama Ayah', width: 'w-36' },
    { col: 'T', title: 'Pekerjaan Ayah', width: 'w-32' },
    { col: 'U', title: 'Nama Ibu', width: 'w-36' },
    { col: 'V', title: 'Pekerjaan Ibu', width: 'w-32' },
    { col: 'W', title: 'No. HP Ortu / Wali', width: 'w-32' },
    { col: 'X', title: 'Wali Kelas', width: 'w-40' },
    { col: 'Y', title: 'Prestasi & Ekskul', width: 'w-48' },
    { col: 'Z', title: 'Aksi Dokumen', width: 'w-32 text-center' }
  ];

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden transition-all duration-200 ${
        isFullScreen ? 'fixed inset-2 z-50 flex flex-col shadow-2xl border-emerald-600' : ''
      }`}
    >
      {/* 1. TOP CONTROL BAR & EXCEL WORKSHEET RIBBON */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
              <span>Buku Induk & Data Kesiswaan</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-mono">
                {filteredData.length} dari {siswaList.length} Siswa
              </span>
            </h2>
          </div>
          <p className="text-xs text-emerald-100/80 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>Sesuai Standar Dapodik & Aturan Pas Foto Resmi Dinas Pendidikan Jawa Timur</span>
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle: Worksheet vs Cards */}
          <div className="bg-slate-950/40 p-1 rounded-xl border border-emerald-500/30 flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={() => setViewMode('worksheet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'worksheet'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-white/10'
              }`}
              title="Tampilkan format Table Worksheet Excel resmi untuk pelaporan"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table Worksheet</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-white/10'
              }`}
              title="Tampilkan format kartu & preview foto web"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Format Kartu</span>
            </button>
          </div>

          {/* Tambah Siswa Baru */}
          <button
            id="btn-add-siswa"
            onClick={onOpenAdd}
            className="btn-3d btn-3d-blue px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Siswa</span>
          </button>

          {/* Google Sheets */}
          {onOpenGoogleSheets && (
            <button
              id="btn-sheets-siswa"
              type="button"
              onClick={onOpenGoogleSheets}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title="Buka Sinkronisasi Google Sheets & Buku Induk Dapodik"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Google Sheets</span>
            </button>
          )}

          {/* Ekspor Excel Terformat */}
          <button
            id="btn-export-excel-formatted"
            onClick={handleExportExcelFormatted}
            className="px-3 py-1.5 text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Unduh Berkas Excel (.XLS) lengkap dengan KOP SMAN 9 Surabaya, border tabel, dan warna header"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ekspor Excel</span>
          </button>

          {/* Ekspor CSV */}
          <button
            id="btn-export-siswa-csv"
            onClick={onExport}
            className="px-2.5 py-1.5 text-xs font-bold bg-emerald-950/60 text-emerald-100 hover:bg-emerald-800/80 border border-emerald-500/30 rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer hidden lg:flex"
            title="Ekspor CSV UTF-8 Ber-BOM"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            <span>CSV</span>
          </button>

          {/* Impor CSV */}
          <label
            htmlFor="csv-siswa-upload-input"
            className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Impor Data Siswa dari Berkas CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-300" />
            <span>Impor CSV</span>
            <input
              id="csv-siswa-upload-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Salin ke Clipboard (TSV / Siap Paste ke Excel) */}
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="px-2.5 py-1.5 text-xs font-bold bg-emerald-700/60 hover:bg-emerald-600/80 text-emerald-100 border border-emerald-400/30 rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
            title="Salin tabel (TSV) agar siap ditempel (Ctrl+V) langsung ke Microsoft Excel atau Google Sheets"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salin</span>
              </>
            )}
          </button>

          {/* Cetak Worksheet */}
          <button
            type="button"
            onClick={handlePrintWorksheet}
            className="p-1.5 text-emerald-100 hover:text-white bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 rounded-xl shadow-xs cursor-pointer"
            title="Cetak format lembar kerja pelaporan"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Layar Penuh Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 text-emerald-100 hover:text-white bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 rounded-xl shadow-xs cursor-pointer"
            title={isFullScreen ? 'Perkecil' : 'Mode Layar Penuh (Maximized Table Worksheet)'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Reset All */}
          <button
            id="btn-reset-siswa"
            onClick={onResetAll}
            className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800/60 hover:bg-red-950/60 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Kembalikan ke data bawaan simulasi SMA"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. EXCEL FORMULA BAR & SEARCH FILTER */}
      <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs shrink-0">
        {/* Left: Active Cell Box + Formula (fx) Input */}
        <div className="flex items-center gap-2 flex-1">
          {/* Active cell coordinates */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-slate-800 shadow-2xs shrink-0 min-w-[75px] justify-center">
            <span className="font-bold text-emerald-700">{selectedCell.col}{selectedCell.row}</span>
          </div>

          {/* Formula bar / Search */}
          <div className="relative flex-1 flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-2xs">
            <span className="text-[11px] font-serif font-black italic text-slate-400 mr-2 select-none">
              fx
            </span>
            <input
              id="search-siswa-input"
              type="text"
              placeholder="Cari nama siswa, NISN, NIS, NIK, rombel, wali kelas, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Kelas */}
          <select
            id="filter-kelas-select"
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:border-emerald-500 shadow-2xs font-medium"
          >
            <option value="ALL">Semua Tingkat Kelas</option>
            <option value="Kelas X">Kelas X (Fase E)</option>
            <option value="Kelas XI">Kelas XI (Fase F)</option>
            <option value="Kelas XII">Kelas XII (Fase F)</option>
          </select>

          {/* Gender */}
          <select
            id="filter-jk-siswa-select"
            value={filterJk}
            onChange={(e) => setFilterJk(e.target.value)}
            className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:border-emerald-500 shadow-2xs font-medium"
          >
            <option value="ALL">Semua Gender</option>
            <option value="Laki-laki">Putra (L)</option>
            <option value="Perempuan">Putri (P)</option>
          </select>

          {/* Peminatan */}
          <select
            id="filter-peminatan-select"
            value={filterPeminatan}
            onChange={(e) => setFilterPeminatan(e.target.value)}
            className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:border-emerald-500 shadow-2xs font-medium"
          >
            <option value="ALL">Semua Peminatan</option>
            <option value="Merdeka">Fase E Eksplorasi</option>
            <option value="MIPA">MIPA (Sains)</option>
            <option value="IPS">IPS (Sosial)</option>
            <option value="Bahasa">Bahasa & Budaya</option>
          </select>

          {selectedCategoryFilter !== 'ALL' && (
            <button
              onClick={onClearCategoryFilter}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-blue-200 cursor-pointer"
            >
              <span>Filter: {selectedCategoryFilter}</span>
              <span>✕</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. RULES NOTICE BANNER */}
      <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-amber-900 gap-2 shrink-0">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <strong>Aturan Pas Foto Dinas Pendidikan Jawa Timur:</strong>
          <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold border border-red-200">
            Latar Merah (Ganjil: 2007, 2009)
          </span>
          <span className="text-amber-400">•</span>
          <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-200">
            Latar Biru (Genap: 2006, 2008)
          </span>
          <span className="text-amber-400">•</span>
          <span>Kemeja Putih Seragam SMA & Badge OSIS Resmi</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-amber-800">
          <span>Otomatis Terverifikasi Sistem Dapodik</span>
        </div>
      </div>

      {/* 4. MAIN CONTENT VIEW: WORKSHEET TABLE OR CARDS */}
      {viewMode === 'worksheet' ? (
        /* TABLE WORKSHEET VIEW (PERFECT FOR SPREADSHEET REPORTING) */
        <div className={`overflow-auto bg-slate-50 relative ${isFullScreen ? 'flex-1' : 'max-h-[520px]'}`}>
          <table className="w-full border-collapse text-left font-sans text-xs select-text">
            {/* Coordinate Row Header (A, B, C, D...) */}
            <thead className="sticky top-0 z-20 bg-slate-200/95 backdrop-blur-xs shadow-2xs">
              <tr className="border-b border-slate-300 text-[10px] font-mono text-slate-500">
                <th className="w-10 bg-slate-300 border-r border-slate-300 text-center py-1 font-bold">
                  #
                </th>
                {worksheetColumns.map((c) => (
                  <th
                    key={c.col}
                    className={`border-r border-slate-300 py-1 px-2 font-bold text-center ${
                      selectedCell.col === c.col ? 'bg-emerald-200/70 text-emerald-900' : ''
                    }`}
                  >
                    {c.col}
                  </th>
                ))}
              </tr>

              {/* Column Label Row (Official Titles) */}
              <tr className="bg-emerald-800 text-white text-[11px] font-bold tracking-tight">
                <th className="bg-emerald-900 border-r border-emerald-700 text-center py-2.5 px-2">
                  Row
                </th>
                {worksheetColumns.map((c) => (
                  <th
                    key={c.col + c.title}
                    className={`border-r border-emerald-700 py-2.5 px-3 whitespace-nowrap ${c.width}`}
                  >
                    {c.title}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-slate-200 text-slate-800">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={27} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <UserCheck className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                      <p className="font-semibold text-slate-600">Tidak ada data siswa yang cocok</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Coba sesuaikan kata kunci pencarian atau ubah pilihan filter kelas.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((siswa, idx) => {
                  const rowNum = idx + 1;
                  const isRowSelected = selectedCell.row === rowNum;
                  const birthYear = parseInt(siswa.tanggalLahir.split('-')[0]) || 2008;
                  const isOddYear = birthYear % 2 !== 0;
                  const bgLabel = isOddYear ? 'Merah' : 'Biru';
                  const bgBadgeColor = isOddYear
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200';

                  return (
                    <tr
                      key={siswa.id}
                      id={`siswa-row-${siswa.id}`}
                      className={`hover:bg-emerald-50/60 transition-colors group ${
                        isRowSelected ? 'bg-emerald-50/40' : idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                      }`}
                    >
                      {/* Row coordinate index */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'A', val: rowNum.toString() })}
                        className={`font-mono text-[11px] text-center border-r border-slate-300 py-2 font-bold select-none cursor-pointer ${
                          isRowSelected ? 'bg-emerald-200/60 text-emerald-900' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}
                      >
                        {rowNum}
                      </td>

                      {/* Col A: No */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'A', val: rowNum.toString() })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[11px] text-slate-500"
                      >
                        {rowNum}
                      </td>

                      {/* Col B: Pas Foto Dinas */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'B', val: siswa.fotoBgColor || bgLabel })}
                        className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap"
                      >
                        <div className="inline-flex items-center gap-2">
                          <div
                            onClick={() => onManageFoto(siswa)}
                            className="w-8 h-10 rounded border border-slate-300 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                            title="Klik untuk melihat/mengubah foto"
                          >
                            {siswa.foto ? (
                              <img src={siswa.foto} alt={siswa.nama} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] text-slate-400 font-bold">3x4</span>
                            )}
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${bgBadgeColor}`}>
                            {bgLabel}
                          </span>
                        </div>
                      </td>

                      {/* Col C: NISN */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'C', val: siswa.nisn })}
                        className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] font-bold text-slate-800 whitespace-nowrap"
                      >
                        {siswa.nisn || '-'}
                      </td>

                      {/* Col D: NIS */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'D', val: siswa.nis })}
                        className="py-2 px-2 border-r border-slate-200 font-mono text-[11px] text-slate-600 whitespace-nowrap"
                      >
                        {siswa.nis || '-'}
                      </td>

                      {/* Col E: NIK */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'E', val: siswa.nik || '' })}
                        className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] text-slate-600 whitespace-nowrap"
                      >
                        {siswa.nik || '-'}
                      </td>

                      {/* Col F: Nama Siswa */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'F', val: siswa.nama })}
                        className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900 whitespace-nowrap group-hover:text-blue-600"
                      >
                        {siswa.nama}
                      </td>

                      {/* Col G: L/P */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'G', val: siswa.jk })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-bold"
                      >
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          siswa.jk === 'Laki-laki' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {siswa.jk === 'Laki-laki' ? 'L' : 'P'}
                        </span>
                      </td>

                      {/* Col H: Tingkat */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'H', val: siswa.tingkatKelas })}
                        className="py-2 px-2 text-center border-r border-slate-200 text-[11px] font-medium whitespace-nowrap"
                      >
                        {siswa.tingkatKelas}
                      </td>

                      {/* Col I: Rombel */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'I', val: siswa.rombel })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-800 whitespace-nowrap"
                      >
                        {siswa.rombel}
                      </td>

                      {/* Col J: Peminatan */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'J', val: siswa.peminatan || '' })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700"
                      >
                        {siswa.peminatan || '-'}
                      </td>

                      {/* Col K: Status */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'K', val: siswa.statusSiswa || 'Aktif' })}
                        className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap"
                      >
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                          {siswa.statusSiswa || 'Aktif'}
                        </span>
                      </td>

                      {/* Col L: Tempat Lahir */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'L', val: siswa.tempatLahir || '' })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap"
                      >
                        {siswa.tempatLahir || '-'}
                      </td>

                      {/* Col M: Tanggal Lahir */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'M', val: siswa.tanggalLahir || '' })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[11px] whitespace-nowrap"
                      >
                        {siswa.tanggalLahir || '-'}
                      </td>

                      {/* Col N: Agama */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'N', val: siswa.agama || '' })}
                        className="py-2 px-2 text-center border-r border-slate-200 text-[11px]"
                      >
                        {siswa.agama || 'Islam'}
                      </td>

                      {/* Col O: Alamat */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'O', val: siswa.alamat || '' })}
                        className="py-2 px-3 border-r border-slate-200 text-slate-600 truncate max-w-xs"
                      >
                        {siswa.alamat || '-'}
                      </td>

                      {/* Col P: Kota */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'P', val: siswa.kotaKab || '' })}
                        className="py-2 px-3 border-r border-slate-200 text-slate-600 whitespace-nowrap"
                      >
                        {siswa.kotaKab || 'Kota Surabaya'}
                      </td>

                      {/* Col Q: No HP Siswa */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'Q', val: siswa.noHpSiswa || '' })}
                        className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] whitespace-nowrap"
                      >
                        {siswa.noHpSiswa || '-'}
                      </td>

                      {/* Col R: Email */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'R', val: siswa.email || '' })}
                        className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px] whitespace-nowrap"
                      >
                        {siswa.email || '-'}
                      </td>

                      {/* Col S: Nama Ayah */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'S', val: siswa.namaAyah || '' })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-medium"
                      >
                        {siswa.namaAyah || '-'}
                      </td>

                      {/* Col T: Pekerjaan Ayah */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'T', val: siswa.pekerjaanAyah || '' })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap text-slate-600"
                      >
                        {siswa.pekerjaanAyah || '-'}
                      </td>

                      {/* Col U: Nama Ibu */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'U', val: siswa.namaIbu || '' })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-medium"
                      >
                        {siswa.namaIbu || '-'}
                      </td>

                      {/* Col V: Pekerjaan Ibu */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'V', val: siswa.pekerjaanIbu || '' })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap text-slate-600"
                      >
                        {siswa.pekerjaanIbu || '-'}
                      </td>

                      {/* Col W: No HP Ortu */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'W', val: siswa.noHpOrtu || '' })}
                        className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] whitespace-nowrap"
                      >
                        {siswa.noHpOrtu || '-'}
                      </td>

                      {/* Col X: Wali Kelas */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'X', val: siswa.waliKelas || '' })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap"
                      >
                        {siswa.waliKelas || '-'}
                      </td>

                      {/* Col Y: Prestasi */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'Y', val: siswa.prestasi || '' })}
                        className="py-2 px-3 border-r border-slate-200 text-slate-700 whitespace-nowrap"
                      >
                        {siswa.prestasi || '-'}
                      </td>

                      {/* Col Z: Aksi & KTA */}
                      <td className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewDetail(siswa)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Lihat KTA Pelajar"
                          >
                            <IdCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onManageFoto(siswa)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                            title="Ganti Foto"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEdit(siswa)}
                            className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(siswa.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* TOTAL & SUMMARY FORMULA FOOTER (=COUNTA / =SUM) */}
            <tfoot className="sticky bottom-0 z-10 bg-slate-100 border-t-2 border-emerald-700 text-slate-800 text-[11px] font-bold shadow-xs">
              <tr>
                <td className="bg-slate-200 text-center py-2 text-slate-600 border-r border-slate-300 font-mono">
                  Σ
                </td>
                <td className="py-2 px-2 text-center border-r border-slate-300 text-slate-600 text-[10px]">
                  Foto: {countFoto}/{filteredData.length}
                </td>
                <td colSpan={4} className="py-2 px-3 border-r border-slate-300 text-emerald-900">
                  TOTAL SISWA DAPODIK: <span className="text-emerald-700 font-black">{filteredData.length} Peserta Didik</span>
                </td>
                <td className="text-center py-2 px-1 border-r border-slate-300 text-[10px]">
                  L: {countL} | P: {countP}
                </td>
                <td colSpan={3} className="py-2 px-2 text-center border-r border-slate-300 text-[10px] text-slate-700">
                  Kelas X: {countX} | XI: {countXI} | XII: {countXII}
                </td>
                <td colSpan={17} className="py-2 px-3 text-right text-slate-600 text-[10px]">
                  Status: 100% Terdaftar di Buku Induk Dapodik Kemendikbudristek & BKN Jatim
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* ORIGINAL CARDS / WEB GRID VIEW */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-3 text-center w-16">Pas Foto</th>
                <th className="py-3 px-4">Identitas Siswa (Dapodik)</th>
                <th className="py-3 px-4">Kelas & Peminatan</th>
                <th className="py-3 px-4">Orang Tua & Kontak</th>
                <th className="py-3 px-4">Wali Kelas</th>
                <th className="py-3 px-3 text-center w-36">Aksi & KTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <UserCheck className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                      <p className="font-semibold text-slate-600">Tidak ada data siswa yang cocok</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Coba sesuaikan kata kunci pencarian atau ubah pilihan filter kelas.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((siswa, idx) => {
                  const birthYear = parseInt(siswa.tanggalLahir.split('-')[0]) || 2008;
                  const isOddYear = birthYear % 2 !== 0;
                  const bgLabel = isOddYear ? 'Merah' : 'Biru';
                  const bgBadgeColor = isOddYear ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200';

                  return (
                    <tr
                      key={siswa.id}
                      id={`siswa-row-${siswa.id}`}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Index */}
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Pas Foto Aturan Dinas */}
                      <td className="py-3 px-3 text-center">
                        <div className="relative inline-block group/foto">
                          <div className="w-10 h-13 rounded border border-slate-300 shadow-2xs overflow-hidden bg-slate-100 flex items-center justify-center">
                            {siswa.foto ? (
                              <img
                                src={siswa.foto}
                                alt={siswa.nama}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold">3x4</span>
                            )}
                          </div>
                          {/* Dinas background indicator tag */}
                          <div className="mt-1">
                            <span className={`text-[9px] font-bold px-1 py-0.2 rounded border ${bgBadgeColor}`}>
                              {bgLabel}
                            </span>
                          </div>
                          {/* Quick edit photo hover button */}
                          <button
                            onClick={() => onManageFoto(siswa)}
                            title="Kelola Pas Foto Siswa"
                            className="absolute -top-1 -right-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 p-0.5 rounded-full border border-slate-200 shadow-xs opacity-0 group-hover/foto:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Camera className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>

                      {/* Identitas Siswa */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {siswa.nama}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 font-mono text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">NISN: {siswa.nisn}</span>
                          <span className="text-slate-300">•</span>
                          <span>NIS: {siswa.nis}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <span>{siswa.jk}</span>
                          <span>•</span>
                          <span>{siswa.tempatLahir}, {siswa.tanggalLahir}</span>
                          <span>•</span>
                          <span>{siswa.agama}</span>
                        </div>
                        {siswa.prestasi && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 max-w-fit">
                            <Award className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate max-w-[260px]">{siswa.prestasi}</span>
                          </div>
                        )}
                      </td>

                      {/* Kelas & Peminatan */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                            {siswa.rombel}
                          </span>
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                            {siswa.tingkatKelas}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 line-clamp-1" title={siswa.peminatan}>
                          {siswa.peminatan}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {siswa.faseKurikulum}
                        </div>
                      </td>

                      {/* Orang Tua & Kontak */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-slate-800 font-medium">
                          Ayah: {siswa.namaAyah}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Ibu: {siswa.namaIbu}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 font-mono">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          <span>Ortu: {siswa.noHpOrtu}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={siswa.alamat}>
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>{siswa.alamat}</span>
                        </div>
                      </td>

                      {/* Wali Kelas */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 text-[11px]">
                          {siswa.waliKelas}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 mt-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{siswa.statusSiswa}</span>
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Lihat KTA / Kartu Pelajar */}
                          <button
                            id={`btn-kta-siswa-${siswa.id}`}
                            onClick={() => onViewDetail(siswa)}
                            title="Cetak & Lihat Kartu Tanda Pelajar (KTA)"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <IdCard className="w-4 h-4" />
                          </button>

                          {/* Kelola Pas Foto */}
                          <button
                            onClick={() => onManageFoto(siswa)}
                            title="Kelola Pas Foto Resmi Siswa"
                            className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                          </button>

                          {/* Edit Data */}
                          <button
                            onClick={() => onEdit(siswa)}
                            title="Ubah Data Siswa"
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Hapus Data */}
                          <button
                            onClick={() => onDelete(siswa.id)}
                            title="Hapus Data Siswa"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. SPREADSHEET STATUS BAR (FOOTER) */}
      <div className="bg-slate-800 text-slate-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SIAP (READY)
          </span>
          <span className="text-slate-500">|</span>
          <span>
            Menampilkan <strong>{filteredData.length}</strong> dari {siswaList.length} Siswa
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Mode Aktif: <strong className="text-white">{viewMode === 'worksheet' ? 'Table Worksheet Excel' : 'Format Kartu'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="hidden md:inline">Standar Dapodik Kemendikbudristek & BKN Jawa Timur</span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <button
            type="button"
            onClick={handlePrintWorksheet}
            className="text-white hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-bold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
