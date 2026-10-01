import React from 'react';
import { Siswa } from '../types';
import { GraduationCap, Users, UserCheck, Award, BookOpen, School } from 'lucide-react';

interface SiswaStatCardsProps {
  siswaList: Siswa[];
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
}

export const SiswaStatCards: React.FC<SiswaStatCardsProps> = ({
  siswaList,
  selectedFilter,
  onFilterSelect
}) => {
  const total = siswaList.length;
  const totalLaki = siswaList.filter((s) => s.jk === 'Laki-laki').length;
  const totalPerempuan = siswaList.filter((s) => s.jk === 'Perempuan').length;
  const kelasX = siswaList.filter((s) => s.tingkatKelas === 'Kelas X').length;
  const kelasXI = siswaList.filter((s) => s.tingkatKelas === 'Kelas XI').length;
  const kelasXII = siswaList.filter((s) => s.tingkatKelas === 'Kelas XII').length;
  const berprestasi = siswaList.filter((s) => Boolean(s.prestasi)).length;

  const cards = [
    {
      id: 'ALL',
      title: 'Total Peserta Didik',
      count: total,
      subtext: `${totalLaki} Putra / ${totalPerempuan} Putri`,
      icon: GraduationCap,
      color: 'blue',
      badge: 'Aktif Terdaftar'
    },
    {
      id: 'Kelas X',
      title: 'Kelas X (Fase E)',
      count: kelasX,
      subtext: 'Kurikulum Merdeka Dasar',
      icon: BookOpen,
      color: 'emerald',
      badge: 'Fase E'
    },
    {
      id: 'Kelas XI',
      title: 'Kelas XI (Fase F)',
      count: kelasXI,
      subtext: 'Peminatan & Mapel Pilihan',
      icon: School,
      color: 'indigo',
      badge: 'Fase F'
    },
    {
      id: 'Kelas XII',
      title: 'Kelas XII (Fase F)',
      count: kelasXII,
      subtext: 'Persiapan SNBP/SNBT/PTN',
      icon: Users,
      color: 'amber',
      badge: 'Tingkat Akhir'
    },
    {
      id: 'PRESTASI',
      title: 'Siswa Berprestasi',
      count: berprestasi,
      subtext: 'OSN, FLS2N, Olahraga & Seni',
      icon: Award,
      color: 'rose',
      badge: 'Akademik & Non'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const isSelected = selectedFilter === card.id;
        const Icon = card.icon;

        let borderClass = 'border-slate-200/90 hover:border-slate-300';
        let bgClass = 'bg-white';
        let iconBg = 'bg-blue-50 text-blue-600';

        if (card.color === 'emerald') iconBg = 'bg-emerald-50 text-emerald-600';
        if (card.color === 'indigo') iconBg = 'bg-indigo-50 text-indigo-600';
        if (card.color === 'amber') iconBg = 'bg-amber-50 text-amber-600';
        if (card.color === 'rose') iconBg = 'bg-rose-50 text-rose-600';

        if (isSelected) {
          borderClass = 'border-blue-600 ring-2 ring-blue-500/20';
          bgClass = 'bg-blue-50/40';
        }

        return (
          <button
            key={card.id}
            id={`stat-card-siswa-${card.id}`}
            onClick={() => onFilterSelect(isSelected ? 'ALL' : card.id)}
            className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between shadow-xs ${borderClass} ${bgClass} cursor-pointer group`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg} transition-transform group-hover:scale-105`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {card.count}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span className="truncate max-w-[130px]">{card.subtext}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {card.badge}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
