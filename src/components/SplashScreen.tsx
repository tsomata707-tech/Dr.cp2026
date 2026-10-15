import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Shield, GraduationCap, KeyRound, Monitor, Award, ArrowLeft } from 'lucide-react';
import { CpLogo } from './CpLogo';
import { getSplashImageUrl } from '../utils/splashStorage';

interface SplashScreenProps {
  onEnter: () => void;
  onOpenAdminLogin: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, onOpenAdminLogin }) => {
  const [splashImg, setSplashImg] = useState<string>(getSplashImageUrl());

  useEffect(() => {
    const handleUpdate = () => {
      setSplashImg(getSplashImageUrl());
    };
    window.addEventListener('cp_splash_image_updated', handleUpdate);
    return () => window.removeEventListener('cp_splash_image_updated', handleUpdate);
  }, []);
  return (
    <div className="relative w-full max-w-4xl mx-auto z-10 flex flex-col items-center justify-center py-6 px-4 text-center font-['Cairo',_sans-serif]">
      {/* Soft Ambient Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-amber-500/15 rounded-[40px] blur-2xl opacity-60 pointer-events-none" />

      {/* Main Glass Container */}
      <div className="relative w-full rounded-3xl bg-[#0b0f1e]/90 backdrop-blur-2xl border-2 border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.25)] p-6 sm:p-10 flex flex-col items-center overflow-hidden">
        {/* Subtle decorative background circuit */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 z-10">
          <span className="px-3.5 py-1 rounded-full bg-blue-950/70 border border-blue-400/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            رسالة ماجستير في تكنولوجيا التعليم
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-950/60 border border-[#ffd700]/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Award className="w-3.5 h-3.5 text-[#ffd700]" />
            Adobe Captivate 2019
          </span>
        </div>

        {/* 1. Large Environment Logo (Camera + Captivate Gear) */}
        <div className="relative mb-4 group cursor-pointer" onClick={onEnter}>
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-400 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition-all duration-500" />
          <div className="relative p-3 rounded-2xl bg-[#0e1428] border-2 border-[#ffd700]/80 shadow-[0_0_30px_rgba(255,215,0,0.3)]">
            <CpLogo size="lg" showText={false} />
          </div>
        </div>

        {/* 2. Main Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Tajawal'] tracking-tight mb-3 text-center max-w-4xl leading-relaxed">
          تصميم بيئة ألعاب تعليمية إلكترونية قائمة على التفاعل بين نمط التغذية الراجعة (فورية / مرجئة) ونمط التعلم (تعاوني / تنافسي) وأثره على تنمية مهارات إنتاج وتصميم الوسائط المتعددة والتقبل التكنولوجي لدى طلاب تكنولوجيا التعليم
        </h1>

        {/* 3. Subtitle / Goal Text */}
        <p className="text-sm sm:text-base text-blue-200/90 max-w-2xl leading-relaxed mb-6 font-medium text-center">
          جامعة طنطا - كلية التربية النوعية - قسم تكنولوجيا التعليم • بيئة تفاعلية لاكتساب مهارات Adobe Captivate 2019
        </p>

        {/* 4. Student Illustration with Tablet */}
        <div className="relative w-full max-w-xs sm:max-w-sm rounded-2xl overflow-hidden border-2 border-blue-400/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)] mb-8 bg-[#090d1a] group">
          <img
            src={splashImg}
            alt="تصميم بيئة ألعاب تعليمية إلكترونية قائمة على التفاعل بين نمط التغذية الراجعة ونمط التعلم"
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f1e] via-transparent to-transparent opacity-70 pointer-events-none" />
          <div className="absolute bottom-2 inset-x-2 text-center">
            <span className="text-[11px] font-bold text-amber-200 bg-slate-950/80 px-3 py-1 rounded-full border border-amber-500/40 inline-block shadow">
              🚀 بيئة تعليمية تفاعلية قائمة على الألعاب
            </span>
          </div>
        </div>

        {/* 5. Main Enter Button (Full-width / Prominent Blue) */}
        <button
          type="button"
          id="btn-splash-enter"
          onClick={onEnter}
          className="w-full max-w-md py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg sm:text-xl shadow-[0_0_30px_rgba(37,99,235,0.5)] border-2 border-blue-400/50 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 group"
        >
          <span>دخول</span>
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Admin and Support Quick Link */}
        <div className="mt-6 flex items-center justify-between w-full max-w-md text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>دخول الإدارة والمشرفين</span>
          </button>
          <span className="text-[11px] text-slate-400 font-bold">جامعة طنطا - كلية التربية النوعية</span>
        </div>
      </div>
    </div>
  );
};
