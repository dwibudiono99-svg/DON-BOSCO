import React, { useState } from "react";
import { KopSekolah } from "../types";
import {
  Building2,
  Edit3,
  Printer,
  ChevronDown,
  ChevronUp,
  Globe,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface KopSekolahBannerProps {
  kop: KopSekolah;
  onOpenEditKop: () => void;
  totalPegawai?: number;
}

export const KopSekolahBanner: React.FC<KopSekolahBannerProps> = ({
  kop,
  onOpenEditKop,
  totalPegawai,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="kop-sekolah-container"
      className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 print:border-none print:shadow-none print:m-0 print:p-0"
    >
      {/* Top Utility Ribbon (Hidden when printing) */}
      <div className="bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-1.5 font-bold tracking-wide text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>KOP RESMI SIMPEG SMAN</span>
          </div>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            • Standar Surat & Administrasi Kepegawaian SMA
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenEditKop}
            className="btn-3d btn-3d-blue text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
            title="Ubah Rincian Nama Sekolah, Alamat Lengkap & Ganti Logo KOP"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-100" />
            <span>Edit Rincian & Logo KOP</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-3d btn-3d-dark text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
            title="Cetak KOP / Lembar Rekap Kepegawaian"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white transition"
            title={
              isExpanded
                ? "Sembunyikan detail KOP"
                : "Tampilkan detail KOP lengkap"
            }
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Official Indonesian School Letterhead Presentation */}
      <div
        className={`p-4 sm:p-6 transition-all duration-200 ${isExpanded ? "block" : "hidden print:block"}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Logo Kiri (Tut Wuri Handayani / PEMPROV) */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center p-1 bg-slate-50 border border-slate-100 rounded-xl">
            {kop.logoKiri ? (
              <img
                src={kop.logoKiri}
                alt="Logo KOP Kiri"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-blue-900 text-amber-300 font-black text-xs rounded-lg flex items-center justify-center text-center p-1">
                LOGO PEMPROV
              </div>
            )}
          </div>

          {/* Center Content: Hierarchy of Indonesian School Administration */}
          <div className="flex-1 min-w-0 text-center px-1 sm:px-4">
            {kop.instansiAtas && (
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 font-serif leading-tight">
                {kop.instansiAtas}
              </h3>
            )}
            {kop.dinas && (
              <h4 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 font-serif leading-tight mt-0.5">
                {kop.dinas}
              </h4>
            )}
            {kop.cabangDinas && (
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-normal text-slate-600 font-serif mt-0.5">
                {kop.cabangDinas}
              </p>
            )}

            {/* School Big Title */}
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-blue-950 font-serif mt-1 sm:mt-1.5 leading-snug">
              {kop.namaSekolah}
            </h2>

            {/* Accreditation & NPSN */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-600 mt-1">
              {kop.statusAkreditasi && (
                <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.2 rounded-full font-bold">
                  {kop.statusAkreditasi}
                </span>
              )}
              {kop.npsn && (
                <span className="font-mono text-slate-700">
                  NPSN: <strong className="text-slate-900">{kop.npsn}</strong>
                </span>
              )}
              {kop.nss && (
                <span className="font-mono text-slate-500">NSS: {kop.nss}</span>
              )}
            </div>

            {/* Address & Geographical Coordinates */}
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
              <span className="font-medium">{kop.alamatJalan}</span>
              {kop.kelurahanDesa && `, ${kop.kelurahanDesa}`}
              {kop.kecamatan && `, ${kop.kecamatan}`}
              {kop.kotaKabupaten && `, ${kop.kotaKabupaten}`}
              {kop.provinsi && `, ${kop.provinsi}`}
              {kop.kodePos && ` - Kode Pos: ${kop.kodePos}`}
            </p>

            {/* Contact Details: Phone, Fax, Email, Website */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
              {kop.telepon && (
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="w-3 h-3 text-slate-400" />
                  Telp: {kop.telepon}
                </span>
              )}
              {kop.faks && <span>Fax: {kop.faks}</span>}
              {kop.email && (
                <span className="flex items-center gap-1 font-medium text-blue-700">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {kop.email}
                </span>
              )}
              {kop.website && (
                <span className="flex items-center gap-1 font-medium text-blue-700">
                  <Globe className="w-3 h-3 text-slate-400" />
                  {kop.website}
                </span>
              )}
            </div>
          </div>

          {/* Logo Kanan (Logo Sekolah SMAN) */}
          {kop.tampilkanLogoKanan && (
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center p-1 bg-slate-50 border border-slate-100 rounded-xl">
              {kop.logoKanan ? (
                <img
                  src={kop.logoKanan}
                  alt="Logo Sekolah Kanan"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 text-amber-300 font-black text-xs rounded-lg flex items-center justify-center text-center p-1">
                  LOGO SMAN
                </div>
              )}
            </div>
          )}
        </div>

        {/* The Classic Indonesian Official Double Line (Garis KOP Surat Tebal + Tipis) */}
        <div className="mt-4 pt-1">
          <div className="h-[3px] bg-slate-900 w-full mb-[2px]"></div>
          <div className="h-[1px] bg-slate-900 w-full"></div>
        </div>
      </div>

      {/* Compact summary bar when collapsed */}
      {!isExpanded && (
        <div className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 bg-slate-50/70">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span>{kop.namaSekolah}</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500 font-normal text-[11px] truncate max-w-sm">
              {kop.alamatJalan}, {kop.kotaKabupaten}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1"
          >
            <span>Tampilkan KOP Lengkap</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
