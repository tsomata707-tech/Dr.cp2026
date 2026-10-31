import { ref, set as rtdbSet, get as rtdbGet, onValue, remove as rtdbRemove } from 'firebase/database';
import { rtdb } from '../firebase';
import { StudentActivitySubmission, LevelActivityConfig, StudentGameProgress } from '../types';
import {
  getStudentProgress,
  getAllStudentsProgress,
  saveAllStudentsProgress,
  saveStudentLevelActivity,
  calculateStudentTotalScore,
} from './gameStorage';
import { syncStudentProgressToFirestore } from './realtimeService';
import { addActivityLog } from './adminStorage';
import { GAME_LEVELS_DATA, getCustomGameLevels, saveCustomGameLevels } from '../data/gameLevelsData';

const CONFIGS_STORAGE_KEY = 'cp_level_activity_configs_v2';
const SUBMISSIONS_STORAGE_KEY = 'cp_student_activities_submissions_v2';

export const DEFAULT_LEVEL_ACTIVITY_CONFIGS: Record<number, LevelActivityConfig> = {
  1: {
    levelNumber: 1,
    activityTitle: 'نشاط المستوى 1: تثبيت وإعداد Adobe Captivate 2019',
    instructions: 'قم بتثبيت برنامج Adobe Captivate 2019 (64-bit) وتفعيل دعم نصوص اللغة العربية من قائمة التفضيلات، ثم ارفع لقطة شاشة أو مقطع فيديو يثبت تشغيل البرنامج.',
    maxPoints: 50,
  },
  2: {
    levelNumber: 2,
    activityTitle: 'نشاط المستوى 2: استكشاف واجهة المستخدم وشاشات البداية',
    instructions: 'أنشئ مشروعاً تعليمياً جديداً وتعرف على شريط الأدوات الرئيسي ولوحة الخصائص، ثم ارفع لقطة شاشة لواجهة مشروعك أو مقطع فيديو قصير.',
    maxPoints: 50,
  },
  3: {
    levelNumber: 3,
    activityTitle: 'نشاط المستوى 3: إدارة الشرائح والمشاهد وتنسيقها',
    instructions: 'قم بإضافة 3 شرائح تفاعلية مع ضبط عناوينها وتنسيق ألوانها ومدة ظهورها في الخط الزمني (Timeline)، ثم ارفع ملف التطبيق أو صورة للمشروع.',
    maxPoints: 50,
  },
  4: {
    levelNumber: 4,
    activityTitle: 'نشاط المستوى 4: إدراج وتنسيق النصوص والأشكال التفاعلية',
    instructions: 'أدرج نصوصاً باللغة العربية مع أشكال ذكية (Smart Shapes) تفاعلية واستخدمها كأزرار قابلة للنقر، ثم ارفع ملف المشروع (.cptx) أو لقطة شاشة للشريحة.',
    maxPoints: 50,
  },
  5: {
    levelNumber: 5,
    activityTitle: 'نشاط المستوى 5: دمج الصوت والمؤثرات الصوتية والموسيقى',
    instructions: 'سجل صوتاً تعليقياً أو أدرج مقطعاً صوتياً توضيحياً داخل الشريحة وتحقق من مزامنة الصوت مع ظهور العناصر، ثم ارفع الملف أو لقطة للشريحة.',
    maxPoints: 50,
  },
  6: {
    levelNumber: 6,
    activityTitle: 'نشاط المستوى 6: إدراج ومعالجة الفيديو التفاعلي',
    instructions: 'أدرج مقطع فيديو تعليمي داخل الشريحة واضبط خيارات المشغل ونقاط التوقف والتفاعل (Interactive Video Bookmarks)، ثم ارفع ملف العمل أو لقطة توضيحية.',
    maxPoints: 50,
  },
  7: {
    levelNumber: 7,
    activityTitle: 'نشاط المستوى 7: برمجة أزرار التنقل والتحكم التفاعلي',
    instructions: 'أنشئ أزرار تنقل تفاعلية (التالي، السابق، إعادة، انتقال لشريحة محددة) وبرمج إجراءاتها (Actions)، ثم ارفع ملف التطبيق أو لقطة شاشة للبرمجة.',
    maxPoints: 50,
  },
  8: {
    levelNumber: 8,
    activityTitle: 'نشاط المستوى 8: بناء بنك الأسئلة والاختبارات التفاعلية',
    instructions: 'صمم شريحة اختبار من نوع الاختيار من متعدد أو المطابقة مع تحديد الدرجات ورسائل التغذية الراجعة، ثم ارفع ملف الاختبار أو صورة للشريحة.',
    maxPoints: 50,
  },
  9: {
    levelNumber: 9,
    activityTitle: 'نشاط المستوى 9: نشر وتصدير المشروع النهائي بصيغة HTML5',
    instructions: 'قم بنشر وتصدير مشروعك النهائي بصيغة HTML5 المتجاوبة للويب، وارفع ملف التصدير المضغوط (.zip) أو ملف المشروع (.cptx) أو لقطة تثبت نجاح التصدير.',
    maxPoints: 50,
  },
};

