import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderCheck,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  Search,
  Filter,
  FileText,
  Video,
  Image as ImageIcon,
  Edit3,
  Award,
  AlertCircle,
  X,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Layers,
} from 'lucide-react';
import {
  StudentActivitySubmission,
  LevelActivityConfig,
} from '../types';
import {
  getLevelActivityConfigs,
  updateLevelActivityConfig,
  saveAllLevelActivityConfigs,
  getAllActivitySubmissions,
  gradeStudentActivity,
  deleteStudentActivity,
  subscribeToStudentActivities,
  subscribeToLevelActivityConfigs,
} from '../utils/studentActivityStorage';
import { getStudentByUsername, getGroupByUsername } from '../data/studentAccounts';

export const AdminStudentActivitiesManager: React.FC = () => {
  // 1. Submissions state & live subscription
  const [submissions, setSubmissions] = useState<StudentActivitySubmission[]>(() =>
    getAllActivitySubmissions()
  );
  const [configs, setConfigs] = useState<Record<number, LevelActivityConfig>>(() =>
    getLevelActivityConfigs()
  );

  // Filters
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Level for Editing Level Activities Titles Section
  const [editingConfigLevel, setEditingConfigLevel] = useState<number>(1);
  const [configTitleDraft, setConfigTitleDraft] = useState<string>('');
  const [configInstructionsDraft, setConfigInstructionsDraft] = useState<string>('');
  const [configMaxPointsDraft, setConfigMaxPointsDraft] = useState<number>(50);

  // Grading form state per submission: { [submissionId]: { grade: number; feedback: string; isSaving?: boolean } }
  const [gradingDrafts, setGradingDrafts] = useState<
    Record<string, { grade: number | ''; feedback: string; isSaving?: boolean; message?: string }>
  >({});

  // Preview Modal
  const [previewSubmission, setPreviewSubmission] = useState<StudentActivitySubmission | null>(null);

  // Success Toast for editing config
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync draft inputs whenever editingConfigLevel or configs change
  useEffect(() => {
    const cur = configs[editingConfigLevel];
    if (cur) {
      setConfigTitleDraft(cur.activityTitle || `نشاط المستوى ${editingConfigLevel}`);
      setConfigInstructionsDraft(cur.instructions || '');
      setConfigMaxPointsDraft(cur.maxPoints || 50);
    }
  }, [editingConfigLevel, configs]);

  // Subscribe to live submissions and configs
  useEffect(() => {
    const unsubSubmissions = subscribeToStudentActivities((updated) => {
      setSubmissions(updated);
    });
    const unsubConfigs = subscribeToLevelActivityConfigs((updated) => {
      setConfigs(updated);
    });
    return () => {
      unsubSubmissions();
      unsubConfigs();
    };
  }, []);

  // Save Config for the selected level
  const handleSaveLevelConfig = () => {
    if (!configTitleDraft.trim()) {
      alert('يرجى كتابة عنوان النشاط المطلوب');
      return;
    }

    const updated = updateLevelActivityConfig(editingConfigLevel, {
      activityTitle: configTitleDraft.trim(),
      instructions: configInstructionsDraft.trim(),
      maxPoints: Number(configMaxPointsDraft) || 50,
    });
    setConfigs(updated);
    showToast(`تم حفظ وتعميم اسم وتعليمات نشاط المستوى ${editingConfigLevel} بنجاح! ⭐`);
  };

  // Filtered submissions list
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Level filter
      if (selectedLevelFilter !== 'all' && sub.levelNumber !== selectedLevelFilter) {
        return false;
      }
      // Group filter
      if (selectedGroupFilter !== 'all') {
        const student = sub.studentUsername ? getStudentByUsername(sub.studentUsername) : null;
        const studentGroup = sub.groupCode || student?.groupCode;
        if (studentGroup !== selectedGroupFilter) {
          return false;
        }
      }
      // Status filter
      if (selectedStatusFilter !== 'all') {
        const isGraded = sub.status === 'graded' || (sub.grade !== null && sub.grade !== undefined);
        if (selectedStatusFilter === 'graded' && !isGraded) return false;
        if (selectedStatusFilter === 'pending' && isGraded) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const user = (sub.studentUsername || '').toLowerCase();
        const name = (sub.studentFullName || '').toLowerCase();
        const file = (sub.fileName || '').toLowerCase();
        const title = (sub.activityTitle || '').toLowerCase();
        if (!user.includes(q) && !name.includes(q) && !file.includes(q) && !title.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [submissions, selectedLevelFilter, selectedGroupFilter, selectedStatusFilter, searchQuery]);

  // Counters
  const totalCount = submissions.length;
  const pendingCount = submissions.filter(
    (s) => s.status !== 'graded' && (s.grade === null || s.grade === undefined)
  ).length;
  const gradedCount = totalCount - pendingCount;

  // Handle Submit Grade for a specific submission
  const handleGradeSubmit = async (sub: StudentActivitySubmission) => {
    if (!sub.id) return;
    const draft = gradingDrafts[sub.id];
    const gradeNum = draft?.grade !== undefined && draft?.grade !== '' ? Number(draft.grade) : sub.grade ?? 0;
    const feedbackText = draft?.feedback !== undefined ? draft.feedback : sub.feedback || '';

    const maxPts = sub.maxPoints || 50;
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > maxPts) {
      alert(`يرجى إدخال درجة صالحة بين 0 و ${maxPts}`);
      return;
    }

    setGradingDrafts((prev) => ({
      ...prev,
      [sub.id!]: { ...prev[sub.id!], isSaving: true },
    }));

    try {
      await gradeStudentActivity(sub.id, gradeNum, feedbackText, 'admin');
      setGradingDrafts((prev) => ({
        ...prev,
        [sub.id!]: {
          grade: gradeNum,
          feedback: feedbackText,
          isSaving: false,
          message: 'تم رصد الدرجة بنجاح! ⭐',
        },
      }));
      setTimeout(() => {
        setGradingDrafts((prev) => {
          const next = { ...prev };
          if (next[sub.id!]) {
            delete next[sub.id!].message;
          }
          return next;
        });
      }, 3500);
    } catch (err: any) {
      alert(`حدث خطأ أثناء رصد الدرجة: ${err?.message || 'خطأ غير معروف'}`);
      setGradingDrafts((prev) => ({
        ...prev,
        [sub.id!]: { ...prev[sub.id!], isSaving: false },
      }));
    }
  };

  // Handle Delete Submission
  const handleDelete = async (sub: StudentActivitySubmission) => {
    if (!sub.id) return;
    if (confirm(`هل أنت متأكد من حذف نشاط الطالب ${sub.studentUsername} للمستوى ${sub.levelNumber}؟`)) {
      await deleteStudentActivity(sub.id);
      showToast('تم حذف النشاط بنجاح');
    }
  };

  return (
    <div className="space-y-8 font-['Cairo',_sans-serif] text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Page Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d122b] to-slate-900 border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <FolderCheck className="w-4 h-4 text-amber-400" />
              <span>إدارة الأنشطة العملية والتقييم المركزي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Tajawal'] tracking-tight">
              نشاط الطلاب (Student Activities)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              استعراض وتنزيل ملفات الأنشطة التي قام الطلاب برفعها في المستويات التعليمية الـ 9، ورصد درجاتها مباشرة لتضاف فورياً لسجلات الطلاب، مع إمكانية تعديل مسميات ومطاليب الأنشطة.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 block font-bold">إجمالي المرفوعات</span>
              <span className="text-xl font-black text-white font-['Outfit']">{totalCount}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-center">
              <span className="text-[11px] text-amber-300 block font-bold">بانتظار التقييم</span>
              <span className="text-xl font-black text-amber-400 font-['Outfit']">{pendingCount}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center">
              <span className="text-[11px] text-emerald-300 block font-bold">تم رصد درجاتها</span>
              <span className="text-xl font-black text-emerald-400 font-['Outfit']">{gradedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SECTION EXPLICITLY TITLED: تعديل اسم نشاط المستويات */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-[#0d1024] border-2 border-[#ffd700]/70 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-xl shrink-0">
              ✏️
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 text-[10px] font-black">
                التحكم في عنوان ومتطلبات الأنشطة
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] tracking-tight">
                تعديل اسم نشاط المستويات
              </h3>
            </div>
          </div>
          <span className="text-xs text-amber-300 font-bold">
            التعديل هنا يُحدث الاسم والتعليمات المطلوب تنفيذها أمام الطالب فورياً ⚡
          </span>
        </div>

        {/* Level Selector Pills 1 to 9 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">
            اختر المستوى لتعديل عنوان ومطلوب نشاطه:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvlNum) => {
              const isSelected = editingConfigLevel === lvlNum;
              const cfg = configs[lvlNum];
              return (
                <button
                  key={lvlNum}
                  type="button"
                  onClick={() => setEditingConfigLevel(lvlNum)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-[#ffd700] text-slate-950 font-black border-amber-300 shadow-[0_0_15px_rgba(255,215,0,0.35)] scale-105'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black font-['Outfit']">المستوى {lvlNum}</div>
                  <div className="text-[10px] truncate opacity-90 mt-0.5 font-['Cairo']">
                    {cfg?.activityTitle ? cfg.activityTitle.replace(`نشاط المستوى ${lvlNum}:`, '').trim() : `L${lvlNum}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level Config Edit Form */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 font-['Cairo']">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>بيانات نشاط المستوى {editingConfigLevel} الحالي:</span>
            </span>
            <span className="text-[11px] text-slate-400">
              يظهر هذا العنوان في شاشة المستوى وبطاقة رفع الملف
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Title Input */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                اسم / عنوان النشاط المطلوب للمستوى {editingConfigLevel}:
              </label>
              <input
                type="text"
                value={configTitleDraft}
                onChange={(e) => setConfigTitleDraft(e.target.value)}
                placeholder={`مثال: نشاط المستوى ${editingConfigLevel}: تثبيت البرنامج وضبط اللغة`}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:border-amber-400 outline-none font-bold"
              />
            </div>

            {/* Max Points Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                الدرجة القصوى للنشاط (XP):
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={configMaxPointsDraft}
                onChange={(e) => setConfigMaxPointsDraft(Number(e.target.value) || 50)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:border-amber-400 outline-none font-black font-['Outfit'] text-center"
              />
            </div>
          </div>

          {/* Instructions Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 block">
              نص تعليمات ومطلوب النشاط من الطالب:
            </label>
            <textarea
              rows={3}
              value={configInstructionsDraft}
              onChange={(e) => setConfigInstructionsDraft(e.target.value)}
              placeholder="اكتب التوجيهات والخطوات الدقيقة المطلوب من الطالب تنفيذها قبل رفع الملف..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:border-amber-400 outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveLevelConfig}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>حفظ وتعميم اسم نشاط المستوى {editingConfigLevel} ⭐</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: قائمة أنشطة الطلاب المرفوعة والتحميل والتقييم */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg sm:text-xl font-black text-white font-['Tajawal']">
              ملفات أنشطة الطلاب المرفوعة ({filteredSubmissions.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-['Cairo']">
            يمكنك تحميل الملف بالضغط على زر "تحميل الملف" ورصد الدرجة تحته مباشرة
          </span>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو اليوزر أو اسم الملف..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 shrink-0 font-bold">المستوى:</label>
            <select
              value={selectedLevelFilter}
              onChange={(e) =>
                setSelectedLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400 font-bold cursor-pointer"
            >
              <option value="all">جميع المستويات (1-9)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                <option key={lvl} value={lvl}>
                  المستوى {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 shrink-0 font-bold">المجموعة:</label>
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400 font-bold cursor-pointer"
            >
              <option value="all">جميع المجموعات (G1 - G4)</option>
              <option value="G1">G1 - فردي فوري</option>
              <option value="G2">G2 - فردي مرجأ</option>
              <option value="G3">G3 - تعاوني فوري</option>
              <option value="G4">G4 - تعاوني مرجأ</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 shrink-0 font-bold">الحالة:</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400 font-bold cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">⏳ بانتظار التقييم ورصد الدرجة</option>
              <option value="graded">⭐ تم رصد الدرجة</option>
            </select>
          </div>
        </div>

        {/* Submissions Cards / Table */}
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 text-slate-500 flex items-center justify-center mx-auto text-3xl">
              📂
            </div>
            <h4 className="text-base font-black text-white font-['Tajawal']">
              لا توجد أنشطة مرفوعة تطابق معايير البحث الحالية
            </h4>
            <p className="text-xs text-slate-400 font-['Cairo']">
              عندما يقوم أي طالب برفع نشاطه الخاص في أي مستوى، سيظهر هنا فورياً لتنزيل الملف ورصد الدرجة.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredSubmissions.map((sub) => {
              const student = sub.studentUsername ? getStudentByUsername(sub.studentUsername) : null;
              const groupMeta = sub.studentUsername ? getGroupByUsername(sub.studentUsername) : null;
              const subId = sub.id || `sub_${sub.studentUsername}_lvl${sub.levelNumber}`;
              const isGraded = sub.status === 'graded' || (sub.grade !== null && sub.grade !== undefined);
              const draft = gradingDrafts[subId] || {
                grade: sub.grade !== null && sub.grade !== undefined ? sub.grade : '',
                feedback: sub.feedback || '',
              };
              const maxPts = sub.maxPoints || 50;

              return (
                <div
                  key={subId}
                  className={`p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-xl space-y-4 ${
                    isGraded
                      ? 'bg-[#0a121d] border-emerald-500/50 hover:border-emerald-400'
                      : 'bg-[#120f1e] border-amber-500/60 hover:border-[#ffd700]'
                  }`}
                >
                  {/* Card Header: Student & Level Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-md">
                        {sub.fileType === 'video' ? '🎬' : sub.fileType === 'pdf' ? '📄' : '🖼️'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-white font-['Tajawal']">
                            {student?.fullName || sub.studentFullName || sub.studentUsername}
                          </span>
                          <span className="text-xs  text-slate-400">
                            (@{sub.studentUsername})
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-950 border border-blue-500 text-blue-300 text-[10px] font-bold">
                            {sub.groupCode || groupMeta?.code || 'G1'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-bold text-amber-300">
                            المستوى {sub.levelNumber}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-xs">{sub.activityTitle || `نشاط المستوى ${sub.levelNumber}`}</span>
                          <span>•</span>
                          <span className=" text-[11px]">
                            {new Date(sub.uploadedAt).toLocaleString('ar-EG')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isGraded ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>تم رصد الدرجة: {sub.grade} من {maxPts} ⭐</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-400 text-amber-300 text-xs font-black flex items-center gap-1.5 animate-pulse shadow-sm">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>بانتظار التقييم ورصد الدرجة ⏳</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* File Information & Action Buttons */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300">اسم الملف المرفوع:</span>
                        <span className="text-xs  font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                          {sub.fileName}
                        </span>
                        {sub.fileSize && (
                          <span className="text-[11px] text-slate-400 ">
                            ({(sub.fileSize / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 text-[10px] font-bold uppercase ">
                          {sub.fileType}
                        </span>
                      </div>
                      {sub.notes && (
                        <p className="text-xs text-slate-400">
                          ملاحظة الطالب: <span className="text-slate-200">{sub.notes}</span>
                        </p>
                      )}
                    </div>

                    {/* Download & Preview Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {/* Direct Browser Download Button */}
                      <a
                        href={sub.fileUrl}
                        download={sub.fileName}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span>تحميل الملف</span>
                      </a>

                      {/* In-Browser Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewSubmission(sub)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                        <span>معاينة</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(sub)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 transition cursor-pointer"
                        title="حذف النشاط"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* GRADING FORM DIRECTLY UNDER THE ACTIVITY */}
                  {/* ========================================================================= */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#070b1a] via-[#090e24] to-[#070b1a] border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-[#ffd700] flex items-center gap-1.5 font-['Cairo']">
                        <Award className="w-4 h-4 text-[#ffd700]" />
                        <span>تقييم المشرف ورصد الدرجة (تُضاف الدرجة فورياً لرصيد الطالب عند الحفظ):</span>
                      </span>
                      {sub.gradedAt && (
                        <span className="text-[10px] text-slate-400 ">
                          آخر رصد: {new Date(sub.gradedAt).toLocaleString('ar-EG')}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                      {/* Grade Input */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-bold block">
                          الدرجة المستحقة (من {maxPts}):
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={maxPts}
                            value={draft.grade}
                            onChange={(e) => {
                              const val = e.target.value === '' ? '' : Number(e.target.value);
                              setGradingDrafts((prev) => ({
                                ...prev,
                                [subId]: { ...prev[subId], grade: val },
                              }));
                            }}
                            placeholder={`0 - ${maxPts}`}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/60 text-white font-black font-['Outfit'] text-base outline-none focus:border-amber-300 text-center"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-300 font-bold font-['Outfit']">
                            / {maxPts}
                          </span>
                        </div>
                      </div>

                      {/* Feedback Notes */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs text-slate-300 font-bold block">
                          ملاحظات وتغذية راجعة للطالب (تظهر له داخل المستوى):
                        </label>
                        <input
                          type="text"
                          value={draft.feedback}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGradingDrafts((prev) => ({
                              ...prev,
                              [subId]: { ...prev[subId], feedback: val },
                            }));
                          }}
                          placeholder="مثال: أحسنت، تطبيق متقن ومتوافق مع معايير المشروع..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none focus:border-amber-300"
                        />
                      </div>

                      {/* Action Button: رصد واعتماد الدرجة للطالب */}
                      <div className="pt-5 sm:pt-4">
                        <button
                          type="button"
                          disabled={draft.isSaving}
                          onClick={() => handleGradeSubmit(sub)}
                          className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
                        >
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          <span>
                            {draft.isSaving
                              ? 'جارٍ الرصد...'
                              : isGraded
                              ? 'تعديل وحفظ الدرجة ⭐'
                              : 'رصد واعتماد الدرجة للطالب ⭐'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Temporary success message for this card */}
                    {draft.message && (
                      <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs font-bold text-center">
                        {draft.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* IN-BROWSER PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0e1e] border-2 border-cyan-500/60 rounded-3xl p-6 max-w-3xl w-full text-right shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 text-xs font-bold">
                  معاينة ملف نشاط المستوى {previewSubmission.levelNumber}
                </span>
                <span className="text-xs text-white font-bold ">
                  {previewSubmission.fileName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSubmission(null)}
                className="text-slate-400 hover:text-white text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black p-2 flex items-center justify-center min-h-[300px]">
              {previewSubmission.fileType === 'video' ? (
                <video
                  controls
                  autoPlay
                  src={previewSubmission.fileUrl}
                  className="max-h-[60vh] w-auto max-w-full rounded-xl"
                />
              ) : previewSubmission.fileType === 'image' ? (
                <img
                  src={previewSubmission.fileUrl}
                  alt={previewSubmission.fileName}
                  className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-300 flex items-center justify-center mx-auto text-3xl font-bold">
                    PDF
                  </div>
                  <h4 className="text-sm font-bold text-white ">
                    {previewSubmission.fileName}
                  </h4>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <a
                      href={previewSubmission.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>فتح في نافذة جديدة</span>
                    </a>
                    <a
                      href={previewSubmission.fileUrl}
                      download={previewSubmission.fileName}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل المستند</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>الطالب: {previewSubmission.studentUsername}</span>
              <a
                href={previewSubmission.fileUrl}
                download={previewSubmission.fileName}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الملف إلى جهازك</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
