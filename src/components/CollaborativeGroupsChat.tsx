import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Shield,
  Lock,
  MessageSquare,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  User,
  Crown,
  Sparkles,
  Eye,
  Edit3,
  Bell,
  Mail,
  Flame,
  Radio,
  Layers,
  Check,
  Clock,
  Info,
  Zap,
} from 'lucide-react';
import {
  COLLABORATIVE_GROUPS_DEF,
  getCollaborativeGroupByUsername,
  getGroupByUsername,
  G3_COLLAB_GROUPS,
  G4_COLLAB_GROUPS,
  CollaborativeGroupCode,
} from '../data/studentAccounts';
import { CollaborativeNotificationBell } from './CollaborativeNotificationBell';
import {
  subscribeToCollabGroupChat,
  sendCollabGroupChatMessage,
  subscribeToCollabGroupTyping,
  updateCollabGroupTyping,
  CollabChatMessage,
} from '../utils/realtimeService';

interface CollaborativeGroupsChatProps {
  currentUsername: string;
  initialGroup?: string | null;
  onBackToHome?: () => void;
}

export const CollaborativeGroupsChat: React.FC<CollaborativeGroupsChatProps> = ({
  currentUsername,
  initialGroup,
  onBackToHome,
}) => {
  const isAdmin = currentUsername?.trim().toLowerCase() === 'admin';
  const userCollabGroup = getCollaborativeGroupByUsername(currentUsername);
  const userGroupMeta = getGroupByUsername(currentUsername);
  const isCompetitive = userGroupMeta?.learningMode === 'تنافسي';

  // Admin tab switcher: G3 (تعاوني فوري) or G4 (تعاوني مرجأ)
  const [adminModeTab, setAdminModeTab] = useState<'G3' | 'G4'>(() => {
    const pending = sessionStorage.getItem('cp_pending_collab_group');
    if (pending && pending.startsWith('G4')) return 'G4';
    if (initialGroup && initialGroup.startsWith('G4')) return 'G4';
    if (userCollabGroup && userCollabGroup.startsWith('G4')) return 'G4';
    return 'G3';
  });

  const [activeChatModalGroup, setActiveChatModalGroup] = useState<string | null>(() => {
    const pending = sessionStorage.getItem('cp_pending_collab_group');
    if (pending) {
      sessionStorage.removeItem('cp_pending_collab_group');
      if (isAdmin || !userCollabGroup || userCollabGroup === pending) {
        return pending;
      }
    }
    if (initialGroup) {
      if (isAdmin || !userCollabGroup || userCollabGroup === initialGroup) {
        return initialGroup;
      }
    }
    return null;
  });

  const [blockedAlert, setBlockedAlert] = useState<{ groupCode: string; groupName: string } | null>(null);

  // Group messages state per group code
  const [groupMessages, setGroupMessages] = useState<CollabChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Sync with initialGroup changes
  useEffect(() => {
    if (initialGroup) {
      if (initialGroup.startsWith('G4')) setAdminModeTab('G4');
      if (initialGroup.startsWith('G3')) setAdminModeTab('G3');
      handleOpenGroupChat(initialGroup);
    }
  }, [initialGroup]);

  // Check for any pending group to open from storage on mount
  useEffect(() => {
    const pending = sessionStorage.getItem('cp_pending_collab_group');
    if (pending) {
      sessionStorage.removeItem('cp_pending_collab_group');
      if (pending.startsWith('G4')) setAdminModeTab('G4');
      if (pending.startsWith('G3')) setAdminModeTab('G3');
      handleOpenGroupChat(pending);
    }
  }, []);

  // Listen to custom event to open a specific group chat from Navbar or notifications
  useEffect(() => {
    const handleOpenChatEvent = (e: any) => {
      const targetGroup = (e.detail?.groupCode || sessionStorage.getItem('cp_pending_collab_group')) as string;
      if (targetGroup) {
        if (targetGroup.startsWith('G4')) setAdminModeTab('G4');
        if (targetGroup.startsWith('G3')) setAdminModeTab('G3');
        handleOpenGroupChat(targetGroup);
      }
    };
    window.addEventListener('cp_open_collab_chat', handleOpenChatEvent);
    window.addEventListener('cp_navigate_to_collab_chat', handleOpenChatEvent);
    return () => {
      window.removeEventListener('cp_open_collab_chat', handleOpenChatEvent);
      window.removeEventListener('cp_navigate_to_collab_chat', handleOpenChatEvent);
    };
  }, [userCollabGroup, isAdmin]);

  // Subscribe to real-time messages from Firebase RTDB for the active group
  useEffect(() => {
    if (!activeChatModalGroup) {
      setGroupMessages([]);
      return;
    }

    const currentDef = COLLABORATIVE_GROUPS_DEF[activeChatModalGroup];
    const groupNameStr = currentDef?.name || `مجموعة (${activeChatModalGroup})`;

    const unsubChat = subscribeToCollabGroupChat(activeChatModalGroup, (msgs) => {
      if (msgs && msgs.length > 0) {
        setGroupMessages(msgs);
      } else {
        // Default initial welcome message from Admin if group chat is brand new
        const initialGreeting: CollabChatMessage = {
          id: `init_${activeChatModalGroup}`,
          sender: 'admin',
          role: 'admin',
          text: `مرحباً بكم يا أبطال في غرفة محادثة ${groupNameStr}. أنا مشرف المنظومة، متواجد معكم دائماً لمتابعة مناقشاتكم المشتركة وتوجيه خطواتكم التعاونية!`,
          timestamp: '10:00 ص',
          createdAt: 1000,
        };
        setGroupMessages([initialGreeting]);
      }
    });

    const unsubTyping = subscribeToCollabGroupTyping(activeChatModalGroup, (users) => {
      setTypingUsers(users.filter((u) => u !== currentUsername));
    });

    // Mark as read in localStorage
    try {
      localStorage.setItem(`cp_last_read_collab_${currentUsername}`, Date.now().toString());
    } catch {}

    return () => {
      unsubChat();
      unsubTyping();
      if (activeChatModalGroup) {
        updateCollabGroupTyping(activeChatModalGroup, currentUsername, false).catch(() => {});
      }
    };
  }, [activeChatModalGroup, currentUsername]);

  // Announce student entry in real-time when entering chat
  useEffect(() => {
    if (activeChatModalGroup && currentUsername) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      const entryKey = `cp_announced_entry_${activeChatModalGroup}_${currentUsername}`;
      const lastAnnounced = parseInt(sessionStorage.getItem(entryKey) || '0', 10);

      // Announce entry once per 10 minutes per session to prevent clutter
      if (Date.now() - lastAnnounced > 10 * 60 * 1000) {
        sessionStorage.setItem(entryKey, Date.now().toString());

        const entryMsg: CollabChatMessage = {
          id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          sender: 'النظام',
          role: 'admin',
          text: `🟢 دخل الطالب (${currentUsername}) إلى غرفة محادثة المجموعة.`,
          timestamp: timeStr,
          createdAt: Date.now(),
        };

        sendCollabGroupChatMessage(activeChatModalGroup, entryMsg).catch(() => {});
      }
    }
  }, [activeChatModalGroup, currentUsername]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [groupMessages, typingUsers, activeChatModalGroup]);

  const handleOpenGroupChat = (groupCode: string) => {
    // If student attempts to enter another triad
    if (!isAdmin && userCollabGroup && userCollabGroup !== groupCode) {
      const def = COLLABORATIVE_GROUPS_DEF[groupCode];
      setBlockedAlert({ groupCode, groupName: def ? def.name : groupCode });
      return;
    }
    setActiveChatModalGroup(groupCode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (activeChatModalGroup) {
      updateCollabGroupTyping(activeChatModalGroup, currentUsername, true).catch(() => {});

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (activeChatModalGroup) {
          updateCollabGroupTyping(activeChatModalGroup, currentUsername, false).catch(() => {});
        }
      }, 3000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatModalGroup) return;

    const messageText = inputText.trim();
    setInputText('');

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    updateCollabGroupTyping(activeChatModalGroup, currentUsername, false).catch(() => {});

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const newMsg: CollabChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender: currentUsername,
      role: isAdmin ? 'admin' : 'student',
      text: messageText,
      timestamp: timeStr,
      createdAt: Date.now(),
    };

    // Optimistic local UI update
    setGroupMessages((prev) => [...prev, newMsg]);

    // Send to Firebase RTDB for instant real-time broadcast strictly to this triad
    await sendCollabGroupChatMessage(activeChatModalGroup, newMsg);
  };

  // If competitive student accesses this section
  if (isCompetitive && !isAdmin) {
    return (
      <div className="rounded-3xl bg-[#0b0c1b] border-2 border-red-500/50 p-8 text-right font-['Cairo'] shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-red-400">
          <Lock className="w-8 h-8 text-red-400" />
          <h2 className="text-xl font-black font-['Tajawal']">
            قسم شات ومجموعات التعاون مخصص للنمط التعاوني فقط
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-['IBM_Plex_Sans_Arabic']">
          أنت مسجل في المجموعة البحثية التنافسية (<strong className="text-white font-bold font-['Cairo']">{currentUsername}</strong> - <span className="text-slate-900 bg-slate-200 px-2 py-0.5 rounded font-['Cairo'] font-black text-xs inline-block">{userGroupMeta?.name}</span>).
          <br />
          وفقاً لضوابط العزل التجريبي للدراسة، يتنافس طلاب المجموعات التنافسية فردياً دون غرف محادثة تشاركية.
        </p>
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            العودة للمنصة الرئيسية
          </button>
        )}
      </div>
    );
  }

  // Active groups to display:
  // For Admin: depends on selected tab ('G3' or 'G4')
  // For Student: depends on their assigned mode ('G3' for G3, 'G4' for G4)
  const effectiveMode = isAdmin ? adminModeTab : (userCollabGroup?.startsWith('G4') ? 'G4' : 'G3');
  const activeCodesList = effectiveMode === 'G3' ? G3_COLLAB_GROUPS : G4_COLLAB_GROUPS;
  const activeGroupsList = activeCodesList.map((code) => COLLABORATIVE_GROUPS_DEF[code]).filter(Boolean);

  const activeModalDef = activeChatModalGroup ? COLLABORATIVE_GROUPS_DEF[activeChatModalGroup] : null;

  return (
    <section className="space-y-6 text-right font-['Cairo',_sans-serif]" id="collaborative-groups-section">
      {/* Blocked Alert Modal (Strict Triad Isolation) */}
      {blockedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0f0c1f] border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-right shadow-[0_0_50px_rgba(239,68,68,0.4)] space-y-4">
            <div className="flex items-center gap-3 text-red-400 pb-3 border-b border-red-900/50">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center shrink-0 shadow-inner">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-red-400 font-['Tajawal']">
                  عذراً، لا يمكنك دخول هذه المجموعة
                </h3>
                <span className="text-xs text-red-300 font-['Cairo']">
                  ضوابط العزل التجريبي الصارم (3 طلاب فقط + المشرف لكل مجموعة)
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-['IBM_Plex_Sans_Arabic']">
              طالبنا العزيز (<strong className="text-white font-bold font-['Cairo']">{currentUsername}</strong>)، أنت مقيد رسمياً في:
              <br />
              <span className="inline-block mt-2 px-3 py-1.5 rounded-xl bg-slate-200 border border-slate-300 text-slate-900 font-black font-['Cairo'] text-xs shadow-sm">
                🤝 {userCollabGroup ? COLLABORATIVE_GROUPS_DEF[userCollabGroup]?.name : 'غير مسجل'}
              </span>
            </p>

            <p className="text-xs text-slate-300 leading-relaxed font-['IBM_Plex_Sans_Arabic']">
              كل مجموعة مكونة بدقة من 3 طلاب والمشرف فقط، ولا يسمح بالخلط أو انتقال الرسائل والإشعارات بين المجموعات نهائياً لضمان سلامة نتائج التجربة البحثية.
            </p>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-end gap-2">
              {userCollabGroup && (
                <button
                  type="button"
                  onClick={() => {
                    setBlockedAlert(null);
                    handleOpenGroupChat(userCollabGroup);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg"
                >
                  الانتقال إلى مجموعتي الخاصة ({userCollabGroup}) 🚀
                </button>
              )}
              <button
                type="button"
                onClick={() => setBlockedAlert(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📢 صندوق التنبيه للدورات الموجودة في التعاوني */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0b1426] via-[#0e1933] to-[#0b1426] border-2 border-cyan-400/80 p-5 sm:p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] text-right relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center shrink-0 shadow-inner">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-black">
                  📢 التنبيهات المباشرة
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>تزامن سحابي حي نشط</span>
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white font-['Tajawal'] mt-1.5">
                مجموعات العمل التعاوني
              </h3>
            </div>
          </div>

          {userCollabGroup && (
            <button
              type="button"
              onClick={() => handleOpenGroupChat(userCollabGroup)}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>دخول شات مجموعتي ({userCollabGroup}) 💬</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector Tabs (For Admin Only - Switches between G3 and G4) */}
      {isAdmin && (
        <div className="p-3 rounded-2xl bg-[#090b17] border border-slate-800 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300 pr-2">اختر النمط التعاوني:</span>
          <button
            type="button"
            onClick={() => setAdminModeTab('G3')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              adminModeTab === 'G3'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ مجموعات التعاون الفوري (G3) - 5 مجموعات ثلاثية</span>
          </button>
          <button
            type="button"
            onClick={() => setAdminModeTab('G4')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              adminModeTab === 'G4'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] ring-2 ring-purple-400'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>⏳ مجموعات التعاون المرجأ (G4) - 5 مجموعات ثلاثية</span>
          </button>
        </div>
      )}

      {/* Header Banner & Groups Cards */}
      <div className="rounded-3xl bg-[#0b0914] border-2 border-cyan-500/70 p-6 sm:p-8 shadow-[0_0_35px_rgba(6,182,212,0.2)] text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black px-3 py-0.5 rounded-full border ${
                  effectiveMode === 'G3'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-purple-950 border-purple-400 text-purple-300'
                }`}>
                  {effectiveMode === 'G3' ? '⚡ نمط التعاون الفوري (G3)' : '⏳ نمط التعاون المرجأ (G4)'}
                </span>
                <span className="text-xs font-black px-3.5 py-1 rounded-xl bg-slate-200 border border-slate-300 text-slate-900 font-['Cairo']">
                  5 مجموعات ثلاثية معزولة تماماً (3 طلاب + المشرف لكل فريق)
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
                {effectiveMode === 'G3'
                  ? 'غرف شات ومجموعات التعاون الفوري (G3-A إلى G3-E)'
                  : 'غرف شات ومجموعات التعاون المرجأ (G4-A إلى G4-E)'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-['IBM_Plex_Sans_Arabic']">
                {isAdmin ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-400 inline" />
                    <span>حساب المشرف العام (Admin): يمكنك الدخول لأي مجموعة من المجموعات الـ 10 ومتابعة المحادثات والرد المباشر.</span>
                  </span>
                ) : userCollabGroup ? (
                  <span className="text-cyan-300 font-bold">
                    أنت مسجل رسمياً في: {COLLABORATIVE_GROUPS_DEF[userCollabGroup]?.name} (3 طلاب والمشرف فقط).
                  </span>
                ) : (
                  'كل مجموعة تتكون من 3 طلاب + المشرف المتواجد تلقائياً في الشات.'
                )}
              </p>
            </div>
          </div>

          {/* Quick Notification Bell & Envelope Widget in Collaborative Header Bar */}
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#0f142b]/90 border border-cyan-500/50 shadow-inner">
            <span className="text-xs font-bold text-cyan-300 font-['Cairo'] hidden sm:inline">
              صندوق التنبيهات والظرف ✉️🔔:
            </span>
            <CollaborativeNotificationBell
              currentUsername={currentUsername}
              onOpenChat={handleOpenGroupChat}
            />
          </div>
        </div>

        {/* 5 Triads Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeGroupsList.map((group) => {
            const isMyGroup = userCollabGroup === group.code;

            return (
              <div
                key={group.code}
                onClick={() => handleOpenGroupChat(group.code)}
                className={`rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#111026] via-[#0c0a1a] to-[#070612] ${
                  isMyGroup
                    ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/50'
                    : isAdmin
                    ? 'border-emerald-500/60 hover:border-emerald-400'
                    : 'border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                {isMyGroup && (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    <span>فريقك التعاوني</span>
                  </div>
                )}
                {isAdmin && !isMyGroup && (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-black flex items-center gap-1 shadow-md">
                    <Eye className="w-3 h-3" />
                    <span>متاح للأدمن (إشراف)</span>
                  </div>
                )}
                {!isAdmin && !isMyGroup && (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500 text-red-300 text-[10px] font-black flex items-center gap-1 shadow-md">
                    <Lock className="w-3 h-3 text-red-400" />
                    <span>مغلق لغير أعضاء الفريق</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 text-slate-900 font-black font-['Cairo'] text-sm flex items-center justify-center shadow-inner">
                      {group.code}
                    </span>
                    <div>
                      <div className="px-2.5 py-0.5 rounded-lg bg-slate-200 border border-slate-300 inline-block mb-1">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Cairo']">
                          {group.name}
                        </h3>
                      </div>
                      <span className="block text-[11px] text-slate-300 font-bold font-['Cairo']">
                        3 طلاب + المشرف (عزل كامل)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-['Cairo'] mt-2 leading-relaxed">
                    {group.description}
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <div className="text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1 font-['Cairo']">
                      <Users className="w-3.5 h-3.5" />
                      <span>أعضاء الفريق (3 طلاب):</span>
                    </div>
                    {group.members.map((memberUser) => (
                      <div key={memberUser} className="flex items-center justify-between  text-slate-200 text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span>{memberUser}</span>
                        </span>
                        {memberUser === currentUsername && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500">أنت</span>
                        )}
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between  text-xs text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>مشرف المنظومة (Admin)</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500">متواجد تلقائياً 🟢</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenGroupChat(group.code);
                    }}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                      isMyGroup || isAdmin
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isMyGroup || isAdmin ? 'دخول الشات والسجل 💬' : 'محمي بضوابط العزل 🔒'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Group Chat Room Modal with Real-time Firebase RTDB Sync & Full History */}
      {activeChatModalGroup && activeModalDef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0918] border-2 border-cyan-400 rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#110e26] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300  font-black text-sm flex items-center justify-center">
                  {activeChatModalGroup}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
                    {activeModalDef.name}
                  </h3>
                  <span className="text-xs text-cyan-300 font-['Cairo'] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>متصل الآن • 3 طلاب ({activeModalDef.members.join(', ')}) + المشرف</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveChatModalGroup(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق الشات ✕
              </button>
            </div>

            {/* Chat Messages History Box */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#070510]" id="chat-messages-container">
              {groupMessages.map((msg) => {
                const isMe = msg.sender === currentUsername;
                const isMsgAdmin = msg.role === 'admin';
                const isSystem = msg.sender === 'النظام';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <span className="px-4 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold ">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] text-slate-400 ">{msg.timestamp}</span>
                      <span
                        className={`text-xs font-bold  px-2 py-0.5 rounded-md ${
                          isMsgAdmin
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                            : 'bg-slate-800 text-cyan-300'
                        }`}
                      >
                        {isMsgAdmin ? '👑 المشرف (Admin)' : msg.sender}
                      </span>
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                        isMe
                          ? 'bg-cyan-600 text-white rounded-tr-none'
                          : isMsgAdmin
                          ? 'bg-[#1e152f] border border-amber-500/50 text-amber-100 rounded-tl-none'
                          : 'bg-[#131026] border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="font-['IBM_Plex_Sans_Arabic'] whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {/* Real-time Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold animate-pulse px-2 py-1">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{typingUsers.join(', ')} يكتب رسالة الآن... ✍️</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-[#110e26] border-t border-slate-800 flex items-center gap-2"
            >
              <input
                id="collab-chat-input-field"
                type="text"
                autoFocus
                value={inputText}
                onChange={handleInputChange}
                placeholder={`اكتب رسالتك لزملائك في فريق (${activeChatModalGroup})...`}
                className="flex-1 h-11 px-4 rounded-xl bg-[#070510] text-white text-xs sm:text-sm placeholder:text-slate-500 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-right font-['IBM_Plex_Sans_Arabic']"
              />
              <button
                type="submit"
                className="h-11 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>إرسال</span>
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
