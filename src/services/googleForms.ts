import { GoogleFormItem, GoogleFormDetail, GoogleFormSubmission, Siswa } from '../types';
import { createOfficialSiswaPhoto } from '../data/initialSiswaData';

/**
 * List all Google Forms available in user's Google Drive
 */
export async function listGoogleForms(accessToken: string): Promise<GoogleFormItem[]> {
  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.form' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime,modifiedTime)&orderBy=modifiedTime desc&pageSize=25`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal mengambil daftar formulir (Status: ${res.status})`);
  }

  const data = await res.json();
  const forms: GoogleFormItem[] = (data.files || []).map((file: any) => ({
    id: file.id,
    name: file.name,
    title: file.name,
    webViewLink: file.webViewLink,
    createdTime: file.createdTime,
    modifiedTime: file.modifiedTime
  }));

  return forms;
}

/**
 * Get detailed information about a Google Form including all questions/items
 */
export async function getFormDetails(accessToken: string, formId: string): Promise<GoogleFormDetail> {
  const url = `https://forms.googleapis.com/v1/forms/${formId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal mengambil detail formulir (Status: ${res.status})`);
  }

  return await res.json();
}

/**
 * Get all submitted responses from a Google Form
 */
export async function getFormResponses(
  accessToken: string,
  formId: string
): Promise<GoogleFormSubmission[]> {
  const url = `https://forms.googleapis.com/v1/forms/${formId}/responses`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal mengambil respons formulir (Status: ${res.status})`);
  }

  const data = await res.json();
  return data.responses || [];
}

/**
 * Create a new standardized Google Form for Student Biodata (Dapodik / Kesiswaan)
 */
export async function createStandardSiswaForm(
  accessToken: string,
  namaSekolah: string
): Promise<{ formId: string; responderUri: string; editUrl: string }> {
  // Step 1: Create Form
  const title = `Formulir Biodata & Pendaftaran Siswa SMA - ${namaSekolah}`;
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      info: {
        title: title,
        documentTitle: `Biodata Siswa ${namaSekolah}`
      }
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal membuat Google Form');
  }

  const createdForm = await createRes.json();
  const formId = createdForm.formId;
  const responderUri = createdForm.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`;

  // Step 2: BatchUpdate to add items/questions
  const questionsBatch = {
    requests: [
      {
        updateFormInfo: {
          info: {
            description: `Formulir resmi pengumpulan data peserta didik baru / pemutakhiran data Dapodik SMA Negeri sesuai aturan Dinas Pendidikan Jawa Timur. Harap diisi dengan data akurat sesuai Akta Kelahiran dan Kartu Keluarga.`
          },
          updateMask: 'description'
        }
      },
      {
        createItem: {
          item: {
            title: 'Nomor Induk Siswa Nasional (NISN)',
            description: '10 Digit angka NISN resmi Kemendikbud',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          location: { index: 0 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Nama Lengkap Siswa',
            description: 'Sesuai dengan Akta Kelahiran dan Ijazah SMP',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          location: { index: 1 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Nomor Induk Kependudukan (NIK Siswa)',
            description: '16 digit angka NIK di Kartu Keluarga',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          location: { index: 2 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Jenis Kelamin',
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'RADIO',
                  options: [
                    { value: 'Laki-laki' },
                    { value: 'Perempuan' }
                  ]
                }
              }
            }
          },
          location: { index: 3 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Tempat Lahir',
            description: 'Contoh: Surabaya, Sidoarjo, Malang',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          location: { index: 4 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Tanggal Lahir',
            description: 'Format: YYYY-MM-DD (Tahun-Bulan-Tanggal)',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          location: { index: 5 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Agama',
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'RADIO',
                  options: [
                    { value: 'Islam' },
                    { value: 'Kristen Protestan' },
                    { value: 'Katolik' },
                    { value: 'Hindu' },
                    { value: 'Buddha' },
                    { value: 'Konghucu' }
                  ]
                }
              }
            }
          },
          location: { index: 6 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Tingkat Kelas',
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'RADIO',
                  options: [
                    { value: 'Kelas X' },
                    { value: 'Kelas XI' },
                    { value: 'Kelas XII' }
                  ]
                }
              }
            }
          },
          location: { index: 7 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Peminatan / Minat Bakat (Kurikulum Merdeka)',
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'RADIO',
                  options: [
                    { value: 'Kurikulum Merdeka (Eksplorasi Minat & Bakat Fase E)' },
                    { value: 'MIPA (Fisika, Kimia, Biologi, Matematika Lanjut)' },
                    { value: 'IPS (Ekonomi, Sosiologi, Geografi, Sejarah Tingkat Lanjut)' },
                    { value: 'Bahasa & Budaya (Bahasa Asing, Sastra Indonesia, Antropologi)' }
                  ]
                }
              }
            }
          },
          location: { index: 8 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Alamat Tempat Tinggal Lengkap',
            description: 'Nama jalan, nomor rumah, RT/RW, kelurahan, dan kecamatan',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: true }
              }
            }
          },
          location: { index: 9 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Nomor WhatsApp / HP Siswa',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          location: { index: 10 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Nama Ayah Kandung & Pekerjaan',
            description: 'Contoh: Bambang Sudarmanto (Wiraswasta)',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          location: { index: 11 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Nama Ibu Kandung & Pekerjaan',
            description: 'Contoh: Endang Sri Wahyuni (Guru)',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          location: { index: 12 }
        }
      },
      {
        createItem: {
          item: {
            title: 'Nomor HP / WhatsApp Orang Tua / Wali',
            description: 'Nomor darurat aktif',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          location: { index: 13 }
        }
      }
    ]
  };

  const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(questionsBatch)
  });

  if (!updateRes.ok) {
    console.warn('Form created but failed to populate items in batch update');
  }

  return {
    formId,
    responderUri,
    editUrl: `https://docs.google.com/forms/d/${formId}/edit`
  };
}

