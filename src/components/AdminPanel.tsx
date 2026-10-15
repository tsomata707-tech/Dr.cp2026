import React, { useState } from 'react';
import {
  Settings,
  BookOpen,
  Video,
  Image as ImageIcon,
  Award,
  HelpCircle,
  Users,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { AdminInstructionsManager } from './AdminInstructionsManager';
import { AdminTestsSettingsManager } from './AdminTestsSettingsManager';
import { AdminVideoManager } from './AdminVideoManager';
import { AdminSplashManager } from './AdminSplashManager';
import { AdminSupervisorsHonorManager } from './AdminSupervisorsHonorManager';

interface AdminPanelProps {
  onExitAdmin: () => void;
  onLoginAsStudent: (username: string) => void;
}

type AdminTab =
  | 'instructions_standards'
  | 'tests_settings'
  | 'videos'
  | 'splash'
  | 'supervisors';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitAdmin, onLoginAsStudent: _onLoginAsStudent }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('tests_settings');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium mb-1">
                <span>لوحة التحكم السيادية للأدمن</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                إدارة النظام والاختبارات والمحتوى التفاعلي
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للمنصة</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-800">
          {/* TAB 1: إعدادات الاختبارات (رمز الترس المطلوب) */}
          <button
            onClick={() => setActiveTab('tests_settings')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'tests_settings'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'tests_settings' ? 'animate-spin' : ''}`} />
            <span>إعدادات الاختبارات</span>
          </button>

          <button
            onClick={() => setActiveTab('instructions_standards')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'instructions_standards'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>التعليمات والمعايير</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'videos'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>إدارة الفيديوهات</span>
          </button>

          <button
            onClick={() => setActiveTab('splash')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'splash'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>شاشة البداية</span>
          </button>

          <button
            onClick={() => setActiveTab('supervisors')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'supervisors'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>لوحة المشرفين</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="bg-[#0b0e1e] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        {activeTab === 'tests_settings' && <AdminTestsSettingsManager />}
        {activeTab === 'instructions_standards' && <AdminInstructionsManager />}
        {activeTab === 'videos' && <AdminVideoManager />}
        {activeTab === 'splash' && <AdminSplashManager />}
        {activeTab === 'supervisors' && <AdminSupervisorsHonorManager />}
      </div>
    </div>
  );
};