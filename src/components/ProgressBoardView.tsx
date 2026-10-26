import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
  ArrowLeft,
  Users,
  Trophy,
  Play,
  Award,
} from 'lucide-react';
import { GAME_LEVELS_DATA } from '../data/gameLevelsData';
import { getStudentProgress } from '../utils/gameStorage';
import { getGroupByUsername } from '../data/studentAccounts';

interface ProgressBoardViewProps {
  username: string;
  onSelectStage: (levelNum: number) => void;
}

export const ProgressBoardView: React.FC<ProgressBoardViewProps> = ({ username, onSelectStage }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const progress = getStudentProgress(username);
  const groupMeta = getGroupByUsername(username);
  const isCollaborative = groupMeta?.learningMode === 'تعاوني';

  const completedCount = Object.keys(progress.completedLevels).length;
  const overallPercentage = Math.round((completedCount / 10) * 100);

  const teamName = groupMeta?.code === 'G3' ? 'فريق المبدعين' : 'فريق الرواد';

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif] animate-fadeIn" id="progress-board-view">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950/40 via-[#120f26] to-[#080614] border-2 border-blue-500/40 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-blue-950 border border-blue-500/60 text-blue-300 text-xs font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              لوحة التقدم العام (Progress Board)
            </span>
            {isCollaborative && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/50 text-purple-300 text-xs font-bold flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{teamName}</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white font-['Tajawal']">
            لوحة متابعة إنجاز المراحل المنهجية العشر
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            استعرض حالة تقدمك خطوة بخطوة في بيئة الألعاب التعليمية الإلكترونية لتنمية مهارات إنتاج وتصميم الوسائط المتعددة واستكشاف المهارات التفاعلية.
          </p>
        </div>

        {/* Overall Completion Dial */}
        <div className="p-4 rounded-2xl bg-[#070914] border border-blue-500/40 text-center shrink-0 w-full md:w-auto">
          <span className="text-xs text-slate-400 block font-bold mb-0.5">
            {isCollaborative ? `إنجاز ${teamName}` : 'نسبة إنجازك الكلية'}
          </span>
          <span className="text-3xl font-black text-[#ffd700] font-['Outfit']">
            {overallPercentage}%
          </span>
          <div className="w-32 h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mx-auto mt-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-[#ffd700] rounded-full transition-all duration-700"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400  block mt-1">
            {completedCount} من 10 مراحل مكتملة
          </span>
        </div>
      </div>

      {/* The 10 Cards Grid (One Per Stage) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {GAME_LEVELS_DATA.map((lvl) => {
          const isCompleted = !!progress.completedLevels[lvl.levelNumber];
          const isCurrent = lvl.levelNumber === progress.currentLevel && !isCompleted;
          const isLocked = lvl.levelNumber > progress.currentLevel;

          const levelResult = progress.completedLevels[lvl.levelNumber];
          const levelScore = levelResult ? levelResult.score : 0;
          const maxScore = levelResult ? levelResult.maxScore : 100;
          const levelPercent = isCompleted ? 100 : isCurrent ? 50 : 0;

          return (
            <div
              key={lvl.levelNumber}
              className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all duration-300 ${
                isCompleted
                  ? 'bg-gradient-to-b from-emerald-950/30 to-[#09151c] border-emerald-500/70 shadow-sm'
                  : isCurrent
                  ? 'bg-gradient-to-b from-amber-950/50 to-[#151126] border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.3)] ring-1 ring-[#ffd700] scale-[1.02]'
                  : 'bg-[#080a16] border-slate-800/80 opacity-50'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`w-8 h-8 rounded-xl  text-xs font-black flex items-center justify-center border ${
                      isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : isCurrent
                        ? 'bg-[#ffd700] text-slate-950 border-amber-300'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    L{lvl.levelNumber}
                  </span>

                  <span className="text-xl">
                    {isCompleted ? '✔️' : isCurrent ? '⚙️' : '🔒'}
                  </span>
                </div>

                <h3 className="text-sm font-black text-white font-['Tajawal'] mb-1 line-clamp-1">
                  المرحلة {lvl.levelNumber}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {lvl.shortTitle}
                </p>

                {/* Status description */}
                <div className="text-[11px] font-bold mb-2">
                  {isCompleted ? (
                    <span className="text-emerald-400  flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ✔️ مكتملة بنجاح (+{levelScore} XP)
                    </span>
                  ) : isCurrent ? (
                    <span className="text-[#ffd700]  flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      ⚙️ جارية الآن ({levelPercent}%)
                    </span>
                  ) : (
                    <span className="text-slate-500  flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      🔒 مقفلة (تتطلب إتمام السابق)
                    </span>
                  )}
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCompleted ? 'bg-emerald-500 w-full' : isCurrent ? 'bg-amber-400 w-1/2' : 'w-0'
                    }`}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-slate-800/80">
                {isLocked ? (
                  <div className="py-2 text-center text-[10px] text-slate-500 font-bold bg-slate-950/60 rounded-xl border border-slate-800">
                    مغلق بالتوالي 🔒
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectStage(lvl.levelNumber)}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-slate-950 font-black shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{isCurrent ? 'متابعة المرحلة' : 'مراجعة المرحلة'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
