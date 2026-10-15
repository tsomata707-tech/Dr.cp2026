import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Gamepad2,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Film,
  Trophy,
  CheckCircle2,
  FastForward,
} from 'lucide-react';

const CanvasConfetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ffd700', '#ff4d4d', '#00e5ff', '#a855f7', '#22c55e', '#f97316'];
    const particles = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 50,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 4 + 3,
      speedX: (Math.random() - 0.5) * 4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;
        if (p.y < canvas.height + 20) alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };
    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};

interface GameLevelUnlockLoaderProps {
  levelNumber: number;
  levelTitle: string;
  badgeEmoji?: string;
  onComplete: () => void;
  onCancel?: () => void;
}

// Synthesize pleasant arcade sound effects using Web Audio API (no external sound files required)
function playBeepTone(freq: number, type: OscillatorType = 'sine', duration = 0.08) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio context may be restricted before user gesture
  }
}

function playCelebrationFanfare() {
  const notes = [440, 554, 659, 880];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playBeepTone(freq, 'triangle', 0.18);
    }, i * 110);
  });
}

export const GameLevelUnlockLoader: React.FC<GameLevelUnlockLoaderProps> = ({
  levelNumber,
  levelTitle,
  badgeEmoji = '🏅',
  onComplete,
  onCancel,
}) => {
  const [progress, setProgress] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  useEffect(() => {
    const totalDuration = 2400; // 2.4 seconds smooth loading experience
    const startTime = performance.now();
    let lastBeepMilestone = 0;

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.max(1, Math.floor((elapsed / totalDuration) * 100)));
      setProgress(pct);

      // Play soft arcade step sound on every 20%
      const currentMilestone = Math.floor(pct / 20);
      if (currentMilestone > lastBeepMilestone && soundRef.current) {
        lastBeepMilestone = currentMilestone;
        playBeepTone(380 + currentMilestone * 90, 'triangle', 0.07);
      }

      if (pct >= 100) {
        clearInterval(interval);
        setShowCelebration(true);
        if (soundRef.current) {
          playCelebrationFanfare();
        }
        setTimeout(() => {
          onComplete();
        }, 650);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setProgress(100);
    setShowCelebration(true);
    if (soundRef.current) {
      playCelebrationFanfare();
    }
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  // Dynamic anime speech messages based on progress
  let animeSpeech = '🏃‍♂️ جاري فتح بوابة المستوى!';
  if (progress > 20 && progress <= 50) {
    animeSpeech = '⚡ استدعاء كبسولات وفيديوهات الشرح...';
  } else if (progress > 50 && progress <= 80) {
    animeSpeech = '🎮 تهيئة محاكي وسائط Adobe Captivate!';
  } else if (progress > 80 && progress < 100) {
    animeSpeech = '🚀 شحن نقاط الخبرة والتحديات!';
  } else if (progress >= 100) {
    animeSpeech = '🎉 تم الفتح بنجاح! جاهز للانطلاق!';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn text-right select-none">
      {/* Confetti blast when progress reaches 100 */}
      {showCelebration && <CanvasConfetti />}

      {/* Cybernetic Aura */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-amber-500/30 blur-2xl pointer-events-none" />

      {/* Main Arcade Frame */}
      <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#110e28] via-[#0b091c] to-[#070512] border-3 border-[#ffd700] p-6 sm:p-8 shadow-[0_0_60px_rgba(255,215,0,0.35)] overflow-hidden">
        {/* Animated Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent bg-[length:100%_8px] pointer-events-none opacity-40 animate-pulse" />

        {/* Top Game Bar Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-[#ffd700]/70 text-[#ffd700] text-xs font-black flex items-center gap-1.5 font-['Cairo']">
              <Gamepad2 className="w-4 h-4 text-[#ffd700] animate-bounce" />
              <span>تحميل المرحلة {levelNumber}</span>
            </span>
            <span className="text-xs text-amber-300 font-mono font-bold">
              {badgeEmoji}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title={soundEnabled ? 'كتم الصوت' : 'تفعيل صوت اللعبة'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Stage Header */}
        <div className="text-center mb-6">
          <span className="text-xs font-black text-[#ffd700] tracking-wider uppercase font-['Cairo'] block mb-1">
            🎮 تجهيز ساحة اللعبة التعليمية 🎮
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] tracking-tight">
            {levelTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-['Cairo']">
            استعد لمشاهدة فيديو الشرح التفاعلي وخوض التحديات الشيقة
          </p>
        </div>

        {/* 🌟 ANIME MASCOT RUNNING/MOVING ON TOP OF PROGRESS BAR */}
        <div className="relative h-24 mb-2 flex items-end">
          {/* Moving Mascot Container with smooth horizontal tracking */}
          <div
            className="absolute bottom-1 transition-all duration-75 ease-out flex flex-col items-center"
            style={{
              left: `${Math.min(94, Math.max(6, progress))}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Cheerful Speech Bubble */}
            <div className="mb-1 px-3 py-1 rounded-2xl bg-[#ffd700] text-slate-950 font-black text-[11px] shadow-[0_0_15px_rgba(255,215,0,0.6)] whitespace-nowrap animate-pulse flex items-center gap-1 font-['Cairo']">
              <span>{animeSpeech}</span>
            </div>

            {/* Anime Character Mascot (Full SVG Vector Mascot with running bounce animation) */}
            <div className="w-14 h-14 relative animate-bounce flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(255,215,0,0.5)]">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="animeSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffe0b2" />
                    <stop offset="100%" stopColor="#ffcc80" />
                  </linearGradient>
                  <linearGradient id="animeHair" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="animeSuit" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>

                {/* Anime Speed aura */}
                <circle cx="50" cy="50" r="44" fill="#3b82f6" opacity="0.2" className="animate-ping" />

                {/* Back hair spikes */}
                <polygon points="25,20 35,40 15,35" fill="url(#animeHair)" />
                <polygon points="75,20 65,40 85,35" fill="url(#animeHair)" />
                <polygon points="50,10 40,30 60,30" fill="url(#animeHair)" />

                {/* Face */}
                <circle cx="50" cy="46" r="28" fill="url(#animeSkin)" stroke="#d97706" strokeWidth="1.5" />

                {/* Big Sparkling Anime Eyes (Happy ^_^) */}
                {progress < 100 ? (
                  <>
                    <ellipse cx="40" cy="44" rx="5" ry="6" fill="#1e1b4b" />
                    <circle cx="38" cy="42" r="2" fill="#ffffff" />
                    <circle cx="41" cy="46" r="1" fill="#ffffff" />

                    <ellipse cx="60" cy="44" rx="5" ry="6" fill="#1e1b4b" />
                    <circle cx="58" cy="42" r="2" fill="#ffffff" />
                    <circle cx="61" cy="46" r="1" fill="#ffffff" />
                  </>
                ) : (
                  <>
                    {/* Cheerful curved happy anime eyes ^_^ */}
                    <path d="M34,45 Q40,38 46,45" fill="none" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
                    <path d="M54,45 Q60,38 66,45" fill="none" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
                  </>
                )}

                {/* Rosy Anime Cheeks */}
                <circle cx="33" cy="52" r="4" fill="#f43f5e" opacity="0.6" />
                <circle cx="67" cy="52" r="4" fill="#f43f5e" opacity="0.6" />

                {/* Cheerful Anime Mouth */}
                <path d="M44,54 Q50,62 56,54" fill="#e11d48" stroke="#be123c" strokeWidth="1" />

                {/* Gamer Headband with Golden Star */}
                <rect x="23" y="30" width="54" height="8" rx="4" fill="#ef4444" />
                <circle cx="50" cy="34" r="3" fill="#ffd700" />

                {/* Gamer Suit Body */}
                <path d="M36,72 Q50,68 64,72 L68,88 Q50,92 32,88 Z" fill="url(#animeSuit)" stroke="#b45309" strokeWidth="1.5" />
                <circle cx="50" cy="78" r="3" fill="#ffffff" />

                {/* Running Hands */}
                <circle cx="30" cy="75" r="4" fill="url(#animeSkin)" />
                <circle cx="70" cy="75" r="4" fill="url(#animeSkin)" />
              </svg>
            </div>
          </div>
        </div>

        {/* 🌟 PROGRESS TRACK (1 TO 100%) */}
        <div className="relative mb-3">
          <div className="h-6 w-full rounded-full bg-slate-950 border-2 border-blue-500/40 p-1 shadow-inner overflow-hidden relative">
            {/* Glowing Filling Bar */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 via-purple-500 to-[#ffd700] transition-all duration-75 relative shadow-[0_0_20px_rgba(255,215,0,0.8)]"
              style={{ width: `${progress}%` }}
            >
              {/* Animated Sheen Overlay */}
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>

          {/* Numbers 1% to 100% on the sides */}
          <div className="flex items-center justify-between text-xs font-mono font-black text-slate-400 mt-2 px-1">
            <span className="text-slate-500">1%</span>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#ffd700] animate-bounce" />
              <span className="text-xl font-black text-[#ffd700] font-['Outfit'] tracking-tight">
                {progress}%
              </span>
            </div>
            <span className="text-[#ffd700]">100% 🏁</span>
          </div>
        </div>

        {/* Game HUD Status Badges */}
        <div className="grid grid-cols-3 gap-2.5 my-5 p-3 rounded-2xl bg-[#070914] border border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-['Cairo']">شرح الفيديو</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <Film className="w-3 h-3" />
              <span>متاح تلقائياً</span>
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-['Cairo']">نقاط المستوى</span>
            <span className="text-xs font-bold text-[#ffd700] flex items-center justify-center gap-1 mt-0.5 font-['Outfit']">
              <Trophy className="w-3 h-3 text-[#ffd700]" />
              <span>+200 XP</span>
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-['Cairo']">حالة المهمة</span>
            <span className="text-xs font-bold text-cyan-400 flex items-center justify-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>تحدي تفاعلي</span>
            </span>
          </div>
        </div>

        {/* Footer Actions: Skip Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 font-['Cairo'] text-[11px]">
            ⚡ يتم فتح الفيديو تلقائياً في نفس الصفحة فور وصول الشريط إلى 100%
          </span>

          <button
            type="button"
            onClick={handleSkip}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#ffd700] border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>تخطي والبدء فوراً</span>
          </button>
        </div>
      </div>
    </div>
  );
};
