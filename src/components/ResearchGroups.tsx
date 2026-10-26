import React, { useState } from 'react';
import { Users, Zap, Clock, Shield, Sparkles, Award, CheckCircle2, MessageSquare, ArrowLeft, Target, Flame, Lock, AlertTriangle, Eye } from 'lucide-react';
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
  const isAdmin = currentUsername?.trim().toLowerCase() === 'admin';
  const userGroupMeta = currentUsername ? getGroupByUsername(currentUsername) : null;
  const [blockedAlert, setBlockedAlert] = useState<{ groupName: string; groupCode: string } | null>(null);

  const handleGroupClick = (group: ResearchGroup) => {
    // If student has an assigned group and it is different, lock access (admin has full access to enter any group)
    if (!isAdmin && userGroupMeta && group.id !== userGroupMeta.id) {
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
              طالبنا العزيز (<strong className="text-white font-bold font-['Cairo']">{currentUsername}</strong>)، أنت مقيد رسمياً في:
              <br />
              <span className="inline-block mt-2 px-3.5 py-1.5 rounded-xl bg-slate-200 border border-slate-300 text-slate-900 font-black font-['Cairo'] text-xs shadow-sm">
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
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-400 font-black font-['Cairo'] text-xs transition-all cursor-pointer shadow-lg"
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
      <div className="rounded-3xl bg-[#0b0914] border-2 border-slate-300 p-6 sm:p-8 shadow-sm text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 border border-slate-300 text-slate-900 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3.5 py-1 rounded-xl bg-slate-200 border border-slate-300 text-slate-900 font-['Cairo']">
                  المجموعات التجريبية الأربعة للدراسة
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
                الأربع جروبات: التفاعل بين نمط التعلم ونمط التغذية الراجعة
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-['Cairo']">
                {isAdmin ? (
                  <span className="text-blue-400 font-black flex items-center gap-1.5 text-xs sm:text-sm">
                    <Eye className="w-4 h-4 text-blue-400 inline" />
                    <span>حساب المشرف (admin): مصرح لك بقراءة كامل الموقع والدخول واستعراض أي مجموعة من المجموعات الأربعة.</span>
                  </span>
                ) : userGroupMeta ? (
                  <span className="inline-block mt-1 px-3 py-1 rounded-xl bg-slate-200 border border-slate-300 text-slate-900 font-black font-['Cairo'] text-xs">
                    أنت مسجل في مجموعة: {userGroupMeta.name} ({userGroupMeta.code}) ومصرح لك بدخولها فقط
                  </span>
                ) : (
                  'التصميم التجريبي (2×2): النمط التنافسي والتعاوني مقابل التغذية الراجعة الفورية والمرجئة'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* The 4 Groups Grid - All 4 groups visible normally with clean flex layout and zero overlaps */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {RESEARCH_GROUPS_DATA.map((group) => {
            const isAssignedToUser = isAdmin ? true : (userGroupMeta ? group.id === userGroupMeta.id : true);
            const isSelected = group.id === selectedGroupId;
            const isLockedForUser = isAdmin ? false : (userGroupMeta ? !isAssignedToUser : false);

            return (
              <div
                key={group.id}
                id={`group-card-${group.code}`}
                onClick={() => handleGroupClick(group)}
                className={`rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between bg-white shadow-md hover:shadow-xl ${
                  isSelected
                    ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/80'
                    : 'border-slate-300 hover:border-sky-400'
                }`}
              >
                <div>
                  {/* Top Badges Header: Clean Flex Wrap with Zero Collisions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-slate-900 font-black text-amber-300 text-xs shadow-sm font-['Cairo']">
                        {group.code}
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-black border border-blue-300 bg-blue-50 text-blue-950 font-['Cairo'] shadow-xs">
                        {group.learningMode === 'تنافسي' ? '⚡ نمط تنافسي' : '🤝 نمط تعاوني'}
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-black border border-purple-300 bg-purple-50 text-purple-950 font-['Cairo'] shadow-xs">
                        {group.feedbackMode === 'فورية' ? '🎯 تغذية فورية' : '⏳ تغذية مرجئة'}
                      </span>
                    </div>

                    {/* Status Badge in Flex Flow */}
                    {isAdmin ? (
                      <span className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs shrink-0 ${
                        isSelected
                          ? 'bg-amber-100 text-amber-950 border-2 border-amber-500 font-black'
                          : 'bg-emerald-100 text-emerald-950 border border-emerald-400 font-black'
                      }`}>
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isSelected ? 'المجموعة المحددة حالياً 👁️' : 'متاح للأدمن (استعراض) 👁️'}</span>
                      </span>
                    ) : isLockedForUser ? (
                      <span className="px-3 py-1 rounded-xl bg-rose-100 border border-rose-300 text-rose-950 text-xs font-black flex items-center gap-1.5 shadow-xs shrink-0">
                        <Lock className="w-3.5 h-3.5 text-rose-700" />
                        <span>🔒 مغلق لطلاب المجموعات الأخرى</span>
                      </span>
                    ) : isSelected ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-100 border-2 border-amber-500 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-xs shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 stroke-[3]" />
                        <span>⭐ مجموعتك المصرح بها فقط</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Group Title Box: Prominent Light Gray Badge */}
                  <div className="px-4 py-2 rounded-xl bg-slate-100 border-2 border-slate-300 inline-block mb-2 shadow-xs">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Cairo'] leading-snug">
                      المجموعة {group.code}: {group.name}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-sky-950 font-black font-['Cairo'] mt-1">
                    {group.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 font-bold font-['Cairo'] mt-1.5 leading-relaxed">
                    {group.description}
                  </p>

                  {/* Rules & Features List */}
                  <div className="my-4 p-4 rounded-xl bg-sky-50/90 border border-sky-200 space-y-2 text-xs text-slate-900 shadow-inner">
                    {group.rules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-black text-base leading-none">•</span>
                        <span className="leading-relaxed font-bold text-slate-800">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group Stats & Action Footer */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Users className="w-4 h-4 text-slate-600" />
                    <span>الطلاب: <strong className="text-slate-900 font-black">{group.membersCount} طالباً</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupClick(group);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                      isAdmin
                        ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40'
                        : isLockedForUser
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 border border-amber-300'
                    }`}
                  >
                    {isAdmin ? (
                      <>
                        <Eye className="w-4 h-4 text-amber-300" />
                        <span>{isSelected ? 'استعراض هذه المجموعة الآن' : 'اختيار واستعراض المجموعة'}</span>
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    ) : isLockedForUser ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                        <span>دخول المجموعة (مغلق)</span>
                      </>
                    ) : (
                      <>
                        <span>دخول بيئة مجموعتي</span>
                        <ArrowLeft className="w-4 h-4" />
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
