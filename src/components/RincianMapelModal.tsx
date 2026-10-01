import React, { useState, useMemo } from 'react';
import { Pegawai, RumpunMapel, TingkatKelas } from '../types';
import {
  RUMPUN_MAPEL_LIST,
  getRumpunMeta,
  detectRumpunMapel,
  DAFTAR_MAPEL_SMA_STANDAR
} from '../data/smaMapelData';
import {
  X,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Users,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Edit2,
  FileSpreadsheet
} from 'lucide-react';

interface RincianMapelModalProps {
  isOpen: boolean;
  onClose: () => void;
  pegawaiList: Pegawai[];
  onSelectPegawai: (pegawai: Pegawai) => void;
  onEditPegawai: (pegawai: Pegawai) => void;
}

export const RincianMapelModal: React.FC<RincianMapelModalProps> = ({
  isOpen,
  onClose,
  pegawaiList,
  onSelectPegawai,
  onEditPegawai
}) => {
  const [selectedRumpun, setSelectedRumpun] = useState<string>('ALL');
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');
  const [searchMapel, setSearchMapel] = useState<string>('');
  const [filterSerdik, setFilterSerdik] = useState<'ALL' | 'SUDAH' | 'BELUM'>('ALL');
  const [filterJjm, setFilterJjm] = useState<'ALL' | 'MEMENUHI' | 'KURANG'>('ALL');

  // Filter only teachers & educators
  const guruList = useMemo(() => {
    return pegawaiList.filter(
      (p) =>
        p.jenisPtk.includes('Guru') ||
        p.jenisPtk.includes('Kepala') ||
        p.jenisPtk.includes('Wakil')
    );
  }, [pegawaiList]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalGuru = guruList.length;
    const sudahSerdik = guruList.filter(
      (g) => g.statusSertifikasi === 'Sudah Sertifikasi'
    ).length;
    const belumSerdik = totalGuru - sudahSerdik;
    const memenuhiJjm = guruList.filter(
      (g) => (g.jumlahJamMengajar || 24) >= 24
    ).length;
    const kurangJjm = totalGuru - memenuhiJjm;

    // Count by Rumpun
    const rumpunCounts: Record<string, number> = {};
    RUMPUN_MAPEL_LIST.forEach((r) => {
      rumpunCounts[r.id] = 0;
    });

    guruList.forEach((g) => {
      const r = g.rumpunMapel || detectRumpunMapel(g.mapel);
      if (rumpunCounts[r] !== undefined) {
        rumpunCounts[r]++;
      } else {
        rumpunCounts['Umum/Wajib'] = (rumpunCounts['Umum/Wajib'] || 0) + 1;
      }
    });

    return {
      totalGuru,
      sudahSerdik,
      belumSerdik,
      memenuhiJjm,
      kurangJjm,
      rumpunCounts
    };
  }, [guruList]);

  // Filtered List for Table/Cards
  const filteredGuru = useMemo(() => {
    return guruList.filter((g) => {
      const gRumpun = g.rumpunMapel || detectRumpunMapel(g.mapel);

      if (selectedRumpun !== 'ALL' && gRumpun !== selectedRumpun) {
        return false;
      }

      if (selectedKelas !== 'ALL') {
        if (!g.tingkatKelas || !g.tingkatKelas.includes(selectedKelas as TingkatKelas)) {
          return false;
        }
      }

      if (filterSerdik === 'SUDAH' && g.statusSertifikasi !== 'Sudah Sertifikasi') {
        return false;
      }
      if (filterSerdik === 'BELUM' && g.statusSertifikasi === 'Sudah Sertifikasi') {
        return false;
      }

      const jjm = g.jumlahJamMengajar !== undefined ? g.jumlahJamMengajar : 24;
      if (filterJjm === 'MEMENUHI' && jjm < 24) {
        return false;
      }
      if (filterJjm === 'KURANG' && jjm >= 24) {
        return false;
      }

      if (searchMapel.trim()) {
        const q = searchMapel.toLowerCase();
        const mNama = g.nama.toLowerCase().includes(q);
        const mMapel = g.mapel.toLowerCase().includes(q);
        const mNip = g.nip.toLowerCase().includes(q);
        const mRumpun = gRumpun.toLowerCase().includes(q);
        const mTugas = g.tugasTambahan?.toLowerCase().includes(q);
        if (!mNama && !mMapel && !mNip && !mRumpun && !mTugas) {
          return false;
        }
      }

      return true;
    });
  }, [guruList, selectedRumpun, selectedKelas, filterSerdik, filterJjm, searchMapel]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-rincian-mapel"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-start justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Rincian Guru Mapel Tingkat SMA
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Kurikulum Merdeka (Fase E & F)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Distribusi tenaga pendidik menurut Rumpun Mata Pelajaran, Tingkat Kelas, Beban Mengajar (JJM), dan Sertifikasi Pendidik (TPG).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Guru Mapel</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.totalGuru}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Pendidik aktif SMA</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Sertifikasi (TPG)</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{stats.sudahSerdik}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {stats.totalGuru > 0 ? Math.round((stats.sudahSerdik / stats.totalGuru) * 100) : 0}% telah Serdik
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Beban JJM ≥24 Jam</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-700">{stats.memenuhiJjm}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Memenuhi standar SPM</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Perlu Tambahan JJM</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">{stats.kurangJjm}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">&lt; 24 Jam mengajar</p>
            </div>
          </div>

          {/* Rumpun Filter Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Pilih Rumpun Mata Pelajaran (SMA):
              </span>
              <span className="text-slate-400 font-normal">
                Menampilkan {filteredGuru.length} dari {stats.totalGuru} Guru
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedRumpun('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedRumpun === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Semua Rumpun</span>
                <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {stats.totalGuru}
                </span>
              </button>

              {RUMPUN_MAPEL_LIST.map((r) => {
                const count = stats.rumpunCounts[r.id] || 0;
                const isSel = selectedRumpun === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRumpun(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                      isSel
                        ? `${r.badgeClass} ring-2 ring-blue-400/30 shadow-xs font-extrabold`
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isSel ? 'bg-black/10 text-slate-900' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Secondary Filter Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari guru, nama mapel SMA, NIP, atau tugas..."
                value={searchMapel}
                onChange={(e) => setSearchMapel(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              {searchMapel && (
                <button
                  type="button"
                  onClick={() => setSearchMapel('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter by Kelas */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Tingkat:</span>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Semua Kelas (X, XI, XII)</option>
                <option value="Kelas X">Kelas X (Fase E)</option>
                <option value="Kelas XI">Kelas XI (Fase F)</option>
                <option value="Kelas XII">Kelas XII (Fase F)</option>
              </select>
            </div>

            {/* Filter Sertifikasi */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Sertifikasi:</span>
              <select
                value={filterSerdik}
                onChange={(e) => setFilterSerdik(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Semua Status Serdik</option>
                <option value="SUDAH">Sudah Sertifikasi</option>
                <option value="BELUM">Belum Sertifikasi</option>
              </select>
            </div>

            {/* Filter JJM */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">JJM:</span>
              <select
                value={filterJjm}
                onChange={(e) => setFilterJjm(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Semua Jam</option>
                <option value="MEMENUHI">≥ 24 Jam</option>
                <option value="KURANG">&lt; 24 Jam</option>
              </select>
            </div>
          </div>

          {/* Teacher Subject Cards Grid */}
          {filteredGuru.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm">Tidak ada Guru Mapel yang cocok dengan kriteria filter.</p>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau ganti pilihan rumpun.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredGuru.map((item) => {
                const rumpun = item.rumpunMapel || detectRumpunMapel(item.mapel);
                const meta = getRumpunMeta(rumpun);
                const jjm = item.jumlahJamMengajar !== undefined ? item.jumlahJamMengajar : 24;
                const isMemenuhi = jjm >= 24;
                const isSerdik = item.statusSertifikasi === 'Sudah Sertifikasi';

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between gap-3 group"
                  >
                    {/* Upper row: Avatar & Identity & Mapel */}
                    <div className="flex items-start gap-3.5">
                      {/* Photo / Avatar */}
                      <div className="w-13 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.foto ? (
                          <img
                            src={item.foto}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-slate-400 font-black text-sm">
                            {item.nama.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Rumpun Badge */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${meta.badgeClass}`}
                          >
                            {rumpun}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {item.statusPegawai}
                          </span>
                        </div>

                        {/* Subject Title */}
                        <h4 className="font-black text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition">
                          {item.mapel}
                        </h4>

                        {/* Teacher Name & NIP */}
                        <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                          {item.nama}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">
                          NIP: {item.nip}
                        </p>
                      </div>
                    </div>

                    {/* Middle: SMA Mapel Specific Attributes */}
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Tingkat Kelas */}
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Tingkat Kelas
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {item.tingkatKelas && item.tingkatKelas.length > 0 ? (
                              item.tingkatKelas.map((k) => (
                                <span
                                  key={k}
                                  className="bg-white border border-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold text-[10px]"
                                >
                                  {k}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[10px]">Kelas X, XI, XII</span>
                            )}
                          </div>
                        </div>

                        {/* Jam Mengajar (JJM) */}
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Beban Mengajar (JJM)
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${isMemenuhi ? 'text-emerald-600' : 'text-amber-500'}`} />
                            <span
                              className={`font-black text-xs ${
                                isMemenuhi ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {jjm} Jam / Minggu
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Certification & Additional Tasks */}
                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Award className={`w-3.5 h-3.5 ${isSerdik ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span
                            className={`font-semibold ${
                              isSerdik ? 'text-emerald-700' : 'text-slate-500'
                            }`}
                          >
                            {isSerdik ? 'Sertifikasi Pendidik (TPG)' : 'Belum Sertifikasi'}
                          </span>
                        </div>

                        {item.tugasTambahan && (
                          <div className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.2 rounded border border-indigo-100 text-[10px]">
                            {item.tugasTambahan}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => onSelectPegawai(item)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1 transition active:scale-95 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                        <span>Lihat Profil KTA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditPegawai(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold flex items-center gap-1 transition active:scale-95 text-[11px]"
                      >
                        <Edit2 className="w-3 h-3 text-blue-600" />
                        <span>Edit Data Mapel</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Petunjuk Kurikulum SMA:</span>
            <span>Beban kerja guru normal minimal 24 jam tatap muka per minggu untuk pencairan Tunjangan Profesi Guru (TPG).</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl transition active:scale-95 text-xs ml-auto"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
};
