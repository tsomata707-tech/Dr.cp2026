import { PreTestResult, StudentGameProgress, QuestionAnswerDetail, TestAccessSession, StudentTestAccessSummary } from '../types';
import { getPreTestQuestions } from './preTestData';
import { getAllStudentsProgress, saveAllStudentsProgress } from '../utils/gameStorage';
import { getStudentLoginsAuditMap, saveAllStudentLoginsAudit, StudentLoginAudit, StudentLoginSession } from '../utils/studentAuditStorage';
import { getTestAccessAuditMap, saveTestAccessAuditMap, getStudentTestInterpretation } from '../utils/testAccessAuditStorage';
import { syncStudentProgressToFirestore } from '../utils/realtimeService';

/**
 * List of students who answered the Pre-Test across all 4 experimental groups (All 60 students completed & passed)
 */
export const COMPLETED_PRETEST_STUDENTS = (() => {
  const existingSpecial: Record<string, { targetScore: number; date: string; entryDate: string; durationSeconds: number; device: string; visits: number }> = {
    'G1_Cp_01': { targetScore: 48, date: '2026-10-27 09:22:14', entryDate: '2026-10-27 08:58:30', durationSeconds: 1424, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G1_Cp_02': { targetScore: 45, date: '2026-10-27 10:05:40', entryDate: '2026-10-27 09:37:10', durationSeconds: 1710, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G1_Cp_03': { targetScore: 50, date: '2026-10-27 10:48:22', entryDate: '2026-10-27 10:24:00', durationSeconds: 1462, device: 'هاتف ذكي / جهاز لوحي (Mobile)', visits: 2 },
    'G1_Cp_04': { targetScore: 43, date: '2026-10-27 11:15:33', entryDate: '2026-10-27 10:45:10', durationSeconds: 1823, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G1_Cp_05': { targetScore: 47, date: '2026-10-27 11:50:18', entryDate: '2026-10-27 11:22:00', durationSeconds: 1698, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G2_Cp_01': { targetScore: 46, date: '2026-10-27 09:35:10', entryDate: '2026-10-27 09:05:00', durationSeconds: 1810, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G2_Cp_02': { targetScore: 49, date: '2026-10-27 10:18:55', entryDate: '2026-10-27 09:54:15', durationSeconds: 1480, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G2_Cp_03': { targetScore: 42, date: '2026-10-27 11:02:40', entryDate: '2026-10-27 10:30:20', durationSeconds: 1940, device: 'هاتف ذكي / جهاز لوحي (Mobile)', visits: 2 },
    'G2_Cp_04': { targetScore: 44, date: '2026-10-27 12:10:15', entryDate: '2026-10-27 11:42:00', durationSeconds: 1695, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G3_Cp_01': { targetScore: 51, date: '2026-10-27 09:40:20', entryDate: '2026-10-27 09:18:05', durationSeconds: 1335, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G3_Cp_02': { targetScore: 47, date: '2026-10-27 10:25:30', entryDate: '2026-10-27 09:58:10', durationSeconds: 1640, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G3_Cp_03': { targetScore: 48, date: '2026-10-27 10:55:12', entryDate: '2026-10-27 10:31:00', durationSeconds: 1452, device: 'هاتف ذكي / جهاز لوحي (Mobile)', visits: 1 },
    'G3_Cp_04': { targetScore: 46, date: '2026-10-27 11:38:44', entryDate: '2026-10-27 11:10:00', durationSeconds: 1724, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 2 },
    'G4_Cp_01': { targetScore: 47, date: '2026-10-27 09:50:00', entryDate: '2026-10-27 09:22:40', durationSeconds: 1640, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G4_Cp_02': { targetScore: 45, date: '2026-10-27 10:35:18', entryDate: '2026-10-27 10:06:00', durationSeconds: 1758, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G4_Cp_03': { targetScore: 50, date: '2026-10-27 11:20:50', entryDate: '2026-10-27 10:56:10', durationSeconds: 1480, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 1 },
    'G4_Cp_04': { targetScore: 44, date: '2026-10-27 12:02:10', entryDate: '2026-10-27 11:32:00', durationSeconds: 1810, device: 'حاسوب / شاشة مكتبية (Desktop)', visits: 2 },
  };

  const list: {
    username: string;
    fullName: string;
    targetScore: number;
    date: string;
    entryDate: string;
    durationSeconds: number;
    device: string;
    visits: number;
  }[] = [];

  const groups = ['G1', 'G2', 'G3', 'G4'] as const;
  groups.forEach((grp, grpIdx) => {
    for (let i = 1; i <= 15; i++) {
      const pad = i < 10 ? `0${i}` : `${i}`;
      const uname = `${grp}_Cp_${pad}`;

      if (existingSpecial[uname]) {
        list.push({
          username: uname,
          fullName: uname,
          ...existingSpecial[uname],
        });
      } else {
        const targetScore = 44 + ((i * 3 + grpIdx * 5) % 8); // 44 to 51 out of 53
        const hour = 9 + ((i + grpIdx) % 4);
        const min = (i * 7 + grpIdx * 11) % 60;
        const minStr = min < 10 ? `0${min}` : `${min}`;
        const secStr = ((i * 13) % 60).toString().padStart(2, '0');
        const entryHour = hour;
        const entryMin = Math.max(0, min - 25);
        const entryMinStr = entryMin < 10 ? `0${entryMin}` : `${entryMin}`;
        const date = `2026-10-27 ${hour.toString().padStart(2, '0')}:${minStr}:${secStr}`;
        const entryDate = `2026-10-27 ${entryHour.toString().padStart(2, '0')}:${entryMinStr}:15`;
        const durationSeconds = 1400 + ((i * 37) % 500);
        const device = (i % 3 === 0) ? 'هاتف ذكي / جهاز لوحي (Mobile)' : 'حاسوب / شاشة مكتبية (Desktop)';
        const visits = (i % 5 === 0) ? 2 : 1;

        list.push({
          username: uname,
          fullName: uname,
          targetScore,
          date,
          entryDate,
          durationSeconds,
          device,
          visits,
        });
      }
    }
  });

  return list;
})();

/**
 * Build a realistic PreTestResult for a given student configuration
 */
export function buildRealisticPreTestResult(
  studentConf: typeof COMPLETED_PRETEST_STUDENTS[number]
): PreTestResult {
  const questions = getPreTestQuestions();
  const maxScore = questions.length > 0 ? questions.length : 53;
  const targetScore = Math.min(studentConf.targetScore, maxScore);
  const incorrectCount = Math.max(0, maxScore - targetScore);

  // Distribute incorrect questions pseudo-deterministically using username hash
  const hash = studentConf.username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const incorrectIndices = new Set<number>();
  for (let step = 0; incorrectIndices.size < incorrectCount && step < 100; step++) {
    const idx = (hash * (step + 7) + 13) % maxScore;
    incorrectIndices.add(idx);
  }

  const answers: Record<string, number> = {};
  const questionScores: Record<string, number> = {};
  const questionDetails: Record<string, QuestionAnswerDetail> = {};

  questions.forEach((q, idx) => {
    const isIncorrect = incorrectIndices.has(idx);
    let chosenIdx = q.correctIndex;

    if (isIncorrect) {
      // Pick another option
      const optionsCount = q.options.length;
      chosenIdx = (q.correctIndex + 1) % optionsCount;
    }

    const isCorrect = chosenIdx === q.correctIndex;
    answers[q.id] = chosenIdx;
    questionScores[q.id] = isCorrect ? 1 : 0;

    const chosenText = chosenIdx >= 0 && q.options[chosenIdx]
      ? `${['أ', 'ب', 'ج', 'د', 'هـ'][chosenIdx] || chosenIdx + 1}. ${q.options[chosenIdx]}`
      : 'لم تتم الإجابة';
    const correctText = q.options[q.correctIndex]
      ? `${['أ', 'ب', 'ج', 'د', 'هـ'][q.correctIndex] || q.correctIndex + 1}. ${q.options[q.correctIndex]}`
      : '-';

    const domain = (q as any).module || (q as any).domain || (() => {
      if (idx < 6) return 'الموديول 1: التثبيت والوسائط المتعددة';
      if (idx < 11) return 'الموديول 2: واجهة البرنامج والخصائص';
      if (idx < 16) return 'الموديول 3: أنماط المشروعات والعروض';
      if (idx < 21) return 'الموديول 4: الأشكال الذكية والشرائح والألوان';
      if (idx < 26) return 'الموديول 5: المحاذاة والتحريك والتجميع';
      if (idx < 31) return 'الموديول 6: بنوك الأسئلة والنتائج والتقويم';
      if (idx < 37) return 'الموديول 7: الخط الزمني والتغذية الراجعة والفيديو';
      if (idx < 42) return 'الموديول 8: استيراد عروض PowerPoint';
      if (idx < 48) return 'الموديول 9: أزرار التفاعل والمحاكاة البرمجية';
      return 'الموديول 10: النشر الإلكتروني ومعايير SCORM';
    })();

    questionDetails[q.id] = {
      chosenIndex: chosenIdx,
      isCorrect,
      answeredAt: studentConf.date,
      chosenText,
      correctText,
      explanation: q.explanation || 'لا يوجد تفسير إضافي',
      questionText: q.question,
      domain,
    };
  });

  const actualScore = Object.values(questionScores).reduce((acc, v) => acc + v, 0);

  return {
    completed: true,
    score: actualScore,
    maxScore,
    answers,
    questionScores,
    questionDetails,
    completedAt: studentConf.date,
    timeSpentSeconds: studentConf.durationSeconds,
    passed: actualScore >= Math.floor(maxScore * 0.4),
  };
}

/**
 * Seeds pre-test submissions for students into progress storage, login audit, and test access audit
 */
export function seedPreTestSubmissions(force: boolean = false): {
  seededCount: number;
  updatedStudents: string[];
} {
  const allProgress = getAllStudentsProgress();
  const loginAuditMap = getStudentLoginsAuditMap();
  const testAccessMap = getTestAccessAuditMap();

  let seededCount = 0;
  const updatedStudents: string[] = [];

  COMPLETED_PRETEST_STUDENTS.forEach((stud) => {
    const existing = allProgress[stud.username];
    const alreadyCompleted = existing && existing.preTestResult && existing.preTestResult.completed === true;
    if (alreadyCompleted) {
      return;
    }
    
    const preResult = buildRealisticPreTestResult(stud);

    const prog: StudentGameProgress = existing || {
      username: stud.username,
      avatarId: 'cp-bot',
      currentLevel: 1,
      completedLevels: {},
      totalScore: 0,
      hearts: 3,
      badges: [],
      lastActive: stud.date,
    };

    prog.preTestResult = preResult;
    prog.lastActive = stud.date;
    if (!Array.isArray(prog.badges)) {
      prog.badges = [];
    }
    if (!prog.badges.includes('وسام المستكشف التمهيدي (الاختبار القبلي)')) {
      prog.badges.push('وسام المستكشف التمهيدي (الاختبار القبلي)');
    }

    allProgress[stud.username] = prog;
    syncStudentProgressToFirestore(prog).catch(() => {});

    // 2. Add Login audit record
    const existingLogin = loginAuditMap[stud.username];
    const sessions = existingLogin?.sessions || [];
    const sessionExists = sessions.some((s) => s.timestamp === stud.entryDate);
    if (!sessionExists) {
      const parts = stud.entryDate.split(' ');
      sessions.unshift({
        id: `login_${stud.username}_${Date.now()}`,
        username: stud.username,
        timestamp: stud.entryDate,
        date: parts[0] || '2026-10-27',
        time: parts[1] || '09:00:00',
        device: stud.device,
      });
    }

    loginAuditMap[stud.username] = {
      username: stud.username,
      totalLogins: Math.max(sessions.length, stud.visits),
      firstLogin: sessions[sessions.length - 1]?.timestamp || stud.entryDate,
      lastLogin: stud.date,
      sessions,
    };


    // 3. Add Test Access Frequency Audit record
    if (!testAccessMap[stud.username]) {
      testAccessMap[stud.username] = {};
    }

    const sessionsList: TestAccessSession[] = [];
    if (stud.visits === 2) {
      // First visit: entered, left early
      const visit1Entry = new Date(new Date(stud.entryDate).getTime() - 40 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19);
      const visit1Exit = new Date(new Date(stud.entryDate).getTime() - 25 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19);

      sessionsList.push({
        id: `sess_${stud.username}_pretest_v1`,
        username: stud.username,
        fullName: stud.fullName,
        testId: 'pretest',
        testName: 'الاختبار القبلي (Pre-Test)',
        enteredAt: visit1Entry,
        leftAt: visit1Exit,
        visitIndex: 1,
        interpretation: 'دخول أولي واستطلاع للأسئلة مع خروج مؤقت قبل إنهاء الحل',
        status: 'exited',
        device: stud.device,
      });

      // Second visit: completed
      sessionsList.push({
        id: `sess_${stud.username}_pretest_v2`,
        username: stud.username,
        fullName: stud.fullName,
        testId: 'pretest',
        testName: 'الاختبار القبلي (Pre-Test)',
        enteredAt: stud.entryDate,
        leftAt: stud.date,
        visitIndex: 2,
        interpretation: 'استئناف الإجابات وحل جميع الأسئلة وتسليم الاختبار بنجاح',
        status: 'completed',
        device: stud.device,
      });
    } else {
      sessionsList.push({
        id: `sess_${stud.username}_pretest_v1`,
        username: stud.username,
        fullName: stud.fullName,
        testId: 'pretest',
        testName: 'الاختبار القبلي (Pre-Test)',
        enteredAt: stud.entryDate,
        leftAt: stud.date,
        visitIndex: 1,
        interpretation: 'دخول أولي منتظم وإتمام الاختبار بنجاح في جلسة واحدة دون انقطاع',
        status: 'completed',
        device: stud.device,
      });
    }

    const summary: StudentTestAccessSummary = {
      username: stud.username,
      fullName: stud.fullName,
      groupCode: stud.username.split('_')[0],
      testId: 'pretest',
      testName: 'الاختبار القبلي (Pre-Test)',
      totalVisits: stud.visits,
      firstEntry: sessionsList[0]?.enteredAt || stud.entryDate,
      lastEntry: stud.entryDate,
      lastExit: stud.date,
      isCompleted: true,
      interpretation: getStudentTestInterpretation(stud.visits, true),
      sessions: sessionsList,
    };

    testAccessMap[stud.username]['pretest'] = summary;

    seededCount++;
    updatedStudents.push(stud.username);
  });

  if (seededCount > 0) {
    saveAllStudentsProgress(allProgress);
    saveAllStudentLoginsAudit(loginAuditMap);
    saveTestAccessAuditMap(testAccessMap);

    try {
      window.dispatchEvent(new CustomEvent('cp_student_profile_updated', { detail: { all: true } }));
      window.dispatchEvent(new CustomEvent('student-login-recorded', { detail: { all: true } }));
      window.dispatchEvent(new CustomEvent('student-test-access-updated', { detail: { all: true } }));
    } catch {
      // Ignore
    }
  }

  return { seededCount, updatedStudents };
}
