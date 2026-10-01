import React from 'react';
import { Pegawai } from '../types';
import { Users, GraduationCap, Briefcase, Award, ShieldAlert, BookOpen, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { detectRumpunMapel } from '../data/smaMapelData';

interface StatCardsProps {
  pegawaiList: Pegawai[];
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
  onOpenRincianMapel?: () => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  pegawaiList,
  selectedFilter,
  onFilterSelect,
  onOpenRincianMapel
}) => {
  const total = pegawaiList.length;

  const guruList = pegawaiList.filter(
    (p) =>
      p.jenisPtk.includes('Guru') ||
      p.jenisPtk.includes('Kepala') ||
      p.jenisPtk.includes('Wakil')
  );

  const guruCount = guruList.length;

  const tuCount = pegawaiList.filter(
    (p) =>
      !p.jenisPtk.includes('Guru') &&
      !p.jenisPtk.includes('Kepala') &&
      !p.jenisPtk.includes('Wakil')
  ).length;

  const asnCount = pegawaiList.filter(
    (p) => p.statusPegawai === 'PNS' || p.statusPegawai === 'PPPK'
  ).length;

  const honorerCount = pegawaiList.filter(
    (p) =>
      p.statusPegawai.includes('GTT') || p.statusPegawai.includes('PTT')
  ).length;

  const pnsCount = pegawaiList.filter((p) => p.statusPegawai === 'PNS').length;
  const pppkCount = pegawaiList.filter((p) => p.statusPegawai === 'PPPK').length;

  // SMA Mapel Statistics
  const serdikCount = guruList.filter((g) => g.statusSertifikasi === 'Sudah Sertifikasi').length;
  const jjmMemenuhiCount = guruList.filter((g) => (g.jumlahJamMengajar || 24) >= 24).length;

  const mipaCount = guruList.filter((g) => (g.rumpunMapel || detectRumpunMapel(g.mapel)) === 'MIPA').length;
  const ipsCount = guruList.filter((g) => (g.rumpunMapel || detectRumpunMapel(g.mapel)) === 'IPS').length;
  const umumCount = guruList.filter((g) => (g.rumpunMapel || detectRumpunMapel(g.mapel)) === 'Umum/Wajib').length;
  const bahasaCount = guruList.filter((g) => (g.rumpunMapel || detectRumpunMapel(g.mapel)) === 'Bahasa & Budaya').length;

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Total Pegawai */}
      <button
        type="button"
        onClick={() => onFilterSelect('ALL')}
        className={`text-left p-4 rounded-xl border transition-all duration-150 relative overflow-hidden group ${
          selectedFilter === 'ALL'
            ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Pegawai
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {total}
            </h3>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>Semua Tenaga Sekolah</span>
          <span className="text-blue-600 font-semibold text-[10px]">Klik filter</span>
        </div>
      </button>

      {/* Guru (Pendidik) */}
      <button
        type="button"
        onClick={() => onFilterSelect('PTK_GURU')}
        className={`text-left p-4 rounded-xl border transition-all duration-150 relative overflow-hidden group ${
          selectedFilter === 'PTK_GURU'
            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Guru (Pendidik)
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {guruCount}
            </h3>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>{total > 0 ? Math.round((guruCount / total) * 100) : 0}% dari total</span>
          <span className="text-emerald-600 font-semibold text-[10px]">Mapel & BK</span>
        </div>
      </button>

      {/* Tenaga Kependidikan */}
      <button
        type="button"
        onClick={() => onFilterSelect('PTK_TU')}
        className={`text-left p-4 rounded-xl border transition-all duration-150 relative overflow-hidden group ${
          selectedFilter === 'PTK_TU'
            ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-sm'
            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tenaga Kependidikan
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {tuCount}
            </h3>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>TU, Perpus, Lab</span>
          <span className="text-amber-600 font-semibold text-[10px]">Staf & Tendik</span>
        </div>
      </button>

      {/* ASN (PNS & PPPK) */}
      <button
        type="button"
        onClick={() => onFilterSelect('STATUS_ASN')}
        className={`text-left p-4 rounded-xl border transition-all duration-150 relative overflow-hidden group ${
          selectedFilter === 'STATUS_ASN'
            ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 shadow-sm'
            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Aparatur Sipil (ASN)
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {asnCount}
            </h3>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>PNS: {pnsCount} • PPPK: {pppkCount}</span>
          <span className="text-purple-600 font-semibold text-[10px]">ASN Aktif</span>
        </div>
      </button>

      {/* Non-ASN / Honorer */}
      <button
        type="button"
        onClick={() => onFilterSelect('STATUS_HONORER')}
        className={`text-left p-4 rounded-xl border transition-all duration-150 relative overflow-hidden group ${
          selectedFilter === 'STATUS_HONORER'
            ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20 shadow-sm'
            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              GTT & PTT (Non-ASN)
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {honorerCount}
            </h3>
          </div>
          <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>Guru/Staf Tidak Tetap</span>
          <span className="text-sky-600 font-semibold text-[10px]">Honorer</span>
        </div>
      </button>
    </section>

    {/* SMA Subject Teachers (Guru Mapel) Quick Overview Bar */}
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-xl p-3.5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
          <BookOpen className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-xs sm:text-sm text-white">
              Rincian Guru Mapel SMA (Kurikulum Merdeka / SMA)
            </h4>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.2 rounded-full">
              Fase E & F
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            MIPA: <strong className="text-white">{mipaCount}</strong> • IPS: <strong className="text-white">{ipsCount}</strong> • Umum/Wajib: <strong className="text-white">{umumCount}</strong> • Bahasa: <strong className="text-white">{bahasaCount}</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Serdik: <strong className="text-emerald-300">{serdikCount}</strong> Guru</span>
        </div>

        <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>JJM ≥24J: <strong className="text-amber-300">{jjmMemenuhiCount}</strong> Guru</span>
        </div>

        {onOpenRincianMapel && (
          <button
            type="button"
            onClick={onOpenRincianMapel}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm ml-auto md:ml-0"
          >
            <span>Rincian Lengkap Guru Mapel</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  </div>
  );
};
