import React, { useState, useMemo } from "react";
import { Pegawai, RumpunMapel, TingkatKelas } from "../types";
import { RUMPUN_MAPEL_LIST, getRumpunMeta } from "../data/smaMapelData";
import {
  BookOpen,
  X,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  Award,
  Clock,
  Layers,
  Sparkles,
  Edit2,
  Eye,
  GraduationCap,
} from "lucide-react";

interface RincianGuruMapelModalProps {
  isOpen: boolean;
  onClose: () => void;
  pegawaiList: Pegawai[];
  onEditPegawai: (pegawai: Pegawai) => void;
  onViewDetail: (pegawai: Pegawai) => void;
}

export const RincianGuruMapelModal: React.FC<RincianGuruMapelModalProps> = ({
  isOpen,
  onClose,
  pegawaiList,
  onEditPegawai,
  onViewDetail,
}) => {
  const [selectedRumpun, setSelectedRumpun] = useState<string>("ALL");
  const [selectedKelas, setSelectedKelas] = useState<string>("ALL");
  const [selectedJjmStatus, setSelectedJjmStatus] = useState<string>("ALL");
  const [selectedSerdik, setSelectedSerdik] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter only Guru (Guru Mapel, Guru BK, Kepsek/Wakasek yang mengajar)
  const allGuru = useMemo(() => {
    return pegawaiList.filter(
      (p) =>
        p.jenisPtk.includes("Guru") ||
        p.jenisPtk.includes("Kepala") ||
        p.jenisPtk.includes("Wakil"),
    );
  }, [pegawaiList]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalGuru = allGuru.length;
    const totalJJM = allGuru.reduce(
      (acc, curr) => acc + (curr.jumlahJamMengajar || 0),
      0,
    );
    const guruLengkap24 = allGuru.filter(
      (g) => (g.jumlahJamMengajar || 0) >= 24,
    ).length;
    const guruKurang24 = allGuru.filter(
      (g) => (g.jumlahJamMengajar || 0) < 24,
    ).length;
    const sudahSerdik = allGuru.filter(
      (g) => g.statusSertifikasi === "Sudah Sertifikasi",
    ).length;
    const belumSerdik = totalGuru - sudahSerdik;

    return {
      totalGuru,
      totalJJM,
      guruLengkap24,
      guruKurang24,
      sudahSerdik,
      belumSerdik,
      persenSerdik:
        totalGuru > 0 ? Math.round((sudahSerdik / totalGuru) * 100) : 0,
    };
  }, [allGuru]);

  // Filtered Guru List
  const filteredGuru = useMemo(() => {
    return allGuru.filter((guru) => {
      // Rumpun
      if (selectedRumpun !== "ALL") {
        if (guru.rumpunMapel !== selectedRumpun) return false;
      }

      // Tingkat Kelas
      if (selectedKelas !== "ALL") {
        if (!guru.tingkatKelas?.includes(selectedKelas as TingkatKelas)) {
          return false;
        }
      }

      // JJM Status (24 jam standard)
      if (selectedJjmStatus === "MEMENUHI") {
        if ((guru.jumlahJamMengajar || 0) < 24) return false;
      } else if (selectedJjmStatus === "KURANG") {
        if ((guru.jumlahJamMengajar || 0) >= 24) return false;
      }

      // Sertifikasi
      if (selectedSerdik !== "ALL") {
        if (guru.statusSertifikasi !== selectedSerdik) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = guru.nama.toLowerCase().includes(q);
        const matchNip = guru.nip.toLowerCase().includes(q);
        const matchMapel = guru.mapel.toLowerCase().includes(q);
        const matchRumpun = (guru.rumpunMapel || "").toLowerCase().includes(q);
        const matchTugas = (guru.tugasTambahan || "").toLowerCase().includes(q);

        if (
          !matchNama &&
          !matchNip &&
          !matchMapel &&
          !matchRumpun &&
          !matchTugas
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    allGuru,
    selectedRumpun,
    selectedKelas,
    selectedJjmStatus,
    selectedSerdik,
    searchQuery,
  ]);

  // Distribution by Rumpun
  const rumpunSummary = useMemo(() => {
    return RUMPUN_MAPEL_LIST.map((r) => {
      const teachers = allGuru.filter((g) => g.rumpunMapel === r.id);
      const totalHours = teachers.reduce(
        (acc, curr) => acc + (curr.jumlahJamMengajar || 0),
        0,
      );
      return {
        ...r,
        teacherCount: teachers.length,
        totalHours,
      };
    }).filter((r) => r.teacherCount > 0);
  }, [allGuru]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-wide">
                  Rincian Guru Mapel Tingkat SMA
                </h3>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/30 uppercase">
                  Kurikulum Merdeka / SMA
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Struktur Mata Pelajaran, Distribusi Beban Mengajar (JJM), Fase E
                & F, serta Sertifikasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-3d btn-3d-dark text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              title="Cetak Rincian Guru Mapel SMA"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak Rincian</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-3d-icon btn-3d-dark text-slate-300 hover:text-white p-1.5 rounded-lg"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1"
          id="printable-mapel-area"
        >
          {/* Key Metrics / Dashboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Guru Mapel */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-blue-700">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Total Guru Mapel & BK
                </span>
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-blue-950 mt-1">
                {stats.totalGuru}{" "}
                <span className="text-xs font-normal text-slate-500">
                  Orang
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Pengampu Mata Pelajaran SMA
              </p>
            </div>

            {/* Total Beban Mengajar */}
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-indigo-700">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Total Jam Mengajar (JJM)
                </span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-indigo-950 mt-1">
                {stats.totalJJM}{" "}
                <span className="text-xs font-normal text-slate-500">
                  Jam / Mgg
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Rata-rata{" "}
                {stats.totalGuru > 0
                  ? (stats.totalJJM / stats.totalGuru).toFixed(1)
                  : 0}{" "}
                Jam/Guru
              </p>
            </div>

            {/* Beban Standar Sertifikasi (24 Jam) */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Memenuhi ≥ 24 Jam
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                {stats.guruLengkap24}{" "}
                <span className="text-xs font-normal text-slate-500">
                  (
                  {stats.totalGuru > 0
                    ? Math.round((stats.guruLengkap24 / stats.totalGuru) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                {stats.guruKurang24} Guru &lt; 24 jam
              </p>
            </div>

            {/* Sertifikasi Guru */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Sudah Sertifikasi (TPG)
                </span>
                <Award className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-amber-950 mt-1">
                {stats.sudahSerdik}{" "}
                <span className="text-xs font-normal text-slate-500">
                  ({stats.persenSerdik}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {stats.belumSerdik} Belum Serdik
              </p>
            </div>
          </div>

          {/* Rumpun Mapel Distribution Badges */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Distribusi Menurut Rumpun Kurikulum SMA</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Klik salah satu rumpun untuk memfilter tabel
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {rumpunSummary.map((r) => {
                const isSelected = selectedRumpun === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRumpun(isSelected ? "ALL" : r.id)}
                    className={`text-left p-2.5 rounded-xl border transition active:scale-95 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                        : `${r.bgLight} ${r.borderClass} hover:border-slate-400`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase truncate ${
                          isSelected ? "text-white" : r.textClass
                        }`}
                      >
                        {r.label.split(" ")[0]}
                      </span>
                      <span
                        className={`text-[11px] font-black px-1.5 py-0.2 rounded ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-white text-slate-800 shadow-2xs"
                        }`}
                      >
                        {r.teacherCount}
                      </span>
                    </div>
                    <div
                      className={`text-xs font-bold mt-1 line-clamp-1 ${
                        isSelected ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {r.label}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? "text-blue-100" : "text-slate-500"
                      }`}
                    >
                      {r.totalHours} Jam / Mgg
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Rumpun Dropdown */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Rumpun Mapel
                </label>
                <select
                  value={selectedRumpun}
                  onChange={(e) => setSelectedRumpun(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Semua Rumpun SMA</option>
                  <option value="Umum/Wajib">Umum / Wajib</option>
                  <option value="MIPA">MIPA (Sains)</option>
                  <option value="IPS">IPS (Sosial Humaniora)</option>
                  <option value="Bahasa & Budaya">Bahasa & Budaya</option>
                  <option value="Vokasi & Mulok">PKWU & Muatan Lokal</option>
                  <option value="Bimbingan Konseling (BK)">
                    Bimbingan Konseling (BK)
                  </option>
                </select>
              </div>

              {/* Filter Kelas */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Tingkat Kelas
                </label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Semua Tingkat</option>
                  <option value="Kelas X">Kelas X (Fase E)</option>
                  <option value="Kelas XI">Kelas XI (Fase F)</option>
                  <option value="Kelas XII">Kelas XII (Fase F)</option>
                </select>
              </div>

              {/* Filter JJM */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Beban Mengajar (JJM)
                </label>
                <select
                  value={selectedJjmStatus}
                  onChange={(e) => setSelectedJjmStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Semua Jam</option>
                  <option value="MEMENUHI">
                    ≥ 24 Jam (Standar Sertifikasi)
                  </option>
                  <option value="KURANG">&lt; 24 Jam (Kurang Jam)</option>
                </select>
              </div>

              {/* Filter Serdik */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Sertifikasi Guru
                </label>
                <select
                  value={selectedSerdik}
                  onChange={(e) => setSelectedSerdik(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Semua Sertifikasi</option>
                  <option value="Sudah Sertifikasi">Sudah Sertifikasi</option>
                  <option value="Belum Sertifikasi">Belum Sertifikasi</option>
                </select>
              </div>

              {/* Reset filter */}
              {(selectedRumpun !== "ALL" ||
                selectedKelas !== "ALL" ||
                selectedJjmStatus !== "ALL" ||
                selectedSerdik !== "ALL" ||
                searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRumpun("ALL");
                    setSelectedKelas("ALL");
                    setSelectedJjmStatus("ALL");
                    setSelectedSerdik("ALL");
                    setSearchQuery("");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-xs mt-3 underline"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari guru, mapel, tugas..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Teachers Detailed Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-center w-12">No</th>
                    <th className="p-3 min-w-[200px]">Guru Pengampu & NIP</th>
                    <th className="p-3 min-w-[170px]">Mata Pelajaran SMA</th>
                    <th className="p-3 min-w-[130px]">Rumpun Kurikulum</th>
                    <th className="p-3 min-w-[140px]">Tingkat Kelas Diampu</th>
                    <th className="p-3 min-w-[140px]">Beban Mengajar (JJM)</th>
                    <th className="p-3 min-w-[130px]">Sertifikasi Pendidik</th>
                    <th className="p-3 min-w-[170px]">
                      Tugas Tambahan / Ekuivalensi
                    </th>
                    <th className="p-3 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGuru.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-8 text-center text-slate-400"
                      >
                        <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">
                          Tidak ada guru mapel yang cocok dengan kriteria
                          filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredGuru.map((item, index) => {
                      const rumpunMeta = getRumpunMeta(item.rumpunMapel);
                      const jjm = item.jumlahJamMengajar || 0;
                      const isMemenuhi = jjm >= 24;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/40 transition-colors border-b border-slate-100"
                        >
                          {/* No */}
                          <td className="p-3 text-center font-semibold text-slate-400">
                            {index + 1}
                          </td>

                          {/* Guru & NIP */}
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                {item.foto ? (
                                  <img
                                    src={item.foto}
                                    alt={item.nama}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="font-bold text-[10px] text-blue-700">
                                    {item.nama.slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {item.nama}
                                </span>
                                <span className="font-mono text-[10px] text-blue-700 block">
                                  {item.nip}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {item.statusPegawai} • {item.golongan}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Mapel */}
                          <td className="p-3">
                            <span className="font-semibold text-slate-900 block">
                              {item.mapel}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {item.jenisPtk}
                            </span>
                          </td>

                          {/* Rumpun */}
                          <td className="p-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${rumpunMeta.badgeClass}`}
                            >
                              {item.rumpunMapel || "Lainnya"}
                            </span>
                          </td>

                          {/* Tingkat Kelas */}
                          <td className="p-3">
                            {item.tingkatKelas &&
                            item.tingkatKelas.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {item.tingkatKelas.map((k) => (
                                  <span
                                    key={k}
                                    className="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                  >
                                    {k.replace("Kelas ", "Kls ")}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Belum ditentukan
                              </span>
                            )}
                          </td>

                          {/* JJM */}
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-black text-xs ${
                                  isMemenuhi
                                    ? "text-emerald-700"
                                    : "text-amber-600"
                                }`}
                              >
                                {jjm} Jam
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                  isMemenuhi
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {isMemenuhi ? "Memenuhi" : "Kurang"}
                              </span>
                            </div>
                            <div className="w-24 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className={`h-full ${
                                  isMemenuhi ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, (jjm / 24) * 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              Standar TPG: 24 Jam
                            </span>
                          </td>

                          {/* Sertifikasi */}
                          <td className="p-3">
                            {item.statusSertifikasi === "Sudah Sertifikasi" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Sudah Serdik</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                <span>Belum Serdik</span>
                              </span>
                            )}
                          </td>

                          {/* Tugas Tambahan */}
                          <td className="p-3">
                            {item.tugasTambahan ? (
                              <span className="font-medium text-slate-800 text-[11px] block">
                                {item.tugasTambahan}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">
                                -
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onViewDetail(item);
                                }}
                                className="btn-3d-icon btn-3d-cyan text-white p-1.5 rounded-lg"
                                title="Lihat Profil Pegawai"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onEditPegawai(item);
                                }}
                                className="btn-3d-icon btn-3d-amber text-white p-1.5 rounded-lg"
                                title="Ubah Pembagian Tugas Mapel"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
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

            {/* Table Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                Menampilkan{" "}
                <strong className="text-slate-800">
                  {filteredGuru.length}
                </strong>{" "}
                guru mapel SMA
              </div>
              <div className="text-[11px] text-slate-400">
                Beban Jam Mengajar mengacu pada Peraturan Kemendikbudristek
                untuk pemenuhan SKTP/TPG (24 Jam Tatap Muka/Minggu)
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              Mendukung Penjadwalan Kurikulum Merdeka Fase E (Kelas X) & Fase F
              (Kelas XI - XII)
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-3d btn-3d-dark text-white font-bold px-5 py-2 rounded-xl text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
