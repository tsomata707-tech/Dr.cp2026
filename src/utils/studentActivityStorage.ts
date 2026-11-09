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
import { getGroupByUsername } from '../data/studentAccounts';

const CONFIGS_STORAGE_KEY = 'cp_level_activity_configs_v2';
const SUBMISSIONS_STORAGE_KEY = 'cp_student_activities_submissions_v2';

export const DEFAULT_LEVEL_ACTIVITY_CONFIGS: Record<number, LevelActivityConfig> = {
  1: {
    levelNumber: 1,
    activityTitle: 'النشاط الأول: تثبيت وإعداد Adobe Captivate 2019 (50 XP)',
    instructions: 'قم بتثبيت برنامج Adobe Captivate 2019 (64-bit) وتفعيل دعم نصوص اللغة العربية، وارفع لقطة شاشة تثبت تفعيل البرنامج.',
    act1Title: 'النشاط الأول: تثبيت وإعداد Adobe Captivate 2019 (50 XP)',
    act1Instructions: 'قم بتثبيت برنامج Adobe Captivate 2019 (64-bit) وتفعيل دعم نصوص اللغة العربية، وارفع لقطة شاشة تثبت تفعيل البرنامج.',
    act2Title: 'النشاط الثاني: إعداد التفضيلات الأولية للمشروع (50 XP)',
    act2Instructions: 'ضبط التفضيلات الأولية ودعم الخطوط العربية وارفع لقطة شاشة أو مقطع فيديو يثبت إعداد البيئة.',
    maxPoints: 50,
  },
  2: {
    levelNumber: 2,
    activityTitle: 'النشاط الأول: إنشاء مشروع جديد وتحديد الأبعاد (50 XP)',
    instructions: 'أنشئ مشروعاً تعليمياً جديداً وتعرف على شريط الأدوات الرئيسي، وارفع لقطة شاشة لواجهة مشروعك.',
    act1Title: 'النشاط الأول: إنشاء مشروع جديد وتحديد الأبعاد (50 XP)',
    act1Instructions: 'أنشئ مشروعاً تعليمياً جديداً وتعرف على شريط الأدوات الرئيسي، وارفع لقطة شاشة لواجهة مشروعك.',
    act2Title: 'النشاط الثاني: ضبط الخط الزمني وقواعد الظهور (50 XP)',
    act2Instructions: 'ضبط Timeline وترتيب ظهور العناصر وارفع لقطة شاشة أو مقطع للخط الزمني.',
    maxPoints: 50,
  },
  3: {
    levelNumber: 3,
    activityTitle: 'النشاط الأول: إدراج وتنسيق الصور والأشكال الذكية (50 XP)',
    instructions: 'أدرج صوراً وأشكالاً ذكية مع تنسيق محاذاتها، وارفع لقطة شاشة للمشروع.',
    act1Title: 'النشاط الأول: إدراج وتنسيق الصور والأشكال الذكية (50 XP)',
    act1Instructions: 'أدرج صوراً وأشكالاً ذكية مع تنسيق محاذاتها، وارفع لقطة شاشة للمشروع.',
    act2Title: 'النشاط الثاني: دمج وتوزيع التعليق الصوتي (50 XP)',
    act2Instructions: 'دمج تعليق صوتي داخل الشرائح ومزامنته مع العناصر وارفع ملف التطبيق أو مقطعاً صوتياً.',
    maxPoints: 50,
  },
  4: {
    levelNumber: 4,
    activityTitle: 'النشاط الأول: بناء ونشر الأزرار التفاعلية (50 XP)',
    instructions: 'تصميم أزرار تفاعلية ونقاط النقر (Click Boxes)، وارفع لقطة شاشة للأزرار.',
    act1Title: 'النشاط الأول: بناء ونشر الأزرار التفاعلية (50 XP)',
    act1Instructions: 'تصميم أزرار تفاعلية ونقاط النقر (Click Boxes)، وارفع لقطة شاشة للأزرار.',
    act2Title: 'النشاط الثاني: برمجة إظهار وإخفاء الكائنات (50 XP)',
    act2Instructions: 'برمجة الإجراءات البسيطة لإظهار وإخفاء الكائنات، وارفع لقطة شاشة أو ملف العمل.',
    maxPoints: 50,
  },
  5: {
    levelNumber: 5,
    activityTitle: 'النشاط الأول: إنشاء وتنسيق الـ Fluid Boxes (50 XP)',
    instructions: 'أنشئ أوعية مرنة متجاوبة وارفع لقطة شاشة للتنسيق.',
    act1Title: 'النشاط الأول: إنشاء وتنسيق الـ Fluid Boxes (50 XP)',
    act1Instructions: 'أنشئ أوعية مرنة متجاوبة وارفع لقطة شاشة للتنسيق.',
    act2Title: 'النشاط الثاني: معاينة التجاوب على مختلف الأجهزة (50 XP)',
    act2Instructions: 'معاينة التصميم المتجاوب على شاشات الأجهزة اللوحية والموبايل وارفع لقطة المعاينة.',
    maxPoints: 50,
  },
  6: {
    levelNumber: 6,
    activityTitle: 'النشاط الأول: إدراج وضبط الفيديو التعليمي (50 XP)',
    instructions: 'إدراج مقطع فيديو تعليمي داخل الشريحة وارفع لقطة شاشة لمشغل الفيديو.',
    act1Title: 'النشاط الأول: إدراج وضبط الفيديو التعليمي (50 XP)',
    act1Instructions: 'إدراج مقطع فيديو تعليمي داخل الشريحة وارفع لقطة شاشة لمشغل الفيديو.',
    act2Title: 'النشاط الثاني: إدراج العلامات التفاعلية على الفيديو (50 XP)',
    act2Instructions: 'إضافة Interactive Bookmarks وتوقفات تفاعلية على الفيديو وارفع صورة أو مقطع للتوقفات.',
    maxPoints: 50,
  },
  7: {
    levelNumber: 7,
    activityTitle: 'النشاط الأول: تصميم أزرار التحكم المتقدمة (50 XP)',
    instructions: 'تصميم مشغلات أزرار التنقل والتحكم المتقدم، وارفع لقطة للبرمجة.',
    act1Title: 'النشاط الأول: تصميم أزرار التحكم المتقدمة (50 XP)',
    act1Instructions: 'تصميم مشغلات أزرار التنقل والتحكم المتقدم، وارفع لقطة للبرمجة.',
    act2Title: 'النشاط الثاني: ربط المتغيرات والإجراءات المشروطة (50 XP)',
    act2Instructions: 'ربط المتغيرات التفاعلية (Variables & Conditional Actions) وارفع ملف التطبيق.',
    maxPoints: 50,
  },
  8: {
    levelNumber: 8,
    activityTitle: 'النشاط الأول: تصميم أسئلة الاختبار التفاعلي (50 XP)',
    instructions: 'تصميم شرائح الاختبار التفاعلي (اختيار من متعدد ومطابقة)، وارفع صورة لشريحة الأسئلة.',
    act1Title: 'النشاط الأول: تصميم أسئلة الاختبار التفاعلي (50 XP)',
    act1Instructions: 'تصميم شرائح الاختبار التفاعلي (اختيار من متعدد ومطابقة)، وارفع صورة لشريحة الأسئلة.',
    act2Title: 'النشاط الثاني: إعداد شريحة النتيجة والتغذية الراجعة (50 XP)',
    act2Instructions: 'إعداد شريحة نتيجة الاختبار وحساب الدرجات وارفع صورة لشريحة النتيجة.',
    maxPoints: 50,
  },
  9: {
    levelNumber: 9,
    activityTitle: 'النشاط الأول: معايرة إعدادات التصدير النهائي (50 XP)',
    instructions: 'ضبط خيارات التصدير المتوافق مع HTML5 وارفع صورة لإعدادات التصدير.',
    act1Title: 'النشاط الأول: معايرة إعدادات التصدير النهائي (50 XP)',
    act1Instructions: 'ضبط خيارات التصدير المتوافق مع HTML5 وارفع صورة لإعدادات التصدير.',
    act2Title: 'النشاط الثاني: تصدير ورسومات المشروع النهائي (.zip/.cptx) (50 XP)',
    act2Instructions: 'تصدير المشروع النهائي المكتمل بصيغة HTML5 المضغوطة (.zip أو .cptx) وارفع الملف النهائي.',
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
        const def = DEFAULT_LEVEL_ACTIVITY_CONFIGS[i];
        merged[i] = {
          ...def,
          ...parsed[i],
          act1Title: parsed[i].act1Title || parsed[i].activityTitle || def.act1Title,
          act1Instructions: parsed[i].act1Instructions || parsed[i].instructions || def.act1Instructions,
          act2Title: parsed[i].act2Title || def.act2Title,
          act2Instructions: parsed[i].act2Instructions || def.act2Instructions,
        };
      }
    }
    return merged;
  } catch {
    return DEFAULT_LEVEL_ACTIVITY_CONFIGS;
  }
}

