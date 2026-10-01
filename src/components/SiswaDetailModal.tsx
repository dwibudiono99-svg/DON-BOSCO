import React, { useState, useRef } from 'react';
import { Siswa, KopSekolah } from '../types';
import {
  X,
  Printer,
  IdCard,
  User,
  Users,
  Award,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Edit2,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface SiswaDetailModalProps {
  siswa: Siswa | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (siswa: Siswa) => void;
  onManageFoto: (siswa: Siswa) => void;
  kop: KopSekolah;
}

export const SiswaDetailModal: React.FC<SiswaDetailModalProps> = ({
  siswa,
  isOpen,
  onClose,
  onEdit,
  onManageFoto,
  kop
}) => {
  const [activeTab, setActiveTab] = useState<'kta' | 'biodata' | 'orangtua' | 'prestasi'>('kta');
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !siswa) return null;

  const birthYear = parseInt(siswa.tanggalLahir.split('-')[0]) || 2008;
  const isOddYear = birthYear % 2 !== 0;
  const bgLabel = isOddYear ? 'Latar Merah (Tahun Ganjil)' : 'Latar Biru (Tahun Genap)';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Profil & Kartu Tanda Pelajar (KTA)
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {siswa.nama} — NISN: {siswa.nisn} ({siswa.rombel})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('kta')}
            className={`px-3.5 py-2.5 font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'kta'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <IdCard className="w-3.5 h-3.5" />
            <span>Kartu Pelajar (KTA)</span>
          </button>

          <button
            onClick={() => setActiveTab('biodata')}
            className={`px-3.5 py-2.5 font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'biodata'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Biodata Dapodik</span>
          </button>

          <button
            onClick={() => setActiveTab('orangtua')}
            className={`px-3.5 py-2.5 font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'orangtua'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Data Orang Tua / Wali</span>
          </button>

          <button
            onClick={() => setActiveTab('prestasi')}
            className={`px-3.5 py-2.5 font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'prestasi'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Prestasi & Ekskul</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow bg-slate-50/40">
          {activeTab === 'kta' && (
            <div className="flex flex-col items-center">
              {/* Official Kartu Pelajar (KTA Siswa) Card Canvas */}
              <div
                ref={printRef}
                className="w-full max-w-md bg-white rounded-2xl border-2 border-blue-900 shadow-xl overflow-hidden relative"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)'
                }}
              >
                {/* Header KOP Kartu */}
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-3.5 text-center relative border-b-2 border-amber-400">
                  <div className="flex items-center justify-between gap-2">
                    {/* Logo Kiri / Tut Wuri Handayani */}
                    <div className="w-9 h-9 rounded-full bg-white/10 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={kop.logoKiri}
                        alt="Logo Dinas"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Teks KOP Sekolah */}
                    <div className="flex-grow">
                      <div className="text-[9px] font-medium tracking-wider uppercase text-blue-200">
                        {kop.instansiAtas}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-white">
                        {kop.dinas}
                      </div>
                      <div className="text-xs font-black tracking-wide uppercase text-amber-300">
                        {kop.namaSekolah}
                      </div>
                      <div className="text-[8px] text-blue-100/90 leading-tight">
                        {kop.alamatJalan}, {kop.kotaKabupaten} • NPSN: {kop.npsn}
                      </div>
                    </div>

                    {/* Logo Kanan / SMA */}
                    <div className="w-9 h-9 rounded-full bg-white/10 p-1 flex items-center justify-center shrink-0">
                      {kop.logoKanan ? (
                        <img
                          src={kop.logoKanan}
                          alt="Logo SMAN"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <BookOpen className="w-5 h-5 text-amber-300" />
                      )}
                    </div>
                  </div>

                  {/* Badge Judul Kartu */}
                  <div className="mt-2 inline-block bg-amber-400 text-blue-950 font-black text-[10px] tracking-widest px-3 py-0.5 rounded-full uppercase shadow-xs">
                    KARTU TANDA PELAJAR (KTA)
                  </div>
                </div>

                {/* Body Kartu */}
                <div className="p-4 relative">
                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <img src={kop.logoKiri} alt="" className="w-48 h-48 object-contain" />
                  </div>

                  <div className="flex gap-4 items-start relative z-10">
                    {/* Foto Siswa Aturan Dinas */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-24 h-32 rounded-lg border-2 border-slate-300 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                        {siswa.foto ? (
                          <img
                            src={siswa.foto}
                            alt={siswa.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">Pas Foto</span>
                        )}
                      </div>
                      <div className="mt-1 text-center">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          {isOddYear ? 'Merah (Ganjil)' : 'Biru (Genap)'}
                        </span>
                      </div>
                    </div>

                    {/* Data KTA */}
                    <div className="flex-grow space-y-1.5 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          Nama Siswa
                        </div>
                        <div className="text-sm font-black text-slate-900 leading-tight">
                          {siswa.nama}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">NISN</div>
                          <div className="font-mono font-bold text-blue-900">{siswa.nisn}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">NIS</div>
                          <div className="font-mono font-bold text-slate-800">{siswa.nis}</div>
                        </div>
                      </div>

                      <div className="text-[11px]">
                        <div className="text-[9px] text-slate-400 font-bold uppercase">TTL</div>
                        <div className="text-slate-800 font-medium">
                          {siswa.tempatLahir}, {siswa.tanggalLahir}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">Kelas / Rombel</div>
                          <div className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                            {siswa.rombel}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">Jenis Kelamin</div>
                          <div className="text-slate-700 font-medium">{siswa.jk}</div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-600 line-clamp-1">
                        <span className="text-slate-400 font-semibold">Alamat:</span> {siswa.alamat}, {siswa.kotaKab}
                      </div>
                    </div>
                  </div>

                  {/* Barcode & TTD Kepala Sekolah */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-end justify-between gap-3 text-[9px] relative z-10">
                    {/* Barcode Mock SVG */}
                    <div>
                      <div className="font-mono text-[8px] text-slate-400 font-bold mb-0.5">
                        VERIFIKASI NISN DAPODIK
                      </div>
                      <div className="flex items-center gap-[2px] h-7 bg-white p-1 rounded border border-slate-200">
                        {siswa.nisn.split('').map((char, i) => {
                          const w = (parseInt(char) % 3) + 1;
                          return (
                            <div
                              key={i}
                              className="bg-slate-900 h-full"
                              style={{ width: `${w * 1.5}px` }}
                            />
                          );
                        })}
                        <div className="w-1 bg-slate-900 h-full" />
                        <div className="w-0.5 bg-slate-900 h-full" />
                      </div>
                      <div className="font-mono text-[8px] text-slate-500 tracking-widest text-center mt-0.5">
                        *{siswa.nisn}*
                      </div>
                    </div>

                    {/* Stempel & TTD */}
                    <div className="text-right">
                      <div className="text-slate-500 text-[8px]">
                        Surabaya, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="text-[8px] font-bold text-slate-700">Kepala Sekolah,</div>
                      {/* Stamp & Signature simulation */}
                      <div className="h-9 relative flex items-center justify-end">
                        <div className="w-10 h-10 rounded-full border-2 border-blue-600/30 flex items-center justify-center text-[6px] font-bold text-blue-600 rotate-12 absolute right-8 pointer-events-none">
                          STEMPEL SMAN
                        </div>
                        <div className="font-serif italic text-xs text-blue-900 font-bold -rotate-6">
                          Drs. Supriyanto
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 underline text-[9px]">
                        Drs. Supriyanto, M.M.
                      </div>
                      <div className="text-[7.5px] text-slate-500 font-mono">
                        NIP. 197605122003121002
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Stripe */}
                <div className="bg-slate-100 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-[8px] text-slate-500">
                  <span>Berlaku Selama Menjadi Siswa SMA Negeri</span>
                  <span className="font-bold text-blue-900">SIMPEG SMAN 9 SURABAYA</span>
                </div>
              </div>

              {/* Action Buttons under KTA */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  id="btn-print-kta"
                  onClick={handlePrint}
                  className="btn-3d btn-3d-blue px-4 py-2 text-xs font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Print Kartu Pelajar</span>
                </button>

                <button
                  onClick={() => onManageFoto(siswa)}
                  className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Ganti Pas Foto Siswa</span>
                </button>

                <button
                  onClick={() => onEdit(siswa)}
                  className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-amber-600" />
                  <span>Ubah Data Siswa</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'biodata' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Identitas Pokok Siswa (Dapodik Kemendikbud)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nama Lengkap</span>
                    <span className="font-bold text-slate-900 text-sm">{siswa.nama}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Nomor Induk Siswa Nasional (NISN)</span>
                    <span className="font-mono font-bold text-blue-700">{siswa.nisn}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Nomor Induk Kependudukan (NIK)</span>
                    <span className="font-mono text-slate-800">{siswa.nik}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Nomor Induk Siswa (NIS)</span>
                    <span className="font-mono text-slate-800">{siswa.nis}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Tempat, Tanggal Lahir</span>
                    <span className="text-slate-800 font-medium">
                      {siswa.tempatLahir}, {siswa.tanggalLahir}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Jenis Kelamin</span>
                    <span className="text-slate-800">{siswa.jk}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Agama</span>
                    <span className="text-slate-800">{siswa.agama}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Status Peserta Didik</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                      {siswa.statusSiswa}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Akademik & Kurikulum SMA</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tingkat Kelas & Rombel</span>
                    <span className="font-bold text-slate-800">{siswa.tingkatKelas} — {siswa.rombel}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Fase Kurikulum</span>
                    <span className="text-slate-800 font-medium">{siswa.faseKurikulum}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Peminatan / Mata Pelajaran Pilihan</span>
                    <span className="text-slate-800 font-semibold">{siswa.peminatan}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Guru Wali Kelas</span>
                    <span className="text-blue-900 font-bold">{siswa.waliKelas}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Akun Belajar.id Siswa</span>
                    <span className="font-mono text-slate-700">{siswa.email || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>Alamat & Domisili Siswa</span>
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {siswa.alamat}
                  {siswa.kelurahan && `, Kelurahan ${siswa.kelurahan}`}
                  {siswa.kecamatan && `, Kecamatan ${siswa.kecamatan}`}
                  {`, ${siswa.kotaKab}`}
                </p>
                {siswa.noHpSiswa && (
                  <p className="text-xs text-slate-600 mt-2 font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>WhatsApp Siswa: {siswa.noHpSiswa}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orangtua' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Data Orang Tua Kandung & Wali</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                    <span className="text-[11px] font-bold text-blue-900 block mb-1">
                      Data Ayah Kandung
                    </span>
                    <div className="space-y-1">
                      <div>
                        <span className="text-slate-400 text-[10px]">Nama:</span>
                        <div className="font-bold text-slate-900">{siswa.namaAyah}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Pekerjaan:</span>
                        <div className="text-slate-700">{siswa.pekerjaanAyah || 'Wiraswasta / Pekerja'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                    <span className="text-[11px] font-bold text-pink-900 block mb-1">
                      Data Ibu Kandung
                    </span>
                    <div className="space-y-1">
                      <div>
                        <span className="text-slate-400 text-[10px]">Nama:</span>
                        <div className="font-bold text-slate-900">{siswa.namaIbu}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Pekerjaan:</span>
                        <div className="text-slate-700">{siswa.pekerjaanIbu || 'Ibu Rumah Tangga'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50/60 rounded-lg border border-amber-200/70 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-amber-700" />
                    <span>Kontak Darurat Orang Tua / Wali</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-800">
                    {siswa.noHpOrtu}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Digunakan pihak bimbingan konseling (BK) dan wali kelas untuk komunikasi berkala.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prestasi' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Prestasi Siswa (Akademik & Non-Akademik)</span>
                </h3>

                {siswa.prestasi ? (
                  <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-950">
                        {siswa.prestasi}
                      </div>
                      <div className="text-[11px] text-amber-800 mt-0.5">
                        Tercatat resmi dalam Buku Induk Prestasi Kesiswaan SMAN.
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Belum ada catatan prestasi khusus yang terdata.
                  </p>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Ekstrakurikuler & Keorganisasian</span>
                </h3>
                <p className="text-xs text-slate-800 font-medium">
                  {siswa.ekskul || 'Belum memilih ekstrakurikuler'}
                </p>
              </div>

              {siswa.catatanKhusus && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Catatan Khusus Bimbingan Konseling / Sekolah
                  </h3>
                  <p className="text-xs text-slate-600">
                    {siswa.catatanKhusus}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Standar Dapodik &bull; Dinas Pendidikan Provinsi Jawa Timur
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
