import React, { useState, useEffect, useRef } from "react";
import {
  Pegawai,
  StatusPegawai,
  JenisPtk,
  JenisKelamin,
  Pendidikan,
  RumpunMapel,
  TingkatKelas,
  StatusSertifikasi,
} from "../types";
import {
  GOLONGAN_OPTIONS,
  STATUS_OPTIONS,
  PTK_OPTIONS,
  PENDIDIKAN_OPTIONS,
} from "../data/initialData";
import {
  DAFTAR_MAPEL_SMA_STANDAR,
  RUMPUN_MAPEL_LIST,
  detectRumpunMapel,
  TINGKAT_KELAS_SMA,
} from "../data/smaMapelData";
import { compressImage } from "../utils/fileUtils";
import {
  UserPlus,
  UserCheck,
  RotateCcw,
  Save,
  X,
  Camera,
  Upload,
  Trash2,
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  Sparkles,
  Check,
} from "lucide-react";

interface PegawaiFormSectionProps {
  editingPegawai: Pegawai | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pegawai: Pegawai) => void;
}

export const PegawaiFormSection: React.FC<PegawaiFormSectionProps> = ({
  editingPegawai,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Pegawai>>({
    nip: "",
    nama: "",
    jk: "Laki-laki",
    statusPegawai: "PNS",
    jenisPtk: "Guru Mapel",
    mapel: "",
    golongan: "III/a (Penata Muda)",
    pendidikan: "S1/D4",
    noHp: "",
    email: "",
    nuptk: "",
    tmt: "",
    foto: undefined,
    berkas: [],
    // SMA Mapel Fields
    rumpunMapel: "Umum/Wajib",
    tingkatKelas: ["Kelas X", "Kelas XI", "Kelas XII"],
    jumlahJamMengajar: 24,
    statusSertifikasi: "Sudah Sertifikasi",
    tugasTambahan: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [selectedQuickRumpun, setSelectedQuickRumpun] =
    useState<RumpunMapel>("Umum/Wajib");

  const isGuru =
    (formData.jenisPtk || "").includes("Guru") ||
    (formData.jenisPtk || "").includes("Kepala") ||
    (formData.jenisPtk || "").includes("Wakil");

  useEffect(() => {
    if (editingPegawai) {
      setFormData({
        ...editingPegawai,
        rumpunMapel:
          editingPegawai.rumpunMapel ||
          detectRumpunMapel(editingPegawai.mapel || ""),
        tingkatKelas: editingPegawai.tingkatKelas || [
          "Kelas X",
          "Kelas XI",
          "Kelas XII",
        ],
        jumlahJamMengajar: editingPegawai.jumlahJamMengajar ?? 24,
        statusSertifikasi:
          editingPegawai.statusSertifikasi || "Sudah Sertifikasi",
        tugasTambahan: editingPegawai.tugasTambahan || "",
      });
      if (editingPegawai.rumpunMapel) {
        setSelectedQuickRumpun(editingPegawai.rumpunMapel);
      }
      setErrors({});
    } else {
      resetFormState();
    }
  }, [editingPegawai]);

  const resetFormState = () => {
    setFormData({
      nip: "",
      nama: "",
      jk: "Laki-laki",
      statusPegawai: "PNS",
      jenisPtk: "Guru Mapel",
      mapel: "",
      golongan: "III/a (Penata Muda)",
      pendidikan: "S1/D4",
      noHp: "",
      email: "",
      nuptk: "",
      tmt: "",
      foto: undefined,
      berkas: [],
      rumpunMapel: "Umum/Wajib",
      tingkatKelas: ["Kelas X", "Kelas XI", "Kelas XII"],
      jumlahJamMengajar: 24,
      statusSertifikasi: "Sudah Sertifikasi",
      tugasTambahan: "",
    });
    setSelectedQuickRumpun("Umum/Wajib");
    setErrors({});
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handlePhotoSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      setIsProcessingPhoto(true);
      const compressed = await compressImage(file, 400, 400, 0.85);
      setFormData((prev) => ({ ...prev, foto: compressed }));
    } catch (e) {
      console.error("Failed to compress photo", e);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleSelectQuickMapel = (mapelName: string, rumpun: RumpunMapel) => {
    setFormData((prev) => ({
      ...prev,
      mapel: mapelName,
      rumpunMapel: rumpun,
    }));
    if (errors.mapel) setErrors((prev) => ({ ...prev, mapel: "" }));
  };

  const toggleTingkatKelas = (kelas: TingkatKelas) => {
    const current = formData.tingkatKelas || [];
    if (current.includes(kelas)) {
      setFormData({
        ...formData,
        tingkatKelas: current.filter((k) => k !== kelas),
      });
    } else {
      setFormData({
        ...formData,
        tingkatKelas: [...current, kelas],
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nip?.trim()) {
      newErrors.nip = "NIP / NIPPPK / ID Pegawai wajib diisi";
    }

    if (!formData.nama?.trim()) {
      newErrors.nama = "Nama lengkap & gelar wajib diisi";
    }

    if (!formData.mapel?.trim()) {
      newErrors.mapel = "Mata pelajaran atau tugas utama wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Pegawai = {
      id: editingPegawai ? editingPegawai.id : Date.now(),
      nip: formData.nip!.trim(),
      nama: formData.nama!.trim(),
      jk: (formData.jk as JenisKelamin) || "Laki-laki",
      statusPegawai: (formData.statusPegawai as StatusPegawai) || "PNS",
      jenisPtk: (formData.jenisPtk as JenisPtk) || "Guru Mapel",
      mapel: formData.mapel!.trim(),
      golongan: formData.golongan || "-",
      pendidikan: (formData.pendidikan as Pendidikan) || "S1/D4",
      noHp: formData.noHp?.trim() || "",
      email: formData.email?.trim() || undefined,
      nuptk: formData.nuptk?.trim() || undefined,
      tmt: formData.tmt?.trim() || undefined,
      foto: formData.foto,
      berkas: formData.berkas || [],
      // SMA Mapel Fields
      rumpunMapel: isGuru
        ? formData.rumpunMapel || detectRumpunMapel(formData.mapel || "")
        : undefined,
      tingkatKelas: isGuru ? formData.tingkatKelas || [] : undefined,
      jumlahJamMengajar: isGuru
        ? Number(formData.jumlahJamMengajar) || 0
        : undefined,
      statusSertifikasi: isGuru ? formData.statusSertifikasi : undefined,
      tugasTambahan: formData.tugasTambahan?.trim() || undefined,
    };

    onSave(payload);
    resetFormState();
  };

  // Auto-adjust default Golongan when Status changes
  const handleStatusChange = (status: StatusPegawai) => {
    let newGolongan = formData.golongan;
    if (status === "PPPK") {
      newGolongan = "IX (PPPK)";
    } else if (
      status === "GTT (Guru Tidak Tetap)" ||
      status === "PTT (Pegawai Tidak Tetap)"
    ) {
      newGolongan = "-";
    } else if (
      status === "PNS" &&
      (formData.golongan === "-" || formData.golongan?.includes("PPPK"))
    ) {
      newGolongan = "III/a (Penata Muda)";
    }

    setFormData({
      ...formData,
      statusPegawai: status,
      golongan: newGolongan,
    });
  };

  if (!isOpen) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 transition-all duration-200">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              editingPegawai
                ? "bg-amber-100 text-amber-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {editingPegawai ? (
              <UserCheck className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
              {editingPegawai
                ? "Edit Data Pegawai"
                : "Form Tambah Pegawai Baru"}
            </h2>
            <p className="text-xs text-slate-500">
              {editingPegawai
                ? `Memperbarui profil ${editingPegawai.nama}`
                : "Lengkapi identitas pendidik atau tenaga kependidikan SMAN"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            <span className="text-red-500 font-bold">*</span> Wajib diisi
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            title="Tutup Form"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Photo Upload & Preview Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-20 h-24 rounded-xl bg-white border-2 border-slate-300 shadow-sm overflow-hidden flex items-center justify-center relative">
              {formData.foto ? (
                <img
                  src={formData.foto}
                  alt="Preview Pegawai"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <Camera className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <span className="text-[10px] leading-tight block">
                    Pas Foto 3x4
                  </span>
                </div>
              )}
            </div>
            {formData.foto && (
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, foto: undefined }))
                }
                className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 shadow-sm hover:bg-rose-600 transition"
                title="Hapus Foto"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-slate-800">Pas Foto Pegawai</span>
              <span className="text-[10px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
                Formal / Dinas
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Unggah foto formal guru/tendik dengan seragam dinas atau kemeja
              rapi.
            </p>

            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhotoSelect(f);
                }}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isProcessingPhoto}
                className="btn-3d btn-3d-light text-blue-700 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {isProcessingPhoto
                    ? "Memproses..."
                    : formData.foto
                      ? "Ganti Foto"
                      : "Pilih Foto"}
                </span>
              </button>

              <span className="text-[11px] text-slate-400">
                Maks. 5 MB (Otomatis dikompresi)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* NIP */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              NIP / NIPPPK / ID Pegawai <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nip || ""}
              onChange={(e) => {
                setFormData({ ...formData, nip: e.target.value });
                if (errors.nip) setErrors({ ...errors, nip: "" });
              }}
              placeholder="Contoh: 198501152010011005"
              className={`w-full border rounded-lg p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition ${
                errors.nip
                  ? "border-red-400 ring-2 ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />
            {errors.nip && (
              <p className="text-[11px] text-red-500 mt-1">{errors.nip}</p>
            )}
          </div>

          {/* Nama Lengkap & Gelar */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama || ""}
              onChange={(e) => {
                setFormData({ ...formData, nama: e.target.value });
                if (errors.nama) setErrors({ ...errors, nama: "" });
              }}
              placeholder="Contoh: Dr. Budi Santoso, M.Pd."
              className={`w-full border rounded-lg p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition ${
                errors.nama
                  ? "border-red-400 ring-2 ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />
            {errors.nama && (
              <p className="text-[11px] text-red-500 mt-1">{errors.nama}</p>
            )}
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.jk || "Laki-laki"}
              onChange={(e) =>
                setFormData({ ...formData, jk: e.target.value as JenisKelamin })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          {/* Status Kepegawaian */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Status Kepegawaian <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.statusPegawai || "PNS"}
              onChange={(e) =>
                handleStatusChange(e.target.value as StatusPegawai)
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Jenis PTK */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jenis PTK (Pendidik / Tendik){" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.jenisPtk || "Guru Mapel"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jenisPtk: e.target.value as JenisPtk,
                })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            >
              {PTK_OPTIONS.map((ptk) => (
                <option key={ptk} value={ptk}>
                  {ptk}
                </option>
              ))}
            </select>
          </div>

          {/* Mata Pelajaran / Tugas Utama */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Mata Pelajaran / Tugas Utama{" "}
                <span className="text-red-500">*</span>
              </label>
              {isGuru && (
                <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Pilih Cepat Mapel SMA di Bawah</span>
                </span>
              )}
            </div>
            <input
              type="text"
              value={formData.mapel || ""}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({
                  ...formData,
                  mapel: val,
                  rumpunMapel: formData.rumpunMapel || detectRumpunMapel(val),
                });
                if (errors.mapel) setErrors({ ...errors, mapel: "" });
              }}
              placeholder="Contoh: Fisika, Matematika Tingkat Lanjut, Sosiologi, dll."
              className={`w-full border rounded-lg p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition ${
                errors.mapel
                  ? "border-red-400 ring-2 ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />
            {errors.mapel && (
              <p className="text-[11px] text-red-500 mt-1">{errors.mapel}</p>
            )}
          </div>

          {/* Pangkat / Golongan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pangkat / Golongan Ruang
            </label>
            <select
              value={formData.golongan || "-"}
              onChange={(e) =>
                setFormData({ ...formData, golongan: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            >
              {GOLONGAN_OPTIONS.map((gol) => (
                <option key={gol} value={gol}>
                  {gol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick SMA Mapel Selector for Teachers */}
        {isGuru && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-200/80 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-blue-100 pb-2">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>
                  Katalog Mata Pelajaran Tingkat SMA (Kurikulum Merdeka / SMA)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Klik mapel untuk mengisi otomatis
              </span>
            </div>

            {/* Rumpun selector tabs */}
            <div className="flex flex-wrap gap-1.5">
              {RUMPUN_MAPEL_LIST.filter((r) => r.id !== "Lainnya").map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedQuickRumpun(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition active:scale-95 ${
                    selectedQuickRumpun === r.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Subject pills for selected rumpun */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {DAFTAR_MAPEL_SMA_STANDAR.filter(
                (m) => m.rumpun === selectedQuickRumpun,
              ).map((mapel) => {
                const isCurrent =
                  formData.mapel?.toLowerCase() === mapel.nama.toLowerCase();
                return (
                  <button
                    key={mapel.nama}
                    type="button"
                    onClick={() =>
                      handleSelectQuickMapel(mapel.nama, mapel.rumpun)
                    }
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 active:scale-95 ${
                      isCurrent
                        ? "bg-emerald-600 text-white font-bold ring-2 ring-emerald-300"
                        : "bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {isCurrent && <Check className="w-3 h-3" />}
                    <span>{mapel.nama}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({mapel.jamStandarPerMinggu}J)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed High School Subject Teacher Fields (Rumpun, Kelas, JJM, Serdik, Tugas Tambahan) */}
        {isGuru && (
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-800">
                Rincian Beban Tugas & Mengajar SMA (Fase E & F)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rumpun Mapel */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rumpun Kurikulum SMA
                </label>
                <select
                  value={formData.rumpunMapel || "Umum/Wajib"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rumpunMapel: e.target.value as RumpunMapel,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium"
                >
                  {RUMPUN_MAPEL_LIST.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tingkat Kelas Diampu */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tingkat Kelas Diampu
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {TINGKAT_KELAS_SMA.map((k) => {
                    const isChecked = formData.tingkatKelas?.includes(k.id);
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => toggleTingkatKelas(k.id)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition text-center ${
                          isChecked
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                        title={k.fase}
                      >
                        {k.label.replace("Kelas ", "Kls ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Beban Jam Mengajar (JJM) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Beban Jam Mengajar (JJM)
                  </label>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      (formData.jumlahJamMengajar || 0) >= 24
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {(formData.jumlahJamMengajar || 0) >= 24
                      ? "Memenuhi 24J"
                      : "< 24 Jam"}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.jumlahJamMengajar ?? 24}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jumlahJamMengajar: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-xs">
                    Jam / Minggu
                  </span>
                </div>
              </div>

              {/* Status Sertifikasi Pendidik */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sertifikasi Pendidik (TPG)
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {(
                    [
                      "Sudah Sertifikasi",
                      "Belum Sertifikasi",
                    ] as StatusSertifikasi[]
                  ).map((status) => {
                    const isSelected = formData.statusSertifikasi === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            statusSertifikasi: status,
                          })
                        }
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition text-center ${
                          isSelected
                            ? status === "Sudah Sertifikasi"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-slate-700 text-white border-slate-700 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {status === "Sudah Sertifikasi"
                          ? "Sudah Serdik"
                          : "Belum Serdik"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tugas Tambahan / Ekuivalensi */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tugas Tambahan / Ekuivalensi Jam Sekolah
              </label>
              <input
                type="text"
                value={formData.tugasTambahan || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tugasTambahan: e.target.value })
                }
                placeholder="Contoh: Wali Kelas XII MIPA 1 / Kepala Laboratorium Fisika / Pembina OSIS"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pendidikan Terakhir */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pendidikan Terakhir
            </label>
            <select
              value={formData.pendidikan || "S1/D4"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pendidikan: e.target.value as Pendidikan,
                })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            >
              {PENDIDIKAN_OPTIONS.map((pend) => (
                <option key={pend} value={pend}>
                  {pend}
                </option>
              ))}
            </select>
          </div>

          {/* No. HP / WhatsApp */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              No. HP / WhatsApp
            </label>
            <input
              type="text"
              value={formData.noHp || ""}
              onChange={(e) =>
                setFormData({ ...formData, noHp: e.target.value })
              }
              placeholder="Contoh: 081234567890"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* NUPTK (Opsional) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              NUPTK{" "}
              <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={formData.nuptk || ""}
              onChange={(e) =>
                setFormData({ ...formData, nuptk: e.target.value })
              }
              placeholder="Contoh: 4534754656200032"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Email Sekolah / Pribadi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email{" "}
              <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="nama@sman.sch.id"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* TMT (Terhitung Mulai Tanggal) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              TMT (Tanggal Mulai Tugas){" "}
              <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="date"
              value={formData.tmt || ""}
              onChange={(e) =>
                setFormData({ ...formData, tmt: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={resetFormState}
            className="btn-3d btn-3d-light text-slate-600 font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Kosongkan Isian</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-3d btn-3d-light text-slate-700 font-bold px-4 py-2 rounded-xl text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-3d btn-3d-blue text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{editingPegawai ? "Perbarui Data" : "Simpan Pegawai"}</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
