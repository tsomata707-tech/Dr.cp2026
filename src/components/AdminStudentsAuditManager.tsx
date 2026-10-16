import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  Gamepad2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Monitor,
  Smartphone,
  Eye,
  Award,
  Layers,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { generateSixtyStudents, RESEARCH_GROUPS_META, getGroupByUsername } from '../data/studentAccounts';
import { getAllStudentsProgress, getStudentProgress } from '../utils/gameStorage';
import { StudentGameProgress, PreTestResult, CompletedLevelResult } from '../types';
import {
  getStudentLoginsAuditMap,
  StudentLoginAudit,
  StudentLoginSession,
  downloadCsvSheet,
  copySheetToClipboard,
} from '../utils/studentAuditStorage';
import {
  subscribeToAllStudentsProgress,
  subscribeToStudentsLoginsAudit,
} from '../utils/realtimeService';

type AuditTabFilter = 'all' | 'pretest' | 'posttest' | 'levels' | 'logins';

interface EnrichedStudentRow {
  username: string;
  fullName: string;
  groupCode: string;
  groupName: string;
  learningMode: string;
  feedbackMode: string;
  // Login info
  hasLoggedIn: boolean;
  totalLogins: number;
  firstLogin: string;
  lastLogin: string;
  latestDevice: string;
  sessions: StudentLoginSession[];
  // Pre-test info
  preTestCompleted: boolean;
  preTestScore: number;
  preTestMaxScore: number;
  preTestPercentage: number;
  preTestPassed: boolean;
  preTestDate: string;
  preTestTimeSpent: number;
  // Post-test info
  postTestCompleted: boolean;
  postTestScore: number;
  postTestMaxScore: number;
  postTestPercentage: number;
  postTestPassed: boolean;
  postTestDate: string;
  postTestTimeSpent: number;
  // 10 Stages info
  completedLevelsCount: number;
  totalLevelsScore: number;
  levelsDetails: Record<number, CompletedLevelResult>;
  lastActive: string;
}

