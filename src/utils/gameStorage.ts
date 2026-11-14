import { StudentGameProgress, CompletedLevelResult, PreTestResult } from '../types';
import { GAME_LEVELS_DATA, CARTOON_AVATARS, getStartingLevelForGroup, isLevelLockedForGroup } from '../data/gameLevelsData';
import { getGroupByUsername, getCollaborativeGroupByUsername, COLLABORATIVE_GROUPS_DEF } from '../data/studentAccounts';
import { addActivityLog } from './adminStorage';
import { syncStudentProgressToFirestore, wipeAllCloudLevelsDataAndResetProgress } from './realtimeService';

const GAME_STORAGE_KEY = 'cp_real_game_progress_v4';

export function getPassingPreTestResultForStudent(uname: string): PreTestResult {
  const hash = uname.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const score = 44 + (hash % 8); // 44 to 51 out of 53
  return {
    completed: true,
    passed: true,
    score,
    maxScore: 53,
    answers: {},
    questionScores: {},
    completedAt: '2026-10-27 10:30:00',
    timeSpentSeconds: 1400 + (hash % 400),
  };
}

export function sanitizeStudentProgress(prog: Partial<StudentGameProgress>, username: string): StudentGameProgress {
  const cleanUsername = username.trim();
  const avatarIndex =
    Math.abs(cleanUsername.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) %
    CARTOON_AVATARS.length;

  const preResult = (prog.preTestResult && prog.preTestResult.completed)
    ? prog.preTestResult
    : getPassingPreTestResultForStudent(cleanUsername);

  const badges = Array.isArray(prog.badges) ? [...prog.badges] : [];
  if (!badges.includes('وسام المستكشف التمهيدي (الاختبار القبلي)')) {
    badges.push('وسام المستكشف التمهيدي (الاختبار القبلي)');
  }

  const userGroupCode = getGroupByUsername(cleanUsername)?.code;
  const minLevel = cleanUsername.toLowerCase() === 'admin' ? 1 : getStartingLevelForGroup(userGroupCode);

  const sanitized: StudentGameProgress = {
    username: cleanUsername,
    avatarId: prog.avatarId || CARTOON_AVATARS[avatarIndex].id,
    customPhotoUrl: prog.customPhotoUrl,
    currentLevel:
      cleanUsername.toLowerCase() === 'admin'
        ? (typeof prog.currentLevel === 'number' && prog.currentLevel >= 1 ? prog.currentLevel : 9)
        : Math.max(minLevel, typeof prog.currentLevel === 'number' ? prog.currentLevel : minLevel),
    completedLevels: prog.completedLevels && typeof prog.completedLevels === 'object' ? prog.completedLevels : {},
    totalScore: typeof prog.totalScore === 'number' ? prog.totalScore : 0,
    hearts: typeof prog.hearts === 'number' ? prog.hearts : 3,
    badges,
    lastActive: prog.lastActive || '2026-10-27 10:30:00',
    preTestResult: preResult,
    postTestResult: prog.postTestResult,
    studentActivities: prog.studentActivities && typeof prog.studentActivities === 'object' ? prog.studentActivities : {},
  };

  return sanitized;
}

export function getAllStudentsProgress(): Record<string, StudentGameProgress> {
  try {
    const raw = localStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) {
      const cleanReal = generateCleanRealStudents();
      try {
        localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(cleanReal));
      } catch (e) {
        console.warn("Failed to initialize game storage in localStorage:", e);
      }
      return cleanReal;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      Object.keys(parsed).forEach((k) => {
        parsed[k] = sanitizeStudentProgress(parsed[k], k);
      });
      return parsed;
    }
    return generateCleanRealStudents();
  } catch {
    return generateCleanRealStudents();
  }
}