// ==========================================
// 1. Level Activities Config Management
// ==========================================

export function getLevelActivityConfigs(): Record<number, LevelActivityConfig> {
  try {
    const raw = localStorage.getItem(CONFIGS_STORAGE_KEY);
    if (!raw) {
      saveAllLevelActivityConfigs(DEFAULT_LEVEL_ACTIVITY_CONFIGS, false);
      return DEFAULT_LEVEL_ACTIVITY_CONFIGS;
    }
    const parsed = JSON.parse(raw);
    // Ensure all 9 levels exist
    const merged: Record<number, LevelActivityConfig> = { ...DEFAULT_LEVEL_ACTIVITY_CONFIGS };
    for (let i = 1; i <= 9; i++) {
      if (parsed[i]) {
        merged[i] = { ...merged[i], ...parsed[i] };
      }
    }
    return merged;
  } catch {
    return DEFAULT_LEVEL_ACTIVITY_CONFIGS;
  }
}

export function getLevelActivityConfig(levelNumber: number): LevelActivityConfig {
  const configs = getLevelActivityConfigs();
  return configs[levelNumber] || DEFAULT_LEVEL_ACTIVITY_CONFIGS[levelNumber] || {
    levelNumber,
    activityTitle: `نشاط المستوى ${levelNumber}`,
    instructions: 'قم برفع ملف تطبيقك العملي لهذا المستوى.',
    maxPoints: 50,
  };
}

export function saveAllLevelActivityConfigs(
  configs: Record<number, LevelActivityConfig>,
  syncRemote: boolean = true
): void {
  try {
    localStorage.setItem(CONFIGS_STORAGE_KEY, JSON.stringify(configs));

    // Also sync to GAME_LEVELS_DATA in-memory and persistent storage
    try {
      const customLevels = getCustomGameLevels();
      let changed = false;
      Object.values(configs).forEach((cfg) => {
        const found = customLevels.find((l) => l.levelNumber === cfg.levelNumber);
        if (found) {
          found.activityPrompt = cfg.instructions;
          (found as any).activityTitle = cfg.activityTitle;
          changed = true;
        }
        const memoryFound = GAME_LEVELS_DATA.find((l) => l.levelNumber === cfg.levelNumber);
        if (memoryFound) {
          memoryFound.activityPrompt = cfg.instructions;
          (memoryFound as any).activityTitle = cfg.activityTitle;
        }
      });
      if (changed) {
        saveCustomGameLevels(customLevels, false);
      }
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cp_level_activities_config_updated', { detail: configs })
      );
    }

    if (syncRemote) {
      const rtdbConfigsRef = ref(rtdb, 'system/levelActivityConfigs');
      rtdbSet(rtdbConfigsRef, configs).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to save level activity configs:', err);
  }
}

