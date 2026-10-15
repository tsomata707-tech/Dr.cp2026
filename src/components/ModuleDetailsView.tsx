import React, { useState, useEffect } from 'react';
import { CurriculumModule, RESEARCH_INFO } from '../data/curriculumData';
import { CaptivateSimulator } from './CaptivateSimulator';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  PlayCircle,
  FileCheck,
  Check,
  Layers,
  ArrowRight,
  Info,
  Video,
} from 'lucide-react';
import { useEducationalVideos } from '../utils/videoStorage';
import { MultiPartVideoPlayer } from './MultiPartVideoPlayer';

interface ModuleDetailsViewProps {
  module: CurriculumModule;
  onNextModule?: () => void;
  onPrevModule?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  completedObjectives: Record<string, boolean>;
  onToggleObjective: (objectiveId: string) => void;
}

export const ModuleDetailsView: React.FC<ModuleDetailsViewProps> = ({
  module,
  onNextModule,
  onPrevModule,
  isFirst = false,
  isLast = false,
  completedObjectives,
  onToggleObjective,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [module.id]);

  const [activeSubTab, setActiveSubTab] = useState<'objectives' | 'video' | 'simulator' | 'research'>('objectives');
  const moduleVideos = useEducationalVideos(`level-${module.number}`);

  // Compute completion rate
  const total = module.objectives.length;
  const completedCount = module.objectives.filter((obj) => completedObjectives[obj.id]).length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'تطبيق':
        return 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300';
      case 'تحليل':
        return 'bg-purple-950/70 border-purple-500/50 text-purple-300';
      case 'تقويم':
        return 'bg-amber-950/70 border-[#d4af37] text-amber-300';
      case 'فهم':
        return 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300';
      case 'تذكر':
      default:
        return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="flex-1 space-y-6 text-right" id="module-details-container">
      {/* Top Banner Card with Golden Border */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#141026] via-[#0d0a1a] to-[#080612] border-2 border-[#d4af37] p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.2)] overflow-hidden">
        {/* Subtle Violet & Gold Wave */}
        <div className="absolute top-0 right-1/4 w-96 h-28 bg-gradient-to-b from-purple-600/10 via-[#d4af37]/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-amber-300 text-xs font-bold font-['Cairo']">
                الوحدة التعليمية {module.number} من 10
              </span>
              <span className="text-xs text-purple-300 font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/50 border border-purple-800/40">
                {module.category}
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white font-['Tajawal'] tracking-wide">
              {module.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-['IBM_Plex_Sans_Arabic'] max-w-2xl leading-relaxed">
              {module.summary}
            </p>
          </div>

          {/* Module Progress Dial */}
          <div className="w-full md:w-auto flex md:flex-col items-center justify-between md:justify-center p-4 rounded-2xl bg-[#090712]/90 border border-[#d4af37]/40 shrink-0">
            <span className="text-[11px] text-slate-400 font-['Cairo']">معدل الإتقان</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black text-amber-300 font-['Outfit']">{percentage}%</span>
              <span className="text-[10px] text-slate-500 font-mono">
                ({completedCount}/{total})
              </span>
            </div>
            <div className="w-28 h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-[#ffd700] transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-[#d4af37]/20 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('objectives')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'objectives'
                ? 'bg-[#d4af37] text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>الأهداف السلوكية والمهام ({total})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('video')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'video'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>
              الفيديو التعليمي {moduleVideos.length > 0 ? `(${moduleVideos.length} أجزاء 🎬)` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('simulator')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'simulator'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>المحاكي العملي والتغذية الراجعة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('research')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'research'
                ? 'bg-[#1b1730] border border-[#d4af37]/60 text-amber-200'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>بيانات البحث والأطر الأكاديمية</span>
          </button>
        </div>
      </div>

      {/* Sub Tab 1: Objectives List */}
      {activeSubTab === 'objectives' && (
        <div className="space-y-4" id="objectives-list-wrapper">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm sm:text-base font-bold text-amber-200 font-['Tajawal'] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#ffd700]" />
              <span>قائمة الأهداف السلوكية للمقرر (المهام الإجرائية المباشرة):</span>
            </h3>
            <span className="text-[11px] text-slate-400">انقر لتحديد إتقان الهدف</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {module.objectives.map((obj, index) => {
              const isDone = !!completedObjectives[obj.id];

              return (
                <div
                  key={obj.id}
                  id={`objective-card-${obj.code}`}
                  onClick={() => onToggleObjective(obj.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                    isDone
                      ? 'bg-[#0e1619]/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-[#0b0914]/90 hover:bg-[#130f24] border-slate-800 hover:border-[#d4af37]/50'
                  }`}
                >
                  {/* Status Toggle Checkbox */}
                  <div className="pt-0.5 shrink-0">
                    {isDone ? (
                      <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 hover:border-[#ffd700] transition-colors" />
                    )}
                  </div>

                  {/* Objective Text & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-[#ffd700] px-2 py-0.5 rounded bg-[#ffd700]/10 border border-[#d4af37]/40">
                        الهدف {obj.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeClass(
                          obj.level
                        )}`}
                      >
                        مستوى: {obj.level}
                      </span>
                    </div>

                    <p
                      className={`text-xs sm:text-sm font-bold font-['IBM_Plex_Sans_Arabic'] leading-relaxed ${
                        isDone ? 'text-emerald-200 line-through opacity-80' : 'text-white'
                      }`}
                    >
                      {obj.title}
                    </p>

                    <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
                      <span className="text-[#ffd700] font-bold shrink-0">المهمة العملية:</span>
                      <span className="truncate">{obj.practicalTask}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub Tab 1.5: Video Player */}
      {activeSubTab === 'video' && (
        <div className="space-y-4">
          {moduleVideos.length > 0 ? (
            <MultiPartVideoPlayer
              videos={moduleVideos}
              title={`فيديوهات شرح المرحلة ${module.number}: ${module.title}`}
            />
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-3 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
              <Video className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold">لا يوجد أجزاء فيديو مرفوعة حالياً لهذه المرحلة.</p>
              <p className="text-xs text-slate-500">
                يمكن للمشرف رفع حتى ٥ أجزاء فيديو لهذه المرحلة من خلال تبويب <strong>"إدارة ورفع الفيديوهات"</strong> في لوحة تحكم الأدمن.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sub Tab 2: Practical Simulator */}
      {activeSubTab === 'simulator' && (
        <CaptivateSimulator
          currentModule={module}
          onObjectiveAchieved={(objId) => {
            if (!completedObjectives[objId]) {
              onToggleObjective(objId);
            }
          }}
        />
      )}

      {/* Sub Tab 3: Research Metadata Card */}
      {activeSubTab === 'research' && (
        <div className="p-6 rounded-3xl bg-[#0b0914] border-2 border-[#d4af37] shadow-xl space-y-6">
          <div className="border-b border-[#d4af37]/30 pb-4">
            <span className="text-xs font-bold text-amber-300 font-['Cairo']">
              {RESEARCH_INFO.university}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] mt-1">
              {RESEARCH_INFO.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-['IBM_Plex_Sans_Arabic']">
              {RESEARCH_INFO.impact}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#120f22] border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">إعداد الباحثة:</span>
              <p className="text-sm font-bold text-white mt-1">{RESEARCH_INFO.researcher}</p>
              <span className="text-[11px] text-purple-300">معيدة بقسم تكنولوجيا التعليم</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#120f22] border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">العام الأكاديمي والبرمجية:</span>
              <p className="text-sm font-bold text-amber-300 mt-1 font-mono">{RESEARCH_INFO.software}</p>
              <span className="text-[11px] text-slate-400">{RESEARCH_INFO.year}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#120f22] border border-slate-800">
            <span className="text-xs text-slate-400 font-bold mb-2 block">لجنة الإشراف العلمي:</span>
            <div className="space-y-2">
              {RESEARCH_INFO.supervisors.map((sup, idx) => (
                <div key={idx} className="text-xs flex items-baseline gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffd700]" />
                  <span className="text-white font-bold">{sup.name}</span>
                  <span className="text-slate-400 text-[11px]">- {sup.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Research Variables Box */}
          <div className="p-4 rounded-2xl bg-[#151229] border border-purple-500/40">
            <h4 className="text-xs font-bold text-purple-200 mb-2">متغيرات بيئة الألعاب التعليمية المطبقة عملياً:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-amber-300 font-bold">أنماط التغذية الراجعة:</span>
                <ul className="text-slate-300 text-[11px] space-y-1">
                  <li>• فورية (Immediate Feedback)</li>
                  <li>• مرجئة (Delayed Feedback)</li>
                </ul>
              </div>
              <div className="space-y-1">
                <span className="text-cyan-300 font-bold">أنماط التعلم:</span>
                <ul className="text-slate-300 text-[11px] space-y-1">
                  <li>• نمط تعلم تعاوني (Collaborative)</li>
                  <li>• نمط تعلم تنافسي (Competitive)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer for Modules */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onPrevModule}
          disabled={isFirst}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#d4af37] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الوحدة السابقة</span>
        </button>

        <button
          type="button"
          onClick={onNextModule}
          disabled={isLast}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-md hover:opacity-95 transition-all"
        >
          <span>الوحدة التالية</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