export function saveAllStudentsProgress(all: Record<string, StudentGameProgress>): void {
  const stripped = JSON.parse(JSON.stringify(all));
  Object.keys(stripped).forEach((username) => {
    const s = stripped[username];
    if (s) {
      if (s.preTestResult) {
        delete s.preTestResult.questionDetails;
      }
      if (s.postTestResult) {
        delete s.postTestResult.questionDetails;
      }
      if (s.completedLevels) {
        Object.keys(s.completedLevels).forEach((lvl) => {
          if (s.completedLevels[lvl]) {
            delete s.completedLevels[lvl].questionDetails;
          }
        });
      }
      // تم إزالة كود مسح الروابط (delete fileUrl) من هنا ليتم حفظ الفيديوهات في السحابة
    }
  });
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(stripped));
  } catch (e) {
    console.error("Failed to save to localStorage, quota exceeded.", e);
  }
}

export function calculateStudentTotalScore(prog: StudentGameProgress): number {
  const completedLevels = prog.completedLevels || {};
  let total = 0;
  Object.values(completedLevels).forEach((lvl) => {
    if (lvl && typeof lvl.score === 'number') {
      total += lvl.score;
    }
  });
  const studentActivities = prog.studentActivities || {};
  Object.entries(studentActivities).forEach(([key, act]) => {
    if (key.includes('_')) {
      const lvlNum = Number(key.split('_')[0]);
      if (!completedLevels[lvlNum] && act && typeof act.grade === 'number') {
        total += act.grade;
      }
    } else {
      const lvlNum = Number(key);
      const hasIndexedKey = Boolean(studentActivities[`${lvlNum}_1`]);
      if (!hasIndexedKey && !completedLevels[lvlNum] && act && typeof act.grade === 'number') {
        total += act.grade;
      }
    }
  });
  return total;
}

export function saveSingleStudentProgress(username: string, prog: StudentGameProgress): void {
  const all = getAllStudentsProgress();
  all[username] = prog;
  saveAllStudentsProgress(all);
}

export function getStudentProgress(username: string): StudentGameProgress {
  const cleanUsername = username.trim();

  if (cleanUsername.toLowerCase() === 'admin') {
    return {
      username: 'admin',
      avatarId: 'avatar-cpbot',
      currentLevel: 9,
      completedLevels: {},
      totalScore: 0,
      hearts: 3,
      badges: [],
      lastActive: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  }

  const all = getAllStudentsProgress();

  if (all[cleanUsername]) {
    const existing = sanitizeStudentProgress(all[cleanUsername], cleanUsername);
    existing.totalScore = calculateStudentTotalScore(existing);
    all[cleanUsername] = existing;
    return existing;
  }

  const avatarIndex =
    Math.abs(cleanUsername.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) %
    CARTOON_AVATARS.length;

  const userGroupCode = getGroupByUsername(cleanUsername)?.code;
  const newProg: StudentGameProgress = {
    username: cleanUsername,
    avatarId: CARTOON_AVATARS[avatarIndex].id,
    currentLevel: getStartingLevelForGroup(userGroupCode),
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  all[cleanUsername] = newProg;
  saveAllStudentsProgress(all);
  return newProg;
}

export function updateStudentAvatar(username: string, avatarId: string): StudentGameProgress {
  const all = getAllStudentsProgress();
  const prog = getStudentProgress(username);
  prog.avatarId = avatarId;
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);
  all[username] = prog;
  saveAllStudentsProgress(all);
  try {
    window.dispatchEvent(new CustomEvent('cp_student_profile_updated', { detail: { username } }));
  } catch {}
  return prog;
}

export function updateStudentCustomPhoto(
  username: string,
  photoUrl: string | null
): StudentGameProgress {
  const all = getAllStudentsProgress();
  const prog = getStudentProgress(username);
  if (photoUrl) {
    prog.customPhotoUrl = photoUrl;
  } else {
    delete prog.customPhotoUrl;
  }
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);
  all[username] = prog;
  saveAllStudentsProgress(all);
  try {
    window.dispatchEvent(new CustomEvent('cp_student_profile_updated', { detail: { username } }));
  } catch {}
  return prog;
}

