import React, { useState } from "react";
import { Pegawai, KopSekolah } from "../types";
import { downloadDataUrl } from "../utils/fileUtils";
import { getRumpunMeta } from "../data/smaMapelData";
import { FuturisticKtaPreview } from "./FuturisticKtaPreview";
import {
  X,
  Printer,
  Edit,
  Phone,
  IdCard,
  QrCode,
  MessageCircle,
  Camera,
  Folder,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface PegawaiDetailModalProps {
  pegawai: Pegawai | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (pegawai: Pegawai) => void;
  onManageFoto: (pegawai: Pegawai) => void;
  onManageBerkas: (pegawai: Pegawai) => void;
  kop?: KopSekolah;
}

export const PegawaiDetailModal: React.FC<PegawaiDetailModalProps> = ({
  pegawai,
  isOpen,
  onClose,
  onEdit,
  onManageFoto,
  onManageBerkas,
  kop,
}) => {
  const [activeTab, setActiveTab] = useState<"futuristik" | "biodata">(
    "futuristik",
  );

  if (!isOpen || !pegawai) return null;

  const handlePrint = () => {
    window.print();
  };

  const getCleanPhone = (phone?: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      return "62" + cleaned.slice(1);
    }
    return cleaned;
  };

  const waNumber = getCleanPhone(pegawai.noHp);
  const berkasList = pegawai.berkas || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/80 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <IdCard className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-white leading-tight">
                Preview KTA Digital & Profil Pegawai
              </h3>
              <p className="text-[10px] text-cyan-300/80 font-mono">
                {pegawai.nama} • NIP: {pegawai.nip}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="bg-slate-950 px-4 pt-2.5 flex items-center justify-between border-b border-slate-800 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("futuristik")}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
                activeTab === "futuristik"
                  ? "bg-slate-900 text-cyan-300 border-cyan-400 shadow-md"
                  : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Preview KTA Futuristik</span>
              <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1.5 py-0.5 rounded-full font-mono border border-cyan-500/30">
                3D Cyber
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("biodata")}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
                activeTab === "biodata"
                  ? "bg-slate-900 text-white border-blue-400 shadow-md"
                  : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Biodata & KOP Cetak Resmi</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>KTA ELEKTRONIK AKTIF</span>
          </div>
        </div>

        {/* Modal Body: Switch between Futuristic Stage & Biodata/Print */}
        {activeTab === "futuristik" ? (
          <div className="p-3 sm:p-5 overflow-y-auto flex-1 bg-slate-950 flex flex-col justify-center">
            <FuturisticKtaPreview
              pegawai={pegawai}
              kop={kop}
              onPrint={handlePrint}
              onEdit={() => {
                onClose();
                onEdit(pegawai);
              }}
              onManageFoto={() => onManageFoto(pegawai)}
            />
          </div>
        ) : (
          /* Card Body / KTA Preview with Official Letterhead */
          <div
            className="p-6 space-y-5 overflow-y-auto flex-1 bg-white text-slate-800"
            id="printable-area"
          >
            {/* Official Letterhead Header for Printed KTA */}
            {kop && (
              <div className="border-b-2 border-slate-900 pb-3 mb-2">
                <div className="flex items-center justify-between gap-3 text-center sm:text-left">
                  {kop.logoKiri && (
                    <div className="w-14 h-14 shrink-0 flex items-center justify-center p-0.5">
                      <img
                        src={kop.logoKiri}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 font-serif leading-tight">
                      {kop.instansiAtas} • {kop.dinas}
                    </p>
                    <h4 className="text-sm font-black uppercase text-slate-950 font-serif leading-tight">
                      {kop.namaSekolah}
                    </h4>
                    <p className="text-[9px] text-slate-600 font-medium">
                      {kop.alamatJalan}, {kop.kotaKabupaten}
                      {kop.telepon && ` • Telp: ${kop.telepon}`}
                    </p>
                  </div>
                  {kop.tampilkanLogoKanan && kop.logoKanan && (
                    <div className="w-14 h-14 shrink-0 flex items-center justify-center p-0.5">
                      <img
                        src={kop.logoKanan}
                        alt="Logo Sekolah"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="h-[2px] bg-slate-900 w-full mt-2"></div>
                <div className="h-[0.5px] bg-slate-900 w-full mt-[1px]"></div>
              </div>
            )}

            {/* Identity Header */}
            <div className="flex items-start gap-4">
              {/* Photo Frame */}
              <div className="relative group shrink-0">
                <div className="w-24 h-32 rounded-xl bg-gradient-to-br from-blue-100 to-slate-200 border-2 border-blue-600/40 shadow-md overflow-hidden flex flex-col items-center justify-center relative">
                  {pegawai.foto ? (
                    <img
                      src={pegawai.foto}
                      alt={pegawai.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <span className="text-3xl font-black text-blue-800 uppercase">
                        {pegawai.nama.slice(0, 2)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-1">
                        {pegawai.jk === "Perempuan" ? "Perempuan" : "Laki-laki"}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-blue-700 text-white text-[9px] text-center font-bold py-0.5">
                    {pegawai.statusPegawai.split(" ")[0]}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onManageFoto(pegawai)}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-md hover:bg-blue-700 transition"
                  title="Ganti Foto Pegawai"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                    {pegawai.statusPegawai}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {pegawai.jenisPtk}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                  {pegawai.nama}
                </h4>
                <p className="text-xs text-blue-700 font-mono font-semibold mt-0.5">
                  NIP: {pegawai.nip}
                </p>
                <p className="text-xs text-slate-700 font-medium mt-1">
                  Tugas / Mapel:{" "}
                  <span className="font-semibold text-slate-900">
                    {pegawai.mapel}
                  </span>
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Pangkat / Golongan
                </span>
                <span className="font-semibold text-slate-800">
                  {pegawai.golongan || "-"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Pendidikan Terakhir
                </span>
                <span className="font-semibold text-slate-800">
                  {pegawai.pendidikan}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Jenis Kelamin
                </span>
                <span className="font-semibold text-slate-800">
                  {pegawai.jk}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  NUPTK
                </span>
                <span className="font-mono text-slate-800">
                  {pegawai.nuptk || "-"}
                </span>
              </div>

              {pegawai.tmt && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    TMT Mulai Bertugas
                  </span>
                  <span className="font-medium text-slate-800">
                    {pegawai.tmt}
                  </span>
                </div>
              )}

              {pegawai.email && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Email
                  </span>
                  <span className="font-medium text-slate-800 truncate block">
                    {pegawai.email}
                  </span>
                </div>
              )}
            </div>

            {/* Rincian Guru Mapel SMA (Kurikulum SMA / Fase E & F) */}
            {(pegawai.rumpunMapel ||
              pegawai.jumlahJamMengajar !== undefined ||
              pegawai.statusSertifikasi) && (
              <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-4 rounded-xl border border-blue-200/80 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                  <div className="flex items-center gap-1.5 text-blue-950 font-bold">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>
                      Rincian Guru Mapel SMA (Kurikulum Merdeka / SMA)
                    </span>
                  </div>
                  {pegawai.rumpunMapel && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        getRumpunMeta(pegawai.rumpunMapel).badgeClass
                      }`}
                    >
                      {pegawai.rumpunMapel}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Beban JJM */}
                  <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Beban Mengajar (JJM)
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-extrabold text-sm text-slate-900">
                        {pegawai.jumlahJamMengajar ?? "-"} Jam
                      </span>
                      {(pegawai.jumlahJamMengajar || 0) >= 24 ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          Memenuhi
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          &lt; 24 Jam
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400">
                      Standar TPG: 24 Jam/Mgg
                    </span>
                  </div>

                  {/* Sertifikasi */}
                  <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Status Sertifikasi
                    </span>
                    <div className="mt-1">
                      {pegawai.statusSertifikasi === "Sudah Sertifikasi" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Sudah Serdik</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                          Belum Serdik
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tingkat Kelas Diampu */}
                  <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100 sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Tingkat Kelas Diampu
                    </span>
                    {pegawai.tingkatKelas && pegawai.tingkatKelas.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {pegawai.tingkatKelas.map((k) => (
                          <span
                            key={k}
                            className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold"
                          >
                            {k} {k === "Kelas X" ? "(Fase E)" : "(Fase F)"}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Belum ditentukan
                      </span>
                    )}
                  </div>
                </div>

                {/* Tugas Tambahan */}
                {pegawai.tugasTambahan && (
                  <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Tugas Tambahan / Ekuivalensi Beban
                    </span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {pegawai.tugasTambahan}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Berkas / Dokumen Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-2.5">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-amber-500" />
                  <span>Arsip Berkas ({berkasList.length})</span>
                </h5>
                <button
                  type="button"
                  onClick={() => onManageBerkas(pegawai)}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] underline"
                >
                  + Kelola / Upload Berkas
                </button>
              </div>

              {berkasList.length === 0 ? (
                <p className="text-slate-400 text-[11px] italic">
                  Belum ada berkas yang diunggah untuk pegawai ini.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {berkasList.map((b) => (
                    <div
                      key={b.id}
                      className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate leading-tight">
                            {b.nama}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {b.kategori} • {b.fileSize}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadDataUrl(b.fileData, b.fileName)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-slate-100 shrink-0"
                        title="Unduh Berkas"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="font-mono font-medium text-slate-800">
                  {pegawai.noHp || "Tidak ada nomor"}
                </span>
              </div>
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-3d btn-3d-emerald text-white px-2.5 py-1 rounded-xl font-bold text-[11px] flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

            {/* Verification Stamp */}
            <div className="border-t border-dashed border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-6 h-6 text-slate-600" />
                <div>
                  <p className="font-mono font-semibold text-slate-600 text-[10px]">
                    ID#{pegawai.id}
                  </p>
                  <p className="text-[9px]">Sistem Kepegawaian SMA Negeri</p>
                </div>
              </div>
              <div className="text-right text-[10px]">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
                Status Terverifikasi Aktif
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions for Biodata tab */}
        {activeTab === "biodata" && (
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-3d btn-3d-light text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen Resmi</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(pegawai);
                }}
                className="btn-3d btn-3d-amber text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Ubah Profil</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-3d btn-3d-dark text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
