import React, { useState } from 'react';
import { Siswa } from '../types';
import { createOfficialSiswaPhoto } from '../data/initialSiswaData';
import { X, Upload, Camera, Check, RefreshCw, AlertCircle, Info, Sparkles } from 'lucide-react';

interface SiswaFotoModalProps {
  siswa: Siswa | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveFoto: (
    siswaId: number,
    fotoDataUrl: string,
    fotoBgColor: 'Merah (Tahun Lahir Ganjil)' | 'Biru (Tahun Lahir Genap)'
  ) => void;
}

export const SiswaFotoModal: React.FC<SiswaFotoModalProps> = ({
  siswa,
  isOpen,
  onClose,
  onSaveFoto
}) => {
  if (!isOpen || !siswa) return null;

  const birthYear = parseInt(siswa.tanggalLahir.split('-')[0]) || 2008;
  const isOddYear = birthYear % 2 !== 0;
  const defaultBg = isOddYear ? 'red' : 'blue';

  const [previewFoto, setPreviewFoto] = useState<string>(siswa.foto || '');
  const [selectedBg, setSelectedBg] = useState<'red' | 'blue'>(defaultBg);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (JPG, PNG, atau WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewFoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (bg: 'red' | 'blue') => {
    setSelectedBg(bg);
    const newSvg = createOfficialSiswaPhoto(bg, siswa.jk === 'Laki-laki' ? 'L' : 'P', (siswa.id % 4) + 1);
    setPreviewFoto(newSvg);
  };

  const handleSave = () => {
    const bgText = selectedBg === 'red' ? 'Merah (Tahun Lahir Ganjil)' : 'Biru (Tahun Lahir Genap)';
    onSaveFoto(siswa.id, previewFoto, bgText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Kelola Pas Foto Siswa Resmi</h2>
              <p className="text-xs text-slate-500">{siswa.nama} ({siswa.rombel})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Rules Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Ketentuan Pas Foto Dinas Pendidikan Jawa Timur:</span>
            </div>
            <ul className="text-[11px] text-amber-800 list-disc pl-4 space-y-0.5">
              <li>
                <strong>Tahun Kelahiran Ganjil</strong> ({birthYear}): Wajib Latar <strong>MERAH</strong>.
              </li>
              <li>
                <strong>Tahun Kelahiran Genap</strong>: Wajib Latar <strong>BIRU</strong>.
              </li>
              <li>Seragam OSIS Putih Abu-abu lengkap dengan badge SMA & nama.</li>
            </ul>
          </div>

          {/* Photo Preview 3x4 */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-28 h-36 rounded-xl border-2 border-slate-300 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center relative">
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt={siswa.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-400 font-semibold">Foto 3x4</span>
              )}
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-slate-700">{siswa.nama}</span>
              <div className="text-[11px] font-mono text-slate-500">NISN: {siswa.nisn}</div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Preset Pas Foto Standar Resmi Dinas:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('red')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedBg === 'red'
                    ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-2xs" />
                <span>Latar Merah (Ganjil)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('blue')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedBg === 'blue'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-2xs" />
                <span>Latar Biru (Genap)</span>
              </button>
            </div>
          </div>

          {/* Upload Custom Photo Option */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Atau Unggah Pas Foto Asli dari Komputer:
            </label>
            <label
              htmlFor="upload-foto-siswa-input"
              className="w-full border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-600 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Pilih Gambar Pas Foto (JPG / PNG)</span>
              <input
                id="upload-foto-siswa-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-3d btn-3d-blue px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan Pas Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