/**
 * Converts Google Form Responses to Siswa records
 */
export function convertFormResponsesToSiswa(
  formDetails: GoogleFormDetail,
  submissions: GoogleFormSubmission[],
  defaultWaliKelas: string = 'Wali Kelas SMA'
): Siswa[] {
  // Build a lookup from questionId to question title lowercase
  const questionMap: Record<string, string> = {};
  if (formDetails.items) {
    for (const item of formDetails.items) {
      if (item.questionItem?.question?.questionId) {
        questionMap[item.questionItem.question.questionId] = (item.title || '').toLowerCase();
      }
    }
  }

  const results: Siswa[] = [];

  submissions.forEach((sub, idx) => {
    let nisn = '';
    let nama = '';
    let nik = '';
    let jk: 'Laki-laki' | 'Perempuan' = 'Laki-laki';
    let tempatLahir = 'Surabaya';
    let tanggalLahir = '2008-01-01';
    let agama: any = 'Islam';
    let tingkatKelas: any = 'Kelas X';
    let rombel = 'X-1';
    let peminatan = 'Kurikulum Merdeka (Eksplorasi Minat & Bakat Fase E)';
    let alamat = '';
    let noHpSiswa = '';
    let namaAyah = '';
    let pekerjaanAyah = '';
    let namaIbu = '';
    let pekerjaanIbu = '';
    let noHpOrtu = '';

    if (sub.answers) {
      for (const [qId, ans] of Object.entries(sub.answers)) {
        const val = ans.textAnswers?.answers?.[0]?.value?.trim() || '';
        const title = questionMap[qId] || '';

        if (title.includes('nisn')) {
          nisn = val;
        } else if (title.includes('nama lengkap') || title.includes('nama siswa')) {
          nama = val;
        } else if (title.includes('nik')) {
          nik = val;
        } else if (title.includes('jenis kelamin')) {
          jk = val.toLowerCase().includes('perempuan') ? 'Perempuan' : 'Laki-laki';
        } else if (title.includes('tempat lahir')) {
          tempatLahir = val;
        } else if (title.includes('tanggal lahir')) {
          tanggalLahir = val;
        } else if (title.includes('agama')) {
          agama = val;
        } else if (title.includes('kelas') || title.includes('tingkat')) {
          tingkatKelas = val.includes('XII') ? 'Kelas XII' : val.includes('XI') ? 'Kelas XI' : 'Kelas X';
        } else if (title.includes('peminatan') || title.includes('minat')) {
          peminatan = val;
        } else if (title.includes('alamat')) {
          alamat = val;
        } else if (title.includes('whatsapp') && !title.includes('orang tua')) {
          noHpSiswa = val;
        } else if (title.includes('ayah')) {
          namaAyah = val;
        } else if (title.includes('ibu')) {
          namaIbu = val;
        } else if (title.includes('orang tua') || title.includes('wali')) {
          noHpOrtu = val;
        }
      }
    }

    if (!nama) {
      nama = `Siswa Respons #${idx + 1}`;
    }
    if (!nisn) {
      nisn = `008${Math.floor(1000000 + Math.random() * 9000000)}`;
    }
    if (!nik) {
      nik = `35780${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    }

    // Determine birth year for official Dinas photo background rule
    const birthYear = parseInt(tanggalLahir.split('-')[0]) || 2008;
    const isOddYear = birthYear % 2 !== 0;
    const photoBg = isOddYear ? 'red' : 'blue';

    results.push({
      id: Date.now() + idx,
      nisn,
      nis: `2324${1100 + idx}`,
      nik,
      nama,
      jk,
      tempatLahir: tempatLahir || 'Surabaya',
      tanggalLahir: tanggalLahir || '2008-05-10',
      agama: agama || 'Islam',
      tingkatKelas,
      rombel,
      faseKurikulum: tingkatKelas === 'Kelas X' ? 'Fase E (Kelas X)' : 'Fase F (Kelas XI - XII)',
      peminatan: peminatan || 'Kurikulum Merdeka',
      statusSiswa: 'Aktif',
      alamat: alamat || 'Jl. Menur Pumpungan, Surabaya',
      kotaKab: 'Kota Surabaya',
      noHpSiswa: noHpSiswa || '081234567890',
      email: sub.respondentEmail || `${nama.toLowerCase().replace(/\s+/g, '.')}@siswa.sma.belajar.id`,
      namaAyah: namaAyah || 'Orang Tua Siswa',
      pekerjaanAyah: pekerjaanAyah || 'Wiraswasta',
      namaIbu: namaIbu || 'Ibu Siswa',
      pekerjaanIbu: pekerjaanIbu || 'Ibu Rumah Tangga',
      noHpOrtu: noHpOrtu || '081298765432',
      waliKelas: defaultWaliKelas,
      fotoBgColor: isOddYear ? 'Merah (Tahun Lahir Ganjil)' : 'Biru (Tahun Lahir Genap)',
      foto: createOfficialSiswaPhoto(photoBg, jk === 'Laki-laki' ? 'L' : 'P', idx + 1),
      catatanKhusus: `Diimpor otomatis dari respons Google Form (${sub.createTime ? new Date(sub.createTime).toLocaleDateString('id-ID') : 'Terkini'})`
    });
  });

  return results;
}
