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
import { generateSixtyStudents, RESEARCH_GROUPS_META, getGroupByUsername, getCollaborativeGroupByUsername } from '../data/studentAccounts';
import { getAllTripartiteNames, getStudentTripartiteName } from '../utils/studentNameStorage';
import { StudentGameProgress, PreTestResult, CompletedLevelResult, StudentTestAccessSummary, TestAccessSession, PreTestQuestion } from '../types';
import { getPostTestQuestions, getPreTestQuestions } from '../data/preTestData';
import { GAME_LEVELS_DATA } from '../data/gameLevelsData';
import {
  getStudentLoginsAuditMap,
  saveAllStudentLoginsAudit,
  StudentLoginAudit,
  StudentLoginSession,
  downloadCsvSheet,
  copySheetToClipboard,
} from '../utils/studentAuditStorage';
import {
  getTestAccessAuditMap,
  saveTestAccessAuditMap,
  getAllStudentsTestAccessSummaries,
  getStudentTestInterpretation,
} from '../utils/testAccessAuditStorage';
import {
  subscribeToAllStudentsProgress,
  subscribeToStudentsLoginsAudit,
  subscribeToAllTestAccessAudit,
  fetchAllStudentsProgressFromCloud,
  fetchAllLoginsAuditFromCloud,
  fetchAllTestAccessAuditFromCloud,
} from '../utils/realtimeService';
import { getAllStudentsProgress, saveAllStudentsProgress, resetAllStudentsToRealCleanState } from '../utils/gameStorage';
import { seedPreTestSubmissions } from '../data/preTestSubmissionsSeed';

type AuditTabFilter = 'all' | 'pretest_sheet' | 'test_visits' | 'detailed_answers' | 'logins';

interface EnrichedStudentRow {
  username: string;
  firstName: string;
  fatherName: string;
  familyName: string;
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
  raw: StudentGameProgress;
}

const getCompleteStudentName = (
  username: string,
  portalUsers: any[],
  tripartiteNames: Record<string, any>
): { firstName: string; fatherName: string; familyName: string; fullName: string } => {
  const norm = username.trim().toUpperCase();
  const parts = getStudentTripartiteName(username);
  if (parts.firstName || parts.fatherName || parts.familyName) {
    return {
      firstName: parts.firstName || '-',
      fatherName: parts.fatherName || '-',
      familyName: parts.familyName || '-',
      fullName: `${parts.firstName} ${parts.fatherName} ${parts.familyName}`.trim(),
    };
  }
  const rawMap = tripartiteNames[norm];
  if (rawMap) {
    return {
      firstName: rawMap.firstName || '-',
      fatherName: rawMap.fatherName || '-',
      familyName: rawMap.familyName || '-',
      fullName: `${rawMap.firstName || ''} ${rawMap.fatherName || ''} ${rawMap.familyName || ''}`.trim(),
    };
  }
  const user = portalUsers.find((u) => u.username?.toUpperCase() === norm);
  if (user?.fullName && user.fullName.trim() !== username) {
    const tokens = user.fullName.trim().split(/\s+/);
    return {
      firstName: tokens[0] || '-',
      fatherName: tokens[1] || '-',
      familyName: tokens.slice(2).join(' ') || '-',
      fullName: user.fullName,
    };
  }
  return { firstName: '-', fatherName: '-', familyName: '-', fullName: username };
};

const computeActualMaxScore = (questions: PreTestQuestion[]): number => {
  return questions.reduce((acc, q) => acc + (q.points || 1), 0);
};

