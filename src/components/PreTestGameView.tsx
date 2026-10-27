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
  Eye,
  Clock,
  BookOpen,
} from 'lucide-react';
import { CARTOON_AVATARS } from '../data/gameLevelsData';
import { getStudentProgress } from '../utils/gameStorage';
import { getStudentByUsername, getGroupByUsername } from '../data/studentAccounts';
import {
  getPreTestQuestions,
  getPostTestQuestions,
  submitPreTestResult,
  submitPostTestResult,
} from '../data/preTestData';
import { PreTestQuestion, PreTestResult, StudentGameProgress, TestAccessSession } from '../types';
import { MatchingQuestionTableView } from './MatchingQuestionTableView';
import {
  recordTestEntry,
  recordTestExit,
  markTestCompletedInAudit,
} from '../utils/testAccessAuditStorage';

interface PreTestGameViewProps {
  username: string;
  mode?: 'pre' | 'post';
  onFinishPreTest: () => void;
  onBackToInstructions?: () => void;
}

// Retro Web Audio Synthesizer (Engine, Vroom, Box Open, Click, Fanfare, Alarm Siren)
function playCarSound(type: 'engine' | 'drive' | 'correct' | 'wrong' | 'click' | 'fanfare' | 'box' | 'alarm') {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'alarm') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'click' || type === 'box') {
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
  const isAdmin = username.trim().toLowerCase() === 'admin';
  const groupMeta = getGroupByUsername(username);
  const isDeferredGroup = groupMeta?.code === 'G2' || groupMeta?.code === 'G4' || groupMeta?.feedbackMode === 'مرجئة';
  const isImmediate = isAdmin ? true : !isDeferredGroup;
  // Load questions based on mode (Guaranteed fallback: Post-test inherits Pre-test questions)
  const [questions, setQuestions] = useState<PreTestQuestion[]>(() => {
    const list = mode === 'post' ? getPostTestQuestions() : getPreTestQuestions();
    if (list.length > 0) return list;
    return getPreTestQuestions();
  });

  // Keep questions synced in real-time if updated by admin via Firebase
  useEffect(() => {
    const handleUpdate = () => {
      const list = mode === 'post' ? getPostTestQuestions() : getPreTestQuestions();
      setQuestions(list.length > 0 ? list : getPreTestQuestions());
    };
    const eventName = mode === 'post' ? 'posttest-questions-updated' : 'pretest-questions-updated';
    window.addEventListener(eventName, handleUpdate);
    window.addEventListener('pretest-questions-updated', handleUpdate);
    return () => {
      window.removeEventListener(eventName, handleUpdate);
      window.removeEventListener('pretest-questions-updated', handleUpdate);
    };
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

  // Student account and session date/time
  const studentAccount = useMemo(() => getStudentByUsername(username), [username]);
  const studentFullName =
    studentAccount?.fullName ||
    (username.trim().toLowerCase() === 'admin' ? 'المشرف العام (Admin)' : username);
  const sessionStartTimeStr = useMemo(() => {
    const now = new Date();
    return now.toLocaleString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  // 7-Second Welcome Modal Overlay
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);
  const [welcomeSeconds, setWelcomeSeconds] = useState<number>(7);

  // 60-Minute Digital Clock Timer (3600 seconds)
  const [testTimerSeconds, setTestTimerSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`cp_${mode}_timer_${username}`);
      return saved ? parseInt(saved, 10) : 3600;
    } catch {
      return 3600;
    }
  });

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

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Gamification metrics
  const [isFinished, setIsFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<PreTestResult | null>(null);

  // Tab/Window Visibility state to pause/resume timer when student leaves/returns to page
  const [isTabActive, setIsTabActive] = useState<boolean>(
    () => (typeof document !== 'undefined' ? !document.hidden : true)
  );

  // Test Entry Access Session Tracking (تسجيل كل دخول وخروج وحساب التردد والتفسير بالوقت والتاريخ)
  const testAccessSessionRef = useRef<TestAccessSession | null>(null);
  const testIdKey = mode === 'post' ? 'posttest' : 'pretest';
  const testNameLabel = mode === 'post' ? 'الاختبار البعدي (Post-Test)' : 'الاختبار القبلي (Pre-Test)';

  useEffect(() => {
    // Record real entry on test mount
    const sess = recordTestEntry(username, testIdKey, testNameLabel);
    testAccessSessionRef.current = sess;

    return () => {
      // Record exit timestamp on unmount
      if (testAccessSessionRef.current) {
        recordTestExit(testAccessSessionRef.current.id);
      }
    };
  }, [username, testIdKey, testNameLabel]);

  // Record exit/pause when student leaves the tab/window, and record re-entry when returning
  useEffect(() => {
    if (!isTabActive && testAccessSessionRef.current) {
      recordTestExit(testAccessSessionRef.current.id);
    } else if (isTabActive && testAccessSessionRef.current?.leftAt && !isFinished) {
      // Student returned to page after leaving - create next visit entry
      const reEntrySession = recordTestEntry(username, testIdKey, testNameLabel);
      testAccessSessionRef.current = reEntrySession;
    }
  }, [isTabActive, isFinished, username, testIdKey, testNameLabel]);

  // Warning message state if student attempts to finish before solving all questions
  const [unansweredWarning, setUnansweredWarning] = useState<string | null>(null);

  useEffect(() => {
    if (unansweredWarning) {
      const unanswered = questions.filter((q) => chosenAnswers[q.id] === undefined);
      if (unanswered.length === 0) {
        setUnansweredWarning(null);
      }
    }
  }, [chosenAnswers, questions, unansweredWarning]);

  // Welcome popup 7-second auto-close timer
  useEffect(() => {
    if (!showWelcomeModal) return;
    if (welcomeSeconds <= 0) {
      setShowWelcomeModal(false);
      setGameStarted(true);
      return;
    }
    const timer = setInterval(() => {
      setWelcomeSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showWelcomeModal, welcomeSeconds]);

  // 60-Minute test countdown timer effect (Alarm siren at <= 15s)
  // Automatically PAUSES when student exits site/tab (isTabActive === false)
  useEffect(() => {
    if (showWelcomeModal || !gameStarted || isFinished || !isTabActive) return;
    localStorage.setItem(`cp_${mode}_timer_${username}`, testTimerSeconds.toString());

    if (testTimerSeconds <= 0) {
      finishGame();
      return;
    }

    if (testTimerSeconds <= 15 && soundEnabled) {
      playCarSound('alarm');
    }

    const interval = setInterval(() => {
      setTestTimerSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showWelcomeModal, gameStarted, isFinished, isTabActive, testTimerSeconds, username, mode, soundEnabled]);

  // Digital clock formatter (MM:SS)
  const formatDigitalClock = (totalSecs: number) => {
    const m = Math.floor(Math.max(0, totalSecs) / 60);
    const s = Math.max(0, totalSecs) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Interaction State
  const [isDrivingToStation, setIsDrivingToStation] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<'idle' | 'evaluating' | 'selected'>('idle');

  // Dragging connection state (Pointer & Touch supported)
  const [isDraggingCar, setIsDraggingCar] = useState(false);
  const [hoveredStationIndex, setHoveredStationIndex] = useState<number | null>(null);

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
  const triggerSound = (type: 'engine' | 'drive' | 'correct' | 'wrong' | 'click' | 'fanfare' | 'box' | 'alarm') => {
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

  // Record answer and evaluate immediate feedback for G1, G3 & Admin
  const chooseAnswerWithoutRevealing = (stationIdx: number) => {
    setChosenAnswers((prev) => ({ ...prev, [currentQ.id]: stationIdx }));

    // If immediate feedback mode (G1: تنافسي فوري, G3: تعاوني فوري, or Admin), show feedback per question in both Pre-Test and Post-Test
    if (isImmediate) {
      setAnsweredState('evaluating');
      triggerSound(stationIdx === currentQ.correctIndex ? 'correct' : 'wrong');

      // Delay to show feedback before proceeding
      setTimeout(() => {
        setAnsweredState('selected');
      }, 800);
    } else {
      // In delayed feedback groups (G2, G4), no immediate feedback per question
      setAnsweredState('selected');
      triggerSound('click');
    }
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

  // Attempt to finish test - verifies all questions are answered first
  const handleAttemptFinish = () => {
    const unanswered = questions.filter((q) => chosenAnswers[q.id] === undefined);
    if (unanswered.length > 0) {
      triggerSound('wrong');
      const firstUnansweredIdx = questions.findIndex((q) => chosenAnswers[q.id] === undefined);
      const msg = `⚠️ لا يمكنك إنهاء الاختبار وتسليم الإجابات الآن! يجب الإجابة على جميع الأسئلة أولاً (متبقي ${unanswered.length} سؤال بدون إجابة).`;
      setUnansweredWarning(msg);
      if (firstUnansweredIdx !== -1) {
        setCurrentIndex(firstUnansweredIdx);
        setAnsweredState('idle');
        setSelectedStationIndex(null);
        setIsDrivingToStation(null);
        setHoveredStationIndex(null);
      }
      return;
    }

    setUnansweredWarning(null);
    finishGame();
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
      handleAttemptFinish();
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
    localStorage.removeItem(`cp_${mode}_timer_${username}`);

    // Mark completed in audit with final visit interpretation
    markTestCompletedInAudit(username, testIdKey);

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
    <div className="min-h-screen bg-sky-50 text-slate-900 font-['Cairo'] pb-16 relative overflow-hidden select-none">
      {/* 7-SECOND WELCOME MODAL OVERLAY */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 font-['Cairo']">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-black border-2 border-sky-400/70 shadow-[0_0_50px_rgba(56,189,248,0.3)] rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300 shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black font-['Tajawal'] text-white">
                    أهلاً بك في {testLabel} 👋
                  </h3>
                  <p className="text-xs text-sky-300 font-bold">
                    منصة الاختبارات والأنشطة التفاعلية
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-amber-400 text-base shadow-inner">
                {welcomeSeconds}s
              </div>
            </div>

            <div className="space-y-3.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-right">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400 font-bold">اسم الطالب:</span>
                <span className="text-emerald-300 font-black text-sm sm:text-base">{studentFullName}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400 font-bold">اسم المستخدم (اليوزر):</span>
                <span className="text-amber-300 font-mono font-bold">{username}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400 font-bold">تاريخ ووقت البدء:</span>
                <span className="text-sky-300 font-bold text-xs">{sessionStartTimeStr}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-bold text-xs">مدة الاختبار المقررة:</span>
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-xs">
                  ⏱️ 60 دقيقة
                </span>
              </div>
            </div>

            {/* 7-Second Countdown Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                <span>سيتم إغلاق النافذة وبدء التايمر خلال {welcomeSeconds} ثوانٍ...</span>
                <span className="text-amber-400 font-mono">{welcomeSeconds}/7s</span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${(welcomeSeconds / 7) * 100}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerSound('click');
                setShowWelcomeModal(false);
                setGameStarted(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm transition-all transform hover:scale-[1.02] shadow-xl shadow-sky-900/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>بدء الاختبار الآن (الانتقال المباشر)</span>
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Background Light Sky & White Gaming Tracks */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-cyan-50 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c715_1px,transparent_1px),linear-gradient(to_bottom,#0284c715_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 pt-6">
        {/* Top Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 border-2 border-sky-300 backdrop-blur-md shadow-lg mb-6">
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
                <h1 className="text-base sm:text-lg font-black text-sky-950 font-['Tajawal']">
                  {gameTitle}
                </h1>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full border bg-slate-200 border-slate-300 text-slate-900 font-['Cairo']">
                  {isBoxGame ? 'اللعبة 2: الصناديق' : 'اللعبة 1: سيارة السباق'}
                </span>
              </div>
            </div>
          </div>

          {/* 60-Minute Digital Clock Badge in Header */}
          <div
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border font-black text-sm transition-all ${
              !isTabActive
                ? 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-2 ring-amber-500/50'
                : testTimerSeconds <= 15
                ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)] ring-2 ring-rose-500/50'
                : 'bg-slate-900 text-amber-300 border-amber-500/40 shadow-inner'
            }`}
          >
            <Clock className={`w-4 h-4 ${!isTabActive ? 'text-amber-400 animate-pulse' : testTimerSeconds <= 15 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 leading-none">
                {!isTabActive ? '⏸️ متوقف (خارج الصفحة)' : 'زمن الاختبار'}
              </span>
              <span className="font-mono text-base font-bold tracking-wider leading-tight">
                {formatDigitalClock(testTimerSeconds)}
              </span>
            </div>
          </div>

          {/* Controls: Return to Home & Audio Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onBackToInstructions && (
              <button
                type="button"
                onClick={onBackToInstructions}
                id="btn-pretest-back-to-home"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black font-['Cairo'] border border-slate-300 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                title="العودة للرئيسية (صفحة الطالب وبياناته)"
              >
                <Home className="w-4 h-4 text-slate-700" />
                <span>العودة للرئيسية 🏠</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-800 hover:text-slate-950 hover:bg-slate-200 border border-slate-300 transition cursor-pointer shadow-sm"
              title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تفعيل الصوت'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </header>

        {/* Admin Read-Only Notice Banner */}
        {username.trim().toLowerCase() === 'admin' && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-2 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center gap-3 text-xs sm:text-sm font-['Cairo'] text-emerald-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shrink-0 shadow-inner">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-black text-emerald-300 font-['Tajawal'] text-sm sm:text-base">
                وضع استعراض المشرف (حساب للقراءة فقط 👁️):
              </span>
              <p className="text-xs text-slate-300 mt-0.5">
                يمكنك تجربة وحل أسئلة {testLabel} بحرية، ولن يتم احتساب أو اعتماد أي إجابات أو تسجيل درجات في قاعدة البيانات أو لوحات الشرف.
              </p>
            </div>
          </div>
        )}

        {/* Unanswered Questions Warning Banner */}
        {unansweredWarning && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/95 border-2 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.5)] flex items-center justify-between gap-3 text-white font-['Cairo'] animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h4 className="font-black text-rose-200 text-xs sm:text-sm font-['Tajawal']">
                  {unansweredWarning}
                </h4>
                <p className="text-[11px] text-rose-300 mt-0.5">
                  تم التوجيه تلقائياً لأول سؤال غير مجاب لتتمكن من حله وإتمام الاختبار، والتايمر مستمر في العد.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUnansweredWarning(null)}
              className="px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs font-black border border-rose-400 transition shrink-0 cursor-pointer"
            >
              إغلاق ✕
            </button>
          </div>
        )}

        {/* Progress Tracker & Question Navigation */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-black">
                السؤال {currentIndex + 1} من {questions.length}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-black">
                تمت إجابة {Object.keys(chosenAnswers).length} من {questions.length} سؤال
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex((prev) => prev - 1);
                    setAnsweredState('idle');
                    setSelectedStationIndex(null);
                    setIsDrivingToStation(null);
                    setHoveredStationIndex(null);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                title="السؤال السابق"
              >
                ◀️ السابق
              </button>
              <button
                type="button"
                disabled={currentIndex + 1 >= questions.length}
                onClick={() => {
                  if (currentIndex + 1 < questions.length) {
                    setCurrentIndex((prev) => prev + 1);
                    setAnsweredState('idle');
                    setSelectedStationIndex(null);
                    setIsDrivingToStation(null);
                    setHoveredStationIndex(null);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                title="السؤال التالي"
              >
                التالي ▶️
              </button>
              <select
                value={currentIndex}
                onChange={(e) => {
                  setCurrentIndex(Number(e.target.value));
                  setAnsweredState('idle');
                  setSelectedStationIndex(null);
                  setIsDrivingToStation(null);
                  setHoveredStationIndex(null);
                }}
                className="bg-slate-800 border border-amber-500/40 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold cursor-pointer"
                title="الانتقال المباشر لأي سؤال"
              >
                {questions.map((q, idx) => {
                  const isDone = chosenAnswers[q.id] !== undefined;
                  return (
                    <option key={q.id} value={idx}>
                      {isDone ? '✓ ' : '• '} سؤال {idx + 1}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={handleAttemptFinish}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-sm cursor-pointer border border-emerald-400"
                title="إنهاء الاختبار وتسليم كافة الإجابات"
              >
                إنهاء الاختبار 📋
              </button>
            </div>

            <span className="text-slate-400">
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
              mode={mode}
              isImmediate={isImmediate}
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
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/60 text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-sm"
                      title="تخطي السؤال دون إجابة (وضع المشرف)"
                    >
                      <span>تخطي السؤال ⏩</span>
                    </button>
                  )}
                  <span className="text-xs text-slate-200 font-bold bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700">
                    {isBoxGame ? '📦 اختر الصندوق الصحيح' : '🏎️ وجّه السيارة نحو المحطة'}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-relaxed text-right font-['Tajawal'] tracking-wide whitespace-pre-line">
                {(() => {
                  const qText = currentQ.question || '';
                  const questionNumber = currentIndex + 1;
                  const isStackedLayout =
                    currentQ.layout === 'stacked' ||
                    [2, 6, 13, 51].includes(questionNumber) ||
                    [2, 6, 13, 51].some((num) => currentQ.id === `pt-${num}` || currentQ.id === `post-${num}` || currentQ.id === `${num}`);

                  if (!isStackedLayout) return qText;

                  return qText
                    .replace(/\s*\|\s*/g, '\n')
                    .replace(/\s+(أ\.)/g, '\n$1')
                    .replace(/\s+(ب\.)/g, '\n$1')
                    .replace(/\s+(ج\.)/g, '\n$1')
                    .replace(/\s+(د\.)/g, '\n$1');
                })()}
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
              {/* Bottom of Question Card: Score Indicator (for immediate feedback mode in G1, G3 & Admin) */}
              {isImmediate && (
                <div className={`mt-5 pt-3.5 border-t-2 flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-2xl transition-all ${
                  answeredState === 'selected' || answeredState === 'evaluating'
                    ? (chosenAnswers[currentQ.id] === currentQ.correctIndex
                        ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200'
                        : 'bg-rose-950/80 border-rose-500/70 text-rose-200')
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {answeredState === 'selected' || answeredState === 'evaluating' ? (
                      chosenAnswers[currentQ.id] === currentQ.correctIndex ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-xs sm:text-sm font-black text-emerald-300">
                            إجابة صحيحة! أحسنت ✓
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-rose-400" />
                          <span className="text-xs sm:text-sm font-black text-rose-300">
                            إجابة خاطئة ✗
                          </span>
                        </>
                      )
                    ) : (
                      <>
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-slate-400 font-bold">
                          حدد إجابتك لاحتساب درجة السؤال
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-xs font-bold text-slate-300">النتيجة:</span>
                    <span className={`px-2.5 py-0.5 rounded-lg  font-black text-sm border shadow-sm ${
                      (answeredState === 'selected' || answeredState === 'evaluating') && chosenAnswers[currentQ.id] === currentQ.correctIndex
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                        : 'bg-slate-900 text-amber-300 border-slate-700'
                    }`}>
                      {(answeredState === 'selected' || answeredState === 'evaluating') && chosenAnswers[currentQ.id] === currentQ.correctIndex
                        ? '1/1'
                        : '0/1'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ANSWER OPTIONS: GAME 1 (STATIONS) OR GAME 2 (BOXES 📦) */}
            {(() => {
              const questionNumber = currentIndex + 1;
              const isStackedLayout =
                currentQ.layout === 'stacked' ||
                [2, 6, 13, 51].includes(questionNumber) ||
                [2, 6, 13, 51].some((num) => {
                  if (!currentQ?.id) return false;
                  return (
                    currentQ.id === `pt-${num}` ||
                    currentQ.id === `post-${num}` ||
                    currentQ.id === `${num}` ||
                    currentQ.id === `q-${num}`
                  );
                });

              return !isBoxGame ? (
                /* GAME 1: ANSWER STATIONS FOR RACING CAR (QUESTIONS 1-25) */
                <div
                  ref={stationsContainerRef}
                  className={
                    isStackedLayout
                      ? "grid grid-cols-1 gap-3.5 sm:gap-4 w-full"
                      : "grid grid-cols-1 sm:grid-cols-2 gap-4"
                  }
                >
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = selectedStationIndex === optIdx;
                    const letter = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][optIdx] || optIdx + 1;
                    const optImage = currentQ.optionImages?.[optIdx];

                    let stationBg = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-850';
                    let bayBadge = 'bg-slate-800 text-slate-300 border-slate-700';

                    if (hoveredStationIndex === optIdx) {
                      stationBg = 'bg-amber-950/60 border-amber-400 text-white shadow-[0_0_25px_rgba(251,191,36,0.5)] scale-[1.01] ring-2 ring-amber-400/50';
                    }

                    if (answeredState !== 'idle' && isSelected) {
                      if (isImmediate) {
                        const isCorrect = optIdx === currentQ.correctIndex;
                        if (isCorrect) {
                          stationBg = 'bg-emerald-950/90 border-emerald-400 text-white ring-2 ring-emerald-400/60 shadow-[0_0_30px_rgba(16,185,129,0.4)]';
                          bayBadge = 'bg-emerald-400 text-slate-950 border-emerald-300 font-bold';
                        } else {
                          stationBg = 'bg-rose-950/90 border-rose-500 text-white ring-2 ring-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.4)]';
                          bayBadge = 'bg-rose-500 text-white border-rose-400 font-bold';
                        }
                      } else {
                        // Neutral selection in pretest or deferred groups without revealing correct or wrong!
                        stationBg = 'bg-sky-950/80 border-sky-400 text-white shadow-[0_0_25px_rgba(56,189,248,0.4)] ring-2 ring-sky-400/50';
                        bayBadge = 'bg-sky-400 text-slate-950 border-sky-300 font-bold';
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        data-station-index={optIdx}
                        onClick={() => handleDriveCarToStation(optIdx)}
                        className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative overflow-hidden flex ${
                          isStackedLayout ? 'flex-row items-center gap-4 min-h-[72px]' : 'flex-col justify-between min-h-[110px]'
                        } ${stationBg}`}
                      >
                        <div className={`flex items-center gap-3 ${isStackedLayout ? 'shrink-0' : 'justify-between mb-2 sm:mb-3 w-full'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center border shadow-sm ${bayBadge}`}>
                              {letter}
                            </span>
                            {!isStackedLayout && (
                              <span className="text-[11px] font-black text-slate-400">
                                محطة رقم {optIdx + 1}
                              </span>
                            )}
                          </div>

                          {!isStackedLayout && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-[10px] font-bold text-slate-300">
                              <span>🅿️ موقف</span>
                            </div>
                          )}
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

                        <p className={`text-sm sm:text-base font-bold text-right leading-relaxed flex-1 font-['Cairo'] ${isStackedLayout ? '' : 'mt-2'}`}>
                          {option}
                        </p>

                        {isSelected && (
                          <div className={`shrink-0 flex items-center ${isStackedLayout ? '' : 'mt-3 pt-3 border-t border-slate-800/80 justify-between w-full'}`}>
                            <RacingCarGraphic scale={0.7} isDriving={isDrivingToStation === optIdx} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* GAME 2: MYSTERY BOXES 📦 (QUESTIONS 26+) */
                <div
                  className={
                    isStackedLayout
                      ? "grid grid-cols-1 gap-3.5 sm:gap-4 w-full"
                      : "grid grid-cols-1 sm:grid-cols-2 gap-4"
                  }
                >
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = selectedStationIndex === optIdx;
                    const boxNumber = optIdx + 1;
                    const optImage = currentQ.optionImages?.[optIdx];

                    let boxCardStyle = 'bg-gradient-to-b from-[#141022] to-[#0c0916] border-slate-800 hover:border-amber-500/60 text-slate-200';
                    if (isSelected) {
                      if (isImmediate) {
                        const isCorrect = optIdx === currentQ.correctIndex;
                        if (isCorrect) {
                          boxCardStyle = 'bg-gradient-to-b from-emerald-950 via-[#0d2a1c] to-black border-emerald-400 text-white ring-2 ring-emerald-400/50 shadow-[0_0_35px_rgba(16,185,129,0.45)]';
                        } else {
                          boxCardStyle = 'bg-gradient-to-b from-rose-950 via-[#2a0d14] to-black border-rose-500 text-white ring-2 ring-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.45)]';
                        }
                      } else {
                        boxCardStyle = 'bg-gradient-to-b from-[#241738] via-[#1a122e] to-[#120a22] border-amber-400 text-white ring-2 ring-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.35)]';
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectBox(optIdx)}
                        className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden flex ${
                          isStackedLayout ? 'flex-row items-center gap-4 min-h-[72px]' : 'flex-col justify-between min-h-[140px]'
                        } group ${boxCardStyle}`}
                      >
                        <div className={`flex items-center gap-3 ${isStackedLayout ? 'shrink-0' : 'justify-between mb-3 w-full'}`}>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-black">
                              {['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][optIdx] || boxNumber}
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

                        {/* Answer text displayed clearly */}
                        <div className={`flex-1 ${isStackedLayout ? '' : 'p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-right'}`}>
                          {!isStackedLayout && (
                            <span className="text-[11px] font-bold text-amber-300/80 block mb-1">
                              الإجابة داخل الصندوق:
                            </span>
                          )}
                          <p className="text-sm sm:text-base font-black text-white leading-relaxed font-['Cairo']">
                            {option}
                          </p>
                        </div>

                      {isSelected && (
                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                          {isImmediate ? (
                            optIdx === currentQ.correctIndex ? (
                              <span className="flex items-center gap-1.5 text-emerald-300 font-black">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>إجابة صحيحة • النتيجة: 1/1</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-rose-300 font-black">
                                <X className="w-4 h-4 text-rose-400" />
                                <span>إجابة خاطئة • النتيجة: 0/1</span>
                              </span>
                            )
                          ) : (
                            <span className="flex items-center gap-1.5 text-amber-300">
                              <Check className="w-4 h-4 text-amber-400" />
                              <span>تم اختيار وتثبيت هذا الصندوق</span>
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-slate-400">صندوق #{boxNumber}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

            {/* SELECTION BANNER / ADMIN NAVIGATION */}
            {(answeredState === 'selected' || isAdmin) && (
              <div className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in ${
                isImmediate && answeredState === 'selected'
                  ? (chosenAnswers[currentQ.id] === currentQ.correctIndex 
                      ? 'bg-emerald-950/95 border-emerald-500/60 shadow-emerald-900/30' 
                      : 'bg-rose-950/95 border-rose-500/60 shadow-rose-900/30')
                  : 'bg-slate-900/95 border-slate-800'
              }`}>
                {isImmediate ? (
                  <div className="flex items-center gap-3 text-right">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black shrink-0 ${
                      chosenAnswers[currentQ.id] === currentQ.correctIndex
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                    }`}>
                      {chosenAnswers[currentQ.id] === currentQ.correctIndex ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <X className="w-6 h-6 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">
                          {chosenAnswers[currentQ.id] === currentQ.correctIndex ? 'إجابة صحيحة! أحسنت ✓' : 'إجابة خاطئة ✗'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                          chosenAnswers[currentQ.id] === currentQ.correctIndex
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-rose-600 text-white'
                        }`}>
                          النتيجة: {chosenAnswers[currentQ.id] === currentQ.correctIndex ? '1/1' : '0/1'}
                        </span>
                      </div>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        {chosenAnswers[currentQ.id] === currentQ.correctIndex
                          ? 'إجابة صحيحة ومؤكدة.'
                          : 'إجابة غير صحيحة.'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-right">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-slate-300 font-['Cairo']">
                      السؤال #{currentIndex + 1} من {questions.length}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className={`flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-black transition text-white shadow-lg cursor-pointer shrink-0 ${
                    isImmediate
                      ? (chosenAnswers[currentQ.id] === currentQ.correctIndex
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                          : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30')
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-indigo-900/30'
                  }`}
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
          /* COMPLETION SCREEN: Post-test reveals full final score to student, Pre-test is private to Admin */
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-sky-500/50 text-center shadow-[0_0_50px_rgba(56,189,248,0.2)] max-w-2xl mx-auto space-y-6">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white shadow-2xl ${
              mode === 'post'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/40'
                : 'bg-gradient-to-tr from-sky-500 to-blue-600 shadow-sky-500/40'
            }`}>
              {mode === 'post' ? <Trophy className="w-10 h-10 text-yellow-300" /> : <CheckCircle2 className="w-10 h-10" />}
            </div>

            <div>
              <span className={`text-xs font-black px-3.5 py-1 rounded-full border ${
                mode === 'post'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              }`}>
                تم تسليم {testLabel} بنجاح 📋
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 font-['Tajawal']">
                {mode === 'post' ? 'تهانينا! اكتمل الاختبار البعدي' : 'شكراً لك! تم استلام جميع إجاباتك كاملة'}
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {mode === 'post'
                  ? 'تم تصحيح كافة الأسئلة واحتساب نتيجتك النهائية بنجاح.'
                  : 'لقد أتممت الاختبار بنجاح وتم تسليم كافة إجاباتك.'}
              </p>
            </div>

            {/* Score presentation at end of test */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-black border-2 border-emerald-500/50 text-center space-y-3 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold font-['Cairo']">
                <span>📊 نتيجة الاختبار النهائية</span>
              </div>
              <span className="text-xs text-emerald-300 font-bold block">
                النتيجة النهائية لـ {testLabel} ({finalResult ? finalResult.maxScore : questions.length} سؤالاً)
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl sm:text-5xl font-black text-[#ffd700] drop-shadow">
                  {finalResult ? finalResult.score : 0}
                </span>
                <span className="text-2xl font-bold text-slate-400">
                  / {finalResult ? finalResult.maxScore : questions.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  النسبة المئوية: {finalResult && finalResult.maxScore ? Math.round((finalResult.score / finalResult.maxScore) * 100) : 0}%
                </span>
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                  {finalResult?.passed ? '✓ اجتياز متميز' : 'تم الرصد والاعتماد'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تم احتساب نتيجتك النهائية واعتمادها بنجاح.</span>
              </div>
            </div>

            {/* Detailed Question-by-Question Breakdown Card (Crucial for Deferred Groups G2 & G4 & Full Transperancy) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border-2 border-slate-800 text-right space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-['Tajawal']">
                      📋 التقرير التفصيلي لإجابات كل سؤال ({testLabel}):
                    </h3>
                    <p className="text-xs text-slate-400">
                      بيان تفصيلي بالنطاق/الموديول، نص السؤال، إجابتك المختارة، والإجابة الصحيحة.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">
                  {questions.length} سؤالاً
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {questions.map((q, qIdx) => {
                  const chosenIdx = chosenAnswers[q.id];
                  const isRight = chosenIdx === q.correctIndex;
                  const domainName = (q as any).module || (q as any).domain || (() => {
                    if (qIdx < 6) return 'الموديول 1: التثبيت والوسائط المتعددة';
                    if (qIdx < 11) return 'الموديول 2: واجهة البرنامج والخصائص';
                    if (qIdx < 16) return 'الموديول 3: أنماط المشروعات و العروض';
                    if (qIdx < 21) return 'الموديول 4: الأشكال الذكية والشرائح والألوان';
                    if (qIdx < 26) return 'الموديول 5: المحاذاة والتحريك والتجميع';
                    if (qIdx < 31) return 'الموديول 6: بنوك الأسئلة والنتائج والتقويم';
                    if (qIdx < 37) return 'الموديول 7: الخط الزمني والتغذية الراجعة والفيديو';
                    if (qIdx < 42) return 'الموديول 8: استيراد عروض PowerPoint';
                    if (qIdx < 48) return 'الموديول 9: أزرار التفاعل والمحاكاة البرمجية';
                    return 'الموديول 10: النشر الإلكتروني ومعايير SCORM';
                  })();

                  const chosenText = chosenIdx !== undefined && chosenIdx >= 0 && q.options[chosenIdx]
                    ? `${['أ', 'ب', 'ج', 'د', 'هـ'][chosenIdx] || (chosenIdx + 1)}. ${q.options[chosenIdx]}`
                    : 'لم تتم الإجابة';
                  const correctText = q.options[q.correctIndex]
                    ? `${['أ', 'ب', 'ج', 'د', 'هـ'][q.correctIndex] || (q.correctIndex + 1)}. ${q.options[q.correctIndex]}`
                    : 'الإجابة الأولى';

                  return (
                    <div
                      key={q.id || qIdx}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                        isRight
                          ? 'bg-emerald-950/30 border-emerald-500/40'
                          : 'bg-rose-950/30 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black border ${
                            isRight
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                              : 'bg-rose-600 text-white border-rose-400'
                          }`}>
                            السؤال #{qIdx + 1}
                          </span>
                          <span className="text-[11px] text-amber-300 font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                            {domainName}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-lg font-black text-xs border ${
                          isRight
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}>
                          النتيجة: {isRight ? '1 / 1 ✓' : '0 / 1 ✗'}
                        </span>
                      </div>

                      <p className="text-white font-bold leading-relaxed font-['Cairo']">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block font-bold">إجابتك المختارة:</span>
                          <span className={`font-bold block mt-0.5 ${isRight ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {chosenText}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block font-bold">الإجابة الصحيحة النموذجية:</span>
                          <span className="text-emerald-300 font-bold block mt-0.5">
                            {correctText}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={onFinishPreTest}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm transition shadow-xl cursor-pointer ${
                mode === 'post'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-500 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-900/40'
                  : 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-900/40'
              }`}
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
