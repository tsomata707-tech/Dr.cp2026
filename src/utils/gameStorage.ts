import { StudentGameProgress, CompletedLevelResult } from '../types';
import { GAME_LEVELS_DATA, CARTOON_AVATARS } from '../data/gameLevelsData';
import { getGroupByUsername, getCollaborativeGroupByUsername, COLLABORATIVE_GROUPS_DEF } from '../data/studentAccounts';
import { addActivityLog } from './adminStorage';
import { syncStudentProgressToFirestore } from './realtimeService';

const GAME_STORAGE_KEY = 'cp_real_game_progress_v4';

export function sanitizeStudentProgress(prog: Partial<StudentGameProgress>, username: string): StudentGameProgress {
  const cleanUsername = username.trim();
  const avatarIndex =
    Math.abs(cleanUsername.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) %
    CARTOON_AVATARS.length;

  const sanitized: StudentGameProgress = {
    username: cleanUsername,
    avatarId: prog.avatarId || CARTOON_AVATARS[avatarIndex].id,
    customPhotoUrl: prog.customPhotoUrl,
    currentLevel: typeof prog.currentLevel === 'number' && prog.currentLevel >= 1 ? prog.currentLevel : 1,
    completedLevels: prog.completedLevels && typeof prog.completedLevels === 'object' ? prog.completedLevels : {},
    totalScore: typeof prog.totalScore === 'number' ? prog.totalScore : 0,
    hearts: typeof prog.hearts === 'number' ? prog.hearts : 3,
    badges: Array.isArray(prog.badges) ? prog.badges : [],
    lastActive: prog.lastActive || 'لم يسجل الدخول بعد',
    preTestResult: prog.preTestResult,
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
      if (s.studentActivities) {
        Object.keys(s.studentActivities).forEach((lvlNum) => {
          if (s.studentActivities[lvlNum]) {
            // Strip huge base64 strings for localStorage
            delete s.studentActivities[lvlNum].fileUrl;
          }
        });
      }
    }
  });
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(stripped));
  } catch (e) {
    console.error("Failed to save to localStorage, quota exceeded.", e);
  }
}

export function calculateStudentTotalScore(prog: StudentGameProgress): number {
  const levelsScore = Object.values(prog.completedLevels || {}).reduce(
    (acc, lvl) => acc + (lvl?.score || 0),
    0
  );
  const activitiesScore = Object.values(prog.studentActivities || {}).reduce(
    (acc, act) => acc + (act?.grade || 0),
    0
  );
  return levelsScore + activitiesScore;
}

export function saveSingleStudentProgress(username: string, prog: StudentGameProgress): void {
  const all = getAllStudentsProgress();
  all[username] = prog;
  saveAllStudentsProgress(all);
}

export function getStudentProgress(username: string): StudentGameProgress {
  const cleanUsername = username.trim();

  // Special Read-Only Administrator Profile: full read access to all 9 levels, no saving/mutations
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

  // Assign a default cartoon avatar based on username hash
  const avatarIndex =
    Math.abs(cleanUsername.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) %
    CARTOON_AVATARS.length;

  const newProg: StudentGameProgress = {
    username: cleanUsername,
    avatarId: CARTOON_AVATARS[avatarIndex].id,
    currentLevel: 1,
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
  } catch {
    // Ignore
  }
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
  } catch {
    // Ignore
  }
  return prog;
}

