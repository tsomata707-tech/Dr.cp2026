import React, { useState } from 'react';
import { Users, Zap, Clock, Shield, Sparkles, Award, CheckCircle2, MessageSquare, ArrowLeft, Target, Flame, Lock, AlertTriangle } from 'lucide-react';
import { getGroupByUsername } from '../data/studentAccounts';

export interface ResearchGroup {
  id: string;
  code: string;
  name: string;
  learningMode: 'تنافسي' | 'تعاوني';
  feedbackMode: 'فورية' | 'مرجئة';
  tagline: string;
  description: string;
  accentColor: string;
  borderClass: string;
  bgGradient: string;
  membersCount: number;
  averageScore: number;
  completedTasks: number;
  rules: string[];
}

export const RESEARCH_GROUPS_DATA: ResearchGroup[] = [
  {
    id: 'grp-1',
    code: 'G1',
    name: 'تنافس فوري',
    learningMode: 'تنافسي',
    feedbackMode: 'فورية',
    tagline: 'سرعة الإنجاز الفردي مع التوجيه اللحظي المباشر',
    description: 'يتعلم الطالب في بيئة تنافسية قائمة على الترتيب الفردي والنقاط، وتصله التغذية الراجعة فورياً بعد كل خطوة أو إجابة سؤال.',
    accentColor: '#f59e0b',
    borderClass: 'border-amber-500/80',
    bgGradient: 'from-amber-950/40 via-[#151126] to-[#090712]',
    membersCount: 15,
    averageScore: 92,
    completedTasks: 135,
    rules: [
      'تغذية راجعة فورية تعزز الإجابة الصحيحة وتوضح خطأ الاستجابة لحظياً',
      'لوحة صدارة وتنافس لحصد أعلى النقاط وتسجيل أقل زمن محاكاة',
      'مؤقت رقمي تنازلي لقياس سرعة إتقان خطوات Captivate 2019',
    ],
  },
  {
    id: 'grp-2',
    code: 'G2',
    name: 'تنافس مرجأ',
    learningMode: 'تنافسي',
    feedbackMode: 'مرجئة',
    tagline: 'التحدي التنافسي مع التقييم التراكمي الشامل',
    description: 'يتنافس المتعلم فردياً لإتمام سيناريوهات المحاكاة، ويتم إرجاء تقديم التغذية الراجعة والتقرير التحليلي حتى نهاية الموديول كاملاً.',
    accentColor: '#a855f7',
    borderClass: 'border-purple-500/80',
    bgGradient: 'from-purple-950/40 via-[#151126] to-[#090712]',
    membersCount: 15,
    averageScore: 89,
    completedTasks: 135,
    rules: [
      'تأجيل إظهار نتائج التصحيح حتى اكتمال كافة أسئلة الموديول',
      'تطوير مهارة التفكير التأملي والتقييم الذاتي للمهام',
      'تقرير نهائي تراكمي يبرز مواطن القوة وفرص التحسين',
    ],
  },
  {
    id: 'grp-3',
    code: 'G3',
    name: 'تعاوني فوري',
    learningMode: 'تعاوني',
    feedbackMode: 'فورية',
    tagline: 'العمل الجماعي المشترك والتوجيه الفوري المستمر',
    description: 'يعمل الطلاب كفريق عمل تشاركي لإنتاج شرائط ومشاريع الوسائط المتعددة، مع ظهور إشعارات وتوجيهات تصحيحية فورية لجميع أعضاء الفريق.',
    accentColor: '#06b6d4',
    borderClass: 'border-cyan-500/80',
    bgGradient: 'from-cyan-950/40 via-[#151126] to-[#090712]',
    membersCount: 15,
    averageScore: 94,
    completedTasks: 135,
    rules: [
      'مشاركة الشاشات والحلول بين أعضاء الفريق التعليمي',
      'تغذية راجعة فورية مشتركة تُعرض للجميع لتدارك الخطأ جماعياً',
      'تقييم قائم على إنجاز الفريق ككل وتعزيز روح التعاون',
    ],
  },
  {
    id: 'grp-4',
    code: 'G4',
    name: 'تعاوني مرجأ',
    learningMode: 'تعاوني',
    feedbackMode: 'مرجئة',
    tagline: 'حوار ونقاش جماعي ممتد حتى اعتماد التقرير المرجأ',
    description: 'يتعاون الطلاب في بناء مشاريع التعلم الإلكتروني ومناقشة الخيارات التفاعلية، وتُقدم التغذية الراجعة التلخيصية بعد انتهاء النشاط التعاوني.',
    accentColor: '#10b981',
    borderClass: 'border-emerald-500/80',
    bgGradient: 'from-emerald-950/40 via-[#151126] to-[#090712]',
    membersCount: 15,
    averageScore: 88,
    completedTasks: 135,
    rules: [
      'جلسات حوار تفاعلية لتبادل الرأي قبل تسليم المحاكاة',
      'تغذية راجعة مرجئة مفصلة توزع على الفريق في ختام الموديول',
      'بناء ملف إنجاز إلكتروني جماعي للمشاريع المعتمدة',
    ],
  },
];

