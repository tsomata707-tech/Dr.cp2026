import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Rocket, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface LevelTransitionLoader5sProps {
  currentLevel: number;
  nextLevel: number;
  isFinalLevel: boolean;
  onComplete: () => void;
}

export const LevelTransitionLoader5s: React.FC<LevelTransitionLoader5sProps> = ({
  currentLevel,
  nextLevel,
  isFinalLevel,
  onComplete,
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(5);

  useEffect(() => {
    const totalDurationMs = 5000;
    const intervalMs = 50;
    const stepPercent = (intervalMs / totalDurationMs) * 100;

    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, (elapsed / totalDurationMs) * 100);
      setProgressPercent(currentPct);

      const remainingSec = Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000));
      setSecondsLeft(remainingSec);

      if (elapsed >= totalDurationMs) {
        clearInterval(timer);
        onComplete();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onComplete]);

  const targetHeading = isFinalLevel
    ? 'جاري الانتقال الي الاختبار البعدي'
    : `جاري الانتقال الي ليفل ${nextLevel}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in font-['Cairo',_sans-serif]">
      <div className="relative max-w-lg w-full bg-[#0a0d1e] border-2 border-amber-400 rounded-3xl p-6 sm:p-10 text-center shadow-[0_0_70px_rgba(251,191,36,0.45)] space-y-6 overflow-hidden">
        {/* Glow Auras */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Mascot / Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-[#ffd700] to-yellow-400 flex items-center justify-center text-slate-950 shadow-[0_0_40px_rgba(255,215,0,0.6)] animate-pulse">
            {isFinalLevel ? (
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.3]" />
            ) : (
              <Rocket className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.3]" />
            )}
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-slate-950 border border-amber-400 text-amber-300  text-xs font-black shadow">
            {secondsLeft}s
          </span>
        </div>

        {/* Required Heading: "مكتوب أعلاه جاري الانتقال الي ليفل ٢" */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black font-['Tajawal'] inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>تم تسليم نشاط المستوى {currentLevel} بنجاح</span>
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Tajawal'] tracking-tight">
            {targetHeading}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            انتظر 5 ثوانٍ للتحميل وتجهيز المحتوى والأنشطة التالية...
          </p>
        </div>

        {/* 5-Second Loading Bar */}
        <div className="space-y-2 pt-2">
          <div className="h-5 w-full bg-slate-950 rounded-full overflow-hidden p-1 border-2 border-amber-400/70 shadow-inner relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.8)] transition-all ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs  font-bold text-slate-400 px-1">
            <span className="text-amber-300">{Math.round(progressPercent)}%</span>
            <span>باقي: {secondsLeft} ثوانٍ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