export function submitLevelChallenge(
  username: string,
  levelNumber: number,
  chosenAnswers: Record<string, number>,
  timeSpentSeconds: number,
  appliedActivityScore: number = 0,
  s1ScoreOverride?: number,
  videoScore: number = 0
): {
  progress: StudentGameProgress;
  levelResult: CompletedLevelResult;
  isImmediateFeedback: boolean;
  scoreGained: number;
} {
  const all = getAllStudentsProgress();
  const prog = getStudentProgress(username);

  const levelDef = GAME_LEVELS_DATA.find((l) => l.levelNumber === levelNumber);
  if (!levelDef) throw new Error('Level not found');

  let scoreGained = 0;
  let q1MaxScore = levelDef.section1Score ?? 100;
  let totalLevelMax = levelDef.totalMaxScore ?? 100;
  const questionScores: Record<string, number> = {};
  const questionDetails: Record<string, any> = {};
  const completedAtStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const totalSec1Score = levelDef.section1Score ?? 50;
  const numQuestions = levelDef.questions.length || 1;
  const defaultPerQuestion = numQuestions === 2 ? 25 : Math.round(totalSec1Score / numQuestions);

  levelDef.questions.forEach((q, idx) => {
    const qPoints = q.points || defaultPerQuestion;
    const chosen = chosenAnswers[q.id];
    const isCorrect = chosen === q.correctIndex;
    if (isCorrect) {
      scoreGained += qPoints;
      questionScores[q.id] = qPoints;
    } else {
      questionScores[q.id] = 0;
    }

    const chosenIdx = chosen ?? -1;
    const chosenText = chosenIdx >= 0 && q.options[chosenIdx]
      ? `${['أ', 'ب', 'ج', 'د', 'هـ'][chosenIdx] || chosenIdx + 1}. ${q.options[chosenIdx]}`
      : 'لم تتم الإجابة';
    const correctText = q.options[q.correctIndex]
      ? `${['أ', 'ب', 'ج', 'د', 'هـ'][q.correctIndex] || (q.correctIndex + 1)}. ${q.options[q.correctIndex]}`
      : '-';

    questionDetails[q.id] = {
      chosenIndex: chosenIdx,
      isCorrect,
      answeredAt: completedAtStr,
      chosenText,
      correctText,
      explanation: q.explanation || 'لا يوجد تفسير إضافي',
      questionText: q.question,
      domain: `المستوى ${levelNumber}: ${levelDef.title}`,
    };
  });

  const actScore = Math.min(50, Math.max(0, appliedActivityScore !== undefined ? appliedActivityScore : 50));
  scoreGained += actScore;
  questionScores['section2_activity'] = actScore;
  questionDetails['section2_activity'] = {
    chosenIndex: actScore > 0 ? 1 : 0,
    isCorrect: actScore > 0,
    answeredAt: completedAtStr,
    chosenText: actScore > 0 ? `تم إنجاز النشاط التطبيقي للمستوى ${levelNumber} بنجاح` : 'قيد الإنجاز',
    correctText: `إنجاز النشاط التطبيقي التفاعلي للمستوى ${levelNumber}`,
    explanation: `النشاط التطبيقي التفاعلي للمستوى ${levelNumber}`,
    questionText: `النشاط التطبيقي التفاعلي للمستوى ${levelNumber}`,
    domain: `المستوى ${levelNumber}: ${levelDef.title}`,
  };

  const groupMeta = getGroupByUsername(username);
  const isImmediate = groupMeta ? groupMeta.feedbackMode === 'فورية' : true;

  const levelResult: CompletedLevelResult = {
    levelNumber,
    score: scoreGained,
    maxScore: totalLevelMax,
    answers: chosenAnswers,
    questionScores,
    questionDetails,
    completedAt: completedAtStr,
    timeSpentSeconds,
    feedbackRevealedToStudent: isImmediate,
  };

  if (username.trim().toLowerCase() === 'admin' || isLevelLockedForGroup(levelNumber, groupMeta?.code)) {
    return {
      progress: prog,
      levelResult,
      isImmediateFeedback: isImmediate,
      scoreGained: 0,
    };
  }

  prog.completedLevels[levelNumber] = levelResult;

  if (groupMeta?.code === 'G1' && prog.studentActivities) {
    [`${levelNumber}_1`, `${levelNumber}_2`, levelNumber].forEach((key) => {
      if (prog.studentActivities[key]) {
        prog.studentActivities[key].status = 'graded';
        prog.studentActivities[key].grade = 50;
        prog.studentActivities[key].feedback = 'معتمد فورياً وتلقائياً (تنافسي فوري)';
        prog.studentActivities[key].gradedBy = 'نظام التنافس الفوري';
        prog.studentActivities[key].gradedAt = new Date().toISOString();
      }
    });
  }

  prog.totalScore = calculateStudentTotalScore(prog);
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const passThreshold = Math.floor(totalLevelMax * 0.5);
  if (scoreGained >= passThreshold) {
    if (levelNumber === prog.currentLevel && levelNumber < 9) {
      prog.currentLevel = levelNumber + 1;
    }
    if (!prog.badges.includes(levelDef.badgeName)) {
      prog.badges.push(levelDef.badgeName);
    }
  }

  const collabGroup = getCollaborativeGroupByUsername(username);
  const isCollabImmediate = groupMeta?.learningMode === 'تعاوني' && groupMeta?.feedbackMode === 'فورية';

  if (isCollabImmediate && collabGroup) {
    const teamDef = COLLABORATIVE_GROUPS_DEF[collabGroup];
    if (teamDef && teamDef.members) {
      teamDef.members.forEach((memberUser) => {
        if (memberUser.toUpperCase() !== username.toUpperCase()) {
          const memberProg = getStudentProgress(memberUser);
          memberProg.completedLevels[levelNumber] = levelResult;
          memberProg.totalScore = calculateStudentTotalScore(memberProg);
          memberProg.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);
          if (scoreGained >= passThreshold) {
            if (levelNumber === memberProg.currentLevel && levelNumber < 9) {
              memberProg.currentLevel = levelNumber + 1;
            }
            if (!memberProg.badges.includes(levelDef.badgeName)) {
              memberProg.badges.push(levelDef.badgeName);
            }
          }
          all[memberUser] = memberProg;
          syncStudentProgressToFirestore(memberProg).catch(() => {});
        }
      });

      try {
        const collabTeamStateKey = 'cp_collab_team_answers_v1';
        const rawTeam = localStorage.getItem(collabTeamStateKey);
        const teamAnswers = rawTeam ? JSON.parse(rawTeam) : {};
        teamAnswers[`${collabGroup}_${levelNumber}`] = {
          completedBy: username,
          completedAt: new Date().toISOString(),
          score: scoreGained,
        };
      try {
        localStorage.setItem(collabTeamStateKey, JSON.stringify(teamAnswers));
      } catch (e) {
        console.warn("Failed to save collab team state:", e);
      }
      } catch {}
    }
  }

  all[username] = prog;
  saveAllStudentsProgress(all);
  syncStudentProgressToFirestore(prog).catch(() => {});

  addActivityLog(
    `حل مستوى حقيقي: الطالب ${username} أتم المستوى ${levelNumber} وحصل على ${scoreGained}/${totalLevelMax} نقطة`,
    username,
    scoreGained >= passThreshold ? 'success' : 'warning'
  );

  return {
    progress: prog,
    levelResult,
    isImmediateFeedback: isImmediate,
    scoreGained,
  };
}

