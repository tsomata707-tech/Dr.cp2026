import React, { useState, useEffect } from 'react';
import {
  Compass,
  Lock,
  Sparkles,
  CheckCircle2,
  Play,
  ArrowLeft,
  BookOpen,
  Trophy,
  Video,
  Layers,
  HelpCircle,
  FileText,
  Sliders,
  Share2,
  Cpu,
  Monitor,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import { GameLevelDef, GAME_LEVELS_DATA } from '../data/gameLevelsData';
import { getStudentProgress } from '../utils/gameStorage';
import { useEducationalVideos } from '../utils/videoStorage';
import { MultiPartVideoPlayer } from './MultiPartVideoPlayer';
import { GameLevelUnlockLoader } from './GameLevelUnlockLoader';
import { Gamepad2 } from 'lucide-react';

const StageIntroVideoPlayer: React.FC<{ levelNumber: number }> = ({ levelNumber }) => {
  const videos = useEducationalVideos(`level-${levelNumber}`);

  return (
    <div className="mb-5 rounded-2xl overflow-hidden border border-blue-500/30 bg-[#080a18] p-3 shadow-lg">
      <MultiPartVideoPlayer
        videos={videos}
        title={`فيديوهات شرح المستوى ${levelNumber}`}
      />
    </div>
  );
};

interface LearningMapScreenProps {
  username: string;
  onSelectStageForContent: (levelNum: number) => void;
  onSelectStageForActivity: (levelNum: number) => void;
  onSelectPreTest?: () => void;
  onSelectPostTest?: () => void;
}

export const LearningMapScreen: React.FC<LearningMapScreenProps> = ({
  username,
  onSelectStageForContent,
  onSelectStageForActivity,
  onSelectPreTest,
  onSelectPostTest,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const progress = getStudentProgress(username);
  const [loadingLevelForGame, setLoadingLevelForGame] = useState<GameLevelDef | null>(null);
  const [selectedIntroLevel, setSelectedIntroLevel] = useState<GameLevelDef | null>(null);
  const [lockedStageAlert, setLockedStageAlert] = useState<GameLevelDef | null>(null);
  const [preTestRequiredAlert, setPreTestRequiredAlert] = useState(false);

  // Skill icons for each of the 10 stages
  const stageIcons: Record<number, React.ReactNode> = {
    1: <Monitor className="w-5 h-5 text-blue-400" />,
    2: <Cpu className="w-5 h-5 text-indigo-400" />,
    3: <Layers className="w-5 h-5 text-purple-400" />,
    4: <FileText className="w-5 h-5 text-pink-400" />,
    5: <Volume2 className="w-5 h-5 text-amber-400" />,
    6: <Sliders className="w-5 h-5 text-emerald-400" />,
    7: <Sparkles className="w-5 h-5 text-teal-400" />,
    8: <Video className="w-5 h-5 text-red-400" />,
    9: <HelpCircle className="w-5 h-5 text-yellow-400" />,
    10: <Share2 className="w-5 h-5 text-cyan-400" />,
  };

  const handleStageClick = (lvl: GameLevelDef) => {
    const isPreTestDone = !!progress.preTestResult?.completed;
    if (!isPreTestDone) {
      setPreTestRequiredAlert(true);
      return;
    }

    const isCompleted = !!progress.completedLevels[lvl.levelNumber];
    const isCurrent = lvl.levelNumber === progress.currentLevel;
    const isUpcoming = lvl.levelNumber > progress.currentLevel;

    // Strict sequential locking enforcement
    if (isUpcoming) {
      setLockedStageAlert(lvl);
      return;
    }

    // Launch game level unlock loader with moving anime mascot (1 to 100%)
    setLoadingLevelForGame(lvl);
  };

  const currentLevelDef =
    GAME_LEVELS_DATA.find((l) => l.levelNumber === progress.currentLevel) || GAME_LEVELS_DATA[0];

  return (
    <div className="relative w-full max-w-5xl mx-auto z-10 font-['Cairo',_sans-serif] text-right py-4 animate-fadeIn">
      {/* Ambient Glow */}
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-amber-500/15 blur-xl opacity-70 pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative rounded-3xl bg-[#0b0e1e]/95 backdrop-blur-2xl border-2 border-blue-500/40 p-6 sm:p-10 shadow-[0_0_40px_rgba(37,99,235,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/50 text-blue-300 text-xs font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                المسار التفاعلي المنهجي للتعلم
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Tajawal'] tracking-tight">
              بيئة الألعاب
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              ابدأ المرحلة الحالية لاستكمال لعبتك التعليمية واستكشاف التحديات الرقمية الشيقة.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#070914] border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block font-bold">المرحلة الحالية المتاحة</span>
            <span className="text-xl font-black text-[#ffd700] font-['Outfit']">
              المرحلة {progress.currentLevel} <span className="text-xs text-slate-400">/ 10</span>
            </span>
          </div>
        </div>

        {/* PRE-TEST (المستوى التمهيدي: الاختبار القبلي) CARD */}
        <div className="mt-6 mb-2">
          {!progress.preTestResult?.completed ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-yellow-950/40 to-slate-950 border-2 border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-4 text-right">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffd700] to-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                  <Gamepad2 className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/60 text-[#ffd700] text-[10px] font-black">
                      المستوى التمهيدي: الخطوة الأولى
                    </span>
                    <span className="text-xs text-amber-300 font-bold">مطلوب للبدء</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
                    لعبة الاختبار القبلي (Adobe Captivate 2019)
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    ادخل الاختبار القبلي أولاً ثم تابع باقي المستويات. صُمم على شكل لعبة أسئلة تفاعلية لتشخيص مهاراتك وفتح المرحلة 1.
                  </p>
                </div>
              </div>

              {onSelectPreTest && (
                <button
                  type="button"
                  id="btn-map-start-pretest"
                  onClick={onSelectPreTest}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(255,215,0,0.4)] border border-amber-300 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap transform hover:-translate-y-0.5 transition"
                >
                  <Gamepad2 className="w-4 h-4 text-slate-950" />
                  <span>ابدأ لعبة الاختبار القبلي الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-950/70 to-slate-950 border border-cyan-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3.5 text-right">
                <div className="w-11 h-11 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-cyan-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50 text-[10px] font-bold">
                      المستوى التمهيدي: مكتمل بنجاح ✓
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">
                      (النتيجة مسجلة في لوحة الإدارة والمشرف 🔒)
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white font-['Tajawal']">
                    تم إتمام وتسليم الاختبار القبلي وحصد وسام المستكشف التمهيدي 🏅
                  </h4>
                </div>
              </div>

              {onSelectPreTest && (
                <button
                  type="button"
                  onClick={onSelectPreTest}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 cursor-pointer whitespace-nowrap"
                >
                  استعراض الأسئلة التمهيدية
                </button>
              )}
            </div>
          )}
        </div>

        {/* Winding Path / Visual Road of the 10 Stages */}
        <div className="my-8 relative">
          {/* Connection line behind nodes */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-blue-500 to-slate-800 z-0 opacity-40 rounded-full" />

          {/* Grid/Track of 10 Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {GAME_LEVELS_DATA.map((lvl) => {
              const isCompleted = !!progress.completedLevels[lvl.levelNumber];
              const isCurrent = lvl.levelNumber === progress.currentLevel && !isCompleted;
              const isUpcoming = lvl.levelNumber > progress.currentLevel;

              return (
                <div
                  key={lvl.levelNumber}
                  onClick={() => handleStageClick(lvl)}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    isCurrent
                      ? 'bg-gradient-to-br from-amber-950/60 to-[#141126] border-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.35)] scale-105 z-20'
                      : isCompleted
                      ? 'bg-gradient-to-br from-emerald-950/40 to-[#09151c] border-emerald-500/70 hover:border-emerald-400 hover:scale-102'
                      : 'bg-[#080b18]/70 border-slate-800/80 opacity-55 hover:opacity-75'
                  }`}
                >
                  {/* Top Badge & Number */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm ${
                        isCurrent
                          ? 'bg-[#ffd700] text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(255,215,0,0.5)]'
                          : isCompleted
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {lvl.levelNumber}
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/90 border border-slate-800">
                      {stageIcons[lvl.levelNumber]}
                    </div>
                  </div>

                  {/* Stage Title */}
                  <h3
                    className={`text-sm font-black font-['Tajawal'] mb-1 line-clamp-1 ${
                      isCurrent ? 'text-white' : isCompleted ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {lvl.shortTitle}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {lvl.title}
                  </p>

                  {/* Status Indicator */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-bold">
                    {isCompleted ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        مكتملة ومتقنة
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[#ffd700] flex items-center gap-1 font-mono animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" />
                        المرحلة الحالية (مفتوحة)
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3 text-slate-500" />
                        قيد الانتظار
                      </span>
                    )}

                    <span className="text-amber-300 font-mono">{lvl.badgeEmoji}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* POST-TEST (المحطة الختامية: الاختبار البعدي) CARD */}
        {onSelectPostTest && (
          <div className="mt-4 mb-2">
            {!progress.postTestResult?.completed ? (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-900 border-2 border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-right">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/50 shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        المحطة الختامية
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white font-['Tajawal']">
                        🏁 لعبة توصيل الإجابات بالسيارة: الاختبار البعدي
                      </h3>
                    </div>
                    <p className="text-xs text-purple-200/90 mt-0.5">
                      قُد سيارة السباق لتوصيل الأسئلة بالإجابات وقياس مكاسب التعلم بعد إتمام المراحل!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSelectPostTest}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-xs transition shadow-lg shadow-purple-900/40 shrink-0 flex items-center justify-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>بدء الاختبار البعدي 🏁</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-300 block">
                      المحطة الختامية (مكتملة بنجاح 🏆)
                    </span>
                    <span className="text-[11px] text-slate-300">
                      نتيجة الاختبار البعدي: {progress.postTestResult.score} / {progress.postTestResult.maxScore} نقطة
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSelectPostTest}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                >
                  إعادة خوض سباق التوصيل 🏎️
                </button>
              </div>
            )}
          </div>
        )}

        {/* Legend / Key */}
        <div className="flex flex-wrap items-center justify-center gap-6 p-4 rounded-2xl bg-[#070914] border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span>المراحل المفتوحة والمكتملة</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.5)] animate-pulse" />
            <span>المرحلة الحالية النشطة</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700" />
            <span>المراحل القادمة</span>
          </div>
        </div>
      </div>

      {/* Screen 7: Stage Intro Modal (تمهيد المرحلة) */}
      {selectedIntroLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-[#0d1024] border-2 border-blue-500/60 p-6 sm:p-8 text-right shadow-[0_0_50px_rgba(37,99,235,0.35)] relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <span className="px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-500/50 text-xs font-bold">
                تمهيد المرحلة {selectedIntroLevel.levelNumber}
              </span>
              <button
                type="button"
                onClick={() => setSelectedIntroLevel(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            {/* Stage Title */}
            <div className="mb-5">
              <span className="text-xs text-[#ffd700] font-bold block mb-1">
                أهلاً بك في المرحلة {selectedIntroLevel.levelNumber}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal']">
                {selectedIntroLevel.title}
              </h2>
            </div>

            {/* Video preview in Stage Intro if available */}
            <StageIntroVideoPlayer levelNumber={selectedIntroLevel.levelNumber} />

            {/* Stage Objectives */}
            <div className="p-4 rounded-2xl bg-[#080b18] border border-blue-500/30 mb-4">
              <h4 className="text-xs font-black text-blue-300 font-['Cairo'] mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>أهداف المرحلة:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>فهم وتطبيق المفاهيم المعرفية التخصصية الخاصة بـ {selectedIntroLevel.shortTitle}.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>التعرف على الأدوات واللوحات الإجرائية في بيئة عمل Adobe Captivate 2019.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>حل الأنشطة والمهام التقويمية بكفاءة للحصول على وسام {selectedIntroLevel.badgeName}.</span>
                </li>
              </ul>
            </div>

            {/* Targeted Skills */}
            <div className="p-4 rounded-2xl bg-[#080b18] border border-purple-500/30 mb-6">
              <h4 className="text-xs font-black text-purple-300 font-['Cairo'] mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>المهارات المستهدفة:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">1.</span>
                  <span>مهارة الإنتاج والتصميم العملي في المشروع التفاعلي.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">2.</span>
                  <span>مهارة التقييم الذاتي والتأكد من توافق الخيارات وفق المعايير التعليمية.</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons: Go to Content vs Go to Activity */}
            {/* Action Button: Go to Game Challenge Activity */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  const num = selectedIntroLevel.levelNumber;
                  setSelectedIntroLevel(null);
                  onSelectStageForActivity(num);
                }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ffd700] via-amber-400 to-[#d4af37] text-slate-950 font-black text-base shadow-[0_0_25px_rgba(212,175,55,0.45)] flex items-center justify-center gap-2.5 cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>بدء اللعبة وتحدي المرحلة الآن 🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Test Required Alert Modal */}
      {preTestRequiredAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0e0c1c] border-2 border-[#ffd700] p-6 sm:p-8 text-right shadow-[0_0_50px_rgba(255,215,0,0.35)] space-y-4 font-['Cairo',_sans-serif]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffd700] to-amber-500 text-slate-950 flex items-center justify-center mx-auto text-3xl shadow-lg">
              <Gamepad2 className="w-9 h-9" />
            </div>

            <div className="text-center">
              <span className="px-3 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-[#ffd700] text-xs font-black">
                المستوى التمهيدي
              </span>
              <h3 className="text-xl font-black text-white font-['Tajawal'] mt-2">
                ادخل الاختبار القبلي أولاً!
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#070914] border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                يُرجى أداء <strong className="text-[#ffd700]">لعبة الاختبار القبلي (المستوى التمهيدي)</strong> أولاً للانتقال إلى المرحلة 1 وباقي مسار التعلم.
              </p>
              <p className="text-emerald-300 font-bold">
                🎮 الاختبار القبلي مصمم في صورة لعبة تفاعلية تمنحك نقاط XP وشارة البداية.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPreTestRequiredAlert(false)}
                className="w-1/3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>

              {onSelectPreTest && (
                <button
                  type="button"
                  id="btn-alert-go-to-pretest"
                  onClick={() => {
                    setPreTestRequiredAlert(false);
                    onSelectPreTest();
                  }}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>بدء لعبة الاختبار القبلي الآن</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {lockedStageAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0e0c1c] border-2 border-amber-500/80 p-6 sm:p-8 text-right shadow-[0_0_40px_rgba(245,158,11,0.3)] space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto text-2xl">
              🔒
            </div>

            <div className="text-center">
              <span className="px-3 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 text-xs font-black">
                المرحلة {lockedStageAlert.levelNumber}
              </span>
              <h3 className="text-xl font-black text-white font-['Tajawal'] mt-2">
                يجب إتمام المرحلة السابقة أولاً!
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#070914] border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                لا يمكن فتح المرحلة <strong className="text-white">({lockedStageAlert.levelNumber}: {lockedStageAlert.shortTitle})</strong> إلا بعد الانتهاء من حل واعتماد إجابات المرحلة <strong className="text-amber-300">({lockedStageAlert.levelNumber - 1})</strong> السابقة بنجاح.
              </p>
              <p className="text-emerald-300 font-bold">
                🎯 المرحلة النشطة المتاحة لك الآن هي: المرحلة {progress.currentLevel} ({currentLevelDef.shortTitle}).
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setLockedStageAlert(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={() => {
                  setLockedStageAlert(null);
                  handleStageClick(currentLevelDef);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-slate-950 font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>الانتقال للمرحلة {progress.currentLevel}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎮 ARCADE GAME PROGRESS BAR (1 TO 100%) WITH MOVING ANIME MASCOT */}
      {loadingLevelForGame && (
        <GameLevelUnlockLoader
          levelNumber={loadingLevelForGame.levelNumber}
          levelTitle={loadingLevelForGame.title}
          badgeEmoji={loadingLevelForGame.badgeEmoji}
          onComplete={() => {
            const lvl = loadingLevelForGame;
            setLoadingLevelForGame(null);
            setSelectedIntroLevel(lvl);
          }}
          onCancel={() => setLoadingLevelForGame(null)}
        />
      )}
    </div>
  );
};
