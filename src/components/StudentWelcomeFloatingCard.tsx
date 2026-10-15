import React, { useState, useEffect } from 'react';
import { CpLogo } from './CpLogo';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { getGroupByUsername } from '../data/studentAccounts';

interface StudentWelcomeFloatingCardProps {
  username: string;
  onFinish: () => void;
  durationSeconds?: number;
}

export const StudentWelcomeFloatingCard: React.FC<StudentWelcomeFloatingCardProps> = ({
  username,
  onFinish,
  durationSeconds = 10,
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const groupMeta = getGroupByUsername(username);

  useEffect(() => {
    // 10-second smooth interval / timer without numeric counter
    const totalMs = durationSeconds * 1000;
    const intervalMs = 50;
    let elapsedMs = 0;

    const timer = setInterval(() => {
      elapsedMs += intervalMs;
      const pct = Math.min(100, (elapsedMs / totalMs) * 100);
      setProgressPercent(pct);

      if (elapsedMs >= totalMs) {
        clearInterval(timer);
        onFinish();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [durationSeconds, onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-500 font-['Cairo',_sans-serif] text-right">
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-blue-600/30 via-[#ffd700]/25 to-purple-600/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main Floating Glass Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#0f1429] via-[#0a0d1c] to-[#070914] border-2 border-[#ffd700] shadow-[0_0_60px_rgba(255,215,0,0.35),0_25px_50px_rgba(0,0,0,0.9)] p-6 sm:p-8 overflow-hidden text-center flex flex-col items-center">
        {/* Decorative corner lights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Verified Badge: تم التحقق من بياناتك لجميع المجموعات */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <span className="px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>تم التحقق من بياناتك</span>
          </span>

          {groupMeta && (
            <span className="px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-200 text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.25)]">
              المجموعة {groupMeta.code}: {groupMeta.name}
            </span>
          )}
        </div>

        {/* Environment Logo */}
        <div className="relative mb-4">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-[#ffd700] to-amber-500 rounded-2xl blur-md opacity-40" />
          <div className="relative p-3 rounded-2xl bg-[#090d1c] border border-[#ffd700]/70">
            <CpLogo size="md" showText={false} />
          </div>
        </div>

        {/* Welcome Message + Username Only (In Large Font) */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-white font-['Tajawal'] tracking-tight">
            مرحباً بك <span className="text-[#ffd700] font-mono">{username}</span>
          </h2>
        </div>

        {/* 10-Second Modern Elegant Loading Bar */}
        <div className="w-full bg-[#070a16] p-5 sm:p-6 rounded-2xl border border-slate-800/90 shadow-inner space-y-4">
          {/* Progress bar (10s smooth fill, no numeric counter) */}
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800/90 relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 via-[#ffd700] to-amber-400 rounded-full transition-all duration-75 ease-linear shadow-[0_0_20px_rgba(255,215,0,0.65)] relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>

          {/* Large harmonious loading text: جاري التحميل انتظر */}
          <div className="pt-1 flex items-center justify-center gap-2.5">
            <Loader2 className="w-5 h-5 text-[#ffd700] animate-spin" />
            <p className="text-lg sm:text-xl font-black text-amber-300 font-['Tajawal'] tracking-wide">
              جاري التحميل انتظر...
            </p>
          </div>
        </div>

        {/* Strictly closes after 10 seconds to reveal the honor board automatically */}
      </div>
    </div>
  );
};