export function updateLevelActivityConfig(
  levelNumber: number,
  updates: Partial<LevelActivityConfig>
): Record<number, LevelActivityConfig> {
  const all = getLevelActivityConfigs();
  const current = all[levelNumber] || DEFAULT_LEVEL_ACTIVITY_CONFIGS[levelNumber];
  all[levelNumber] = {
    ...current,
    ...updates,
    levelNumber,
    updatedAt: new Date().toISOString(),
  };
  saveAllLevelActivityConfigs(all, true);
  return all;
}

// ==========================================
// 2. Student Activity Submissions Management
// ==========================================

export function getAllActivitySubmissions(): StudentActivitySubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    let list: StudentActivitySubmission[] = raw ? JSON.parse(raw) : [];

    // Also cross-reference with all students' progress to make sure no submission is missed
    const allProgress = getAllStudentsProgress();
    const mapById: Record<string, StudentActivitySubmission> = {};
    list.forEach((s) => {
      if (s.id) mapById[s.id] = s;
    });

    Object.values(allProgress).forEach((prog) => {
      if (prog.studentActivities) {
        Object.entries(prog.studentActivities).forEach(([lvlStr, act]) => {
          const lvlNum = parseInt(lvlStr, 10);
          const autoId = act.id || `sub_${prog.username}_lvl${lvlNum}`;
          if (!mapById[autoId]) {
            const reconstructed: StudentActivitySubmission = {
              ...act,
              id: autoId,
              studentUsername: prog.username,
              levelNumber: lvlNum,
              status: act.status || (act.grade !== undefined && act.grade !== null ? 'graded' : 'pending'),
              grade: act.grade ?? null,
              maxPoints: act.maxPoints || 50,
            };
            mapById[autoId] = reconstructed;
            list.push(reconstructed);
          }
        });
      }
    });

    return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch {
    return [];
  }
}

export function saveAllActivitySubmissions(
  list: StudentActivitySubmission[],
  syncRemote: boolean = true
): void {
  // Strip large file payloads for local storage to prevent quota errors
  const stripped = list.map(s => {
    const copy = { ...s };
    delete copy.fileUrl;
    return copy;
  });

  try {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(stripped));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cp_student_activity_submissions_updated', { detail: list }));
    }
  } catch (err) {
    console.warn('LocalStorage limit for submissions:', err);
  }
}

/**
 * Student uploads an activity:
 * 1. Saved into global submissions list.
 * 2. Saved into student's personal profile (studentActivities[levelNumber]).
 * 3. IMPORTANT: NO POINTS ARE AWARDED YET. Grade is null, points = 0.
 * 4. Pushed to Firebase RTDB so the Admin sees it instantly.
 */
export async function submitStudentActivity(
  submission: StudentActivitySubmission
): Promise<StudentActivitySubmission> {
  const username = submission.studentUsername?.trim() || 'unknown';
  const levelNum = submission.levelNumber || 1;
  const config = getLevelActivityConfig(levelNum);

  const subId = submission.id || `sub_${username}_lvl${levelNum}_${Date.now()}`;
  const completeSubmission: StudentActivitySubmission = {
    ...submission,
    id: subId,
    studentUsername: username,
    levelNumber: levelNum,
    activityTitle: submission.activityTitle || config.activityTitle,
    maxPoints: submission.maxPoints || config.maxPoints || 50,
    // [FIX 12]: تعيين الحالة التلقائية عند رفع النشاط إلى auto_granted_pending_review لحل تناقض الدرجة الـ 50 مع pending
    status: submission.status || 'auto_granted_pending_review',
    grade: submission.grade ?? 50,
    feedback: submission.feedback || '',
    uploadedAt: submission.uploadedAt || new Date().toISOString(),
  };

  // 1. Save in local submissions list
  const currentList = getAllActivitySubmissions();
  const existingIdx = currentList.findIndex(
    (s) => s.id === subId || (s.studentUsername === username && s.levelNumber === levelNum)
  );
  if (existingIdx !== -1) {
    currentList[existingIdx] = completeSubmission;
  } else {
    currentList.unshift(completeSubmission);
  }
  saveAllActivitySubmissions(currentList);

  // 2. Save into student's personal game progress (points are 0 until graded)
  saveStudentLevelActivity(username, levelNum, completeSubmission);

  // 3. Sync to Firebase RTDB
  try {
    // For RTDB storage, store metadata + file payload
    const rtdbSubRef = ref(rtdb, `student_activities/${subId}`);
    await rtdbSet(rtdbSubRef, completeSubmission);
  } catch (err) {
    console.warn('Firebase RTDB activity upload sync warning:', err);
  }

  addActivityLog(
    `رفع نشاط جديد: الطالب ${username} رفع نشاط ${completeSubmission.activityTitle} (${completeSubmission.fileName})`,
    username,
    'success'
  );

  return completeSubmission;
}

