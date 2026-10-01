import React, { useState } from 'react';
import {
  Globe,
  Copy,
  Check,
  FileCode,
  Download,
  ExternalLink,
  Printer,
  Sparkles,
  Layers,
  GraduationCap,
  Users
} from 'lucide-react';
import { Siswa, Pegawai, KopSekolah } from '../types';
import {
  generateSiswaStandaloneHTML,
  generatePegawaiStandaloneHTML,
  downloadHTMLFile
} from '../utils/htmlExporter';

interface HtmlAddressBarProps {
  activeModule: 'pegawai' | 'siswa' | 'cetak';
  onNavigate: (page: 'pegawai' | 'siswa' | 'cetak') => void;
  siswaList: Siswa[];
  pegawaiList: Pegawai[];
  kop: KopSekolah;
  onOpenWebAddressModal?: () => void;
}

export const HtmlAddressBar: React.FC<HtmlAddressBarProps> = ({
  activeModule,
  onNavigate,
  siswaList,
  pegawaiList,
  kop,
  onOpenWebAddressModal
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Derive current baseUrl (fallback to public canonical if on dev/localhost)
  const defaultPublicBase = 'https://ais-pre-tftziqlbcz2tjreqoa56ut-302703941788.asia-southeast1.run.app';
  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : defaultPublicBase;

  const currentPath = activeModule === 'siswa' ? '/siswa.html' : activeModule === 'cetak' ? '/cetak.html' : '/index.html';
  const fullAddress = `${currentOrigin}${currentPath}`;

  const shortUrls: Record<string, string> = {
    '/index.html': 'https://tinyurl.com/254n3d2p',
    '/siswa.html': 'https://tinyurl.com/2444tpds',
    '/pegawai.html': 'https://tinyurl.com/25caxeld',
    '/cetak.html': 'https://tinyurl.com/29eyst4m',
  };
  const activeShortUrl = shortUrls[currentPath] || 'https://tinyurl.com/254n3d2p';

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(textToCopy);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDownloadSiswaHTML = () => {
    const html = generateSiswaStandaloneHTML(siswaList, kop);
    downloadHTMLFile(`Buku-Induk-Siswa-${kop.namaSekolah.replace(/\s+/g, '-')}.html`, html);
    setShowExportMenu(false);
  };

  const handleDownloadPegawaiHTML = () => {
    const html = generatePegawaiStandaloneHTML(pegawaiList, kop);
    downloadHTMLFile(`Data-SIMPEG-Pegawai-${kop.namaSekolah.replace(/\s+/g, '-')}.html`, html);
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mb-5">
      {/* Top Address Ribbon */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <span className="text-slate-400 font-medium">Alamat Web:</span>
          <div className="bg-slate-800/90 px-3 py-1 rounded-lg font-mono text-emerald-400 font-semibold border border-slate-700 truncate max-w-md shadow-inner flex items-center gap-2">
            <span className="text-slate-400">{currentOrigin}</span>
            <span className="text-emerald-300 font-bold underline decoration-emerald-500">{currentPath}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/70 rounded-lg px-2.5 py-1 text-[11px]">
            <span className="text-blue-300 font-medium">Link Pendek:</span>
            <span className="font-mono text-blue-200 font-bold">{activeShortUrl}</span>
            <button
              type="button"
              onClick={() => handleCopy(activeShortUrl)}
              className="ml-1 text-blue-400 hover:text-white cursor-pointer"
              title="Salin Link Pendek"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={fullAddress}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-all"
            title="Buka Halaman Web Bersih di Tab Baru (Menggunakan Origin Aktif)"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Buka Web Bersih</span>
          </a>
          {onOpenWebAddressModal && (
            <button
              type="button"
              onClick={onOpenWebAddressModal}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Lihat Semua Alamat Web (.html) & Tautan Publik"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Daftar Alamat Web (.html)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleCopy(currentPath)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Salin Alamat URL Halaman Ini"
          >
            {copiedLink === currentPath ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Salin URL Web</span>
              </>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Unduh halaman web standalone (.html) yang dapat dibuka di browser mana pun secara offline"
            >
              <Download className="w-3 h-3" />
              <span>Unduh File Web (.html)</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-slate-800 text-xs animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pilih Halaman Web (.html):
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSiswaHTML}
                  className="w-full text-left px-2.5 py-2 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2 transition cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold">Buku Induk Siswa.html</div>
                    <div className="text-[10px] text-slate-400">Bisa dibuka offline di browser</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPegawaiHTML}
                  className="w-full text-left px-2.5 py-2 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg flex items-center gap-2 transition cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold">Data SIMPEG Pegawai.html</div>
                    <div className="text-[10px] text-slate-400">Bisa dibuka offline di browser</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar with HTML Extensions */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Halaman:
          </span>

          {/* 1. index.html */}
          <button
            type="button"
            onClick={() => onNavigate('pegawai')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeModule === 'pegawai'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>index.html</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              activeModule === 'pegawai' ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-500'
            }`}>
              Pegawai ({pegawaiList.length})
            </span>
          </button>

          {/* 2. siswa.html */}
          <button
            type="button"
            onClick={() => onNavigate('siswa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeModule === 'siswa'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>siswa.html</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              activeModule === 'siswa' ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-500'
            }`}>
              Siswa ({siswaList.length})
            </span>
          </button>

          {/* 3. cetak.html */}
          <button
            type="button"
            onClick={() => onNavigate('cetak')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeModule === 'cetak'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>cetak.html</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded-md">
              Cetak Dokumen
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Format HTML Standar Web W3C</span>
        </div>
      </div>
    </div>
  );
};
