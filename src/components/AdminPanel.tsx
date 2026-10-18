import React, { useState } from 'react';
import {
  Settings,
  BookOpen,
  Video,
  Image as ImageIcon,
  Award,
  Users,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Type,
  Layers,
} from 'lucide-react';
import { AdminUsersManager } from './AdminUsersManager';
import { AdminInstructionsManager } from './AdminInstructionsManager';
import { AdminTestsSettingsManager } from './AdminTestsSettingsManager';
import { AdminStudentsAuditManager } from './AdminStudentsAuditManager';
import { AdminVideoManager } from './AdminVideoManager';
import { AdminSplashManager } from './AdminSplashManager';
import { AdminSupervisorsHonorManager } from './AdminSupervisorsHonorManager';
import { AdminSiteTitleManager } from './AdminSiteTitleManager';
import { AdminLevelInstructionsManager } from './AdminLevelInstructionsManager';

interface AdminPanelProps {
  onExitAdmin: () => void;
  onLoginAsStudent: (username: string) => void;
}

type AdminTab =
  | 'users'
  | 'level_instructions'
  | 'tests_settings'
  | 'students_audit'
  | 'site_title'
  | 'instructions_standards'
  | 'videos'
  | 'splash'
  | 'supervisors';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitAdmin, onLoginAsStudent }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-['Cairo',_sans-serif] text-right" dir="rtl">
      {/* Admin Top Header Banner with Horizontal Navigation Tabs */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d122b] to-slate-900 border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Header Information & Exit Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)] shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1">
                <span>لوحة التحكم السيادية المركزية للأدمن</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Tajawal'] tracking-tight">
                إدارة المنظومة والمستخدمين والاختبارات
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md hover:border-amber-400"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للمنصة الرئيسية</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs Bar - All tabs horizontal at top */}
        <div className="mt-5 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/40 scrollbar-track-slate-900">
            {/* TAB 1: اليوزر (المطلوب في تبويبة جديدة) */}
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Users className="w-4 h-4 text-blue-300" />
              <span>اليوزر</span>
            </button>

            {/* TAB: تعديل الليفل والتعليمات (المطلوب بالنص الحرفي) */}
            <button
              type="button"
              onClick={() => setActiveTab('level_instructions')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'level_instructions'
                  ? 'bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/40'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>تعديل الليفل والتعليمات</span>
            </button>

            {/* TAB 2: إعدادات الاختبارات */}
            <button
              type="button"
              onClick={() => setActiveTab('tests_settings')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'tests_settings'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black ring-2 ring-amber-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'tests_settings' ? 'animate-spin' : ''}`} />
              <span>إعدادات الاختبارات</span>
            </button>

            {/* TAB 3: سجل الدخول والنتائج والشيتات */}
            <button
              type="button"
              onClick={() => setActiveTab('students_audit')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'students_audit'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20 font-black ring-2 ring-emerald-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>سجل الدخول والنتائج والشيتات</span>
            </button>

            {/* TAB 4: تعديل عنوان الموقع */}
            <button
              type="button"
              onClick={() => setActiveTab('site_title')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'site_title'
                  ? 'bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/25 font-black ring-2 ring-amber-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Type className="w-4 h-4 text-amber-400" />
              <span>تعديل عنوان الموقع</span>
            </button>

            {/* TAB 5: شاشة البداية والصورة */}
            <button
              type="button"
              onClick={() => setActiveTab('splash')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'splash'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold ring-2 ring-amber-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>شاشة البداية والصورة</span>
            </button>

            {/* TAB 6: التعليمات والمعايير */}
            <button
              type="button"
              onClick={() => setActiveTab('instructions_standards')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'instructions_standards'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold ring-2 ring-amber-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>التعليمات والمعايير</span>
            </button>

            {/* TAB 7: إدارة الفيديوهات */}
            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'videos'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold ring-2 ring-amber-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>إدارة الفيديوهات</span>
            </button>

            {/* TAB 8: لوحة المشرفين */}
            <button
              type="button"
              onClick={() => setActiveTab('supervisors')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'supervisors'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold ring-2 ring-amber-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>لوحة المشرفين</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content - Opens in the same page seamlessly */}
      <div className="bg-[#0b0e1e] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl transition-all">
        {activeTab === 'users' && <AdminUsersManager onLoginAsStudent={onLoginAsStudent} />}
        {activeTab === 'level_instructions' && <AdminLevelInstructionsManager />}
        {activeTab === 'tests_settings' && <AdminTestsSettingsManager />}
        {activeTab === 'students_audit' && <AdminStudentsAuditManager />}
        {activeTab === 'site_title' && <AdminSiteTitleManager />}
        {activeTab === 'splash' && <AdminSplashManager />}
        {activeTab === 'instructions_standards' && <AdminInstructionsManager />}
        {activeTab === 'videos' && <AdminVideoManager />}
        {activeTab === 'supervisors' && <AdminSupervisorsHonorManager />}
      </div>
    </div>
  );
};