/**
 * Admin assigns or updates a grade for a student's activity:
 * 1. Updates submission record (grade, feedback, status='graded', gradedAt, gradedBy).
 * 2. Credits/adds the assigned grade directly to the student's totalScore and progress.
 * 3. Syncs updated student profile to Firebase RTDB & dispatches real-time update events.
 */
export async function gradeStudentActivity(
  submissionId: string,
  grade: number,
  feedback: string = '',
  adminUsername: string = 'admin'
): Promise<StudentActivitySubmission | null> {
  const allSubmissions = getAllActivitySubmissions();
  const targetSub = allSubmissions.find((s) => s.id === submissionId);
  if (!targetSub) {
    throw new Error('النشاط المطلوب غير موجود');
  }

  const validGrade = Math.max(0, Math.min(targetSub.maxPoints || 100, Math.round(grade)));
  targetSub.grade = validGrade;
  targetSub.feedback = feedback.trim();
  targetSub.status = 'graded';
  targetSub.gradedAt = new Date().toISOString();
  targetSub.gradedBy = adminUsername;

  // 1. Update submissions list
  saveAllActivitySubmissions(allSubmissions);

  // 2. Update Student Profile Progress and calculate totalScore
  if (targetSub.studentUsername) {
    const username = targetSub.studentUsername;
    const allProgress = getAllStudentsProgress();
    const prog = getStudentProgress(username);

    if (!prog.studentActivities) {
      prog.studentActivities = {};
    }

    const lvlNum = targetSub.levelNumber || 1;
    prog.studentActivities[lvlNum] = {
      ...prog.studentActivities[lvlNum],
      ...targetSub,
      grade: validGrade,
      status: 'graded',
      feedback: targetSub.feedback,
      gradedAt: targetSub.gradedAt,
      gradedBy: adminUsername,
    };

    // Calculate totalScore cleanly including the newly assigned activity grade
    prog.totalScore = calculateStudentTotalScore(prog);
    prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

    allProgress[username] = prog;
    saveAllStudentsProgress(allProgress);
    await syncStudentProgressToFirestore(prog);

    try {
      window.dispatchEvent(
        new CustomEvent('cp_student_profile_updated', { detail: { username } })
      );
      window.dispatchEvent(
        new CustomEvent('cp_student_activity_graded', {
          detail: { username, levelNumber: lvlNum, submission: targetSub, grade: validGrade },
        })
      );
    } catch {
      // ignore
    }

    addActivityLog(
      `رصد درجة نشاط: قام المشرف ${adminUsername} برصد درجة ${validGrade}/${targetSub.maxPoints} للطالب ${username} في ${targetSub.activityTitle}`,
      adminUsername,
      'success'
    );
  }

  // 3. Sync updated submission to Firebase RTDB
  try {
    const rtdbSubRef = ref(rtdb, `student_activities/${submissionId}`);
    await rtdbSet(rtdbSubRef, targetSub);
  } catch (err) {
    console.warn('Firebase RTDB grade sync warning:', err);
  }

  return targetSub;
}

