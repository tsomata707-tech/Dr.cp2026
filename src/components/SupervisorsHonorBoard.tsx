import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  GraduationCap,
  ArrowLeft,
  X,
  BookOpen,
  Crown,
} from 'lucide-react';
import { getSupervisorsBoardConfig, INITIAL_RESEARCHER_INFO } from '../utils/supervisorsStorage';
import { SupervisorsHonorBoardConfig } from '../types';
import { CpLogo } from './CpLogo';

interface SupervisorsHonorBoardProps {
  onContinue?: () => void;
  onClose?: () => void;
  isModal?: boolean;
  showContinueButton?: boolean;
  continueButtonText?: string;
}

export const SupervisorsHonorBoard: React.FC<SupervisorsHonorBoardProps> = ({
  onContinue,
  onClose,
  isModal = false,
  showContinueButton = true,
  continueButtonText,
}) => {
  const [config, setConfig] = useState<SupervisorsHonorBoardConfig>(() => getSupervisorsBoardConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getSupervisorsBoardConfig());
    };
    window.addEventListener('supervisors-honor-board-updated', handleUpdate);
    return () => {
      window.removeEventListener('supervisors-honor-board-updated', handleUpdate);
    };
  }, []);

  const researcher = config.researcherInfo || INITIAL_RESEARCHER_INFO;
  // Ensure we display the supervisors in the bottom row (exclude any card with Hikmat if present)
  const supervisorsList = (config.supervisors || []).filter(
    (s) => !s.name?.includes('حكمت') && s.id !== 'sup-4'
  );

  // 🌟 Dynamic auto-alignment calculation so cards are ALWAYS symmetrically centered and aesthetically balanced:
  const getContainerLayoutClass = (count: number) => {
    if (count <= 1) {
      return 'flex justify-center max-w-sm mx-auto';
    }
    if (count === 2) {
      return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto justify-center';
    }
    if (count === 3) {
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 justify-center';
    }
    if (count === 4) {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 justify-center';
    }
    // 5 or more: centered wrapping flexbox so remaining items on the last row are automatically centered!
    return 'flex flex-wrap items-stretch justify-center gap-4 sm:gap-5';
  };

  const getCardWidthClass = (count: number) => {
    if (count <= 4) {
      return 'w-full';
    }
    return 'w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] max-w-sm';
  };

  const boardContent = (
    <div
      className="relative w-full max-w-5xl mx-auto z-10 font-['Cairo',_sans-serif] text-right py-2 select-none animate-fadeIn"
      id="supervisors-honor-board"
    >
      {/* Outer Golden & Emerald Ambient Aura */}
      <div className="absolute -inset-4 sm:-inset-6 rounded-[40px] bg-gradient-to-r from-[#ffd700]/25 via-purple-600/15 to-emerald-500/20 blur-3xl opacity-80 pointer-events-none" />

      {/* Main Large Glassmorphic Card (بطاقة كبيرة زجاجية فخمة) */}
      <div className="relative rounded-3xl bg-[#090b1c]/95 backdrop-blur-2xl border-2 border-[#ffd700]/80 shadow-[0_0_60px_rgba(212,175,55,0.35),0_30px_70px_rgba(0,0,0,0.9)] p-4 sm:p-7 lg:p-9 max-h-[92vh] overflow-y-auto">
        {/* Close Button if rendered as Modal */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق لوحة الشرف"
            className="absolute top-3 left-3 sm:top-4 sm:left-4 p-1.5 sm:p-2.5 rounded-full bg-slate-900/80 hover:bg-red-500/20 text-slate-300 hover:text-white border border-slate-700/60 transition-all z-20 cursor-pointer shadow-lg"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Decorative Golden Corner Flourishes */}
        <div className="hidden sm:block absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#ffd700] rounded-tr-3xl pointer-events-none" />
        <div className="hidden sm:block absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#ffd700] rounded-bl-3xl pointer-events-none" />

        {/* 1. Header Section */}
        <div className="flex flex-col items-center text-center pb-4 sm:pb-6 border-b border-[#ffd700]/30 relative z-10">
          {/* Logo with Golden Laurel Crown */}
          <div className="relative mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-[#141a38] to-[#0c1024] border-2 border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.45)]">
              <CpLogo size="md" showText={false} />
            </div>
            <div className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 via-[#ffd700] to-yellow-200 text-slate-950 flex items-center justify-center text-xs sm:text-base shadow-[0_0_15px_rgba(255,215,0,0.6)] animate-bounce">
              👑
            </div>
          </div>

          {/* Academic Affiliation Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
            <span className="px-3 sm:px-4 py-1 rounded-full bg-blue-950/80 border border-blue-400/50 text-blue-200 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>{config.university}</span>
            </span>
            <span className="px-3 sm:px-4 py-1 rounded-full bg-amber-950/80 border border-[#ffd700] text-[#ffd700] text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>رسالة ماجستير في تكنولوجيا التعليم</span>
            </span>
          </div>

          {/* 🌟 DISTINCTIVE GOLDEN TITLE 🌟 */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffeaa7] via-[#ffd700] to-[#f39c12] drop-shadow-[0_4px_25px_rgba(255,215,0,0.65)] font-['Tajawal'] tracking-tight mb-1.5 max-w-3xl leading-snug">
            {config.boardTitle}
          </h1>

          {/* Subtitle / Department Dedication */}
          {config.boardSubtitle ? (
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed font-medium px-2">
              {config.boardSubtitle}
            </p>
          ) : null}
        </div>

        {/* 🌟 2. TOP SECTION: اسم وصورة حكمت في الأعلى 🌟 */}
        <div className="my-5 sm:my-6 relative z-10" id="honor-board-top-researcher">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#111a33]/90 via-[#0e1629]/95 to-[#132230]/90 border-2 border-emerald-400/60 shadow-[0_10px_30px_rgba(16,185,129,0.2)] p-4 sm:p-6 transition-all">
            {/* Ambient emerald & gold badge */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-[11px] sm:text-xs font-black">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>الباحثة ومصممة البيئة</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-right">
              {/* Hikmat Photo in Golden Glowing Circular Frame */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-[#ffd700] to-emerald-400 shadow-[0_0_25px_rgba(255,215,0,0.5)]">
                  <img
                    src={researcher.imageUrl}
                    alt={researcher.name}
                    className="w-full h-full rounded-full object-cover border-2 border-slate-950"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -left-1 p-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-[#ffd700] text-slate-950 shadow-md">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Hikmat Name, Academic Title & Research Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold">
                    {researcher.role || 'الباحثة ومعدة الدراسة'}
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-blue-950/70 border border-blue-400/40 text-blue-200 text-xs font-bold">
                    {researcher.degree || 'ماجستير في تكنولوجيا التعليم'}
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-white font-['Tajawal'] tracking-wide">
                  {researcher.name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  {researcher.title}
                </p>

                {config.researchTitle && (
                  <div className="mt-2 text-[11px] sm:text-xs text-amber-200 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-xl px-3 py-2 flex items-start gap-2 text-right">
                    <BookOpen className="w-4 h-4 text-[#ffd700] shrink-0 mt-0.5" />
                    <span><strong>عنوان الرسالة:</strong> {config.researchTitle}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 3. BOTTOM SECTION: المشرفين في الصف السفلي مع المحاذاة والتوسيط الذاتي 🌟 */}
        <div className="my-5 sm:my-6 relative z-10" id="honor-board-bottom-supervisors">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 border-b border-slate-800 pb-2">
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white font-['Tajawal'] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ffd700]" />
              <span>أعضاء لجنة الإشراف العلمي والبحث الأكاديمي الموقرين:</span>
            </h3>
            <span className="text-[11px] text-amber-300 font-semibold px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700">
              لجنة الإشراف ({supervisorsList.length} {supervisorsList.length === 1 ? 'مشرف' : 'مشرفين'})
            </span>
          </div>

          {/* Automatic Balanced & Centered Grid/Flex Layout: محاذاة أوتوماتيكية متوازنة عند إضافة أو حذف أي بطاقة */}
          <div className={getContainerLayoutClass(supervisorsList.length)}>
            {supervisorsList.map((card, idx) => (
              <div
                key={card.id}
                className={`relative rounded-2xl bg-gradient-to-b from-[#121832]/95 via-[#0b1024]/95 to-[#080c1c]/95 border-2 border-slate-700/80 hover:border-[#ffd700] shadow-[0_12px_32px_rgba(0,0,0,0.7)] hover:shadow-[0_0_30px_rgba(255,215,0,0.35)] transition-all duration-300 p-4 sm:p-5 flex flex-col items-center text-center group hover:-translate-y-1 ${getCardWidthClass(
                  supervisorsList.length
                )}`}
              >
                {/* Card Label Tag */}
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/60 text-[#ffd700] font-black text-[10px] sm:text-[11px] font-['Cairo'] shadow-sm">
                  {card.cardLabel || `المشرف ${idx + 1}`}
                </div>

                {/* Supervisor Photo */}
                <div className="relative my-2 sm:my-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 sm:p-1.5 bg-gradient-to-tr from-amber-500 via-[#ffd700] to-yellow-200 shadow-[0_0_20px_rgba(255,215,0,0.45)] group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-full h-full rounded-full object-cover border-2 border-slate-950"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src =
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -left-1 p-1 sm:p-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-[#ffd700] text-slate-950 shadow-md">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </div>

                {/* Role Tag */}
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/50 text-purple-200 text-[10px] sm:text-[11px] font-bold mb-1.5 sm:mb-2 font-['Cairo']">
                  {card.role}
                </span>

                {/* Doctor's Name */}
                <h4 className="text-sm sm:text-base font-black text-white font-['Tajawal'] tracking-tight leading-snug">
                  {card.name}
                </h4>

                {/* Academic Title */}
                <p className="text-[11px] sm:text-xs text-slate-300 mt-1.5 font-medium leading-relaxed font-['Cairo']">
                  {card.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Bottom Action Section */}
        {showContinueButton && onContinue && (
          <div className="pt-4 sm:pt-6 border-t border-[#ffd700]/30 flex items-center justify-center relative z-10">
            <button
              type="button"
              onClick={onContinue}
              id="btn-supervisors-continue"
              className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-[0_0_25px_rgba(37,99,235,0.45)] border-2 border-blue-400/50 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <span>{continueButtonText || 'الانتقال إلى القواعد والإرشادات 📋'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
        {boardContent}
      </div>
    );
  }

  return boardContent;
};
