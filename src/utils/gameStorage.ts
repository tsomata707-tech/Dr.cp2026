import { StudentGameProgress, CompletedLevelResult } from '../types';
import { GAME_LEVELS_DATA, CARTOON_AVATARS } from '../data/gameLevelsData';
import { getGroupByUsername } from '../data/studentAccounts';
import { addActivityLog } from './adminStorage';
import { syncStudentProgressToFirestore } from './realtimeService';

const GAME_STORAGE_KEY = 'cp_real_game_progress_v4';

export function getAllStudentsProgress(): Record<string, StudentGameProgress> {
  try {
    const raw = localStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) {
      const cleanReal = generateCleanRealStudents();
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(cleanReal));
      return cleanReal;
    }
    return JSON.parse(raw);
  } catch {
    return generateCleanRealStudents();
  }
}

export function saveAllStudentsProgress(all: Record<string, StudentGameProgress>): void {
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(all));
}

export function getStudentProgress(username: string): StudentGameProgress {
  const all = getAllStudentsProgress();
  const cleanUsername = username.trim();

  if (all[cleanUsername]) {
    const existing = all[cleanUsername];
    if (existing.completedLevels && Object.keys(existing.completedLevels).length > 0) {
      existing.totalScore = Object.values(existing.completedLevels).reduce(
        (acc, lvl) => acc + (lvl.score || 0),
        0
      );
    }
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
  timeSpentSeconds: number
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
  let maxScore = 0;

  levelDef.questions.forEach((q) => {
    maxScore += q.points;
    if (chosenAnswers[q.id] === q.correctIndex) {
      scoreGained += q.points;
    }
  });

  // Determine feedback mode from group:
  // G1 (فوري) & G3 (فوري) -> immediate feedback to student
  // G2 (مرجأ) & G4 (مرجأ) -> deferred feedback
  const groupMeta = getGroupByUsername(username);
  const isImmediate = groupMeta ? groupMeta.feedbackMode === 'فورية' : true;

  const levelResult: CompletedLevelResult = {
    levelNumber,
    score: scoreGained,
    maxScore,
    answers: chosenAnswers,
    completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    timeSpentSeconds,
    feedbackRevealedToStudent: isImmediate,
  };

  // Record this level permanently
  prog.completedLevels[levelNumber] = levelResult;
  prog.totalScore = Object.values(prog.completedLevels).reduce(
    (acc, lvl) => acc + (lvl.score || 0),
    0
  );
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Advance level if passed (1 up to 9)
  const passThreshold = Math.floor(maxScore * 0.5); // 50% pass rate
  if (scoreGained >= passThreshold) {
    if (levelNumber === prog.currentLevel && levelNumber < 9) {
      prog.currentLevel = levelNumber + 1;
    }
    // Award badge
    if (!prog.badges.includes(levelDef.badgeName)) {
      prog.badges.push(levelDef.badgeName);
    }
  }

  all[username] = prog;
  saveAllStudentsProgress(all);
  syncStudentProgressToFirestore(prog).catch(() => {});

  addActivityLog(
    `حل مستوى حقيقي: الطالب ${username} أتم المستوى ${levelNumber} وحصل على ${scoreGained}/${maxScore} نقطة`,
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
  const all = getAllStudentsProgress();
  const prog = getStudentProgress(username);
  if (!prog.studentActivities) {
    prog.studentActivities = {};
  }
  prog.studentActivities[levelNumber] = submission;
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
  const all = getAllStudentsProgress();
  const avatarIndex =
    Math.abs(username.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) %
    CARTOON_AVATARS.length;

  const resetProg: StudentGameProgress = {
    username,
    avatarId: CARTOON_AVATARS[avatarIndex].id,
    currentLevel: 1,
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  all[username] = resetProg;
  saveAllStudentsProgress(all);
  addActivityLog(`إعادة تعيين تقدم اللعبة للطالب: ${username}`, 'المشرف', 'warning');
  return resetProg;
}

export function resetAllStudentsToRealCleanState(): Record<string, StudentGameProgress> {
  const clean = generateCleanRealStudents();
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(clean));
  addActivityLog('تم مسح البيانات الوهمية وتعيين البيانات الحقيقية النظيفة لكافة الطلاب', 'المشرف', 'warning');
  return clean;
}

// Generates clean real initial state for all 60 students (0 mock data, 0 fake scores)
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
