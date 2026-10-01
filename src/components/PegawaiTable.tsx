import React, { useState, useMemo } from "react";
import { Pegawai, StatusPegawai, RumpunMapel } from "../types";
import {
  RUMPUN_MAPEL_LIST,
  getRumpunMeta,
  detectRumpunMapel,
} from "../data/smaMapelData";
import {
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  MessageCircle,
  RotateCcw,
  SlidersHorizontal,
  FolderOpen,
  ArrowUpDown,
  Camera,
  Folder,
  LayoutGrid,
  Table as TableIcon,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

interface PegawaiTableProps {
  pegawaiList: Pegawai[];
  selectedCategoryFilter: string;
  onClearCategoryFilter: () => void;
  onEdit: (pegawai: Pegawai) => void;
  onDelete: (id: number) => void;
  onViewDetail: (pegawai: Pegawai) => void;
  onManageFoto: (pegawai: Pegawai) => void;
  onManageBerkas: (pegawai: Pegawai) => void;
  onResetAll: () => void;
  onOpenRincianMapel?: () => void;
  onOpenGoogleSheets?: () => void;
}

export const PegawaiTable: React.FC<PegawaiTableProps> = ({
  pegawaiList,
  selectedCategoryFilter,
  onClearCategoryFilter,
  onEdit,
  onDelete,
  onViewDetail,
  onManageFoto,
  onManageBerkas,
  onResetAll,
  onOpenRincianMapel,
  onOpenGoogleSheets,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [ptkFilter, setPtkFilter] = useState<string>("ALL");
  const [rumpunFilter, setRumpunFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<
    "nama-asc" | "nama-desc" | "nip" | "status"
  >("nama-asc");
  const [viewMode, setViewMode] = useState<"table" | "gallery">("table");

  // Filter & Sort Logic
  const filteredPegawai = useMemo(() => {
    return pegawaiList
      .filter((item) => {
        // Quick Category Filter from Dashboard cards
        if (selectedCategoryFilter === "PTK_GURU") {
          if (
            !item.jenisPtk.includes("Guru") &&
            !item.jenisPtk.includes("Kepala") &&
            !item.jenisPtk.includes("Wakil")
          ) {
            return false;
          }
        } else if (selectedCategoryFilter === "PTK_TU") {
          if (
            item.jenisPtk.includes("Guru") ||
            item.jenisPtk.includes("Kepala") ||
            item.jenisPtk.includes("Wakil")
          ) {
            return false;
          }
        } else if (selectedCategoryFilter === "STATUS_ASN") {
          if (item.statusPegawai !== "PNS" && item.statusPegawai !== "PPPK") {
            return false;
          }
        } else if (selectedCategoryFilter === "STATUS_HONORER") {
          if (
            !item.statusPegawai.includes("GTT") &&
            !item.statusPegawai.includes("PTT")
          ) {
            return false;
          }
        }

        // Dropdown Status Filter
        if (statusFilter !== "ALL" && item.statusPegawai !== statusFilter) {
          return false;
        }

        // Dropdown PTK Filter
        if (ptkFilter !== "ALL" && item.jenisPtk !== ptkFilter) {
          return false;
        }

        // Dropdown Rumpun Mapel Filter (SMA)
        if (rumpunFilter !== "ALL") {
          const itemRumpun = item.rumpunMapel || detectRumpunMapel(item.mapel);
          if (itemRumpun !== rumpunFilter) {
            return false;
          }
        }

        // Text Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchNama = item.nama.toLowerCase().includes(q);
          const matchNip = item.nip.toLowerCase().includes(q);
          const matchMapel = item.mapel.toLowerCase().includes(q);
          const matchPtk = item.jenisPtk.toLowerCase().includes(q);
          const matchGol = item.golongan.toLowerCase().includes(q);
          const matchNuptk = item.nuptk?.toLowerCase().includes(q);
          const itemRumpun = item.rumpunMapel || detectRumpunMapel(item.mapel);
          const matchRumpun = itemRumpun.toLowerCase().includes(q);

          if (
            !matchNama &&
            !matchNip &&
            !matchMapel &&
            !matchPtk &&
            !matchGol &&
            !matchNuptk &&
            !matchRumpun
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "nama-asc") {
          return a.nama.localeCompare(b.nama);
        } else if (sortBy === "nama-desc") {
          return b.nama.localeCompare(a.nama);
        } else if (sortBy === "nip") {
          return a.nip.localeCompare(b.nip);
        } else if (sortBy === "status") {
          return a.statusPegawai.localeCompare(b.statusPegawai);
        }
        return 0;
      });
  }, [
    pegawaiList,
    selectedCategoryFilter,
    statusFilter,
    ptkFilter,
    rumpunFilter,
    searchTerm,
    sortBy,
  ]);

  const getStatusBadge = (status: StatusPegawai) => {
    switch (status) {
      case "PNS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PPPK":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "GTT (Guru Tidak Tetap)":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PTT (Pegawai Tidak Tetap)":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getCleanPhone = (phone?: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      return "62" + cleaned.slice(1);
    }
    return cleaned;
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
      {/* Table Top Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Daftar Data Pegawai</span>
              {selectedCategoryFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Filter Aktif
                  <button
                    onClick={onClearCategoryFilter}
                    className="hover:text-blue-950 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola informasi seluruh guru, foto profil, dan berkas kepegawaian
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-1 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "table"
                    ? "btn-3d btn-3d-blue !py-1 !px-2.5 shadow-sm text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("gallery")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "gallery"
                    ? "btn-3d btn-3d-blue !py-1 !px-2.5 shadow-sm text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
                title="Tampilan Galeri Foto Pegawai"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Galeri Foto</span>
              </button>
            </div>

            {onOpenGoogleSheets && (
              <button
                type="button"
                onClick={onOpenGoogleSheets}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Buka Sinkronisasi Google Sheets & SIMPEG Guru"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Google Sheets</span>
              </button>
            )}

            {/* Search bar */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari NIP, Nama, Mapel..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-200/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          >
            <option value="ALL">Semua Status</option>
            <option value="PNS">PNS</option>
            <option value="PPPK">PPPK</option>
            <option value="GTT (Guru Tidak Tetap)">GTT (Honorer Guru)</option>
            <option value="PTT (Pegawai Tidak Tetap)">
              PTT (Honorer Tendik)
            </option>
          </select>

          {/* Filter PTK */}
          <select
            value={ptkFilter}
            onChange={(e) => setPtkFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          >
            <option value="ALL">Semua Jenis PTK</option>
            <option value="Guru Mapel">Guru Mapel</option>
            <option value="Guru BK">Guru BK</option>
            <option value="Kepala Sekolah">Kepala Sekolah</option>
            <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
            <option value="Tenaga Administrasi (TU)">
              Tenaga Administrasi (TU)
            </option>
            <option value="Pustakawan">Pustakawan</option>
            <option value="Laboran">Laboran</option>
            <option value="Petugas Keamanan">Petugas Keamanan</option>
            <option value="Kebersihan">Kebersihan</option>
          </select>

          {/* Filter Rumpun Mapel SMA */}
          <select
            value={rumpunFilter}
            onChange={(e) => setRumpunFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 font-medium"
            title="Saring berdasarkan Rumpun Mata Pelajaran Tingkat SMA"
          >
            <option value="ALL">Semua Rumpun Mapel SMA</option>
            {RUMPUN_MAPEL_LIST.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Rincian Guru Mapel Quick Button */}
          {onOpenRincianMapel && (
            <button
              type="button"
              onClick={onOpenRincianMapel}
              className="btn-3d btn-3d-indigo text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              title="Buka Analisis & Rekap Rincian Guru Mapel SMA"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-200" />
              <span>Rincian Guru Mapel</span>
            </button>
          )}

          {/* Sort By */}
          <div className="flex items-center gap-1 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            >
              <option value="nama-asc">Nama (A - Z)</option>
              <option value="nama-desc">Nama (Z - A)</option>
              <option value="nip">NIP / ID</option>
              <option value="status">Status Pegawai</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode: Gallery (Direktori Foto Pegawai) */}
      {viewMode === "gallery" ? (
        <div className="p-5">
          {filteredPegawai.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <FolderOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600 text-sm">
                Tidak ada data pegawai yang sesuai.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPegawai.map((item) => {
                const waNumber = getCleanPhone(item.noHp);
                const berkasCount = item.berkas?.length || 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-400 hover:shadow-md transition flex flex-col items-center text-center relative group"
                  >
                    {/* Status Badge */}
                    <div className="w-full flex justify-between items-center mb-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                          item.statusPegawai,
                        )}`}
                      >
                        {item.statusPegawai}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.jk === "Perempuan"
                          ? "♀ Perempuan"
                          : "♂ Laki-laki"}
                      </span>
                    </div>

                    {/* Photo with Camera Overlay */}
                    <div className="relative mb-3 group/photo">
                      <div className="w-24 h-30 rounded-xl bg-slate-100 border-2 border-slate-200 shadow-sm overflow-hidden flex items-center justify-center">
                        {item.foto ? (
                          <img
                            src={item.foto}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-blue-800 font-black text-xl">
                            {item.nama.slice(0, 2).toUpperCase()}
                            <span className="text-[9px] text-slate-400 font-normal mt-0.5">
                              No Photo
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onManageFoto(item)}
                        className="absolute inset-0 bg-slate-900/60 text-white rounded-xl opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center transition text-[10px] font-semibold gap-1"
                        title="Ubah Foto Pegawai"
                      >
                        <Camera className="w-4 h-4 text-amber-300" />
                        <span>Ganti Foto</span>
                      </button>
                    </div>

                    {/* Identity */}
                    <h4 className="font-bold text-slate-900 text-xs leading-tight mb-0.5 line-clamp-1">
                      {item.nama}
                    </h4>
                    <p className="text-[11px] font-mono text-blue-700 font-medium mb-1">
                      {item.nip}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-1 font-medium mb-1">
                      {item.jenisPtk} •{" "}
                      <span className="font-semibold text-slate-800">
                        {item.mapel}
                      </span>
                    </p>

                    {/* SMA Subject & Teacher Badges for Gallery */}
                    {(item.jenisPtk.includes("Guru") ||
                      item.jenisPtk.includes("Kepala") ||
                      item.jenisPtk.includes("Wakil")) && (
                      <div className="w-full flex flex-wrap items-center justify-center gap-1 mb-2">
                        {(() => {
                          const rumpun =
                            item.rumpunMapel || detectRumpunMapel(item.mapel);
                          const meta = getRumpunMeta(rumpun);
                          return (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${meta.badgeClass}`}
                            >
                              {rumpun}
                            </span>
                          );
                        })()}
                        {item.jumlahJamMengajar !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              item.jumlahJamMengajar >= 24
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.jumlahJamMengajar}J
                          </span>
                        )}
                        {item.statusSertifikasi === "Sudah Sertifikasi" && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            Serdik
                          </span>
                        )}
                        {item.tingkatKelas && item.tingkatKelas.length > 0 && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                            {item.tingkatKelas
                              .map((k) => k.replace("Kelas ", ""))
                              .join(",")}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Berkas Badge Button */}
                    <button
                      type="button"
                      onClick={() => onManageBerkas(item)}
                      className="btn-3d btn-3d-light w-full py-1.5 px-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 mb-3"
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-500" />
                      <span>{berkasCount} Berkas Terlampir</span>
                    </button>

                    {/* Action Bar */}
                    <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                      {waNumber ? (
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-3d btn-3d-emerald text-white p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-medium"
                          title="Chat WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WA</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          No WA
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewDetail(item)}
                          className="btn-3d-icon btn-3d-cyan text-white p-1.5 w-7 h-7 rounded-lg"
                          title="Lihat Preview KTA Futuristik (3D Interactive) & Profil"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="btn-3d-icon btn-3d-amber text-white p-1.5 w-7 h-7 rounded-lg"
                          title="Edit Pegawai"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          className="btn-3d-icon btn-3d-rose text-white p-1.5 w-7 h-7 rounded-lg"
                          title="Hapus Pegawai"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* View Mode: Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 text-center w-12">No</th>
                <th className="p-3.5 min-w-[220px]">Pegawai & Foto</th>
                <th className="p-3.5 min-w-[160px]">NIP & Identitas</th>
                <th className="p-3.5 min-w-[150px]">Status & PTK</th>
                <th className="p-3.5 min-w-[170px]">Mata Pelajaran / Tugas</th>
                <th className="p-3.5 min-w-[130px]">Berkas Dokumen</th>
                <th className="p-3.5 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPegawai.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    <FolderOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">
                      Tidak ada data pegawai yang sesuai.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba sesuaikan kata kunci pencarian atau ubah filter
                      status di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPegawai.map((item, index) => {
                  const waNumber = getCleanPhone(item.noHp);
                  const berkasCount = item.berkas?.length || 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/30 transition-colors border-b border-slate-100"
                    >
                      {/* No */}
                      <td className="p-3.5 text-center font-semibold text-slate-400">
                        {index + 1}
                      </td>

                      {/* Foto & Nama */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {/* Photo Avatar with Quick Click */}
                          <div className="relative group/avatar shrink-0">
                            <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-300 shadow-2xs overflow-hidden flex items-center justify-center">
                              {item.foto ? (
                                <img
                                  src={item.foto}
                                  alt={item.nama}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="font-bold text-xs text-blue-700">
                                  {item.nama.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => onManageFoto(item)}
                              className="absolute inset-0 bg-slate-900/60 text-white rounded-lg opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition"
                              title="Kelola / Ganti Foto Pegawai"
                            >
                              <Camera className="w-3.5 h-3.5 text-amber-300" />
                            </button>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {item.nama}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span className="text-slate-400 font-medium">
                                {item.jk === "Perempuan" ? "♀ Pr" : "♂ Lk"}
                              </span>
                              {item.noHp && (
                                <span className="flex items-center gap-1 text-slate-600">
                                  <span>{item.noHp}</span>
                                  {waNumber && (
                                    <a
                                      href={`https://wa.me/${waNumber}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Kirim Pesan WhatsApp"
                                      className="text-emerald-600 hover:text-emerald-700 inline-flex items-center"
                                    >
                                      <MessageCircle className="w-3 h-3" />
                                    </a>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NIP & NUPTK */}
                      <td className="p-3.5 font-mono font-medium text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.nip}</span>
                        </div>
                        {item.nuptk && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            NUPTK: {item.nuptk}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 block font-sans font-normal mt-0.5">
                          {item.golongan || "-"} • {item.pendidikan}
                        </span>
                      </td>

                      {/* Status & Jenis PTK */}
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                            item.statusPegawai,
                          )}`}
                        >
                          {item.statusPegawai}
                        </span>
                        <div className="text-[11px] text-slate-600 font-medium mt-1">
                          {item.jenisPtk}
                        </div>
                      </td>

                      {/* Mapel / Tugas & SMA Teacher Details */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 leading-snug">
                          {item.mapel}
                        </div>

                        {/* SMA Specific Badges if Teacher */}
                        {(item.jenisPtk.includes("Guru") ||
                          item.jenisPtk.includes("Kepala") ||
                          item.jenisPtk.includes("Wakil")) && (
                          <div className="mt-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-1">
                              {(() => {
                                const rumpun =
                                  item.rumpunMapel ||
                                  detectRumpunMapel(item.mapel);
                                const meta = getRumpunMeta(rumpun);
                                return (
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${meta.badgeClass}`}
                                  >
                                    {rumpun}
                                  </span>
                                );
                              })()}

                              {item.jumlahJamMengajar !== undefined && (
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                    item.jumlahJamMengajar >= 24
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                  title="Jumlah Jam Mengajar per Minggu"
                                >
                                  {item.jumlahJamMengajar} Jam
                                </span>
                              )}

                              {item.statusSertifikasi ===
                                "Sudah Sertifikasi" && (
                                <span
                                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.2 rounded"
                                  title="Pendidik Bersertifikasi (TPG)"
                                >
                                  Serdik
                                </span>
                              )}
                            </div>

                            {/* Tingkat Kelas & Tugas Tambahan */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                              {item.tingkatKelas &&
                                item.tingkatKelas.length > 0 && (
                                  <div className="flex items-center gap-0.5">
                                    {item.tingkatKelas.map((k) => (
                                      <span
                                        key={k}
                                        className="bg-slate-100 border border-slate-200 text-slate-700 px-1 py-0.2 rounded font-semibold text-[9px]"
                                      >
                                        {k.replace("Kelas ", "")}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              {item.tugasTambahan && (
                                <span
                                  className="text-[10px] text-indigo-700 font-medium truncate max-w-[130px]"
                                  title={item.tugasTambahan}
                                >
                                  • {item.tugasTambahan}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Berkas Dokumen */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => onManageBerkas(item)}
                          className="btn-3d btn-3d-light px-2.5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5"
                          title="Buka & Kelola Berkas Dokumen"
                        >
                          <Folder className="w-3.5 h-3.5 text-amber-500" />
                          <span>{berkasCount} Berkas</span>
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Foto Quick */}
                          <button
                            type="button"
                            onClick={() => onManageFoto(item)}
                            className="btn-3d-icon btn-3d-light text-slate-700 w-7 h-7 rounded-lg"
                            title="Foto Pegawai"
                          >
                            <Camera className="w-3.5 h-3.5 text-blue-600" />
                          </button>

                          {/* Detail / KTA */}
                          <button
                            type="button"
                            onClick={() => onViewDetail(item)}
                            className="btn-3d-icon btn-3d-cyan text-white w-7 h-7 rounded-lg"
                            title="Lihat Preview KTA Futuristik (3D Interactive) & Profil"
                          >
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="btn-3d-icon btn-3d-amber text-white w-7 h-7 rounded-lg"
                            title="Edit Data Pegawai"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="btn-3d-icon btn-3d-rose text-white w-7 h-7 rounded-lg"
                            title="Hapus Data Pegawai"
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
          </table>
        </div>
      )}

      {/* Table Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Menampilkan{" "}
          <strong className="text-slate-800">{filteredPegawai.length}</strong>{" "}
          dari <strong className="text-slate-800">{pegawaiList.length}</strong>{" "}
          pegawai
        </div>

        <button
          type="button"
          onClick={onResetAll}
          className="btn-3d btn-3d-light text-rose-600 hover:text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
          <span>Reset ke Data Bawaan</span>
        </button>
      </div>
    </section>
  );
};
