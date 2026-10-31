import React, { useEffect } from 'react';
import { Sparkles, Trophy, Star, ArrowLeft, BookOpen, Compass, Award, CheckCircle, Home } from 'lucide-react';
import { CpLogo } from './CpLogo';
import { getGroupByUsername, getStudentByUsername } from '../data/studentAccounts';
import { getStudentProgress } from '../utils/gameStorage';
import { CARTOON_AVATARS } from '../data/gameLevelsData';

interface WelcomeScreenProps {
  username: string;
  onStartLearning: () => void;
  onOpenInstructions: () => void;
  onGoToHome?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  username,
  onStartLearning,
  onOpenInstructions,
  onGoToHome,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const studentInfo = getStudentByUsername(username);
  const groupMeta = getGroupByUsername(username);
  const progress = getStudentProgress(username);

  // Avatar
  const avatar = CARTOON_AVATARS.find((a) => a.id === progress.avatarId) || CARTOON_AVATARS[0];

  // Level title calculation
  const getLevelName = (lvl: number) => {
    if (lvl <= 2) return 'مبتدئ (Novice)';
    if (lvl <= 5) return 'ممارس (Practitioner)';
    if (lvl <= 8) return 'متقدم (Advanced)';
    return 'محترف وخبير (Master)';
  };

  // Completion calculation (out of 10 levels)
  const completedCount = Object.keys(progress.completedLevels).length;
  const completionPercentage = Math.round((completedCount / 10) * 100);

  // Circular progress calculations for SVG
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="relative w-full max-w-4xl mx-auto z-10 font-['Cairo',_sans-serif] text-right py-4 animate-fadeIn">
      {/* Glow Sheen */}
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-amber-500/20 blur-xl opacity-70 pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative rounded-3xl bg-[#0b0e1e]/95 backdrop-blur-2xl border-2 border-blue-500/40 p-6 sm:p-10 shadow-[0_0_40px_rgba(37,99,235,0.25)] overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header with Avatar & Greeting */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            {/* Avatar Circle */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/30 border-2 border-[#ffd700] flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_25px_rgba(255,215,0,0.35)] overflow-hidden">
                {progress.customPhotoUrl && progress.customPhotoUrl.trim() ? (
                  <img
                    src={progress.customPhotoUrl.trim()}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{avatar.emoji}</span>
                )}
              </div>
              <span className="absolute -bottom-2 -left-1 px-2 py-0.5 rounded-full bg-[#ffd700] text-slate-950 font-black text-[10px] shadow">
                {avatar.title}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>تم التحقق من بياناتك</span>
                </span>
                {groupMeta && (
                  <span className="px-3.5 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-900 text-xs font-black font-['Cairo'] shadow-sm">
                    المجموعة {groupMeta.code}: {groupMeta.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-['Tajawal'] tracking-tight">
                مرحباً بك <span className="text-[#ffd700] font-['Cairo'] font-bold">{username}</span>
              </h1>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#070914] border border-blue-500/30 shadow-inner">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-800"
                  fill="transparent"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="url(#blueGoldGradient)"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="blueGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ffd700" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white font-['Outfit']">
                  {completionPercentage}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold">الإنجاز الكلي</span>
              </div>
            </div>
          </div>
        </div>

        {/* The 3 Storyboard Cards: Level, Points, Completion */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          {/* Card 1: Level */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121730] to-[#0a0d1c] border-2 border-purple-500/40 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-xs font-bold">المستوى الحالي</span>
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-white font-['Tajawal']">
                {getLevelName(progress.currentLevel)}
              </div>
              <div className="text-xs text-purple-300/80 mt-1 font-mono">
                المرحلة: L{progress.currentLevel} من 10
              </div>
            </div>
          </div>

          {/* Card 2: Points */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1b172a] to-[#0d0b1a] border-2 border-[#ffd700]/50 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#ffd700] mb-2">
              <span className="text-xs font-bold">رصيد النقاط</span>
              <Star className="w-5 h-5 fill-[#ffd700] text-[#ffd700]" />
            </div>
            <div>
              <div className="text-3xl font-black text-[#ffd700] font-['Outfit'] flex items-center gap-1.5">
                <span>{progress.totalScore}</span>
                <span className="text-base text-amber-200">⭐ XP</span>
              </div>
              <div className="text-xs text-amber-300/80 mt-1">
                {(progress.badges || []).length} أوسمة إنجاز مكتسبة
              </div>
            </div>
          </div>

          {/* Card 3: Completion */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1d2c] to-[#07111c] border-2 border-emerald-500/40 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-bold">نسبة الإنجاز</span>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-300 font-['Outfit']">
                {completionPercentage}%
              </div>
              <div className="text-xs text-emerald-200/80 mt-1">
                {completedCount} من 10 مراحل مكتملة
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: قواعد اللعبة والأهداف + الصفحة الخاصة للطالب */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            id="btn-welcome-instructions"
            onClick={onOpenInstructions}
            className="w-full sm:w-auto min-w-[240px] px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base sm:text-lg shadow-[0_0_30px_rgba(37,99,235,0.45)] border-2 border-blue-400/50 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
          >
            <BookOpen className="w-5 h-5 text-[#ffd700]" />
            <span>قواعد اللعبة والأهداف</span>
            <ArrowLeft className="w-5 h-5" />
          </button>

          {onGoToHome && (
            <button
              type="button"
              id="btn-welcome-to-student-home"
              onClick={onGoToHome}
              className="w-full sm:w-auto min-w-[240px] px-6 py-4 rounded-2xl bg-[#0e1329] hover:bg-[#161d3d] text-amber-200 hover:text-[#ffd700] font-bold text-sm sm:text-base border-2 border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-lg shadow-black/40"
            >
              <Home className="w-5 h-5 text-[#ffd700]" />
              <span>العودة للرئيسية 🏠</span>
            </button>
          )}
        </div>
        <p className="text-xs text-slate-300 text-center font-medium max-w-md mx-auto pt-2">
          نتمنى لك رحلة تعليمية ممتعة وموفقة في بيئة التعلم القائمة على الألعاب
        </p>
      </div>
    </div>
  );
};
