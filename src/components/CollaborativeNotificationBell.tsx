import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Sparkles, X, ChevronLeft } from 'lucide-react';
import {
  subscribeToCollabGroupNotification,
  CollabNotificationEvent,
  playCollabNotificationChime,
} from '../utils/realtimeService';
import {
  getCollaborativeGroupByUsername,
  ALL_COLLAB_GROUPS,
  CollaborativeGroupCode,
  COLLABORATIVE_GROUPS_DEF,
} from '../data/studentAccounts';

interface CollaborativeNotificationBellProps {
  currentUsername: string;
  onOpenChat?: (groupCode: string) => void;
  className?: string;
}

export const CollaborativeNotificationBell: React.FC<CollaborativeNotificationBellProps> = ({
  currentUsername,
  onOpenChat,
  className = '',
}) => {
  const isAdmin = currentUsername?.trim().toLowerCase() === 'admin';
  const userCollabGroup = getCollaborativeGroupByUsername(currentUsername);

  // Group codes to monitor:
  // For student: strictly their own assigned triad only (e.g. 'G3-A' or 'G4-B') - NO OTHER GROUP CAN BE MONITORED!
  // For admin: all 10 triads (G3-A..E and G4-A..E)
  const groupsToMonitor: CollaborativeGroupCode[] = isAdmin
    ? ALL_COLLAB_GROUPS
    : userCollabGroup
    ? [userCollabGroup]
    : [];

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeToast, setActiveToast] = useState<CollabNotificationEvent | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [recentNotifications, setRecentNotifications] = useState<CollabNotificationEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`cp_recent_collab_notifs_${currentUsername}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track timestamp of latest read
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(`cp_last_read_collab_${currentUsername}`) || '0', 10);
    } catch {
      return 0;
    }
  });

  // Subscribe to real-time notifications for the specific authorized groups only
  useEffect(() => {
    if (groupsToMonitor.length === 0) return;

    const unsubs: Array<() => void> = [];

    groupsToMonitor.forEach((groupCode) => {
      const unsub = subscribeToCollabGroupNotification(groupCode, (notif) => {
        // If not sent by current user and newer than last read
        if (notif.sender !== currentUsername && notif.createdAt > (lastReadTimestamp || 0)) {
          // Play pleasant chime
          playCollabNotificationChime();

          // Show floating toast
          setActiveToast(notif);

          // Update unread count
          setUnreadCount((prev) => prev + 1);

          // Add to recent notifications list
          setRecentNotifications((prev) => {
            const next = [notif, ...prev.filter((n) => n.id !== notif.id)].slice(0, 15);
            try {
              localStorage.setItem(`cp_recent_collab_notifs_${currentUsername}`, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [groupsToMonitor.join(','), currentUsername, lastReadTimestamp]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const handleOpenTargetChat = (groupCode: string) => {
    setShowDropdown(false);
    setActiveToast(null);
    setUnreadCount(0);
    const now = Date.now();
    setLastReadTimestamp(now);
    try {
      localStorage.setItem(`cp_last_read_collab_${currentUsername}`, now.toString());
      sessionStorage.setItem('cp_pending_collab_group', groupCode);
    } catch {}

    if (onOpenChat) {
      onOpenChat(groupCode);
    }

    // Dispatch event immediately
    window.dispatchEvent(
      new CustomEvent('cp_open_collab_chat', { detail: { groupCode } })
    );

    // Re-dispatch after mounting
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('cp_open_collab_chat', { detail: { groupCode } })
      );
    }, 50);

    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('cp_open_collab_chat', { detail: { groupCode } })
      );
    }, 200);
  };

  // If user is not in collaborative group and not admin (e.g. competitive students), do not render
  if (!isAdmin && !userCollabGroup) {
    return null;
  }

  const defaultGroupToOpen = userCollabGroup || 'G3-A';

  const getGroupBadge = (code: string) => {
    const isG3 = code.startsWith('G3');
    const isG4 = code.startsWith('G4');
    if (isG3) {
      return {
        label: `⚡ فوري (${code})`,
        bg: 'bg-cyan-950 text-cyan-300 border-cyan-500',
      };
    }
    if (isG4) {
      return {
        label: `⏳ مرجأ (${code})`,
        bg: 'bg-purple-950 text-purple-300 border-purple-500',
      };
    }
    return {
      label: `مجموعة (${code})`,
      bg: 'bg-slate-900 text-slate-300 border-slate-700',
    };
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {/* 🔔 Notification Bell & ✉️ Envelope Combo Button */}
      <button
        type="button"
        id="btn-collab-notifications-bell"
        onClick={() => {
          if (unreadCount > 0 && !showDropdown) {
            handleOpenTargetChat(defaultGroupToOpen);
          } else {
            setShowDropdown(!showDropdown);
          }
        }}
        className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border ${
          unreadCount > 0
            ? 'bg-gradient-to-r from-amber-500/25 to-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse'
            : 'bg-[#151226] border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50'
        }`}
        title="تنبيهات ورسائل المجموعات التعاونية"
      >
        <Mail className="w-4 h-4 text-cyan-400" />
        <Bell className="w-4 h-4 text-amber-400 -mr-1" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 border border-white text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Real-time Toast Alert (when new message arrives) */}
      {activeToast && (
        <div className="fixed top-20 left-4 sm:left-8 z-50 max-w-sm w-full bg-[#0c1228]/95 backdrop-blur-xl border-2 border-cyan-400 rounded-2xl p-4 shadow-[0_0_35px_rgba(6,182,212,0.45)] text-right animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getGroupBadge(activeToast.groupCode).bg}`}>
                    {getGroupBadge(activeToast.groupCode).label}
                  </span>
                  <span className="text-xs font-black text-white font-['Tajawal']">
                    {activeToast.role === 'admin' ? '👑 مشرف المنظومة (Admin)' : activeToast.sender}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400  block mt-0.5">
                  {activeToast.timestamp}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-200 mt-2.5 line-clamp-2 font-['IBM_Plex_Sans_Arabic'] bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            {activeToast.text}
          </p>

          <button
            type="button"
            id="btn-toast-go-to-chat"
            onClick={() => handleOpenTargetChat(activeToast.groupCode)}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/25 active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-slate-950" />
            <span>الانتقال إلى المحادثة الفعلية والرد 💬</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-[#0d1022]/98 backdrop-blur-2xl border-2 border-cyan-500/50 rounded-2xl shadow-2xl p-4 text-right animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-black text-cyan-300 font-['Cairo'] flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>تنبيهات المجموعات التعاونية</span>
            </span>
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-3 max-h-60 overflow-y-auto space-y-2">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs font-['Cairo']">
                لا توجد رسائل جديدة حالياً.
              </div>
            ) : (
              recentNotifications.map((n) => {
                const badge = getGroupBadge(n.groupCode);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleOpenTargetChat(n.groupCode)}
                    className="p-2.5 rounded-xl bg-[#141830] hover:bg-[#1a2040] border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-cyan-300 flex items-center gap-1">
                        <span>{n.sender}</span>
                        <span className={`px-1.5 py-0.2 rounded border text-[9px] ${badge.bg}`}>
                          {n.groupCode}
                        </span>
                      </span>
                      <span className="text-slate-500  text-[9px]">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-1">{n.text}</p>
                  </div>
                );
              })
            )}
          </div>

          <button
            type="button"
            id="btn-dropdown-go-to-chat"
            onClick={() => handleOpenTargetChat(defaultGroupToOpen)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-950" />
            <span>الانتقال إلى المحادثة الفعلية 💬</span>
          </button>
        </div>
      )}
    </div>
  );
};

