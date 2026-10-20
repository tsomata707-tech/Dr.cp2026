import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Award, Crown, Star, Sparkles, UserCheck, Play, ArrowLeft } from 'lucide-react';
import { SupervisorsHonorBoard } from './SupervisorsHonorBoard';
import { getAllStudentsProgress } from '../utils/gameStorage';
import { getGroupByUsername } from '../data/studentAccounts';
import { CARTOON_AVATARS } from '../data/gameLevelsData';

export interface HonorStudent {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatarBg: string;
  points: number;
  completedLevels: number;
  groupName: string;
  badge: string;
  specialty: string;
}

interface HonorBoardProps {
  currentUsername?: string;
  defaultView?: 'supervisors' | 'students';
  onContinueToInstructions?: () => void;
  onContinueToPreTest?: () => void;
}

export const HonorBoard: React.FC<HonorBoardProps> = ({
  currentUsername = '',
  defaultView = 'supervisors',
  onContinueToInstructions,
  onContinueToPreTest,
}) => {
  const [activeView, setActiveView] = useState<'supervisors' | 'students'>(defaultView);

  // Compute REAL students from actual game progress (no mock/fake data)
  const realHonorStudents: HonorStudent[] = useMemo(() => {
    const allProgress = getAllStudentsProgress();
    const studentsList = Object.values(allProgress);

    // Only include students who have started, scored points, or completed levels (excluding read-only admin)
    const activeOnes = studentsList.filter(
      (s) => s.username.toLowerCase() !== 'admin' && (s.totalScore > 0 || Object.keys(s.completedLevels || {}).length > 0)
    );

    // Sort by real score descending
    activeOnes.sort((a, b) => b.totalScore - a.totalScore);

    return activeOnes.map((s, index) => {
      const groupMeta = getGroupByUsername(s.username);
      const avatar =
        CARTOON_AVATARS.find((a) => a.id === s.avatarId) ||
        CARTOON_AVATARS[index % CARTOON_AVATARS.length];

      return {
        id: s.username,
        rank: index + 1,
        name: s.username,
        username: s.username,
        avatarBg: avatar.bgGradient,
        points: s.totalScore,
        completedLevels: Object.keys(s.completedLevels || {}).length,
        groupName: groupMeta ? groupMeta.name : '',
        badge: s.badges?.[0] || 'فارس التميز الرقمي',
        specialty: 'تكنولوجيا التعليم - جامعة طنطا',
      };
    });
  }, [currentUsername]);

  return (
    <section className="space-y-6 text-right font-['Cairo',_sans-serif]" id="honor-board-section">
      {/* View Switcher Tabs: مشرفي المشروع vs أوائل الطلاب */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 p-1 sm:p-1.5 rounded-2xl bg-[#0b081b] border-2 border-amber-500/40 max-w-xl mx-auto shadow-lg">
        <button
          type="button"
          onClick={() => setActiveView('supervisors')}
          className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
            activeView === 'supervisors'
              ? 'bg-gradient-to-r from-amber-400 via-[#ffd700] to-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(255,215,0,0.45)]'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Crown className={`w-4 h-4 shrink-0 ${activeView === 'supervisors' ? 'text-slate-950' : 'text-amber-400'}`} />
          <span className="truncate">🎓 لوحة شرف مشرفي المشروع (جامعة طنطا)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('students')}
          className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
            activeView === 'students'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)]'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Trophy className={`w-4 h-4 shrink-0 ${activeView === 'students' ? 'text-white' : 'text-purple-400'}`} />
          <span className="truncate">⭐ لوحة أوائل الطلاب المتميزين</span>
        </button>
      </div>

      {/* Render Selected View */}
      {activeView === 'supervisors' ? (
        <SupervisorsHonorBoard
          showContinueButton={!!(onContinueToPreTest || onContinueToInstructions)}
          onContinue={onContinueToPreTest || onContinueToInstructions}
          continueButtonText="الانتقال إلى الاختبار القبلي 🏎️"
        />
      ) : (
        /* Real Students Honor Board Section */
        <div className="space-y-6">
          {/* Honor Board Header Card */}
          <div className="rounded-3xl bg-gradient-to-b from-[#19142b] via-[#100d1e] to-[#0a0814] border-2 border-[#d4af37] p-5 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative overflow-hidden">
            {/* Golden Crown Aura */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-24 bg-gradient-to-b from-[#ffd700]/15 via-purple-600/10 to-transparent blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#d4af37] via-[#ffd700] to-[#f59e0b] text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] shrink-0">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="px-2.5 sm:px-3 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-amber-300 text-[11px] sm:text-xs font-bold font-['Cairo']">
                      لوحة الشرف للمتميزين (بيانات حقيقية)
                    </span>
                    <span className="text-[11px] sm:text-xs text-purple-300 font-semibold font-['Cairo'] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#ffd700]" />
                      <span>مرتبطة بنتائج وحلول الطلاب الفعلية</span>
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
                    فرسان التميز والتقبل التكنولوجي
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    يتم تصنيف الطلاب هنا بناءً على النقاط الفعلية المكتسبة من حل أنشطة ومحاكاة موديولات برنامج Adobe Captivate 2019.
                  </p>
                </div>
              </div>

              {/* Current User Standing Badge */}
              {currentUsername && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/80 border border-[#d4af37]/50 flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-600/50 flex items-center justify-center text-amber-300 font-bold font-['Outfit']">
                    ★
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">حسابك الحالي المسجل</span>
                    <span className="text-xs font-bold text-white font-mono">{currentUsername}</span>
                    <span className="text-[10px] text-emerald-400 block font-semibold">تسجيل دخول حقيقي</span>
                  </div>
                </div>
              )}
            </div>

            {/* If No Real Students Scored Yet */}
            {realHonorStudents.length === 0 ? (
              <div className="mt-8 p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center mx-auto text-2xl">
                  ⭐
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-['Tajawal']">
                  لوحة الشرف مستعدة لتسجيل أوائل المتميزين!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  تم مسح كافة البيانات الوهمية. ابدأ الآن بالدخول إلى الأنشطة وحل تحديات المستويات ليكون اسمك ورصيدك الفعلي أول المتصدرين في لوحة الشرف الأكاديمية.
                </p>
              </div>
            ) : (
              /* Top 3 Real Podium Highlights */
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {realHonorStudents.slice(0, 3).map((stu) => {
                  const isFirst = stu.rank === 1;
                  const isSecond = stu.rank === 2;

                  const borderColor = isFirst
                    ? 'border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.35)]'
                    : isSecond
                    ? 'border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.25)]'
                    : 'border-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.25)]';

                  const medalColor = isFirst
                    ? 'text-[#ffd700]'
                    : isSecond
                    ? 'text-slate-300'
                    : 'text-amber-600';

                  return (
                    <div
                      key={stu.id}
                      className={`relative rounded-2xl bg-slate-950/70 border-2 ${borderColor} p-5 flex flex-col items-center text-center backdrop-blur-md transition-transform hover:-translate-y-1`}
                    >
                      {isFirst && (
                        <div className="absolute -top-3 right-1/2 translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-[#d4af37] text-slate-950 text-[10px] font-black font-['Cairo'] shadow-md flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          <span>المركز الأول 🥇</span>
                        </div>
                      )}

                      <div className="relative mt-2 mb-3">
                        <div
                          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${stu.avatarBg} p-1 shadow-lg flex items-center justify-center text-xl sm:text-2xl font-bold text-white font-['Outfit']`}
                        >
                          {stu.username.split('_')[0]}
                        </div>
                        <div className={`absolute -bottom-2 -left-2 ${medalColor}`}>
                          <Medal className="w-6 h-6 sm:w-7 sm:h-7 filter drop-shadow" />
                        </div>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white font-['Tajawal']">{stu.username}</h3>
                      <span className="text-xs text-purple-300 mt-0.5">{stu.groupName}</span>

                      <div className="mt-4 w-full grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-['Cairo']">النقاط الفعلية</span>
                          <span className="font-black text-amber-300 font-mono text-xs sm:text-sm">{stu.points} ⭐</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-['Cairo']">الموديولات المكتملة</span>
                          <span className="font-bold text-emerald-400 font-mono text-xs sm:text-sm">{stu.completedLevels} / 10</span>
                        </div>
                      </div>

                      <div className="mt-3 w-full py-1.5 rounded-lg bg-amber-400/10 border border-[#d4af37]/40 text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{stu.badge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real Ranking Table (if active students exist) */}
          {realHonorStudents.length > 0 && (
            <div className="rounded-3xl bg-[#0e0a1a]/90 border border-slate-800/80 p-4 sm:p-6 shadow-xl">
              <h3 className="text-sm sm:text-base font-black text-white font-['Tajawal'] flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>قائمة المتصدرين الحقيقيين لمجموعات البحث (G1, G2, G3, G4)</span>
              </h3>

              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full text-right text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-['Cairo']">
                      <th className="py-3 px-3 sm:px-4">الترتيب</th>
                      <th className="py-3 px-3 sm:px-4">اسم المستخدم</th>
                      <th className="py-3 px-3 sm:px-4">المجموعة التجريبية</th>
                      <th className="py-3 px-3 sm:px-4 text-center">النقاط الحقيقية ⭐</th>
                      <th className="py-3 px-3 sm:px-4 text-center">المستويات</th>
                      <th className="py-3 px-3 sm:px-4">الوسام الممنوح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-['Cairo']">
                    {realHonorStudents.map((stu) => (
                      <tr
                        key={stu.id}
                        className={`hover:bg-slate-900/40 transition-colors ${
                          stu.username.toLowerCase() === currentUsername.toLowerCase()
                            ? 'bg-amber-500/10 font-bold text-amber-200'
                            : 'text-slate-200'
                        }`}
                      >
                        <td className="py-3 px-3 sm:px-4 font-mono font-bold text-amber-400">
                          {stu.rank === 1 ? '🥇 1' : stu.rank === 2 ? '🥈 2' : stu.rank === 3 ? '🥉 3' : `#${stu.rank}`}
                        </td>
                        <td className="py-3 px-3 sm:px-4 font-bold text-white font-mono">{stu.username}</td>
                        <td className="py-3 px-3 sm:px-4 text-slate-300">{stu.groupName}</td>
                        <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-amber-300">
                          {stu.points}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center font-mono text-emerald-400">
                          {stu.completedLevels} / 9
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-200 text-[10px]">
                            {stu.badge}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Continue to Pre-Test button on Students Honor Board */}
          {(onContinueToPreTest || onContinueToInstructions) && (
            <div className="pt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={onContinueToPreTest || onContinueToInstructions}
                id="btn-honor-continue-to-pretest"
                className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_25px_rgba(255,215,0,0.45)] border-2 border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                <span>الانتقال إلى الاختبار القبلي 🏎️</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