/**
 * Delete a student's activity submission
 */
export async function deleteStudentActivity(submissionId: string): Promise<void> {
  const allSubmissions = getAllActivitySubmissions();
  const targetSub = allSubmissions.find((s) => s.id === submissionId);
  const filtered = allSubmissions.filter((s) => s.id !== submissionId);
  saveAllActivitySubmissions(filtered);

  if (targetSub && targetSub.studentUsername && targetSub.levelNumber) {
    const username = targetSub.studentUsername;
    const lvlNum = targetSub.levelNumber;
    const allProgress = getAllStudentsProgress();
    const prog = getStudentProgress(username);

    if (prog.studentActivities && prog.studentActivities[lvlNum]) {
      delete prog.studentActivities[lvlNum];
      prog.totalScore = calculateStudentTotalScore(prog);
      prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);
      allProgress[username] = prog;
      saveAllStudentsProgress(allProgress);
      await syncStudentProgressToFirestore(prog);

      try {
        window.dispatchEvent(
          new CustomEvent('cp_student_profile_updated', { detail: { username } })
        );
      } catch {
        // ignore
      }
    }
  }

  try {
    const rtdbSubRef = ref(rtdb, `student_activities/${submissionId}`);
    await rtdbRemove(rtdbSubRef);
  } catch (err) {
    console.warn('Firebase RTDB remove warning:', err);
  }
}

/**
 * Real-time subscription to student activities
 */
export function subscribeToStudentActivities(
  callback: (submissions: StudentActivitySubmission[]) => void
): () => void {
  // 1. Initial local call
  callback(getAllActivitySubmissions());

  // 2. Window event listener
  const handleUpdate = () => {
    callback(getAllActivitySubmissions());
  };
  window.addEventListener('cp_student_activity_submissions_updated', handleUpdate);
  window.addEventListener('cp_student_activity_uploaded', handleUpdate);
  window.addEventListener('cp_student_activity_graded', handleUpdate);

  // 3. Firebase RTDB listener
  let unsubRtdb: (() => void) | null = null;
  try {
    const activitiesRef = ref(rtdb, 'student_activities');
    unsubRtdb = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        const remoteSubs: StudentActivitySubmission[] = Object.values(data);
        if (remoteSubs.length > 0) {
          saveAllActivitySubmissions(remoteSubs, false);
          callback(remoteSubs);
        }
      }
    });
  } catch (err) {
    console.warn('RTDB subscribe error:', err);
  }

  return () => {
    window.removeEventListener('cp_student_activity_submissions_updated', handleUpdate);
    window.removeEventListener('cp_student_activity_uploaded', handleUpdate);
    window.removeEventListener('cp_student_activity_graded', handleUpdate);
    if (unsubRtdb) unsubRtdb();
  };
}

/**
 * Real-time subscription to Level Activity Configs
 */
export function subscribeToLevelActivityConfigs(
  callback: (configs: Record<number, LevelActivityConfig>) => void
): () => void {
  callback(getLevelActivityConfigs());

  const handleUpdate = (e: any) => {
    callback(e.detail || getLevelActivityConfigs());
  };
  window.addEventListener('cp_level_activities_config_updated', handleUpdate);

  let unsubRtdb: (() => void) | null = null;
  try {
    const configsRef = ref(rtdb, 'system/levelActivityConfigs');
    unsubRtdb = onValue(configsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        saveAllLevelActivityConfigs(data, false);
        callback(data);
      }
    });
  } catch (err) {
    console.warn('RTDB configs subscribe error:', err);
  }

  return () => {
    window.removeEventListener('cp_level_activities_config_updated', handleUpdate);
    if (unsubRtdb) unsubRtdb();
  };
}