export function saveStudentLevelActivity(
  username: string,
  levelNumber: number,
  submission: import('../types').StudentActivitySubmission
): StudentGameProgress {
  const prog = getStudentProgress(username);

  if (username.trim().toLowerCase() === 'admin') {
    return prog;
  }

  const all = getAllStudentsProgress();
  if (!prog.studentActivities) {
    prog.studentActivities = {};
  }

  const actIdx = submission.activityIndex || 1;
  const actKey = `${levelNumber}_${actIdx}`;
  prog.studentActivities[actKey] = submission;

  if (actIdx === 1) {
    prog.studentActivities[levelNumber] = submission;
  }

  if (prog.completedLevels && prog.completedLevels[levelNumber] && (submission.status === 'graded' || typeof submission.grade === 'number')) {
    const qScores = prog.completedLevels[levelNumber].questionScores || {};
    const act1Grade = prog.studentActivities[`${levelNumber}_1`]?.grade ?? 50;
    const act2Grade = prog.studentActivities[`${levelNumber}_2`]?.grade ?? 50;
    qScores['section1_act1'] = act1Grade;
    qScores['section2_activity'] = act2Grade;
    prog.completedLevels[levelNumber].questionScores = qScores;
    prog.completedLevels[levelNumber].score = (typeof act1Grade === 'number' ? act1Grade : 50) + (typeof act2Grade === 'number' ? act2Grade : 50);
  }

  prog.totalScore = calculateStudentTotalScore(prog);
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);
  all[username] = prog;
  saveAllStudentsProgress(all);
  syncStudentProgressToFirestore(prog).catch(() => {});
  addActivityLog(
    `رفع نشاط خاص: قام الطالب ${username} برفع نشاط المستوى ${levelNumber} (${submission.fileName})`,
    username,
    'success'
  );
  try {
    window.dispatchEvent(
      new CustomEvent('cp_student_activity_uploaded', {
        detail: { username, levelNumber, submission },
      })
    );
  } catch {}
  return prog;
}

