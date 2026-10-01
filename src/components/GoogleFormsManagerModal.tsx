import React, { useState, useEffect } from 'react';
import { GoogleFormItem, GoogleFormDetail, GoogleFormSubmission, Siswa, KopSekolah } from '../types';
import {
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  getGoogleAccessToken,
  getCurrentGoogleUser,
  hasGoogleWorkspaceAccess
} from '../services/googleAuth';
import {
  listGoogleForms,
  getFormDetails,
  getFormResponses,
  createStandardSiswaForm,
  convertFormResponsesToSiswa
} from '../services/googleForms';
import {
  X,
  FileText,
  Plus,
  RefreshCw,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Users,
  LogOut,
  FolderOpen,
  Send,
  Trash2
} from 'lucide-react';

interface GoogleFormsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSiswa: (newSiswaList: Siswa[]) => void;
  kop: KopSekolah;
  existingSiswaCount: number;
}

export const GoogleFormsManagerModal: React.FC<GoogleFormsManagerModalProps> = ({
  isOpen,
  onClose,
  onImportSiswa,
  kop,
  existingSiswaCount
}) => {
  const [activeTab, setActiveTab] = useState<'forms' | 'create' | 'responses'>('forms');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{ displayName: string; email: string; photoURL: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [formsList, setFormsList] = useState<GoogleFormItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected Form for responses
  const [selectedForm, setSelectedForm] = useState<GoogleFormItem | null>(null);
  const [selectedFormDetail, setSelectedFormDetail] = useState<GoogleFormDetail | null>(null);
  const [formResponses, setFormResponses] = useState<GoogleFormSubmission[]>([]);
  const [isFetchingResponses, setIsFetchingResponses] = useState(false);

  // New Form Creation State
  const [newFormType, setNewFormType] = useState<'standard' | 'pilihan' | 'custom'>('standard');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [createdFormUrl, setCreatedFormUrl] = useState<string | null>(null);

  // Check auth state on open
  useEffect(() => {
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  const checkAuth = () => {
    const user = getCurrentGoogleUser();
    const token = getGoogleAccessToken();
    if (user && token) {
      setIsSignedIn(true);
      setUserProfile({
        displayName: user.displayName || 'Akun Google Sekolah',
        email: user.email || 'dwibudiono99@admin.sma.belajar.id',
        photoURL: user.photoURL || ''
      });
      setAccessToken(token);
      loadForms(token);
    } else {
      setIsSignedIn(false);
      setUserProfile(null);
      setAccessToken(null);
      // Fallback with mock template forms for exploration
      setFormsList([
        {
          id: 'demo-form-1',
          name: 'Formulir Biodata & Pendaftaran Siswa Baru (PPDB SMAN 9 Surabaya)',
          title: 'Formulir Biodata & Pendaftaran Siswa Baru (PPDB SMAN 9 Surabaya)',
          webViewLink: 'https://docs.google.com/forms',
          createdTime: '2024-07-01T08:00:00Z',
          modifiedTime: '2024-07-15T10:30:00Z'
        },
        {
          id: 'demo-form-2',
          name: 'Formulir Angket Pemilihan Mata Pelajaran Pilihan Fase F (Kelas XI)',
          title: 'Formulir Angket Pemilihan Mata Pelajaran Pilihan Fase F (Kelas XI)',
          webViewLink: 'https://docs.google.com/forms',
          createdTime: '2024-06-10T09:00:00Z',
          modifiedTime: '2024-06-25T14:20:00Z'
        }
      ]);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await signInWithGoogleWorkspace();
      if (res) {
        setIsSignedIn(true);
        setUserProfile({
          displayName: res.user.displayName || 'dwibudiono99@admin.sma.belajar.id',
          email: res.user.email || 'dwibudiono99@admin.sma.belajar.id',
          photoURL: res.user.photoURL || ''
        });
        setAccessToken(res.accessToken);
        setSuccessMsg('Berhasil terhubung dengan Google Workspace (Forms & Drive API)!');
        await loadForms(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogleWorkspace();
    setIsSignedIn(false);
    setUserProfile(null);
    setAccessToken(null);
    setSuccessMsg('Akun Google berhasil diputuskan.');
  };

  const loadForms = async (token: string) => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const list = await listGoogleForms(token);
      setFormsList(list);
    } catch (err: any) {
      console.warn('Google Drive list failed, using cached forms', err);
      setErrorMsg(err.message || 'Gagal memuat formulir dari Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateForm = async () => {
    if (!accessToken) {
      setErrorMsg('Harap Masuk dengan Google terlebih dahulu untuk membuat formulir resmi langsung di Google Drive Anda.');
      return;
    }

    try {
      setIsCreatingForm(true);
      setErrorMsg('');
      setSuccessMsg('');

      const result = await createStandardSiswaForm(accessToken, kop.namaSekolah);
      setCreatedFormUrl(result.editUrl);
      setSuccessMsg(`Google Form berhasil dibuat di Google Drive Anda! ID: ${result.formId}`);
      await loadForms(accessToken);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal membuat Google Form.');
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleSelectFormForResponses = async (form: GoogleFormItem) => {
    setSelectedForm(form);
    setActiveTab('responses');
    setErrorMsg('');
    setSuccessMsg('');

    if (form.id.startsWith('demo-')) {
      // Demo simulated responses
      setSelectedFormDetail({
        formId: form.id,
        info: { title: form.name },
        items: [
          { itemId: '1', questionItem: { question: { questionId: 'q1' } }, title: 'Nomor Induk Siswa Nasional (NISN)' },
          { itemId: '2', questionItem: { question: { questionId: 'q2' } }, title: 'Nama Lengkap Siswa' },
          { itemId: '3', questionItem: { question: { questionId: 'q3' } }, title: 'Jenis Kelamin' },
          { itemId: '4', questionItem: { question: { questionId: 'q4' } }, title: 'Tanggal Lahir' },
          { itemId: '5', questionItem: { question: { questionId: 'q5' } }, title: 'Peminatan / Minat Bakat (Kurikulum Merdeka)' }
        ]
      });

      setFormResponses([
        {
          responseId: 'resp-demo-1',
          createTime: '2024-07-16T10:15:00Z',
          respondentEmail: 'bintang.raditya@siswa.sma.belajar.id',
          answers: {
            q1: { questionId: 'q1', textAnswers: { answers: [{ value: '0087654321' }] } },
            q2: { questionId: 'q2', textAnswers: { answers: [{ value: 'Bintang Raditya Mahendra' }] } },
            q3: { questionId: 'q3', textAnswers: { answers: [{ value: 'Laki-laki' }] } },
            q4: { questionId: 'q4', textAnswers: { answers: [{ value: '2008-03-24' }] } },
            q5: { questionId: 'q5', textAnswers: { answers: [{ value: 'MIPA (Fisika, Kimia, Biologi)' }] } }
          }
        },
        {
          responseId: 'resp-demo-2',
          createTime: '2024-07-16T11:40:00Z',
          respondentEmail: 'cantika.ayu@siswa.sma.belajar.id',
          answers: {
            q1: { questionId: 'q1', textAnswers: { answers: [{ value: '0091122334' }] } },
            q2: { questionId: 'q2', textAnswers: { answers: [{ value: 'Cantika Ayu Lestari' }] } },
            q3: { questionId: 'q3', textAnswers: { answers: [{ value: 'Perempuan' }] } },
            q4: { questionId: 'q4', textAnswers: { answers: [{ value: '2009-08-12' }] } },
            q5: { questionId: 'q5', textAnswers: { answers: [{ value: 'IPS (Ekonomi, Sosiologi, Geografi)' }] } }
          }
        },
        {
          responseId: 'resp-demo-3',
          createTime: '2024-07-16T13:20:00Z',
          respondentEmail: 'daffa.alghifari@siswa.sma.belajar.id',
          answers: {
            q1: { questionId: 'q1', textAnswers: { answers: [{ value: '0089988776' }] } },
            q2: { questionId: 'q2', textAnswers: { answers: [{ value: 'Daffa Al-Ghifari' }] } },
            q3: { questionId: 'q3', textAnswers: { answers: [{ value: 'Laki-laki' }] } },
            q4: { questionId: 'q4', textAnswers: { answers: [{ value: '2008-11-05' }] } },
            q5: { questionId: 'q5', textAnswers: { answers: [{ value: 'Kurikulum Merdeka (Eksplorasi Minat & Bakat Fase E)' }] } }
          }
        }
      ]);
      return;
    }

    if (!accessToken) {
      setErrorMsg('Harap Masuk dengan Google terlebih dahulu.');
      return;
    }

    try {
      setIsFetchingResponses(true);
      const detail = await getFormDetails(accessToken, form.id);
      setSelectedFormDetail(detail);

      const resp = await getFormResponses(accessToken, form.id);
      setFormResponses(resp);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal mengambil respons dari Google Form.');
    } finally {
      setIsFetchingResponses(false);
    }
  };

  const handleImportResponses = () => {
    if (!selectedFormDetail || formResponses.length === 0) {
      setErrorMsg('Tidak ada data respons yang dapat diimpor.');
      return;
    }

    const convertedSiswa = convertFormResponsesToSiswa(selectedFormDetail, formResponses);
    onImportSiswa(convertedSiswa);
    setSuccessMsg(`Berhasil mengimpor ${convertedSiswa.length} data siswa dari Google Form ke Database Sekolah! Pas foto resmi telah dibuat otomatis sesuai aturan tahun lahir.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Integrasi Google Forms & Google Drive
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Workspace API
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Buat formulir PPDB/Dapodik, kelola kuesioner, dan sinkronkan respons langsung ke Data Kesiswaan SMA
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

        {/* Workspace Account Status Banner */}
        <div className="bg-purple-50/60 border-b border-purple-100 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {isSignedIn && userProfile ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {userProfile.displayName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{userProfile.displayName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">
                      Terhubung
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {userProfile.email}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span className="text-slate-700">
                  Google Workspace (Drive & Forms API) siap digunakan untuk akun <strong>dwibudiono99@admin.sma.belajar.id</strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <button
                onClick={handleSignOut}
                className="px-2.5 py-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 text-[11px] flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Putuskan Akun</span>
              </button>
            ) : (
              /* Official Google Sign-In button per guidelines */
              <button
                id="btn-google-workspace-signin"
                onClick={handleSignIn}
                disabled={isLoading}
                className="gsi-material-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #747775',
                  borderRadius: '20px',
                  boxSizing: 'border-box',
                  color: '#1f1f1f',
                  cursor: 'pointer',
                  fontFamily: "'Roboto', arial, sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  height: '36px',
                  letterSpacing: '0.25px',
                  outline: 'none',
                  overflow: 'hidden',
                  padding: '0 16px',
                  position: 'relative',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  whiteSpace: 'nowrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '18px', height: '18px' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </div>
                <span>{isLoading ? 'Menghubungkan...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-3.5 py-2.5 font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'forms'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Formulir di Google Drive ({formsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2.5 font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Formulir Baru (1-Klik)</span>
          </button>

          <button
            onClick={() => setActiveTab('responses')}
            className={`px-3.5 py-2.5 font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'responses'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Respons & Impor ke Data Siswa {selectedForm && `(${selectedForm.name.slice(0, 20)}...)`}</span>
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Formulir Saya */}
        {activeTab === 'forms' && (
          <div className="p-5 overflow-y-auto flex-grow space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Daftar Google Forms Anda
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih formulir untuk melihat respons dan menyinkronkan data pendaftaran ke buku induk siswa.
                </p>
              </div>

              {isSignedIn && (
                <button
                  onClick={() => accessToken && loadForms(accessToken)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Segarkan Drive</span>
                </button>
              )}
            </div>

            {/* Forms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {formsList.map((form) => (
                <div
                  key={form.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        ID: {form.id.slice(0, 10)}...
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs mt-2.5 line-clamp-2">
                      {form.name}
                    </h4>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>Diperbarui: {new Date(form.modifiedTime || Date.now()).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={form.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1"
                    >
                      <span>Buka di Google Forms</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleSelectFormForResponses(form)}
                      className="px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <span>Lihat Respons</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {formsList.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-xs">Belum ada Google Forms yang ditemukan</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Buat formulir baru dengan 1-klik melalui tab "Buat Formulir Baru" di atas.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Buat Formulir Baru Otomatis */}
        {activeTab === 'create' && (
          <div className="p-5 overflow-y-auto flex-grow space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Generator Otomatis Google Forms untuk Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                Sistem akan membuat formulir resmi langsung di akun Google Drive Anda dengan pertanyaan yang telah disesuaikan dengan standar Dapodik dan Dinas Pendidikan.
              </p>
            </div>

            {/* Template Card: Standar PPDB & Dapodik */}
            <div className="p-4 rounded-xl border-2 border-purple-500 bg-purple-50/40 relative">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Formulir Biodata & Pendaftaran Siswa SMA Baru (Standar Resmi Dapodik)
                    </h4>
                    <span className="text-[10px] text-purple-700 font-semibold">
                      Rekomendasi Utama &bull; Terintegrasi 14 Kolom Pertanyaan Standar
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                  1-Klik
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <p>Otomatis menyertakan pertanyaan:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-700 font-medium">
                  <span>✓ NISN 10 Digit (Wajib)</span>
                  <span>✓ Nama Lengkap</span>
                  <span>✓ NIK 16 Digit</span>
                  <span>✓ Tempat & Tgl Lahir</span>
                  <span>✓ Jenis Kelamin</span>
                  <span>✓ Agama</span>
                  <span>✓ Tingkat Kelas & Rombel</span>
                  <span>✓ Peminatan Kurikulum</span>
                  <span>✓ Alamat Lengkap</span>
                  <span>✓ Nomor WA Siswa</span>
                  <span>✓ Data Ayah & Ibu</span>
                  <span>✓ Nomor Darurat Ortu</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  id="btn-create-standard-form"
                  onClick={handleCreateForm}
                  disabled={isCreatingForm}
                  className="btn-3d btn-3d-purple px-4 py-2 text-xs font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingForm ? 'Sedang Membuat di Google Drive...' : 'Buat Formulir Dapodik Sekarang'}</span>
                </button>

                {createdFormUrl && (
                  <a
                    href={createdFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 underline"
                  >
                    <span>Buka Formulir yang Baru Dibuat</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Template Card: Pemilihan Mapel Pilihan Fase F */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Formulir Angket Pemilihan Mata Pelajaran Pilihan Fase F (Kelas XI)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sesuai panduan pemilihan mata pelajaran pilihan Kurikulum Merdeka (MIPA, IPS, Bahasa, Vokasi).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Respons & Sinkronisasi ke Siswa */}
        {activeTab === 'responses' && (
          <div className="p-5 overflow-y-auto flex-grow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Respons Formulir: {selectedForm ? selectedForm.name : 'Belum Memilih Formulir'}
                </h3>
                <p className="text-xs text-slate-500">
                  {formResponses.length} respons pendaftaran siap diimpor ke Buku Induk Siswa SMA.
                </p>
              </div>

              {formResponses.length > 0 && (
                <button
                  id="btn-import-form-responses"
                  onClick={handleImportResponses}
                  className="btn-3d btn-3d-green px-4 py-2 text-xs font-bold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Impor {formResponses.length} Siswa ke Database</span>
                </button>
              )}
            </div>

            {/* Responses Table Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Waktu Masuk</th>
                      <th className="py-2.5 px-3">Email Pengirim</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">NISN</th>
                      <th className="py-2.5 px-3">Aturan Pas Foto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formResponses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          {isFetchingResponses ? 'Mengambil data respons dari Google Forms API...' : 'Belum ada respons pada formulir ini.'}
                        </td>
                      </tr>
                    ) : (
                      formResponses.map((resp, i) => {
                        // Extract sample nama & nisn for preview
                        let nama = 'Siswa Pendaftar';
                        let nisn = '-';
                        let tglLahir = '2008-01-01';

                        if (resp.answers) {
                          for (const ans of Object.values(resp.answers)) {
                            const val = ans.textAnswers?.answers?.[0]?.value || '';
                            if (val.length === 10 && /^\d+$/.test(val)) nisn = val;
                            if (val.includes(' ') && val.length > 5 && !val.includes('@')) nama = val;
                            if (val.includes('-') && val.length === 10) tglLahir = val;
                          }
                        }

                        const year = parseInt(tglLahir.split('-')[0]) || 2008;
                        const isOdd = year % 2 !== 0;

                        return (
                          <tr key={resp.responseId || i} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-400 font-mono">{i + 1}</td>
                            <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                              {resp.createTime ? new Date(resp.createTime).toLocaleTimeString('id-ID') : '-'}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                              {resp.respondentEmail || 'siswa@belajar.id'}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-800">{nama}</td>
                            <td className="py-2 px-3 font-mono text-blue-700 font-semibold">{nisn}</td>
                            <td className="py-2 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isOdd ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {isOdd ? 'Merah (Tahun Ganjil)' : 'Biru (Tahun Genap)'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Google Workspace Forms API & Google Drive API Connected</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
