import React, { useState, useRef } from "react";
import { Pegawai, KopSekolah } from "../types";
import { getRumpunMeta } from "../data/smaMapelData";
import {
  Sparkles,
  RotateCw,
  Printer,
  Download,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Zap,
  Radio,
  Cpu,
  QrCode,
  Eye,
  CheckCircle,
  Share2,
  Palette,
} from "lucide-react";

export type FuturisticThemeId =
  | "cyber-neon"
  | "quantum-aurora"
  | "matrix-synth"
  | "hyper-horizon"
  | "titanium-prism";

interface FuturisticTheme {
  id: FuturisticThemeId;
  name: string;
  badge: string;
  bgGradient: string;
  gridOverlay: string;
  cardBorder: string;
  cardBg: string;
  cardGlow: string;
  accentColor: string;
  accentText: string;
  hologramColor: string;
  tagColor: string;
}

export const FUTURISTIC_THEMES: Record<FuturisticThemeId, FuturisticTheme> = {
  "cyber-neon": {
    id: "cyber-neon",
    name: "Cyber Grid Neon",
    badge: "CYBER-01",
    bgGradient: "from-[#050B14] via-[#091528] to-[#030710]",
    gridOverlay:
      "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 70%), linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px)",
    cardBorder: "border-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.35)]",
    cardBg:
      "bg-gradient-to-br from-slate-950/95 via-[#0b192e]/95 to-[#040914]/95",
    cardGlow: "from-cyan-500/20 via-blue-500/10 to-transparent",
    accentColor: "#06b6d4",
    accentText: "text-cyan-400",
    hologramColor:
      "linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(59,130,246,0.2) 25%, rgba(168,85,247,0.3) 50%, rgba(6,182,212,0.3) 75%)",
    tagColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
  },
  "quantum-aurora": {
    id: "quantum-aurora",
    name: "Quantum Aurora",
    badge: "AURORA-02",
    bgGradient: "from-[#0d041a] via-[#1a0836] to-[#06010d]",
    gridOverlay:
      "radial-gradient(circle at 60% 40%, rgba(168, 85, 247, 0.2) 0%, transparent 60%), radial-gradient(circle at 30% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), linear-gradient(rgba(168, 85, 247, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.07) 1px, transparent 1px)",
    cardBorder: "border-purple-400/60 shadow-[0_0_45px_rgba(168,85,247,0.35)]",
    cardBg:
      "bg-gradient-to-br from-[#120724]/95 via-[#1c0d38]/95 to-[#080212]/95",
    cardGlow: "from-purple-500/25 via-fuchsia-500/15 to-emerald-500/10",
    accentColor: "#a855f7",
    accentText: "text-purple-400",
    hologramColor:
      "linear-gradient(135deg, rgba(168,85,247,0.35) 0%, rgba(236,72,153,0.25) 30%, rgba(16,185,129,0.3) 70%, rgba(168,85,247,0.35) 100%)",
    tagColor: "bg-purple-500/20 text-purple-300 border-purple-400/40",
  },
  "matrix-synth": {
    id: "matrix-synth",
    name: "Matrix Quantum",
    badge: "MATRIX-03",
    bgGradient: "from-[#020d07] via-[#041d10] to-[#010804]",
    gridOverlay:
      "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.18) 0%, transparent 65%), linear-gradient(rgba(16, 185, 129, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.09) 1px, transparent 1px)",
    cardBorder: "border-emerald-400/60 shadow-[0_0_40px_rgba(16,185,129,0.35)]",
    cardBg:
      "bg-gradient-to-br from-[#03140b]/95 via-[#062414]/95 to-[#010b06]/95",
    cardGlow: "from-emerald-500/25 via-teal-500/15 to-transparent",
    accentColor: "#10b981",
    accentText: "text-emerald-400",
    hologramColor:
      "linear-gradient(135deg, rgba(16,185,129,0.35) 0%, rgba(20,184,166,0.25) 40%, rgba(132,204,22,0.3) 70%, rgba(16,185,129,0.35) 100%)",
    tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  },
  "hyper-horizon": {
    id: "hyper-horizon",
    name: "Hyper-Drive Gold",
    badge: "WARP-04",
    bgGradient: "from-[#0e0902] via-[#211403] to-[#060300]",
    gridOverlay:
      "radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.2) 0%, transparent 65%), linear-gradient(rgba(245, 158, 11, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.08) 1px, transparent 1px)",
    cardBorder: "border-amber-400/60 shadow-[0_0_45px_rgba(245,158,11,0.35)]",
    cardBg:
      "bg-gradient-to-br from-[#1c1204]/95 via-[#291905]/95 to-[#0a0601]/95",
    cardGlow: "from-amber-500/25 via-orange-500/15 to-yellow-500/10",
    accentColor: "#f59e0b",
    accentText: "text-amber-400",
    hologramColor:
      "linear-gradient(135deg, rgba(245,158,11,0.35) 0%, rgba(249,115,22,0.25) 35%, rgba(234,179,8,0.3) 70%, rgba(245,158,11,0.35) 100%)",
    tagColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  },
  "titanium-prism": {
    id: "titanium-prism",
    name: "Titanium Prism Glass",
    badge: "PRISM-05",
    bgGradient: "from-[#070b12] via-[#0f1724] to-[#04060a]",
    gridOverlay:
      "radial-gradient(circle at 70% 30%, rgba(56, 189, 248, 0.18) 0%, transparent 60%), linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
    cardBorder: "border-sky-300/60 shadow-[0_0_40px_rgba(56,189,248,0.3)]",
    cardBg:
      "bg-gradient-to-br from-slate-900/95 via-[#131d2e]/95 to-slate-950/95",
    cardGlow: "from-sky-400/20 via-indigo-400/15 to-rose-400/10",
    accentColor: "#38bdf8",
    accentText: "text-sky-400",
    hologramColor:
      "linear-gradient(135deg, rgba(56,189,248,0.35) 0%, rgba(129,140,248,0.25) 30%, rgba(244,114,182,0.3) 70%, rgba(56,189,248,0.35) 100%)",
    tagColor: "bg-sky-500/20 text-sky-300 border-sky-400/40",
  },
};