export function submitLevelChallenge(
  username: string,
  levelNumber: number,
  chosenAnswers: Record<string, number>, // questionId -> chosen option index
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
  if (!levelDef) {
    throw new Error('Level not found');
  }

  // Calculate real score based on actual student answers
  let scoreGained = 0;
  let q1MaxScore = levelDef.section1Score ?? (levelDef.questions[0]?.points || 25);
  let totalLevelMax = levelDef.totalMaxScore ?? (q1MaxScore + (levelDef.section2Score ?? 25));
  const questionScores: Record<string, number> = {};
  const questionDetails: Record<string, any> = {};
  const completedAtStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Score Question 1 (or all questions if answered)
  levelDef.questions.forEach((q, idx) => {
    const qPoints = idx === 0 ? (levelDef.section1Score ?? q.points ?? 25) : q.points;
    const chosen = chosenAnswers[q.id];
    const isCorrect = chosen === q.correctIndex;
    if (isCorrect) {
      const actualScore = (idx === 0 && s1ScoreOverride !== undefined) ? s1ScoreOverride : qPoints;
      scoreGained += actualScore;
      questionScores[q.id] = actualScore;
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

  // Add applied activity score from Section 2
  const actScore = Math.min(levelDef.section2Score ?? 25, Math.max(0, appliedActivityScore));
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

  // Add video score (Level 1 only usually, but supported for all)
  if (videoScore > 0 || levelNumber === 1) {
    scoreGained += videoScore;
    questionScores['video_watch'] = videoScore;
    questionDetails['video_watch'] = {
      chosenIndex: videoScore >= 25 ? 1 : 0,
      isCorrect: videoScore > 0,
      answeredAt: completedAtStr,
      chosenText: videoScore >= 25 ? 'تمت مشاهدة الفيديو بالكامل دون تقديم أو تأخير' : `تمت مشاهدة الفيديو مع تقديم/تأخير (الدرجة: ${videoScore})`,
      correctText: 'مشاهدة الفيديو التعليمي كاملاً دون تخطي',
      explanation: 'الالتزام بمشاهدة الفيديو التعليمي يمنحك الدرجة الكاملة.',
      questionText: 'مشاهدة الفيديو التعليمي للمستوى',
      domain: `المستوى ${levelNumber}: ${levelDef.title}`,
    };
  }

  // Determine feedback mode from group:
  // G1 (فوري) & G3 (فوري) -> immediate feedback to student
  // G2 (مرجأ) & G4 (مرجأ) -> deferred feedback
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

  // For admin user (Read-only mode): do not commit answers, do not save scores, do not modify database
  if (username.trim().toLowerCase() === 'admin') {
    return {
      progress: prog,
      levelResult,
      isImmediateFeedback: isImmediate,
      scoreGained: 0,
    };
  }

  // Record this level permanently
  prog.completedLevels[levelNumber] = levelResult;
  prog.totalScore = calculateStudentTotalScore(prog);
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Advance level if passed (1 up to 9)
  const passThreshold = Math.floor(totalLevelMax * 0.5); // 50% pass rate
  if (scoreGained >= passThreshold) {
    if (levelNumber === prog.currentLevel && levelNumber < 9) {
      prog.currentLevel = levelNumber + 1;
    }
    // Award badge
    if (!prog.badges.includes(levelDef.badgeName)) {
      prog.badges.push(levelDef.badgeName);
    }
  }

  // Collaborative immediate group sync: if user belongs to sub-group A, B, C, D, or E in G3 collaborative immediate
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

  // Admin user: read-only, do not persist activity submissions
  if (username.trim().toLowerCase() === 'admin') {
    return prog;
  }

  const all = getAllStudentsProgress();
  if (!prog.studentActivities) {
    prog.studentActivities = {};
  }
  prog.studentActivities[levelNumber] = submission;
  // Recalculate totalScore: only includes grades if admin has graded it (act.grade > 0)
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
  } catch {
    // Ignore
  }
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
    currentLevel: 1,
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: 'لم يبدأ بعد (تمت التهيئة)',
  };

  all[cleanUsername] = resetProg;
  saveAllStudentsProgress(all);

  // Clear all in-progress test answer storage and cached views for this student
  try {
    localStorage.removeItem(`cp_pre_index_${cleanUsername}`);
    localStorage.removeItem(`cp_pre_answers_${cleanUsername}`);
    localStorage.removeItem(`cp_pre_started_${cleanUsername}`);
    localStorage.removeItem(`cp_post_index_${cleanUsername}`);
    localStorage.removeItem(`cp_post_answers_${cleanUsername}`);
    localStorage.removeItem(`cp_post_started_${cleanUsername}`);
    localStorage.removeItem(`cp_active_portal_section_${cleanUsername}`);
  } catch {
    // Ignore
  }

  // Sync to Firebase RTDB
  syncStudentProgressToFirestore(resetProg).catch(() => {});

  // Dispatch global window events so all active components re-render immediately
  try {
    window.dispatchEvent(new CustomEvent('cp_student_profile_updated', { detail: { username: cleanUsername } }));
    window.dispatchEvent(new CustomEvent('cp_student_progress_reset', { detail: { username: cleanUsername } }));
  } catch {
    // Ignore
  }

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

  // Clear global collaborative team answers & student activity submissions & test access audits
  try {
    localStorage.removeItem('cp_collab_team_answers_v1');
    localStorage.removeItem('cp_student_activities_submissions_v2');
    localStorage.removeItem('cp_students_test_access_audit_v2');
  } catch {}

  // Remove all test timer, question answer, started, and index keys from localStorage
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

  // Sync each student clean initial state (0 score, 0 answers, 0 results) to Firebase RTDB
  Object.values(clean).forEach((prog) => {
    syncStudentProgressToFirestore(prog).catch(() => {});
  });

  try {
    window.dispatchEvent(new CustomEvent('cp_student_profile_updated', { detail: { all: true } }));
    window.dispatchEvent(new CustomEvent('cp_student_progress_reset', { detail: { all: true } }));
  } catch {
    // Ignore
  }

  addActivityLog('تمت إعادة ضبط وتصفير جميع درجات وإجابات واختبارات الطلاب بالكامل للبدء من الصفر', 'admin', 'warning');
  return clean;
}

// Generates clean real initial state for all 60 students (0 answered questions, 0 scores)
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
        currentLevel: 1,
        completedLevels: {},
        totalScore: 0,
        hearts: 3,
        badges: [],
        lastActive: 'لم يسجل الدخول بعد',
      };
    }
  });

  return clean;
}
