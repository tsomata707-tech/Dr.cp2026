import React, { useState } from 'react';
import { Clock, Pause, Play, AlertTriangle, Flame, Minimize2, Maximize2 } from 'lucide-react';

interface CircularCountdownTimerProps {
  totalSeconds?: number; // Default 3600 (60 minutes)
  remainingSeconds: number;
  isPaused: boolean;
  soundWarningActive?: boolean;
  testTitle?: string;
  unansweredCount?: number;
}

export const CircularCountdownTimer: React.FC<CircularCountdownTimerProps> = ({
  totalSeconds = 3600,
  remainingSeconds,
  isPaused,
  soundWarningActive = false,
  testTitle = 'زمن الاختبار',
  unansweredCount,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Safe clamping
  const currentSecs = Math.max(0, remainingSeconds);
  const maxSecs = Math.max(1, totalSeconds);
  const progressRatio = Math.max(0, Math.min(1, currentSecs / maxSecs));

  // Geometry
  const size = 136;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2; // (136 - 8) / 2 = 64
  const circumference = 2 * Math.PI * radius; // ~402.12
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Time format MM:SS
  const minutes = Math.floor(currentSecs / 60);
  const seconds = currentSecs % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // State-driven styling
  const isEmergency = currentSecs <= 15;
  const isWarning = currentSecs <= 300 && !isEmergency; // Last 5 minutes
  const isCaution = currentSecs <= 900 && !isWarning && !isEmergency; // Last 15 minutes

  // Stroke color / gradient ID
  let strokeGradientId = 'timerGradNormal';
  let badgeBg = 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';
  let timerTextColor = 'text-emerald-300';
  let ringGlow = 'shadow-[0_0_25px_rgba(16,185,129,0.35)]';

  if (isPaused) {
    strokeGradientId = 'timerGradPaused';
    badgeBg = 'bg-amber-950/90 border-amber-500 text-amber-300 animate-pulse';
    timerTextColor = 'text-amber-300';
    ringGlow = 'shadow-[0_0_25px_rgba(245,158,11,0.5)] ring-2 ring-amber-500/50';
  } else if (isEmergency) {
    strokeGradientId = 'timerGradEmergency';
    badgeBg = 'bg-rose-950/95 border-rose-500 text-rose-200 animate-bounce';
    timerTextColor = 'text-rose-400 animate-pulse';
    ringGlow = 'shadow-[0_0_35px_rgba(244,63,94,0.7)] ring-2 ring-rose-500/70';
  } else if (isWarning) {
    strokeGradientId = 'timerGradWarning';
    badgeBg = 'bg-rose-950/80 border-rose-500/60 text-rose-300';
    timerTextColor = 'text-rose-300';
    ringGlow = 'shadow-[0_0_25px_rgba(244,63,94,0.4)]';
  } else if (isCaution) {
    strokeGradientId = 'timerGradCaution';
    badgeBg = 'bg-amber-950/80 border-amber-500/60 text-amber-300';
    timerTextColor = 'text-amber-300';
    ringGlow = 'shadow-[0_0_25px_rgba(245,158,11,0.3)]';
  }

  // Minimized compact circular button view
  if (isMinimized) {
    return (
      <div
        className="fixed top-20 left-3 sm:left-6 z-40 select-none font-['Cairo']"
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 backdrop-blur-xl bg-slate-950/95 shadow-2xl transition-all cursor-pointer transform hover:scale-105 ${ringGlow} ${
            isPaused
              ? 'border-amber-500 text-amber-300'
              : isEmergency
              ? 'border-rose-500 text-rose-300'
              : 'border-emerald-500 text-emerald-300'
          }`}
          title="انقر لتكبير دائرة مؤقت الـ 60 دقيقة"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isPaused ? 'text-amber-400' : isEmergency ? 'text-rose-500' : 'text-emerald-400'}
                strokeDasharray={`${progressRatio * 100}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Clock className="w-3.5 h-3.5 absolute text-white" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 leading-none">
              {isPaused ? '⏸️ متوقف' : 'التايمر'}
            </span>
            <span className="font-mono font-black text-sm tracking-wide">
              {formattedTime}
            </span>
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
        </button>
      </div>
    );
  }

  // Large Floating Circular Timer (Sticky with page scrolling)
  return (
    <aside
      aria-label="عداد الوقت التنازلي للاختبار"
      className="fixed top-20 left-3 sm:left-6 z-40 select-none font-['Cairo'] transition-all"
      dir="rtl"
    >
      <div
        className={`relative flex flex-col items-center p-3 rounded-3xl bg-slate-950/95 backdrop-blur-xl border-2 transition-all duration-300 ${ringGlow} ${
          isPaused
            ? 'border-amber-500'
            : isEmergency
            ? 'border-rose-500 animate-pulse'
            : isWarning
            ? 'border-rose-500/70'
            : isCaution
            ? 'border-amber-500/70'
            : 'border-emerald-500/70 hover:border-emerald-400'
        }`}
      >
        {/* Minimize Button */}
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-400 text-slate-400 hover:text-white flex items-center justify-center transition shadow cursor-pointer z-10"
          title="تصغير التايمر"
        >
          <Minimize2 className="w-3 h-3" />
        </button>

        {/* Circular Progress Gauge */}
        <div className="relative w-[136px] h-[136px] flex items-center justify-center">
          <svg
            className="w-full h-full -rotate-90 transform"
            viewBox={`0 0 ${size} ${size}`}
          >
            <defs>
              {/* Normal Emerald / Cyan Gradient */}
              <linearGradient id="timerGradNormal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>

              {/* Caution Amber Gradient */}
              <linearGradient id="timerGradCaution" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>

              {/* Warning Rose Gradient */}
              <linearGradient id="timerGradWarning" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>

              {/* Emergency Flame Red Gradient */}
              <linearGradient id="timerGradEmergency" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>

              {/* Paused Amber Gradient */}
              <linearGradient id="timerGradPaused" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(30, 41, 59, 0.9)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Countdown Animated Stroke Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#${strokeGradientId})`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>

          {/* Inner Content of Circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            {/* Status indicator */}
            <div className="flex items-center gap-1 mb-0.5">
              {isPaused ? (
                <span className="text-[10px] font-black text-amber-300 animate-pulse flex items-center gap-0.5">
                  <Pause className="w-2.5 h-2.5 fill-amber-300" />
                  متوقف
                </span>
              ) : isEmergency ? (
                <span className="text-[10px] font-black text-rose-300 animate-bounce flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 text-rose-400 animate-pulse fill-rose-500" />
                  أوشك!
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-emerald-400" />
                  متبقي
                </span>
              )}
            </div>

            {/* Main Digital Clock Numbers */}
            <div
              className={`font-mono text-2xl font-black tracking-tight leading-none ${timerTextColor}`}
            >
              {formattedTime}
            </div>

            {/* 60-Minute Benchmark Label */}
            <div className="text-[10px] font-bold text-slate-400 mt-1 leading-none font-['Tajawal']">
              ٦٠ دقيقة
            </div>
          </div>
        </div>

        {/* Attached Status Badge */}
        <div className="mt-2 w-full text-center">
          <div
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black border flex items-center justify-center gap-1.5 transition-all ${badgeBg}`}
          >
            {isPaused ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>متوقف (خارج الصفحة)</span>
              </>
            ) : isEmergency ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                <span>⚠️ اللحظات الأخيرة</span>
              </>
            ) : isWarning ? (
              <>
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>أقل من 5 دقائق</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>عد تنازلي مستمر</span>
              </>
            )}
          </div>

          {/* Quick context label */}
          <div className="text-[9px] text-slate-400 font-bold mt-1">
            {testTitle}
            {typeof unansweredCount === 'number' && unansweredCount > 0 && (
              <span className="text-amber-400 block mt-0.5">
                متبقي {unansweredCount} سؤال
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
