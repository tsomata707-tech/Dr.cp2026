import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Trophy,
  Flame,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Zap,
  HelpCircle,
  Award,
  Star,
  RefreshCw,
  Volume2,
  VolumeX,
  Compass,
  Lightbulb,
  Check,
  X,
  Play,
  RotateCcw,
  Navigation,
  Home,
  Package,
} from 'lucide-react';
import { CARTOON_AVATARS } from '../data/gameLevelsData';
import { getStudentProgress } from '../utils/gameStorage';
import { getStudentByUsername } from '../data/studentAccounts';
import {
  getPreTestQuestions,
  getPostTestQuestions,
  submitPreTestResult,
  submitPostTestResult,
} from '../data/preTestData';
import { PreTestQuestion, PreTestResult, StudentGameProgress } from '../types';
import { MatchingQuestionTableView } from './MatchingQuestionTableView';

interface PreTestGameViewProps {
  username: string;
  mode?: 'pre' | 'post';
  onFinishPreTest: () => void;
  onBackToInstructions?: () => void;
}

// Retro Web Audio Synthesizer (Engine, Vroom, Box Open, Click, Fanfare)
function playCarSound(type: 'engine' | 'drive' | 'correct' | 'wrong' | 'click' | 'fanfare' | 'box') {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'click' || type === 'box') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'box' ? 440 : 650, ctx.currentTime);
      if (type === 'box') {
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      }
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'engine' || type === 'drive') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'fanfare') {
      const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      fanfare.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    }
  } catch {
    // Audio context may be restricted by browser policy
  }
}

// Interactive Sports Car SVG Component
const RacingCarGraphic: React.FC<{
  isDriving?: boolean;
  scale?: number;
}> = ({ isDriving, scale = 1 }) => {
  return (
    <div
      className={`relative inline-block transition-transform duration-300 ${
        isDriving ? 'animate-bounce' : ''
      }`}
      style={{ transform: `scale(${scale})` }}
    >
      <svg
        width="110"
        height="55"
        viewBox="0 0 110 55"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_4px_12px_rgba(244,63,94,0.45)]"
      >
        <defs>
          <linearGradient id="carBodyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#ef4444" />
            <stop offset="0.5" stopColor="#e11d48" />
            <stop offset="1" stopColor="#be123c" />
          </linearGradient>
          <linearGradient id="windshieldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#67e8f9" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0891b2" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="headlightGlow" cx="0.5" cy="0.5" r="0.5">
            <stop stopColor="#fef08a" />
            <stop offset="1" stopColor="#facc15" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          d="M102 36 L124 24 L124 48 Z"
          fill="url(#headlightGlow)"
          opacity={isDriving ? 0.9 : 0.4}
        />

        {isDriving && (
          <path
            d="M0 38 Q-12 36 -18 38 Q-10 42 0 42 Z"
            fill="#f59e0b"
            className="animate-pulse"
          />
        )}

        <ellipse cx="55" cy="50" rx="46" ry="4" fill="#000000" opacity="0.45" />

        <path d="M4 18 L18 18 L14 26 L2 26 Z" fill="#1e293b" />
        <line x1="8" y1="26" x2="8" y2="34" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="16" y1="26" x2="16" y2="34" stroke="#0f172a" strokeWidth="2.5" />

        <path
          d="M8 35 C12 28 24 20 40 18 C58 16 72 20 86 28 L98 32 C104 34 106 38 104 42 C102 46 96 46 92 46 L14 46 C9 46 6 42 8 35 Z"
          fill="url(#carBodyGrad)"
          stroke="#ffe4e6"
          strokeWidth="1.2"
        />

        <path d="M38 18 L84 28 L82 32 L36 22 Z" fill="#ffffff" opacity="0.3" />
        <path d="M42 18 L88 28 L86 32 L40 22 Z" fill="#ffd700" opacity="0.5" />

        <path
          d="M34 22 C42 16 56 16 66 18 C74 20 78 24 82 28 L32 28 Z"
          fill="url(#windshieldGrad)"
          stroke="#0e7490"
          strokeWidth="1"
        />

        <circle cx="54" cy="22" r="5" fill="#f8fafc" />
        <path d="M52 21 Q56 20 58 23" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />

        <path d="M98 34 C102 34 104 36 104 38 L98 40 Z" fill="#fef08a" />

        <g className={isDriving ? 'origin-[24px_46px] animate-spin' : ''}>
          <circle cx="24" cy="46" r="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <circle cx="24" cy="4.5" fill="#64748b" />
          <circle cx="24" cy="2" fill="#ffd700" />
        </g>

        <g className={isDriving ? 'origin-[84px_46px] animate-spin' : ''}>
          <circle cx="84" cy="46" r="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <circle cx="84" cy="4.5" fill="#64748b" />
          <circle cx="84" cy="2" fill="#ffd700" />
        </g>

        {isDriving && (
          <>
            <circle cx="95" cy="20" r="1.5" fill="#fef08a" />
            <circle cx="102" cy="16" r="2" fill="#67e8f9" />
          </>
        )}
      </svg>
    </div>
  );
};

