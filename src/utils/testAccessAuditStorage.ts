import { TestAccessSession, StudentTestAccessSummary } from '../types';
import { syncTestAccessAuditToRTDB } from './realtimeService';
import { getStudentByUsername, getGroupByUsername, generateSixtyStudents } from '../data/studentAccounts';

const TEST_ACCESS_STORAGE_KEY = 'cp_students_test_access_audit_v2';

/**
 * Format date & time in standardized YYYY-MM-DD HH:mm:ss
 */
export function formatCurrentDateTime(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const time = d.toTimeString().split(' ')[0];
  return `${yyyy}-${mm}-${dd} ${time}`;
}

/**
 * Detect client device accurately
 */
function detectDevice(): string {
  if (typeof navigator === 'undefined') return 'جهاز كمبيوتر (Desktop)';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent
  );
  return isMobile ? 'هاتف ذكي / جهاز لوحي (Mobile)' : 'حاسوب / شاشة مكتبية (Desktop)';
}

/**
 * Get all recorded test access audits from localStorage
 * Structure: { [username]: { [testId]: StudentTestAccessSummary } }
 */
export function getTestAccessAuditMap(): Record<string, Record<string, StudentTestAccessSummary>> {
  try {
    const raw = localStorage.getItem(TEST_ACCESS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save all test access audits to localStorage
 */
export function saveTestAccessAuditMap(
  map: Record<string, Record<string, StudentTestAccessSummary>>
): void {
  try {
    localStorage.setItem(TEST_ACCESS_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Failed to save test access audit map:', err);
  }
}

/**
 * Provide detailed academic interpretation of test access and frequency
 */
export function getStudentTestInterpretation(totalVisits: number, isCompleted: boolean): string {
  if (totalVisits === 0) {
    return 'عدم تردد - لم يدخل الطالب هذا الاختبار مطلقاً';
  }
  if (totalVisits === 1 && isCompleted) {
    return 'تردد طبيعي (مرة واحدة): دخول أولي منتظم وإتمام الاختبار بنجاح في جلسة واحدة دون انقطاع';
  }
  if (totalVisits === 1 && !isCompleted) {
    return 'تردد مرة واحدة: بدأ الاختبار ولم يتم تسليم الإجابات النهائية بعد (جلسة قيد التقدم أو خروج)';
  }
  if (totalVisits === 2 && isCompleted) {
    return 'تردد مرتين: خروج بعد الدخول الأول ثم معاودة واستئناف الإجابات حتى إنهاء وتسليم الاختبار بنجاح';
  }
  if (totalVisits === 2 && !isCompleted) {
    return 'تردد مرتين: خروج متكرر وانقطاع دون استكمال وإنهاء الاختبار';
  }
  if (totalVisits >= 3 && isCompleted) {
    return `تردد متكرر (${totalVisits} مرات): انقطاع وخروج متعدد ثم معاودة واستكمال الاختبار في المحاولة الأخيرة بنجاح`;
  }
  return `تردد مرتفع (${totalVisits} مرات): تكرار الدخول والخروج من الاختبار عدة مرات دون إنهاء الحل والتسليم`;
}

/**
 * Record a student's entry to a specific test with exact timestamp, visit count, and interpretation
 */
export function recordTestEntry(
  username: string,
  testId: string,
  testName: string
): TestAccessSession {
  const cleanUser = username.trim();

  // Read-only admin does not pollute student records
  if (cleanUser.toLowerCase() === 'admin') {
    return {
      id: `sess_admin_${Date.now()}`,
      username: 'admin',
      fullName: 'المشرف العام (Admin)',
      testId,
      testName,
      enteredAt: formatCurrentDateTime(),
      visitIndex: 1,
      interpretation: 'استعراض إشرافي للاختبار من قبل الأدمن',
      status: 'active',
      device: detectDevice(),
    };
  }

  const all = getTestAccessAuditMap();
  const userMap = all[cleanUser] || {};
  const studentInfo = getStudentByUsername(cleanUser);
  const groupMeta = getGroupByUsername(cleanUser);

  const existingSummary: StudentTestAccessSummary = userMap[testId] || {
    username: cleanUser,
    fullName: studentInfo?.fullName || cleanUser,
    groupCode: groupMeta?.code || 'G1',
    testId,
    testName,
    totalVisits: 0,
    isCompleted: false,
    interpretation: 'عدم تردد - لم يدخل الاختبار بعد',
    sessions: [],
  };

  const newVisitIndex = existingSummary.totalVisits + 1;
  const currentTimestamp = formatCurrentDateTime();

  let visitInterpretation: string;
  if (newVisitIndex === 1) {
    visitInterpretation = 'دخول أولي للاختبار لأول مرة';
  } else if (newVisitIndex === 2) {
    visitInterpretation = 'معاودة دخول بعد انقطاع وخروج (تردد رقم 2)';
  } else {
    visitInterpretation = `معاودة تردد للاختبار (المرة رقم ${newVisitIndex}) بعد خروج متكرر`;
  }

  const newSession: TestAccessSession = {
    id: `test_entry_${cleanUser}_${testId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanUser,
    fullName: studentInfo?.fullName || cleanUser,
    testId,
    testName,
    enteredAt: currentTimestamp,
    visitIndex: newVisitIndex,
    interpretation: visitInterpretation,
    status: 'active',
    device: detectDevice(),
  };

  const updatedSummary: StudentTestAccessSummary = {
    ...existingSummary,
    fullName: studentInfo?.fullName || cleanUser,
    groupCode: groupMeta?.code || existingSummary.groupCode || 'G1',
    testName,
    totalVisits: newVisitIndex,
    firstEntry: existingSummary.firstEntry || currentTimestamp,
    lastEntry: currentTimestamp,
    interpretation: getStudentTestInterpretation(newVisitIndex, existingSummary.isCompleted),
    sessions: [newSession, ...(existingSummary.sessions || []).slice(0, 49)],
  };

  userMap[testId] = updatedSummary;
  all[cleanUser] = userMap;
  saveTestAccessAuditMap(all);

  // Sync to Firebase RTDB asynchronously
  syncTestAccessAuditToRTDB(cleanUser, testId, updatedSummary).catch(() => {});

  // Dispatch custom window event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('student-test-access-updated', {
        detail: { username: cleanUser, testId, session: newSession, summary: updatedSummary },
      })
    );
  }

  return newSession;
}

/**
 * Record test exit when student navigates away or tab is closed/blurred
 */
export function recordTestExit(sessionId: string): void {
  if (!sessionId || sessionId.startsWith('sess_admin_')) return;

  const all = getTestAccessAuditMap();
  let found = false;
  const exitTime = formatCurrentDateTime();

  for (const username of Object.keys(all)) {
    const userTests = all[username];
    for (const testId of Object.keys(userTests)) {
      const summary = userTests[testId];
      const session = summary.sessions?.find((s) => s.id === sessionId);
      if (session) {
        if (!session.leftAt) {
          session.leftAt = exitTime;
          if (session.status === 'active') {
            session.status = summary.isCompleted ? 'completed' : 'exited';
          }
          summary.lastExit = exitTime;
          summary.interpretation = getStudentTestInterpretation(summary.totalVisits, summary.isCompleted);
          found = true;
          syncTestAccessAuditToRTDB(username, testId, summary).catch(() => {});
        }
        break;
      }
    }
    if (found) break;
  }

  if (found) {
    saveTestAccessAuditMap(all);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('student-test-access-updated', { detail: { sessionId } }));
    }
  }
}

/**
 * Mark a test as fully completed and update interpretation
 */
export function markTestCompletedInAudit(username: string, testId: string): void {
  const cleanUser = username.trim();
  if (cleanUser.toLowerCase() === 'admin') return;

  const all = getTestAccessAuditMap();
  const userMap = all[cleanUser];
  if (!userMap || !userMap[testId]) return;

  const summary = userMap[testId];
  summary.isCompleted = true;
  summary.interpretation = getStudentTestInterpretation(summary.totalVisits, true);

  if (summary.sessions && summary.sessions.length > 0) {
    summary.sessions[0].status = 'completed';
    if (!summary.sessions[0].leftAt) {
      summary.sessions[0].leftAt = formatCurrentDateTime();
    }
  }

  saveTestAccessAuditMap(all);
  syncTestAccessAuditToRTDB(cleanUser, testId, summary).catch(() => {});

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('student-test-access-updated', { detail: { username: cleanUser, testId, summary } })
    );
  }
}

/**
 * Get flattened list of all 60 students and their test access records for admin tables and export
 */
export function getAllStudentsTestAccessSummaries(
  targetTestId?: string
): StudentTestAccessSummary[] {
  const canonicalStudents = generateSixtyStudents();
  const allMap = getTestAccessAuditMap();

  const results: StudentTestAccessSummary[] = [];

  canonicalStudents.forEach((student) => {
    const username = student.username;
    const groupMeta = getGroupByUsername(username);
    const userTests = allMap[username] || {};

    const testsToInclude = targetTestId
      ? [targetTestId]
      : ['pretest', 'posttest', 'level-1', 'level-2', 'level-3', 'level-4', 'level-5', 'level-6', 'level-7', 'level-8', 'level-9'];

    testsToInclude.forEach((testId) => {
      let defaultName = 'الاختبار';
      if (testId === 'pretest') defaultName = 'الاختبار القبلي (Pre-Test)';
      else if (testId === 'posttest') defaultName = 'الاختبار البعدي (Post-Test)';
      else if (testId.startsWith('level-')) defaultName = `تحدي المستوى التعليمي ${testId.replace('level-', '')}`;

      const existing = userTests[testId];
      if (existing) {
        results.push({
          ...existing,
          fullName: student.fullName || existing.fullName || username,
          groupCode: groupMeta?.code || existing.groupCode || 'G1',
          testName: existing.testName || defaultName,
          interpretation: getStudentTestInterpretation(existing.totalVisits, existing.isCompleted),
        });
      } else {
        // Not visited yet (0 تردد - عدم تردد)
        results.push({
          username,
          fullName: student.fullName || username,
          groupCode: groupMeta?.code || 'G1',
          testId,
          testName: defaultName,
          totalVisits: 0,
          isCompleted: false,
          interpretation: 'عدم تردد - لم يدخل الاختبار مطلقاً',
          sessions: [],
        });
      }
    });
  });

  return results;
}

/**
 * Reset all student test access audits to 0 (clean state)
 */
export function resetAllTestAccessAudits(): void {
  try {
    localStorage.removeItem(TEST_ACCESS_STORAGE_KEY);
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('student-test-access-updated', { detail: { reset: true } }));
  }
}