interface FuturisticKtaPreviewProps {
  pegawai: Pegawai;
  kop?: KopSekolah;
  onPrint?: () => void;
  onEdit?: () => void;
  onManageFoto?: () => void;
}

export const FuturisticKtaPreview: React.FC<FuturisticKtaPreviewProps> = ({
  pegawai,
  kop,
  onPrint,
  onEdit,
  onManageFoto,
}) => {
  const [selectedThemeId, setSelectedThemeId] =
    useState<FuturisticThemeId>("cyber-neon");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimationActive, setIsAnimationActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const theme = FUTURISTIC_THEMES[selectedThemeId];

  // Mouse move tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const rumpun = pegawai.rumpunMapel;
  const rumpunMeta = getRumpunMeta(rumpun);

  // Generate simulated RFID & smart ID code
  const idStr = String(pegawai.id);
  const smartCardId = `EID-${idStr.slice(-4).padStart(4, "0")}-SMAN`;
  const nfcUid = `04:${pegawai.nip.slice(-4).padStart(4, "0")}:${idStr.padStart(4, "0")}`;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none h-screen flex flex-col justify-between"
          : "min-h-[560px] flex flex-col justify-between border border-slate-800"
      }`}
    >
      {/* Dynamic Futuristic Stage Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} transition-colors duration-500`}
      />

      {/* Grid Pattern Overlay with Cyber Motion */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none animate-grid-drift"
        style={{
          backgroundImage: theme.gridOverlay,
          backgroundSize: "40px 40px, 40px 40px, 40px 40px",
        }}
      />

      {/* Futuristic Telemetry HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between text-[10px] font-mono text-slate-500/80 select-none">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="font-bold tracking-wider">
                HUD.SYSTEM // v4.8 ONLINE
              </span>
            </div>
            <p className="text-[9px] text-slate-600">
              SMART KTA PROTOCOL • ISO/IEC 7810
            </p>
          </div>
          <div className="text-right text-slate-400">
            <span className="font-bold">{theme.badge}</span>
            <p className="text-[9px] text-slate-600">ENCRYPTION: AES-256 GCM</p>
          </div>
        </div>

        {/* Ambient Corner Crosshairs */}
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <p className="text-[9px] text-slate-600">
              LAT: -7.9542° S • LON: 112.6304° E
            </p>
            <p className="text-[9px] text-slate-500 font-semibold">
              {kop?.namaSekolah || "SMA NEGERI RESMI"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[9px] text-slate-400">
              STATUS: TERVERIFIKASI
            </span>
          </div>
        </div>
      </div>

      {/* Top Futuristic Interactive Toolbar */}
      <div className="relative z-20 p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Futuristic Mode Label & Theme Switcher */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/90 text-white font-black px-2.5 py-1 rounded-lg border border-white/10 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="tracking-wide text-[11px]">
              PREVIEW KTA FUTURISTIK
            </span>
          </div>

          {/* Theme Quick Pills */}
          <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            {(Object.keys(FUTURISTIC_THEMES) as FuturisticThemeId[]).map(
              (themeId) => {
                const th = FUTURISTIC_THEMES[themeId];
                const isSelected = selectedThemeId === themeId;
                return (
                  <button
                    key={themeId}
                    type="button"
                    onClick={() => setSelectedThemeId(themeId)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                      isSelected
                        ? "bg-white/20 text-white shadow-xs border border-white/30"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                    title={`Ganti Tema: ${th.name}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: th.accentColor }}
                    />
                    <span>{th.name.split(" ")[0]}</span>
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Right: Stage Control Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Flip 3D Button */}
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="btn-3d btn-3d-cyan text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
            title="Balik Kartu (Tampak Depan / Belakang)"
          >
            <RotateCw
              className={`w-3.5 h-3.5 transition-transform duration-500 ${isFlipped ? "rotate-180" : ""}`}
            />
            <span>{isFlipped ? "Tampak Depan" : "Tampak Belakang"}</span>
          </button>

          {/* Toggle Animation */}
          <button
            type="button"
            onClick={() => setIsAnimationActive(!isAnimationActive)}
            className={`btn-3d-icon p-1.5 rounded-lg text-xs font-semibold ${
              isAnimationActive
                ? "btn-3d-emerald text-white"
                : "btn-3d-dark text-slate-300"
            }`}
            title={
              isAnimationActive
                ? "Matikan Efek Animasi Laser"
                : "Nyalakan Efek Animasi Laser"
            }
          >
            <Zap className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="btn-3d-icon btn-3d-dark p-1.5 rounded-lg text-white"
            title={
              isFullscreen
                ? "Keluar Layar Penuh"
                : "Mode Layar Penuh (Panggung)"
            }
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main 3D Card Showcase Arena */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 perspective-1000 select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ambient Radial Spotlight following theme */}
        <div
          className={`absolute w-96 h-96 rounded-full blur-3xl opacity-35 pointer-events-none transition-all duration-700 ${theme.cardGlow}`}
          style={{
            transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)`,
          }}
        />

        {/* 3D Flippable Card Container */}
        <div
          ref={cardRef}
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full max-w-[430px] aspect-[1.586/1] cursor-pointer transition-transform duration-700 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          } ${isAnimationActive ? "animate-float" : ""}`}
          style={{
            transform: isFlipped
              ? `rotateY(180deg) rotateX(${mousePos.y * -12}deg) rotateZ(${mousePos.x * 4}deg)`
              : `rotateY(${mousePos.x * 14}deg) rotateX(${mousePos.y * -14}deg)`,
            transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          {/* ==================== CARD FRONT ==================== */}
          <div
            className={`absolute inset-0 rounded-2xl ${theme.cardBorder} ${theme.cardBg} backface-hidden p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl border-2`}
          >
            {/* Holographic Foil Shimmer Layer */}
            {isAnimationActive && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-color-dodge animate-hologram"
                style={{ backgroundImage: theme.hologramColor }}
              />
            )}

            {/* Anti-counterfeit Guilloche Pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 50%, transparent 20%, rgba(255,255,255,0.1) 21%, transparent 22%), radial-gradient(circle at 20% 80%, transparent 30%, rgba(255,255,255,0.08) 31%, transparent 32%)",
                backgroundSize: "30px 30px, 50px 50px",
              }}
            />

            {/* Watermark Logo in Background */}
            {kop?.logoKiri && (
              <img
                src={kop.logoKiri}
                alt="Watermark"
                className="absolute -right-8 -bottom-8 w-44 h-44 object-contain opacity-5 pointer-events-none"
              />
            )}

            {/* --- Card Front Header --- */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2.5">
                {/* School Logo */}
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0 backdrop-blur-md shadow-xs">
                  {kop?.logoKiri ? (
                    <img
                      src={kop.logoKiri}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono leading-none">
                    {kop?.instansiAtas || "PEMERINTAH PROVINSI"}
                  </p>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white truncate drop-shadow-sm font-serif">
                    {kop?.namaSekolah || "SMA NEGERI TELADAN"}
                  </h3>
                  <p className="text-[8px] text-slate-400 truncate leading-none mt-0.5">
                    KARTU TANDA ANGGOTA DIGITAL ELEKTRONIK
                  </p>
                </div>
              </div>

              {/* Contactless Wave & Smart Chip Badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Radio
                  className={`w-4 h-4 ${theme.accentText} animate-pulse`}
                />
                <span className="text-[9px] font-mono font-bold text-slate-300 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                  NFC
                </span>
              </div>
            </div>

            {/* --- Card Front Middle: Photo + Cyber Reticle + Bio --- */}
            <div className="relative z-10 flex items-center gap-3.5 my-1">
              {/* Photo Frame with Biometric Reticle */}
              <div className="relative shrink-0">
                <div className="w-20 h-24 sm:w-22 sm:h-28 rounded-xl bg-slate-900 border-2 border-white/20 overflow-hidden relative shadow-lg group">
                  {pegawai.foto ? (
                    <img
                      src={pegawai.foto}
                      alt={pegawai.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-1 text-center">
                      <span className="text-2xl font-black uppercase text-cyan-400">
                        {pegawai.nama.slice(0, 2)}
                      </span>
                      <span className="text-[8px] text-slate-400 mt-1 font-mono">
                        {pegawai.jk === "Perempuan" ? "FEMALE" : "MALE"}
                      </span>
                    </div>
                  )}

                  {/* Laser Scanline Sweep across photo */}
                  {isAnimationActive && (
                    <div className="absolute inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-laser pointer-events-none" />
                  )}

                  {/* Reticle Brackets */}
                  <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />

                  {/* Biometric Status Tag */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-xs text-[7px] text-center font-mono font-bold text-cyan-300 py-0.5 border-t border-cyan-500/30">
                    BIO-ID: 99.8% OK
                  </div>
                </div>

                {/* Simulated Gold Smart Chip */}
                <div
                  className="absolute -bottom-2 -right-2 w-7 h-5 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200 shadow-md flex items-center justify-center p-0.5"
                  title="Simulated Contactless Chip"
                >
                  <Cpu className="w-3.5 h-3.5 text-amber-900" />
                </div>
              </div>

              {/* Bio & Credentials Details */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* Employee Name */}
                <h4 className="text-sm sm:text-base font-extrabold text-white truncate tracking-tight drop-shadow-sm leading-tight">
                  {pegawai.nama}
                </h4>

                {/* NIP & NUPTK */}
                <div className="font-mono text-[10px] sm:text-[11px] text-slate-300 leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">NIP:</span>
                    <strong className="text-white font-bold">
                      {pegawai.nip}
                    </strong>
                  </div>
                  {pegawai.nuptk && (
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <span className="text-slate-500">NUPTK:</span>
                      <span>{pegawai.nuptk}</span>
                    </div>
                  )}
                </div>

                {/* Status Pegawai Badge & Duty */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${theme.tagColor}`}
                  >
                    {pegawai.statusPegawai}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-300 truncate max-w-[150px]">
                    {pegawai.jenisPtk}
                  </span>
                </div>

                {/* Subject / Mapel SMA */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <span className={`${theme.accentText} font-bold truncate`}>
                    {pegawai.mapel}
                  </span>
                  {pegawai.jumlahJamMengajar !== undefined && (
                    <span className="text-[9px] bg-white/10 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                      {pegawai.jumlahJamMengajar} Jam
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* --- Card Front Footer --- */}
            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5 inline" />
                  E-ID VALID
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">{smartCardId}</span>
              </div>
              <div className="text-right text-slate-500 text-[8px]">
                CLICK TO FLIP CARD ⟲
              </div>
            </div>
          </div>

          {/* ==================== CARD BACK ==================== */}
          <div
            className={`absolute inset-0 rounded-2xl ${theme.cardBorder} ${theme.cardBg} backface-hidden rotate-y-180 p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl border-2`}
          >
            {/* Magnetic Stripe on Top */}
            <div className="-mx-5 -mt-5 mb-3 bg-gradient-to-r from-neutral-900 via-black to-neutral-900 h-9 border-b border-white/10 flex items-center px-4">
              <span className="font-mono text-[8px] text-slate-600 tracking-widest truncate">
                01010011 01001101 01000001 01001110 // SHA-256 ENCRYPTED
                SIGNATURE
              </span>
            </div>

            {/* Security Notice & School Credentials */}
            <div className="space-y-1 text-[8px] text-slate-400 leading-tight">
              <p className="font-bold text-slate-300">
                KETENTUAN KARTU TANDA ANGGOTA DIGITAL:
              </p>
              <p>
                1. Kartu ini adalah tanda pengenal resmi Tenaga Pendidik &
                Tenaga Kependidikan {kop?.namaSekolah || "SMA Negeri"}.
              </p>
              <p>
                2. Wajib dibawa saat bertugas kedinasan dan presensi elektronik
                SIMPEG.
              </p>
              <p>
                3. Pindai kode QR untuk verifikasi keabsahan data kepegawaian
                resmi.
              </p>
            </div>

            {/* Verification QR Code & Barcode Section */}
            <div className="flex items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10 my-1">
              {/* Dynamic QR Code */}
              <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center relative">
                <QrCode className="w-full h-full text-slate-900" />
                <div className="absolute inset-0 border-2 border-cyan-400/40 rounded-lg pointer-events-none" />
              </div>

              {/* Barcode & Signature */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* Simulated Barcode */}
                <div className="h-7 w-full bg-white/90 p-0.5 rounded flex items-center justify-between overflow-hidden">
                  {Array.from({ length: 34 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full bg-slate-900"
                      style={{
                        width:
                          i % 4 === 0 ? "3px" : i % 2 === 0 ? "2px" : "1px",
                        opacity: i % 5 === 0 ? 0.4 : 1,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[7px] font-mono text-slate-400">
                  <span>{nfcUid}</span>
                  <span>SIMPEG-VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Digital Stamp of School Principal */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[8px] text-slate-400">
              <div>
                <p className="font-bold text-slate-300">
                  {kop?.kotaKabupaten || "Kota Malang"}, Indonesia
                </p>
                <p className="text-[7px] text-slate-500">
                  Dicetak melalui Sistem SIMPEG Digital SMAN
                </p>
              </div>

              <div className="text-right">
                <span className="text-[7px] text-amber-400/90 font-mono uppercase font-bold border border-amber-400/30 px-1.5 py-0.5 rounded bg-amber-400/10">
                  TERDAFTAR RESMI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Futuristic Control & Action Ribbon */}
      <div className="relative z-20 p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Theme Switcher Selector Pills */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Pilih Background:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(FUTURISTIC_THEMES) as FuturisticThemeId[]).map(
              (themeId) => {
                const th = FUTURISTIC_THEMES[themeId];
                const isSelected = selectedThemeId === themeId;
                return (
                  <button
                    key={themeId}
                    type="button"
                    onClick={() => setSelectedThemeId(themeId)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30"
                        : "bg-slate-900/80 text-slate-400 hover:text-white border border-white/10 hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: th.accentColor }}
                    />
                    <span>{th.name}</span>
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Right: Print & Edit Profile Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="btn-3d btn-3d-dark text-white font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
              title="Cetak KTA"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Cetak KTA</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="btn-3d btn-3d-amber text-white font-bold px-3.5 py-1.5 rounded-xl text-xs"
            >
              Ubah Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
