import React, { useState } from 'react';
import {
  X,
  Globe,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  FileCode,
  Download,
  GraduationCap,
  Users,
  Printer,
  Sparkles,
  Share2,
  Zap,
  Info,
  Smartphone
} from 'lucide-react';
import { Siswa, Pegawai, KopSekolah } from '../types';
import {
  generateSiswaStandaloneHTML,
  generatePegawaiStandaloneHTML,
  downloadHTMLFile
} from '../utils/htmlExporter';

interface WebAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswaList: Siswa[];
  pegawaiList: Pegawai[];
  kop: KopSekolah;
}

export const WebAddressModal: React.FC<WebAddressModalProps> = ({
  isOpen,
  onClose,
  siswaList,
  pegawaiList,
  kop
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedQr, setSelectedQr] = useState<string | null>(null);

  if (!isOpen) return null;

  // The permanent canonical public URL for this application
  const defaultPublicBase = 'https://ais-pre-tftziqlbcz2tjreqoa56ut-302703941788.asia-southeast1.run.app';
  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : defaultPublicBase;

  const pages = [
    {
      id: 'index',
      name: 'Beranda & SIMPEG Guru Utama',
      filename: 'index.html',
      shortUrl: 'https://tinyurl.com/254n3d2p',
      fullUrl: `${currentOrigin}/index.html`,
      desc: 'Halaman dashboard utama, data PTK ASN/PPPK/GTT/PTT, jam mengajar (JJM), dan data keluarga.',
      icon: Users,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'siswa',
      name: 'Buku Induk Siswa (Dapodik)',
      filename: 'siswa.html',
      shortUrl: 'https://tinyurl.com/2444tpds',
      fullUrl: `${currentOrigin}/siswa.html`,
      desc: 'Halaman data kesiswaan lengkap dengan verifikasi aturan warna pas foto dinas (merah/biru).',
      icon: GraduationCap,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      id: 'pegawai',
      name: 'Daftar Urut Kepegawaian (DUK)',
      filename: 'pegawai.html',
      shortUrl: 'https://tinyurl.com/25caxeld',
      fullUrl: `${currentOrigin}/pegawai.html`,
      desc: 'Daftar urut kepangkatan, NIP, NUPTK, sertifikasi pendidik, dan arsip berkas PTK.',
      icon: FileCode,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      id: 'cetak',
      name: 'Pusat Cetak Dokumen & Kartu',
      filename: 'cetak.html',
      shortUrl: 'https://tinyurl.com/29eyst4m',
      fullUrl: `${currentOrigin}/cetak.html`,
      desc: 'Format cetak resmi A4/Folio untuk Kartu Pelajar, KTA Pegawai, dan Buku Induk.',
      icon: Printer,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }
  ];

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDownloadSiswaHTML = () => {
    const html = generateSiswaStandaloneHTML(siswaList, kop);
    downloadHTMLFile(`Buku-Induk-Siswa-${kop.namaSekolah.replace(/\s+/g, '-')}.html`, html);
  };

  const handleDownloadPegawaiHTML = () => {
    const html = generatePegawaiStandaloneHTML(pegawaiList, kop);
    downloadHTMLFile(`Data-SIMPEG-Pegawai-${kop.namaSekolah.replace(/\s+/g, '-')}.html`, html);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Alamat Web Resmi Sederhana (.html)
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Online & Aktif
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Tautan langsung yang mudah diingat, dapat dibagikan, dan dibuka di browser HP/Laptop
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* AI Studio Explanation & Troubleshooting Callout */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="font-bold text-sm text-amber-950 flex items-center justify-between">
                <span>Catatan Penting Keamanan Akses Web (Google Cloud)</span>
                <span className="text-[10px] bg-amber-200/60 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  Panduan Akses
                </span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                Tautan <code>ais-pre-...run.app</code> diproteksi oleh sistem keamanan Google AI Studio. Jika saat dibuka muncul layar <em>"Action required to load your app"</em> atau <em>"Cookie check"</em>, silakan:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-amber-800">
                <li>
                  <strong>Klik tombol biru &quot;Authenticate in new window&quot;</strong> yang muncul di layar tersebut untuk mengizinkan cookie keamanan Google.
                </li>
                <li>
                  Atau buka langsung melalui link resmi AI Studio: <strong><a href="https://aistudio.google.com/apps/668038c5-8c08-4f19-b1fc-327d2cfefa4c?showPreview=true" target="_blank" rel="noreferrer" className="underline font-bold text-blue-700">Buka AI Studio Preview</a></strong> lalu klik tombol <em>&quot;Open in new tab&quot;</em> di kanan atas.
                </li>
                <li>
                  Atau <strong>Unduh Berkas HTML Mandiri</strong> di bawah ini yang 100% bisa dibuka offline di komputer mana saja tanpa perlu login Google.
                </li>
              </ul>
            </div>
          </div>

          {/* Super Simple Short Links Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Pilihan Alamat Web Paling Sederhana & Pendek:
              </span>
              <span className="text-[11px] text-slate-500">Bisa langsung diklik atau dibagikan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="bg-slate-50 border border-slate-200/90 hover:border-blue-400 rounded-2xl p-3.5 transition-all hover:shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-slate-900 text-xs truncate">{page.name}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${page.badgeColor}`}>
                        /{page.filename}
                      </span>
                    </div>
                    {/* Short Link Box */}
                    <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-blue-700 truncate select-all">
                        {page.shortUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(page.shortUrl)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Salin Link Pendek"
                      >
                        {copiedUrl === page.shortUrl ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedUrl === page.shortUrl ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setSelectedQr(selectedQr === page.shortUrl ? null : page.shortUrl)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>Lihat QR</span>
                    </button>

                    <a
                      href={page.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <span>Buka Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Viewer Modal Area */}
          {selectedQr && (
            <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                <Smartphone className="w-4 h-4" />
                <span>Scan QR Code Ini Dengan Kamera HP / WhatsApp:</span>
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-lg inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedQr)}`}
                  alt="QR Code Link Sederhana"
                  className="w-40 h-40"
                />
              </div>
              <div className="font-mono text-xs text-slate-300 font-bold mt-2.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                {selectedQr}
              </div>
              <button
                type="button"
                onClick={() => setSelectedQr(null)}
                className="mt-3 text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Tutup QR Code
              </button>
            </div>
          )}

          {/* Direct Canonical Full URL Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Alamat Web Canonical Lengkap (Server Cloud Run):
              </div>
              <div className="font-mono text-xs font-bold text-slate-700 break-all select-all mt-0.5">
                {currentOrigin}/index.html
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(`${currentOrigin}/index.html`)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedUrl === `${currentOrigin}/index.html` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin URL</span>
                  </>
                )}
              </button>
              <a
                href={`${currentOrigin}/index.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <span>Buka Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Offline HTML Bundle Section */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-xs sm:text-sm">
                  Unduh Berkas Web Mandiri (.html)
                </h3>
                <p className="text-[11px] text-emerald-700">
                  Dapat disimpan di flashdisk/laptop dan dibuka tanpa koneksi internet (cukup klik 2x).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadSiswaHTML}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Unduh Siswa.html
              </button>
              <button
                type="button"
                onClick={handleDownloadPegawaiHTML}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Unduh Pegawai.html
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {kop.namaSekolah} • Sistem Informasi Kepegawaian & Kesiswaan Resmi
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