export function resetStudentProgress(username: string): StudentGameProgress {
  const cleanUsername = username.trim();
  const all = getAllStudentsProgress();
  const avatarIndex =
    Math.abs(cleanUsername.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) %
    CARTOON_AVATARS.length;

  const currentAvatar = all[cleanUsername]?.avatarId || CARTOON_AVATARS[avatarIndex].id;

  const resetProg: StudentGameProgress = {
    username: cleanUsername,
    avatarId: currentAvatar,
    currentLevel: getStartingLevelForGroup(getGroupByUsername(cleanUsername)?.code),
    completedLevels: {},
    studentActivities: {},
    totalScore: 0,
    hearts: 3,
    badges: ['وسام المستكشف التمهيدي (الاختبار القبلي)'],
    lastActive: 'لم يبدأ بعد (تمت التهيئة)',
    preTestResult: all[cleanUsername]?.preTestResult || getPassingPreTestResultForStudent(cleanUsername),
  };

  all[cleanUsername] = resetProg;
  saveAllStudentsProgress(all);

  try {
    localStorage.removeItem(`cp_pre_index_${cleanUsername}`);
    localStorage.removeItem(`cp_pre_answers_${cleanUsername}`);
    localStorage.removeItem(`cp_pre_started_${cleanUsername}`);
    localStorage.removeItem(`cp_post_index_${cleanUsername}`);
    localStorage.removeItem(`cp_post_answers_${cleanUsername}`);
    localStorage.removeItem(`cp_post_started_${cleanUsername}`);
    localStorage.removeItem(`cp_active_portal_section_${cleanUsername}`);
    for (let lvl = 1; lvl <= 9; lvl++) {
      localStorage.removeItem(`cp_level_${lvl}_answers_${cleanUsername}`);
      localStorage.removeItem(`cp_level_${lvl}_time_${cleanUsername}`);
    }

    const rawSubs = localStorage.getItem('cp_student_activities_submissions_v2');
    if (rawSubs) {
      const parsedSubs = JSON.parse(rawSubs);
      if (Array.isArray(parsedSubs)) {
        const filteredSubs = parsedSubs.filter(
          (s: any) => s.studentUsername?.toLowerCase() !== cleanUsername.toLowerCase()
        );
        localStorage.setItem('cp_student_activities_submissions_v2', JSON.stringify(filteredSubs));
      }
    }

    const rawTeam = localStorage.getItem('cp_collab_team_answers_v1');
    if (rawTeam) {
      const parsedTeam = JSON.parse(rawTeam);
      if (typeof parsedTeam === 'object' && parsedTeam !== null) {
        Object.keys(parsedTeam).forEach((k) => {
          if (parsedTeam[k]?.completedBy?.toLowerCase() === cleanUsername.toLowerCase()) {
            delete parsedTeam[k];
          }
        });
        localStorage.setItem('cp_collab_team_answers_v1', JSON.stringify(parsedTeam));
      }
    }
  } catch {}

  syncStudentProgressToFirestore(resetProg).catch(() => {});

  try {
    window.dispatchEvent(new CustomEvent('cp_student_profile_updated', { detail: { username: cleanUsername } }));
    window.dispatchEvent(new CustomEvent('cp_student_progress_reset', { detail: { username: cleanUsername } }));
  } catch {}

  addActivityLog(
    `تهيئة درجات الطالب: تم إعادة درجات وتقدم الطالب ${cleanUsername} إلى الصفر كأنه لم يجب على أي شيء`,
    'admin',
    'warning'
  );

  return resetProg;
}

