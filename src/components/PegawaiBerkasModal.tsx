import React, { useState, useRef } from "react";
import { Pegawai, BerkasPegawai } from "../types";
import { KATEGORI_BERKAS_OPTIONS } from "../data/initialData";
import {
  formatFileSize,
  readFileAsDataUrl,
  downloadDataUrl,
} from "../utils/fileUtils";
import {
  X,
  FileText,
  Upload,
  FolderOpen,
  Trash2,
  Download,
  File,
  FileCheck,
  AlertCircle,
  Plus,
  ExternalLink,
} from "lucide-react";

interface PegawaiBerkasModalProps {
  pegawai: Pegawai | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBerkas: (pegawaiId: number, updatedBerkas: BerkasPegawai[]) => void;
  onShowToast?: (
    title: string,
    message: string,
    type?: "success" | "warning" | "error" | "info",
  ) => void;
}

export const PegawaiBerkasModal: React.FC<PegawaiBerkasModalProps> = ({
  pegawai,
  isOpen,
  onClose,
  onUpdateBerkas,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [namaBerkas, setNamaBerkas] = useState("");
  const [kategori, setKategori] = useState<string>(KATEGORI_BERKAS_OPTIONS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [filterKategori, setFilterKategori] = useState("ALL");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !pegawai) return null;

  const currentBerkas = pegawai.berkas || [];

  const handleFileSelect = (file: File) => {
    // Limit to 10MB to avoid excessive browser memory usage
    if (file.size > 10 * 1024 * 1024) {
      onShowToast?.(
        "Ukuran File Terlalu Besar",
        "Maksimal ukuran file adalah 10 MB.",
        "warning",
      );
      return;
    }
    setSelectedFile(file);
    if (!namaBerkas) {
      // Clean extension for default name
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      setNamaBerkas(cleanName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      onShowToast?.(
        "Pilih File",
        "Silakan pilih file berkas terlebih dahulu.",
        "warning",
      );
      return;
    }

    try {
      setIsUploading(true);
      const fileData = await readFileAsDataUrl(selectedFile);
      const newBerkas: BerkasPegawai = {
        id: `berkas-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nama: namaBerkas.trim() || selectedFile.name,
        kategori,
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        fileType: selectedFile.type || "application/octet-stream",
        fileData,
        uploadedAt: new Date().toISOString().slice(0, 10),
      };

      const updated = [newBerkas, ...currentBerkas];
      onUpdateBerkas(pegawai.id, updated);
      onShowToast?.(
        "Berkas Berhasil Diupload",
        `Dokumen "${newBerkas.nama}" telah disimpan.`,
      );

      // Reset upload form
      setSelectedFile(null);
      setNamaBerkas("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      onShowToast?.(
        "Gagal Upload",
        "Terjadi kesalahan saat memproses file.",
        "error",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBerkas = (berkasId: string, nama: string) => {
    if (window.confirm(`Hapus berkas "${nama}"?`)) {
      const updated = currentBerkas.filter((b) => b.id !== berkasId);
      onUpdateBerkas(pegawai.id, updated);
      onShowToast?.(
        "Berkas Dihapus",
        `Berkas "${nama}" telah dihapus.`,
        "warning",
      );
    }
  };

  const filteredList = currentBerkas.filter(
    (b) => filterKategori === "ALL" || b.kategori === filterKategori,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {pegawai.foto ? (
              <img
                src={pegawai.foto}
                alt={pegawai.nama}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-700 border-2 border-blue-400 flex items-center justify-center font-bold text-amber-300">
                {pegawai.nama.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide">
                  {pegawai.nama}
                </h3>
                <span className="bg-blue-600/60 text-blue-200 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {pegawai.nip}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Arsip Dokumen & Berkas Kepegawaian SMAN ({currentBerkas.length}{" "}
                Berkas)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Upload Form Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Unggah Berkas / Dokumen Baru</span>
            </h4>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              {/* Drag & Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/80 ring-2 ring-blue-200"
                    : selectedFile
                      ? "border-emerald-400 bg-emerald-50/50"
                      : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold">{selectedFile.name}</span>
                    <span className="text-slate-500 text-[11px]">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setNamaBerkas("");
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="ml-2 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="font-semibold text-slate-700">
                      Tarik & lepas file ke sini, atau{" "}
                      <span className="text-blue-600 underline">
                        klik untuk memilih
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Mendukung PDF, DOC, DOCX, JPG, PNG (Maksimal 10 MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Document Details Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama / Judul Dokumen <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaBerkas}
                    onChange={(e) => setNamaBerkas(e.target.value)}
                    placeholder="Contoh: SK Pengangkatan PNS, Ijazah S1"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Berkas
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  >
                    {KATEGORI_BERKAS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className={`btn-3d px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                    !selectedFile || isUploading
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 pointer-events-none"
                      : "btn-3d-blue text-white"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUploading ? "Mengunggah..." : "Simpan Berkas"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Documents List */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 mb-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span>Daftar Berkas Tersimpan ({filteredList.length})</span>
              </h4>

              {/* Category Filter */}
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Semua Kategori</option>
                {KATEGORI_BERKAS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {filteredList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                <p className="font-semibold text-slate-600">
                  Belum ada berkas dalam arsip
                </p>
                <p className="text-[11px] text-slate-400">
                  Gunakan formulir di atas untuk mengunggah SK, ijazah, atau
                  sertifikat pegawai.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredList.map((berkas) => (
                  <div
                    key={berkas.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        {berkas.fileType.includes("pdf") ? (
                          <FileText className="w-4 h-4 text-rose-600" />
                        ) : berkas.fileType.includes("image") ? (
                          <FileText className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <File className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h5 className="font-bold text-slate-800 leading-tight">
                            {berkas.nama}
                          </h5>
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.2 rounded-md">
                            {berkas.kategori}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {berkas.fileName} • {berkas.fileSize} • Diunggah:{" "}
                          {berkas.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          downloadDataUrl(berkas.fileData, berkas.fileName)
                        }
                        className="btn-3d btn-3d-light text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        title="Unduh / Buka Berkas"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>Unduh</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteBerkas(berkas.id, berkas.nama)
                        }
                        className="btn-3d-icon btn-3d-rose text-white p-1.5 rounded-lg text-xs"
                        title="Hapus Berkas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-3d btn-3d-dark text-white font-bold px-5 py-2 rounded-xl text-xs"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
