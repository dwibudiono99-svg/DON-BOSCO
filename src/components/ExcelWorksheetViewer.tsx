import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Printer,
  Maximize2,
  Minimize2,
  Search,
  Check,
  CheckCircle2,
  Table as TableIcon,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  FileText
} from 'lucide-react';
import { Pegawai, Siswa, KopSekolah } from '../types';
import { exportPegawaiToCSV, exportSiswaToCSV } from '../utils/csvUtils';
import {
  exportPegawaiToExcelFormatted,
  exportSiswaToExcelFormatted,
  copyWorksheetToClipboard
} from '../utils/excelWorksheetUtils';

interface ExcelWorksheetViewerProps {
  pegawaiList: Pegawai[];
  siswaList: Siswa[];
  kop: KopSekolah;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  initialSheet?: 'pegawai' | 'siswa';
  className?: string;
}

export const ExcelWorksheetViewer: React.FC<ExcelWorksheetViewerProps> = ({
  pegawaiList,
  siswaList,
  kop,
  onShowToast,
  initialSheet = 'pegawai',
  className = ''
}) => {
  const [activeSheet, setActiveSheet] = useState<'pegawai' | 'siswa'>(initialSheet);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; val: string }>({
    row: 1,
    col: 'A',
    val: '1'
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filtered lists based on search query
  const filteredPegawai = useMemo(() => {
    if (!searchQuery.trim()) return pegawaiList;
    const q = searchQuery.toLowerCase();
    return pegawaiList.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.nip.toLowerCase().includes(q) ||
        p.statusPegawai.toLowerCase().includes(q) ||
        p.mapel.toLowerCase().includes(q) ||
        p.jenisPtk.toLowerCase().includes(q) ||
        (p.nuptk && p.nuptk.toLowerCase().includes(q))
    );
  }, [pegawaiList, searchQuery]);

  const filteredSiswa = useMemo(() => {
    if (!searchQuery.trim()) return siswaList;
    const q = searchQuery.toLowerCase();
    return siswaList.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.rombel.toLowerCase().includes(q) ||
        s.tingkatKelas.toLowerCase().includes(q) ||
        s.statusSiswa.toLowerCase().includes(q)
    );
  }, [siswaList, searchQuery]);

  // Statistics
  const pnsCount = pegawaiList.filter((p) => p.statusPegawai === 'PNS').length;
  const pppkCount = pegawaiList.filter((p) => p.statusPegawai === 'PPPK').length;
  const gttCount = pegawaiList.filter((p) => p.statusPegawai.includes('GTT')).length;
  const pttCount = pegawaiList.filter((p) => p.statusPegawai.includes('PTT')).length;
  const certifiedCount = pegawaiList.filter((p) => p.statusSertifikasi?.includes('Sudah')).length;
  const totalJjm = pegawaiList.reduce((acc, p) => acc + (p.jumlahJamMengajar || 0), 0);

  const siswaL = siswaList.filter((s) => s.jk === 'Laki-laki').length;
  const siswaP = siswaList.filter((s) => s.jk === 'Perempuan').length;
  const siswaX = siswaList.filter((s) => s.tingkatKelas.includes('X') && !s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII')).length;
  const siswaXI = siswaList.filter((s) => s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII')).length;
  const siswaXII = siswaList.filter((s) => s.tingkatKelas.includes('XII')).length;

  // Handlers
  const handleExportCSV = (type: 'pegawai' | 'siswa') => {
    try {
      if (type === 'pegawai') {
        exportPegawaiToCSV(pegawaiList);
        onShowToast('Ekspor CSV Selesai', `Data CSV Pegawai (${pegawaiList.length} PTK) berhasil diunduh.`, 'success');
      } else {
        exportSiswaToCSV(siswaList);
        onShowToast('Ekspor CSV Selesai', `Data CSV Siswa (${siswaList.length} Siswa) berhasil diunduh.`, 'success');
      }
    } catch (err: any) {
      onShowToast('Gagal Ekspor CSV', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const handleExportExcelFormatted = (type: 'pegawai' | 'siswa') => {
    try {
      if (type === 'pegawai') {
        exportPegawaiToExcelFormatted(pegawaiList, kop);
        onShowToast('Excel Terformat Diunduh', `Lembar Kerja Excel PTK Pegawai (${pegawaiList.length} data) siap dibuka di Excel.`, 'success');
      } else {
        exportSiswaToExcelFormatted(siswaList, kop);
        onShowToast('Excel Terformat Diunduh', `Lembar Kerja Excel Siswa (${siswaList.length} data) siap dibuka di Excel.`, 'success');
      }
    } catch (err: any) {
      onShowToast('Gagal Ekspor Excel', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const handleCopyClipboard = async () => {
    try {
      const count = await copyWorksheetToClipboard(
        activeSheet,
        activeSheet === 'pegawai' ? pegawaiList : siswaList
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      onShowToast(
        'Tabel Disalin!',
        `${count} baris data ${activeSheet === 'pegawai' ? 'Pegawai' : 'Siswa'} siap ditempel (Ctrl+V) langsung ke Excel / Google Sheets.`,
        'success'
      );
    } catch (err: any) {
      onShowToast('Gagal Salin', 'Tidak dapat menyalin ke clipboard: ' + err.message, 'error');
    }
  };

  const handlePrintWorksheet = () => {
    window.print();
  };

  // Coordinates columns mapping for Excel feeling
  const pegawaiColumns = [
    { col: 'A', title: 'No', width: 'w-12 text-center' },
    { col: 'B', title: 'NIP / NIPPPK', width: 'w-44' },
    { col: 'C', title: 'Nama Lengkap & Gelar', width: 'w-56' },
    { col: 'D', title: 'L/P', width: 'w-14 text-center' },
    { col: 'E', title: 'Status', width: 'w-24 text-center' },
    { col: 'F', title: 'Jenis PTK', width: 'w-36' },
    { col: 'G', title: 'Mata Pelajaran / Tugas', width: 'w-48' },
    { col: 'H', title: 'Golongan', width: 'w-20 text-center' },
    { col: 'I', title: 'Pendidikan', width: 'w-24 text-center' },
    { col: 'J', title: 'No HP / WhatsApp', width: 'w-36' },
    { col: 'K', title: 'Email Dinas', width: 'w-48' },
    { col: 'L', title: 'NUPTK', width: 'w-40' },
    { col: 'M', title: 'TMT', width: 'w-28 text-center' },
    { col: 'N', title: 'Sertifikasi', width: 'w-32 text-center' },
    { col: 'O', title: 'JJM', width: 'w-20 text-right' }
  ];

  const siswaColumns = [
    { col: 'A', title: 'No', width: 'w-12 text-center' },
    { col: 'B', title: 'NISN', width: 'w-32' },
    { col: 'C', title: 'NIS', width: 'w-24' },
    { col: 'D', title: 'Nama Lengkap Siswa', width: 'w-56' },
    { col: 'E', title: 'L/P', width: 'w-14 text-center' },
    { col: 'F', title: 'Tingkat', width: 'w-24 text-center' },
    { col: 'G', title: 'Rombel', width: 'w-20 text-center' },
    { col: 'H', title: 'Peminatan', width: 'w-36' },
    { col: 'I', title: 'Status', width: 'w-24 text-center' },
    { col: 'J', title: 'Tempat, Tgl Lahir', width: 'w-44' },
    { col: 'K', title: 'Agama', width: 'w-24 text-center' },
    { col: 'L', title: 'Alamat Siswa', width: 'w-56' },
    { col: 'M', title: 'No HP Siswa', width: 'w-32' },
    { col: 'N', title: 'Nama Orang Tua / Wali', width: 'w-44' },
    { col: 'O', title: 'No HP Ortu', width: 'w-32' },
    { col: 'P', title: 'Wali Kelas', width: 'w-40' }
  ];

  const activeCols = activeSheet === 'pegawai' ? pegawaiColumns : siswaColumns;

  return (
    <div
      className={`border border-slate-300 rounded-2xl bg-white shadow-md overflow-hidden transition-all duration-200 ${
        isFullScreen ? 'fixed inset-3 z-50 flex flex-col shadow-2xl border-emerald-600' : className
      }`}
    >
      {/* 1. TOP EXCEL APPBANNER & TITLE */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 px-4 py-3 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
            <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                Pilihan Ekspor Cadangan Lembar Kerja Excel / CSV Terpisah
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-bold px-2 py-0.5 rounded border border-emerald-400/30 font-mono">
                Worksheet Table Engine
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80">
              Format baku pelaporan kedinasan SMAN 9 Surabaya (Excel .xls terformat & CSV UTF-8 ber-BOM)
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Ekspor CSV Pegawai (17) */}
          <button
            type="button"
            onClick={() => handleExportCSV('pegawai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              activeSheet === 'pegawai'
                ? 'bg-emerald-500 text-white hover:bg-emerald-400 ring-2 ring-emerald-300/40'
                : 'bg-emerald-950/60 text-emerald-100 hover:bg-emerald-800/80 border border-emerald-500/30'
            }`}
            title="Unduh CSV Pegawai dengan format titik koma (;) untuk Excel Indonesia"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            <span>Ekspor CSV Pegawai ({pegawaiList.length})</span>
          </button>

          {/* Ekspor CSV Siswa (8) */}
          <button
            type="button"
            onClick={() => handleExportCSV('siswa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              activeSheet === 'siswa'
                ? 'bg-blue-600 text-white hover:bg-blue-500 ring-2 ring-blue-300/40'
                : 'bg-slate-800/80 text-blue-200 hover:bg-blue-900/60 border border-blue-400/30'
            }`}
            title="Unduh CSV Siswa Dapodik dengan format titik koma (;) untuk Excel Indonesia"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-200" />
            <span>Ekspor CSV Siswa ({siswaList.length})</span>
          </button>

          {/* Unduh Excel Terformat */}
          <button
            type="button"
            onClick={() => handleExportExcelFormatted(activeSheet)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Unduh berkas Excel .XLS lengkap dengan KOP resmi, warna header hijau, dan border tebal"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Unduh Excel (.XLS)</span>
            <span className="sm:hidden">Excel</span>
          </button>

          {/* Salin ke Clipboard */}
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-700/60 hover:bg-emerald-600/80 text-emerald-100 border border-emerald-400/30 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Salin tabel tab-separated (TSV) untuk langsung di-paste (Ctrl+V) ke Excel atau Google Sheets"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salin (Paste Excel)</span>
              </>
            )}
          </button>

          {/* Full Screen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-emerald-500/20 transition cursor-pointer"
            title={isFullScreen ? 'Perkecil Tampilan' : 'Tampilkan Layar Penuh (Maximized Worksheet)'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. EXCEL FORMULA BAR & SHEET TAB NAVIGATION */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs shrink-0">
        {/* Left: Sheet Tabs (Like Excel sheet tabs at top or bottom) */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 uppercase mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Sheet:
          </span>

          <button
            type="button"
            onClick={() => {
              setActiveSheet('pegawai');
              setSelectedCell({ row: 1, col: 'A', val: '1' });
            }}
            className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 transition cursor-pointer border-t-2 ${
              activeSheet === 'pegawai'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'bg-slate-200/80 text-slate-600 hover:bg-slate-200 border-transparent'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sheet 1: PTK Pegawai ({pegawaiList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSheet('siswa');
              setSelectedCell({ row: 1, col: 'A', val: '1' });
            }}
            className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 transition cursor-pointer border-t-2 ${
              activeSheet === 'siswa'
                ? 'bg-white text-blue-800 border-blue-600 shadow-2xs'
                : 'bg-slate-200/80 text-slate-600 hover:bg-slate-200 border-transparent'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Sheet 2: Siswa Dapodik ({siswaList.length})</span>
          </button>
        </div>

        {/* Right: Excel Formula & Cell Coordinate Box */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 font-mono text-[11px] text-slate-700 shadow-2xs shrink-0 min-w-[70px] justify-center">
            <span className="font-bold text-emerald-700">{selectedCell.col}{selectedCell.row}</span>
          </div>

          <div className="relative flex-1 flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
            <span className="text-[11px] font-serif font-black italic text-slate-400 mr-2 select-none">
              fx
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filter baris ${activeSheet === 'pegawai' ? 'PTK Pegawai' : 'Siswa Dapodik'}...`}
              className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. WORKSHEET TABLE GRID CONTAINER */}
      <div className={`overflow-auto bg-slate-50 relative ${isFullScreen ? 'flex-1' : 'max-h-[380px]'}`}>
        <table className="w-full border-collapse text-left font-sans text-xs select-text">
          {/* Coordinate Row Header (A, B, C, D...) */}
          <thead className="sticky top-0 z-20 bg-slate-200/90 backdrop-blur-xs shadow-2xs">
            <tr className="border-b border-slate-300 text-[10px] font-mono text-slate-500">
              <th className="w-10 bg-slate-300/80 border-r border-slate-300 text-center py-1 font-bold">
                #
              </th>
              {activeCols.map((c) => (
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
              {activeCols.map((c) => (
                <th
                  key={c.col + c.title}
                  className={`border-r border-emerald-700 py-2.5 px-3 whitespace-nowrap ${c.width}`}
                >
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body Data Rows */}
          <tbody className="bg-white divide-y divide-slate-200 text-slate-800">
            {activeSheet === 'pegawai' ? (
              filteredPegawai.length > 0 ? (
                filteredPegawai.map((p, idx) => {
                  const rowNum = idx + 1;
                  const isRowSelected = selectedCell.row === rowNum;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-emerald-50/70 transition group ${
                        isRowSelected ? 'bg-emerald-50/50' : idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
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
                        onClick={() => setSelectedCell({ row: rowNum, col: 'A', val: (idx + 1).toString() })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[11px] text-slate-500"
                      >
                        {idx + 1}
                      </td>

                      {/* Col B: NIP */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'B', val: p.nip })}
                        className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] text-slate-800 font-bold whitespace-nowrap"
                      >
                        {p.nip || '-'}
                      </td>

                      {/* Col C: Nama */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'C', val: p.nama })}
                        className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900 whitespace-nowrap"
                      >
                        {p.nama}
                      </td>

                      {/* Col D: JK */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'D', val: p.jk })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-bold"
                      >
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          p.jk === 'Laki-laki' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {p.jk === 'Laki-laki' ? 'L' : 'P'}
                        </span>
                      </td>

                      {/* Col E: Status */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'E', val: p.statusPegawai })}
                        className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap font-bold"
                      >
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          p.statusPegawai === 'PNS'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : p.statusPegawai === 'PPPK'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {p.statusPegawai}
                        </span>
                      </td>

                      {/* Col F: Jenis PTK */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'F', val: p.jenisPtk })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap"
                      >
                        {p.jenisPtk}
                      </td>

                      {/* Col G: Mapel */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'G', val: p.mapel })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-medium text-slate-800"
                      >
                        {p.mapel || '-'}
                      </td>

                      {/* Col H: Golongan */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'H', val: p.golongan })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[11px] whitespace-nowrap"
                      >
                        {p.golongan || '-'}
                      </td>

                      {/* Col I: Pendidikan */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'I', val: p.pendidikan })}
                        className="py-2 px-2 text-center border-r border-slate-200 text-[11px] whitespace-nowrap"
                      >
                        {p.pendidikan}
                      </td>

                      {/* Col J: No HP */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'J', val: p.noHp })}
                        className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] whitespace-nowrap"
                      >
                        {p.noHp || '-'}
                      </td>

                      {/* Col K: Email */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'K', val: p.email || '' })}
                        className="py-2 px-3 border-r border-slate-200 text-slate-600 whitespace-nowrap font-mono text-[11px]"
                      >
                        {p.email || '-'}
                      </td>

                      {/* Col L: NUPTK */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'L', val: p.nuptk || '' })}
                        className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] whitespace-nowrap text-slate-600"
                      >
                        {p.nuptk || '-'}
                      </td>

                      {/* Col M: TMT */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'M', val: p.tmt || '' })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[11px] whitespace-nowrap"
                      >
                        {p.tmt || '-'}
                      </td>

                      {/* Col N: Sertifikasi */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'N', val: p.statusSertifikasi || '' })}
                        className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap text-[11px]"
                      >
                        {p.statusSertifikasi?.includes('Sudah') ? (
                          <span className="text-emerald-700 font-bold">✓ Sudah</span>
                        ) : (
                          <span className="text-slate-400">Belum</span>
                        )}
                      </td>

                      {/* Col O: JJM */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'O', val: (p.jumlahJamMengajar || 0).toString() })}
                        className="py-2 px-3 text-right border-r border-slate-200 font-mono font-bold text-slate-800"
                      >
                        {p.jumlahJamMengajar || 0} Jam
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={16} className="text-center py-10 text-slate-400">
                    Tidak ada data pegawai yang sesuai dengan pencarian "{searchQuery}".
                  </td>
                </tr>
              )
            ) : (
              /* Siswa rows */
              filteredSiswa.length > 0 ? (
                filteredSiswa.map((s, idx) => {
                  const rowNum = idx + 1;
                  const isRowSelected = selectedCell.row === rowNum;
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-blue-50/70 transition group ${
                        isRowSelected ? 'bg-blue-50/50' : idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                      }`}
                    >
                      {/* Row coordinate index */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'A', val: rowNum.toString() })}
                        className={`font-mono text-[11px] text-center border-r border-slate-300 py-2 font-bold select-none cursor-pointer ${
                          isRowSelected ? 'bg-blue-200/60 text-blue-900' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}
                      >
                        {rowNum}
                      </td>

                      {/* Col A: No */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'A', val: (idx + 1).toString() })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[11px] text-slate-500"
                      >
                        {idx + 1}
                      </td>

                      {/* Col B: NISN */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'B', val: s.nisn })}
                        className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] font-bold text-slate-800 whitespace-nowrap"
                      >
                        {s.nisn || '-'}
                      </td>

                      {/* Col C: NIS */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'C', val: s.nis })}
                        className="py-2 px-2 border-r border-slate-200 font-mono text-[11px] text-slate-600 whitespace-nowrap"
                      >
                        {s.nis || '-'}
                      </td>

                      {/* Col D: Nama Siswa */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'D', val: s.nama })}
                        className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900 whitespace-nowrap"
                      >
                        {s.nama}
                      </td>

                      {/* Col E: JK */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'E', val: s.jk })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-bold"
                      >
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          s.jk === 'Laki-laki' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {s.jk === 'Laki-laki' ? 'L' : 'P'}
                        </span>
                      </td>

                      {/* Col F: Tingkat */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'F', val: s.tingkatKelas })}
                        className="py-2 px-2 text-center border-r border-slate-200 text-[11px] font-medium"
                      >
                        {s.tingkatKelas}
                      </td>

                      {/* Col G: Rombel */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'G', val: s.rombel })}
                        className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-800"
                      >
                        {s.rombel}
                      </td>

                      {/* Col H: Peminatan */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'H', val: s.peminatan || '' })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700"
                      >
                        {s.peminatan || '-'}
                      </td>

                      {/* Col I: Status */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'I', val: s.statusSiswa })}
                        className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap"
                      >
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                          {s.statusSiswa || 'Aktif'}
                        </span>
                      </td>

                      {/* Col J: TTL */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'J', val: `${s.tempatLahir}, ${s.tanggalLahir}` })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap text-[11px]"
                      >
                        {s.tempatLahir}, {s.tanggalLahir}
                      </td>

                      {/* Col K: Agama */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'K', val: s.agama || '' })}
                        className="py-2 px-2 text-center border-r border-slate-200 text-[11px]"
                      >
                        {s.agama || 'Islam'}
                      </td>

                      {/* Col L: Alamat */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'L', val: s.alamat || '' })}
                        className="py-2 px-3 border-r border-slate-200 text-slate-600 truncate max-w-xs"
                      >
                        {s.alamat || '-'}
                      </td>

                      {/* Col M: No HP Siswa */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'M', val: s.noHpSiswa || '' })}
                        className="py-2 px-3 border-r border-slate-200 font-mono text-[11px]"
                      >
                        {s.noHpSiswa || '-'}
                      </td>

                      {/* Col N: Ortu */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'N', val: s.namaAyah || s.namaIbu || '' })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-medium"
                      >
                        {s.namaAyah || s.namaIbu || '-'}
                      </td>

                      {/* Col O: No HP Ortu */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'O', val: s.noHpOrtu || '' })}
                        className="py-2 px-3 border-r border-slate-200 font-mono text-[11px]"
                      >
                        {s.noHpOrtu || '-'}
                      </td>

                      {/* Col P: Wali Kelas */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: 'P', val: s.waliKelas || '' })}
                        className="py-2 px-3 border-r border-slate-200 whitespace-nowrap"
                      >
                        {s.waliKelas || '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={17} className="text-center py-10 text-slate-400">
                    Tidak ada data siswa yang sesuai dengan pencarian "{searchQuery}".
                  </td>
                </tr>
              )
            )}
          </tbody>

          {/* TOTAL & SUMMARY ROW (Spreadsheet Formula Row =SUM / =COUNT) */}
          <tfoot className="sticky bottom-0 z-10 bg-slate-100 border-t-2 border-emerald-700 text-slate-800 text-[11px] font-bold shadow-xs">
            {activeSheet === 'pegawai' ? (
              <tr>
                <td className="bg-slate-200 text-center py-2 text-slate-600 border-r border-slate-300 font-mono">
                  Σ
                </td>
                <td colSpan={3} className="py-2 px-3 border-r border-slate-300 text-emerald-900">
                  TOTAL PTK: <span className="text-emerald-700 font-black">{pegawaiList.length} Orang</span>
                </td>
                <td className="text-center py-2 px-1 border-r border-slate-300 text-[10px]">
                  PNS: {pnsCount}
                </td>
                <td className="text-center py-2 px-1 border-r border-slate-300 text-[10px]">
                  PPPK: {pppkCount}
                </td>
                <td colSpan={3} className="py-2 px-3 border-r border-slate-300 text-slate-600 text-[10px]">
                  GTT: {gttCount} | PTT: {pttCount} | Sertifikasi: {certifiedCount}
                </td>
                <td colSpan={5} className="py-2 px-3 border-r border-slate-300 text-right text-slate-600 text-[10px]">
                  Akumulasi Beban Mengajar (JJM):
                </td>
                <td className="py-2 px-3 text-right font-mono text-emerald-800 font-black border-r border-slate-300">
                  {totalJjm} Jam
                </td>
              </tr>
            ) : (
              <tr>
                <td className="bg-slate-200 text-center py-2 text-slate-600 border-r border-slate-300 font-mono">
                  Σ
                </td>
                <td colSpan={4} className="py-2 px-3 border-r border-slate-300 text-blue-900">
                  TOTAL SISWA: <span className="text-blue-700 font-black">{siswaList.length} Peserta Didik</span>
                </td>
                <td className="text-center py-2 px-1 border-r border-slate-300 text-[10px]">
                  L: {siswaL} | P: {siswaP}
                </td>
                <td colSpan={3} className="py-2 px-3 border-r border-slate-300 text-slate-600 text-[10px]">
                  Kelas X: {siswaX} | Kelas XI: {siswaXI} | Kelas XII: {siswaXII}
                </td>
                <td colSpan={7} className="py-2 px-3 text-right text-slate-600 text-[10px]">
                  Status: 100% Aktif Terdaftar di Buku Induk Dapodik Kemendikbudristek
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* 4. SPREADSHEET STATUS BAR (FOOTER) */}
      <div className="bg-slate-800 text-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SIAP (READY)
          </span>
          <span className="text-slate-500">|</span>
          <span>
            Aktif: <strong className="text-white">{activeSheet === 'pegawai' ? 'Sheet 1: PTK Pegawai' : 'Sheet 2: Siswa Dapodik'}</strong>
          </span>
          <span className="text-slate-500">|</span>
          <span>
            Ditampilkan: <strong className="text-white">{activeSheet === 'pegawai' ? filteredPegawai.length : filteredSiswa.length}</strong> dari{' '}
            {activeSheet === 'pegawai' ? pegawaiList.length : siswaList.length} baris
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-slate-400">Pemisah CSV: Titik Koma (;) | Encoding: UTF-8 BOM</span>
          <button
            type="button"
            onClick={handlePrintWorksheet}
            className="text-white hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-bold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Worksheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