export function resetAllStudentsToRealCleanState(): Record<string, StudentGameProgress> {
  const clean = generateCleanRealStudents();
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.warn("Failed to reset game storage in localStorage:", e);
  }

  try {
    localStorage.removeItem('cp_collab_team_answers_v1');
    localStorage.removeItem('cp_student_activities_submissions_v2');
    localStorage.removeItem('cp_students_test_access_audit_v2');
  } catch {}

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('cp_pre_') ||
          key.startsWith('cp_post_') ||
          key.startsWith('cp_active_portal_') ||
          key.startsWith('cp_collab_'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}

  Object.values(clean).forEach((prog) => {
    syncStudentProgressToFirestore(prog).catch(() => {});
  });

  try {
    window.dispatchEvent(new CustomEvent('cp_student_profile_updated', { detail: { all: true } }));
    window.dispatchEvent(new CustomEvent('cp_student_progress_reset', { detail: { all: true } }));
  } catch {}

  addActivityLog('تمت إعادة ضبط وتصفير جميع درجات وإجابات واختبارات الطلاب بالكامل للبدء من الصفر', 'admin', 'warning');
  return clean;
}

export function resetAllLevelsProgressKeepingPreTest(): Record<string, StudentGameProgress> {
  const all = getAllStudentsProgress();
  const keys = Object.keys(all);
  keys.forEach((username) => {
    const prog = all[username];
    const preTestResult = prog.preTestResult;
    
    all[username] = {
      username: prog.username,
      avatarId: prog.avatarId,
      currentLevel: getStartingLevelForGroup(getGroupByUsername(username)?.code),
      completedLevels: {},
      studentActivities: {},
      totalScore: 0,
      hearts: 3,
      badges: [],
      lastActive: new Date().toISOString().replace('T', ' ').substring(0, 19),
      preTestResult: preTestResult,
    };
  });
  
  saveAllStudentsProgress(all);
  
  wipeAllCloudLevelsDataAndResetProgress().catch((err) => {
    console.warn('wipeAllCloudLevelsDataAndResetProgress error:', err);
  });
  
  try {
    window.dispatchEvent(new CustomEvent('cp_student_progress_reset', { detail: { all: true } }));
  } catch {}
  
  addActivityLog('قام المشرف بإعادة تهيئة جميع المستويات والأنشطة للطلاب مع الإبقاء على الاختبار القبلي فقط', 'admin', 'warning');
  return all;
}

function generateCleanRealStudents(): Record<string, StudentGameProgress> {
  const clean: Record<string, StudentGameProgress> = {};
  const groups = ['G1', 'G2', 'G3', 'G4'] as const;

  groups.forEach((grp, grpIdx) => {
    for (let i = 1; i <= 15; i++) {
      const pad = i < 10 ? `0${i}` : `${i}`;
      const uname = `${grp}_Cp_${pad}`;
      const avatar = CARTOON_AVATARS[(i + grpIdx) % CARTOON_AVATARS.length];

      clean[uname] = {
        username: uname,
        avatarId: avatar.id,
        currentLevel: getStartingLevelForGroup(grp),
        completedLevels: {},
        totalScore: 0,
        hearts: 3,
        badges: ['وسام المستكشف التمهيدي (الاختبار القبلي)'],
        lastActive: '2026-10-27 10:30:00',
        preTestResult: getPassingPreTestResultForStudent(uname),
      };
    }
  });

  return clean;
}