export const AdminStudentsAuditManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AuditTabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | 'G1' | 'G2' | 'G3' | 'G4'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'logged_in' | 'pre_done' | 'post_done' | 'levels_done'>('all');

  // Real-time state
  const [progressMap, setProgressMap] = useState<Record<string, StudentGameProgress>>(() => getAllStudentsProgress());
  const [loginAuditMap, setLoginAuditMap] = useState<Record<string, StudentLoginAudit>>(() => getStudentLoginsAuditMap());

  // Copy feedback
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Selected student for session inspection modal
  const [inspectStudent, setInspectStudent] = useState<EnrichedStudentRow | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Subscribe to real-time updates from Firebase and local events
  useEffect(() => {
    // 1. Listen to Firebase RTDB for all students progress
    const unsubProgress = subscribeToAllStudentsProgress((map) => {
      if (map && Object.keys(map).length > 0) {
        setProgressMap((prev) => ({ ...prev, ...map }));
      }
    });

    // 2. Listen to Firebase RTDB for login audits
    const unsubAudit = subscribeToStudentsLoginsAudit((map) => {
      if (map && Object.keys(map).length > 0) {
        setLoginAuditMap((prev) => ({ ...prev, ...map }));
      }
    });

    // 3. Listen to local window events
    const handleLocalLogin = () => {
      setLoginAuditMap(getStudentLoginsAuditMap());
    };
    window.addEventListener('student-login-recorded', handleLocalLogin);

    return () => {
      unsubProgress();
      unsubAudit();
      window.removeEventListener('student-login-recorded', handleLocalLogin);
    };
  }, []);

  // Merge the 60 canonical students with real progress and login audit data
  const enrichedStudents: EnrichedStudentRow[] = useMemo(() => {
    const canonicalStudents = generateSixtyStudents();

    return canonicalStudents.map((stud) => {
      const username = stud.username;
      const groupCode = (stud.groupCode || 'G1') as 'G1' | 'G2' | 'G3' | 'G4';
      const meta = RESEARCH_GROUPS_META[groupCode] || {
        name: 'المجموعة',
        learningMode: 'تنافسي',
        feedbackMode: 'فورية',
      };

      const prog = progressMap[username] || {
        username,
        avatarId: 'cp-bot',
        currentLevel: 1,
        completedLevels: {},
        totalScore: 0,
        hearts: 3,
        badges: [],
        lastActive: '-',
      };

      const audit = loginAuditMap[username] || null;

      // Login metrics
      const hasLoggedIn = !!audit && audit.totalLogins > 0;
      const totalLogins = audit ? audit.totalLogins : 0;
      const firstLogin = audit ? audit.firstLogin : '-';
      const lastLogin = audit ? audit.lastLogin : (prog.lastActive && prog.lastActive !== '-' ? prog.lastActive : '-');
      const latestDevice = audit && audit.sessions && audit.sessions.length > 0 ? audit.sessions[0].device : '-';
      const sessions = audit && audit.sessions ? audit.sessions : [];

      // Pre-test metrics
      const pre = prog.preTestResult;
      const preTestCompleted = !!pre?.completed;
      const preTestScore = pre ? pre.score : 0;
      const preTestMaxScore = pre ? pre.maxScore : 50;
      const preTestPercentage = preTestMaxScore > 0 ? Math.round((preTestScore / preTestMaxScore) * 100) : 0;
      const preTestPassed = !!pre?.passed;
      const preTestDate = pre?.completedAt || '-';
      const preTestTimeSpent = pre?.timeSpentSeconds || 0;

      // Post-test metrics
      const post = prog.postTestResult;
      const postTestCompleted = !!post?.completed;
      const postTestScore = post ? post.score : 0;
      const postTestMaxScore = post ? post.maxScore : 50;
      const postTestPercentage = postTestMaxScore > 0 ? Math.round((postTestScore / postTestMaxScore) * 100) : 0;
      const postTestPassed = !!post?.passed;
      const postTestDate = post?.completedAt || '-';
      const postTestTimeSpent = post?.timeSpentSeconds || 0;

      // Levels metrics
      const completedLevels = prog.completedLevels || {};
      const completedLevelsCount = Object.keys(completedLevels).length;
      const totalLevelsScore = Object.values(completedLevels).reduce((acc, l) => acc + (l.score || 0), 0);

      return {
        username,
        fullName: stud.fullName || username,
        groupCode,
        groupName: meta.name,
        learningMode: meta.learningMode,
        feedbackMode: meta.feedbackMode,
        hasLoggedIn,
        totalLogins,
        firstLogin,
        lastLogin,
        latestDevice,
        sessions,
        preTestCompleted,
        preTestScore,
        preTestMaxScore,
        preTestPercentage,
        preTestPassed,
        preTestDate,
        preTestTimeSpent,
        postTestCompleted,
        postTestScore,
        postTestMaxScore,
        postTestPercentage,
        postTestPassed,
        postTestDate,
        postTestTimeSpent,
        completedLevelsCount,
        totalLevelsScore,
        levelsDetails: completedLevels,
        lastActive: prog.lastActive || '-',
      };
    });
  }, [progressMap, loginAuditMap]);

  // Filter enriched students based on search and filters
  const filteredStudents = useMemo(() => {
    return enrichedStudents.filter((s) => {
      // Group filter
      if (selectedGroupFilter !== 'all' && s.groupCode !== selectedGroupFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'logged_in' && !s.hasLoggedIn) return false;
      if (statusFilter === 'pre_done' && !s.preTestCompleted) return false;
      if (statusFilter === 'post_done' && !s.postTestCompleted) return false;
      if (statusFilter === 'levels_done' && s.completedLevelsCount < 10) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesUser = s.username.toLowerCase().includes(q);
        const matchesGroup = s.groupName.toLowerCase().includes(q) || s.groupCode.toLowerCase().includes(q);
        if (!matchesUser && !matchesGroup) return false;
      }

      return true;
    });
  }, [enrichedStudents, selectedGroupFilter, statusFilter, searchQuery]);

  // Summary Metrics
  const totalCount = enrichedStudents.length; // 60
  const activeLoginsCount = enrichedStudents.filter((s) => s.hasLoggedIn).length;
  const preTestDoneCount = enrichedStudents.filter((s) => s.preTestCompleted).length;
  const postTestDoneCount = enrichedStudents.filter((s) => s.postTestCompleted).length;
  const allLevelsDoneCount = enrichedStudents.filter((s) => s.completedLevelsCount === 10).length;

  // Format seconds to mm:ss
  const formatDuration = (sec: number) => {
    if (!sec || sec <= 0) return '-';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}د و ${s}ث`;
  };

  // ======================= EXPORT HANDLERS (EXCEL / CSV) =======================

  // 1. Export Pre-Test Sheet
  const handleExportPreTestSheet = () => {
    const headers = [
      'م',
      'اسم المستخدم (اليوزر نيم)',
      'المجموعة البحثية',
      'نمط التعلم',
      'نمط التغذية الراجعة',
      'حالة إتمام الاختبار القبلي',
      'تاريخ ووقت الإتمام الفعلي',
      'الدرجة المحرزة',
      'الدرجة العظمى',
      'النسبة المئوية (%)',
      'حالة الاجتياز',
      'زمن الإجابة المستغرق',
    ];

    const rows = enrichedStudents.map((s, idx) => [
      idx + 1,
      s.username,
      `${s.groupCode} (${s.groupName})`,
      s.learningMode,
      s.feedbackMode,
      s.preTestCompleted ? 'مكتمل' : 'غير مكتمل',
      s.preTestDate,
      s.preTestCompleted ? s.preTestScore : '-',
      s.preTestCompleted ? s.preTestMaxScore : '-',
      s.preTestCompleted ? `${s.preTestPercentage}%` : '-',
      s.preTestCompleted ? (s.preTestPassed ? 'مجتاز بنجاح' : 'لم يجتز') : 'لم يتقدم',
      s.preTestCompleted ? formatDuration(s.preTestTimeSpent) : '-',
    ]);

    downloadCsvSheet('شيت_نتائج_الاختبار_القبلي_PreTest_Results', headers, rows);
    showToast('تم تصدير وتحميل شيت نتائج الاختبار القبلي بنجاح بصيغة Excel / CSV');
  };

  // 2. Export Post-Test Sheet
  const handleExportPostTestSheet = () => {
    const headers = [
      'م',
      'اسم المستخدم (اليوزر نيم)',
      'المجموعة البحثية',
      'نمط التعلم',
      'نمط التغذية الراجعة',
      'حالة إتمام الاختبار البعدي',
      'تاريخ ووقت الإتمام الفعلي',
      'الدرجة المحرزة',
      'الدرجة العظمى',
      'النسبة المئوية (%)',
      'حالة الاجتياز',
      'زمن الإجابة المستغرق',
    ];

    const rows = enrichedStudents.map((s, idx) => [
      idx + 1,
      s.username,
      `${s.groupCode} (${s.groupName})`,
      s.learningMode,
      s.feedbackMode,
      s.postTestCompleted ? 'مكتمل' : 'غير مكتمل',
      s.postTestDate,
      s.postTestCompleted ? s.postTestScore : '-',
      s.postTestCompleted ? s.postTestMaxScore : '-',
      s.postTestCompleted ? `${s.postTestPercentage}%` : '-',
      s.postTestCompleted ? (s.postTestPassed ? 'مجتاز بنجاح' : 'لم يجتز') : 'لم يتقدم',
      s.postTestCompleted ? formatDuration(s.postTestTimeSpent) : '-',
    ]);

    downloadCsvSheet('شيت_نتائج_الاختبار_البعدي_PostTest_Results', headers, rows);
    showToast('تم تصدير وتحميل شيت نتائج الاختبار البعدي بنجاح بصيغة Excel / CSV');
  };

  // 3. Export 10 Stages Game Levels Sheet
  const handleExportLevelsSheet = () => {
    const headers = [
      'م',
      'اسم المستخدم (اليوزر نيم)',
      'المجموعة البحثية',
      'نمط التعلم',
      'نمط التغذية الراجعة',
      'عدد المراحل المكتملة (من 10)',
      'إجمالي نقاط الخبرة (XP)',
      'نسبة إنجاز المراحل (%)',
      'تاريخ آخر مرحلة منجزة',
    ];

    const rows = enrichedStudents.map((s, idx) => [
      idx + 1,
      s.username,
      `${s.groupCode} (${s.groupName})`,
      s.learningMode,
      s.feedbackMode,
      `${s.completedLevelsCount} / 10`,
      s.totalLevelsScore,
      `${Math.round((s.completedLevelsCount / 10) * 100)}%`,
      s.lastActive,
    ]);

    downloadCsvSheet('شيت_نتائج_المراحل_التعليمية_العشر_Levels_Results', headers, rows);
    showToast('تم تصدير وتحميل شيت نتائج المراحل العشر بنجاح بصيغة Excel / CSV');
  };

  // 4. Export Real Logins Sheet
  const handleExportLoginsSheet = () => {
    const headers = [
      'م',
      'اسم المستخدم (اليوزر نيم)',
      'المجموعة البحثية',
      'حالة الدخول للمنظومة',
      'إجمالي عدد مرات الدخول الفعلي',
      'تاريخ ووقت أول تسجيل دخول',
      'تاريخ ووقت آخر تسجيل دخول',
      'نوع الجهاز والمتصفح',
    ];

    const rows = enrichedStudents.map((s, idx) => [
      idx + 1,
      s.username,
      `${s.groupCode} (${s.groupName})`,
      s.hasLoggedIn ? 'سجل دخول فعلياً' : 'لم يسجل دخول بعد',
      s.totalLogins,
      s.firstLogin,
      s.lastLogin,
      s.latestDevice,
    ]);

    downloadCsvSheet('سجل_تسجيل_الدخول_الفعلي_Students_Logins', headers, rows);
    showToast('تم تصدير وتحميل سجل تسجيل الدخول الفعلي للطلاب بنجاح');
  };

  // 5. Comprehensive Master Sheet
  const handleExportComprehensiveSheet = () => {
    const headers = [
      'م',
      'اسم المستخدم (اليوزر نيم)',
      'المجموعة البحثية',
      'نمط التعلم',
      'نمط التغذية الراجعة',
      'عدد مرات الدخول الفعلي',
      'تاريخ ووقت أول دخول',
      'تاريخ ووقت آخر دخول',
      'جهاز الدخول',
      'حالة الاختبار القبلي',
      'درجة الاختبار القبلي (/50)',
      'نسبة القبلي (%)',
      'اجتياز القبلي',
      'تاريخ القبلي',
      'المراحل المكتملة (من 10)',
      'نقاط المراحل (XP)',
      'حالة الاختبار البعدي',
      'درجة الاختبار البعدي (/50)',
      'نسبة البعدي (%)',
      'اجتياز البعدي',
      'تاريخ البعدي',
    ];

    const rows = enrichedStudents.map((s, idx) => [
      idx + 1,
      s.username,
      `${s.groupCode} (${s.groupName})`,
      s.learningMode,
      s.feedbackMode,
      s.totalLogins,
      s.firstLogin,
      s.lastLogin,
      s.latestDevice,
      s.preTestCompleted ? 'مكتمل' : 'غير مكتمل',
      s.preTestCompleted ? s.preTestScore : '-',
      s.preTestCompleted ? `${s.preTestPercentage}%` : '-',
      s.preTestCompleted ? (s.preTestPassed ? 'مجتاز' : 'غير مجتاز') : '-',
      s.preTestDate,
      `${s.completedLevelsCount}/10`,
      s.totalLevelsScore,
      s.postTestCompleted ? 'مكتمل' : 'غير مكتمل',
      s.postTestCompleted ? s.postTestScore : '-',
      s.postTestCompleted ? `${s.postTestPercentage}%` : '-',
      s.postTestCompleted ? (s.postTestPassed ? 'مجتاز' : 'غير مجتاز') : '-',
      s.postTestDate,
    ]);

    downloadCsvSheet('الشيت_الشامل_لكافة_البيانات_والدرجات_Master_Report', headers, rows);
    showToast('تم استخراج وتحميل الشيت الإحصائي الشامل الموحد بنجاح');
  };

  // Copy current view to clipboard as table
  const handleCopyCurrentTable = async () => {
    const headers = [
      'م',
      'اليوزر نيم',
      'المجموعة',
      'مرات الدخول',
      'آخر دخول',
      'درجة القبلي',
      'اجتياز القبلي',
      'تاريخ القبلي',
      'المراحل المنجزة',
      'درجة البعدي',
      'اجتياز البعدي',
      'تاريخ البعدي',
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.username,
      s.groupCode,
      s.totalLogins,
      s.lastLogin,
      s.preTestCompleted ? `${s.preTestScore}/${s.preTestMaxScore}` : '-',
      s.preTestCompleted ? (s.preTestPassed ? 'ناجح' : 'راسب') : '-',
      s.preTestDate,
      `${s.completedLevelsCount}/10`,
      s.postTestCompleted ? `${s.postTestScore}/${s.postTestMaxScore}` : '-',
      s.postTestCompleted ? (s.postTestPassed ? 'ناجح' : 'راسب') : '-',
      s.postTestDate,
    ]);

    const ok = await copySheetToClipboard(headers, rows);
    if (ok) {
      setCopiedType('table');
      showToast('تم نسخ بيانات الجدول للحافظة! يمكنك الآن لصقها في Google Sheets أو Excel مباشرة');
      setTimeout(() => setCopiedType(null), 3000);
    }
  };

  return (
    <div className="space-y-6 font-['Cairo',_sans-serif] text-right">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-blue-950/90 border-blue-500 text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 font-bold px-2 py-1 rounded bg-black/40"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header Card with Export Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-950/60 shrink-0 font-black">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-black">
                  سجل الدخول الفعلي والنتائج • مزامنة فايربيس الحية
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] tracking-tight">
                سجل تسجيل الدخول الحقيقي واجتيازات الاختبارات للطلاب
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                تتبع بالوقت والتاريخ الفعلي لدخول الطلاب، نتائج واجتيازات الاختبار القبلي والبعدي والمراحل العشر، واستخراج شيتات Excel الإحصائية بضغطة زر.
              </p>
            </div>
          </div>

          {/* Quick Master Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleExportComprehensiveSheet}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer transition transform hover:scale-105 shrink-0"
              title="تصدير شيت إكسل شامل موحد لكافة الاختبارات وسجلات الدخول"
            >
              <Download className="w-4 h-4" />
              <span>📊 الشيت الإحصائي الشامل</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCurrentTable}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition shrink-0"
              title="نسخ الجدول الحالي للصقه مباشرة في Google Sheets"
            >
              {copiedType === 'table' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedType === 'table' ? 'تم النسخ!' : 'نسخ كجدول شيت'}</span>
            </button>
          </div>
        </div>

        {/* 4 Dedicated Test Sheet Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          {/* Button 1: Pre-test */}
          <button
            type="button"
            onClick={handleExportPreTestSheet}
            className="p-3.5 rounded-2xl bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/40 text-amber-200 flex items-center justify-between text-xs font-bold transition cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 group-hover:scale-110 transition">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="block font-black text-amber-300">شيت الاختبار القبلي</span>
                <span className="text-[11px] text-slate-400">{preTestDoneCount} طالب أنجزوه</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-amber-400 shrink-0" />
          </button>

          {/* Button 2: Post-test */}
          <button
            type="button"
            onClick={handleExportPostTestSheet}
            className="p-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/40 text-purple-200 flex items-center justify-between text-xs font-bold transition cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-110 transition">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="block font-black text-purple-300">شيت الاختبار البعدي</span>
                <span className="text-[11px] text-slate-400">{postTestDoneCount} طالب أنجزوه</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-purple-400 shrink-0" />
          </button>

          {/* Button 3: 10 Stages */}
          <button
            type="button"
            onClick={handleExportLevelsSheet}
            className="p-3.5 rounded-2xl bg-blue-950/40 hover:bg-blue-950/60 border border-blue-500/40 text-blue-200 flex items-center justify-between text-xs font-bold transition cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-110 transition">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="block font-black text-blue-300">شيت المراحل العشر</span>
                <span className="text-[11px] text-slate-400">{allLevelsDoneCount} أتموا الـ 10 كاملة</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-blue-400 shrink-0" />
          </button>

          {/* Button 4: Logins Audit */}
          <button
            type="button"
            onClick={handleExportLoginsSheet}
            className="p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-center justify-between text-xs font-bold transition cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="block font-black text-emerald-300">سجل الدخول الفعلي</span>
                <span className="text-[11px] text-slate-400">{activeLoginsCount} طالب سجلوا دخول</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#090b17] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold block mb-1">الطلاب المسجلين</span>
            <span className="text-2xl font-black text-white font-mono">{totalCount}</span>
            <span className="text-[11px] text-slate-500 block">4 مجموعات بحثية</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090b17] border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-bold block mb-1">الدخول الفعلي</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{activeLoginsCount}</span>
            <span className="text-[11px] text-slate-400 block">نسبة {Math.round((activeLoginsCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090b17] border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300 font-bold block mb-1">إنجاز القبلي</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{preTestDoneCount}</span>
            <span className="text-[11px] text-slate-400 block">نسبة {Math.round((preTestDoneCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090b17] border border-purple-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-purple-300 font-bold block mb-1">إنجاز البعدي</span>
            <span className="text-2xl font-black text-purple-400 font-mono">{postTestDoneCount}</span>
            <span className="text-[11px] text-slate-400 block">نسبة {Math.round((postTestDoneCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#090b17] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باليوزر نيم (G1_Cp_01 ...) أو المجموعة..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none transition"
          />
        </div>

        {/* Group Selector Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="all">كافة المجموعات (60 طالباً)</option>
            <option value="G1">G1: تنافسي فوري (15 طالباً)</option>
            <option value="G2">G2: تنافسي مرجأ (15 طالباً)</option>
            <option value="G3">G3: تعاوني فوري (15 طالباً)</option>
            <option value="G4">G4: تعاوني مرجأ (15 طالباً)</option>
          </select>
        </div>

        {/* Status Selector Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="all">كافة الحالات</option>
            <option value="logged_in">سجلوا دخول فعلياً فقط</option>
            <option value="pre_done">أتموا الاختبار القبلي</option>
            <option value="post_done">أتموا الاختبار البعدي</option>
            <option value="levels_done">أتموا كافة المراحل (10/10)</option>
          </select>
        </div>
      </div>

      {/* Main Students & Tests Results Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#090c1e] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 text-slate-300 border-b border-slate-800 font-bold">
                <th className="p-3.5 text-center w-12">#</th>
                <th className="p-3.5">اسم المستخدم (اليوزر نيم)</th>
                <th className="p-3.5 text-center">المجموعة</th>
                <th className="p-3.5">تسجيل الدخول الفعلي</th>
                <th className="p-3.5 text-center">الاختبار القبلي</th>
                <th className="p-3.5 text-center">المراحل (10)</th>
                <th className="p-3.5 text-center">الاختبار البعدي</th>
                <th className="p-3.5 text-center">سجل الجلسات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredStudents.map((s, idx) => (
                <tr
                  key={s.username}
                  className="hover:bg-slate-900/60 transition-colors"
                >
                  {/* Index */}
                  <td className="p-3.5 text-center text-slate-500 font-mono font-bold">
                    {idx + 1}
                  </td>

                  {/* Username & Avatar */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-300 font-mono text-xs shrink-0">
                        {s.username.split('_')[0]}
                      </div>
                      <div>
                        <span className="font-mono font-black text-white text-xs block">
                          {s.username}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {s.feedbackMode} • {s.learningMode}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Group Code */}
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-black font-mono border ${
                        s.groupCode === 'G1'
                          ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                          : s.groupCode === 'G2'
                          ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                          : s.groupCode === 'G3'
                          ? 'bg-blue-950/60 border-blue-500/50 text-blue-300'
                          : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      }`}
                    >
                      {s.groupCode}
                    </span>
                  </td>

                  {/* Login Tracking */}
                  <td className="p-3.5">
                    {s.hasLoggedIn ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>دخول فعلي ({s.totalLogins} مرات)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          آخر دخول: {s.lastLogin}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          {s.latestDevice.includes('Mobile') ? (
                            <Smartphone className="w-3 h-3 text-slate-400" />
                          ) : (
                            <Monitor className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{s.latestDevice}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">
                        لم يسجل دخول بعد
                      </span>
                    )}
                  </td>

                  {/* Pre-Test Result */}
                  <td className="p-3.5 text-center">
                    {s.preTestCompleted ? (
                      <div className="inline-block p-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center">
                        <div className="font-mono font-black text-amber-300 text-xs">
                          {s.preTestScore} / {s.preTestMaxScore} ({s.preTestPercentage}%)
                        </div>
                        <div className="text-[10px] font-bold text-emerald-400">
                          {s.preTestPassed ? '✓ مجتاز' : 'لم يجتز'}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          {s.preTestDate.split(' ')[0]}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">لم يكتمل</span>
                    )}
                  </td>

                  {/* 10 Stages */}
                  <td className="p-3.5 text-center">
                    <div className="inline-block p-1.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-center">
                      <div className="font-mono font-black text-blue-300 text-xs">
                        {s.completedLevelsCount} / 10 مراحل
                      </div>
                      <div className="text-[10px] font-mono text-cyan-300 font-bold">
                        {s.totalLevelsScore} XP
                      </div>
                    </div>
                  </td>

                  {/* Post-Test Result */}
                  <td className="p-3.5 text-center">
                    {s.postTestCompleted ? (
                      <div className="inline-block p-1.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-center">
                        <div className="font-mono font-black text-purple-300 text-xs">
                          {s.postTestScore} / {s.postTestMaxScore} ({s.postTestPercentage}%)
                        </div>
                        <div className="text-[10px] font-bold text-emerald-400">
                          {s.postTestPassed ? '✓ مجتاز' : 'لم يجتز'}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          {s.postTestDate.split(' ')[0]}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">لم يكتمل</span>
                    )}
                  </td>

                  {/* Sessions Inspection Button */}
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => setInspectStudent(s)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      title="عرض سجل الجلسات وتفاصيل الدخول"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>التفاصيل</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-sm">
                    لم يتم العثور على أي طلاب مطابقين لشروط البحث والتصفية
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= INDIVIDUAL STUDENT SESSION MODAL ======================= */}
      {inspectStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectStudent(null);
          }}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl bg-[#0f142e] border-2 border-emerald-500/80 p-6 shadow-2xl space-y-5 text-right my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-['Tajawal']">
                    سجل جلسات الدخول الفعلي: {inspectStudent.username}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {inspectStudent.groupCode} ({inspectStudent.groupName}) • إجمالي {inspectStudent.totalLogins} تسجيل دخول
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Test Summaries for this Student */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-amber-300 font-bold block">القبلي</span>
                <span className="text-xs font-black text-white font-mono block mt-0.5">
                  {inspectStudent.preTestCompleted ? `${inspectStudent.preTestScore}/50` : 'لم يتم'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-blue-300 font-bold block">المراحل</span>
                <span className="text-xs font-black text-white font-mono block mt-0.5">
                  {inspectStudent.completedLevelsCount} / 10
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-purple-300 font-bold block">البعدي</span>
                <span className="text-xs font-black text-white font-mono block mt-0.5">
                  {inspectStudent.postTestCompleted ? `${inspectStudent.postTestScore}/50` : 'لم يتم'}
                </span>
              </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>تفاصيل الجلسات والتاريخ والوقت الفعلي:</span>
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {inspectStudent.sessions && inspectStudent.sessions.length > 0 ? (
                  inspectStudent.sessions.map((sess, sIdx) => (
                    <div
                      key={sess.id || sIdx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-emerald-950/80 text-emerald-300 font-mono font-bold flex items-center justify-center text-[10px] border border-emerald-500/30">
                          {sIdx + 1}
                        </span>
                        <div>
                          <span className="font-mono text-white font-bold block text-xs">
                            {sess.timestamp}
                          </span>
                          <span className="text-[10px] text-slate-400">{sess.device}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold">
                        جلسة مسجلة
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                    لم يتم تسجيل أي جلسات دخول لهذا الطالب بعد
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
