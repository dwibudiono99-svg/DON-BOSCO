import React, { useState, useEffect } from 'react';
import {
  FileText,
  ExternalLink,
  RefreshCw,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Building,
  Users,
  Calendar,
  Shield,
  FileCheck,
  Eye
} from 'lucide-react';
import { Pegawai, Siswa, KopSekolah } from '../types';
import {
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  getGoogleAccessToken,
  getCurrentGoogleUser,
  hasGoogleWorkspaceAccess
} from '../services/googleAuth';
import {
  listGoogleDocs,
  createLaporanEksekutifDoc,
  createDukDoc,
  GoogleDocItem,
  CreateDocResult
} from '../services/googleDocs';

interface GoogleDocsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pegawaiList: Pegawai[];
  siswaList: Siswa[];
  kop: KopSekolah;
}

export const GoogleDocsManagerModal: React.FC<GoogleDocsManagerModalProps> = ({
  isOpen,
  onClose,
  pegawaiList,
  siswaList,
  kop
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Docs list state
  const [docsList, setDocsList] = useState<GoogleDocItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentCreatedDoc, setRecentCreatedDoc] = useState<CreateDocResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Customization inputs for Executive report
  const [nomorSurat, setNomorSurat] = useState('421.3 / 118 / 101.6.1 / 2026');
  const [periode, setPeriode] = useState('Semester Genap Tahun Ajaran 2025/2026');
  const [namaKS, setNamaKS] = useState('Dr. H. Bambang Sudarsono, M.Pd.');
  const [nipKS, setNipKS] = useState('19680512 199412 1 002');
  const [namaOp, setNamaOp] = useState('Dwi Budiono, S.Kom.');
  const [nipOp, setNipOp] = useState('19880923 201503 1 003');

  // Check auth on open
  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const checkAuthStatus = async () => {
    try {
      const isAuthed = hasGoogleWorkspaceAccess();
      setIsAuthenticated(isAuthed);
      if (isAuthed) {
        const user = getCurrentGoogleUser();
        const token = await getGoogleAccessToken();
        setCurrentUser(user);
        setAccessToken(token);
        if (token) {
          fetchDocs(token);
        }
      }
    } catch (e) {
      console.error('Error checking auth:', e);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogleWorkspace();
      if (result) {
        setIsAuthenticated(true);
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setSuccessMsg(`Berhasil terhubung dengan akun Google: ${result.user.email}`);
        await fetchDocs(result.accessToken);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutGoogleWorkspace();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAccessToken(null);
      setDocsList([]);
      setSuccessMsg('Sesi Google Docs telah diakhiri.');
    } catch (err: any) {
      setError(err.message || 'Gagal keluar.');
    }
  };

  const fetchDocs = async (token: string, q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const items = await listGoogleDocs(token, q);
      setDocsList(items);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat dokumen Google Docs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLaporanEksekutif = async () => {
    if (!accessToken) {
      setError('Silakan hubungkan akun Google terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await createLaporanEksekutifDoc(accessToken, pegawaiList, siswaList, kop, {
        nomorSurat,
        periode,
        namaKepalaSekolah: namaKS,
        nipKepalaSekolah: nipKS,
        namaOperator: namaOp,
        nipOperator: nipOp,
      });

      setRecentCreatedDoc(result);
      setSuccessMsg(`Laporan Eksekutif berhasil dibuat di Google Docs: "${result.title}"`);
      await fetchDocs(accessToken);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat Laporan Eksekutif di Google Docs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDuk = async () => {
    if (!accessToken) {
      setError('Silakan hubungkan akun Google terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await createDukDoc(accessToken, pegawaiList, kop);
      setRecentCreatedDoc(result);
      setSuccessMsg(`Daftar Urut Kepegawaian berhasil dibuat di Google Docs: "${result.title}"`);
      await fetchDocs(accessToken);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat DUK di Google Docs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <FileText className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Integrasi Google Docs Resmi SMAN 9 Surabaya
                </h2>
                <span className="text-[10px] bg-blue-500/20 text-blue-200 font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  Workspace API
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Buat dan kelola laporan kedinasan resmi, DUK, dan pengesahan langsung di Google Docs Anda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Notifications */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="text-emerald-400 hover:text-emerald-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Account Status Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status Akun Google Workspace
                </div>
                <div className="text-sm font-black text-slate-900">
                  {isAuthenticated && currentUser ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Terhubung: {currentUser.email}
                    </span>
                  ) : (
                    <span className="text-slate-600">Belum Terhubung dengan Google Workspace</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => accessToken && fetchDocs(accessToken, searchQuery)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Segarkan</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Hubungkan Google Docs Sekarang</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions: Export to Google Docs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Buat Dokumen Kedinasan Otomatis di Google Docs
              </h3>
              <span className="text-xs text-slate-500">Otomatis tersimpan di Google Drive Anda</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Action 1: Laporan Eksekutif */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4.5 flex flex-col justify-between hover:shadow-sm transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <FileCheck className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                      Rekomendasi Dinas
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Laporan Eksekutif Kepegawaian & Kesiswaan
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dokumen rapi lengkap dengan KOP Dinas, rekapitulasi PNS/PPPK/GTT, JJM, data kesiswaan 18 rombel, dan lembar tanda tangan.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-200/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">Format: Dokumen Resmi</span>
                  <button
                    type="button"
                    onClick={handleCreateLaporanEksekutif}
                    disabled={loading || !isAuthenticated}
                    className="btn-3d btn-3d-blue text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat di Google Docs</span>
                  </button>
                </div>
              </div>

              {/* Action 2: DUK Pegawai */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4.5 flex flex-col justify-between hover:shadow-sm transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Users className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                      PTK SIMPEG
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Daftar Urut Kepegawaian (DUK Lengkap)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Membuat dokumen nominatif seluruh {pegawaiList.length} guru & tenaga kependidikan lengkap dengan NIP, Pangkat/Golongan, dan Beban Jam.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">{pegawaiList.length} Pegawai</span>
                  <button
                    type="button"
                    onClick={handleCreateDuk}
                    disabled={loading || !isAuthenticated}
                    className="btn-3d btn-3d-emerald text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Dokumen DUK</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Created Document Banner */}
          {recentCreatedDoc && (
            <div className="bg-emerald-50 border-2 border-emerald-500/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase text-emerald-800">
                    Dokumen Google Docs Berhasil Dibuat!
                  </div>
                  <div className="text-xs font-black text-slate-900 truncate max-w-md">
                    {recentCreatedDoc.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(recentCreatedDoc.webViewLink, recentCreatedDoc.documentId)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-slate-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === recentCreatedDoc.documentId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>
                <a
                  href={recentCreatedDoc.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-3d btn-3d-blue text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Google Docs</span>
                </a>
              </div>
            </div>
          )}

          {/* List of Existing Google Docs */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Daftar Dokumen Google Docs di Drive Anda
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama dokumen..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (accessToken) fetchDocs(accessToken, e.target.value);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>

            {loading && docsList.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                <span>Memuat dokumen dari Google Drive...</span>
              </div>
            ) : docsList.length > 0 ? (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs max-h-60 overflow-y-auto">
                {docsList.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate max-w-sm sm:max-w-md">
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ID: {doc.id} • Dimodifikasi: {doc.modifiedTime ? new Date(doc.modifiedTime).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(`https://docs.google.com/document/d/${doc.id}/edit`, doc.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 cursor-pointer"
                        title="Salin Link Google Docs"
                      >
                        {copiedId === doc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={doc.webViewLink || `https://docs.google.com/document/d/${doc.id}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                      >
                        <span>Buka</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
                {isAuthenticated
                  ? 'Belum ada dokumen Google Docs yang ditemukan atau silakan buat dokumen baru di atas.'
                  : 'Hubungkan akun Google Anda untuk melihat dan membuat dokumen Google Docs.'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Terintegrasi resmi dengan Google Docs API & Google Drive v3</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
