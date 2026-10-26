import React, { useState, useEffect } from 'react';
import { CpLogo } from './CpLogo';
import { ShieldCheck, Sparkles, LogOut, User, KeyRound, Lock, Home } from 'lucide-react';
import { getStudentProgress } from '../utils/gameStorage';
import { CARTOON_AVATARS } from '../data/gameLevelsData';
import { getGroupByUsername } from '../data/studentAccounts';
import { CollaborativeNotificationBell } from './CollaborativeNotificationBell';
import { formatStudentDisplayName } from '../utils/studentNameStorage';

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
      className="fixed top-0 left-0 right-0 z-40 h-16 px-4 md:px-8 flex items-center justify-between backdrop-blur-xl bg-[#f4f7fb]/95 border-b border-slate-300 shadow-[0_2px_12px_rgba(15,23,42,0.06)] transition-all duration-300"
    >
      {/* Permanent Cp Logo on the Right (RTL) */}
      <div className="flex items-center gap-3">
        <CpLogo size="md" showText={true} />
      </div>

      {/* Center Subtitle or Status */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs text-sky-800 font-['Tajawal'] font-bold">
          بيئة الألعاب التعليمية الإلكترونية
        </span>
        <span className="text-sky-400">•</span>
        <span className="text-xs text-slate-600 font-['Cairo'] font-semibold">
          Adobe Captivate 2019
        </span>
      </div>

      {/* Left side actions */}
      <div className="flex items-center gap-3">
        {isAdmin ? (
          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-100 border border-sky-400 text-xs font-bold text-sky-900">
              <KeyRound className="w-3.5 h-3.5 text-sky-700" />
              <span>وضع المشرف (الأدمن)</span>
            </span>
            <CollaborativeNotificationBell currentUsername="admin" />
            <button
              type="button"
              onClick={onExitAdmin}
              id="btn-navbar-exit-admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج من الأدمن</span>
            </button>
          </div>
        ) : isLoggedIn ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50 border-2 border-sky-300 text-xs text-sky-950 font-bold shadow-sm">
              {profile?.customPhotoUrl ? (
                <img
                  src={profile.customPhotoUrl}
                  alt={username}
                  className="w-5 h-5 rounded-full object-cover border border-sky-500"
                />
              ) : avatar ? (
                <span className="text-sm">{avatar.emoji}</span>
              ) : (
                <User className="w-3.5 h-3.5 text-sky-700" />
              )}
              <span className="font-bold text-slate-900 font-['Cairo'] tracking-wide">
                {formatStudentDisplayName(username)}
              </span>
              {username?.toLowerCase() === 'admin' ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-400 text-emerald-900 text-[11px] font-bold">
                  مشرف (قراءة فقط 👁️)
                </span>
              ) : groupMeta ? (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-200 border border-slate-300 text-slate-900 text-[11px] font-black font-['Cairo']">
                  المجموعة {groupMeta.code}: {groupMeta.name}
                </span>
              ) : null}
            </div>

            {/* Collaborative Notification Bell & Envelope */}
            <CollaborativeNotificationBell currentUsername={username} />

            {/* Button: Return to Student Home Page */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('cp_navigate_to_student_home'))}
              id="btn-navbar-student-home"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-slate-300 bg-slate-200 hover:bg-slate-300 text-slate-900 text-xs font-black font-['Cairo'] transition-all cursor-pointer shadow-sm"
              title="العودة للصفحة الخاصة بالطالب (الرئيسية)"
            >
              <Home className="w-3.5 h-3.5 text-slate-900" />
              <span className="hidden sm:inline">العودة للرئيسية 🏠</span>
              <span className="sm:hidden">🏠</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              id="btn-logout-header"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-rose-300 bg-rose-100 hover:bg-rose-200 text-rose-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-700" />
              <span>تسجيل خروج</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={onOpenAdminLogin}
              id="btn-navbar-admin-login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-amber-500 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="دخول المشرف (لوحة الأدمن)"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>لوحة الأدمن</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
