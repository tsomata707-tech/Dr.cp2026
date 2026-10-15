import React, { useState, useEffect } from 'react';
import { CurriculumModule } from '../data/curriculumData';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Video,
  Monitor,
  CheckSquare,
  Award,
  Zap,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface CaptivateSimulatorProps {
  currentModule: CurriculumModule;
  onObjectiveAchieved?: (objectiveId: string) => void;
}

export const CaptivateSimulator: React.FC<CaptivateSimulatorProps> = ({
  currentModule,
  onObjectiveAchieved,
}) => {
  // Experimental Research Variables (from the thesis)
  const [feedbackMode, setFeedbackMode] = useState<'immediate' | 'delayed'>('immediate');
  const [learningMode, setLearningMode] = useState<'cooperative' | 'competitive'>('competitive');

  // Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineSec, setTimelineSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Practical Task State
  const [arabicSupported, setArabicSupported] = useState(true);
  const [activeLayer, setActiveLayer] = useState<'shape' | 'text' | 'video' | 'quiz'>('shape');
  const [shapesCount, setShapesCount] = useState(2);
  const [isLocked, setIsLocked] = useState(false);

  // Quiz / Simulation Test
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'fail' | 'delayed' } | null>(null);
  const [score, setScore] = useState(100);

  // Auto increment timeline during preview
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineSec((prev) => (prev >= 15 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Digital Timer Countdown
  useEffect(() => {
    let timer: any;
    if (timerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      triggerFailureFeedback('انتهى المؤقت الزمني المحدد للمحاكاة البرمجية!');
    }
    return () => clearInterval(timer);
  }, [timerRunning, timeLeft]);

  // Handle Quiz & Simulation submission with research feedback patterns
  const handleAnswerSubmit = (optionIndex: number) => {
    setQuizAnswer(optionIndex);
    const isCorrect = optionIndex === 1; // Option 1 is correct in our scenario

    if (feedbackMode === 'immediate') {
      // Immediate Feedback Mode: Direct instant notification
      setSubmitted(true);
      if (isCorrect) {
        setFeedbackMessage({
          type: 'success',
          text: 'إجابة دقيقة وصحيحة فورياً! تم تعزيز التقبل التكنولوجي وإتقان المهارة بنجاح.',
        });
        setScore((prev) => prev + 25);
        if (onObjectiveAchieved && currentModule.objectives[0]) {
          onObjectiveAchieved(currentModule.objectives[0].id);
        }
      } else {
        setFeedbackMessage({
          type: 'fail',
          text: 'تغذية راجعة فورية: المحاولة غير صحيحة، راجع إعدادات خصائص السؤال ولوحة Properties.',
        });
        setScore((prev) => Math.max(0, prev - 10));
      }
    } else {
      // Delayed Feedback Mode: Stored until review at end
      setSubmitted(true);
      setFeedbackMessage({
        type: 'delayed',
        text: 'تم تسجيل استجابتك ضمن نمط [التغذية الراجعة المرجئة]. سيتم استعراض التقييم التراكمي الشامل بعد انتهاء الموديول التعليمي بالكامل.',
      });
    }
  };

  const triggerFailureFeedback = (msg: string) => {
    setFeedbackMessage({
      type: 'fail',
      text: msg,
    });
  };

  const handleReset = () => {
    setTimelineSec(0);
    setTimeLeft(45);
    setTimerRunning(false);
    setQuizAnswer(null);
    setSubmitted(false);
    setFeedbackMessage(null);
  };

  return (
    <div className="space-y-6" id="captivate-practical-simulator">
      {/* Top Experimental Settings Bar */}
      <div className="p-4 rounded-2xl bg-[#0e0c19] border-2 border-[#d4af37]/50 shadow-[0_0_20px_rgba(212,175,55,0.15)] flex flex-col md:flex-row items-center justify-between gap-4 text-right">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37] text-amber-300 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-['Cairo']">
              المحاكي العملي لبيئة Adobe Captivate 2019
            </h4>
            <p className="text-[11px] text-slate-400 font-['IBM_Plex_Sans_Arabic']">
              تطبيق عملي مباشر لمهارات الوحدة: {currentModule.shortTitle}
            </p>
          </div>
        </div>

        {/* Feedback Mode & Learning Mode Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Feedback mode toggle */}
          <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setFeedbackMode('immediate')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                feedbackMode === 'immediate'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تغذية فورية
            </button>
            <button
              type="button"
              onClick={() => setFeedbackMode('delayed')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                feedbackMode === 'delayed'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تغذية مرجئة
            </button>
          </div>

          {/* Learning mode toggle */}
          <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setLearningMode('competitive')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                learningMode === 'competitive'
                  ? 'bg-[#d4af37] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              نمط تنافسي
            </button>
            <button
              type="button"
              onClick={() => setLearningMode('cooperative')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                learningMode === 'cooperative'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              نمط تعاوني
            </button>
          </div>
        </div>
      </div>

      {/* Main Virtual Stage Canvas */}
      <div className="rounded-3xl bg-[#090712] border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.2)] overflow-hidden">
        {/* Captivate Window Menu Bar & Quick Tools */}
        <div className="bg-[#151126] px-4 py-2.5 border-b border-[#d4af37]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-amber-300">Adobe Captivate 2019 (64-Bit)</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
              Project_Module_{currentModule.number}.cptx
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setArabicSupported(!arabicSupported)}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                arabicSupported
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              {arabicSupported ? '✓ دعم العربية مفعل' : 'دعم العربية معطل'}
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
              title="التعليق الصوتي والتغذية الصوتية"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Toolbar Strip */}
        <div className="bg-[#100c1e] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveLayer('shape')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-[11px] ${
                activeLayer === 'shape' ? 'bg-[#d4af37] text-slate-950' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>الأشكال الذكية (Smart Shapes)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('video')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-[11px] ${
                activeLayer === 'video' ? 'bg-[#d4af37] text-slate-950' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>فيديو تفاعلي (Interactive Video)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('quiz')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-[11px] ${
                activeLayer === 'quiz' ? 'bg-[#d4af37] text-slate-950' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>بنك الأسئلة (Quiz Question)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                isLocked
                  ? 'bg-amber-950 border-[#d4af37] text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              {isLocked ? '🔒 العناصر مقفلة' : '🔓 فك قفل العناصر'}
            </button>
          </div>
        </div>

        {/* Center Active Stage Area */}
        <div className="relative min-h-[320px] p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#0b0914] via-[#0f0c1d] to-[#080610]">
          {/* Simulated Digital Timer on Screen */}
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-[#d4af37]/60 text-amber-300 font-mono text-xs shadow-md">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>المؤقت: {timeLeft}s</span>
            <button
              type="button"
              onClick={() => setTimerRunning(!timerRunning)}
              className="text-[10px] text-cyan-300 underline mr-1 cursor-pointer"
            >
              {timerRunning ? 'إيقاف' : 'تشغيل'}
            </button>
          </div>

          {/* Interactive Simulation Content Based on Active Layer */}
          {activeLayer === 'quiz' ? (
            <div className="w-full max-w-lg mx-auto bg-[#141026] border-2 border-[#d4af37] p-5 rounded-2xl text-right space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-200">
                  سؤال تقييمي تفاعلي (Quiz Slide)
                </span>
                <span className="text-xs text-amber-300 font-mono">درجة: 25 نقطة</span>
              </div>

              <h4 className="text-sm font-bold text-white font-['Tajawal'] leading-relaxed">
                س: ما هو الإجراء الصحيح لتدعيم اللغة العربية وتوجيه النصوص RTL في برنامج Adobe Captivate 2019؟
              </h4>

              <div className="space-y-2">
                {[
                  'أ) تغيير لغة نظام التشغيل Windows فقط دون تعديل البرنامج',
                  'ب) تفعيل خيار دعم اللغة العربية وتنسيق الخطوط من تفضيلات Preferences',
                  'ج) تحويل جميع النصوص إلى صور ثابتة خارج البرنامج',
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={submitted}
                    onClick={() => handleAnswerSubmit(idx)}
                    className={`w-full text-right p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      quizAnswer === idx
                        ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/10 border-[#ffd700] text-amber-200'
                        : 'bg-[#090712] hover:bg-[#1a1530] border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{opt}</span>
                    {quizAnswer === idx && <CheckCircle2 className="w-4 h-4 text-[#ffd700] shrink-0 mr-2" />}
                  </button>
                ))}
              </div>

              {/* Feedback Prompt Result */}
              {feedbackMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 text-right ${
                    feedbackMessage.type === 'success'
                      ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200'
                      : feedbackMessage.type === 'delayed'
                      ? 'bg-purple-950/70 border-purple-400 text-purple-200'
                      : 'bg-red-950/70 border-red-400 text-red-200'
                  }`}
                >
                  {feedbackMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : feedbackMessage.type === 'delayed' ? (
                    <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{feedbackMessage.text}</span>
                </div>
              )}
            </div>
          ) : activeLayer === 'video' ? (
            <div className="w-full max-w-lg mx-auto bg-[#130f24] border border-[#d4af37]/60 p-6 rounded-2xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
                <Video className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h4 className="text-sm font-bold text-white font-['Tajawal']">
                فيديو تفاعلي متزامن مع نقاط التوقف (Interactive Bookmarks)
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                يتم إيقاف العرض تلقائياً عند الدقيقة 00:08 لعرض نشاط فرعي أو استطلاع رأي فوري وفقاً للأهداف السلوكية.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-slate-950 text-xs font-black flex items-center gap-2 mx-auto cursor-pointer shadow-md hover:opacity-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'إيقاف الفيديو مؤقتاً' : 'بدء تشغيل الفيديو التفاعلي'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-4">
                {Array.from({ length: shapesCount }).map((_, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#d4af37]/30 to-purple-900/40 border-2 border-[#d4af37] flex items-center justify-center text-amber-200 text-xs font-bold shadow-lg transform hover:scale-105 transition-transform"
                  >
                    شكل ذكي #{i + 1}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShapesCount((prev) => Math.min(4, prev + 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-bold cursor-pointer"
                >
                  + إضافة شكل ذكي للشريحة
                </button>
                <button
                  type="button"
                  onClick={() => setShapesCount((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold cursor-pointer"
                >
                  - حذف شكل
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Strip (مسار الزمن) */}
        <div className="bg-[#0b0914] p-3 border-t border-[#d4af37]/30 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">مسار الزمن (Timeline):</span>
              <span className="text-white">00:{timelineSec < 10 ? `0${timelineSec}` : timelineSec} ثانية / 00:15</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة الضبط</span>
              </button>
            </div>
          </div>

          {/* Timeline Bar Track */}
          <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${(timelineSec / 15) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
