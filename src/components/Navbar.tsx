import React, { useState, useEffect } from 'react';
import { CpLogo } from './CpLogo';
import { ShieldCheck, Sparkles, LogOut, User, KeyRound, Lock, Home } from 'lucide-react';
import { getStudentProgress } from '../utils/gameStorage';
import { CARTOON_AVATARS } from '../data/gameLevelsData';
import { getGroupByUsername } from '../data/studentAccounts';

interface NavbarProps {
  isLoggedIn?: boolean;
  username?: string;
  isAdmin?: boolean;
  onLogout?: () => void;
  onOpenAdminLogin?: () => void;
  onExitAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn = false,
  username = '',
  isAdmin = false,
  onLogout,
  onOpenAdminLogin,
  onExitAdmin,
}) => {
  const [profile, setProfile] = useState(() => (username ? getStudentProgress(username) : null));
  const groupMeta = username ? getGroupByUsername(username) : null;

  useEffect(() => {
    if (username) {
      setProfile(getStudentProgress(username));
    } else {
      setProfile(null);
    }

    const handleUpdate = () => {
      if (username) {
        setProfile(getStudentProgress(username));
      }
    };

    window.addEventListener('cp_student_profile_updated', handleUpdate);
    return () => window.removeEventListener('cp_student_profile_updated', handleUpdate);
  }, [username]);

  const avatar = profile
    ? CARTOON_AVATARS.find((a) => a.id === profile.avatarId) || CARTOON_AVATARS[0]
    : null;
  return (
    <header
      id="app-permanent-header"
      className="fixed top-0 left-0 right-0 z-40 h-16 px-4 md:px-8 flex items-center justify-between backdrop-blur-xl bg-[#08070e]/95 border-b border-[#d4af37]/30 shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all duration-300"
    >
      {/* Permanent Cp Logo on the Right (RTL) */}
      <div className="flex items-center gap-3">
        <CpLogo size="md" showText={true} />
      </div>

      {/* Center Subtitle or Status */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs text-amber-300/80 font-['Tajawal'] font-bold">
          بيئة الألعاب التعليمية الإلكترونية
        </span>
        <span className="text-slate-600">•</span>
        <span className="text-xs text-slate-400 font-['Cairo']">
          Adobe Captivate 2019
        </span>
      </div>

      {/* Left side actions */}
      <div className="flex items-center gap-3">
        {isAdmin ? (
          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-[#d4af37] text-xs font-bold text-amber-300">
              <KeyRound className="w-3.5 h-3.5" />
              <span>وضع المشرف (الأدمن)</span>
            </span>
            <button
              type="button"
              onClick={onExitAdmin}
              id="btn-navbar-exit-admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج من الأدمن</span>
            </button>
          </div>
        ) : isLoggedIn ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141224] border border-[#d4af37]/40 text-xs text-amber-200">
              {profile?.customPhotoUrl ? (
                <img
                  src={profile.customPhotoUrl}
                  alt={username}
                  className="w-5 h-5 rounded-full object-cover border border-[#ffd700]"
                />
              ) : avatar ? (
                <span className="text-sm">{avatar.emoji}</span>
              ) : (
                <User className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-mono font-bold">{username}</span>
              {username?.toLowerCase() === 'admin' ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold">
                  مشرف (قراءة فقط 👁️)
                </span>
              ) : groupMeta ? (
                <span className="px-2 py-0.5 rounded-md bg-purple-950/90 border border-purple-500/50 text-purple-200 text-[11px] font-bold">
                  {groupMeta.name}
                </span>
              ) : null}
            </div>

            {/* Button: Return to Student Home Page */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('cp_navigate_to_student_home'))}
              id="btn-navbar-student-home"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-[#ffd700] bg-amber-500/15 hover:bg-amber-500/30 text-[#ffd700] hover:text-white text-xs font-black transition-all cursor-pointer shadow-[0_0_12px_rgba(255,215,0,0.25)]"
              title="العودة للصفحة الخاصة بالطالب (الرئيسية)"
            >
              <Home className="w-3.5 h-3.5 text-[#ffd700]" />
              <span className="hidden sm:inline">العودة للرئيسية 🏠</span>
              <span className="sm:hidden">🏠</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              id="btn-logout-header"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-950/20 hover:bg-red-900/40 text-red-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل خروج</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={onOpenAdminLogin}
              id="btn-navbar-admin-login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d4af37]/60 bg-[#151226] hover:bg-[#1f1a38] text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.15)]"
              title="دخول المشرف (لوحة الأدمن)"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>لوحة الأدمن</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
