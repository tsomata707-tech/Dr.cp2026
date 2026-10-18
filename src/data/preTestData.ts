import { PreTestQuestion, PreTestResult, StudentGameProgress } from '../types';
import { getAllStudentsProgress, saveAllStudentsProgress } from '../utils/gameStorage';
import { addActivityLog } from '../utils/adminStorage';
import { syncGlobalQuestionsAndLevels } from '../utils/realtimeService';

const PRETEST_QUESTIONS_KEY = 'cp_pretest_questions_bank_v2';
const POSTTEST_QUESTIONS_KEY = 'cp_posttest_questions_bank_v2';

// Tests start completely empty as requested by admin
export const DEFAULT_PRETEST_QUESTIONS: PreTestQuestion[] = [];

export function ensureMatchingQuestionsIntegrity(questions: PreTestQuestion[]): PreTestQuestion[] {
  if (!Array.isArray(questions)) return [];
  return questions;
}

export function getPreTestQuestions(): PreTestQuestion[] {
  try {
    const raw = localStorage.getItem(PRETEST_QUESTIONS_KEY);
    if (!raw) {
      savePreTestQuestions(DEFAULT_PRETEST_QUESTIONS);
      return DEFAULT_PRETEST_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      savePreTestQuestions(DEFAULT_PRETEST_QUESTIONS);
      return DEFAULT_PRETEST_QUESTIONS;
    }
    return ensureMatchingQuestionsIntegrity(parsed);
  } catch {
    return DEFAULT_PRETEST_QUESTIONS;
  }
}

export function savePreTestQuestions(questions: PreTestQuestion[], syncRemote: boolean = true): void {
  try {
    localStorage.setItem(PRETEST_QUESTIONS_KEY, JSON.stringify(questions));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pretest-questions-updated', { detail: questions }));
    }
  } catch (e) {
    console.warn('localStorage savePreTestQuestions error:', e);
  }
  if (syncRemote) {
    syncGlobalQuestionsAndLevels('pretest', questions).catch(() => {});
  }
}

export function resetPreTestQuestionsToDefault(): PreTestQuestion[] {
  savePreTestQuestions(DEFAULT_PRETEST_QUESTIONS, true);
  return DEFAULT_PRETEST_QUESTIONS;
}

export function submitPreTestResult(
  username: string,
  chosenAnswers: Record<string, number>,
  timeSpentSeconds: number
): {
  progress: StudentGameProgress;
  result: PreTestResult;
} {
  const all = getAllStudentsProgress();
  const prog = all[username] || {
    username,
    avatarId: 'avatar-cpbot',
    currentLevel: 1,
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: new Date().toISOString(),
  };

  const questions = getPreTestQuestions();
  let score = 0;
  let maxScore = 0;

  questions.forEach((q) => {
    maxScore += q.points;
    if (chosenAnswers[q.id] === q.correctIndex) {
      score += q.points;
    }
  });

  const passed = maxScore === 0 ? true : score >= Math.floor(maxScore * 0.4);

  const result: PreTestResult = {
    completed: true,
    score,
    maxScore,
    answers: chosenAnswers,
    completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    timeSpentSeconds,
    passed,
  };

  prog.preTestResult = result;
  const badgeName = 'وسام المستكشف التمهيدي (الاختبار القبلي)';
  if (!prog.badges.includes(badgeName)) {
    prog.badges.push(badgeName);
  }
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  all[username] = prog;
  saveAllStudentsProgress(all);

  addActivityLog(
    `إتمام الاختبار القبلي: أنهى الطالب ${username} الاختبار القبلي وحصد ${score}/${maxScore} نقطة (محفوظ للأدمن فقط)`,
    username,
    'success'
  );

  return { progress: prog, result };
}

export function getPostTestQuestions(): PreTestQuestion[] {
  try {
    const raw = localStorage.getItem(POSTTEST_QUESTIONS_KEY);
    if (!raw) {
      savePostTestQuestions(DEFAULT_PRETEST_QUESTIONS, false);
      return DEFAULT_PRETEST_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      savePostTestQuestions(DEFAULT_PRETEST_QUESTIONS, false);
      return DEFAULT_PRETEST_QUESTIONS;
    }
    return ensureMatchingQuestionsIntegrity(parsed);
  } catch {
    return DEFAULT_PRETEST_QUESTIONS;
  }
}

export function savePostTestQuestions(questions: PreTestQuestion[], syncRemote: boolean = true): void {
  try {
    localStorage.setItem(POSTTEST_QUESTIONS_KEY, JSON.stringify(questions));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('posttest-questions-updated', { detail: questions }));
    }
  } catch (e) {
    console.warn('localStorage savePostTestQuestions error:', e);
  }
  if (syncRemote) {
    syncGlobalQuestionsAndLevels('posttest', questions).catch(() => {});
  }
}

export function resetPostTestQuestionsToDefault(): PreTestQuestion[] {
  savePostTestQuestions(DEFAULT_PRETEST_QUESTIONS);
  return DEFAULT_PRETEST_QUESTIONS;
}

export function submitPostTestResult(
  username: string,
  chosenAnswers: Record<string, number>,
  timeSpentSeconds: number
): {
  progress: StudentGameProgress;
  result: PreTestResult;
} {
  const all = getAllStudentsProgress();
  const prog = all[username] || {
    username,
    avatarId: 'avatar-cpbot',
    currentLevel: 1,
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: new Date().toISOString(),
  };

  const questions = getPostTestQuestions();
  let score = 0;
  let maxScore = 0;

  questions.forEach((q) => {
    maxScore += q.points;
    if (chosenAnswers[q.id] === q.correctIndex) {
      score += q.points;
    }
  });

  const passed = maxScore === 0 ? true : score >= Math.floor(maxScore * 0.5);

  const result: PreTestResult = {
    completed: true,
    score,
    maxScore,
    answers: chosenAnswers,
    completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    timeSpentSeconds,
    passed,
  };

  prog.postTestResult = result;
  prog.totalScore += score;
  const badgeName = 'وسام الإتقان والختام (الاختبار البعدي)';
  if (!prog.badges.includes(badgeName)) {
    prog.badges.push(badgeName);
  }
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  all[username] = prog;
  saveAllStudentsProgress(all);

  addActivityLog(
    `إتمام الاختبار البعدي: أنهى الطالب ${username} الاختبار البعدي وحصد ${score}/${maxScore} نقطة (معلن للطالب)`,
    username,
    'success'
  );

  return { progress: prog, result };
}
