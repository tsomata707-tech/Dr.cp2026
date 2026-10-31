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

      {/* Main Large Card with Gray Border */}
      <div className="relative rounded-3xl bg-[#f4f7fb]/95 backdrop-blur-2xl border-2 border-slate-300 shadow-[0_15px_45px_rgba(15,23,42,0.12)] p-4 sm:p-7 lg:p-9 max-h-[92vh] overflow-y-auto">
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
        <div className="flex flex-col items-center text-center pb-4 sm:pb-6 border-b border-slate-300 relative z-10">
          {/* Logo with Golden Laurel Crown */}
          <div className="relative mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 rounded-2xl bg-white border-2 border-slate-300 shadow-md">
              <CpLogo size="md" showText={false} />
            </div>
            <div className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 via-[#ffd700] to-yellow-200 text-slate-950 flex items-center justify-center text-xs sm:text-base shadow-[0_0_15px_rgba(255,215,0,0.6)] animate-bounce">
              👑
            </div>
          </div>

          {/* Academic Affiliation Badges: Black Background + Golden Text */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="badge-gold-on-black px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>{config.university}</span>
            </span>
            <span className="badge-gold-on-black px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>رسالة ماجستير في تكنولوجيا التعليم</span>
            </span>
          </div>

          {/* 🌟 DISTINCTIVE BOARD TITLE 🌟 */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0f2942] font-['Tajawal'] tracking-tight mb-2 max-w-3xl leading-snug">
            {config.boardTitle}
          </h1>

          {/* Subtitle / Department Dedication */}
          {config.boardSubtitle ? (
            <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed font-bold px-2">
              {config.boardSubtitle}
            </p>
          ) : null}
        </div>

        {/* 🌟 2. TOP SECTION: اسم وصورة حكمت في الأعلى 🌟 */}
        <div className="my-5 sm:my-6 relative z-10" id="honor-board-top-researcher">
          <div className="relative rounded-3xl bg-white border-2 border-slate-300 shadow-md p-4 sm:p-6 transition-all honor-board-card-gray-border">
            {/* Ambient gold & black badge */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 px-3 py-1 rounded-full badge-gold-on-black text-[11px] sm:text-xs font-black shadow-sm">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>الباحثة ومصممة البيئة</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-right">
              {/* Hikmat Photo in Golden Frame */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-[#ffd700] to-yellow-300 shadow-md">
                  {researcher.imageUrl && researcher.imageUrl.trim() ? (
                    <img
                      src={researcher.imageUrl.trim()}
                      alt={researcher.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      👤
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -left-1 p-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-[#ffd700] text-slate-950 shadow-md">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Hikmat Name, Academic Title & Research Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="badge-gold-on-black px-3 py-0.5 rounded-full text-xs font-bold shadow-xs">
                    {researcher.role || 'الباحثة ومعدة الدراسة'}
                  </span>
                  <span className="badge-gold-on-black px-3 py-0.5 rounded-full text-xs font-bold shadow-xs">
                    {researcher.degree || 'ماجستير في تكنولوجيا التعليم'}
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-[#0f2942] font-['Tajawal'] tracking-wide">
                  {researcher.name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-700 font-bold">
                  {researcher.title}
                </p>

                {/* 🌟 DISTINCTIVE THESIS TITLE BANNER (عنوان الرسالة) 🌟 */}
                {config.researchTitle && (
                  <div className="mt-3 text-xs sm:text-sm bg-slate-100/90 border-2 border-slate-300 rounded-xl p-3 sm:p-4 flex items-start gap-2.5 text-right shadow-xs" id="honor-board-research-title">
                    <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center shrink-0 mt-0.5 border border-amber-500 shadow-xs">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1 leading-relaxed">
                      <span className="inline-block px-2.5 py-0.5 rounded-md badge-gold-on-black font-black text-[11px] ml-2 shadow-xs">
                        عنوان الرسالة:
                      </span>
                      <span
                        className="font-black text-black font-['Tajawal'] text-xs sm:text-sm leading-relaxed tracking-wide thesis-title-black-text"
                        style={{ color: '#000000', WebkitTextFillColor: '#000000' }}
                      >
                        {config.researchTitle}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="my-5 sm:my-6 relative z-10" id="honor-board-bottom-supervisors">
          {/* Title centered in a styled frame with only the word 'إشراف' */}
          <div className="flex items-center justify-center mb-4 sm:mb-6 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative inline-flex items-center justify-center px-8 py-2 rounded-2xl bg-white border-2 border-slate-300 text-[#0f2942] shadow-sm">
              <h3 className="text-base sm:text-lg font-black font-['Tajawal'] tracking-wide text-[#0f2942]">
                إشراف
              </h3>
            </div>
          </div>

          {/* Automatic Balanced & Centered Grid/Flex Layout: محاذاة أوتوماتيكية متوازنة عند إضافة أو حذف أي بطاقة */}
          <div className={getContainerLayoutClass(supervisorsList.length)}>
            {supervisorsList.map((card) => (
              <div
                key={card.id}
                className={`relative rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-400 shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-5 flex flex-col items-center text-center group hover:-translate-y-1 honor-board-card-gray-border ${getCardWidthClass(
                  supervisorsList.length
                )}`}
              >
                {/* Supervisor Photo */}
                <div className="relative my-2 sm:my-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 sm:p-1.5 bg-gradient-to-tr from-amber-500 via-[#ffd700] to-yellow-200 shadow-md group-hover:scale-105 transition-transform duration-300">
                    {card.imageUrl && card.imageUrl.trim() ? (
                      <img
                        src={card.imageUrl.trim()}
                        alt={card.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src =
                            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -left-1 p-1 sm:p-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-[#ffd700] text-slate-950 shadow-md">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </div>

                {/* Role Tag */}
                <span className="badge-gold-on-black px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold mb-2 font-['Cairo'] shadow-xs">
                  {card.role}
                </span>

                {/* Doctor's Name */}
                <h4 className="text-sm sm:text-base font-black text-[#0f2942] font-['Tajawal'] tracking-tight leading-snug">
                  {card.name}
                </h4>

                {/* Academic Title */}
                <p className="text-[11px] sm:text-xs text-slate-700 mt-1.5 font-bold leading-relaxed font-['Cairo']">
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