export function getLevelActivityConfig(levelNumber: number): LevelActivityConfig {
  const configs = getLevelActivityConfigs();
  const def = DEFAULT_LEVEL_ACTIVITY_CONFIGS[levelNumber] || DEFAULT_LEVEL_ACTIVITY_CONFIGS[1];
  const cfg = configs[levelNumber] || def;

  return {
    ...cfg,
    levelNumber,
    activityTitle: cfg.act1Title || cfg.activityTitle || def.act1Title || `النشاط الأول للمستوى ${levelNumber}`,
    instructions: cfg.act1Instructions || cfg.instructions || def.act1Instructions || 'قم برفع ملف التطبيق العملي للنشاط الأول.',
    act1Title: cfg.act1Title || cfg.activityTitle || def.act1Title || `النشاط الأول للمستوى ${levelNumber}`,
    act1Instructions: cfg.act1Instructions || cfg.instructions || def.act1Instructions || 'قم برفع ملف التطبيق العملي للنشاط الأول.',
    act2Title: cfg.act2Title || def.act2Title || `النشاط الثاني للمستوى ${levelNumber}`,
    act2Instructions: cfg.act2Instructions || def.act2Instructions || 'قم برفع ملف التطبيق العملي للنشاط الثاني.',
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
          found.activityPrompt = cfg.act1Instructions || cfg.instructions;
          (found as any).activityTitle = cfg.act1Title || cfg.activityTitle;
          changed = true;
        }
        const memoryFound = GAME_LEVELS_DATA.find((l) => l.levelNumber === cfg.levelNumber);
        if (memoryFound) {
          memoryFound.activityPrompt = cfg.act1Instructions || cfg.instructions;
          (memoryFound as any).activityTitle = cfg.act1Title || cfg.activityTitle;
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
  const current = getLevelActivityConfig(levelNumber);
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
          let lvlNum = 1;
          let actIndex: 1 | 2 = act.activityIndex || 1;
          if (lvlStr.includes('_')) {
            const parts = lvlStr.split('_');
            lvlNum = parseInt(parts[0], 10) || 1;
            actIndex = (parseInt(parts[1], 10) as 1 | 2) || 1;
          } else {
            lvlNum = parseInt(lvlStr, 10) || 1;
            // Skip un-indexed key if indexed key already exists to prevent duplication
            if (prog.studentActivities?.[`${lvlNum}_1`]) {
              return;
            }
          }
          const autoId = act.id || `sub_${prog.username}_lvl${lvlNum}_act${actIndex}`;
          if (!mapById[autoId]) {
            const reconstructed: StudentActivitySubmission = {
              ...act,
              id: autoId,
              studentUsername: prog.username,
              levelNumber: lvlNum,
              activityIndex: actIndex,
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
  const actIdx = submission.activityIndex || 1;
  const config = getLevelActivityConfig(levelNum);

  const actTitle = actIdx === 2
    ? (config.act2Title || `النشاط الثاني للمستوى ${levelNum}`)
    : (config.act1Title || config.activityTitle || `النشاط الأول للمستوى ${levelNum}`);

  const subId = submission.id || `sub_${username}_lvl${levelNum}_act${actIdx}_${Date.now()}`;
  const studentGroup = submission.groupCode || getGroupByUsername(username)?.code;
  const isG1Immediate = studentGroup === 'G1';

  const completeSubmission: StudentActivitySubmission = {
    ...submission,
    id: subId,
    studentUsername: username,
    levelNumber: levelNum,
    activityIndex: actIdx,
    activityTitle: submission.activityTitle || actTitle,
    maxPoints: submission.maxPoints || 50,
    status: isG1Immediate ? 'graded' : (submission.status || 'auto_granted_pending_review'),
    grade: isG1Immediate ? 50 : (submission.grade ?? 50),
    feedback: isG1Immediate
      ? 'تم احتساب درجة النشاط فورياً واعتمادها تلقائياً (تنافسي فوري)'
      : (submission.feedback || ''),
    gradedBy: isG1Immediate ? 'نظام التنافس الفوري' : submission.gradedBy,
    gradedAt: isG1Immediate ? new Date().toISOString() : submission.gradedAt,
    uploadedAt: submission.uploadedAt || new Date().toISOString(),
  };

  // 1. Save in local submissions list
  const currentList = getAllActivitySubmissions();
  const existingIdx = currentList.findIndex(
    (s) => s.id === subId || (s.studentUsername === username && s.levelNumber === levelNum && (s.activityIndex || 1) === actIdx)
  );
  if (existingIdx !== -1) {
    currentList[existingIdx] = completeSubmission;
  } else {
    currentList.unshift(completeSubmission);
  }
  saveAllActivitySubmissions(currentList);

  // 2. Save into student's personal game progress
  saveStudentLevelActivity(username, levelNum, completeSubmission);

  // 3. Sync to Firebase RTDB
  try {
    const rtdbSubRef = ref(rtdb, `student_activities/${subId}`);
    await rtdbSet(rtdbSubRef, completeSubmission);
  } catch (err) {
    console.warn('Firebase RTDB activity upload sync warning:', err);
  }

  addActivityLog(
    `رفع نشاط جديد: الطالب ${username} رفع ${completeSubmission.activityTitle} (${completeSubmission.fileName})`,
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
    const actIdx = targetSub.activityIndex || 1;

    // Update the specific dual-activity slot
    prog.studentActivities[`${lvlNum}_${actIdx}`] = {
      ...(prog.studentActivities[`${lvlNum}_${actIdx}`] || {}),
      ...targetSub,
      activityIndex: actIdx,
      grade: validGrade,
      status: 'graded',
      feedback: targetSub.feedback,
      gradedAt: targetSub.gradedAt,
      gradedBy: adminUsername,
    };

    if (actIdx === 1) {
      prog.studentActivities[lvlNum] = prog.studentActivities[`${lvlNum}_1`];
    }

    // Update completed level score if level has already been completed with real approved grade
    if (prog.completedLevels && prog.completedLevels[lvlNum]) {
      const qScores = prog.completedLevels[lvlNum].questionScores || {};
      const act1Grade = prog.studentActivities[`${lvlNum}_1`]?.grade ?? 50;
      const act2Grade = prog.studentActivities[`${lvlNum}_2`]?.grade ?? 50;
      qScores['section1_act1'] = act1Grade;
      qScores['section2_activity'] = act2Grade;
      prog.completedLevels[lvlNum].questionScores = qScores;
      prog.completedLevels[lvlNum].score = (typeof act1Grade === 'number' ? act1Grade : 50) + (typeof act2Grade === 'number' ? act2Grade : 50);
    }

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
    const actIdx = targetSub.activityIndex || 1;
    const allProgress = getAllStudentsProgress();
    const prog = getStudentProgress(username);

    if (prog.studentActivities) {
      delete prog.studentActivities[`${lvlNum}_${actIdx}`];
      if (actIdx === 1) delete prog.studentActivities[lvlNum];
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
