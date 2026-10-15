import React from 'react';
import { CurriculumModule } from '../data/curriculumData';
import {
  DownloadCloud,
  Layout,
  FolderPlus,
  FileText,
  Sliders,
  HelpCircle,
  Video,
  FileSpreadsheet,
  Share2,
  Cpu,
  CheckCircle2,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';

interface RightSidebarModulesProps {
  modules: CurriculumModule[];
  activeModuleId: string;
  onSelectModule: (id: string) => void;
  completedObjectivesCount: Record<string, number>;
}

// Icon mapper for dynamic module rendering
const getModuleIcon = (iconName: string, className: string = 'w-5 h-5') => {
  switch (iconName) {
    case 'DownloadCloud':
      return <DownloadCloud className={className} />;
    case 'Layout':
      return <Layout className={className} />;
    case 'FolderPlus':
      return <FolderPlus className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Sliders':
      return <Sliders className={className} />;
    case 'HelpCircle':
      return <HelpCircle className={className} />;
    case 'Video':
      return <Video className={className} />;
    case 'FileSpreadsheet':
      return <FileSpreadsheet className={className} />;
    case 'Share2':
      return <Share2 className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

export const RightSidebarModules: React.FC<RightSidebarModulesProps> = ({
  modules,
  activeModuleId,
  onSelectModule,
  completedObjectivesCount,
}) => {
  return (
    <aside
      id="curriculum-right-sidebar"
      className="w-full lg:w-80 shrink-0 space-y-3"
      aria-label="العناوين الرئيسية للمقرر التعليمي"
    >
      {/* Sidebar Header Card with Golden Rim */}
      <div className="p-4 rounded-2xl bg-[#0d0b17]/95 border-2 border-[#d4af37]/60 shadow-[0_0_25px_rgba(212,175,55,0.15)] text-right relative overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-amber-300 font-['Cairo']">
            10 وحدات تدريبية
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold font-['Cairo']">
            <BookOpen className="w-4 h-4 text-[#ffd700]" />
            <span>العناوين الرئيسية للمقرر</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 font-['IBM_Plex_Sans_Arabic'] leading-relaxed">
          إنتاج وتصميم الوسائط المتعددة ببرنامج Adobe Captivate 2019
        </p>
      </div>

      {/* Modules List - Vertical Navigation on the Right */}
      <nav className="space-y-2" id="modules-navigation-list">
        {modules.map((module) => {
          const isActive = module.id === activeModuleId;
          const completedCount = completedObjectivesCount[module.id] || 0;
          const totalObjectives = module.objectives.length;
          const isFullyDone = completedCount === totalObjectives && totalObjectives > 0;

          return (
            <button
              key={module.id}
              type="button"
              id={`nav-module-${module.number}`}
              onClick={() => onSelectModule(module.id)}
              className={`w-full group text-right p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 border ${
                isActive
                  ? 'bg-gradient-to-r from-[#171328] via-[#1b1530] to-[#251d42] border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.25)] text-white'
                  : 'bg-[#0b0914]/80 hover:bg-[#130f24] border-slate-800/90 hover:border-[#d4af37]/50 text-slate-300'
              }`}
            >
              {/* Left Side: Arrow indicator & completion status */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isFullyDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700/60 text-slate-400 group-hover:text-amber-300 transition-colors">
                    {completedCount}/{totalObjectives}
                  </span>
                )}
                <ChevronLeft
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-[#ffd700] -translate-x-1' : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                />
              </div>

              {/* Right Side: Module Number, Title, and Modern Icon */}
              <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
                <div className="flex flex-col text-right truncate">
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className={`text-xs font-bold truncate font-['Tajawal'] tracking-wide ${
                        isActive ? 'text-amber-200' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {module.shortTitle}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#d4af37]/80">
                      .{module.number}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-['IBM_Plex_Sans_Arabic'] truncate">
                    {module.category}
                  </span>
                </div>

                {/* Modern Themed Icon Container */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-[#d4af37] to-[#b38e22] text-slate-950 border-[#ffd700] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                      : 'bg-[#151224] text-slate-400 border-slate-800 group-hover:border-[#d4af37]/40 group-hover:text-amber-300'
                  }`}
                  style={{
                    borderColor: isActive ? '#ffd700' : undefined,
                  }}
                >
                  {getModuleIcon(module.iconName, 'w-5 h-5 stroke-[2]')}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
