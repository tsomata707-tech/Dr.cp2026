import React from 'react';
import {
  Gamepad2,
  Trophy,
  Crown,
  Target,
  Sparkles,
  Puzzle,
  Award,
  Zap,
  GraduationCap,
  Star,
  Flame,
  CheckCircle2,
  Coins,
} from 'lucide-react';

export const EducationalGamingIconsBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0"
      id="edu-gaming-icons-backdrop"
      aria-hidden="true"
    >
      {/* Soft Ambient Light Cones behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-sky-200/50 via-cyan-100/40 to-blue-200/50 rounded-full blur-3xl -z-10" />

      {/* 1. TOP RIGHT: Large Glowing Game Controller with Badge */}
      <div className="hidden lg:flex absolute top-6 -right-16 xl:right-4 items-center gap-2.5 p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-sky-300 shadow-[0_10px_30px_rgba(2,132,199,0.2)] animate-bounce duration-1000">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
          <Gamepad2 className="w-7 h-7 stroke-[2.2]" />
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-sky-950 font-['Tajawal'] block">
            🎮 ألعاب تعليمية تفاعلية
          </span>
          <span className="text-[10px] text-sky-700 font-bold font-['Cairo']">
            موديولات ومهمات استكشافية
          </span>
        </div>
      </div>

      {/* 2. TOP LEFT: Trophy & Score Podium */}
      <div className="hidden lg:flex absolute top-10 -left-16 xl:left-4 items-center gap-2.5 p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-sky-300 shadow-[0_10px_30px_rgba(2,132,199,0.2)] animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-md">
          <Trophy className="w-7 h-7 stroke-[2.2]" />
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-sky-950 font-['Tajawal'] block">
            🏆 لوحة الشرف والصدارة
          </span>
          <span className="text-[10px] text-sky-700 font-bold font-['Cairo']">
            تنافس شريف ونقاط XP حقيقية
          </span>
        </div>
      </div>


      {/* 4. MIDDLE LEFT: Target Challenge & Interactive Simulation */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-12 xl:left-10 items-center gap-2.5 p-3 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-sky-300 shadow-[0_10px_25px_rgba(2,132,199,0.18)]">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-md">
          <Target className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-sky-950 font-['Tajawal'] block">
            🎯 مهام وتحديات تدريبية
          </span>
          <span className="text-[10px] text-sky-700 font-bold font-['Cairo']">
            تغذية راجعة فورية
          </span>
        </div>
      </div>

      {/* 5. BOTTOM RIGHT: Crown & Badges */}
      <div className="hidden lg:flex absolute bottom-8 -right-10 xl:right-8 items-center gap-2.5 p-3 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-sky-300 shadow-[0_10px_25px_rgba(2,132,199,0.18)]">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-white shadow-md">
          <Crown className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-sky-950 font-['Tajawal'] block">
            👑 أوسمة وشارات إنجاز
          </span>
          <span className="text-[10px] text-sky-700 font-bold font-['Cairo']">
            تتويج الأبطال الأكاديميين
          </span>
        </div>
      </div>

      {/* 6. BOTTOM LEFT: Puzzle Thinking & Creative Tasks */}
      <div className="hidden lg:flex absolute bottom-8 -left-10 xl:left-8 items-center gap-2.5 p-3 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-sky-300 shadow-[0_10px_25px_rgba(2,132,199,0.18)]">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
          <Puzzle className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-sky-950 font-['Tajawal'] block">
            🧩 ألغاز محاكاة كابتيفيت
          </span>
          <span className="text-[10px] text-sky-700 font-bold font-['Cairo']">
            Adobe Captivate 2019
          </span>
        </div>
      </div>

      {/* Floating Floating Micro Icons (Subtle educational gaming particles around card) */}
      <div className="absolute top-16 left-1/4 -translate-x-12 p-2 rounded-xl bg-sky-100/80 border border-sky-300 text-sky-600 shadow-sm animate-pulse">
        <Sparkles className="w-5 h-5 text-sky-600" />
      </div>

      <div className="absolute top-28 right-1/4 translate-x-12 p-2 rounded-xl bg-sky-100/80 border border-sky-300 text-sky-600 shadow-sm">
        <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
      </div>

      <div className="absolute bottom-24 left-1/3 p-2 rounded-xl bg-sky-100/80 border border-sky-300 text-sky-600 shadow-sm">
        <Award className="w-5 h-5 text-sky-700" />
      </div>

      <div className="absolute bottom-20 right-1/3 p-2 rounded-xl bg-sky-100/80 border border-sky-300 text-sky-600 shadow-sm animate-pulse">
        <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
      </div>
    </div>
  );
};
