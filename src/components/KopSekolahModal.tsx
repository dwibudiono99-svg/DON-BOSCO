import React, { useState, useRef } from "react";
import { KopSekolah } from "../types";
import { PRESET_LOGOS, defaultKopSekolah } from "../data/defaultKopData";
import {
  X,
  Building2,
  Upload,
  RotateCcw,
  Check,
  Eye,
  Camera,
  Trash2,
  Sparkles,
  Info,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
} from "lucide-react";

interface KopSekolahModalProps {
  isOpen: boolean;
  onClose: () => void;
  kopData: KopSekolah;
  onSaveKop: (updatedKop: KopSekolah) => void;
}

export const KopSekolahModal: React.FC<KopSekolahModalProps> = ({
  isOpen,
  onClose,
  kopData,
  onSaveKop,
}) => {
  const [formData, setFormData] = useState<KopSekolah>({ ...kopData });
  const [activeTab, setActiveTab] = useState<"teks" | "logo" | "preview">(
    "teks",
  );
  const [logoTab, setLogoTab] = useState<"kiri" | "kanan">("kiri");
  const [kopPreviewTheme, setKopPreviewTheme] = useState<
    "standar" | "futuristik"
  >("futuristik");

  const fileInputKiriRef = useRef<HTMLInputElement>(null);
  const fileInputKananRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Text Field Change
  const handleChange = (
    field: keyof KopSekolah,
    value: string | boolean | undefined,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Upload Logo Kiri
  const handleUploadLogoKiri = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleChange("logoKiri", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Logo Kanan
  const handleUploadLogoKanan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleChange("logoKanan", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to Default
  const handleResetToDefault = () => {
    if (
      window.confirm(
        "Kembalikan format KOP sekolah ke template default SIMPEG SMAN?",
      )
    ) {
      setFormData({ ...defaultKopSekolah });
    }
  };

  // Submit Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKop(formData);
    onClose();
  };

  return (
    <div
      id="modal-edit-kop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Pengaturan & Edit KOP Surat SIMPEG SMAN
              </h3>
              <p className="text-xs text-slate-300">
                Ubah identitas instansi, nama SMA, alamat lengkap surat, dan
                logo resmi KOP.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("teks")}
            className={`py-2.5 px-4 border-b-2 font-bold transition flex items-center gap-1.5 ${
              activeTab === "teks"
                ? "border-blue-600 text-blue-700 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Rincian & Alamat Sekolah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logo")}
            className={`py-2.5 px-4 border-b-2 font-bold transition flex items-center gap-1.5 ${
              activeTab === "logo"
                ? "border-blue-600 text-blue-700 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Kelola & Ganti Logo KOP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`py-2.5 px-4 border-b-2 font-bold transition flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "border-blue-600 text-blue-700 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau KOP Surat</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Rincian & Alamat */}
          {activeTab === "teks" && (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Group 1: Instansi Atasan */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Instansi Induk / Pemerintah Daerah
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pemerintah Provinsi / Daerah{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.instansiAtas}
                      onChange={(e) =>
                        handleChange("instansiAtas", e.target.value)
                      }
                      placeholder="e.g. PEMERINTAH PROVINSI JAWA TIMUR"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium uppercase text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Dinas Pendidikan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.dinas}
                      onChange={(e) => handleChange("dinas", e.target.value)}
                      placeholder="e.g. DINAS PENDIDIKAN"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium uppercase text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Cabang Dinas / Wilayah Pendidikan
                    </label>
                    <input
                      type="text"
                      value={formData.cabangDinas}
                      onChange={(e) =>
                        handleChange("cabangDinas", e.target.value)
                      }
                      placeholder="e.g. CABANG DINAS PENDIDIKAN WILAYAH KOTA MALANG DAN KOTA BATU"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium uppercase text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Nama Sekolah & Akreditasi */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Identitas Sekolah Menengah Atas (SMA)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Resmi Sekolah{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.namaSekolah}
                      onChange={(e) =>
                        handleChange("namaSekolah", e.target.value)
                      }
                      placeholder="e.g. SMA NEGERI 1 TELADAN"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-bold uppercase text-xs text-blue-950"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Status Akreditasi
                    </label>
                    <input
                      type="text"
                      value={formData.statusAkreditasi}
                      onChange={(e) =>
                        handleChange("statusAkreditasi", e.target.value)
                      }
                      placeholder="e.g. Akreditasi A"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NPSN (Nomor Pokok Sekolah)
                    </label>
                    <input
                      type="text"
                      value={formData.npsn}
                      onChange={(e) => handleChange("npsn", e.target.value)}
                      placeholder="e.g. 20533812"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NSS (Nomor Statistik Sekolah)
                    </label>
                    <input
                      type="text"
                      value={formData.nss || ""}
                      onChange={(e) => handleChange("nss", e.target.value)}
                      placeholder="e.g. 301056001001"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Alamat Lengkap Sesuai KOP Pada Umumnya */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Alamat Lengkap Sekolah (Sesuai KOP Surat Umumnya)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Jalan, Nomor, atau Kompleks Gedung{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.alamatJalan}
                      onChange={(e) =>
                        handleChange("alamatJalan", e.target.value)
                      }
                      placeholder="e.g. Jl. Pendidikan Nasional No. 45, Kompleks Pendidikan Terpadu"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kelurahan / Desa
                    </label>
                    <input
                      type="text"
                      value={formData.kelurahanDesa || ""}
                      onChange={(e) =>
                        handleChange("kelurahanDesa", e.target.value)
                      }
                      placeholder="e.g. Kelurahan Lowokwaru"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kecamatan
                    </label>
                    <input
                      type="text"
                      value={formData.kecamatan || ""}
                      onChange={(e) =>
                        handleChange("kecamatan", e.target.value)
                      }
                      placeholder="e.g. Kecamatan Lowokwaru"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kota / Kabupaten <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.kotaKabupaten}
                      onChange={(e) =>
                        handleChange("kotaKabupaten", e.target.value)
                      }
                      placeholder="e.g. Kota Malang"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Provinsi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.provinsi}
                      onChange={(e) => handleChange("provinsi", e.target.value)}
                      placeholder="e.g. Jawa Timur"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={formData.kodePos}
                      onChange={(e) => handleChange("kodePos", e.target.value)}
                      placeholder="e.g. 65141"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Kontak Resmi KOP */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  Kontak Resmi, Email & Website KOP
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      value={formData.telepon}
                      onChange={(e) => handleChange("telepon", e.target.value)}
                      placeholder="e.g. (0341) 551234"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Faksimili (Fax)
                    </label>
                    <input
                      type="text"
                      value={formData.faks || ""}
                      onChange={(e) => handleChange("faks", e.target.value)}
                      placeholder="e.g. (0341) 551235"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Alamat Email Resmi Sekolah
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="e.g. info@sman1teladan.sch.id"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Website Resmi Sekolah
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="e.g. www.sman1teladan.sch.id"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Kelola & Ganti Logo KOP */}
          {activeTab === "logo" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setLogoTab("kiri")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    logoTab === "kiri"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Logo Kiri (Tut Wuri / Pemda)
                </button>
                <button
                  type="button"
                  onClick={() => setLogoTab("kanan")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    logoTab === "kanan"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Logo Kanan (Lambang SMAN)
                </button>
              </div>

              {/* Logo Kiri Section */}
              {logoTab === "kiri" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-24 rounded-xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center p-2 overflow-hidden shrink-0">
                      {formData.logoKiri ? (
                        <img
                          src={formData.logoKiri}
                          alt="Pratinjau Logo Kiri"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">
                          Tidak ada
                        </span>
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Logo Kiri KOP (Posisi Utama / Lambang Resmi)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Biasanya menggunakan lambang Tut Wuri Handayani atau
                        Lambang Pemerintah Provinsi/Daerah.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputKiriRef.current?.click()}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File Logo Baru</span>
                        </button>
                        <input
                          ref={fileInputKiriRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadLogoKiri}
                        />

                        {formData.logoKiri && (
                          <button
                            type="button"
                            onClick={() => handleChange("logoKiri", "")}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Logo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preset Logo Kiri */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Pilih dari Preset Logo KOP Siap Pakai:
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleChange("logoKiri", PRESET_LOGOS.tutWuri)
                        }
                        className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition ${
                          formData.logoKiri === PRESET_LOGOS.tutWuri
                            ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={PRESET_LOGOS.tutWuri}
                          alt="Tut Wuri Handayani"
                          className="w-12 h-12 object-contain"
                        />
                        <span className="text-[11px] font-bold text-slate-800">
                          Tut Wuri Handayani
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleChange("logoKiri", PRESET_LOGOS.pemdaJatim)
                        }
                        className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition ${
                          formData.logoKiri === PRESET_LOGOS.pemdaJatim
                            ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={PRESET_LOGOS.pemdaJatim}
                          alt="Lambang Daerah"
                          className="w-12 h-12 object-contain"
                        />
                        <span className="text-[11px] font-bold text-slate-800">
                          Lambang Provinsi
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleChange("logoKiri", PRESET_LOGOS.garudaKuningan)
                        }
                        className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition ${
                          formData.logoKiri === PRESET_LOGOS.garudaKuningan
                            ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={PRESET_LOGOS.garudaKuningan}
                          alt="Bintang Kuningan"
                          className="w-12 h-12 object-contain"
                        />
                        <span className="text-[11px] font-bold text-slate-800">
                          Lambang Kuningan
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleChange("logoKiri", PRESET_LOGOS.smanCrest)
                        }
                        className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition ${
                          formData.logoKiri === PRESET_LOGOS.smanCrest
                            ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={PRESET_LOGOS.smanCrest}
                          alt="Crest SMAN"
                          className="w-12 h-12 object-contain"
                        />
                        <span className="text-[11px] font-bold text-slate-800">
                          Lambang SMAN
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Logo Kanan Section */}
              {logoTab === "kanan" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Logo Kanan KOP (Lambang Sekolah SMAN)
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.tampilkanLogoKanan}
                          onChange={(e) =>
                            handleChange("tampilkanLogoKanan", e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span>Aktifkan KOP Dua Logo</span>
                      </label>
                    </div>

                    <p className="text-xs text-slate-500">
                      Format surat resmi SMA dapat menampilkan lambang Tut Wuri
                      di sebelah kiri dan lambang sekolah SMA di sebelah kanan.
                    </p>

                    {formData.tampilkanLogoKanan && (
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                        <div className="w-24 h-24 rounded-xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center p-2 overflow-hidden shrink-0">
                          {formData.logoKanan ? (
                            <img
                              src={formData.logoKanan}
                              alt="Pratinjau Logo Kanan"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">
                              Tidak ada
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => fileInputKananRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Logo Sekolah Baru</span>
                          </button>
                          <input
                            ref={fileInputKananRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUploadLogoKanan}
                          />

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleChange(
                                  "logoKanan",
                                  PRESET_LOGOS.smanCrest,
                                )
                              }
                              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg"
                            >
                              Gunakan Lambang SMAN
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleChange(
                                  "logoKanan",
                                  PRESET_LOGOS.garudaKuningan,
                                )
                              }
                              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg"
                            >
                              Gunakan Logo Bintang
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Pratinjau KOP Surat */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-700">
                  Pratinjau KOP Surat Resmi SMAN:
                </span>

                {/* Theme Selector Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setKopPreviewTheme("futuristik")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      kopPreviewTheme === "futuristik"
                        ? "bg-slate-900 text-cyan-400 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mode Futuristik</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setKopPreviewTheme("standar")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      kopPreviewTheme === "standar"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Standar Cetak A4</span>
                  </button>
                </div>
              </div>

              {/* Live Rendered Letterhead with Conditional Background */}
              {kopPreviewTheme === "futuristik" ? (
                /* Futuristic Cybernetic Studio Stage */
                <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 bg-gradient-to-b from-[#060b14] via-[#0a1628] to-[#040810] border-2 border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.25)]">
                  {/* Cyber Grid Background */}
                  <div
                    className="absolute inset-0 opacity-25 pointer-events-none animate-grid-drift"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 50% 50%, rgba(6,182,212,0.2) 0%, transparent 60%), linear-gradient(rgba(6,182,212,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.12) 1px, transparent 1px)",
                      backgroundSize: "36px 36px, 36px 36px, 36px 36px",
                    }}
                  />

                  {/* Corner Crosshairs */}
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400/60 select-none">
                    ┌ HUD.SMAN.KOP.v4
                  </div>
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-cyan-400/60 select-none">
                    OFFICIAL.SPEC ┐
                  </div>
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/60 select-none">
                    └ ISO 9001:2015
                  </div>
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-400/60 select-none">
                    SYSTEM SECURE ┘
                  </div>

                  {/* Glowing Floating Letterhead Panel */}
                  <div className="relative z-10 bg-white/95 rounded-xl p-6 sm:p-7 shadow-2xl backdrop-blur-md border border-cyan-300/40">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                      {/* Left Logo */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
                        {formData.logoKiri ? (
                          <img
                            src={formData.logoKiri}
                            alt="Logo Kiri"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Tanpa Logo
                          </span>
                        )}
                      </div>

                      {/* Center Text */}
                      <div className="flex-1 text-center px-2">
                        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 font-serif leading-tight">
                          {formData.instansiAtas || "PEMERINTAH PROVINSI"}
                        </h3>
                        <h4 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 font-serif leading-tight mt-0.5">
                          {formData.dinas || "DINAS PENDIDIKAN"}
                        </h4>
                        {formData.cabangDinas && (
                          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-normal text-slate-600 font-serif mt-0.5">
                            {formData.cabangDinas}
                          </p>
                        )}

                        <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-blue-950 font-serif mt-1.5 leading-snug">
                          {formData.namaSekolah || "SMA NEGERI 1"}
                        </h2>

                        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-600 mt-1">
                          {formData.statusAkreditasi && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.2 rounded-full font-bold">
                              {formData.statusAkreditasi}
                            </span>
                          )}
                          {formData.npsn && <span>NPSN: {formData.npsn}</span>}
                          {formData.nss && <span>NSS: {formData.nss}</span>}
                        </div>

                        <p className="text-[11px] text-slate-600 mt-1">
                          {formData.alamatJalan}
                          {formData.kelurahanDesa &&
                            `, ${formData.kelurahanDesa}`}
                          {formData.kecamatan && `, ${formData.kecamatan}`}
                          {formData.kotaKabupaten &&
                            `, ${formData.kotaKabupaten}`}
                          {formData.provinsi && `, ${formData.provinsi}`}
                          {formData.kodePos &&
                            ` - Kode Pos: ${formData.kodePos}`}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                          {formData.telepon && (
                            <span>Telp: {formData.telepon}</span>
                          )}
                          {formData.faks && <span>Fax: {formData.faks}</span>}
                          {formData.email && (
                            <span className="text-blue-700">
                              Email: {formData.email}
                            </span>
                          )}
                          {formData.website && (
                            <span className="text-blue-700">
                              Web: {formData.website}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Logo */}
                      {formData.tampilkanLogoKanan && (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
                          {formData.logoKanan ? (
                            <img
                              src={formData.logoKanan}
                              alt="Logo Kanan"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Logo SMAN
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Official Indonesian Double Border Line */}
                    <div className="mt-4 pt-1">
                      <div className="h-[3px] bg-slate-900 w-full mb-[2px]"></div>
                      <div className="h-[1px] bg-slate-900 w-full"></div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Paper Presentation */
                <div className="bg-white border-2 border-slate-300 rounded-xl p-5 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    {/* Left Logo */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded-xl">
                      {formData.logoKiri ? (
                        <img
                          src={formData.logoKiri}
                          alt="Logo Kiri"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Tanpa Logo
                        </span>
                      )}
                    </div>

                    {/* Center Text */}
                    <div className="flex-1 text-center px-2">
                      <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 font-serif leading-tight">
                        {formData.instansiAtas || "PEMERINTAH PROVINSI"}
                      </h3>
                      <h4 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 font-serif leading-tight mt-0.5">
                        {formData.dinas || "DINAS PENDIDIKAN"}
                      </h4>
                      {formData.cabangDinas && (
                        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-normal text-slate-600 font-serif mt-0.5">
                          {formData.cabangDinas}
                        </p>
                      )}

                      <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-blue-950 font-serif mt-1.5 leading-snug">
                        {formData.namaSekolah || "SMA NEGERI 1"}
                      </h2>

                      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-600 mt-1">
                        {formData.statusAkreditasi && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.2 rounded-full font-bold">
                            {formData.statusAkreditasi}
                          </span>
                        )}
                        {formData.npsn && <span>NPSN: {formData.npsn}</span>}
                        {formData.nss && <span>NSS: {formData.nss}</span>}
                      </div>

                      <p className="text-[11px] text-slate-600 mt-1">
                        {formData.alamatJalan}
                        {formData.kelurahanDesa &&
                          `, ${formData.kelurahanDesa}`}
                        {formData.kecamatan && `, ${formData.kecamatan}`}
                        {formData.kotaKabupaten &&
                          `, ${formData.kotaKabupaten}`}
                        {formData.provinsi && `, ${formData.provinsi}`}
                        {formData.kodePos && ` - Kode Pos: ${formData.kodePos}`}
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                        {formData.telepon && (
                          <span>Telp: {formData.telepon}</span>
                        )}
                        {formData.faks && <span>Fax: {formData.faks}</span>}
                        {formData.email && (
                          <span className="text-blue-700">
                            Email: {formData.email}
                          </span>
                        )}
                        {formData.website && (
                          <span className="text-blue-700">
                            Web: {formData.website}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Logo */}
                    {formData.tampilkanLogoKanan && (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded-xl">
                        {formData.logoKanan ? (
                          <img
                            src={formData.logoKanan}
                            alt="Logo Kanan"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Logo SMAN
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Indonesian Official Double Border Line */}
                  <div className="mt-4 pt-1">
                    <div className="h-[3px] bg-slate-900 w-full mb-[2px]"></div>
                    <div className="h-[1px] bg-slate-900 w-full"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="btn-3d btn-3d-light text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Template Default</span>
          </button>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn-3d btn-3d-light px-4 py-2 rounded-xl text-slate-700 font-bold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={(e) => handleSave(e as any)}
              className="btn-3d btn-3d-blue px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan KOP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
