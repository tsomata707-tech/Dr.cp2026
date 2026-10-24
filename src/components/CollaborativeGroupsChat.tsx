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
} from 'lucide-react';
import { COLLABORATIVE_GROUPS_DEF, getCollaborativeGroupByUsername } from '../data/studentAccounts';
import {
  subscribeToCollabGroupChat,
  sendCollabGroupChatMessage,
  subscribeToCollabGroupTyping,
  updateCollabGroupTyping,
  CollabChatMessage,
} from '../utils/realtimeService';

interface CollaborativeGroupsChatProps {
  currentUsername: string;
  onBackToHome?: () => void;
}

export const CollaborativeGroupsChat: React.FC<CollaborativeGroupsChatProps> = ({
  currentUsername,
  onBackToHome,
}) => {
  const isAdmin = currentUsername?.trim().toLowerCase() === 'admin';
  const userCollabGroup = getCollaborativeGroupByUsername(currentUsername);

  const [activeChatModalGroup, setActiveChatModalGroup] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(null);
  const [blockedAlert, setBlockedAlert] = useState<{ groupCode: string; groupName: string } | null>(null);

  // Group messages state per group code
  const [groupMessages, setGroupMessages] = useState<CollabChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Listen to custom event to open a specific group chat from Navbar or notifications
  useEffect(() => {
    const handleOpenChatEvent = (e: any) => {
      const targetGroup = e.detail?.groupCode as 'A' | 'B' | 'C' | 'D' | 'E';
      if (targetGroup) {
        handleOpenGroupChat(targetGroup);
      }
    };
    window.addEventListener('cp_open_collab_chat', handleOpenChatEvent);
    return () => window.removeEventListener('cp_open_collab_chat', handleOpenChatEvent);
  }, [userCollabGroup, isAdmin]);

  // Subscribe to real-time messages from Firebase RTDB for the active group
  useEffect(() => {
    if (!activeChatModalGroup) {
      setGroupMessages([]);
      return;
    }

    const unsubChat = subscribeToCollabGroupChat(activeChatModalGroup, (msgs) => {
      if (msgs && msgs.length > 0) {
        setGroupMessages(msgs);
      } else {
        // Default initial welcome message from Admin if group chat is brand new
        const initialGreeting: CollabChatMessage = {
          id: `init_${activeChatModalGroup}`,
          sender: 'admin',
          role: 'admin',
          text: `مرحباً بكم في غرفة محادثة مجموعة التعاون (${activeChatModalGroup}). أنا مشرف المنظومة، متواجد معكم دائماً لمتابعة مناقشاتكم وتوجيه خطواتكم التعاونية!`,
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

  const handleOpenGroupChat = (groupCode: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (!isAdmin && userCollabGroup && userCollabGroup !== groupCode) {
      const def = COLLABORATIVE_GROUPS_DEF[groupCode];
      setBlockedAlert({ groupCode, groupName: def.name });
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

    // Send to Firebase RTDB for instant real-time broadcast across all browsers & devices
    await sendCollabGroupChatMessage(activeChatModalGroup, newMsg);
  };

  const groupsList = Object.values(COLLABORATIVE_GROUPS_DEF);

  return (
    <section className="space-y-6 text-right font-['Cairo',_sans-serif]" id="collaborative-groups-section">
      {/* Blocked Alert Modal (Strict Group Isolation) */}
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
                  ضوابط العزل التجريبي وعزل المجموعات التعاونية عن التنافسي
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-['IBM_Plex_Sans_Arabic']">
              طالبنا العزيز (<strong className="text-[#ffd700] font-mono">{currentUsername}</strong>)، أنت مقيد رسمياً في:
              <br />
              <span className="inline-block mt-2 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-black text-xs shadow-sm">
                🤝 المجموعة التعاونية ({userCollabGroup || 'غير مسجل'})
              </span>
            </p>

            <p className="text-xs text-slate-300 leading-relaxed font-['IBM_Plex_Sans_Arabic']">
              لا يمكن لأي طالب سوى دخول مجموعته الخاصة فقط وفقاً لتصميم التجربة البحثية.
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

      {/* 📢 صندوق التنبيه للدورات الموجودة في التعاوني (Notification Box for Collaborative Rounds & Cycles) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0b1426] via-[#0e1933] to-[#0b1426] border-2 border-cyan-400/80 p-5 sm:p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] text-right relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center shrink-0 shadow-inner">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-black">
                  📢 صندوق تنبيهات الدورات التعاونية الحية
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>تزامن سحابي حي (Firebase RTDB متصل)</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] mt-1.5">
                دورات العمل التشاركي لإنتاج وتصميم الوسائط المتعددة (Adobe Captivate 2019)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed font-['IBM_Plex_Sans_Arabic']">
                • <strong>نظام الإجابة الموحدة:</strong> يتعاون الثلاثة طلاب كفريق واحد في حل تحديات المستويات، وتُسجل إجابة الفريق معاً.
                <br />
                • <strong>التنبيهات الفورية:</strong> تظهر علامة الظرف ✉️ وجرس التنبيهات 🔔 تلقائياً عند وصول أي رسالة من زملاء المجموعة أو المشرف، مع إشعار صوتي فوري.
              </p>
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

      {/* Header Banner & Groups Cards */}
      <div className="rounded-3xl bg-[#0b0914] border-2 border-cyan-500/70 p-6 sm:p-8 shadow-[0_0_35px_rgba(6,182,212,0.2)] text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-['Cairo']">
                  المجموعات التعاونية الخمس (A, B, C, D, E)
                </span>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-amber-950/80 border border-[#ffd700] text-amber-300 font-['Cairo']">
                  مزامنة لحظية مباشرة عبر خادم Firebase RTDB 🚀
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
                غرف العمل الجماعي وشات المجموعات التعاونية
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-['IBM_Plex_Sans_Arabic']">
                {isAdmin ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-400 inline" />
                    <span>حساب المشرف (admin): يمكنك الدخول لأي مجموعة (A, B, C, D, E) وقراءة والرد على الرسائل الحية.</span>
                  </span>
                ) : userCollabGroup ? (
                  <span className="text-cyan-300 font-bold">
                    أنت مسجل في المجموعة التعاونية ({userCollabGroup}) - 3 أعضاء مع المشرف المتواجد آلياً.
                  </span>
                ) : (
                  'كل مجموعة تتكون من 3 طلاب + المشرف المتواجد تلقائياً في الشات.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 5 Groups Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupsList.map((group) => {
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
                    : 'border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                {isMyGroup && (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    <span>مجموعتك التعاونية</span>
                  </div>
                )}
                {isAdmin && !isMyGroup && (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-black flex items-center gap-1 shadow-md">
                    <Eye className="w-3 h-3" />
                    <span>متاح للأدمن (دخول الشات)</span>
                  </div>
                )}
                {!isAdmin && !isMyGroup && (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500 text-red-300 text-[10px] font-black flex items-center gap-1 shadow-md">
                    <Lock className="w-3 h-3 text-red-400" />
                    <span>مغلق لغير أعضاء المجموعة</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono font-black text-base flex items-center justify-center shadow-inner">
                      {group.code}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-white font-['Tajawal']">
                        مجموعة التعاون ({group.code})
                      </h3>
                      <span className="text-[11px] text-cyan-300/90 font-bold font-['Cairo']">
                        3 طلاب + المشرف
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-['IBM_Plex_Sans_Arabic'] mt-2 leading-relaxed">
                    {group.description}
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <div className="text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>أعضاء المجموعة:</span>
                    </div>
                    {group.members.map((memberUser) => (
                      <div key={memberUser} className="flex items-center justify-between font-mono text-slate-200 text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span>{memberUser}</span>
                        </span>
                        {memberUser === currentUsername && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500">أنت</span>
                        )}
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-mono text-xs text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>مشرف المنظومة (Admin)</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500">متواجد تلقائياً 🟢</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">شات حي عبر Firebase</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenGroupChat(group.code);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>دخول الشات والسجل 💬</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Group Chat Room Modal with Real-time Firebase RTDB Sync & Full History */}
      {activeChatModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0918] border-2 border-cyan-400 rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#110e26] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono font-black text-lg flex items-center justify-center">
                  {activeChatModalGroup}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
                    سجل محادثة مجموعة التعاون ({activeChatModalGroup})
                  </h3>
                  <span className="text-xs text-cyan-300 font-['Cairo'] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>متصل الآن عبر Firebase RTDB • رسائل حية لجميع الأجهزة</span>
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
                      <span className="px-4 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold font-mono">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
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
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={`اكتب رسالتك في الوقت الحقيقي لمجموعة (${activeChatModalGroup})...`}
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