interface ResearchGroupsProps {
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
  onEnterGroup?: () => void;
  currentUsername?: string;
}

export const ResearchGroups: React.FC<ResearchGroupsProps> = ({
  selectedGroupId,
  onSelectGroup,
  onEnterGroup,
  currentUsername,
}) => {
  const userGroupMeta = currentUsername ? getGroupByUsername(currentUsername) : null;
  const [blockedAlert, setBlockedAlert] = useState<{ groupName: string; groupCode: string } | null>(null);

  const handleGroupClick = (group: ResearchGroup) => {
    // If student has an assigned group and it is different, lock access
    if (userGroupMeta && group.id !== userGroupMeta.id) {
      setBlockedAlert({ groupName: group.name, groupCode: group.code });
      return;
    }
    onSelectGroup(group.id);
    if (onEnterGroup) {
      onEnterGroup();
    }
  };

  return (
    <section className="space-y-6 text-right font-['Cairo',_sans-serif]" id="research-groups-section">
      {/* Alert Modal for unauthorized group click: انت لست ضمن هذه المجموعه */}
      {blockedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0f0c1f] border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-right shadow-[0_0_50px_rgba(239,68,68,0.4)] space-y-4">
            <div className="flex items-center gap-3 text-red-400 pb-3 border-b border-red-900/50">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center shrink-0 shadow-inner">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-red-400 font-['Tajawal']">
                  أنت لست ضمن هذه المجموعة
                </h3>
                <span className="text-xs text-red-300 font-['Cairo']">
                  ضوابط العزل التجريبي للبحث العلمي
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-['IBM_Plex_Sans_Arabic']">
              طالبنا العزيز (<strong className="text-[#ffd700] font-mono">{currentUsername}</strong>)، أنت مقيد رسمياً في:
              <br />
              <span className="inline-block mt-2 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-[#d4af37] text-amber-300 font-black text-xs shadow-sm">
                ⭐ {userGroupMeta?.name} ({userGroupMeta?.code})
              </span>
            </p>

            <p className="text-xs text-slate-300 leading-relaxed font-['IBM_Plex_Sans_Arabic']">
              لا يمكن الدخول إلا إلى المجموعة الخاصة بك وفقاً لضوابط العزل التجريبي لمتغيرات البحث العلمي.
            </p>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setBlockedAlert(null);
                  if (userGroupMeta) {
                    onSelectGroup(userGroupMeta.id);
                    if (onEnterGroup) onEnterGroup();
                  }
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg"
              >
                الانتقال إلى مجموعتي الخاصة ({userGroupMeta?.code}) 🚀
              </button>
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

      {/* Section Header */}
      <div className="rounded-3xl bg-[#0b0914] border-2 border-[#d4af37] p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.2)] text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37] text-amber-300 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37] text-amber-300 font-['Cairo']">
                  المجموعات التجريبية الأربعة للدراسة
                </span>
                <span className="text-xs text-purple-300 font-semibold font-['Cairo']">
                  (التفاعلي • الفوري • المرجأ)
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
                الأربع جروبات: التفاعل بين نمط التعلم ونمط التغذية الراجعة
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-['IBM_Plex_Sans_Arabic']">
                {userGroupMeta ? (
                  <span className="text-amber-300 font-bold">
                    أنت مسجل في مجموعة: {userGroupMeta.name} ومصرح لك بدخولها فقط
                  </span>
                ) : (
                  'التصميم التجريبي (2×2): النمط التنافسي والتعاوني مقابل التغذية الراجعة الفورية والمرجئة'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* The 4 Groups Grid - All 4 groups visible normally */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {RESEARCH_GROUPS_DATA.map((group) => {
            const isAssignedToUser = userGroupMeta ? group.id === userGroupMeta.id : true;
            const isSelected = group.id === selectedGroupId;
            const isLockedForUser = userGroupMeta ? !isAssignedToUser : false;

            return (
              <div
                key={group.id}
                id={`group-card-${group.code}`}
                onClick={() => handleGroupClick(group)}
                className={`rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden bg-gradient-to-b ${
                  group.bgGradient
                } ${
                  isSelected
                    ? `${group.borderClass} shadow-[0_0_25px_rgba(212,175,55,0.3)] ring-2 ring-[#ffd700]/50`
                    : 'border-slate-800 hover:border-[#d4af37]/60'
                }`}
              >
                {/* Status Badges */}
                {isLockedForUser ? (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500 text-red-300 text-[10px] font-black flex items-center gap-1 shadow-md">
                    <Lock className="w-3 h-3 text-red-400" />
                    <span>🔒 مغلق لطلاب المجموعات الأخرى</span>
                  </div>
                ) : isSelected ? (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#ffd700] text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    <span>⭐ مجموعتك المصرح بها فقط</span>
                  </div>
                ) : null}

                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-950 font-mono font-bold text-amber-300 text-xs border border-slate-700">
                      {group.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        group.learningMode === 'تنافسي'
                          ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                          : 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300'
                      }`}
                    >
                      {group.learningMode === 'تنافسي' ? '⚡ نمط تنافسي' : '🤝 نمط تعاوني'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        group.feedbackMode === 'فورية'
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                          : 'bg-purple-950/70 border-purple-500/60 text-purple-300'
                      }`}
                    >
                      {group.feedbackMode === 'فورية' ? '🎯 تغذية فورية' : '⏳ تغذية مرجئة'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-white font-['Tajawal'] leading-snug">
                    {group.name}
                  </h3>
                  <p className="text-xs text-amber-200/90 font-semibold font-['Cairo'] mt-1">
                    {group.tagline}
                  </p>
                  <p className="text-xs text-slate-300 font-['IBM_Plex_Sans_Arabic'] mt-2 leading-relaxed">
                    {group.description}
                  </p>

                  {/* Rules & Features List */}
                  <div className="my-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                    {group.rules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-[#ffd700] text-sm leading-none">•</span>
                        <span className="leading-tight">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group Stats Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      الطلاب: <strong className="text-white font-mono">{group.membersCount} طالب</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupClick(group);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLockedForUser
                        ? 'bg-slate-900 hover:bg-red-950/70 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/50 shadow-sm'
                        : isSelected
                        ? 'bg-[#d4af37] hover:bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isLockedForUser ? (
                      <>
                        <Lock className="w-3 h-3 text-red-400" />
                        <span>دخول المجموعة</span>
                      </>
                    ) : isSelected ? (
                      <>
                        <span>دخول بيئة مجموعتي</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>اختيار مجموعتي</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
