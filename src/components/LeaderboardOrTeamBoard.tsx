import React from 'react';
import {
  Trophy,
  Users,
  Flame,
  Award,
  Crown,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Shield,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { getGroupByUsername } from '../data/studentAccounts';
import { getStudentProgress, getAllStudentsProgress } from '../utils/gameStorage';
import { CARTOON_AVATARS } from '../data/gameLevelsData';

interface LeaderboardOrTeamBoardProps {
  currentUsername: string;
}

export const LeaderboardOrTeamBoard: React.FC<LeaderboardOrTeamBoardProps> = ({ currentUsername }) => {
  const groupMeta = getGroupByUsername(currentUsername);
  const isCollaborative = groupMeta?.learningMode === 'تعاوني';
  const groupCode = groupMeta?.code || 'G1';
  const myProgress = getStudentProgress(currentUsername);
  const allProgress = getAllStudentsProgress();

  // Load the 15 students of this specific group with their REAL stored progress
  const groupStudents = Array.from({ length: 15 }, (_, i) => {
    const pad = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
    const uName = `${groupCode}_Cp_${pad}`;
    const isMe = uName.toLowerCase() === currentUsername.toLowerCase();
    const realStudent = allProgress[uName] || (isMe ? myProgress : null);

    const avatar =
      CARTOON_AVATARS.find((a) => a.id === realStudent?.avatarId) ||
      CARTOON_AVATARS[i % CARTOON_AVATARS.length];
    const realScore = realStudent ? realStudent.totalScore : 0;
    const completedLevels = realStudent ? Object.keys(realStudent.completedLevels || {}).length : 0;

    return {
      username: uName,
      fullName: uName,
      isMe,
      avatar,
      score: realScore,
      completedLevels,
      badge: realStudent?.badges?.[0] || (realScore > 0 ? avatar.title : 'في بداية المسار'),
    };
  });

  // Sort by score for competitive mode
  const sortedStudents = [...groupStudents].sort((a, b) => b.score - a.score);
  const myRank = sortedStudents.findIndex((s) => s.isMe) + 1;

  // Collaborative team metrics
  const teamTotalScore = groupStudents.reduce((acc, s) => acc + s.score, 0);
  const teamTargetScore = 6000;
  const teamProgressPercentage = Math.min(100, Math.round((teamTotalScore / teamTargetScore) * 100));

  const teamName = groupCode === 'G3' ? 'فريق المبدعين (Creative Team)' : 'فريق الرواد (Pioneers Team)';

  if (isCollaborative) {
    /* ----------------------------------------------------------------------- */
    /* COLLABORATIVE TREATMENT (G3 & G4): TEAM PROGRESS BOARD (NO RANKING WAR) */
    /* ----------------------------------------------------------------------- */
    return (
      <div className="space-y-6 text-right font-['Cairo',_sans-serif] animate-fadeIn" id="collaborative-team-board">
        {/* Team Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/70 via-[#130f28] to-indigo-950/70 border-2 border-purple-500/50 p-6 sm:p-8 shadow-[0_0_35px_rgba(168,85,247,0.25)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-purple-500/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(168,85,247,0.4)] shrink-0">
                👥
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3.5 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-900 text-xs font-black font-['Cairo'] shadow-sm">
                    المعالجة التجريبية: التعلم التعاوني المشترك
                  </span>
                  <span className="px-3.5 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-900 text-xs font-black font-['Cairo'] shadow-sm">
                    {groupMeta?.name}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-['Tajawal']">
                  لوحة إنجاز الفريق: {teamName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  هنا يتعاون جميع طلاب المجموعة الـ 15 بتكاتف وتكامل لتحقيق هدف الفريق الموحد في إنتاج الوسائط المتعددة ببرنامج Captivate.
                </p>
              </div>
            </div>

            {/* Team Goal Badge */}
            <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-500/50 text-center shrink-0 w-full md:w-auto">
              <span className="text-xs text-purple-300 block font-bold">رصيد الفريق المشترك</span>
              <span className="text-2xl sm:text-3xl font-black text-[#ffd700] font-['Outfit']">
                {teamTotalScore} <span className="text-xs text-amber-200">/ {teamTargetScore} XP</span>
              </span>
            </div>
          </div>

          {/* Collective Goal Progress Bar */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-400" />
                <span>التقدم الجماعي نحو الهدف العام للفريق:</span>
              </span>
              <span className="text-xs font-black text-[#ffd700] ">
                {teamProgressPercentage}% مكتمل
              </span>
            </div>
            <div className="w-full h-4 rounded-full bg-slate-900 border border-slate-800 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-[#ffd700] transition-all duration-1000 rounded-full"
                style={{ width: `${teamProgressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Team Pillars & Collaboration Harmony */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#0b0e1e] border border-purple-500/30 text-center">
            <span className="text-xs text-slate-400 block font-bold mb-1">أعضاء الفريق المتكاتفين</span>
            <span className="text-2xl font-black text-white font-['Outfit']">15 طالباً</span>
            <span className="text-[11px] text-purple-300 block mt-1">يعملون كجسد واحد 🤝</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b0e1e] border border-blue-500/30 text-center">
            <span className="text-xs text-slate-400 block font-bold mb-1">المهام التعاونية المنجزة</span>
            <span className="text-2xl font-black text-blue-300 font-['Outfit']">
              {groupStudents.reduce((acc, s) => acc + s.completedLevels, 0)} مهمة
            </span>
            <span className="text-[11px] text-blue-200 block mt-1">مساهمات موزعة بالتساوي</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b0e1e] border border-emerald-500/30 text-center">
            <span className="text-xs text-slate-400 block font-bold mb-1">روح الفريق والتعزيز</span>
            <span className="text-2xl font-black text-emerald-300 font-['Outfit']">100% تكاملي</span>
            <span className="text-[11px] text-emerald-200 block mt-1">غياب الصراع الفردي</span>
          </div>
        </div>

        {/* 15 Team Members Grid (Friendly Collaboration Cards, No 1st/2nd/3rd ranks) */}
        <div className="rounded-3xl bg-[#080b18] border-2 border-purple-500/30 p-6 text-right">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-white font-['Tajawal'] flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>أعضاء {teamName} ومساهماتهم الإيجابية</span>
            </h3>
            <span className="text-xs text-slate-400">جميع الأعضاء متساوون في تقدير الفريق</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groupStudents.map((st) => (
              <div
                key={st.username}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                  st.isMe
                    ? 'bg-purple-950/60 border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.25)] ring-1 ring-[#ffd700]'
                    : 'bg-[#0f1426] border-slate-800 hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-purple-950 border border-purple-500/40 flex items-center justify-center text-2xl shrink-0">
                    {st.avatar.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white ">{st.username}</span>
                      {st.isMe && (
                        <span className="px-1.5 py-0.2 rounded bg-[#ffd700] text-slate-950 text-[9px] font-black">
                          أنت
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-purple-300 font-bold block">{st.avatar.title}</span>
                    <span className="text-[10px] text-slate-400 ">
                      ساهم بـ: {st.completedLevels} مراحل
                    </span>
                  </div>
                </div>

                <div className="text-left ">
                  <span className="text-xs font-black text-[#ffd700]">+{st.score} XP</span>
                  <span className="text-[9px] text-slate-500 block">لصالح الفريق</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* COMPETITIVE TREATMENT (G1 & G2): INDIVIDUAL LEADERBOARD WITH PODIUM     */
  /* ----------------------------------------------------------------------- */
  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif] animate-fadeIn" id="competitive-leaderboard">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/70 via-[#181324] to-[#0d0a17] border-2 border-[#ffd700] p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#ffd700]/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#d4af37] via-[#ffd700] to-amber-500 text-slate-950 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,215,0,0.5)] shrink-0">
              <Trophy className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3.5 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-900 text-xs font-black font-['Cairo'] shadow-sm">
                  المعالجة التجريبية: التنافس التفاعلي الفردي
                </span>
                <span className="px-3.5 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-900 text-xs font-black font-['Cairo'] shadow-sm">
                  {groupMeta?.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-['Tajawal']">
                لوحة المتصدرين الفردية (Leaderboard)
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                تنافس بين طلاب المجموعة الـ 15 لإثبات الجدارة وحصد أعلى النقاط الذهبية وإتقان مهارات Captivate.
              </p>
            </div>
          </div>

          {/* Current Student Rank */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-[#ffd700] text-center shrink-0 w-full md:w-auto shadow-lg">
            <span className="text-xs text-amber-300 block font-bold">ترتيبك الفردي الحالي</span>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-3xl font-black text-white font-['Outfit']">
                #{myRank}
              </span>
              <span className="text-xs text-slate-400 ">من أصل 15</span>
            </div>
          </div>
        </div>

        {/* Podium Top 3 */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-3xl mx-auto">
          {/* 2nd Place */}
          {sortedStudents[1] && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border-2 border-slate-400 text-center flex flex-col items-center order-2 sm:order-1 shadow-md">
              <span className="text-2xl mb-1">🥈</span>
              <span className="text-xs font-bold text-slate-300">المركز الثاني</span>
              <span className="text-sm font-black text-white mt-1 ">{sortedStudents[1].username}</span>
              <span className="text-xs text-amber-300 font-bold font-['Outfit']">{sortedStudents[1].score} XP</span>
            </div>
          )}

          {/* 1st Place */}
          {sortedStudents[0] && (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/80 to-[#120e22] border-2 border-[#ffd700] text-center flex flex-col items-center order-1 sm:order-2 shadow-[0_0_30px_rgba(255,215,0,0.35)] -translate-y-2">
              <span className="text-3xl mb-1">🥇</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffd700] text-slate-950 text-[10px] font-black mb-1">
                بطل الصدارة
              </span>
              <span className="text-base font-black text-white ">{sortedStudents[0].username}</span>
              <span className="text-sm text-[#ffd700] font-black font-['Outfit'] mt-1">{sortedStudents[0].score} XP</span>
            </div>
          )}

          {/* 3rd Place */}
          {sortedStudents[2] && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border-2 border-amber-700 text-center flex flex-col items-center order-3 shadow-md">
              <span className="text-2xl mb-1">🥉</span>
              <span className="text-xs font-bold text-amber-500">المركز الثالث</span>
              <span className="text-sm font-black text-white mt-1 ">{sortedStudents[2].username}</span>
              <span className="text-xs text-amber-300 font-bold font-['Outfit']">{sortedStudents[2].score} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Full 15-Student Leaderboard Table */}
      <div className="rounded-3xl bg-[#090714] border-2 border-[#ffd700]/40 p-6 overflow-hidden">
        <h3 className="text-base font-black text-white font-['Tajawal'] mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ffd700]" />
          <span>جدول الترتيب الشامل لطلاب {groupCode} (15 طالباً)</span>
        </h3>

        <div className="space-y-2">
          {sortedStudents.map((st, idx) => (
            <div
              key={st.username}
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                st.isMe
                  ? 'bg-amber-950/60 border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.3)] ring-1 ring-[#ffd700]'
                  : 'bg-[#0f0c1f] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Rank & Student */}
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs  shrink-0 ${
                  idx === 0
                    ? 'bg-[#ffd700] text-slate-950 font-bold'
                    : idx === 1
                    ? 'bg-slate-300 text-slate-950'
                    : idx === 2
                    ? 'bg-amber-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  #{idx + 1}
                </span>

                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                  {st.avatar.emoji}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-white ">{st.username}</span>
                    {st.isMe && (
                      <span className="px-2 py-0.5 rounded-full bg-[#ffd700] text-slate-950 text-[10px] font-black">
                        أنت
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{st.badge}</span>
                </div>
              </div>

              {/* Progress and Score */}
              <div className="flex items-center gap-4 text-left">
                <div className="hidden sm:block text-right">
                  <span className="text-[10px] text-slate-400 block ">المراحل المكتملة</span>
                  <span className="text-xs font-bold text-emerald-400 ">
                    {st.completedLevels} / 10
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 min-w-[90px] text-center">
                  <span className="text-sm sm:text-base font-black text-[#ffd700] font-['Outfit'] block">
                    {st.score} XP
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