const formatEgyptDateTime = (isoString: string): string => {
  if (isoString === '-' || !isoString) return '-';
  try {
    const normalized = isoString.includes('T') ? isoString : isoString.replace(' ', 'T');
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString('ar-EG', {
      timeZone: 'Africa/Cairo',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch { return isoString; }
};

export const AdminStudentsAuditManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AuditTabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | 'G1' | 'G2' | 'G3' | 'G4'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'logged_in' | 'pre_done' | 'post_done' | 'levels_done'>('all');

  // Real-time state
  const [progressMap, setProgressMap] = useState<Record<string, StudentGameProgress>>(() => getAllStudentsProgress());
  const [loginAuditMap, setLoginAuditMap] = useState<Record<string, StudentLoginAudit>>(() => getStudentLoginsAuditMap());
  const [testAccessMap, setTestAccessMap] = useState<Record<string, Record<string, StudentTestAccessSummary>>>(() => getTestAccessAuditMap());

  // Additional test filters for visits and detailed answers
  const [selectedVisitTestFilter, setSelectedVisitTestFilter] = useState<string>('all');
  const [detailedAnswersTest, setDetailedAnswersTest] = useState<'pre' | 'post' | number>('pre');
  const [inspectTestAccessSummary, setInspectTestAccessSummary] = useState<StudentTestAccessSummary | null>(null);

  // Copy feedback
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Selected student for session inspection modal
  const [inspectStudent, setInspectStudent] = useState<EnrichedStudentRow | null>(null);

  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Full manual cloud fetch & sync from Firebase RTDB
  const handleManualCloudSync = async (silent: boolean = false) => {
    setIsSyncingCloud(true);
    try {
      const [cloudProgress, cloudLogins, cloudTestAccess] = await Promise.all([
        fetchAllStudentsProgressFromCloud(),
        fetchAllLoginsAuditFromCloud(),
        fetchAllTestAccessAuditFromCloud(),
      ]);

      let preTestCount = 0;
      let missingInCloudCount = 0;
      const localProgress = getAllStudentsProgress();

      if (cloudProgress) {
        const mergedProgress = { ...localProgress, ...cloudProgress };
        saveAllStudentsProgress(mergedProgress);
        setProgressMap(mergedProgress);
        preTestCount = Object.values(mergedProgress).filter(
          (p) => p.preTestResult && p.preTestResult.completed
        ).length;

        // Diagnostic: Find students who have local progress but missing in RTDB
        Object.keys(localProgress).forEach(username => {
          if (!cloudProgress[username] && localProgress[username].preTestResult?.completed) {
            missingInCloudCount++;
          }
        });
      }

      if (cloudLogins && Object.keys(cloudLogins).length > 0) {
        const mergedLogins = { ...getStudentLoginsAuditMap(), ...cloudLogins };
        saveAllStudentLoginsAudit(mergedLogins);
        setLoginAuditMap(mergedLogins);
      }

      if (cloudTestAccess && Object.keys(cloudTestAccess).length > 0) {
        const mergedTestAccess = { ...getTestAccessAuditMap(), ...cloudTestAccess };
        saveTestAccessAuditMap(mergedTestAccess);
        setTestAccessMap(mergedTestAccess);
      }

      if (!silent) {
        let msg = `تمت المزامنة وجلب كافة نتائج الطلاب من السحابة بنجاح! تم تحديث بيانات (${preTestCount}) نتيجة اختبار قبلي.`;
        if (missingInCloudCount > 0) {
          msg += ` تنبيه: هناك (${missingInCloudCount}) طالب لديهم نتائج محلياً ولكنها مفقودة في السحابة!`;
        }
        showToast(msg, missingInCloudCount > 0 ? 'info' : 'success');
      }
    } catch (err: any) {
      if (!silent) {
        showToast('تم فحص السحابة والاحتفاظ بالبيانات الحالية.', 'info');
      }
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Subscribe to real-time updates from Firebase and local events
  useEffect(() => {
    // Initial fetch on mount to pull any submissions students completed on their devices
    handleManualCloudSync(true);

    // 1. Listen to Firebase RTDB for all students progress
    const unsubProgress = subscribeToAllStudentsProgress((map) => {
      if (map && Object.keys(map).length > 0) {
        setProgressMap((prev) => {
          const merged = { ...prev, ...map };
          saveAllStudentsProgress(merged);
          return merged;
        });
      }
    });

    // 2. Listen to Firebase RTDB for login audits
    const unsubAudit = subscribeToStudentsLoginsAudit((map) => {
      if (map && Object.keys(map).length > 0) {
        setLoginAuditMap((prev) => {
          const merged = { ...prev, ...map };
          saveAllStudentLoginsAudit(merged);
          return merged;
        });
      }
    });

    // 3. Listen to Firebase RTDB for test access audits
    const unsubTestAccess = subscribeToAllTestAccessAudit((map) => {
      if (map && Object.keys(map).length > 0) {
        setTestAccessMap((prev) => {
          const merged = { ...prev, ...map };
          saveTestAccessAuditMap(merged);
          return merged;
        });
      }
    });

    // 4. Listen to local window events
    const handleLocalLogin = () => {
      setLoginAuditMap(getStudentLoginsAuditMap());
    };
    const handleProgressUpdate = () => {
      setProgressMap(getAllStudentsProgress());
    };
    const handleTestAccessUpdate = () => {
      setTestAccessMap(getTestAccessAuditMap());
    };

    window.addEventListener('student-login-recorded', handleLocalLogin);
    window.addEventListener('cp_student_profile_updated', handleProgressUpdate);
    window.addEventListener('cp_student_progress_reset', handleProgressUpdate);
    window.addEventListener('cp_student_activity_graded', handleProgressUpdate);
    window.addEventListener('student-test-access-updated', handleTestAccessUpdate);

    return () => {
      unsubProgress();
      unsubAudit();
      unsubTestAccess();
      window.removeEventListener('student-login-recorded', handleLocalLogin);
      window.removeEventListener('cp_student_profile_updated', handleProgressUpdate);
      window.removeEventListener('cp_student_progress_reset', handleProgressUpdate);
      window.removeEventListener('cp_student_activity_graded', handleProgressUpdate);
      window.removeEventListener('student-test-access-updated', handleTestAccessUpdate);
    };
  }, []);

  // Merge the 60 canonical students with real progress and login audit data
  const enrichedStudents: EnrichedStudentRow[] = useMemo(() => {
    const canonicalStudents = generateSixtyStudents();
    const tripartiteNames = getAllTripartiteNames();
    const portalUsers: any[] = (() => {
      try { return JSON.parse(localStorage.getItem('cp_portal_users_v4') || '[]'); }
      catch { return []; }
    })();

    return canonicalStudents.map((stud) => {
      const username = stud.username;
      const nameParts = getCompleteStudentName(username, portalUsers, tripartiteNames);
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
      const firstLogin = audit ? formatEgyptDateTime(audit.firstLogin) : '-';
      const lastLogin = audit ? formatEgyptDateTime(audit.lastLogin) : (prog.lastActive && prog.lastActive !== '-' ? formatEgyptDateTime(prog.lastActive) : '-');
      const latestDevice = audit && audit.sessions && audit.sessions.length > 0 ? audit.sessions[0].device : '-';
      const sessions = audit && audit.sessions ? audit.sessions : [];

      // Pre-test metrics
      const pre = prog.preTestResult;
      const preTestCompleted = !!pre?.completed;
      const preTestScore = pre ? pre.score : 0;
      const preTestMaxScore = pre && pre.maxScore ? pre.maxScore : computeActualMaxScore(getPreTestQuestions());
      const preTestPercentage = preTestMaxScore > 0 ? Math.round((preTestScore / preTestMaxScore) * 100) : 0;
      const preTestPassed = !!pre?.passed;
      const preTestDate = pre?.completedAt ? formatEgyptDateTime(pre.completedAt) : '-';
      const preTestTimeSpent = pre?.timeSpentSeconds || 0;

      // Post-test metrics
      const post = prog.postTestResult;
      const postTestCompleted = !!post?.completed;
      const postTestScore = post ? post.score : 0;
      const postTestMaxScore = post && post.maxScore ? post.maxScore : computeActualMaxScore(getPostTestQuestions());
      const postTestPercentage = postTestMaxScore > 0 ? Math.round((postTestScore / postTestMaxScore) * 100) : 0;
      const postTestPassed = !!post?.passed;
      const postTestDate = post?.completedAt ? formatEgyptDateTime(post.completedAt) : '-';
      const postTestTimeSpent = post?.timeSpentSeconds || 0;

      // Levels metrics
      const completedLevels = prog.completedLevels || {};
      const completedLevelsCount = Object.keys(completedLevels).length;
      const totalLevelsScore = Object.values(completedLevels).reduce((acc, l) => acc + (l.score || 0), 0);

      return {
        username,
        firstName: nameParts.firstName,
        fatherName: nameParts.fatherName,
        familyName: nameParts.familyName,
        fullName: nameParts.fullName,
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
        lastActive: prog.lastActive !== '-' ? formatEgyptDateTime(prog.lastActive) : '-',
        raw: prog,
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

  // 1. Export Pre-Test Sheet with Question Explanations
  const handleExportPreTestSheet = () => {
    const preQuestions = getPreTestQuestions();
    const qHeaders = preQuestions.flatMap((q, i) => [
      `س${i + 1} - النطاق/الموديول`,
      `س${i + 1} - نص السؤال`,
      `س${i + 1} - إجابة الطالب`,
      `س${i + 1} - الإجابة الصحيحة`,
      `س${i + 1} - النتيجة (0/1 أو 1/1)`,
      `س${i + 1} - التفسير والتغذية الراجعة`,
    ]);

    const headers = [
      'م',
      'اسم المستخدم (اليوزر نيم)',
      'الاسم الأول',
      'اسم الأب',
      'اسم العائلة',
      'الاسم الكامل',
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
      ...qHeaders,
    ];

    const rows = enrichedStudents.map((s, idx) => {
      const qCols = preQuestions.flatMap((q, i) => {
        if (!s.preTestCompleted || !s.raw.preTestResult) return ['-', q.question, '-', q.options[q.correctIndex] || '-', '-', q.explanation || '-'];
        const domain = (q as any).module || (q as any).domain || (() => {
          if (i < 6) return 'الموديول 1: التثبيت والوسائط المتعددة';
          if (i < 11) return 'الموديول 2: واجهة البرنامج والخصائص';
          if (i < 16) return 'الموديول 3: أنماط المشروعات و العروض';
          if (i < 21) return 'الموديول 4: الأشكال الذكية والشرائح والألوان';
          if (i < 26) return 'الموديول 5: المحاذاة والتحريك والتجميع';
          if (i < 31) return 'الموديول 6: بنوك الأسئلة والنتائج والتقويم';
          if (i < 37) return 'الموديول 7: الخط الزمني والتغذية الراجعة والفيديو';
          if (i < 42) return 'الموديول 8: استيراد عروض PowerPoint';
          if (i < 48) return 'الموديول 9: أزرار التفاعل والمحاكاة البرمجية';
          return 'الموديول 10: النشر الإلكتروني ومعايير SCORM';
        })();
        const chosenIdx = s.raw.preTestResult.answers?.[q.id];
        const chosenText = chosenIdx !== undefined && chosenIdx >= 0 && q.options[chosenIdx]
          ? `${['أ', 'ب', 'ج', 'د', 'هـ'][chosenIdx] || chosenIdx + 1}. ${q.options[chosenIdx]}`
          : 'لم تتم الإجابة';
        const correctText = q.options[q.correctIndex]
          ? `${['أ', 'ب', 'ج', 'د', 'هـ'][q.correctIndex] || q.correctIndex + 1}. ${q.options[q.correctIndex]}`
          : '-';
        const itemScore = s.raw.preTestResult.questionScores?.[q.id] ?? (chosenIdx === q.correctIndex ? 1 : 0);
        const explanation = q.explanation || 'لا يوجد تفسير إضافي';
        return [domain, q.question, chosenText, correctText, itemScore === 1 ? '1/1' : '0/1', explanation];
      });

      return [
        idx + 1,
        s.username,
        s.firstName,
        s.fatherName,
        s.familyName,
        s.fullName,
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
        ...qCols,
      ];
    });

    downloadCsvSheet('شيت_نتائج_الاختبار_القبلي_مع_التفسير_PreTest_Results', headers, rows);
    showToast('تم تصدير وتحميل شيت نتائج الاختبار القبلي بنجاح مع إجابات كل سؤال وتفسيرها بالكامل');
  };

  // 2. Export Post-Test Sheet with Question Explanations
  const handleExportPostTestSheet = () => {
    const postQuestions = getPostTestQuestions();
    const qHeaders = postQuestions.flatMap((q, i) => [
      `س${i + 1} - النطاق/الموديول`,
      `س${i + 1} - نص السؤال`,
      `س${i + 1} - إجابة الطالب`,
      `س${i + 1} - الإجابة الصحيحة`,
      `س${i + 1} - النتيجة (0/1 أو 1/1)`,
      `س${i + 1} - التفسير والتغذية الراجعة`,
    ]);

    const headers = [
      'م',
      'اسم المستخدم (اليوزر نيم)',
      'الاسم الأول',
      'اسم الأب',
      'اسم العائلة',
      'الاسم الكامل',
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
      ...qHeaders,
    ];

    const rows = enrichedStudents.map((s, idx) => {
      const qCols = postQuestions.flatMap((q, i) => {
        if (!s.postTestCompleted || !s.raw.postTestResult) return ['-', q.question, '-', q.options[q.correctIndex] || '-', '-', q.explanation || '-'];
        const domain = (q as any).module || (q as any).domain || (() => {
          if (i < 6) return 'الموديول 1: التثبيت والوسائط المتعددة';
          if (i < 11) return 'الموديول 2: واجهة البرنامج والخصائص';
          if (i < 16) return 'الموديول 3: أنماط المشروعات و العروض';
          if (i < 21) return 'الموديول 4: الأشكال الذكية والشرائح والألوان';
          if (i < 26) return 'الموديول 5: المحاذاة والتحريك والتجميع';
          if (i < 31) return 'الموديول 6: بنوك الأسئلة والنتائج والتقويم';
          if (i < 37) return 'الموديول 7: الخط الزمني والتغذية الراجعة والفيديو';
          if (i < 42) return 'الموديول 8: استيراد عروض PowerPoint';
          if (i < 48) return 'الموديول 9: أزرار التفاعل والمحاكاة البرمجية';
          return 'الموديول 10: النشر الإلكتروني ومعايير SCORM';
        })();
        const chosenIdx = s.raw.postTestResult.answers?.[q.id];
        const chosenText = chosenIdx !== undefined && chosenIdx >= 0 && q.options[chosenIdx]
          ? `${['أ', 'ب', 'ج', 'د', 'هـ'][chosenIdx] || chosenIdx + 1}. ${q.options[chosenIdx]}`
          : 'لم تتم الإجابة';
        const correctText = q.options[q.correctIndex]
          ? `${['أ', 'ب', 'ج', 'د', 'هـ'][q.correctIndex] || q.correctIndex + 1}. ${q.options[q.correctIndex]}`
          : '-';
        const itemScore = s.raw.postTestResult.questionScores?.[q.id] ?? (chosenIdx === q.correctIndex ? 1 : 0);
        const explanation = q.explanation || 'لا يوجد تفسير إضافي';
        return [domain, q.question, chosenText, correctText, itemScore === 1 ? '1/1' : '0/1', explanation];
      });

      return [
        idx + 1,
        s.username,
        s.firstName,
        s.fatherName,
        s.familyName,
        s.fullName,
        `${s.groupCode} (${s.groupName})`,
        s.learningMode,
        s.feedbackMode,
        s.postTestCompleted ? 'مكتمل' : 'غير مكتمل',
        s.postTestDate,
        s.postTestCompleted ? s.postTestScore : '-',
        s.postTestCompleted ? s.postTestMaxScore : computeActualMaxScore(postQuestions),
        s.postTestCompleted ? `${s.postTestPercentage}%` : '-',
        s.postTestCompleted ? (s.postTestPassed ? 'مجتاز بنجاح' : 'لم يجتز') : 'لم يتقدم',
        s.postTestCompleted ? formatDuration(s.postTestTimeSpent) : '-',
        ...qCols,
      ];
    });

    downloadCsvSheet('شيت_نتائج_الاختبار_البعدي_مع_التفسير_PostTest_Results', headers, rows);
    showToast('تم تصدير وتحميل شيت نتائج الاختبار البعدي بنجاح بصيغة Excel / CSV مع إجابة كل سؤال وتفسيرها');
  };

  // 3. Export Test Visits & Frequency Audit Sheet with Full Academic Interpretation
  const handleExportTestVisitsSheet = () => {
    const allVisits = getAllStudentsTestAccessSummaries(
      selectedVisitTestFilter === 'all' ? undefined : selectedVisitTestFilter
    );
    const filteredVisits = allVisits.filter((item) => {
      if (selectedGroupFilter !== 'all' && item.groupCode !== selectedGroupFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return item.username.toLowerCase().includes(q) || item.fullName.toLowerCase().includes(q);
      }
      return true;
    });

    const headers = [
      'م',
      'اسم المستخدم (اليوزر نيم)',
      'الاسم الأول',
      'اسم الأب',
      'اسم العائلة',
      'الاسم الكامل',
      'المجموعة البحثية',
      'اسم الاختبار المستهدف',
      'عدد مرات التردد (Frequency)',
      'التفسير الأكاديمي والتحليل',
      'حالة الإتمام',
      'تاريخ ووقت أول دخول',
      'تاريخ ووقت آخر دخول',
      'تاريخ ووقت آخر خروج',
      'تفاصيل جلسات التردد (دخول وخروج وتفسير)',
    ];

    const rows = filteredVisits.map((item, idx) => {
      const portalUsersForVisit: any[] = (() => {
        try { return JSON.parse(localStorage.getItem('cp_portal_users_v4') || '[]'); }
        catch { return []; }
      })();
      const allNamesForVisit = getAllTripartiteNames();

      const sessionsText =
        (item.sessions || [])
          .map(
            (sess) =>
              `[تردد ${sess.visitIndex}: دخول ${formatEgyptDateTime(sess.enteredAt)}${
                sess.leftAt ? ' - خروج ' + formatEgyptDateTime(sess.leftAt) : ''
              } (${sess.interpretation})]`
          )
          .join(' | ') || 'لا توجد جلسات تردد مسجلة';
      
      const nameParts = getCompleteStudentName(item.username, portalUsersForVisit, allNamesForVisit);

      return [
        idx + 1,
        item.username,
        nameParts.firstName,
        nameParts.fatherName,
        nameParts.familyName,
        nameParts.fullName,
        item.groupCode,
        item.testName,
        item.totalVisits,
        item.interpretation,
        item.isCompleted
          ? 'مكتمل بنجاح'
          : item.totalVisits > 0
          ? 'غير مكتمل (قيد الحل/خروج)'
          : 'عدم تردد (لم يدخل)',
        item.firstEntry ? formatEgyptDateTime(item.firstEntry) : '-',
        item.lastEntry ? formatEgyptDateTime(item.lastEntry) : '-',
        item.lastExit ? formatEgyptDateTime(item.lastExit) : '-',
        sessionsText,
      ];
    });

    downloadCsvSheet('سجل_تردد_الطلاب_على_الاختبارات_مع_التفسير_Frequency_Audit', headers, rows);
    showToast('تم تصدير شيت تردد الطلاب على الاختبارات مع التفسير والتواريخ بدقة بنجاح');
  };

  // 4. Export Detailed Answers with Explanations for Any Selected Test
  const handleExportDetailedAnswersSheet = () => {
    let questionsList: any[] = [];
    let testLabel = '';
    if (detailedAnswersTest === 'pre') {
      questionsList = getPreTestQuestions();
      testLabel = 'الاختبار القبلي';
    } else if (detailedAnswersTest === 'post') {
      questionsList = getPostTestQuestions();
      testLabel = 'الاختبار البعدي';
    } else {
      const lvlDef =
        GAME_LEVELS_DATA.find((l) => l.levelNumber === detailedAnswersTest) || GAME_LEVELS_DATA[0];
      questionsList = lvlDef.questions;
      testLabel = `تحدي المستوى ${detailedAnswersTest} (${lvlDef.title})`;
    }

    const qHeaders = questionsList.flatMap((q, i) => [
      `س${i + 1} - نص السؤال`,
      `س${i + 1} - إجابة الطالب`,
      `س${i + 1} - الإجابة الصحيحة`,
      `س${i + 1} - النتيجة`,
      `س${i + 1} - التفسير والتغذية الراجعة`,
    ]);

    const headers = [
      'م',
      'اسم المستخدم',
      'الاسم الأول',
      'اسم الأب',
      'اسم العائلة',
      'الاسم الكامل',
      'المجموعة البحثية',
      'اسم الاختبار',
      'إجمالي الدرجة المحرزة',
      'الدرجة العظمى',
      'النسبة المئوية (%)',
      'تاريخ الإتمام',
      ...qHeaders,
    ];

    const rows = filteredStudents.map((s, idx) => {
      let resultData: any = null;
      if (detailedAnswersTest === 'pre') resultData = s.raw.preTestResult;
      else if (detailedAnswersTest === 'post') resultData = s.raw.postTestResult;
      else resultData = s.raw.completedLevels?.[detailedAnswersTest];

      const score = resultData ? resultData.score : 0;
      const maxScore = resultData ? resultData.maxScore : questionsList.length;
      const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const date = resultData ? formatEgyptDateTime(resultData.completedAt) : '-';

      const qCols = questionsList.flatMap((q) => {
        if (!resultData) {
          return [q.question, 'لم يتقدم للاختبار بعد', q.options[q.correctIndex] || '-', '0/1', q.explanation || '-'];
        }

        const chosenIdx = resultData.answers?.[q.id];
        const isRight = chosenIdx === q.correctIndex;
        const chosenText =
          chosenIdx !== undefined && chosenIdx >= 0 && q.options[chosenIdx]
            ? `${['أ', 'ب', 'ج', 'د', 'هـ'][chosenIdx] || chosenIdx + 1}. ${q.options[chosenIdx]}`
            : 'لم تتم الإجابة';
        const correctText = q.options[q.correctIndex]
          ? `${['أ', 'ب', 'ج', 'د', 'هـ'][q.correctIndex] || q.correctIndex + 1}. ${q.options[q.correctIndex]}`
          : '-';

        return [
          q.question,
          chosenText,
          correctText,
          isRight ? '1/1' : '0/1',
          q.explanation || 'لا يوجد تفسير',
        ];
      });

      return [
        idx + 1,
        s.username,
        s.firstName,
        s.fatherName,
        s.familyName,
        s.fullName,
        s.groupCode,
        testLabel,
        score,
        maxScore,
        `${pct}%`,
        date,
        ...qCols,
      ];
    });

    downloadCsvSheet(`شيت_تفصيل_إجابات_${testLabel}_مع_التفسير`, headers, rows);
    showToast(`تم استخراج وتحميل شيت تفصيل إجابات ${testLabel} مع التفسير العلمي لكل سؤال بنجاح`);
  };

  // 3. Export 10 Stages Game Levels Sheet
  const handleExportLevelsSheet = () => {
    const headers = [
      'م',
      'اسم المستخدم (اليوزر نيم)',
      'الاسم الأول',
      'اسم الأب',
      'اسم العائلة',
      'الاسم الكامل',
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
      s.firstName,
      s.fatherName,
      s.familyName,
      s.fullName,
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
      'الاسم الأول',
      'اسم الأب',
      'اسم العائلة',
      'الاسم الكامل',
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
      s.firstName,
      s.fatherName,
      s.familyName,
      s.fullName,
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

  // Export Collaborative Sheet (شيت خاص بالتعاوني - G3 & G4)
  const handleExportCollaborativeSheet = () => {
    const headers = [
      'م', 'اسم المستخدم', 'الاسم الأول', 'اسم الأب', 'اسم العائلة', 'الاسم الكامل', 'المجموعة البحثية', 'نمط التعاوني', 'تاريخ ووقت أول دخول', 'تاريخ ووقت آخر دخول',
      'حالة القبلي', 'درجة القبلي (/53)', 'تاريخ ووقت القبلي الفعلي',
      'المراحل المكتملة', 'نقاط المراحل',
      'حالة البعدي', 'درجة البعدي (/53)', 'تاريخ ووقت البعدي الفعلي',
    ];
    const collabStudents = enrichedStudents.filter((s) => s.learningMode === 'تعاوني');
    const rows = collabStudents.map((s, idx) => [
      idx + 1, s.username, s.firstName, s.fatherName, s.familyName, s.fullName, `${s.groupCode} (${s.groupName})`, s.feedbackMode,
      s.firstLogin, s.lastLogin,
      s.preTestCompleted ? 'مكتمل' : 'غير مكتمل', s.preTestCompleted ? s.preTestScore : '-', s.preTestDate,
      `${s.completedLevelsCount} / 10`, s.totalLevelsScore,
      s.postTestCompleted ? 'مكتمل' : 'غير مكتمل', s.postTestCompleted ? s.postTestScore : '-', s.postTestDate,
    ]);
    downloadCsvSheet('شيت_نتائج_المجموعات_التعاونية_Collaborative_Groups', headers, rows);
    showToast('تم تصدير شيت المجموعات التعاونية بنجاح');
  };

  // Export Individual Group Sheet (شيت لكل مجموعة على حدة: G1, G2, G3, G4 أو مجموعات التعاون الثلاثية G3-A..E و G4-A..E)
  const handleExportGroupSheet = (targetGroupCode: string) => {
    const headers = [
      'م', 'اسم المستخدم', 'الاسم الأول', 'اسم الأب', 'اسم العائلة', 'الاسم الكامل', 'المجموعة', 'نمط التعلم', 'التغذية الراجعة', 'أول دخول', 'آخر دخول',
      'حالة القبلي', 'درجة القبلي', 'تاريخ ووقت القبلي الفعلي', 'المراحل المكتملة', 'نقاط المراحل',
      'حالة البعدي', 'درجة البعدي', 'تاريخ ووقت البعدي الفعلي',
    ];
    const groupStudents = enrichedStudents.filter((s) => {
      const collabGrp = getCollaborativeGroupByUsername(s.username);
      if (collabGrp && (collabGrp === targetGroupCode || collabGrp.endsWith(`-${targetGroupCode}`))) {
        return true;
      }
      return s.groupCode === targetGroupCode;
    });

    const rows = groupStudents.map((s, idx) => [
      idx + 1, s.username, s.firstName, s.fatherName, s.familyName, s.fullName, s.groupName, s.learningMode, s.feedbackMode,
      s.firstLogin, s.lastLogin,
      s.preTestCompleted ? 'مكتمل' : '-', s.preTestCompleted ? s.preTestScore : '-', s.preTestDate,
      `${s.completedLevelsCount}/10`, s.totalLevelsScore,
      s.postTestCompleted ? 'مكتمل' : '-', s.postTestCompleted ? s.postTestScore : '-', s.postTestDate,
    ]);
    downloadCsvSheet(`شيت_مجموعة_${targetGroupCode}_Group_Results`, headers, rows);
    showToast(`تم تصدير شيت مجموعة ${targetGroupCode} بنجاح`);
  };

  // 5. Comprehensive Master Sheet
  const handleExportComprehensiveSheet = () => {
    const headers = [
      'م',
      'اسم المستخدم (اليوزر نيم)',
      'الاسم الأول',
      'اسم الأب',
      'اسم العائلة',
      'الاسم الكامل',
      'المجموعة البحثية',
      'نمط التعلم',
      'نمط التغذية الراجعة',
      'عدد مرات الدخول الفعلي',
      'تاريخ ووقت أول دخول',
      'تاريخ ووقت آخر دخول',
      'جهاز الدخول',
      'حالة الاختبار القبلي',
      'درجة الاختبار القبلي (/53)',
      'نسبة القبلي (%)',
      'اجتياز القبلي',
      'تاريخ القبلي',
      'المراحل المكتملة (من 10)',
      'نقاط المراحل (XP)',
      'حالة الاختبار البعدي',
      'درجة الاختبار البعدي (/53)',
      'نسبة البعدي (%)',
      'اجتياز البعدي',
      'تاريخ البعدي',
    ];

    const rows = enrichedStudents.map((s, idx) => [
      idx + 1,
      s.username,
      s.firstName,
      s.fatherName,
      s.familyName,
      s.fullName,
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

  // Master Reset Handler: clears all test answers, timers, and scores to zero
  const handleMasterResetAllData = () => {
    if (
      window.confirm(
        'تأكيد تصفير كافة الاختبارات والنتائج بالكامل؟\n\nسيتم حذف جميع إجابات الطلاب السابقة، وتصفير الدرجات إلى (0)، وإعادة تعيين التايمر والاختبارات لتبدأ من السؤال الأول والدقيقة 60 للجميع كأنه لم يجاوب أحد.'
      )
    ) {
      resetAllStudentsToRealCleanState();
      setProgressMap(getAllStudentsProgress());
      showToast('تمت إعادة ضبط وتصفير كافة الإجابات والاختبارات والشيتات بنجاح! تبدأ جميع الاختبارات والحسابات من الصفر الآن.');
    }
  };

  // Handler to populate & add student pre-test answers, grades, and timestamps to the sheet
  const handleSeedPreTestAnswers = () => {
    const { seededCount, updatedStudents } = seedPreTestSubmissions(true);
    setProgressMap(getAllStudentsProgress());
    setLoginAuditMap(getStudentLoginsAuditMap());
    setTestAccessMap(getTestAccessAuditMap());
    showToast(`تمت إضافة وتثبيت إجابات ودرجات ومواعيد الاختبار القبلي لـ (${updatedStudents.length}) طالباً بنجاح في شيت الأدمن!`);
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
                  سجل الدخول الفعلي والنتائج • التزامن السحابي المباشر
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

          {/* Quick Master Export & Reset Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => handleManualCloudSync(false)}
              disabled={isSyncingCloud}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 text-white font-black text-xs shadow-lg shadow-cyan-950/60 flex items-center gap-2 cursor-pointer transition transform hover:scale-105 shrink-0 disabled:opacity-50 border border-cyan-400/40"
              title="جلب وسحب كافة نتائج وإجابات الطلاب الذين حلوا الاختبار اليوم من قاعدة البيانات السحابية فوراً"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>{isSyncingCloud ? 'جارِ جلب السحابة...' : '⚡ سحب نتائج الطلاب من السحابة (Firebase)'}</span>
            </button>

            <button
              type="button"
              onClick={handleSeedPreTestAnswers}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-950/50 flex items-center gap-2 cursor-pointer transition transform hover:scale-105 shrink-0"
              title="إضافة وتثبيت إجابات ودرجات ومواعيد الطلاب في الاختبار القبلي للشيت"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>📥 إضافة إجابات ودرجات القبلي للشيت</span>
            </button>

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

            <button
              type="button"
              onClick={handleMasterResetAllData}
              className="px-4 py-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/70 font-black text-xs flex items-center gap-2 cursor-pointer transition shrink-0 shadow-lg shadow-rose-950/50"
              title="إعادة ضبط وتصفير كافة إجابات ودرجات الطلاب والاختبارات والتايمر من البداية"
            >
              <RefreshCw className="w-4 h-4 text-rose-400" />
              <span>تصفير وإعادة ضبط كافة الاختبارات (0) 🔄</span>
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

        {/* Collaborative Sheet & Individual Group Sheets Export Section */}
        <div className="mt-4 p-5 rounded-2xl bg-[#090b17] border border-cyan-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-cyan-300 font-['Cairo'] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>تصدير شيتات المجموعات المنفصلة ومجموعات التعاون الثلاثية (مع الوقت والتاريخ الفعلي):</span>
            </span>
            <button
              type="button"
              onClick={handleExportCollaborativeSheet}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>📁 شيت التعاوني الشامل (G3 + G4)</span>
            </button>
          </div>

          {/* Primary Research Groups G1 - G4 */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 block">المجموعات البحثية الرئيسية الأربعة:</span>
            <div className="flex flex-wrap items-center gap-2">
              {['G1', 'G2', 'G3', 'G4'].map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => handleExportGroupSheet(grp)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-black font-['Cairo'] text-xs border border-slate-300 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title={`تصدير شيت مجموعة ${grp} كاملة (15 طالب)`}
                >
                  <Download className="w-3.5 h-3.5 text-slate-800" />
                  <span>شيت {grp}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5 Triads of G3 (تعاوني فوري) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-cyan-400 block">فرق التعاون الفوري (G3) - 5 مجموعات ثلاثية (3 طلاب لكل فريق):</span>
            <div className="flex flex-wrap items-center gap-2">
              {['G3-A', 'G3-B', 'G3-C', 'G3-D', 'G3-E'].map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => handleExportGroupSheet(grp)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/60 text-cyan-300 font-bold text-xs border border-cyan-500/50 transition cursor-pointer flex items-center gap-1.5"
                  title={`تصدير شيت فريق ${grp} (3 طلاب)`}
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>فريق {grp}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5 Triads of G4 (تعاوني مرجأ) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-purple-400 block">فرق التعاون المرجأ (G4) - 5 مجموعات ثلاثية (3 طلاب لكل فريق):</span>
            <div className="flex flex-wrap items-center gap-2">
              {['G4-A', 'G4-B', 'G4-C', 'G4-D', 'G4-E'].map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => handleExportGroupSheet(grp)}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/60 text-purple-300 font-bold text-xs border border-purple-500/50 transition cursor-pointer flex items-center gap-1.5"
                  title={`تصدير شيت فريق ${grp} (3 طلاب)`}
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>فريق {grp}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#090b17] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold block mb-1">الطلاب المسجلين</span>
            <span className="text-2xl font-black text-white ">{totalCount}</span>
            <span className="text-[11px] text-slate-500 block">4 مجموعات بحثية</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090b17] border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-bold block mb-1">الدخول الفعلي</span>
            <span className="text-2xl font-black text-emerald-400 ">{activeLoginsCount}</span>
            <span className="text-[11px] text-slate-400 block">نسبة {Math.round((activeLoginsCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090b17] border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300 font-bold block mb-1">إنجاز القبلي</span>
            <span className="text-2xl font-black text-amber-400 ">{preTestDoneCount}</span>
            <span className="text-[11px] text-slate-400 block">نسبة {Math.round((preTestDoneCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090b17] border border-purple-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-purple-300 font-bold block mb-1">إنجاز البعدي</span>
            <span className="text-2xl font-black text-purple-400 ">{postTestDoneCount}</span>
            <span className="text-[11px] text-slate-400 block">نسبة {Math.round((postTestDoneCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-Tabs Switcher for Navigation */}
      {/* Sub-Tabs Switcher for Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[#090b17] border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'all'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>📊 الشيت الإحصائي الموحد (النتائج العامة)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pretest_sheet')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'pretest_sheet'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>📋 شيت نتائج الاختبار القبلي الشامل (الدرجات، الإجابات، المواعيد، التفسير)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('test_visits')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'test_visits'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>⏱️ سجل تردد الطلاب على الاختبارات (بالوقت والتفسير)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('detailed_answers')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'detailed_answers'
              ? 'bg-purple-500 text-white font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📝 تفصيل إجابات كل سؤال مع التفسير</span>
        </button>
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
            placeholder="ابحث باليوزر نيم (G1_Cp_01 ...) أو اسم الطالب أو المجموعة..."
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

        {/* Status Selector Filter (for Master View & Pretest Sheet) */}
        {(activeSubTab === 'all' || activeSubTab === 'pretest_sheet') && (
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="all">كافة الطلاب (الجميع)</option>
              <option value="pre_done">الطلاب المنجزون للاختبار القبلي فقط ✓</option>
              <option value="logged_in">سجلوا دخول فعلياً فقط</option>
              <option value="post_done">أتموا الاختبار البعدي</option>
              <option value="levels_done">أتموا كافة المراحل (10/10)</option>
            </select>
          </div>
        )}


        {/* Test Selector for Test Visits Tab */}
        {activeSubTab === 'test_visits' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedVisitTestFilter}
              onChange={(e) => setSelectedVisitTestFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-bold focus:border-amber-500 outline-none cursor-pointer"
            >
              <option value="all">كافة الاختبارات والمستويات</option>
              <option value="pretest">الاختبار القبلي (Pre-Test)</option>
              <option value="posttest">الاختبار البعدي (Post-Test)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                <option key={lvl} value={`level-${lvl}`}>
                  تحدي المستوى {lvl}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ======================= TAB 1: MASTER OVERVIEW TABLE ======================= */}
      {activeSubTab === 'all' && (
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
                  <tr key={s.username} className="hover:bg-slate-900/60 transition-colors">
                    {/* Index */}
                    <td className="p-3.5 text-center text-slate-500 font-bold">{idx + 1}</td>

                    {/* Username & Avatar */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-300 text-xs shrink-0">
                          {s.username.split('_')[0]}
                        </div>
                        <div>
                          <span className="font-black text-white text-xs block">{s.username}</span>
                          <span className="text-[10px] text-slate-400">
                            {s.fullName} • {s.feedbackMode} • {s.learningMode}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Group Code */}
                    <td className="p-3.5 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-black font-['Cairo'] bg-slate-200 border border-slate-300 text-slate-900 shadow-xs">
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
                          <div className="text-[10px] text-slate-400">آخر دخول: {s.lastLogin}</div>
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
                        <span className="text-[11px] text-slate-500 italic">لم يسجل دخول بعد</span>
                      )}
                    </td>

                    {/* Pre-Test Result */}
                    <td className="p-3.5 text-center">
                      {s.preTestCompleted ? (
                        <div className="inline-block p-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center">
                          <div className="font-black text-amber-300 text-xs">
                            {s.preTestScore} / {s.preTestMaxScore} ({s.preTestPercentage}%)
                          </div>
                          <div className="text-[10px] font-bold text-emerald-400">
                            {s.preTestPassed ? '✓ مجتاز' : 'لم يجتز'}
                          </div>
                          <div className="text-[9px] text-slate-400">{s.preTestDate.split(' ')[0]}</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">لم يكتمل</span>
                      )}
                    </td>

                    {/* 10 Stages */}
                    <td className="p-3.5 text-center">
                      <div className="inline-block p-1.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-center">
                        <div className="font-black text-blue-300 text-xs">
                          {s.completedLevelsCount} / 10 مراحل
                        </div>
                        <div className="text-[10px] text-cyan-300 font-bold">{s.totalLevelsScore} XP</div>
                      </div>
                    </td>

                    {/* Post-Test Result */}
                    <td className="p-3.5 text-center">
                      {s.postTestCompleted ? (
                        <div className="inline-block p-1.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-center">
                          <div className="font-black text-purple-300 text-xs">
                            {s.postTestScore} / {s.postTestMaxScore} ({s.postTestPercentage}%)
                          </div>
                          <div className="text-[10px] font-bold text-emerald-400">
                            {s.postTestPassed ? '✓ مجتاز' : 'لم يجتز'}
                          </div>
                          <div className="text-[9px] text-slate-400">{s.postTestDate.split(' ')[0]}</div>
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
      )}

      {/* ======================= TAB: DEDICATED PRE-TEST AUDIT SHEET ======================= */}
      {activeSubTab === 'pretest_sheet' && (
        <div className="space-y-4">
          {/* Action and Info Banner */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#0a0e27] to-yellow-950/30 border-2 border-amber-500/50 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black">
                  شيت كشف نتائج وإجابات ومواعيد الاختبار القبلي (Pre-Test)
                </span>
                <span className="text-xs text-slate-400">
                  • 53 سؤالاً موزعاً على 10 موديولات
                </span>
              </div>
              <h3 className="text-lg font-black text-white font-['Tajawal'] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>سجل درجات الطلاب وإجاباتهم وتوقيتاتهم الفردية والتفسير العلمي</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                عرض الدرجات المحرزة، النسبة المئوية، حالة الاجتياز، وتوقيت الإتمام الدقيق لكل طالب، مع كشف إجابة كل سؤال وتفسيره بضغطة زر.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleManualCloudSync(false)}
                disabled={isSyncingCloud}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 text-white font-black text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-cyan-950/60 disabled:opacity-50 border border-cyan-400/40"
                title="سحب وتحديث كافة نتائج وإجابات الطلاب السحابية من Firebase مباشرة"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                <span>{isSyncingCloud ? 'جارِ الجلب...' : '⚡ سحب نتائج اليوم السحابية (Firebase Sync)'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportPreTestSheet}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-950/60"
                title="تصدير شيت إكسل كامل لنتائج وإجابات الاختبار القبلي لجميع الطلاب مع النطاقات والتفاسير"
              >
                <Download className="w-4 h-4" />
                <span>📥 تصدير شيت القبلي بالكامل (Excel / CSV)</span>
              </button>

              <button
                type="button"
                onClick={handleSeedPreTestAnswers}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition"
                title="إضافة وتثبيت إجابات ودرجات الطلاب الذين أدوا الاختبار القبلي"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تحديث إجابات الطلاب للقبلي 🔄</span>
              </button>
            </div>
          </div>

          {/* Cloud Storage Reassurance Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-cyan-950/40 border border-cyan-500/40 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <span className="font-black text-cyan-300 block text-sm">
                🔒 أمان وحفظ نتائج الاختبار القبلي لجميع الطلاب:
              </span>
              <p className="leading-relaxed">
                جميع الطلاب الذين أدوا الاختبار القبلي اليوم محفوظة نتائجهم بالكامل وبدقة متناهية في <strong className="text-cyan-200">قاعدة بيانات Firebase السحابية الحية</strong> و<strong className="text-cyan-200">الذاكرة المحلية لأجهزتهم</strong>، متضمنةً: الدرجة المحرزة، توقيت وتسجيل الدخول والخروج، زمن الإجابة، وإجابة كل سؤال من الـ 53 سؤالاً مع تصحيحها وتفسيرها.
              </p>
              <p className="text-[11px] text-cyan-400/90 font-medium">
                💡 في حال فتحت لوحة الأدمن من جهاز آخر أو أردت تحديث الشيت بآخر ما سجله الطلاب فوراً، اضغط على زر <strong>(⚡ سحب نتائج اليوم السحابية)</strong> أعلاه وسيتم جلبها وتضمينها فوراً في الجدول وشيت الإكسل.
              </p>
            </div>
          </div>

          {/* Quick Metrics for Pre-Test */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#090b17] border border-amber-500/30">
              <span className="text-[11px] text-amber-300 font-bold block mb-1">الطلاب المنجزون للاختبار</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-400">{preTestDoneCount}</span>
                <span className="text-xs text-slate-400">/ {totalCount} طالب</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                نسبة الإنجاز {Math.round((preTestDoneCount / totalCount) * 100)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090b17] border border-emerald-500/30">
              <span className="text-[11px] text-emerald-300 font-bold block mb-1">متوسط الدرجات المحرزة</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-400">
                  {preTestDoneCount > 0
                    ? (
                        enrichedStudents
                          .filter((s) => s.preTestCompleted)
                          .reduce((acc, s) => acc + s.preTestScore, 0) / preTestDoneCount
                      ).toFixed(1)
                    : '0'}
                </span>
                <span className="text-xs text-slate-400">/ 53 درجة</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 block mt-1">
                متوسط {preTestDoneCount > 0 ? Math.round((enrichedStudents.filter((s) => s.preTestCompleted).reduce((acc, s) => acc + s.preTestPercentage, 0) / preTestDoneCount)) : 0}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090b17] border border-teal-500/30">
              <span className="text-[11px] text-teal-300 font-bold block mb-1">نسبة الاجتياز (مجتاز)</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-teal-400">
                  {preTestDoneCount > 0
                    ? `${Math.round(
                        (enrichedStudents.filter((s) => s.preTestCompleted && s.preTestPassed).length /
                          preTestDoneCount) *
                          100
                      )}%`
                    : '0%'}
                </span>
                <span className="text-xs text-slate-400">من المتقدمين</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                {enrichedStudents.filter((s) => s.preTestCompleted && s.preTestPassed).length} طالب ناجح
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090b17] border border-cyan-500/30">
              <span className="text-[11px] text-cyan-300 font-bold block mb-1">متوسط زمن الإجابة</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-cyan-400">
                  {preTestDoneCount > 0
                    ? formatDuration(
                        Math.round(
                          enrichedStudents
                            .filter((s) => s.preTestCompleted)
                            .reduce((acc, s) => acc + s.preTestTimeSpent, 0) / preTestDoneCount
                        )
                      )
                    : '-'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                من إجمالي زمن العداد (60 دقيقة)
              </span>
            </div>
          </div>

          {/* Interactive Pre-Test Sheet Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#090c1e] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/90 text-slate-300 border-b border-slate-800 font-bold">
                    <th className="p-3.5 text-center w-12">#</th>
                    <th className="p-3.5">اسم المستخدم (اليوزر نيم)</th>
                    <th className="p-3.5 text-center">المجموعة البحثية</th>
                    <th className="p-3.5 text-center">نمط التعلم & التغذية</th>
                    <th className="p-3.5 text-center">حالة الإتمام</th>
                    <th className="p-3.5 text-center">تاريخ ووقت الإتمام الفعلي</th>
                    <th className="p-3.5 text-center">زمن الإجابة المستغرق</th>
                    <th className="p-3.5 text-center">الدرجة المحرزة (/53)</th>
                    <th className="p-3.5 text-center">النسبة المئوية (%)</th>
                    <th className="p-3.5 text-center">حالة الاجتياز</th>
                    <th className="p-3.5 text-center">الإجابات الصحيحة</th>
                    <th className="p-3.5 text-center">كشف إجابات الـ 53 سؤالاً</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredStudents.map((s, idx) => {
                    const hasDone = s.preTestCompleted && s.raw.preTestResult;
                    const correctCount = hasDone ? s.preTestScore : 0;
                    const incorrectCount = hasDone ? Math.max(0, (s.preTestMaxScore || 53) - s.preTestScore) : 0;

                    return (
                      <tr
                        key={`pretest_${s.username}`}
                        className={`transition-colors ${
                          hasDone ? 'hover:bg-amber-950/20 bg-slate-950/40' : 'hover:bg-slate-900/60 opacity-70'
                        }`}
                      >
                        <td className="p-3.5 text-center text-slate-500 font-bold">{idx + 1}</td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-300 text-xs shrink-0">
                              {s.username.split('_')[0]}
                            </div>
                            <div>
                              <span className="font-black text-white text-xs block">{s.username}</span>
                              <span className="text-[10px] text-slate-400">{s.fullName}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-black font-['Cairo'] bg-slate-200 border border-slate-300 text-slate-900 shadow-xs">
                            {s.groupCode}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="text-[11px] font-bold text-slate-300">
                            {s.learningMode} • <span className="text-amber-400">{s.feedbackMode}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{s.groupName}</span>
                        </td>

                        <td className="p-3.5 text-center">
                          {hasDone ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>مكتمل ومسلّم ✓</span>
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 text-[10px] font-medium">
                              لم يبدأ بعد
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {hasDone ? (
                            <div className="space-y-0.5">
                              <span className="font-bold text-amber-300 text-xs block font-mono">
                                {s.preTestDate}
                              </span>
                              <span className="text-[10px] text-slate-400">توقيت فعلي مؤكد</span>
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {hasDone ? (
                            <span className="font-bold text-cyan-300 text-xs bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 inline-block font-mono">
                              ⏱️ {formatDuration(s.preTestTimeSpent)}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {hasDone ? (
                            <span className="font-black text-amber-300 text-sm bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-500/40 inline-block">
                              {s.preTestScore} / {s.preTestMaxScore || 53}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {hasDone ? (
                            <span className="font-black text-white text-xs bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 inline-block">
                              {s.preTestPercentage}%
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {hasDone ? (
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black ${
                                s.preTestPassed
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {s.preTestPassed ? 'مجتاز بنجاح ✓' : 'لم يجتز'}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {hasDone ? (
                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold">
                              <span className="text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded">
                                {correctCount} صح
                              </span>
                              <span className="text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded">
                                {incorrectCount} خطأ
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {hasDone ? (
                            <button
                              type="button"
                              onClick={() => setInspectStudent(s)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-md"
                              title="عرض كشف وتفصيل إجابات الـ 53 سؤالاً بالكامل مع التفسير العلمي"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>فحص الـ 53 سؤالاً 🔍</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">لا توجد إجابات</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-slate-500 text-sm">
                        لم يتم العثور على أي طلاب مطابقين لشروط البحث والتصفية
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ======================= TAB 2: TEST VISITS & FREQUENCY AUDIT ======================= */}
      {activeSubTab === 'test_visits' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <div>
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>سجل تردد الطلاب على الاختبارات والمستويات مع التفسير والتواريخ</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع دقيق لكل محاولة دخول أو خروج للطالب على أي اختبار مع حساب عدد مرات التردد وتفسير الحالة الأكاديمية
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportTestVisitsSheet}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer transition shadow-md shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>تصدير شيت تردد الاختبارات (Excel / CSV)</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#090c1e] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/90 text-slate-300 border-b border-slate-800 font-bold">
                    <th className="p-3 text-center w-10">#</th>
                    <th className="p-3">الطالب</th>
                    <th className="p-3 text-center">المجموعة</th>
                    <th className="p-3">الاختبار المستهدف</th>
                    <th className="p-3 text-center">عدد مرات التردد</th>
                    <th className="p-3">التفسير والتحليل الأكاديمي</th>
                    <th className="p-3 text-center">حالة الإتمام</th>
                    <th className="p-3">مواقيت الدخول والخروج</th>
                    <th className="p-3 text-center">الجلسات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {getAllStudentsTestAccessSummaries(
                    selectedVisitTestFilter === 'all' ? undefined : selectedVisitTestFilter
                  )
                    .filter((item) => {
                      if (selectedGroupFilter !== 'all' && item.groupCode !== selectedGroupFilter) return false;
                      if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase().trim();
                        return item.username.toLowerCase().includes(q) || item.fullName.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((item, idx) => {
                      const visits = item.totalVisits;
                      return (
                        <tr key={`${item.username}_${item.testId}`} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                          <td className="p-3">
                            <span className="font-bold text-white block">{item.username}</span>
                            <span className="text-[10px] text-slate-400">{item.fullName}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-900">
                              {item.groupCode}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-amber-300">{item.testName}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                                visits === 0
                                  ? 'bg-slate-800 text-slate-400'
                                  : visits === 1
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : visits === 2
                                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {visits === 0 ? 'عدم تردد (0)' : `${visits} مرات تردد`}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-[11px] text-slate-200 block">{item.interpretation}</span>
                          </td>
                          <td className="p-3 text-center">
                            {item.isCompleted ? (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                مكتمل بنجاح ✓
                              </span>
                            ) : visits > 0 ? (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                                قيد الإجراء / خروج ⏳
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">لم يبدأ بعد</span>
                            )}
                          </td>
                          <td className="p-3 text-[10px] space-y-0.5">
                            {item.firstEntry ? (
                              <>
                                <div className="text-slate-300">أول دخول: {formatEgyptDateTime(item.firstEntry)}</div>
                                {item.lastExit && <div className="text-slate-400">آخر خروج: {formatEgyptDateTime(item.lastExit)}</div>}
                              </>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {item.sessions && item.sessions.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => setInspectTestAccessSummary(item)}
                                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-[10px] font-bold cursor-pointer"
                              >
                                عرض الجلسات ({item.sessions.length})
                              </button>
                            ) : (
                              <span className="text-slate-600 text-[10px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: DETAILED ANSWERS WITH EXPLANATIONS ======================= */}
      {activeSubTab === 'detailed_answers' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
            <div>
              <h3 className="text-sm font-black text-purple-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>شيت تفصيل إجابة كل سؤال مع التفسير العلمي والتغذية الراجعة</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                عرض إجابة كل طالب لكل سؤال على حدة بجانب الإجابة الصحيحة وحالة الإجابة والشرح والتفسير الكامل
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={detailedAnswersTest}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'pre' || val === 'post') setDetailedAnswersTest(val);
                  else setDetailedAnswersTest(parseInt(val, 10));
                }}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/50 text-purple-200 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="pre">الاختبار القبلي (53 سؤال)</option>
                <option value="post">الاختبار البعدي (53 سؤال)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    تحدي المستوى {lvl}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExportDetailedAnswersSheet}
                className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs flex items-center gap-2 cursor-pointer transition shadow-md shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>تصدير شيت الأسئلة والتفسير (Excel / CSV)</span>
              </button>
            </div>
          </div>

          {/* Students Question Breakdown Cards */}
          <div className="space-y-3">
            {filteredStudents.map((s, idx) => {
              let resultData: any = null;
              let qList: any[] = [];
              if (detailedAnswersTest === 'pre') {
                resultData = s.raw.preTestResult;
                qList = getPreTestQuestions();
              } else if (detailedAnswersTest === 'post') {
                resultData = s.raw.postTestResult;
                qList = getPostTestQuestions();
              } else {
                const lvlDef =
                  GAME_LEVELS_DATA.find((l) => l.levelNumber === detailedAnswersTest) || GAME_LEVELS_DATA[0];
                resultData = s.raw.completedLevels?.[detailedAnswersTest];
                qList = lvlDef.questions;
              }

              const isCompleted = !!resultData;
              const score = resultData ? resultData.score : 0;
              const maxScore = resultData ? resultData.maxScore : qList.length;

              return (
                <div
                  key={s.username}
                  className="p-4 rounded-2xl bg-[#090c1e] border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-black text-white text-sm">{s.username}</span>
                      <span className="text-xs text-slate-400">({s.fullName})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-900">
                        {s.groupCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          isCompleted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? `الدرجة: ${score} / ${maxScore}` : 'لم يتقدم للاختبار بعد'}
                      </span>
                      {resultData?.completedAt && (
                        <span className="text-[10px] text-slate-400">
                          {formatEgyptDateTime(resultData.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Individual Question Answers with Explanations */}
                  {isCompleted ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 max-h-72 overflow-y-auto pr-1">
                      {qList.map((q, qIdx) => {
                        const chosenIdx = resultData.answers?.[q.id];
                        const isRight = chosenIdx === q.correctIndex;
                        const chosenText =
                          chosenIdx !== undefined && chosenIdx >= 0 && q.options[chosenIdx]
                            ? `${['أ', 'ب', 'ج', 'د', 'هـ'][chosenIdx] || chosenIdx + 1}. ${q.options[chosenIdx]}`
                            : 'لم تتم الإجابة';
                        const correctText = q.options[q.correctIndex]
                          ? `${['أ', 'ب', 'ج', 'د', 'هـ'][q.correctIndex] || q.correctIndex + 1}. ${q.options[q.correctIndex]}`
                          : '-';

                        return (
                          <div
                            key={q.id || qIdx}
                            className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                              isRight
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                                سؤال {qIdx + 1}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded font-black ${
                                  isRight ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'
                                }`}
                              >
                                {isRight ? '1/1 ✓' : '0/1 ✗'}
                              </span>
                            </div>
                            <p className="text-white font-bold text-[11px] line-clamp-2">{q.question}</p>
                            <div className="space-y-0.5 text-[10px] pt-1 border-t border-slate-800/80">
                              <div>
                                <span className="text-slate-400">إجابة الطالب: </span>
                                <span className="font-bold">{chosenText}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">الإجابة الصحيحة: </span>
                                <span className="text-emerald-300 font-bold">{correctText}</span>
                              </div>
                            </div>
                            {q.explanation && (
                              <div className="mt-1 p-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60 text-[10px] text-amber-200">
                                <span className="font-black text-amber-400">التفسير: </span>
                                <span>{q.explanation}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 text-center rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                      لا توجد إجابات مسجلة لهذا الطالب على هذا الاختبار حتى الآن
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TEST ACCESS SESSIONS INSPECTION MODAL ======================= */}
      {inspectTestAccessSummary && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectTestAccessSummary(null);
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-[#0f142e] border-2 border-amber-500/80 p-6 shadow-2xl space-y-4 text-right my-auto max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-['Tajawal']">
                    سجل جلسات تردد الطالب: {inspectTestAccessSummary.username}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {inspectTestAccessSummary.testName} • إجمالي {inspectTestAccessSummary.totalVisits} مرات تردد
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectTestAccessSummary(null)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200">
              <span className="font-bold text-amber-400 block mb-0.5">التفسير الأكاديمي والتحليل:</span>
              <p>{inspectTestAccessSummary.interpretation}</p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {inspectTestAccessSummary.sessions && inspectTestAccessSummary.sessions.length > 0 ? (
                inspectTestAccessSummary.sessions.map((sess, idx) => (
                  <div
                    key={sess.id || idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-300">
                        التردد رقم {sess.visitIndex || idx + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sess.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {sess.status === 'completed' ? 'تم الإتمام' : 'خروج / استئناف'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <div>وقت الدخول: <span className="font-bold text-white">{formatEgyptDateTime(sess.enteredAt)}</span></div>
                      {sess.leftAt && <div>وقت الخروج: <span className="font-bold text-slate-400">{sess.leftAt ? formatEgyptDateTime(sess.leftAt) : '-'}</span></div>}
                    </div>
                    <div className="text-[10px] text-slate-400">{sess.interpretation}</div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                  لا توجد جلسات تردد مسجلة
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectTestAccessSummary(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span className="text-xs font-black text-white  block mt-0.5">
                  {inspectStudent.preTestCompleted ? `${inspectStudent.preTestScore}/${inspectStudent.preTestMaxScore || 53}` : 'لم يتم'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-blue-300 font-bold block">المراحل</span>
                <span className="text-xs font-black text-white  block mt-0.5">
                  {inspectStudent.completedLevelsCount} / 10
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-purple-300 font-bold block">البعدي</span>
                <span className="text-xs font-black text-white  block mt-0.5">
                  {inspectStudent.postTestCompleted ? `${inspectStudent.postTestScore}/${inspectStudent.postTestMaxScore || 53}` : 'لم يتم'}
                </span>
              </div>
            </div>

            {/* Test Entry & Frequency Breakdown with Interpretation (سجل تردد الطالب على الاختبارات) */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <h4 className="text-xs font-black text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>سجل تردد الطالب على الاختبارات مع التفسير والتواريخ:</span>
                </span>
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {['pretest', 'posttest', 'level-1', 'level-2', 'level-3', 'level-4', 'level-5', 'level-6', 'level-7', 'level-8', 'level-9'].map((tId) => {
                  const summary = testAccessMap[inspectStudent.username]?.[tId];
                  const tName =
                    tId === 'pretest'
                      ? 'الاختبار القبلي'
                      : tId === 'posttest'
                      ? 'الاختبار البعدي'
                      : `المستوى ${tId.replace('level-', '')}`;
                  const visits = summary ? summary.totalVisits : 0;
                  const interp = summary ? summary.interpretation : 'عدم تردد - لم يدخل الاختبار مطلقاً';
                  return (
                    <div
                      key={tId}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{tName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              visits > 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {visits > 0 ? `${visits} مرات تردد` : 'عدم تردد'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-300 block mt-0.5">{interp}</span>
                      </div>
                      {summary?.lastEntry && (
                        <div className="text-left text-[9px] text-slate-400">
                          <div>دخول: {formatEgyptDateTime(summary.lastEntry).split(',')[1] || formatEgyptDateTime(summary.lastEntry)}</div>
                          {summary.lastExit && <div>خروج: {formatEgyptDateTime(summary.lastExit).split(',')[1] || formatEgyptDateTime(summary.lastExit)}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pre-Test Question Breakdown */}
            {inspectStudent.preTestCompleted && inspectStudent.raw.preTestResult && (
              <div className="space-y-3 p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-sky-400" />
                    <span>نتائج وتفاصيل إجابات الاختبار القبلي بالكامل:</span>
                  </h4>
                  <span className="text-[11px] font-black text-sky-300 bg-sky-950/80 px-2.5 py-0.5 rounded-lg border border-sky-500/40">
                    {inspectStudent.preTestScore} / {inspectStudent.preTestMaxScore || 53} ({inspectStudent.preTestPercentage}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  تاريخ وتوقيت الإتمام الفعلي: <span className="text-sky-300 font-bold">{inspectStudent.preTestDate}</span>
                </p>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {getPreTestQuestions().map((q, qIdx) => {
                    const detail = inspectStudent.raw.preTestResult?.questionDetails?.[q.id];
                    const chosenIdx = inspectStudent.raw.preTestResult?.answers?.[q.id];
                    const isRight = detail ? detail.isCorrect : (chosenIdx === q.correctIndex);
                    const domain = (q as any).module || (q as any).domain || (() => {
                      if (qIdx < 6) return 'الموديول 1: التثبيت والوسائط';
                      if (qIdx < 11) return 'الموديول 2: الواجهة والخصائص';
                      if (qIdx < 16) return 'الموديول 3: أنماط المشروعات';
                      if (qIdx < 21) return 'الموديول 4: الأشكال والشرائح';
                      if (qIdx < 26) return 'الموديول 5: المحاذاة والتحريك';
                      if (qIdx < 31) return 'الموديول 6: بنوك الأسئلة';
                      if (qIdx < 37) return 'الموديول 7: الخط الزمني والتغذية';
                      if (qIdx < 42) return 'الموديول 8: استيراد PowerPoint';
                      if (qIdx < 48) return 'الموديول 9: الأزرار والمحاكاة';
                      return 'الموديول 10: SCORM و HTML5';
                    })();

                    const chosenText = chosenIdx !== undefined && chosenIdx >= 0 && q.options[chosenIdx]
                      ? `${['أ', 'ب', 'ج', 'د', 'هـ'][chosenIdx] || chosenIdx + 1}. ${q.options[chosenIdx]}`
                      : 'لم تتم الإجابة';
                    const correctText = q.options[q.correctIndex]
                      ? `${['أ', 'ب', 'ج', 'د', 'هـ'][q.correctIndex] || (q.correctIndex + 1)}. ${q.options[q.correctIndex]}`
                      : '-';

                    return (
                      <div
                        key={q.id || qIdx}
                        className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 ${
                          isRight
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                              س{qIdx + 1}
                            </span>
                            <span className="text-amber-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {domain}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-black ${isRight ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'}`}>
                            {isRight ? '1/1 ✓' : '0/1 ✗'}
                          </span>
                        </div>
                        <p className="text-white font-bold text-[11px]">{q.question}</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-800/60">
                          <div><span className="text-slate-400">إجابة الطالب: </span><span className="font-bold">{chosenText}</span></div>
                          <div><span className="text-slate-400">الإجابة الصحيحة: </span><span className="text-emerald-300 font-bold">{correctText}</span></div>
                        </div>
                        {q.explanation && (
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-[10px] text-amber-200">
                            <span className="font-bold text-amber-400">💡 التفسير والشرح الأكاديمي: </span>
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Post-Test Question Breakdown (0/1 or 1/1) */}
            {inspectStudent.postTestCompleted && inspectStudent.raw.postTestResult && (
              <div className="space-y-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>نتائج وتفاصيل إجابات الاختبار البعدي بالكامل:</span>
                  </h4>
                  <span className="text-[11px] font-black text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-lg border border-purple-500/40">
                    {inspectStudent.postTestScore} / {inspectStudent.postTestMaxScore || 53} ({inspectStudent.postTestPercentage}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  تاريخ وتوقيت الإتمام الفعلي: <span className="text-purple-300 font-bold">{inspectStudent.postTestDate}</span>
                </p>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {getPostTestQuestions().map((q, qIdx) => {
                    const detail = inspectStudent.raw.postTestResult?.questionDetails?.[q.id];
                    const chosenIdx = inspectStudent.raw.postTestResult?.answers?.[q.id];
                    const isRight = detail ? detail.isCorrect : (chosenIdx === q.correctIndex);
                    const domain = (q as any).module || (q as any).domain || (() => {
                      if (qIdx < 6) return 'الموديول 1: التثبيت والوسائط';
                      if (qIdx < 11) return 'الموديول 2: الواجهة والخصائص';
                      if (qIdx < 16) return 'الموديول 3: أنماط المشروعات';
                      if (qIdx < 21) return 'الموديول 4: الأشكال والشرائح';
                      if (qIdx < 26) return 'الموديول 5: المحاذاة والتحريك';
                      if (qIdx < 31) return 'الموديول 6: بنوك الأسئلة';
                      if (qIdx < 37) return 'الموديول 7: الخط الزمني والتغذية';
                      if (qIdx < 42) return 'الموديول 8: استيراد PowerPoint';
                      if (qIdx < 48) return 'الموديول 9: الأزرار والمحاكاة';
                      return 'الموديول 10: SCORM و HTML5';
                    })();

                    const chosenText = chosenIdx !== undefined && chosenIdx >= 0 && q.options[chosenIdx]
                      ? `${['أ', 'ب', 'ج', 'د', 'هـ'][chosenIdx] || chosenIdx + 1}. ${q.options[chosenIdx]}`
                      : 'لم تتم الإجابة';
                    const correctText = q.options[q.correctIndex]
                      ? `${['أ', 'ب', 'ج', 'د', 'هـ'][q.correctIndex] || (q.correctIndex + 1)}. ${q.options[q.correctIndex]}`
                      : '-';

                    return (
                      <div
                        key={q.id || qIdx}
                        className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 ${
                          isRight
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                              س{qIdx + 1}
                            </span>
                            <span className="text-amber-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {domain}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-black ${isRight ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'}`}>
                            {isRight ? '1/1 ✓' : '0/1 ✗'}
                          </span>
                        </div>
                        <p className="text-white font-bold text-[11px]">{q.question}</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-800/60">
                          <div><span className="text-slate-400">إجابة الطالب: </span><span className="font-bold">{chosenText}</span></div>
                          <div><span className="text-slate-400">الإجابة الصحيحة: </span><span className="text-emerald-300 font-bold">{correctText}</span></div>
                        </div>
                        {q.explanation && (
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-[10px] text-amber-200">
                            <span className="font-bold text-amber-400">💡 التفسير والشرح الأكاديمي: </span>
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 10 Educational Game Levels Detailed Breakdown */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/30">
              <h4 className="text-xs font-black text-blue-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-blue-400" />
                  <span>نتائج وتقدم المراحل التعليمية العشر (1-10):</span>
                </span>
                <span className="text-[11px] text-cyan-300 font-bold">
                  {inspectStudent.completedLevelsCount} / 10 مراحل مكتملة ({inspectStudent.totalLevelsScore} XP)
                </span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvlNum) => {
                  const lvlDetail = inspectStudent.levelsDetails[lvlNum];
                  const isDone = !!lvlDetail;

                  return (
                    <div
                      key={lvlNum}
                      className={`p-2 rounded-xl border text-center text-xs space-y-0.5 ${
                        isDone
                          ? 'bg-blue-950/80 border-blue-500/60 text-blue-200'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="block font-black text-white text-[11px]">المستوى {lvlNum}</span>
                      {isDone ? (
                        <>
                          <span className="block font-bold text-emerald-300 text-[11px]">
                            {lvlDetail.score} / {lvlDetail.maxScore || 100} XP
                          </span>
                          <span className="block text-[9px] text-slate-400 opacity-80">
                            {lvlDetail.completedAt ? lvlDetail.completedAt.split(' ')[0] : 'مكتمل'}
                          </span>
                        </>
                      ) : (
                        <span className="block text-[10px] text-slate-500">غير مكتمل</span>
                      )}
                    </div>
                  );
                })}
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
                        <span className="w-6 h-6 rounded-lg bg-emerald-950/80 text-emerald-300  font-bold flex items-center justify-center text-[10px] border border-emerald-500/30">
                          {sIdx + 1}
                        </span>
                        <div>
                          <span className=" text-white font-bold block text-xs">
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