// 3D Isometric Mystery Box SVG Component
const MysteryBoxGraphic: React.FC<{
  isSelected?: boolean;
  index: number;
}> = ({ isSelected, index }) => {
  return (
    <div
      className={`relative inline-block transition-all duration-300 ${
        isSelected ? 'scale-110 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]' : 'hover:scale-105'
      }`}
    >
      <svg width="72" height="72" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`boxTopGrad-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fbbf24" />
            <stop offset="1" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id={`boxLeftGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#b45309" />
            <stop offset="1" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id={`boxRightGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#92400e" />
            <stop offset="1" stopColor="#451a03" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="40" cy="72" rx="26" ry="6" fill="#000000" opacity="0.5" />

        {/* Box Left Side */}
        <path d="M12 36 L40 52 L40 70 L12 54 Z" fill={`url(#boxLeftGrad-${index})`} stroke="#f59e0b" strokeWidth="1" />

        {/* Box Right Side */}
        <path d="M40 52 L68 36 L68 54 L40 70 Z" fill={`url(#boxRightGrad-${index})`} stroke="#d97706" strokeWidth="1" />

        {/* Box Top Side */}
        <path d="M40 20 L68 36 L40 52 L12 36 Z" fill={`url(#boxTopGrad-${index})`} stroke="#fde68a" strokeWidth="1.2" />

        {/* Ribbon / Tape */}
        <path d="M26 28 L40 36 L40 52 L26 44 Z" fill="#ef4444" opacity="0.85" />
        <path d="M54 28 L40 36 L40 52 L54 44 Z" fill="#dc2626" opacity="0.85" />

        {/* Box Ribbon Bow on Top */}
        <circle cx="40" cy="36" r="4.5" fill="#fef08a" stroke="#b45309" strokeWidth="1" />

        {isSelected && (
          <circle cx="40" cy="36" r="7" stroke="#ffd700" strokeWidth="2" className="animate-ping" />
        )}
      </svg>
    </div>
  );
};

export const PreTestGameView: React.FC<PreTestGameViewProps> = ({
  username,
  mode = 'pre',
  onFinishPreTest,
  onBackToInstructions,
}) => {
  // Load questions based on mode
  const [questions, setQuestions] = useState<PreTestQuestion[]>(() => {
    return mode === 'post' ? getPostTestQuestions() : getPreTestQuestions();
  });

  // Keep questions synced in real-time if updated by admin via Firebase
  useEffect(() => {
    const handleUpdate = () => {
      setQuestions(mode === 'post' ? getPostTestQuestions() : getPreTestQuestions());
    };
    const eventName = mode === 'post' ? 'posttest-questions-updated' : 'pretest-questions-updated';
    window.addEventListener(eventName, handleUpdate);
    return () => window.removeEventListener(eventName, handleUpdate);
  }, [mode]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(`cp_${mode}_index_${username}`);
      return saved ? parseInt(saved, 10) : 0;
    } catch { return 0; }
  });
  const [chosenAnswers, setChosenAnswers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`cp_${mode}_answers_${username}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null);

  // Dedicated Game Mode & Intro
  const [gameStarted, setGameStarted] = useState(() => {
    try {
      const saved = localStorage.getItem(`cp_${mode}_started_${username}`);
      return saved === 'true';
    } catch { return false; }
  });

  // Effect hooks to persist state
  useEffect(() => {
    localStorage.setItem(`cp_${mode}_index_${username}`, currentIndex.toString());
  }, [currentIndex, username, mode]);
  useEffect(() => {
    localStorage.setItem(`cp_${mode}_answers_${username}`, JSON.stringify(chosenAnswers));
  }, [chosenAnswers, username, mode]);
  useEffect(() => {
    localStorage.setItem(`cp_${mode}_started_${username}`, gameStarted.toString());
  }, [gameStarted, username, mode]);

  // Interaction State
  const [isDrivingToStation, setIsDrivingToStation] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<'idle' | 'evaluating' | 'selected'>('idle');

  // Dragging connection state (Pointer & Touch supported)
  const [isDraggingCar, setIsDraggingCar] = useState(false);
  const [hoveredStationIndex, setHoveredStationIndex] = useState<number | null>(null);

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Gamification metrics
  const [isFinished, setIsFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<PreTestResult | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const carDockRef = useRef<HTMLDivElement>(null);
  const stationsContainerRef = useRef<HTMLDivElement>(null);

  // Determine whether current question belongs to Game 1 (Car, 1-25) or Game 2 (Boxes, 26+)
  const isBoxGame = currentIndex >= 25;

  // Always scroll to top on mount, question change, or game start
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentIndex, isFinished, gameStarted]);

  // Current Question
  const currentQ = questions[currentIndex] || questions[0];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Check if current question is a matching/table question (Questions 4 and 8)
  const isMatchingQuestion =
    currentQ.questionType === 'matching' ||
    (Boolean(currentQ.matchingPairs) && (currentQ.matchingPairs?.length ?? 0) > 0) ||
    currentQ.id === 'pt-4' ||
    currentQ.id === 'pt-8' ||
    currentIndex === 3 ||
    currentIndex === 7;

  // Play sound wrapper
  const triggerSound = (type: 'engine' | 'drive' | 'correct' | 'wrong' | 'click' | 'fanfare' | 'box') => {
    if (soundEnabled) {
      playCarSound(type);
    }
  };

  // Handle driving the car to a destination answer station (Game 1)
  const handleDriveCarToStation = (stationIdx: number) => {
    if (answeredState !== 'idle' || isDrivingToStation !== null) return;

    setSelectedStationIndex(stationIdx);
    setIsDrivingToStation(stationIdx);
    triggerSound('drive');

    // Simulate car acceleration and travel
    setTimeout(() => {
      setIsDrivingToStation(null);
      chooseAnswerWithoutRevealing(stationIdx);
    }, 400);
  };

  // Handle choosing a box (Game 2)
  const handleSelectBox = (boxIdx: number) => {
    if (answeredState !== 'idle') return;
    setSelectedStationIndex(boxIdx);
    triggerSound('box');
    chooseAnswerWithoutRevealing(boxIdx);
  };

  // Record answer neutral: NO correct/wrong shown to student. Score goes strictly to Admin!
  const chooseAnswerWithoutRevealing = (stationIdx: number) => {
    setChosenAnswers((prev) => ({ ...prev, [currentQ.id]: stationIdx }));
    setAnsweredState('selected');
    triggerSound('click');
  };

  // Pointer drag move & drop handling for hand-steering (Touch & Mouse)
  const handlePointerDownCar = (e: React.PointerEvent) => {
    if (answeredState !== 'idle' || isBoxGame) return;
    setIsDraggingCar(true);
    triggerSound('engine');
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveCar = (e: React.PointerEvent) => {
    if (!isDraggingCar || isBoxGame) return;

    const stations = document.querySelectorAll('[data-station-index]');
    let foundStationIndex: number | null = null;
    stations.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        foundStationIndex = Number(el.getAttribute('data-station-index'));
      }
    });
    setHoveredStationIndex(foundStationIndex);
  };

  const handlePointerUpCar = (e: React.PointerEvent) => {
    if (!isDraggingCar || isBoxGame) return;
    setIsDraggingCar(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (hoveredStationIndex !== null && answeredState === 'idle') {
      handleDriveCarToStation(hoveredStationIndex);
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    triggerSound('click');
    setAnsweredState('idle');
    setSelectedStationIndex(null);
    setIsDrivingToStation(null);
    setHoveredStationIndex(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishGame();
    }
  };

  // Finish Game & Record Score
  const finishGame = () => {
    const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    let submission;
    if (mode === 'post') {
      submission = submitPostTestResult(username, chosenAnswers, totalTime);
    } else {
      submission = submitPreTestResult(username, chosenAnswers, totalTime);
    }
    
    // Clear persistence
    localStorage.removeItem(`cp_${mode}_index_${username}`);
    localStorage.removeItem(`cp_${mode}_answers_${username}`);
    localStorage.removeItem(`cp_${mode}_started_${username}`);

    setFinalResult(submission.result);
    setIsFinished(true);
    triggerSound('fanfare');
  };

  // Header Titles
  const testLabel = mode === 'post' ? 'الاختبار البعدي' : 'الاختبار القبلي';
  const gameTitle = isBoxGame
    ? `📦 لعبة اختيار الصناديق: ${testLabel}`
    : `🏎️ لعبة توصيل الأسئلة بالسيارة: ${testLabel}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Cairo'] pb-16 relative overflow-hidden select-none">
      {/* Dynamic Background Asphalt / Neon Tracks */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 pt-6">
        {/* Top Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border-2 border-slate-800 backdrop-blur-md shadow-2xl mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
              isBoxGame
                ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-amber-900/40'
                : 'bg-gradient-to-tr from-rose-600 to-amber-500 shadow-rose-900/40 animate-pulse'
            }`}>
              <span className="text-2xl">{isBoxGame ? '📦' : '🏎️'}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
                  {gameTitle}
                </h1>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  isBoxGame
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {isBoxGame ? 'اللعبة 2: الصناديق' : 'اللعبة 1: سيارة السباق'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Return to Home & Audio Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onBackToInstructions && (
              <button
                type="button"
                onClick={onBackToInstructions}
                id="btn-pretest-back-to-home"
                className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-200 hover:text-[#ffd700] text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer shadow-md"
                title="العودة للرئيسية (صفحة الطالب وبياناته)"
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span>العودة للرئيسية 🏠</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تفعيل الصوت'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </header>

        {/* Progress Tracker */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">
              السؤال {currentIndex + 1} من {questions.length}
            </span>
            <span className="text-slate-400 font-mono">
              {progressPercent}%
            </span>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-md ${
                isBoxGame
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-amber-500/50'
                  : 'bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 shadow-rose-500/50'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* MAIN GAME ARENA */}
        {!gameStarted ? (
          /* DEDICATED GAME LAUNCHER */
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#0b0f19] to-black border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center relative overflow-hidden space-y-6">
            <div className="flex justify-center items-center gap-4 py-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-xl flex items-center gap-4">
                <RacingCarGraphic scale={1.1} />
                <span className="text-2xl text-amber-400 font-black">+</span>
                <MysteryBoxGraphic isSelected={true} index={0} />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerSound('engine');
                  setGameStarted(true);
                }}
                className="px-8 sm:px-12 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-base transition-all transform hover:scale-105 shadow-2xl shadow-rose-900/50 flex items-center gap-3 mx-auto cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>انطلاق وبدء الأسئلة الآن!</span>
              </button>
            </div>
          </div>
        ) : !isFinished ? (
          isMatchingQuestion ? (
            <MatchingQuestionTableView
              key={currentQ.id}
              question={currentQ}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              soundEnabled={soundEnabled}
              onBackToHome={onBackToInstructions}
              onFinishMatching={(isCorrectAll) => {
                setChosenAnswers((prev) => ({
                  ...prev,
                  [currentQ.id]: isCorrectAll ? (currentQ.correctIndex ?? 0) : 999,
                }));
                handleNextQuestion();
              }}
            />
          ) : (
            <div className="space-y-6">
            {/* THE QUESTION BOX */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 border-slate-700/80 shadow-[0_0_40px_rgba(30,41,59,0.5)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-xs">
                  <span>السؤال #{currentIndex + 1}</span>
                </span>
                <span className="text-xs text-amber-300 font-bold bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/40">
                  {isBoxGame ? '📦 اختر الصندوق الصحيح' : '🏎️ وجّه السيارة نحو المحطة'}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-relaxed text-right font-['Tajawal'] tracking-wide">
                {currentQ.question}
              </h2>

              {/* Question Image (if attached) */}
              {currentQ.imageUrl && (
                <div className="my-4 flex justify-center items-center">
                  <div className="relative max-w-full rounded-2xl overflow-hidden border-2 border-amber-400/50 bg-[#070914] shadow-2xl p-1.5">
                    <img
                      src={currentQ.imageUrl}
                      alt="توضيح السؤال"
                      className="max-h-56 sm:max-h-80 w-auto max-w-full rounded-xl object-contain shadow-md mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* In Game 1: The interactive car at the end of the question */}
              {!isBoxGame && (
                <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-black text-slate-300">
                      سيارة السباق جاهزة للتوجيه:
                    </span>
                  </div>

                  <div
                    ref={carDockRef}
                    draggable={answeredState === 'idle'}
                    onPointerDown={handlePointerDownCar}
                    onPointerMove={handlePointerMoveCar}
                    onPointerUp={handlePointerUpCar}
                    className={`relative p-2.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 transition-all cursor-grab active:cursor-grabbing touch-none select-none ${
                      isDraggingCar
                        ? 'border-amber-400 scale-105 shadow-[0_0_25px_rgba(251,191,36,0.6)]'
                        : 'border-rose-500/60 hover:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RacingCarGraphic isDriving={isDrivingToStation !== null || isDraggingCar} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ANSWER OPTIONS: GAME 1 (STATIONS) OR GAME 2 (BOXES 📦) */}
            {!isBoxGame ? (
              /* GAME 1: ANSWER STATIONS FOR RACING CAR (QUESTIONS 1-25) */
              <div ref={stationsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedStationIndex === optIdx;
                  const letter = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][optIdx] || optIdx + 1;
                  const optImage = currentQ.optionImages?.[optIdx];

                  let stationBg = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-850';
                  let bayBadge = 'bg-slate-800 text-slate-300 border-slate-700';

                  if (hoveredStationIndex === optIdx) {
                    stationBg = 'bg-amber-950/60 border-amber-400 text-white shadow-[0_0_25px_rgba(251,191,36,0.5)] scale-[1.02] ring-2 ring-amber-400/50';
                  }

                  if (answeredState !== 'idle' && isSelected) {
                    // Neutral selection without revealing correct or wrong!
                    stationBg = 'bg-sky-950/80 border-sky-400 text-white shadow-[0_0_25px_rgba(56,189,248,0.4)] ring-2 ring-sky-400/50';
                    bayBadge = 'bg-sky-400 text-slate-950 border-sky-300 font-bold';
                  }

                  return (
                    <div
                      key={optIdx}
                      data-station-index={optIdx}
                      onClick={() => handleDriveCarToStation(optIdx)}
                      className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[110px] ${stationBg}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center border shadow-sm ${bayBadge}`}>
                            {letter}
                          </span>
                          <span className="text-[11px] font-black text-slate-400">
                            محطة رقم {optIdx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-[10px] font-bold text-slate-300">
                          <span>🅿️ موقف</span>
                        </div>
                      </div>

                      {/* Optional Answer Image - Balanced & Layout Preserving */}
                      {optImage && (
                        <div className="w-full h-32 sm:h-40 mb-3 rounded-xl overflow-hidden border border-slate-700/80 bg-black/60 p-2 flex justify-center items-center shadow-inner group-hover:border-amber-400/50 transition-colors">
                          <img
                            src={optImage}
                            alt={`صورة الخيار ${letter}`}
                            className="max-h-full max-w-full object-contain rounded-lg hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <p className="text-sm font-bold text-right leading-relaxed flex-1 font-['Cairo']">
                        {option}
                      </p>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم اختيار هذه المحطة</span>
                          </span>
                          <RacingCarGraphic scale={0.7} isDriving={isDrivingToStation === optIdx} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* GAME 2: MYSTERY BOXES 📦 (QUESTIONS 26+) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedStationIndex === optIdx;
                  const boxNumber = optIdx + 1;
                  const optImage = currentQ.optionImages?.[optIdx];

                  let boxCardStyle = 'bg-gradient-to-b from-[#141022] to-[#0c0916] border-slate-800 hover:border-amber-500/60 text-slate-200';
                  if (isSelected) {
                    boxCardStyle = 'bg-gradient-to-b from-[#241738] via-[#1a122e] to-[#120a22] border-amber-400 text-white ring-2 ring-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.35)]';
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectBox(optIdx)}
                      className={`p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[140px] relative overflow-hidden group ${boxCardStyle}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-black">
                            📦 الصندوق رقم {boxNumber}
                          </span>
                        </div>

                        <div className="shrink-0">
                          <MysteryBoxGraphic isSelected={isSelected} index={optIdx} />
                        </div>
                      </div>

                      {/* Optional Answer Image - Balanced & Layout Preserving */}
                      {optImage && (
                        <div className="w-full h-32 sm:h-40 mb-3 rounded-xl overflow-hidden border border-amber-500/40 bg-black/70 p-2 flex justify-center items-center shadow-inner group-hover:border-amber-400/70 transition-colors">
                          <img
                            src={optImage}
                            alt={`صورة الخيار رقم ${boxNumber}`}
                            className="max-h-full max-w-full object-contain rounded-lg hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Answer text displayed clearly on the box */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
                        <span className="text-[11px] font-bold text-amber-300/80 block mb-1">
                          الإجابة داخل الصندوق:
                        </span>
                        <p className="text-sm font-black text-white leading-relaxed">
                          {option}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-amber-300 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-amber-400" />
                            <span>تم اختيار هذا الصندوق</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">Box #{boxNumber}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* NEUTRAL SELECTION BANNER (Result hidden from student, stored for Admin only) */}
            {answeredState === 'selected' && (
              <div className="p-5 rounded-2xl bg-slate-900/95 border border-sky-500/50 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-3 text-right">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center font-black shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-white">
                      تم تسجيل وتثبيت اختيارك بنجاح
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      استجابتك مسجلة في لوحة المشرف وأستاذ المقرر. اضغط للمتابعة.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-900/30 cursor-pointer shrink-0"
                >
                  <span>
                    {currentIndex + 1 < questions.length
                      ? 'الانتقال إلى السؤال التالي ⬅️'
                      : 'إنهاء الاختبار وتسليم الإجابات 📋'}
                  </span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}
            </div>
          )
        ) : (
          /* COMPLETION SCREEN: Strict academic notice, score is private to Admin */
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-sky-500/50 text-center shadow-[0_0_50px_rgba(56,189,248,0.2)] max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-sky-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                تم تسليم {testLabel} بنجاح 📋
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 font-['Tajawal']">
                شكراً لك! تم استلام جميع إجاباتك كاملة
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                لقد أتممت الاختبار بنجاح وتم تسجيل كافة إجاباتك الاستكشافية في منظومة التعلم.
              </p>
            </div>

            {/* Academic Notice: Scores in Admin panel only */}
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-right space-y-2">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
                <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                <span>تنبيه نظام القياس والتقويم:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                درجات ونتائج الاختبارات تُحسب وتُسجل بدقة في لوحة تحكم المشرف وأستاذ المقرر للمتابعة الإحصائية وقياس أثر التعلم دون إظهارها للطالب في هذه المرحلة.
              </p>
            </div>

            <button
              type="button"
              onClick={onFinishPreTest}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm transition shadow-xl shadow-sky-900/40 cursor-pointer"
            >
              {mode === 'pre'
                ? 'الانتقال إلى المستويات والمراحل التعليمية (المستوى 1) 🚀'
                : 'استعراض لوحة الشرف والإنجازات 🏆'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
