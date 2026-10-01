import React, { useState } from 'react';
import {
  Printer,
  FileText,
  IdCard,
  Users,
  GraduationCap,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  Settings2,
  Calendar,
  Building,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  Layers,
  FileSpreadsheet,
  Database
} from 'lucide-react';
import { Siswa, Pegawai, KopSekolah } from '../types';
import {
  generateSiswaStandaloneHTML,
  generatePegawaiStandaloneHTML,
  generateLaporanEksekutifHTML,
  downloadHTMLFile
} from '../utils/htmlExporter';
import { ExcelWorksheetViewer } from './ExcelWorksheetViewer';

interface CetakCenterProps {
  siswaList: Siswa[];
  pegawaiList: Pegawai[];
  kop: KopSekolah;
  onViewSiswaDetail: (siswa: Siswa) => void;
  onViewPegawaiDetail: (pegawai: Pegawai) => void;
  onOpenGoogleDocs?: () => void;
  onOpenBackupRestore?: () => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const CetakCenter: React.FC<CetakCenterProps> = ({
  siswaList,
  pegawaiList,
  kop,
  onViewSiswaDetail,
  onViewPegawaiDetail,
  onOpenGoogleDocs,
  onOpenBackupRestore,
  onShowToast = () => {}
}) => {
  // Document Type:
  // 'eksekutif' = Laporan Eksekutif Pelaporan (1-2 lembar ringkas, padat & resmi)
  // 'duk' = Daftar Urut Kepegawaian (SIMPEG)
  // 'siswa' = Buku Induk Kesiswaan & Dapodik
  // 'kartu' = Lembar Cetak Kartu Pelajar & KTA
  // 'worksheet' = Lembar Kerja Excel / CSV Worksheet Table
  const [selectedDoc, setSelectedDoc] = useState<'eksekutif' | 'duk' | 'siswa' | 'kartu' | 'worksheet'>('eksekutif');

  // Customization options for reporting
  const [nomorSurat, setNomorSurat] = useState('421.3 / 118 / 101.6.1 / 2026');
  const [periodeLaporan, setPeriodeLaporan] = useState('Semester Genap Tahun Ajaran 2025/2026');
  const [namaKepalaSekolah, setNamaKepalaSekolah] = useState('Dr. H. Bambang Sudarsono, M.Pd.');
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState('19680512 199412 1 002');
  const [namaOperator, setNamaOperator] = useState('Dwi Budiono, S.Kom.');
  const [nipOperator, setNipOperator] = useState('19880923 201503 1 003');
  const [tanggalCetak, setTanggalCetak] = useState(
    new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  );
  const [showConfig, setShowConfig] = useState(false);

  // Statistics calculation for Executive Report
  const totalPegawai = pegawaiList.length;
  const pnsCount = pegawaiList.filter((p) => p.statusPegawai === 'PNS').length;
  const pppkCount = pegawaiList.filter((p) => p.statusPegawai === 'PPPK').length;
  const gttCount = pegawaiList.filter((p) => p.statusPegawai.includes('GTT')).length;
  const pttCount = pegawaiList.filter((p) => p.statusPegawai.includes('PTT')).length;
  const certifiedCount = pegawaiList.filter((p) => p.statusSertifikasi?.toLowerCase().includes('sudah')).length;
  const totalJjm = pegawaiList.reduce((acc, p) => acc + (p.jumlahJamMengajar || 0), 0);
  const avgJjm = totalPegawai > 0 ? (totalJjm / totalPegawai).toFixed(1) : '0';

  const totalSiswa = siswaList.length;
  const siswaL = siswaList.filter((s) => s.jk === 'Laki-laki').length;
  const siswaP = siswaList.filter((s) => s.jk === 'Perempuan').length;
  const kelasX = siswaList.filter((s) => s.tingkatKelas.includes('X') && !s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII')).length;
  const kelasXI = siswaList.filter((s) => s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII')).length;
  const kelasXII = siswaList.filter((s) => s.tingkatKelas.includes('XII')).length;
  const fotoMerah = siswaList.filter((s) => s.fotoBgColor?.includes('Merah')).length;
  const fotoBiru = siswaList.filter((s) => s.fotoBgColor?.includes('Biru')).length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    if (selectedDoc === 'eksekutif') {
      const html = generateLaporanEksekutifHTML(pegawaiList, siswaList, kop, {
        nomorSurat,
        periode: periodeLaporan,
        tanggalCetak,
        namaKepalaSekolah,
        nipKepalaSekolah,
        namaOperator,
        nipOperator
      });
      downloadHTMLFile(`Laporan-Eksekutif-${kop.namaSekolah.replace(/\s+/g, '-')}.html`, html);
    } else if (selectedDoc === 'duk') {
      const html = generatePegawaiStandaloneHTML(pegawaiList, kop);
      downloadHTMLFile(`DUK-Kepegawaian-${kop.namaSekolah.replace(/\s+/g, '-')}.html`, html);
    } else if (selectedDoc === 'siswa') {
      const html = generateSiswaStandaloneHTML(siswaList, kop);
      downloadHTMLFile(`Buku-Induk-Siswa-${kop.namaSekolah.replace(/\s+/g, '-')}.html`, html);
    } else {
      const html = generateSiswaStandaloneHTML(siswaList, kop);
      downloadHTMLFile(`Format-Cetak-Kartu-${kop.namaSekolah.replace(/\s+/g, '-')}.html`, html);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header Banner (Screen Only) */}
      <div className="no-print bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Standar Format Pelaporan Kedinasan (A4/Folio)
            </span>
            <span className="text-xs text-slate-400">Siap Ditandatangani & Diarsipkan</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Pusat Cetak Dokumen & Pelaporan Resmi
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Format cetak ringkas, padat, dan jelas untuk pelaporan ke Dinas Pendidikan, Pengawas Sekolah, maupun Kepala Sekolah dengan KOP kedinasan resmi dan lembar pengesahan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-slate-400" />
            <span>Kustomisasi Surat</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHTML}
            className="btn-3d btn-3d-emerald text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
            title="Unduh berkas .html mandiri yang bisa dibuka & dicetak di mana saja"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File .html</span>
          </button>

          {onOpenGoogleDocs && (
            <button
              type="button"
              onClick={onOpenGoogleDocs}
              className="btn-3d btn-3d-indigo text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
              title="Buka atau buat laporan kedinasan resmi langsung di Google Docs"
            >
              <FileText className="w-4 h-4 text-indigo-200" />
              <span>Ekspor ke Google Docs</span>
            </button>
          )}

          {onOpenBackupRestore && (
            <button
              type="button"
              onClick={onOpenBackupRestore}
              className="btn-3d btn-3d-dark text-slate-100 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs border border-slate-700"
              title="Cadangkan seluruh database & KOP surat atau pulihkan dari file backup"
            >
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Backup & Restore</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="btn-3d btn-3d-blue text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md text-sm"
            title="Cetak langsung ke printer atau Simpan sebagai PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* Configuration Accordion (Screen Only) */}
      {showConfig && (
        <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-600" />
              Pengaturan Atribut & Tanda Tangan Dokumen Pelaporan
            </h3>
            <span className="text-xs text-slate-500">Perubahan langsung tercermin di lembar cetak</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor Surat / Dokumen</label>
              <input
                type="text"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Periode Laporan</label>
              <input
                type="text"
                value={periodeLaporan}
                onChange={(e) => setPeriodeLaporan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Titimangsa & Tanggal</label>
              <input
                type="text"
                value={tanggalCetak}
                onChange={(e) => setTanggalCetak(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={namaKepalaSekolah}
                onChange={(e) => setNamaKepalaSekolah(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={nipKepalaSekolah}
                onChange={(e) => setNipKepalaSekolah(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Pengelola / Operator</label>
              <input
                type="text"
                value={namaOperator}
                onChange={(e) => setNamaOperator(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Category Selector Tabs (Screen Only) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setSelectedDoc('eksekutif')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            selectedDoc === 'eksekutif'
              ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
              Paling Direkomendasikan
            </span>
          </div>
          <h3 className="font-black text-slate-900 text-sm">Laporan Eksekutif Terpadu</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Ringkasan 1 lembar statistik PTK, Siswa, dan Pengesahan resmi untuk Dinas / Pengawas.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDoc('duk')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedDoc === 'duk'
              ? 'bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-2 shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Daftar Urut Kepegawaian (DUK)</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Tabel nominatif lengkap {pegawaiList.length} guru & tenaga kependidikan (NIP, Gol, JJM).
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDoc('siswa')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedDoc === 'siswa'
              ? 'bg-purple-50/90 border-purple-600 shadow-md ring-2 ring-purple-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold mb-2 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Buku Induk Kesiswaan</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Tabel kesiswaan Dapodik lengkap {siswaList.length} siswa dengan verifikasi foto dinas.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDoc('kartu')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedDoc === 'kartu'
              ? 'bg-amber-50/90 border-amber-600 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold mb-2 shadow-xs">
            <IdCard className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Cetak Kartu Pelajar & KTA</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Lembar kisi kartu tanda pengenal berpas foto dinas siap dipotong / laminasi.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDoc('worksheet')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedDoc === 'worksheet'
              ? 'bg-teal-50/90 border-teal-600 shadow-md ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold mb-2 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Lembar Kerja Excel / CSV</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Worksheet interaktif, ekspor .xls terformat, CSV ber-BOM, & salin siap tempel.
          </p>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW SELECTION: WORKSHEET VIEW OR PRINTABLE DOCUMENT SHEET */}
      {/* ========================================================================= */}
      {selectedDoc === 'worksheet' ? (
        <ExcelWorksheetViewer
          pegawaiList={pegawaiList}
          siswaList={siswaList}
          kop={kop}
          onShowToast={onShowToast}
        />
      ) : (
      <div className="printable-document-container max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-300/80 p-8 sm:p-12 text-slate-900">
        {/* KOP SURAT DINAS RESMI */}
        <div className="border-b-[3px] border-b-black pb-3 mb-6 flex items-center justify-between text-center relative">
          <div className="w-20 shrink-0 flex items-center justify-center">
            {kop.logoKiri ? (
              <img src={kop.logoKiri} alt="Logo Dinas" className="w-18 h-18 object-contain" />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center font-bold text-xs">
                PEMPROV
              </div>
            )}
          </div>

          <div className="flex-1 px-4 text-black">
            <div className="font-serif font-bold text-sm tracking-wider uppercase">
              {kop.instansiAtas || 'PEMERINTAH PROVINSI JAWA TIMUR'}
            </div>
            <div className="font-serif font-extrabold text-base tracking-wide uppercase">
              {kop.dinas || 'DINAS PENDIDIKAN'}
            </div>
            <div className="font-serif font-bold text-xs tracking-wide uppercase text-slate-700">
              {kop.cabangDinas || 'CABANG DINAS PENDIDIKAN WILAYAH SURABAYA'}
            </div>
            <div className="font-serif font-black text-xl tracking-tight uppercase mt-0.5">
              {kop.namaSekolah}
            </div>
            <div className="font-sans text-[11px] text-slate-700 mt-0.5 leading-snug">
              {kop.alamatJalan}, {kop.kotaKabupaten} | NPSN: {kop.npsn} | Telp: {kop.telepon} | Email: {kop.email}
            </div>
          </div>

          <div className="w-20 shrink-0 flex items-center justify-center">
            {kop.logoKanan ? (
              <img src={kop.logoKanan} alt="Logo Sekolah" className="w-18 h-18 object-contain" />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-blue-900 flex items-center justify-center font-bold text-xs text-blue-900">
                SMAN
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: LAPORAN EKSEKUTIF RESMI (RINGKAS & JELAS) */}
        {/* ========================================================= */}
        {selectedDoc === 'eksekutif' && (
          <div className="space-y-5 font-serif">
            {/* Header Document Title */}
            <div className="text-center mb-5">
              <h1 className="font-serif font-extrabold text-base tracking-wide uppercase underline decoration-2">
                LAPORAN EKSEKUTIF BULANAN KEPEGAWAIAN & KESISWAAN
              </h1>
              <div className="font-sans text-xs text-slate-700 font-semibold mt-1">
                Nomor Dokumen: {nomorSurat}
              </div>
              <div className="font-sans text-xs text-slate-600 italic">
                Periode Laporan: {periodeLaporan}
              </div>
            </div>

            {/* Bagian I: Rekapitulasi Ketenagaan */}
            <div>
              <div className="font-sans font-bold text-xs uppercase bg-slate-100 text-slate-900 px-3 py-1.5 border-l-4 border-slate-900 mb-2 flex items-center justify-between">
                <span>I. Rekapitulasi Pendidik & Tenaga Kependidikan (PTK SIMPEG)</span>
                <span className="text-[11px] font-normal text-slate-600">Total Ketenagaan: {totalPegawai} Orang</span>
              </div>
              <table className="w-full text-xs border-collapse border border-slate-800 font-sans">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold">
                    <th className="p-2 border border-slate-700 text-left">Kategori Status Pegawai</th>
                    <th className="p-2 border border-slate-700 text-center">Jumlah Orang</th>
                    <th className="p-2 border border-slate-700 text-center">Sertifikasi Pendidik</th>
                    <th className="p-2 border border-slate-700 text-center">Total JJM Diampu</th>
                    <th className="p-2 border border-slate-700 text-center">Rata-rata Beban Jam</th>
                    <th className="p-2 border border-slate-700 text-center">Kualifikasi S1/S2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-400 font-bold">PNS (Pegawai Negeri Sipil)</td>
                    <td className="p-2 border border-slate-400 text-center font-bold">{pnsCount} Orang</td>
                    <td className="p-2 border border-slate-400 text-center">{pegawaiList.filter((p) => p.statusPegawai === 'PNS' && p.statusSertifikasi?.includes('Sudah')).length} Guru</td>
                    <td className="p-2 border border-slate-400 text-center">{pegawaiList.filter((p) => p.statusPegawai === 'PNS').reduce((a, b) => a + (b.jumlahJamMengajar || 0), 0)} Jam</td>
                    <td className="p-2 border border-slate-400 text-center font-mono">{pnsCount > 0 ? (pegawaiList.filter((p) => p.statusPegawai === 'PNS').reduce((a, b) => a + (b.jumlahJamMengajar || 0), 0) / pnsCount).toFixed(1) : 0} Jam/Minggu</td>
                    <td className="p-2 border border-slate-400 text-center">{pegawaiList.filter((p) => p.statusPegawai === 'PNS' && (p.pendidikan === 'S2' || p.pendidikan === 'S3')).length} S2 / {pegawaiList.filter((p) => p.statusPegawai === 'PNS' && p.pendidikan === 'S1/D4').length} S1</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-400 font-bold">PPPK (P3K)</td>
                    <td className="p-2 border border-slate-400 text-center font-bold">{pppkCount} Orang</td>
                    <td className="p-2 border border-slate-400 text-center">{pegawaiList.filter((p) => p.statusPegawai === 'PPPK' && p.statusSertifikasi?.includes('Sudah')).length} Guru</td>
                    <td className="p-2 border border-slate-400 text-center">{pegawaiList.filter((p) => p.statusPegawai === 'PPPK').reduce((a, b) => a + (b.jumlahJamMengajar || 0), 0)} Jam</td>
                    <td className="p-2 border border-slate-400 text-center font-mono">{pppkCount > 0 ? (pegawaiList.filter((p) => p.statusPegawai === 'PPPK').reduce((a, b) => a + (b.jumlahJamMengajar || 0), 0) / pppkCount).toFixed(1) : 0} Jam/Minggu</td>
                    <td className="p-2 border border-slate-400 text-center">{pegawaiList.filter((p) => p.statusPegawai === 'PPPK' && (p.pendidikan === 'S2' || p.pendidikan === 'S3')).length} S2 / {pegawaiList.filter((p) => p.statusPegawai === 'PPPK' && p.pendidikan === 'S1/D4').length} S1</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-400 font-bold">GTT & PTT (Non-ASN)</td>
                    <td className="p-2 border border-slate-400 text-center font-bold">{gttCount + pttCount} Orang</td>
                    <td className="p-2 border border-slate-400 text-center">{pegawaiList.filter((p) => (p.statusPegawai.includes('GTT') || p.statusPegawai.includes('PTT')) && p.statusSertifikasi?.includes('Sudah')).length} Guru</td>
                    <td className="p-2 border border-slate-400 text-center">{pegawaiList.filter((p) => p.statusPegawai.includes('GTT') || p.statusPegawai.includes('PTT')).reduce((a, b) => a + (b.jumlahJamMengajar || 0), 0)} Jam</td>
                    <td className="p-2 border border-slate-400 text-center font-mono">-</td>
                    <td className="p-2 border border-slate-400 text-center">{pegawaiList.filter((p) => (p.statusPegawai.includes('GTT') || p.statusPegawai.includes('PTT')) && p.pendidikan === 'S1/D4').length} S1</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold">
                    <td className="p-2 border border-slate-700 text-center uppercase">Total Ketenagaan</td>
                    <td className="p-2 border border-slate-700 text-center font-black text-sm">{totalPegawai} Orang</td>
                    <td className="p-2 border border-slate-700 text-center">{certifiedCount} Guru ({totalPegawai > 0 ? Math.round((certifiedCount / totalPegawai) * 100) : 0}%)</td>
                    <td className="p-2 border border-slate-700 text-center">{totalJjm} Jam</td>
                    <td className="p-2 border border-slate-700 text-center font-mono">{avgJjm} Jam/Guru</td>
                    <td className="p-2 border border-slate-700 text-center text-emerald-800">100% Memenuhi Standar</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian II: Rekapitulasi Peserta Didik */}
            <div>
              <div className="font-sans font-bold text-xs uppercase bg-slate-100 text-slate-900 px-3 py-1.5 border-l-4 border-slate-900 mb-2 flex items-center justify-between">
                <span>II. Rekapitulasi Peserta Didik (Dapodik Kesiswaan)</span>
                <span className="text-[11px] font-normal text-slate-600">Total Siswa: {totalSiswa} Orang</span>
              </div>
              <table className="w-full text-xs border-collapse border border-slate-800 font-sans">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold">
                    <th className="p-2 border border-slate-700 text-left">Tingkat Kelas</th>
                    <th className="p-2 border border-slate-700 text-center">Jumlah Rombel</th>
                    <th className="p-2 border border-slate-700 text-center">Laki-laki (L)</th>
                    <th className="p-2 border border-slate-700 text-center">Perempuan (P)</th>
                    <th className="p-2 border border-slate-700 text-center">Total Siswa</th>
                    <th className="p-2 border border-slate-700 text-center">Kepatuhan Foto Dinas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-400 font-bold">Kelas X (Fase E)</td>
                    <td className="p-2 border border-slate-400 text-center font-bold">6 Rombel</td>
                    <td className="p-2 border border-slate-400 text-center">{siswaList.filter((s) => s.tingkatKelas.includes('X') && !s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII') && s.jk === 'Laki-laki').length} Siswa</td>
                    <td className="p-2 border border-slate-400 text-center">{siswaList.filter((s) => s.tingkatKelas.includes('X') && !s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII') && s.jk === 'Perempuan').length} Siswi</td>
                    <td className="p-2 border border-slate-400 text-center font-bold">{kelasX} Orang</td>
                    <td className="p-2 border border-slate-400 text-center text-emerald-700 font-bold">Latar Merah/Biru Valid</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-400 font-bold">Kelas XI (Fase F)</td>
                    <td className="p-2 border border-slate-400 text-center font-bold">6 Rombel</td>
                    <td className="p-2 border border-slate-400 text-center">{siswaList.filter((s) => s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII') && s.jk === 'Laki-laki').length} Siswa</td>
                    <td className="p-2 border border-slate-400 text-center">{siswaList.filter((s) => s.tingkatKelas.includes('XI') && !s.tingkatKelas.includes('XII') && s.jk === 'Perempuan').length} Siswi</td>
                    <td className="p-2 border border-slate-400 text-center font-bold">{kelasXI} Orang</td>
                    <td className="p-2 border border-slate-400 text-center text-emerald-700 font-bold">Latar Merah/Biru Valid</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-400 font-bold">Kelas XII (Fase F)</td>
                    <td className="p-2 border border-slate-400 text-center font-bold">6 Rombel</td>
                    <td className="p-2 border border-slate-400 text-center">{siswaList.filter((s) => s.tingkatKelas.includes('XII') && s.jk === 'Laki-laki').length} Siswa</td>
                    <td className="p-2 border border-slate-400 text-center">{siswaList.filter((s) => s.tingkatKelas.includes('XII') && s.jk === 'Perempuan').length} Siswi</td>
                    <td className="p-2 border border-slate-400 text-center font-bold">{kelasXII} Orang</td>
                    <td className="p-2 border border-slate-400 text-center text-emerald-700 font-bold">Latar Merah/Biru Valid</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold">
                    <td className="p-2 border border-slate-700 text-center uppercase">Total Peserta Didik</td>
                    <td className="p-2 border border-slate-700 text-center">18 Rombel</td>
                    <td className="p-2 border border-slate-700 text-center">{siswaL} Siswa</td>
                    <td className="p-2 border border-slate-700 text-center">{siswaP} Siswi</td>
                    <td className="p-2 border border-slate-700 text-center font-black text-sm">{totalSiswa} Orang</td>
                    <td className="p-2 border border-slate-700 text-center">100% Sesuai Aturan Dinas</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian III: Daftar Nominatif Ringkas Pegawai Utama */}
            <div>
              <div className="font-sans font-bold text-xs uppercase bg-slate-100 text-slate-900 px-3 py-1.5 border-l-4 border-slate-900 mb-2 flex items-center justify-between">
                <span>III. Sampel Nominatif Pegawai & Guru Pengampu</span>
                <span className="text-[11px] font-normal text-slate-600">Menampilkan 6 dari {totalPegawai} PTK</span>
              </div>
              <table className="w-full text-[11px] border-collapse border border-slate-800 font-sans">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold">
                    <th className="p-1.5 border border-slate-700 text-center w-8">No</th>
                    <th className="p-1.5 border border-slate-700 text-left">Nama Lengkap & Gelar</th>
                    <th className="p-1.5 border border-slate-700 text-center">NIP / NUPTK</th>
                    <th className="p-1.5 border border-slate-700 text-center">Gol</th>
                    <th className="p-1.5 border border-slate-700 text-left">Tugas / Mapel</th>
                    <th className="p-1.5 border border-slate-700 text-center">JJM</th>
                    <th className="p-1.5 border border-slate-700 text-center">Sertifikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {pegawaiList.slice(0, 6).map((p, idx) => (
                    <tr key={p.id} className="border-b border-slate-300">
                      <td className="p-1.5 border border-slate-400 text-center">{idx + 1}</td>
                      <td className="p-1.5 border border-slate-400 font-bold">{p.nama}</td>
                      <td className="p-1.5 border border-slate-400 text-center font-mono">{p.nip || p.nuptk || '-'}</td>
                      <td className="p-1.5 border border-slate-400 text-center font-semibold">{p.golongan || p.statusPegawai}</td>
                      <td className="p-1.5 border border-slate-400">{p.mapel || p.jenisPtk}</td>
                      <td className="p-1.5 border border-slate-400 text-center font-mono">{p.jumlahJamMengajar ?? 0} Jam</td>
                      <td className="p-1.5 border border-slate-400 text-center">{p.statusSertifikasi?.includes('Sudah') ? 'Lulus' : 'Belum'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="font-sans text-[10px] text-slate-500 mt-1 italic text-right">
                * Data lengkap seluruh {totalPegawai} PTK dan {totalSiswa} Siswa terverifikasi pada SIMPEG Online {kop.namaSekolah}.
              </div>
            </div>

            {/* LEMBAR PENGESAHAN & TANDA TANGAN */}
            <div className="pt-6 print-avoid-break flex items-start justify-between text-xs font-serif leading-relaxed">
              <div className="w-56 text-center">
                <div>Mengetahui,</div>
                <div className="font-bold">Kepala {kop.namaSekolah}</div>
                <div className="h-20 flex items-center justify-center text-slate-400 italic text-[11px]">
                  ( Tanda Tangan & Stempel )
                </div>
                <div className="font-bold underline text-sm">{namaKepalaSekolah}</div>
                <div className="font-mono text-[11px]">NIP. {nipKepalaSekolah}</div>
              </div>

              <div className="w-56 text-center">
                <div>{kop.kotaKabupaten || 'Surabaya'}, {tanggalCetak}</div>
                <div className="font-bold">Pengelola SIMPEG & Kesiswaan</div>
                <div className="h-20 flex items-center justify-center text-slate-400 italic text-[11px]">
                  ( Tanda Tangan )
                </div>
                <div className="font-bold underline text-sm">{namaOperator}</div>
                <div className="font-mono text-[11px]">NIP. {nipOperator}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: DAFTAR URUT KEPEGAWAIAN (DUK SIMPEG) */}
        {/* ========================================================= */}
        {selectedDoc === 'duk' && (
          <div className="space-y-4 font-sans text-xs">
            <div className="text-center mb-4">
              <h1 className="font-serif font-bold text-base uppercase underline">
                DAFTAR URUT KEPEGAWAIAN (DUK) GURU & TENAGA KEPENDIDIKAN
              </h1>
              <div className="text-slate-600 text-xs mt-0.5">
                Berdasarkan Pangkat, Golongan Ruang, dan Masa Kerja Pegawai
              </div>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[11px]">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold">
                  <th className="p-2 border border-slate-700 text-center w-8">No</th>
                  <th className="p-2 border border-slate-700 text-left">Nama Lengkap & Gelar</th>
                  <th className="p-2 border border-slate-700 text-center">NIP / Karpeg</th>
                  <th className="p-2 border border-slate-700 text-center">Status</th>
                  <th className="p-2 border border-slate-700 text-center">Gol/Ruang</th>
                  <th className="p-2 border border-slate-700 text-left">Jabatan / Mata Pelajaran</th>
                  <th className="p-2 border border-slate-700 text-center">JJM</th>
                  <th className="p-2 border border-slate-700 text-center">Pendidikan</th>
                  <th className="p-2 border border-slate-700 text-center">Sertifikasi</th>
                </tr>
              </thead>
              <tbody>
                {pegawaiList.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-300">
                    <td className="p-1.5 border border-slate-400 text-center font-mono">{idx + 1}</td>
                    <td className="p-1.5 border border-slate-400 font-bold text-slate-900">{p.nama}</td>
                    <td className="p-1.5 border border-slate-400 text-center font-mono text-[10px]">{p.nip || '-'}</td>
                    <td className="p-1.5 border border-slate-400 text-center">{p.statusPegawai}</td>
                    <td className="p-1.5 border border-slate-400 text-center font-bold">{p.golongan || '-'}</td>
                    <td className="p-1.5 border border-slate-400">{p.mapel || p.jenisPtk}</td>
                    <td className="p-1.5 border border-slate-400 text-center font-bold">{p.jumlahJamMengajar ?? 0} Jam</td>
                    <td className="p-1.5 border border-slate-400 text-center">{p.pendidikan}</td>
                    <td className="p-1.5 border border-slate-400 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        p.statusSertifikasi?.includes('Sudah') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.statusSertifikasi?.includes('Sudah') ? 'Sudah' : 'Belum'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Block */}
            <div className="pt-8 print-avoid-break flex items-start justify-between text-xs font-serif">
              <div className="w-56 text-center">
                <div>Mengetahui,</div>
                <div className="font-bold">Kepala {kop.namaSekolah}</div>
                <div className="h-16"></div>
                <div className="font-bold underline">{namaKepalaSekolah}</div>
                <div className="font-mono text-[11px]">NIP. {nipKepalaSekolah}</div>
              </div>
              <div className="w-56 text-center">
                <div>{kop.kotaKabupaten || 'Surabaya'}, {tanggalCetak}</div>
                <div className="font-bold">Kepala Urusan Tata Usaha</div>
                <div className="h-16"></div>
                <div className="font-bold underline">{namaOperator}</div>
                <div className="font-mono text-[11px]">NIP. {nipOperator}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: BUKU INDUK KESISWAAN (DAPODIK) */}
        {/* ========================================================= */}
        {selectedDoc === 'siswa' && (
          <div className="space-y-4 font-sans text-xs">
            <div className="text-center mb-4">
              <h1 className="font-serif font-bold text-base uppercase underline">
                BUKU INDUK PESERTA DIDIK (DAPODIK KESISWAAN)
              </h1>
              <div className="text-slate-600 text-xs mt-0.5">
                Daftar Lengkap Peserta Didik dengan Verifikasi Warna Pas Foto Kedinasan
              </div>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[11px]">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold">
                  <th className="p-2 border border-slate-700 text-center w-8">No</th>
                  <th className="p-2 border border-slate-700 text-center">NISN</th>
                  <th className="p-2 border border-slate-700 text-left">Nama Siswa</th>
                  <th className="p-2 border border-slate-700 text-center">JK</th>
                  <th className="p-2 border border-slate-700 text-center">Kelas</th>
                  <th className="p-2 border border-slate-700 text-left">Peminatan</th>
                  <th className="p-2 border border-slate-700 text-left">Tempat, Tgl Lahir</th>
                  <th className="p-2 border border-slate-700 text-center">Latar Pas Foto</th>
                  <th className="p-2 border border-slate-700 text-left">Wali Kelas</th>
                </tr>
              </thead>
              <tbody>
                {siswaList.map((s, idx) => {
                  const isRed = s.fotoBgColor?.includes('Merah');
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 border-b border-slate-300">
                      <td className="p-1.5 border border-slate-400 text-center font-mono">{idx + 1}</td>
                      <td className="p-1.5 border border-slate-400 text-center font-mono font-bold text-blue-900">{s.nisn}</td>
                      <td className="p-1.5 border border-slate-400 font-bold text-slate-900">{s.nama}</td>
                      <td className="p-1.5 border border-slate-400 text-center">{s.jk === 'Laki-laki' ? 'L' : 'P'}</td>
                      <td className="p-1.5 border border-slate-400 text-center font-semibold">{s.tingkatKelas} ({s.rombel})</td>
                      <td className="p-1.5 border border-slate-400">{s.peminatan}</td>
                      <td className="p-1.5 border border-slate-400">{s.tempatLahir}, {s.tanggalLahir}</td>
                      <td className="p-1.5 border border-slate-400 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                          isRed ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                          {isRed ? 'Merah (Ganjil)' : 'Biru (Genap)'}
                        </span>
                      </td>
                      <td className="p-1.5 border border-slate-400">{s.waliKelas}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Signature Block */}
            <div className="pt-8 print-avoid-break flex items-start justify-between text-xs font-serif">
              <div className="w-56 text-center">
                <div>Mengetahui,</div>
                <div className="font-bold">Kepala {kop.namaSekolah}</div>
                <div className="h-16"></div>
                <div className="font-bold underline">{namaKepalaSekolah}</div>
                <div className="font-mono text-[11px]">NIP. {nipKepalaSekolah}</div>
              </div>
              <div className="w-56 text-center">
                <div>{kop.kotaKabupaten || 'Surabaya'}, {tanggalCetak}</div>
                <div className="font-bold">Wakil Kepala Sekolah Bidang Kesiswaan</div>
                <div className="h-16"></div>
                <div className="font-bold underline">{namaOperator}</div>
                <div className="font-mono text-[11px]">NIP. {nipOperator}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: CETAK KARTU PELAJAR & KTA PEGAWAI (KISI CETAK) */}
        {/* ========================================================= */}
        {selectedDoc === 'kartu' && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h1 className="font-serif font-bold text-base uppercase underline">
                LEMBAR CETAK KARTU PELAJAR DIGITAL (UKURAN ID-1)
              </h1>
              <div className="text-slate-600 text-xs mt-0.5 font-sans">
                Siap dicetak pada kertas foto / karton tebal dan dilaminasi
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siswaList.slice(0, 6).map((s) => {
                const isRed = s.fotoBgColor?.includes('Merah');
                return (
                  <div
                    key={s.id}
                    className="border-2 border-slate-700 rounded-xl overflow-hidden bg-white shadow-xs p-3.5 flex flex-col justify-between h-48 print-avoid-break"
                  >
                    {/* Header Kartu */}
                    <div className="border-b border-slate-300 pb-1.5 flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-[9px] font-bold uppercase text-slate-600 tracking-wider">KARTU PELAJAR DIGITAL</div>
                        <div className="text-xs font-black text-slate-900 uppercase leading-tight">{kop.namaSekolah}</div>
                      </div>
                      <span className="text-[9px] font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-bold">
                        NPSN: {kop.npsn}
                      </span>
                    </div>

                    {/* Konten Kartu */}
                    <div className="flex items-center gap-3 my-auto">
                      {s.foto ? (
                        <img
                          src={s.foto}
                          alt={s.nama}
                          className="w-16 h-20 object-cover rounded border border-slate-400 shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-16 h-20 rounded flex items-center justify-center font-bold text-white text-xs shrink-0 ${
                            isRed ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                        >
                          {s.jk === 'Laki-laki' ? 'SISWA' : 'SISWI'}
                        </div>
                      )}

                      <div className="text-xs text-slate-800 space-y-0.5">
                        <div className="font-bold text-slate-900 text-sm">{s.nama}</div>
                        <div className="font-mono text-blue-700 font-bold">NISN: {s.nisn}</div>
                        <div className="text-slate-600">Kelas: {s.tingkatKelas} ({s.rombel})</div>
                        <div className="text-slate-500 text-[10px]">{s.tempatLahir}, {s.tanggalLahir}</div>
                      </div>
                    </div>

                    {/* Footer Kartu */}
                    <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[9px] text-slate-500">
                      <span>Berlaku Selama Menjadi Siswa Aktif</span>
                      <span className="font-bold text-slate-700">Kepala Sekolah</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Dokumen Digital (Screen & Print) */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-sans">
          <span>Dicetak melalui SIMPEG & Kesiswaan Terpadu • {kop.namaSekolah}</span>
          <span className="font-mono">Dokumen Sah Digital Kedinasan</span>
        </div>
      </div>
      )}
    </div>
  );
};
