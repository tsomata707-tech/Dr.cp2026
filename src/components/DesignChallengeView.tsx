import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Monitor,
  MousePointer,
  HelpCircle,
  Award,
} from 'lucide-react';
import { GAME_LEVELS_DATA } from '../data/gameLevelsData';

interface DesignChallengeViewProps {
  currentLevel: number;
  onSolveChallenge: (bonusPoints: number) => void;
}

export const DesignChallengeView: React.FC<DesignChallengeViewProps> = ({
  currentLevel,
  onSolveChallenge,
}) => {
  const levelDef = GAME_LEVELS_DATA.find((l) => l.levelNumber === currentLevel) || GAME_LEVELS_DATA[0];

  // Realistic Captivate 2019 Design Problem Scenario
  const challengeScenarios: Record<
    number,
    {
      title: string;
      problem: string;
      options: { text: string; isCorrect: boolean; feedback: string }[];
    }
  > = {
    1: {
      title: 'مشكلة توافق الخط الزمني وحجم الشاشة في Captivate',
      problem:
        'قام مصمم وسائط متعددة بإنشاء شريحة تفاعلية تشتمل على نص وصوت توضيحي، ولكن عند المعاينة في المتصفح ينتهي الصوت قبل ظهور النص بالكامل وتتداخل العناصر. ما الإجراء الصحيح في Adobe Captivate لحل هذه المشكلة؟',
      options: [
        {
          text: 'تعديل توقيت ظهور كائن النص في خط الزمن (Timeline) ليتزامن مع بدء ملف الصوت ومد مدة العرض لتطابق مدة الصوت.',
          isCorrect: true,
          feedback: 'إجابة احترافية ممتازة! مزامنة التوقيت عبر خط الزمن Timeline هي المعيار الصحيح لضبط تزامن الصوت مع النصوص التفاعلية.',
        },
        {
          text: 'حذف ملف الصوت وإعادة تسجيله بسرعة أكبر لإنهاء الشريحة.',
          isCorrect: false,
          feedback: 'غير صحيح؛ تسريع الصوت يضر بجودة المحتوى وسهولة الفهم للمتعلم.',
        },
        {
          text: 'إلغاء تفعيل الشريحة ووضع زر توقف عشوائي في المنتصف.',
          isCorrect: false,
          feedback: 'غير صحيح؛ لا يعالج مشكلة التزامن بين كائنات الوسائط في الشريحة.',
        },
      ],
    },
    2: {
      title: 'مشكلة استجابة الأزرار التفاعلية ونقاط التوقف',
      problem:
        'في مشروع تدريبي لطلاب الجامعة، يشتمل الاختبار على أزرار تفاعلية (Smart Buttons) للانتقال إلى الشريحة التالية، ولكن عند النقر ينتقل البرنامج فجأة دون إعطاء المتعلم فرصة قراءة الملاحظات. كيف تضبط إجراء الزر في Captivate؟',
      options: [
        {
          text: 'تفعيل خيار Pause Project until user clicks في لوحة خصائص الزر وتحديد الإجراء (Action) ليكون Go to Next Slide.',
          isCorrect: true,
          feedback: 'رائع جداً! خيار Pause هو جوهر التفاعلية في كابتيفيت لإيقاف تشغيل العرض حتى يتفاعل المتعلم بنفسه.',
        },
        {
          text: 'تقليل سرعة الفريمات (Frame Rate) للمشروع إلى 5 إطارات في الثانية.',
          isCorrect: false,
          feedback: 'خطأ؛ تغيير معدل الإطارات يسبب بطئاً وتقطيعاً في حركة الفيديو والرسوم.',
        },
        {
          text: 'إزالة الزر واستبداله بنص ثابت دون أي برمجة تفاعلية.',
          isCorrect: false,
          feedback: 'غير صحيح؛ يلغي التفاعلية المستهدفة تماماً.',
        },
      ],
    },
  };

  const currentChallenge = challengeScenarios[currentLevel] || challengeScenarios[1];

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'shape' | 'text' | 'timeline'>('select');

  const handleConfirm = () => {
    if (selectedOption === null) {
      alert('يرجى اختيار الحل المقترح للمشكلة أولاً.');
      return;
    }
    setIsAnswered(true);
    if (currentChallenge.options[selectedOption].isCorrect) {
      onSolveChallenge(40);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsAnswered(false);
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif] animate-fadeIn" id="design-challenge-view">
      {/* Challenge Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#181329] to-[#0a0714] border-2 border-[#ffd700] p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#ffd700]/30">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-amber-950 border border-[#ffd700] text-[#ffd700] text-xs font-black flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                شاشة التحدي (Challenge Screen)
              </span>
              <span className="text-xs text-purple-300 font-bold">
                المرحلة {currentLevel}: {levelDef.shortTitle}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal']">
              مشكلة التصميم: {currentChallenge.title}
            </h2>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center shrink-0">
            <span className="text-[10px] text-slate-400 block font-bold">مكافأة حل التحدي</span>
            <span className="text-xl font-black text-[#ffd700] font-['Outfit']">+40 ⭐ XP</span>
          </div>
        </div>

        {/* Captivate Interactive Toolbar Mockup */}
        <div className="my-5 p-3 rounded-2xl bg-[#090714] border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-300 font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800">
              Captivate 2019 Tools:
            </span>
            <button
              type="button"
              onClick={() => setActiveTool('select')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTool === 'select' ? 'bg-[#ffd700] text-slate-950' : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>مؤشر التحديد (Pointer)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('shape')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTool === 'shape' ? 'bg-[#ffd700] text-slate-950' : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>الأشكال الذكية (Smart Shapes)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('timeline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTool === 'timeline' ? 'bg-[#ffd700] text-slate-950' : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>خط الزمن (Timeline)</span>
            </button>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden md:block">Adobe Captivate Simulator Engine</span>
        </div>

        {/* Problem Scenario Card */}
        <div className="p-5 rounded-2xl bg-[#090b1c] border-2 border-blue-500/40 mb-6">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>سيناريو الموقف التعليمي والتصميمي:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {currentChallenge.problem}
          </p>
        </div>

        {/* Proposed Solutions List */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-black text-slate-300 font-['Cairo']">
            ما هو الإجراء الأكاديمي والبرمجي الصحيح الذي تنصح بتطبيقه؟
          </h3>

          <div className="space-y-2.5">
            {currentChallenge.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let style = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700';

              if (isAnswered) {
                if (opt.isCorrect) {
                  style = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold';
                } else if (isSelected && !opt.isCorrect) {
                  style = 'bg-red-950/70 border-red-500 text-red-200 line-through';
                }
              } else if (isSelected) {
                style = 'bg-amber-950/70 border-[#ffd700] text-amber-200 font-bold shadow-md';
              }

              return (
                <div
                  key={idx}
                  onClick={() => !isAnswered && setSelectedOption(idx)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${style}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs sm:text-sm leading-relaxed block">{opt.text}</span>
                    {isAnswered && isSelected && (
                      <div className={`mt-2 p-2.5 rounded-xl text-xs ${opt.isCorrect ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50' : 'bg-red-950/80 text-red-300 border border-red-500/50'}`}>
                        {opt.feedback}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {isAnswered ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                تم تقييم استجابتك للتحدي
              </span>
            ) : (
              <span>اختر الإجراء المناسب ثم اضغط تأكيد الحل</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAnswered ? (
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#ffd700] via-amber-400 to-[#d4af37] text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>تأكيد حل التحدي</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
