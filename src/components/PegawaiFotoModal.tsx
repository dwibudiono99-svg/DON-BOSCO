import React, { useState, useRef } from "react";
import { Pegawai } from "../types";
import { compressImage } from "../utils/fileUtils";
import {
  Camera,
  Upload,
  Trash2,
  X,
  Check,
  Image as ImageIcon,
} from "lucide-react";

interface PegawaiFotoModalProps {
  pegawai: Pegawai | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateFoto: (pegawaiId: number, fotoDataUrl: string | undefined) => void;
  onShowToast?: (
    title: string,
    message: string,
    type?: "success" | "warning" | "error" | "info",
  ) => void;
}

export const PegawaiFotoModal: React.FC<PegawaiFotoModalProps> = ({
  pegawai,
  isOpen,
  onClose,
  onUpdateFoto,
  onShowToast,
}) => {
  const [previewFoto, setPreviewFoto] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (pegawai) {
      setPreviewFoto(pegawai.foto);
    }
  }, [pegawai]);

  if (!isOpen || !pegawai) return null;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onShowToast?.(
        "Format Tidak Sesuai",
        "Silakan pilih file gambar (JPG, PNG, JPEG).",
        "warning",
      );
      return;
    }

    try {
      setIsProcessing(true);
      // Compress to optimal passport size (max 400x400)
      const compressed = await compressImage(file, 400, 400, 0.85);
      setPreviewFoto(compressed);
      onShowToast?.(
        "Foto Dipilih",
        'Klik "Simpan Foto" untuk memperbarui profil.',
        "info",
      );
    } catch (err) {
      console.error(err);
      onShowToast?.(
        "Gagal Memproses Gambar",
        "Terjadi kesalahan saat memproses foto.",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    onUpdateFoto(pegawai.id, previewFoto);
    onShowToast?.(
      "Foto Diperbarui",
      `Foto profil ${pegawai.nama} berhasil diperbarui.`,
    );
    onClose();
  };

  const handleRemove = () => {
    setPreviewFoto(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm tracking-wide">
              Foto Pegawai: {pegawai.nama}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-5">
          {/* Photo Display Frame */}
          <div className="relative inline-block mx-auto">
            <div className="w-36 h-44 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt={pegawai.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-2xl mb-1">
                    {pegawai.nama.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Belum Ada Foto
                  </span>
                </div>
              )}
            </div>

            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-md border-2 border-white">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm">{pegawai.nama}</h4>
            <p className="text-xs text-blue-700 font-mono mt-0.5">
              NIP: {pegawai.nip}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {pegawai.jenisPtk} — {pegawai.mapel}
            </p>
          </div>

          {/* Upload Drop Area */}
          <div
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0])
                handleFile(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition text-xs ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
            <Upload className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="font-semibold text-slate-700">
              {isProcessing ? "Mengompres foto..." : "Pilih Foto Baru"}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Tarik & lepas foto ke sini (JPG, PNG, WebP)
            </p>
          </div>

          {previewFoto && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleRemove}
                className="btn-3d btn-3d-light text-rose-600 hover:text-rose-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Hapus Foto (Gunakan Inisial)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="btn-3d btn-3d-light text-slate-700 font-bold px-4 py-2 rounded-xl text-xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="btn-3d btn-3d-blue text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
