import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  KeyRound,
  Award,
  ArrowLeft,
  Gamepad2,
  Trophy,
  Target,
  Crown,
  Puzzle,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { CpLogo } from './CpLogo';
import { getSplashImageUrl } from '../utils/splashStorage';
import { getSiteTitleConfig, SiteTitleConfig } from '../utils/siteTitleStorage';

interface SplashScreenProps {
  onEnter: () => void;
  onOpenAdminLogin: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, onOpenAdminLogin }) => {
  const [splashImg, setSplashImg] = useState<string>(getSplashImageUrl());
  const [titleConfig, setTitleConfig] = useState<SiteTitleConfig>(getSiteTitleConfig());

  useEffect(() => {
    const handleImgUpdate = () => {
      setSplashImg(getSplashImageUrl());
    };
    const handleTitleUpdate = (e: any) => {
      if (e.detail) {
        setTitleConfig(e.detail);
      } else {
        setTitleConfig(getSiteTitleConfig());
      }
    };

    window.addEventListener('cp_splash_image_updated', handleImgUpdate);
    window.addEventListener('cp_site_title_updated', handleTitleUpdate);

    return () => {
      window.removeEventListener('cp_splash_image_updated', handleImgUpdate);
      window.removeEventListener('cp_site_title_updated', handleTitleUpdate);
    };
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto z-10 flex flex-col items-center justify-center py-6 px-4 text-center font-['Cairo',_sans-serif]">
      {/* Soft Ambient Sky Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-sky-300/30 via-cyan-300/30 to-blue-300/20 rounded-[40px] blur-2xl opacity-75 pointer-events-none" />

      {/* Main Glass Container in White & Sky Blue */}
      <div className="relative w-full rounded-3xl bg-white/95 backdrop-blur-2xl border-2 border-sky-300 shadow-[0_15px_45px_rgba(2,132,199,0.18)] p-6 sm:p-10 flex flex-col items-center overflow-hidden">
        
        {/* ========================================================
            🎮 INTERACTIVE GAMING ENVIRONMENT BACKGROUND WATERMARKS
            ======================================================== */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
          {/* Top-Right: Game Controller Watermark */}
          <div className="absolute -top-6 -right-6 text-sky-400/20 transform rotate-12 transition-transform hover:rotate-6">
            <Gamepad2 className="w-48 h-48 stroke-[1.2]" />
          </div>

          {/* Top-Left: Trophy Watermark */}
          <div className="absolute -top-6 -left-6 text-cyan-400/20 transform -rotate-12">
            <Trophy className="w-44 h-44 stroke-[1.2]" />
          </div>

          {/* Mid-Right: Target & Bullseye Watermark */}
          <div className="absolute top-1/3 -right-8 text-sky-300/20 transform rotate-45">
            <Target className="w-36 h-36 stroke-[1.2]" />
          </div>

          {/* Bottom-Right: Puzzle Piece Watermark */}
          <div className="absolute bottom-10 -right-6 text-cyan-400/20 transform rotate-12">
            <Puzzle className="w-40 h-40 stroke-[1.2]" />
          </div>

          {/* Bottom-Left: Crown of Honor Watermark */}
          <div className="absolute bottom-10 -left-6 text-sky-400/20 transform -rotate-12">
            <Crown className="w-40 h-40 stroke-[1.2]" />
          </div>

          {/* Scattered Interactive Gaming Micro Particles (Stars, Energy, Sparkles) */}
          <div className="absolute top-1/4 left-1/5 text-amber-400/40 animate-pulse">
            <Star className="w-8 h-8 fill-amber-300/30" />
          </div>
          <div className="absolute top-1/5 right-1/4 text-sky-500/30 animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="absolute bottom-1/4 right-1/5 text-amber-500/30 animate-bounce">
            <Zap className="w-8 h-8 fill-amber-300/25" />
          </div>
          <div className="absolute bottom-1/3 left-1/4 text-cyan-500/35 animate-pulse">
            <Award className="w-8 h-8" />
          </div>

          {/* Subtle Ambient Glow Spheres */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-sky-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-cyan-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Floating Interactive Gaming Corner Badges inside the card */}
        <div className="relative z-10 w-full flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-100/90 border border-sky-300 text-sky-950 text-[11px] font-black shadow-sm">
            <Gamepad2 className="w-3.5 h-3.5 text-sky-700 animate-pulse" />
            <span>بيئة ألعاب تفاعلية</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-100/90 border border-cyan-300 text-cyan-950 text-[11px] font-black shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>نقاط ومستويات XP</span>
          </div>
        </div>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5 z-10">
          {titleConfig.topBadge1 && (
            <span className="px-3.5 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-950 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <GraduationCap className="w-4 h-4 text-sky-700" />
              <span>{titleConfig.topBadge1}</span>
            </span>
          )}
          {titleConfig.topBadge2 && (
            <span className="px-3 py-1 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-950 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 text-cyan-700" />
              <span>{titleConfig.topBadge2}</span>
            </span>
          )}
        </div>

        {/* 1. Large Environment Logo */}
        <div className="relative mb-3 group cursor-pointer z-10" onClick={onEnter}>
          <div className="absolute -inset-3 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400 rounded-3xl blur-md opacity-50 group-hover:opacity-85 transition-all duration-500" />
          <div className="relative p-3 rounded-2xl bg-sky-50 border-2 border-sky-300 shadow-md">
            <CpLogo size="lg" showText={false} />
          </div>
        </div>

        {/* 🎮 Interactive Gaming Highlight Banner 🎮 */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-100 via-cyan-50 to-sky-100 border-2 border-sky-300 text-sky-950 text-xs sm:text-sm font-black mb-3 shadow-sm">
          <Gamepad2 className="w-4 h-4 text-sky-600 animate-bounce" />
          <span>بيئة التعلم القائمة على الألعاب الرقمية التفاعلية</span>
          <Target className="w-4 h-4 text-rose-500" />
        </div>

        {/* 2. Main Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-sky-950 font-['Tajawal'] tracking-tight mb-3 text-center max-w-4xl leading-relaxed relative z-10">
          {titleConfig.mainTitle}
        </h1>

        {/* 3. Subtitle / Goal Text */}
        {titleConfig.subtitle && (
          <p className="text-sm sm:text-base text-sky-900 max-w-2xl leading-relaxed mb-6 font-bold text-center">
            {titleConfig.subtitle}
          </p>
        )}

        {/* 4. Student Illustration */}
        <div className="relative w-full max-w-xs sm:max-w-sm rounded-2xl overflow-hidden border-2 border-sky-300 shadow-lg mb-8 bg-sky-50 group">
          <img
            src={splashImg}
            alt={titleConfig.mainTitle}
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sky-900/40 via-transparent to-transparent opacity-60 pointer-events-none" />
          <div className="absolute bottom-2 inset-x-2 text-center">
            <span className="text-[11px] font-bold text-sky-950 bg-white/95 px-3 py-1 rounded-full border border-sky-300 inline-block shadow">
              🎮 بيئة تعليمية تفاعلية قائمة على الألعاب
            </span>
          </div>
        </div>

        {/* 5. Main Enter Button */}
        <button
          type="button"
          id="btn-splash-enter"
          onClick={onEnter}
          className="w-full max-w-md py-4 px-8 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-700 hover:from-sky-500 hover:to-cyan-500 text-white font-black text-lg sm:text-xl shadow-[0_4px_25px_rgba(2,132,199,0.35)] border-2 border-sky-300 hover:border-sky-200 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 group"
        >
          <span>دخول</span>
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Admin Link */}
        <div className="mt-6 flex items-center justify-center w-full max-w-md text-xs border-t border-sky-100 pt-4">
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="text-sky-800 hover:text-sky-950 transition-colors flex items-center gap-1.5 cursor-pointer font-bold px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100"
          >
            <KeyRound className="w-3.5 h-3.5 text-sky-700" />
            <span>مدير الموقع</span>
          </button>
        </div>
      </div>
    </div>
  );
};
