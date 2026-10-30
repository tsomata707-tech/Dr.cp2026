import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Check,
  MousePointer,
  Layers,
  Settings,
  Sliders,
  Bookmark,
  FileCode,
  FileText,
  Video,
  Monitor,
  Star,
  Zap,
} from 'lucide-react';

interface LevelInteractiveGamesProps {
  levelNumber: number;
  isLevelCompleted: boolean;
  onCompleteActivity: (score: number) => void;
  initialCompleted?: boolean;
  earnedScore?: number;
  maxScore?: number;
}

export const LevelInteractiveGames: React.FC<LevelInteractiveGamesProps> = ({
  levelNumber,
  isLevelCompleted,
  onCompleteActivity,
  initialCompleted = false,
  earnedScore = 0,
  maxScore = 25,
}) => {
  const [completed, setCompleted] = useState<boolean>(initialCompleted || isLevelCompleted);
  const [score, setScore] = useState<number>(earnedScore || (initialCompleted || isLevelCompleted ? maxScore : 0));
  const [feedback, setFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);

  useEffect(() => {
    if (isLevelCompleted) {
      setCompleted(true);
      setScore(earnedScore > 0 ? earnedScore : maxScore);
    }
  }, [isLevelCompleted, earnedScore, maxScore]);

  const handleSuccess = (awardedScore: number = maxScore) => {
    setCompleted(true);
    setScore(awardedScore);
    setFeedback({
      msg: `رائع جداً يا بطل! تم إنجاز النشاط التطبيقي للمستوى ${levelNumber} بنجاح تام (+${awardedScore} درجة)`,
      isCorrect: true,
    });
    onCompleteActivity(awardedScore);
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1433] via-[#101b45] to-[#0d1433] border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.25)] space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center text-2xl shrink-0 shadow-md">
            🎮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 text-[10px] font-black">
                القسم الثاني: النشاط التطبيقي التفاعلي
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-black">
                +{maxScore} درجة
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] mt-1">
              {levelNumber === 1 && 'لعبة ترتيب خطوات تثبيت Adobe Captivate 2019 وتفعيل دعم اللغة العربية'}
              {levelNumber === 2 && 'لعبة مطابقة لوحات وأدوات واجهة Captivate مع وظائفها المحددة'}
              {levelNumber === 3 && 'لعبة تصنيف واختيار نمط المشروع المناسب للموقف التعليمي'}
              {levelNumber === 4 && 'استوديو بناء الأزرار التفاعلية باستخدام الأشكال الذكية (Smart Shapes)'}
              {levelNumber === 5 && 'مختبر تنظيم ومحاذاة الطبقات وترتيب العناصر على مسرح العمل'}
              {levelNumber === 6 && 'مهندس بنك الأسئلة وضبط شريحة النتائج والتقويم التفاعلي'}
              {levelNumber === 7 && 'مزامنة الخط الزمني ووضع العلامات المرجعية التفاعلية (Bookmarks)'}
              {levelNumber === 8 && 'معالج استيراد عروض PowerPoint وتفعيل خيار الربط الديناميكي (Link)'}
              {levelNumber === 9 && 'مختبر التمييز بين أوضاع محاكاة البرمجيات (Demo / Training / Assessment)'}
            </h3>
          </div>
        </div>

        {/* Earned Points Badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {completed ? (
            <span className="px-4 py-2 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>مكتمل (+{score} درجة)</span>
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5">
              <span>⏳ بانتظار الإنجاز</span>
            </span>
          )}
        </div>
      </div>

      {/* RENDER THE SPECIFIC GAME 1..9 */}
      <div className="pt-2">
        {levelNumber === 1 && <GameLevel1 onFinish={handleSuccess} isDone={completed} />}
        {levelNumber === 2 && <GameLevel2 onFinish={handleSuccess} isDone={completed} />}
        {levelNumber === 3 && <GameLevel3 onFinish={handleSuccess} isDone={completed} />}
        {levelNumber === 4 && <GameLevel4 onFinish={handleSuccess} isDone={completed} />}
        {levelNumber === 5 && <GameLevel5 onFinish={handleSuccess} isDone={completed} />}
        {levelNumber === 6 && <GameLevel6 onFinish={handleSuccess} isDone={completed} />}
        {levelNumber === 7 && <GameLevel7 onFinish={handleSuccess} isDone={completed} />}
        {levelNumber === 8 && <GameLevel8 onFinish={handleSuccess} isDone={completed} />}
        {levelNumber === 9 && <GameLevel9 onFinish={handleSuccess} isDone={completed} />}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 ${
            feedback.isCorrect
              ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200'
              : 'bg-red-950/70 border-red-400 text-red-200'
          }`}
        >
          <span>{feedback.isCorrect ? '🌟' : '⚠️'}</span>
          <span>{feedback.msg}</span>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// GAME 1: Steps Sequencer (تثبيت البرنامج ودعم العربية)
// =========================================================================
const GameLevel1: React.FC<{ onFinish: () => void; isDone: boolean }> = ({ onFinish, isDone }) => {
  const correctOrder = [
    'التحقق من معمارية نظام التشغيل 64-Bit لتشغيل Adobe Captivate 2019',
    'تشغيل معالج التثبيت القياسي Setup.exe ومتابعة خطوات التنصيب',
    'فتح البرنامج واختيار قائمة التفضيلات Edit > Preferences',
    'تفعيل خيار دعم نصوص الشرق الأوسط (Indic Composer) لكتابة العربية السليمة',
  ];

  const [items, setItems] = useState<string[]>(() => [
    correctOrder[2],
    correctOrder[0],
    correctOrder[3],
    correctOrder[1],
  ]);
  const [solved, setSolved] = useState<boolean>(isDone);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const moveUp = (index: number) => {
    if (index === 0 || solved) return;
    const next = [...items];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setItems(next);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1 || solved) return;
    const next = [...items];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setItems(next);
  };

  const handleCheck = () => {
    const isCorrect = items.every((val, idx) => val === correctOrder[idx]);
    if (isCorrect) {
      setSolved(true);
      setErrorNotice(null);
      onFinish();
    } else {
      setErrorNotice('الترتيب الحالي غير صحيح! راجع الترتيب المنطقي لخطوات التثبيت ثم التفضيلات ثم تفعيل اللغة العربية وحاول ثانية.');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
        📋 <strong>المهمة التفاعلية:</strong> رتّب الخطوات العملية الأربعة التالية بالترتيب الزمني الصحيح لتثبيت Adobe Captivate 2019 وضمان كتابة النصوص العربية باتجاه صحيح:
      </p>

      <div className="space-y-2.5">
        {items.map((text, idx) => (
          <div
            key={text}
            className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
              solved
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                : 'bg-slate-950/80 border-slate-700 text-slate-100 hover:border-cyan-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs sm:text-sm font-medium">{text}</span>
            </div>

            {!solved && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveUp(idx)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-white"
                  title="تحريك لأعلى"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() => moveDown(idx)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-white"
                  title="تحريك لأسفل"
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {errorNotice && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-200 text-xs">
          {errorNotice}
        </div>
      )}

      {!solved && (
        <button
          type="button"
          onClick={handleCheck}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>تحقق من صحة ترتيب الخطوات</span>
        </button>
      )}
    </div>
  );
};

// =========================================================================
// GAME 2: Interface Matching (مطابقة لوحات وأدوات واجهة Captivate)
// =========================================================================
const GameLevel2: React.FC<{ onFinish: () => void; isDone: boolean }> = ({ onFinish, isDone }) => {
  const pairs = [
    { tool: 'لوحة الخصائص (Properties Panel)', desc: 'تعديل أبعاد وموضع وتأثيرات وألوان الكائن المحدد على المسرح' },
    { tool: 'شريط الشرائح (Filmstrip)', desc: 'عرض مصغرات الشرائح بالترتيب وإعادة ترتيبها وتكرارها وحذفها' },
    { tool: 'مسرح العمل الرئيسي (Stage)', desc: 'مساحة العمل والتصميم المركزية التي توضع عليها كائنات الشريحة' },
    { tool: 'شريط الأدوات العلوي (Toolbar)', desc: 'إدراج الكائنات الذكية والنصوص والأشكال والأزرار ومسارات التعلم' },
  ];

  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>(() => (isDone ? {
    'لوحة الخصائص (Properties Panel)': 'تعديل أبعاد وموضع وتأثيرات وألوان الكائن المحدد على المسرح',
    'شريط الشرائح (Filmstrip)': 'عرض مصغرات الشرائح بالترتيب وإعادة ترتيبها وتكرارها وحذفها',
    'مسرح العمل الرئيسي (Stage)': 'مساحة العمل والتصميم المركزية التي توضع عليها كائنات الشريحة',
    'شريط الأدوات العلوي (Toolbar)': 'إدراج الكائنات الذكية والنصوص والأشكال والأزرار ومسارات التعلم',
  } : {}));

  const handleSelectTool = (tool: string) => {
    if (matched[tool]) return;
    setSelectedTool(tool);
  };

  const handleSelectDesc = (desc: string) => {
    if (!selectedTool) return;
    const targetPair = pairs.find((p) => p.tool === selectedTool);
    if (targetPair && targetPair.desc === desc) {
      const nextMatched = { ...matched, [selectedTool]: desc };
      setMatched(nextMatched);
      setSelectedTool(null);
      if (Object.keys(nextMatched).length === pairs.length) {
        onFinish();
      }
    } else {
      setSelectedTool(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
        🔗 <strong>المهمة التفاعلية:</strong> اضغط على اسم اللوحة أو الأداة، ثم اضغط على الوظيفة الصحيحة المطابقة لها لربطهما معاً:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tools Column */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-amber-300">أدوات ولوحات واجهة Captivate:</h4>
          {pairs.map((p) => {
            const isMatched = !!matched[p.tool];
            const isSelected = selectedTool === p.tool;
            return (
              <button
                key={p.tool}
                type="button"
                disabled={isMatched}
                onClick={() => handleSelectTool(p.tool)}
                className={`w-full p-3 rounded-xl border text-right text-xs font-bold transition-all ${
                  isMatched
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-black'
                    : 'bg-slate-950/80 border-slate-700 text-slate-200 hover:border-cyan-400'
                }`}
              >
                {isMatched ? '✅ ' : '🔘 '} {p.tool}
              </button>
            );
          })}
        </div>

        {/* Descriptions Column */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-cyan-300">الوظائف والاستخدامات المحددة:</h4>
          {pairs.map((p) => {
            const isPaired = Object.values(matched).includes(p.desc);
            return (
              <button
                key={p.desc}
                type="button"
                disabled={isPaired}
                onClick={() => handleSelectDesc(p.desc)}
                className={`w-full p-3 rounded-xl border text-right text-xs transition-all ${
                  isPaired
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : selectedTool
                    ? 'bg-slate-900 border-cyan-400 hover:bg-cyan-950/40 text-white cursor-pointer'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}
              >
                {p.desc}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// GAME 3: Project Types Classifier (تصنيف واختيار نمط المشروع المناسب)
// =========================================================================
const GameLevel3: React.FC<{ onFinish: () => void; isDone: boolean }> = ({ onFinish, isDone }) => {
  const scenarios = [
    {
      id: 'sc-1',
      title: 'محتوى متجاوب يعيد ترتيب عناصره تلقائياً ليلائم شاشات الهواتف والتابلت والكمبيوتر',
      correctType: 'Responsive Project',
    },
    {
      id: 'sc-2',
      title: 'بيئة تدريب غامرة بصور أو فيديو بزاوية 360 درجة ونقاط تفاعلية Hotspots',
      correctType: 'Virtual Reality (VR) Project',
    },
    {
      id: 'sc-3',
      title: 'تسجيل خطوات استخدام برنامج كمبيوتر وتدريب المستخدمين عليه خطوة بخطوة',
      correctType: 'Software Simulation',
    },
    {
      id: 'sc-4',
      title: 'بناء درس تعليمي حر ذي أبعاد ومقاسات شاشة ثابتة مخصصة بالبكسل',
      correctType: 'Blank Project',
    },
  ];

  const types = ['Responsive Project', 'Virtual Reality (VR) Project', 'Software Simulation', 'Blank Project'];

  const [answers, setAnswers] = useState<Record<string, string>>(() => (isDone ? {
    'sc-1': 'Responsive Project',
    'sc-2': 'Virtual Reality (VR) Project',
    'sc-3': 'Software Simulation',
    'sc-4': 'Blank Project',
  } : {}));

  const handleSelect = (scId: string, type: string) => {
    if (isDone) return;
    const next = { ...answers, [scId]: type };
    setAnswers(next);
    if (Object.keys(next).length === scenarios.length) {
      const allRight = scenarios.every((s) => next[s.id] === s.correctType);
      if (allRight) onFinish();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
        🎯 <strong>المهمة التفاعلية:</strong> حدد نوع مشروع Adobe Captivate الأنسب لكل سيناريو تعليمي:
      </p>

      <div className="space-y-3">
        {scenarios.map((sc, idx) => {
          const isCorrect = answers[sc.id] === sc.correctType;
          return (
            <div key={sc.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 space-y-2">
              <span className="text-xs sm:text-sm font-bold text-white block">
                {idx + 1}. {sc.title}
              </span>
              <div className="flex flex-wrap gap-2">
                {types.map((t) => {
                  const isChosen = answers[sc.id] === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={isDone}
                      onClick={() => handleSelect(sc.id, t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isChosen
                          ? isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-400'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================================
// GAME 4: Smart Shapes & Buttons Studio (استوديو تصميم زر تفاعلي)
// =========================================================================
const GameLevel4: React.FC<{ onFinish: () => void; isDone: boolean }> = ({ onFinish, isDone }) => {
  const [step1Shape, setStep1Shape] = useState<boolean>(isDone);
  const [step2UseButton, setStep2UseButton] = useState<boolean>(isDone);
  const [step3States, setStep3States] = useState<boolean>(isDone);
  const [step4Action, setStep4Action] = useState<boolean>(isDone);
  const [buttonHoverState, setButtonHoverState] = useState<'Normal' | 'RollOver' | 'Down'>('Normal');

  const checkFinish = (s1: boolean, s2: boolean, s3: boolean, s4: boolean) => {
    if (s1 && s2 && s3 && s4) {
      onFinish();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
        ⚡ <strong>المهمة التفاعلية:</strong> قم بإعداد زر تفاعلي كامل من الأشكال الذكية بالضغط على خطوات المعالج الأربعة:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Controls */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              setStep1Shape(true);
              checkFinish(true, step2UseButton, step3States, step4Action);
            }}
            className={`w-full p-3 rounded-xl border text-right text-xs font-bold transition-all ${
              step1Shape ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-700 text-white hover:border-cyan-400'
            }`}
          >
            {step1Shape ? '✅ 1. تم إدراج شكل ذكي Smart Shape (مستطيل ذو حواف دائرية)' : '1. اضغط هنا لإدراج شكل ذكي Smart Shape'}
          </button>

          <button
            type="button"
            disabled={!step1Shape}
            onClick={() => {
              setStep2UseButton(true);
              checkFinish(step1Shape, true, step3States, step4Action);
            }}
            className={`w-full p-3 rounded-xl border text-right text-xs font-bold transition-all ${
              step2UseButton ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-700 text-white hover:border-cyan-400'
            }`}
          >
            {step2UseButton ? '✅ 2. تم تفعيل خيار Use as Button في لوحة الخصائص' : '2. اضغط لتفعيل خيار Use as Button'}
          </button>

          <button
            type="button"
            disabled={!step2UseButton}
            onClick={() => {
              setStep3States(true);
              checkFinish(step1Shape, step2UseButton, true, step4Action);
            }}
            className={`w-full p-3 rounded-xl border text-right text-xs font-bold transition-all ${
              step3States ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-700 text-white hover:border-cyan-400'
            }`}
          >
            {step3States ? '✅ 3. تم تخصيص حالات الزر الثلاث (Normal, RollOver, Down)' : '3. اضغط لتخصيص حالات الزر التفاعلي الثلاث'}
          </button>

          <button
            type="button"
            disabled={!step3States}
            onClick={() => {
              setStep4Action(true);
              checkFinish(step1Shape, step2UseButton, step3States, true);
            }}
            className={`w-full p-3 rounded-xl border text-right text-xs font-bold transition-all ${
              step4Action ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-700 text-white hover:border-cyan-400'
            }`}
          >
            {step4Action ? '✅ 4. تم تعيين أمر النقر Action إلى (Go to Next Slide)' : '4. اضغط لتعيين إجراء النقر: Go to Next Slide'}
          </button>
        </div>

        {/* Live Simulator Preview */}
        <div className="p-4 rounded-2xl bg-black/60 border border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-[11px] text-slate-400">معاينة تفاعلية حية للزر على المسرح (حرك الفأرة واضغط):</span>
          {step1Shape ? (
            <button
              type="button"
              onMouseEnter={() => step3States && setButtonHoverState('RollOver')}
              onMouseLeave={() => step3States && setButtonHoverState('Normal')}
              onMouseDown={() => step3States && setButtonHoverState('Down')}
              onMouseUp={() => step3States && setButtonHoverState('RollOver')}
              className={`px-8 py-3 rounded-2xl font-black text-sm transition-all transform ${
                buttonHoverState === 'Down'
                  ? 'bg-rose-600 text-white scale-95 shadow-inner'
                  : buttonHoverState === 'RollOver'
                  ? 'bg-cyan-400 text-slate-950 scale-105 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                  : 'bg-amber-500 text-slate-950 shadow-md'
              }`}
            >
              <span>{step4Action ? 'التالي: الانتقال للشريحة 2 ➔' : 'زر تفاعلي مخصص'}</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500">المسرح فارغ حالياً، ابدأ بالخطوة 1</span>
          )}
          {step3States && (
            <span className="text-[10px] text-amber-300 font-bold">الحالة النشطة الآن: {buttonHoverState}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// GAME 5: Layer Alignment & Stacking (تنظيم ومحاذاة الطبقات وترتيب العناصر)
// =========================================================================
const GameLevel5: React.FC<{ onFinish: () => void; isDone: boolean }> = ({ onFinish, isDone }) => {
  const [isCentered, setIsCentered] = useState<boolean>(isDone);
  const [isBroughtToFront, setIsBroughtToFront] = useState<boolean>(isDone);

  const checkFinish = (c: boolean, f: boolean) => {
    if (c && f) onFinish();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
        📐 <strong>المهمة التفاعلية:</strong> النص حالياً يقع خلف الخلفية وغير محاذى. استخدم أدوات المسرح لتصحيح وضع الطبقات والمحاذاة:
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setIsBroughtToFront(true);
            checkFinish(isCentered, true);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isBroughtToFront ? 'bg-emerald-600 text-white' : 'bg-slate-900 border border-slate-700 text-white hover:border-cyan-400'
          }`}
        >
          {isBroughtToFront ? '✅ تم إحضار النص للأمام (Bring to Front)' : '⬆️ أمر: تقديم النص للأمام (Bring to Front)'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsCentered(true);
            checkFinish(true, isBroughtToFront);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isCentered ? 'bg-emerald-600 text-white' : 'bg-slate-900 border border-slate-700 text-white hover:border-cyan-400'
          }`}
        >
          {isCentered ? '✅ تمت المحاذاة في المنتصف (Align Center)' : '🎯 أمر: محاذاة في المنتصف (Align Center)'}
        </button>
      </div>

      {/* Visual Canvas Representation */}
      <div className="h-44 w-full rounded-2xl bg-[#070b1a] border-2 border-slate-700 relative overflow-hidden flex items-center justify-center p-4">
        {/* Background layer */}
        <div className="absolute inset-4 rounded-xl bg-gradient-to-r from-blue-900/60 to-purple-900/60 border border-blue-400/30 flex items-center justify-center">
          <span className="text-[10px] text-blue-300 opacity-60">طبقة الخلفية (Background)</span>
        </div>

        {/* Text Layer */}
        <div
          className={`transition-all duration-500 rounded-xl px-4 py-2 border shadow-lg ${
            isBroughtToFront
              ? 'z-20 bg-amber-500/90 text-slate-950 font-black border-amber-300 scale-100'
              : 'z-0 bg-slate-800/40 text-slate-500 opacity-30 border-slate-600 scale-90'
          } ${isCentered ? 'translate-x-0' : '-translate-x-24 -translate-y-8'}`}
        >
          <span className="text-xs sm:text-sm">عنوان الدرس التفاعلي: أدوات Adobe Captivate 2019</span>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// GAME 6: Quiz Builder (إعداد بنك الأسئلة وضبط الاختبار)
// =========================================================================
const GameLevel6: React.FC<{ onFinish: () => void; isDone: boolean }> = ({ onFinish, isDone }) => {
  const [poolType, setPoolType] = useState<string>(isDone ? 'pool' : '');
  const [passRate, setPassRate] = useState<string>(isDone ? '80' : '');
  const [resultSlide, setResultSlide] = useState<boolean>(isDone);

  const checkFinish = (p: string, pr: string, rs: boolean) => {
    if (p === 'pool' && pr === '80' && rs) onFinish();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
        🏆 <strong>المهمة التفاعلية:</strong> اضبط محددات الاختبار التفاعلي القياسي:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 space-y-1.5">
          <span className="text-[11px] font-bold text-amber-300 block">1. نمط سحب الأسئلة:</span>
          <select
            value={poolType}
            disabled={isDone}
            onChange={(e) => {
              setPoolType(e.target.value);
              checkFinish(e.target.value, passRate, resultSlide);
            }}
            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
          >
            <option value="">اختر النمط...</option>
            <option value="fixed">أسئلة ثابتة الترتيب</option>
            <option value="pool">سحب عشوائي من بنك الأسئلة (Question Pool)</option>
          </select>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 space-y-1.5">
          <span className="text-[11px] font-bold text-amber-300 block">2. حد النجاح (Passing Score):</span>
          <select
            value={passRate}
            disabled={isDone}
            onChange={(e) => {
              setPassRate(e.target.value);
              checkFinish(poolType, e.target.value, resultSlide);
            }}
            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
          >
            <option value="">اختر النسبة...</option>
            <option value="50">50%</option>
            <option value="80">80% (حد الإتقان المعتمد)</option>
            <option value="100">100%</option>
          </select>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 space-y-1.5">
          <span className="text-[11px] font-bold text-amber-300 block">3. شريحة عرض النتائج:</span>
          <button
            type="button"
            disabled={isDone}
            onClick={() => {
              const next = !resultSlide;
              setResultSlide(next);
              checkFinish(poolType, passRate, next);
            }}
            className={`w-full p-2 rounded-lg text-xs font-bold transition-all ${
              resultSlide ? 'bg-emerald-600 text-white' : 'bg-slate-900 border border-slate-700 text-slate-300'
            }`}
          >
            {resultSlide ? '✅ مفعلة (Quiz Results + Review)' : 'اضغط للتفعيل'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// GAME 7: Timeline & Video Bookmarks (مزامنة الخط الزمني والعلامات المرجعية)
// =========================================================================
const GameLevel7: React.FC<{ onFinish: () => void; isDone: boolean }> = ({ onFinish, isDone }) => {
  const [b1, setB1] = useState<boolean>(isDone);
  const [b2, setB2] = useState<boolean>(isDone);

  const checkFinish = (p1: boolean, p2: boolean) => {
    if (p1 && p2) onFinish();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
        ⏱️ <strong>المهمة التفاعلية:</strong> اضغط على مواضع التوقف المحددة على الخط الزمني لإدراج العلامات المرجعية (Bookmarks) لمزامنة توقف الفيديو وظهور السؤال:
      </p>

      {/* Timeline Scrubber Bar */}
      <div className="p-5 rounded-2xl bg-black/60 border border-slate-700 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>00:00 (بداية المقطع)</span>
          <span>00:05 (نقطة التفتيش 1)</span>
          <span>00:10 (نقطة التفتيش 2)</span>
          <span>00:15 (نهاية المقطع)</span>
        </div>

        <div className="h-6 rounded-full bg-slate-900 border border-slate-700 relative flex items-center px-4">
          <div className="absolute left-[33%] -top-2">
            <button
              type="button"
              onClick={() => {
                setB1(true);
                checkFinish(true, b2);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                b1 ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-amber-500 text-slate-950 animate-bounce'
              }`}
            >
              {b1 ? '🔖 علامة مرجعية 1' : '➕ ضع علامة هنا'}
            </button>
          </div>

          <div className="absolute left-[66%] -top-2">
            <button
              type="button"
              onClick={() => {
                setB2(true);
                checkFinish(b1, true);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                b2 ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-amber-500 text-slate-950 animate-bounce'
              }`}
            >
              {b2 ? '🔖 علامة مرجعية 2' : '➕ ضع علامة هنا'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// GAME 8: PowerPoint Import Wizard (معالج استيراد وربط عروض PowerPoint)
// =========================================================================
const GameLevel8: React.FC<{ onFinish: () => void; isDone: boolean }> = ({ onFinish, isDone }) => {
  const [step, setStep] = useState<number>(isDone ? 4 : 1);

  const nextStep = () => {
    if (step === 3) {
      setStep(4);
      onFinish();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
        📑 <strong>المهمة التفاعلية:</strong> تابع خطوات معالج استيراد ملف PowerPoint مع تفعيل الربط الديناميكي (Link):
      </p>

      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-700 space-y-3">
        {step === 1 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-300 block">الخطوة 1: اختيار أمر الاستيراد</span>
            <p className="text-xs text-slate-300">توجه إلى قائمة File &gt; Import &gt; PowerPoint Slides...</p>
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
            >
              اختيار ملف PPTX من الجهاز ➔
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-300 block">الخطوة 2: تفعيل الربط الديناميكي لمزامنة التعديلات</span>
            <p className="text-xs text-slate-300">حدد خيار (Link Presentation) لضمان تحديث الشرائح تلقائياً عند تعديل ملف البوربوينت الأصلي.</p>
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              تفعيل خيار Link ومتابعة الاستيراد ➔
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-300 block">الخطوة 3: تحديد دقة العرض وتوليد الشرائح</span>
            <p className="text-xs text-slate-300">تحويل الشرائح الساكنة إلى عناصر تفاعلية عالية الدقة وإدراجها في متصفح Filmstrip.</p>
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              تأكيد الاستيراد والدمج النهائي ➔
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <span>✅ تم استيراد ملف PowerPoint وربطه ديناميكياً بنجاح!</span>
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// GAME 9: Software Simulation Modes (مختبر أوضاع محاكاة البرمجيات)
// =========================================================================
const GameLevel9: React.FC<{ onFinish: () => void; isDone: boolean }> = ({ onFinish, isDone }) => {
  const scenarios = [
    {
      id: 'm-1',
      title: 'عرض توضيحي للمشاهدة السلبية فقط دون أن يتدخل الطالب بالنقر',
      correct: 'Demo Mode (العرض التوضيحي)',
    },
    {
      id: 'm-2',
      title: 'تدريب تفاعلي يسمح للمتعلم بالنقر مع ظهور تلميحات توجيهية وإرشادية عند الخطأ',
      correct: 'Training Mode (التدريب التفاعلي)',
    },
    {
      id: 'm-3',
      title: 'اختبار كفاءة المتعلم العملية دون تلميحات واحتساب درجات على النقرات الصحيحة والخاطئة',
      correct: 'Assessment Mode (التقييم والاختبار)',
    },
  ];

  const modes = [
    'Demo Mode (العرض التوضيحي)',
    'Training Mode (التدريب التفاعلي)',
    'Assessment Mode (التقييم والاختبار)',
  ];

  const [answers, setAnswers] = useState<Record<string, string>>(() => (isDone ? {
    'm-1': 'Demo Mode (العرض التوضيحي)',
    'm-2': 'Training Mode (التدريب التفاعلي)',
    'm-3': 'Assessment Mode (التقييم والاختبار)',
  } : {}));

  const handleSelect = (sId: string, mode: string) => {
    if (isDone) return;
    const next = { ...answers, [sId]: mode };
    setAnswers(next);
    if (Object.keys(next).length === scenarios.length) {
      const allRight = scenarios.every((s) => next[s.id] === s.correct);
      if (allRight) onFinish();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
        🖥️ <strong>المهمة التفاعلية:</strong> طابق نمط محاكاة البرمجيات (Software Simulation) المناسب لكل حالة تدريبية:
      </p>

      <div className="space-y-3">
        {scenarios.map((sc, idx) => {
          const isCorrect = answers[sc.id] === sc.correct;
          return (
            <div key={sc.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 space-y-2">
              <span className="text-xs sm:text-sm font-bold text-white block">
                {idx + 1}. {sc.title}
              </span>
              <div className="flex flex-wrap gap-2">
                {modes.map((m) => {
                  const isChosen = answers[sc.id] === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={isDone}
                      onClick={() => handleSelect(sc.id, m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isChosen
                          ? isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-400'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
