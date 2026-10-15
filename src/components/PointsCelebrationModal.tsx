import React, { useState, useEffect } from 'react';
import { Star, Trophy, Sparkles, Users, ArrowLeft, Award, CheckCircle } from 'lucide-react';

interface PointsCelebrationModalProps {
  pointsGained: number;
  totalScore: number;
  isCollaborative: boolean;
  message?: string;
  onContinue: () => void;
}

export const PointsCelebrationModal: React.FC<PointsCelebrationModalProps> = ({
  pointsGained,
  totalScore,
  isCollaborative,
  message = 'لقد أنهيت المهمة بنجاح وأتقنت مهاراتها.',
  onContinue,
}) => {
  const [animatedPoints, setAnimatedPoints] = useState(0);

  // Progressive count-up animation
  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.ceil(pointsGained / 25));
    const interval = setInterval(() => {
      current += step;
      if (current >= pointsGained) {
        setAnimatedPoints(pointsGained);
        clearInterval(interval);
      } else {
        setAnimatedPoints(current);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [pointsGained]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-['Cairo',_sans-serif]">
      <div className="w-full max-w-md rounded-3xl bg-[#0e0c1e] border-2 border-[#ffd700] p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(212,175,55,0.4)] relative overflow-hidden">
        {/* Confetti Glow Background */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-32 bg-gradient-to-b from-[#ffd700]/25 via-purple-600/15 to-transparent blur-2xl pointer-events-none" />

        {/* Celebration Star Icon */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-[#ffd700] to-yellow-300 text-slate-950 flex items-center justify-center mx-auto text-4xl shadow-[0_0_30px_rgba(255,215,0,0.5)] animate-bounce">
            ⭐
          </div>
        </div>

        {/* Animated Badge */}
        <span className="px-3.5 py-1 rounded-full bg-amber-950/80 border border-[#ffd700] text-[#ffd700] text-xs font-black inline-flex items-center gap-1.5 shadow mb-2">
          {isCollaborative ? (
            <>
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>نقاط إضافية لصالح الفريق</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>إنجاز تفوق فردي</span>
            </>
          )}
        </span>

        {/* Points Counter */}
        <div className="my-3">
          <div className="text-4xl sm:text-5xl font-black text-[#ffd700] font-['Outfit'] tracking-tight">
            +{animatedPoints} <span className="text-2xl text-amber-200">⭐</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
            {message}
          </p>
        </div>

        {/* Total Score Box */}
        <div className="my-5 p-4 rounded-2xl bg-[#070914] border border-[#ffd700]/40 flex items-center justify-around text-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">
              {isCollaborative ? 'رصيدك المساهم في الفريق' : 'إجمالي رصيد نقاطك الجديد'}
            </span>
            <span className="text-2xl font-black text-white font-['Outfit']">
              {totalScore} <span className="text-xs text-[#ffd700]">XP</span>
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">حالة الإتقان</span>
            <span className="text-xs font-black text-emerald-400 font-['Tajawal'] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              مكتمل ومسجل
            </span>
          </div>
        </div>

        {/* Action Button: المرحلة التالية */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-[0_0_25px_rgba(37,99,235,0.45)] border-2 border-blue-400/50 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
        >
          <span>المرحلة التالية</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
