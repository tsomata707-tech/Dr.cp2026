import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Save, User, FileSpreadsheet, Sparkles, RefreshCw } from 'lucide-react';
import { PortalUser } from '../types';
import { getPortalUsers, addActivityLog } from '../utils/adminStorage';
import { getStudentProgress, saveSingleStudentProgress, calculateStudentTotalScore } from '../utils/gameStorage';
import { syncStudentProgressToFirestore } from '../utils/realtimeService';

export const AdminStudentGradesManager: React.FC = () => {
  const [users, setUsers] = useState<PortalUser[]>(() => getPortalUsers().filter(u => u.role !== 'supervisor'));
  const [selectedUsername, setSelectedUsername] = useState<string>(users[0]?.username || '');
  const [selectedTestOrLevel, setSelectedTestOrLevel] = useState<string>('level-1');
  const [gradeInput, setGradeInput] = useState<number>(25);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const studentProg = getStudentProgress(selectedUsername);

  // Update grade input default when selection changes
  useEffect(() => {
    if (!selectedUsername) return;
    const prog = getStudentProgress(selectedUsername);
    if (selectedTestOrLevel === 'pre-test') {
      setGradeInput(prog.preTestResult?.score ?? 48);
    } else if (selectedTestOrLevel === 'post-test') {
      setGradeInput(prog.postTestResult?.score ?? 45);
    } else if (selectedTestOrLevel.startsWith('level-')) {
      const lvlNum = parseInt(selectedTestOrLevel.replace('level-', ''), 10);
      const lvlRes = prog.completedLevels?.[lvlNum];
      setGradeInput(lvlRes?.score ?? 75);
    }
  }, [selectedUsername, selectedTestOrLevel]);

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsername) return;

    const prog = getStudentProgress(selectedUsername);
    const scoreVal = Math.max(0, Number(gradeInput) || 0);

    if (selectedTestOrLevel === 'pre-test') {
      if (!prog.preTestResult) {
        prog.preTestResult = {
          completed: true,
          passed: true,
          score: scoreVal,
          maxScore: 53,
          answers: {},
          questionScores: {},
          completedAt: new Date().toISOString(),
          timeSpentSeconds: 300,
        };
      } else {
        prog.preTestResult.score = scoreVal;
        prog.preTestResult.completed = true;
        prog.preTestResult.passed = true;
      }
    } else if (selectedTestOrLevel === 'post-test') {
      if (!prog.postTestResult) {
        prog.postTestResult = {
          completed: true,
          passed: true,
          score: scoreVal,
          maxScore: 53,
          answers: {},
          questionScores: {},
          completedAt: new Date().toISOString(),
          timeSpentSeconds: 300,
        };
      } else {
        prog.postTestResult.score = scoreVal;
        prog.postTestResult.completed = true;
        prog.postTestResult.passed = true;
      }
    } else if (selectedTestOrLevel.startsWith('level-')) {
      const lvlNum = parseInt(selectedTestOrLevel.replace('level-', ''), 10);
      if (!prog.completedLevels) {
        prog.completedLevels = {};
      }
      prog.completedLevels[lvlNum] = {
        levelNumber: lvlNum,
        score: scoreVal,
        maxScore: 100,
        answers: {},
        questionScores: { main: scoreVal },
        questionDetails: {},
        completedAt: new Date().toISOString(),
        timeSpentSeconds: 120,
        feedbackRevealedToStudent: true,
      };

      if (lvlNum >= prog.currentLevel && lvlNum < 9) {
        prog.currentLevel = lvlNum + 1;
      }
    }

    prog.totalScore = calculateStudentTotalScore(prog);
    prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

    saveSingleStudentProgress(selectedUsername, prog);
    syncStudentProgressToFirestore(prog).catch(() => {});

    addActivityLog(
      `قام المشرف بتحديث درجة الطالب ${selectedUsername} لـ (${selectedTestOrLevel}) إلى ${scoreVal} درجة`,
      'admin',
      'success'
    );

    try {
      window.dispatchEvent(new CustomEvent('cp_student_profile_updated', { detail: { username: selectedUsername } }));
      window.dispatchEvent(new CustomEvent('cp_student_progress_reset', { detail: { username: selectedUsername } }));
    } catch {}

    setSuccessMsg(`✅ تم تحديث وحفظ درجة الطالب (${selectedUsername}) لـ (${selectedTestOrLevel}) بنجاح (${scoreVal} درجة). ظهرت في لوحة النتائج!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif]" dir="rtl">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 border-2 border-sky-400/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400 text-sky-300 flex items-center justify-center shadow-inner shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>إدارة ورصد درجات الطلاب المركزية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal']">
              تبويبة درجات الطلاب (اختيار الطالب، الاختبار، وتعديل الدرجات)
            </h2>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 text-xs sm:text-sm font-black flex items-center gap-3 shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grading Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0d122b] border-2 border-sky-500/40 shadow-2xl space-y-6">
        <form onSubmit={handleSaveGrade} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Student Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-sky-300 font-['Tajawal']">
                1. اختر الطالب من القائمة:
              </label>
              <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-950 border-2 border-sky-500/60 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.fullName || u.username} ({u.groupCode || 'G1'}) - [{u.username}]
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Test / Level Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-sky-300 font-['Tajawal']">
                2. اختر الاختبار أو المستوى:
              </label>
              <select
                value={selectedTestOrLevel}
                onChange={(e) => setSelectedTestOrLevel(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-950 border-2 border-sky-500/60 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="pre-test">المحطة الأولى: الاختبار القبلي (Pre-Test)</option>
                <option value="level-1">المستوى 1: أساسيات الوسائط وتثبيت Captivate</option>
                <option value="level-2">المستوى 2: واجهة البرنامج ولوحات العمل</option>
                <option value="level-3">المستوى 3: إدارة الشرائح والمشاهد التفاعلية</option>
                <option value="level-4">المستوى 4: النصوص والأشكال والأزرار الذكية</option>
                <option value="level-5">المستوى 5: الأصوات والصور الرقمية ومكتبة الوسائط</option>
                <option value="level-6">المستوى 6: التفاعلية المتقدمة وبرمجة الإجراءات</option>
                <option value="level-7">المستوى 7: الأنماط والمؤثرات البصرية والحركة</option>
                <option value="level-8">المستوى 8: إدراج ومعالجة الفيديو والمحاكاة</option>
                <option value="level-9">المستوى 9: بنوك الأسئلة والاختبارات والتقييم</option>
                <option value="post-test">المحطة الختامية: الاختبار البعدي (Post-Test)</option>
              </select>
            </div>

            {/* 3. Grade Input */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-amber-300 font-['Tajawal']">
                3. تعيين الدرجة الجديدة:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-xl bg-slate-950 border-2 border-amber-400 text-amber-300 font-black text-base focus:outline-none focus:border-amber-300"
                  required
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  درجة
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end border-t border-slate-800">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-2.5 cursor-pointer transition-transform hover:scale-105"
            >
              <Save className="w-5 h-5" />
              <span>حفظ وتحديث درجة الطالب فوراً (تظهر في شيت النتائج) 🚀</span>
            </button>
          </div>
        </form>
      </div>

      {/* Student Current Grades Summary Table */}
      <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
            <span>ملخص درجات وتقدم الطالب المحدد: <strong className="text-amber-300">{selectedUsername}</strong></span>
          </h3>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs">
            إجمالي النقاط: {studentProg.totalScore} XP
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">الاختبار القبلي:</span>
            <span className="text-sm font-black text-emerald-400">
              {studentProg.preTestResult?.score ?? 0} / 53
            </span>
          </div>

          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvlNum) => {
            const res = studentProg.completedLevels?.[lvlNum];
            return (
              <div key={lvlNum} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">المستوى {lvlNum}:</span>
                <span className={`text-sm font-black ${res ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {res ? `${res.score} / 100` : 'غير مكتمل'}
                </span>
              </div>
            );
          })}

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">الاختبار البعدي:</span>
            <span className="text-sm font-black text-purple-400">
              {studentProg.postTestResult?.completed ? `${studentProg.postTestResult.score} / 53` : 'غير مكتمل'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
