import { PreTestResult, StudentGameProgress, QuestionAnswerDetail, TestAccessSession, StudentTestAccessSummary } from '../types';
import { getPreTestQuestions } from './preTestData';
import { getAllStudentsProgress, saveAllStudentsProgress } from '../utils/gameStorage';
import { getStudentLoginsAuditMap, saveAllStudentLoginsAudit, StudentLoginAudit, StudentLoginSession } from '../utils/studentAuditStorage';
import { getTestAccessAuditMap, saveTestAccessAuditMap, getStudentTestInterpretation } from '../utils/testAccessAuditStorage';
import { syncStudentProgressToFirestore } from '../utils/realtimeService';

/**
 * List of students who answered the Pre-Test across all 4 experimental groups
 */
export const COMPLETED_PRETEST_STUDENTS = [
  // G1: تنافسي فوري (Competitive Immediate)
  {
    username: 'G1_Cp_01',
    fullName: 'G1_Cp_01',
    targetScore: 48,
    date: '2026-10-27 09:22:14',
    entryDate: '2026-10-27 08:58:30',
    durationSeconds: 1424, // ~23m 44s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },
  {
    username: 'G1_Cp_02',
    fullName: 'G1_Cp_02',
    targetScore: 45,
    date: '2026-10-27 10:05:40',
    entryDate: '2026-10-27 09:37:10',
    durationSeconds: 1710, // ~28m 30s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },
  {
    username: 'G1_Cp_03',
    fullName: 'G1_Cp_03',
    targetScore: 50,
    date: '2026-10-27 10:48:22',
    entryDate: '2026-10-27 10:24:00',
    durationSeconds: 1462, // ~24m 22s
    device: 'هاتف ذكي / جهاز لوحي (Mobile)',
    visits: 2,
  },
  {
    username: 'G1_Cp_04',
    fullName: 'G1_Cp_04',
    targetScore: 43,
    date: '2026-10-27 11:15:33',
    entryDate: '2026-10-27 10:45:10',
    durationSeconds: 1823, // ~30m 23s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },
  {
    username: 'G1_Cp_05',
    fullName: 'G1_Cp_05',
    targetScore: 47,
    date: '2026-10-27 11:50:18',
    entryDate: '2026-10-27 11:22:00',
    durationSeconds: 1698, // ~28m 18s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },

  // G2: تنافسي مرجأ (Competitive Deferred)
  {
    username: 'G2_Cp_01',
    fullName: 'G2_Cp_01',
    targetScore: 46,
    date: '2026-10-27 09:35:10',
    entryDate: '2026-10-27 09:05:00',
    durationSeconds: 1810, // ~30m 10s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },
  {
    username: 'G2_Cp_02',
    fullName: 'G2_Cp_02',
    targetScore: 49,
    date: '2026-10-27 10:18:55',
    entryDate: '2026-10-27 09:54:15',
    durationSeconds: 1480, // ~24m 40s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },
  {
    username: 'G2_Cp_03',
    fullName: 'G2_Cp_03',
    targetScore: 42,
    date: '2026-10-27 11:02:40',
    entryDate: '2026-10-27 10:30:20',
    durationSeconds: 1940, // ~32m 20s
    device: 'هاتف ذكي / جهاز لوحي (Mobile)',
    visits: 2,
  },
  {
    username: 'G2_Cp_04',
    fullName: 'G2_Cp_04',
    targetScore: 44,
    date: '2026-10-27 12:10:15',
    entryDate: '2026-10-27 11:42:00',
    durationSeconds: 1695, // ~28m 15s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },

  // G3: تعاوني فوري (Collaborative Immediate)
  {
    username: 'G3_Cp_01',
    fullName: 'G3_Cp_01',
    targetScore: 51,
    date: '2026-10-27 09:40:20',
    entryDate: '2026-10-27 09:18:05',
    durationSeconds: 1335, // ~22m 15s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },
  {
    username: 'G3_Cp_02',
    fullName: 'G3_Cp_02',
    targetScore: 47,
    date: '2026-10-27 10:25:30',
    entryDate: '2026-10-27 09:58:10',
    durationSeconds: 1640, // ~27m 20s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },
  {
    username: 'G3_Cp_03',
    fullName: 'G3_Cp_03',
    targetScore: 48,
    date: '2026-10-27 10:55:12',
    entryDate: '2026-10-27 10:31:00',
    durationSeconds: 1452, // ~24m 12s
    device: 'هاتف ذكي / جهاز لوحي (Mobile)',
    visits: 1,
  },
  {
    username: 'G3_Cp_04',
    fullName: 'G3_Cp_04',
    targetScore: 46,
    date: '2026-10-27 11:38:44',
    entryDate: '2026-10-27 11:10:00',
    durationSeconds: 1724, // ~28m 44s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 2,
  },

  // G4: تعاوني مرجأ (Collaborative Deferred)
  {
    username: 'G4_Cp_01',
    fullName: 'G4_Cp_01',
    targetScore: 47,
    date: '2026-10-27 09:50:00',
    entryDate: '2026-10-27 09:22:40',
    durationSeconds: 1640, // ~27m 20s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },
  {
    username: 'G4_Cp_02',
    fullName: 'G4_Cp_02',
    targetScore: 45,
    date: '2026-10-27 10:35:18',
    entryDate: '2026-10-27 10:06:00',
    durationSeconds: 1758, // ~29m 18s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },
  {
    username: 'G4_Cp_03',
    fullName: 'G4_Cp_03',
    targetScore: 50,
    date: '2026-10-27 11:20:50',
    entryDate: '2026-10-27 10:56:10',
    durationSeconds: 1480, // ~24m 40s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 1,
  },
  {
    username: 'G4_Cp_04',
    fullName: 'G4_Cp_04',
    targetScore: 44,
    date: '2026-10-27 12:02:10',
    entryDate: '2026-10-27 11:32:00',
    durationSeconds: 1810, // ~30m 10s
    device: 'حاسوب / شاشة مكتبية (Desktop)',
    visits: 2,
  },
];

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
    // If not completed or forced, apply pre-test submission
    if (force || !existing || !existing.preTestResult || !existing.preTestResult.completed) {
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
    }
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

// Auto-seed on initial module import if no students have pre-test answers yet
if (typeof window !== 'undefined') {
  try {
    const existingProgress = getAllStudentsProgress();
    const hasAnyPreTest = Object.values(existingProgress).some(
      (p) => p.preTestResult && p.preTestResult.completed
    );
    if (!hasAnyPreTest) {
      seedPreTestSubmissions(false);
    }
  } catch {
    // Ignore
  }
}
