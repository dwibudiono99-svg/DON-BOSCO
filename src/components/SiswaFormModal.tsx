import React, { useState, useEffect } from 'react';
import { Siswa, TingkatKelas, JenisKelamin, AgamaSiswa, StatusSiswa, FaseKurikulum } from '../types';
import { ROMBEL_OPTIONS, PEMINATAN_OPTIONS, AGAMA_OPTIONS, createOfficialSiswaPhoto } from '../data/initialSiswaData';
import { X, Save, AlertCircle, Info, Sparkles, User, BookOpen, Users, Award } from 'lucide-react';

interface SiswaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (siswa: Siswa) => void;
  editingSiswa: Siswa | null;
  waliKelasOptions?: string[];
}

export const SiswaFormModal: React.FC<SiswaFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSiswa,
  waliKelasOptions = [
    'Drs. Supriyanto, M.M.',
    'Siti Rahmawati, S.Pd., M.Si.',
    'Ahmad Fauzi, S.Pd.',
    'Dra. Sri Mulyani',
    'Budi Santoso, S.Kom., M.T.',
    'Dewi Lestari, S.Pd.',
    'Ratna Wulandari, S.Pd.'
  ]
}) => {
  const [formData, setFormData] = useState<Partial<Siswa>>({
    nisn: '',
    nis: '',
    nik: '',
    nama: '',
    jk: 'Laki-laki',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2008-01-15',
    agama: 'Islam',
    tingkatKelas: 'Kelas X',
    rombel: 'X-1',
    faseKurikulum: 'Fase E (Kelas X)',
    peminatan: 'Kurikulum Merdeka (Eksplorasi Minat & Bakat Fase E)',
    statusSiswa: 'Aktif',
    alamat: '',
    kotaKab: 'Kota Surabaya',
    noHpSiswa: '',
    email: '',
    namaAyah: '',
    pekerjaanAyah: '',
    namaIbu: '',
    pekerjaanIbu: '',
    noHpOrtu: '',
    waliKelas: waliKelasOptions[0],
    prestasi: '',
    ekskul: '',
    catatanKhusus: ''
  });

  const [activeSection, setActiveSection] = useState<'identitas' | 'akademik' | 'orangtua' | 'prestasi'>('identitas');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingSiswa) {
      setFormData(editingSiswa);
    } else {
      setFormData({
        nisn: '',
        nis: `2324${Math.floor(1000 + Math.random() * 9000)}`,
        nik: '',
        nama: '',
        jk: 'Laki-laki',
        tempatLahir: 'Surabaya',
        tanggalLahir: '2008-01-15',
        agama: 'Islam',
        tingkatKelas: 'Kelas X',
        rombel: 'X-1',
        faseKurikulum: 'Fase E (Kelas X)',
        peminatan: 'Kurikulum Merdeka (Eksplorasi Minat & Bakat Fase E)',
        statusSiswa: 'Aktif',
        alamat: '',
        kotaKab: 'Kota Surabaya',
        noHpSiswa: '',
        email: '',
        namaAyah: '',
        pekerjaanAyah: '',
        namaIbu: '',
        pekerjaanIbu: '',
        noHpOrtu: '',
        waliKelas: waliKelasOptions[0],
        prestasi: '',
        ekskul: '',
        catatanKhusus: ''
      });
    }
  }, [editingSiswa, isOpen]);

  if (!isOpen) return null;

  // Auto detect Dinas background color rule based on birth year
  const birthYear = parseInt((formData.tanggalLahir || '2008').split('-')[0]) || 2008;
  const isOddYear = birthYear % 2 !== 0;
  const dinasBgColor = isOddYear ? 'red' : 'blue';
  const dinasBgLabel = isOddYear
    ? 'Latar Merah (Standar Dinas: Kelahiran Tahun Ganjil)'
    : 'Latar Biru (Standar Dinas: Kelahiran Tahun Genap)';

  const handleTingkatKelasChange = (tingkat: TingkatKelas) => {
    let fase: FaseKurikulum = tingkat === 'Kelas X' ? 'Fase E (Kelas X)' : 'Fase F (Kelas XI - XII)';
    let defaultPeminatan =
      tingkat === 'Kelas X'
        ? 'Kurikulum Merdeka (Eksplorasi Minat & Bakat Fase E)'
        : 'MIPA (Fisika, Kimia, Biologi, Matematika Lanjut)';
    let defaultRombel = tingkat === 'Kelas X' ? 'X-1' : tingkat === 'Kelas XI' ? 'XI MIPA 1' : 'XII MIPA 1';

    setFormData((prev) => ({
      ...prev,
      tingkatKelas: tingkat,
      faseKurikulum: fase,
      peminatan: defaultPeminatan,
      rombel: defaultRombel
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nama?.trim()) {
      setErrorMsg('Nama Lengkap Siswa wajib diisi.');
      setActiveSection('identitas');
      return;
    }

    if (!formData.nisn?.trim()) {
      setErrorMsg('NISN (10 digit) wajib diisi sesuai standar Kemendikbud.');
      setActiveSection('identitas');
      return;
    }

    // Auto-generate photo if not present or regenerate based on official rules
    const foto = formData.foto || createOfficialSiswaPhoto(dinasBgColor, formData.jk === 'Laki-laki' ? 'L' : 'P', Math.floor(Math.random() * 4) + 1);

    const savedSiswa: Siswa = {
      id: editingSiswa ? editingSiswa.id : Date.now(),
      nisn: formData.nisn.trim(),
      nis: formData.nis?.trim() || `2324${Math.floor(1000 + Math.random() * 9000)}`,
      nik: formData.nik?.trim() || `35780${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      nama: formData.nama.trim(),
      jk: (formData.jk as JenisKelamin) || 'Laki-laki',
      tempatLahir: formData.tempatLahir?.trim() || 'Surabaya',
      tanggalLahir: formData.tanggalLahir || '2008-01-15',
      agama: (formData.agama as AgamaSiswa) || 'Islam',
      tingkatKelas: (formData.tingkatKelas as TingkatKelas) || 'Kelas X',
      rombel: formData.rombel || 'X-1',
      faseKurikulum: (formData.faseKurikulum as FaseKurikulum) || 'Fase E (Kelas X)',
      peminatan: formData.peminatan || 'Kurikulum Merdeka',
      statusSiswa: (formData.statusSiswa as StatusSiswa) || 'Aktif',
      alamat: formData.alamat?.trim() || 'Jl. Menur Pumpungan, Surabaya',
      kotaKab: formData.kotaKab || 'Kota Surabaya',
      noHpSiswa: formData.noHpSiswa?.trim() || '',
      email: formData.email?.trim() || `${formData.nama.toLowerCase().replace(/\s+/g, '.')}@siswa.sma.belajar.id`,
      namaAyah: formData.namaAyah?.trim() || 'Orang Tua Siswa',
      pekerjaanAyah: formData.pekerjaanAyah?.trim() || '',
      namaIbu: formData.namaIbu?.trim() || 'Ibu Siswa',
      pekerjaanIbu: formData.pekerjaanIbu?.trim() || '',
      noHpOrtu: formData.noHpOrtu?.trim() || '081234567890',
      waliKelas: formData.waliKelas || waliKelasOptions[0],
      prestasi: formData.prestasi?.trim() || '',
      ekskul: formData.ekskul?.trim() || '',
      fotoBgColor: isOddYear ? 'Merah (Tahun Lahir Ganjil)' : 'Biru (Tahun Lahir Genap)',
      foto: foto,
      catatanKhusus: formData.catatanKhusus?.trim() || ''
    };

    onSave(savedSiswa);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingSiswa ? 'Ubah Data Siswa (Dapodik)' : 'Pendaftaran & Tambah Siswa Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Sesuai Standar Buku Induk Siswa & Aturan Pas Foto Dinas Pendidikan Jawa Timur
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

        {/* Section Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 gap-1 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('identitas')}
            className={`px-3 py-2 font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeSection === 'identitas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Identitas Pokok</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('akademik')}
            className={`px-3 py-2 font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeSection === 'akademik'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>2. Kelas & Peminatan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('orangtua')}
            className={`px-3 py-2 font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeSection === 'orangtua'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. Orang Tua / Wali</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('prestasi')}
            className={`px-3 py-2 font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeSection === 'prestasi'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>4. Prestasi & Ekskul</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-grow space-y-4 text-xs">
          {/* Section 1: Identitas Pokok */}
          {activeSection === 'identitas' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nama Lengkap Siswa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Arya Pratama"
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    NISN (10 Digit Kemendikbud) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="0075421980"
                    value={formData.nisn || ''}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    NIS (Nomor Induk Siswa)
                  </label>
                  <input
                    type="text"
                    placeholder="23241001"
                    value={formData.nis || ''}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    NIK Siswa (16 Digit Kependudukan)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="3578011505070001"
                    value={formData.nik || ''}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jk || 'Laki-laki'}
                    onChange={(e) => setFormData({ ...formData, jk: e.target.value as JenisKelamin })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    placeholder="Surabaya"
                    value={formData.tempatLahir || ''}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir || '2008-01-15'}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Aturan Dinas Pas Foto Live Badge */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-xs shrink-0"
                    style={{ backgroundColor: dinasBgColor === 'red' ? '#dc2626' : '#2563eb' }}
                  />
                  <span className="font-semibold text-blue-900">
                    Aturan Pas Foto Terdeteksi: {dinasBgLabel}
                  </span>
                </div>
                <span className="text-[10px] text-blue-600 bg-white px-2 py-0.5 rounded font-mono">
                  Tahun {birthYear}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Agama</label>
                  <select
                    value={formData.agama || 'Islam'}
                    onChange={(e) => setFormData({ ...formData, agama: e.target.value as AgamaSiswa })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    {AGAMA_OPTIONS.map((ag) => (
                      <option key={ag} value={ag}>
                        {ag}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Siswa</label>
                  <select
                    value={formData.statusSiswa || 'Aktif'}
                    onChange={(e) => setFormData({ ...formData, statusSiswa: e.target.value as StatusSiswa })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Mutasi/Pindah">Mutasi / Pindah</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Alamat Domisili Siswa</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Dharmawangsa No. 42, RT 03 / RW 05, Surabaya"
                  value={formData.alamat || ''}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">WhatsApp / No HP Siswa</label>
                  <input
                    type="text"
                    placeholder="081234987650"
                    value={formData.noHpSiswa || ''}
                    onChange={(e) => setFormData({ ...formData, noHpSiswa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Akun Belajar.id Siswa</label>
                  <input
                    type="email"
                    placeholder="nama.siswa@siswa.sma.belajar.id"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Kelas & Peminatan */}
          {activeSection === 'akademik' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tingkat Kelas</label>
                  <select
                    value={formData.tingkatKelas || 'Kelas X'}
                    onChange={(e) => handleTingkatKelasChange(e.target.value as TingkatKelas)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Kelas X">Kelas X (Fase E)</option>
                    <option value="Kelas XI">Kelas XI (Fase F)</option>
                    <option value="Kelas XII">Kelas XII (Fase F)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rombel (Rombongan Belajar)</label>
                  <select
                    value={formData.rombel || 'X-1'}
                    onChange={(e) => setFormData({ ...formData, rombel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    {ROMBEL_OPTIONS.map((rom) => (
                      <option key={rom} value={rom}>
                        {rom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Peminatan / Minat Bakat (Kurikulum Merdeka)
                </label>
                <select
                  value={formData.peminatan || PEMINATAN_OPTIONS[0]}
                  onChange={(e) => setFormData({ ...formData, peminatan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  {PEMINATAN_OPTIONS.map((pem) => (
                    <option key={pem} value={pem}>
                      {pem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Guru Wali Kelas</label>
                <select
                  value={formData.waliKelas || waliKelasOptions[0]}
                  onChange={(e) => setFormData({ ...formData, waliKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  {waliKelasOptions.map((wali) => (
                    <option key={wali} value={wali}>
                      {wali}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Section 3: Orang Tua / Wali */}
          {activeSection === 'orangtua' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Data Ayah Kandung</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Nama Ayah</label>
                    <input
                      type="text"
                      placeholder="Bambang Sudarmanto"
                      value={formData.namaAyah || ''}
                      onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Pekerjaan Ayah</label>
                    <input
                      type="text"
                      placeholder="Wiraswasta / PNS / BUMN"
                      value={formData.pekerjaanAyah || ''}
                      onChange={(e) => setFormData({ ...formData, pekerjaanAyah: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-600" />
                  <span>Data Ibu Kandung</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Nama Ibu</label>
                    <input
                      type="text"
                      placeholder="Endang Sri Wahyuni"
                      value={formData.namaIbu || ''}
                      onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Pekerjaan Ibu</label>
                    <input
                      type="text"
                      placeholder="Guru / Ibu Rumah Tangga"
                      value={formData.pekerjaanIbu || ''}
                      onChange={(e) => setFormData({ ...formData, pekerjaanIbu: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nomor HP / WhatsApp Orang Tua (Kontak Darurat) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="081233445566"
                  value={formData.noHpOrtu || ''}
                  onChange={(e) => setFormData({ ...formData, noHpOrtu: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Section 4: Prestasi & Ekskul */}
          {activeSection === 'prestasi' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Prestasi yang Pernah Diraih</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Juara 1 Olimpiade Sains Nasional (OSN) Tingkat Kota Surabaya 2024"
                  value={formData.prestasi || ''}
                  onChange={(e) => setFormData({ ...formData, prestasi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ekstrakurikuler yang Diikuti</label>
                <input
                  type="text"
                  placeholder="Contoh: KIR (Karya Ilmiah Remaja), Paskibraka, Basket"
                  value={formData.ekskul || ''}
                  onChange={(e) => setFormData({ ...formData, ekskul: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Khusus Bimbingan Konseling</label>
                <textarea
                  rows={2}
                  placeholder="Catatan perkembangan kepribadian, minat bakat, atau konseling siswa..."
                  value={formData.catatanKhusus || ''}
                  onChange={(e) => setFormData({ ...formData, catatanKhusus: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex gap-2">
              {activeSection !== 'identitas' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'akademik') setActiveSection('identitas');
                    if (activeSection === 'orangtua') setActiveSection('akademik');
                    if (activeSection === 'prestasi') setActiveSection('orangtua');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  &larr; Sebelumnya
                </button>
              )}
              {activeSection !== 'prestasi' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'identitas') setActiveSection('akademik');
                    if (activeSection === 'akademik') setActiveSection('orangtua');
                    if (activeSection === 'orangtua') setActiveSection('prestasi');
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg"
                >
                  Selanjutnya &rarr;
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                id="btn-save-siswa-submit"
                className="btn-3d btn-3d-blue px-4 py-2 font-bold flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Data Siswa</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
