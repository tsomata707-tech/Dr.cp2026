import {
  ref,
  onValue,
  set as rtdbSet,
  update as rtdbUpdate,
  get as rtdbGet,
} from 'firebase/database';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { rtdb, db } from '../firebase';
import {
  GroupRoomState,
  RealtimeQuestionAnswer,
  RealtimeVote,
  RealtimeStudentParticipant,
  LiveRoomEvent,
  StudentGameProgress,
  CompletedLevelResult,
} from '../types';
import { GAME_LEVELS_DATA } from '../data/gameLevelsData';
import { getGroupByUsername } from '../data/studentAccounts';

// Default initial state for a group room
export const getDefaultRoomState = (groupId: string): GroupRoomState => ({
  groupId,
  activeLevel: 1,
  currentAnswers: {},
  votes: {},
  activeStudents: {},
  completedLevels: {},
  liveEvents: [
    {
      id: 'init-1',
      text: `بدأت الغرفة التفاعلية اللحظية للمجموعة ${groupId}`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      type: 'info',
    },
  ],
  lastUpdatedAt: new Date().toISOString(),
});

/**
 * Diagnostics & Live Connection Status for Firebase
 */
export interface FirebaseConnectionDiagnostics {
  status: 'connected' | 'checking' | 'error';
  projectId: string;
  databaseUrl: string;
  rtdbConnected: boolean;
  pingMs: number;
  lastChecked: string;
  writeTestSuccess: boolean;
  errorDetails?: string;
}

/**
 * Run real-time diagnostic test to verify Firebase online connection right now!
 */
export const runFirebaseDiagnostics = async (): Promise<FirebaseConnectionDiagnostics> => {
  const start = Date.now();
  try {
    const testRef = ref(rtdb, 'system/onlineTest');
    const nowIso = new Date().toISOString();
    await rtdbSet(testRef, {
      test: 'ping',
      clientTime: nowIso,
      timestamp: Date.now(),
    });
    const snap = await rtdbGet(testRef);
    const pingMs = Date.now() - start;
    const val = snap.val();

    return {
      status: 'connected',
      projectId: 'new-project-56330',
      databaseUrl: 'https://new-project-56330-default-rtdb.firebaseio.com',
      rtdbConnected: true,
      pingMs,
      lastChecked: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      writeTestSuccess: !!val?.test,
    };
  } catch (error: any) {
    return {
      status: 'error',
      projectId: 'new-project-56330',
      databaseUrl: 'https://new-project-56330-default-rtdb.firebaseio.com',
      rtdbConnected: false,
      pingMs: Date.now() - start,
      lastChecked: new Date().toLocaleTimeString('ar-EG'),
      writeTestSuccess: false,
      errorDetails: error?.message || 'تعذر الاتصال بقاعدة البيانات',
    };
  }
};

/**
 * Listen to live Firebase connection state via .info/connected
 */
export const subscribeToFirebaseOnlineStatus = (
  onStatusChange: (isOnline: boolean) => void
): (() => void) => {
  try {
    const connectedRef = ref(rtdb, '.info/connected');
    const unsubscribe = onValue(
      connectedRef,
      (snap) => {
        onStatusChange(!!snap.val());
      },
      (err) => {
        console.warn('Firebase connection listener warning:', err);
        onStatusChange(false);
      }
    );
    return unsubscribe;
  } catch {
    onStatusChange(false);
    return () => {};
  }
};

/**
 * Real-time listener for a collaborative group room.
 * Updates instantly whenever any of the 15 students clicks or answers!
 */
export const subscribeToGroupRoom = (
  groupId: string,
  onUpdate: (room: GroupRoomState) => void
): (() => void) => {
  try {
    const roomRef = ref(rtdb, `groupRooms/${groupId}`);
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val() as GroupRoomState;
          onUpdate({
            ...getDefaultRoomState(groupId),
            ...data,
            groupId,
          });
        } else {
          const initialState = getDefaultRoomState(groupId);
          rtdbSet(roomRef, initialState).catch(() => {});
          onUpdate(initialState);
        }
      },
      (error) => {
        console.warn(`RTDB groupRooms listener error, falling back to local:`, error);
        onUpdate(getDefaultRoomState(groupId));
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Realtime subscription initialization error:', err);
    return () => {};
  }
};

/**
 * Join group room and broadcast presence to all students
 */
export const joinGroupRoom = async (
  groupId: string,
  student: {
    username: string;
    fullName: string;
    avatarEmoji: string;
    avatarId: string;
  }
) => {
  const newParticipant: RealtimeStudentParticipant = {
    username: student.username,
    fullName: student.fullName,
    avatarEmoji: student.avatarEmoji,
    avatarId: student.avatarId,
    joinedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    lastPing: Date.now(),
    isOnline: true,
  };

  const newEvent: LiveRoomEvent = {
    id: `join-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    text: `${student.fullName} (${student.avatarEmoji}) انضم إلى الجلسة التفاعلية الحية`,
    time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    type: 'join',
    actorName: student.fullName,
    actorEmoji: student.avatarEmoji,
  };

  try {
    const participantRef = ref(rtdb, `groupRooms/${groupId}/activeStudents/${student.username}`);
    await rtdbSet(participantRef, newParticipant);

    const roomSnap = await rtdbGet(ref(rtdb, `groupRooms/${groupId}/liveEvents`));
    const currentEvents: LiveRoomEvent[] = roomSnap.exists() ? roomSnap.val() || [] : [];
    const updatedEvents = [newEvent, ...currentEvents].slice(0, 30);
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/liveEvents`), updatedEvents);
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/lastUpdatedAt`), new Date().toISOString());
  } catch (err) {
    console.error('Failed to join group room in RTDB:', err);
  }
};

/**
 * When a student selects an option in real-time, broadcast it instantly to all students!
 */
export const selectQuestionOptionRealtime = async (
  groupId: string,
  levelNumber: number,
  questionId: string,
  optionIndex: number,
  student: {
    username: string;
    fullName: string;
    avatarEmoji: string;
  }
) => {
  // Read-only admin check: never broadcast or store admin selections
  if (student.username.toLowerCase() === 'admin') {
    return;
  }

  const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const newAnswer: RealtimeQuestionAnswer = {
    selectedOption: optionIndex,
    selectedBy: student.username,
    studentName: student.fullName,
    avatarEmoji: student.avatarEmoji,
    updatedAt: timeStr,
  };

  const newVote: RealtimeVote = {
    username: student.username,
    studentName: student.fullName,
    avatarEmoji: student.avatarEmoji,
    optionIndex,
  };

  const optionLetters = ['أ', 'ب', 'ج', 'د'];
  const newEvent: LiveRoomEvent = {
    id: `ans-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    text: `${student.fullName} ${student.avatarEmoji} اختار الإجابة (${optionLetters[optionIndex] || optionIndex + 1})`,
    time: timeStr,
    type: 'answer',
    actorName: student.fullName,
    actorEmoji: student.avatarEmoji,
  };

  try {
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/currentAnswers/${questionId}`), newAnswer);
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/votes/${questionId}/${student.username}`), newVote);

    const roomSnap = await rtdbGet(ref(rtdb, `groupRooms/${groupId}/liveEvents`));
    const currentEvents: LiveRoomEvent[] = roomSnap.exists() ? roomSnap.val() || [] : [];
    const updatedEvents = [newEvent, ...currentEvents].slice(0, 30);
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/liveEvents`), updatedEvents);
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/lastUpdatedAt`), new Date().toISOString());
  } catch (error) {
    console.error('Failed to update realtime question answer in RTDB:', error);
  }
};

/**
 * Submit level challenge collaboratively in real-time.
 * Locks the level, saves the score, moves to next level, and syncs progress for all!
 */
export const submitGroupLevelRealtime = async (
  groupId: string,
  levelNumber: number,
  answers: Record<string, number>,
  submittedBy: {
    username: string;
    fullName: string;
    avatarEmoji: string;
  }
): Promise<{
  levelResult: CompletedLevelResult;
  isImmediateFeedback: boolean;
}> => {
  const levelDef = GAME_LEVELS_DATA.find((l) => l.levelNumber === levelNumber) || GAME_LEVELS_DATA[0];
  const userGroupMeta = getGroupByUsername(submittedBy.username);
  const isImmediateFeedback = userGroupMeta ? userGroupMeta.feedbackMode === 'فورية' : true;

  let score = 0;
  levelDef.questions.forEach((q) => {
    if (answers[q.id] === q.correctIndex) {
      score += q.points;
    }
  });

  const levelResult: CompletedLevelResult = {
    levelNumber,
    score,
    maxScore: levelDef.questions.length * 50,
    answers,
    completedAt: new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    timeSpentSeconds: 60,
    feedbackRevealedToStudent: isImmediateFeedback,
  };

  // Read-only admin check: never submit or overwrite group state in RTDB
  if (submittedBy.username.toLowerCase() === 'admin') {
    return { levelResult, isImmediateFeedback };
  }

  try {
    const nextLevel = Math.min(10, levelNumber + 1);

    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/completedLevels/${levelNumber}`), levelResult);
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/activeLevel`), nextLevel);
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/currentAnswers`), {});
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/votes`), {});
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/lastUpdatedAt`), new Date().toISOString());

    const newEvent: LiveRoomEvent = {
      id: `submit-${Date.now()}`,
      text: `🔒 تم اعتماد المستوى ${levelNumber} وإغلاقه بنجاح بواسطة ${submittedBy.fullName} (${submittedBy.avatarEmoji})`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      type: 'submit',
      actorName: submittedBy.fullName,
      actorEmoji: submittedBy.avatarEmoji,
    };

    const roomSnap = await rtdbGet(ref(rtdb, `groupRooms/${groupId}/liveEvents`));
    const currentEvents: LiveRoomEvent[] = roomSnap.exists() ? roomSnap.val() || [] : [];
    await rtdbSet(ref(rtdb, `groupRooms/${groupId}/liveEvents`), [newEvent, ...currentEvents].slice(0, 30));

    // Also update individual student progress in Firebase RTDB
    const studentSnap = await rtdbGet(ref(rtdb, `studentsProgress/${submittedBy.username}`));
    let totalScore = score;
    let completedLevels: Record<number, CompletedLevelResult> = { [levelNumber]: levelResult };
    let badges: string[] = [levelDef.badgeName];

    if (studentSnap.exists()) {
      const existing = studentSnap.val() as StudentGameProgress;
      completedLevels = { ...(existing.completedLevels || {}), [levelNumber]: levelResult };
      totalScore = Object.values(completedLevels).reduce((acc, l) => acc + l.score, 0);
      badges = Array.from(new Set([...(existing.badges || []), levelDef.badgeName]));
    }

    const updatedProgress: StudentGameProgress = {
      username: submittedBy.username,
      avatarId: 'cp-bot',
      currentLevel: nextLevel,
      completedLevels,
      totalScore,
      hearts: 3,
      badges,
      lastActive: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    await rtdbSet(ref(rtdb, `studentsProgress/${submittedBy.username}`), updatedProgress);
  } catch (error) {
    console.error('Failed to submit level challenge to RTDB:', error);
  }

  return { levelResult, isImmediateFeedback };
};

export function sanitizeData(data: any): any {
  if (data === undefined) return null;
  if (data === null) return null;
  if (Array.isArray(data)) return data.map(val => (val === undefined ? null : sanitizeData(val)));
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const val = data[key];
        if (val !== undefined) {
          sanitized[key] = sanitizeData(val);
        }
      }
    }
    return sanitized;
  }
  return data;
}

/**
 * Sync individual student progress to Firebase Realtime Database
 */
export const syncStudentProgressToFirestore = async (progress: StudentGameProgress) => {
  // Read-only admin check: never sync admin to studentsProgress in RTDB
  if (progress.username.toLowerCase() === 'admin') {
    return;
  }

  try {
    await rtdbSet(ref(rtdb, `studentsProgress/${progress.username}`), sanitizeData(progress));
  } catch (error) {
    console.error('Failed to sync student progress to Firebase:', error);
  }
};

/**
 * Subscribe to a single student's progress for cross-device sync
 */
export const subscribeToStudentProgress = (
  username: string,
  onUpdate: (prog: StudentGameProgress | null) => void
): (() => void) => {
  try {
    const studentRef = ref(rtdb, `studentsProgress/${username}`);
    const unsubscribe = onValue(
      studentRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.val() as StudentGameProgress);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.warn(`Error listening to student progress (${username}):`, error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
};

/**
 * Subscribe to all students progress for live analytics in RTDB
 */
export const subscribeToAllStudentsProgress = (
  onUpdate: (map: Record<string, StudentGameProgress>) => void
): (() => void) => {
  try {
    const studentsRef = ref(rtdb, 'studentsProgress');
    const unsubscribe = onValue(
      studentsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, StudentGameProgress>;
          onUpdate(data || {});
        } else {
          onUpdate({});
        }
      },
      (error) => {
        console.warn('Error listening to all students progress in RTDB:', error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
};

/**
 * One-shot direct fetch of all student progress from Firebase Realtime Database
 */
export const fetchAllStudentsProgressFromCloud = async (): Promise<Record<string, StudentGameProgress>> => {
  try {
    const studentsRef = ref(rtdb, 'studentsProgress');
    const snapshot = await rtdbGet(studentsRef);
    if (snapshot.exists()) {
      return (snapshot.val() as Record<string, StudentGameProgress>) || {};
    }
    return {};
  } catch (err) {
    console.warn('Failed to fetch studentsProgress from RTDB:', err);
    return {};
  }
};

export const fetchStudentProgressFromCloud = async (username: string): Promise<StudentGameProgress | null> => {
  try {
    const studentRef = ref(rtdb, `studentsProgress/${username}`);
    const snapshot = await rtdbGet(studentRef);
    if (snapshot.exists()) {
      return snapshot.val() as StudentGameProgress;
    }
    return null;
  } catch (err) {
    console.warn(`Failed to fetch progress for ${username} from RTDB:`, err);
    return null;
  }
};

/**
 * One-shot direct fetch of all student login audits from Firebase Realtime Database
 */
export const fetchAllLoginsAuditFromCloud = async (): Promise<Record<string, any>> => {
  try {
    const auditRef = ref(rtdb, 'studentsLoginsAudit');
    const snapshot = await rtdbGet(auditRef);
    if (snapshot.exists()) {
      return snapshot.val() || {};
    }
    return {};
  } catch (err) {
    console.warn('Failed to fetch studentsLoginsAudit from RTDB:', err);
    return {};
  }
};

/**
 * One-shot direct fetch of all student test access audits from Firebase Realtime Database
 */
export const fetchAllTestAccessAuditFromCloud = async (): Promise<Record<string, Record<string, any>>> => {
  try {
    const auditRef = ref(rtdb, 'studentsTestAccessAudit');
    const snapshot = await rtdbGet(auditRef);
    if (snapshot.exists()) {
      return snapshot.val() || {};
    }
    return {};
  } catch (err) {
    console.warn('Failed to fetch studentsTestAccessAudit from RTDB:', err);
    return {};
  }
};

/**
 * Sync global question banks and level definitions to Firebase RTDB for instant real-time updates across all students
 */
export type GlobalSyncType = 'pretest' | 'posttest' | 'levels' | 'instructions' | 'splash' | 'supervisors' | 'siteTitle' | 'users';



export async function syncGlobalQuestionsAndLevels(type: GlobalSyncType, data: any) {
  try {
    const sanitizedData = sanitizeData(data);
    await rtdbSet(ref(rtdb, `globalSettings/${type}`), sanitizedData);
  } catch (err) {
    console.error(`Failed to sync ${type} to Firebase RTDB:`, err);
  }
}

/**
 * Real-time listener for global question banks, levels, and admin configurations
 */
export function subscribeToGlobalData(
  type: GlobalSyncType,
  onUpdate: (data: any) => void
): () => void {
  try {
    const dataRef = ref(rtdb, `globalSettings/${type}`);
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            onUpdate(snapshot.val());
          }
        } catch (err) {
          console.warn(`Error handling globalSettings/${type} update:`, err);
        }
      },
      (error) => {
        console.warn(`RTDB globalSettings/${type} subscription notice:`, error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`Failed to initialize subscription to globalSettings/${type}:`, err);
    return () => {};
  }
}

/**
 * Sync student real login audit record to Firebase Realtime Database
 */
export async function syncStudentLoginAuditToRTDB(username: string, record: any): Promise<void> {
  try {
    await rtdbSet(ref(rtdb, `studentsLoginsAudit/${username}`), record);
  } catch (err) {
    console.warn(`Failed to sync student login audit for ${username} to RTDB:`, err);
  }
}

/**
 * Real-time listener for students real logins audit
 */
export function subscribeToStudentsLoginsAudit(
  onUpdate: (map: Record<string, any>) => void
): () => void {
  try {
    const auditRef = ref(rtdb, 'studentsLoginsAudit');
    const unsubscribe = onValue(
      auditRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            onUpdate(snapshot.val() || {});
          } else {
            onUpdate({});
          }
        } catch (err) {
          console.warn('Error handling studentsLoginsAudit update:', err);
        }
      },
      (error) => {
        console.warn('RTDB studentsLoginsAudit notice:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to initialize subscription to studentsLoginsAudit:', err);
    return () => {};
  }
}

/**
 * Collab Chat Message schema
 */
export interface CollabChatMessage {
  id: string;
  sender: string;
  role: 'student' | 'admin';
  text: string;
  timestamp: string;
  createdAt: number;
}

export interface CollabNotificationEvent {
  id: string;
  groupCode: string;
  sender: string;
  role: 'student' | 'admin';
  text: string;
  timestamp: string;
  createdAt: number;
}

/**
 * Web Audio notification chime (two-tone pleasant bell)
 */
export function playCollabNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.12); // E6
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // Audio context may require user interaction in some browsers
  }
}

/**
 * Real-time listener for Collaborative Group Chat messages in Firebase RTDB
 */
export function subscribeToCollabGroupChat(
  groupCode: string,
  onUpdate: (messages: CollabChatMessage[]) => void
): () => void {
  try {
    const chatRef = ref(rtdb, `collabChats/${groupCode}/messages`);
    const unsubscribe = onValue(
      chatRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const val = snapshot.val();
            let list: CollabChatMessage[] = [];
            if (Array.isArray(val)) {
              list = val.filter(Boolean);
            } else if (typeof val === 'object' && val !== null) {
              list = Object.values(val);
            }
            list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            onUpdate(list);
            try {
              localStorage.setItem(`cp_collab_cache_${groupCode}`, JSON.stringify(list));
            } catch {}
          } else {
            try {
              const cached = localStorage.getItem(`cp_collab_cache_${groupCode}`);
              if (cached) onUpdate(JSON.parse(cached));
            } catch {}
          }
        } catch (err) {
          console.warn('Error reading collab chat from RTDB:', err);
        }
      },
      (error) => {
        console.warn('RTDB collabChats subscription error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to collabChats in RTDB:', err);
    return () => {};
  }
}

/**
 * Send a message to a Collaborative Group in Firebase RTDB & notify peers
 */
export async function sendCollabGroupChatMessage(
  groupCode: string,
  message: CollabChatMessage
): Promise<void> {
  const sanitized = sanitizeData(message);
  try {
    // 1. Save message to RTDB under its ID
    const msgRef = ref(rtdb, `collabChats/${groupCode}/messages/${message.id}`);
    await rtdbSet(msgRef, sanitized);

    // 2. Broadcast latest notification for bells and envelopes
    const notifRef = ref(rtdb, `collabChats/${groupCode}/latestNotification`);
    const notifData: CollabNotificationEvent = {
      id: message.id,
      groupCode,
      sender: message.sender,
      role: message.role,
      text: message.text,
      timestamp: message.timestamp,
      createdAt: message.createdAt || Date.now(),
    };
    await rtdbSet(notifRef, notifData);

    // 3. Clear typing status for this user
    await updateCollabGroupTyping(groupCode, message.sender, false);
  } catch (err) {
    console.error('Failed to send collab chat message to RTDB:', err);
  }

  // Also update local cache
  try {
    const raw = localStorage.getItem(`cp_collab_cache_${groupCode}`);
    const list: CollabChatMessage[] = raw ? JSON.parse(raw) : [];
    if (!list.some((m) => m.id === message.id)) {
      list.push(message);
      localStorage.setItem(`cp_collab_cache_${groupCode}`, JSON.stringify(list));
    }
  } catch {}
}

/**
 * Real-time listener for latest notification in a collaborative group (or all groups for admin)
 */
export function subscribeToCollabGroupNotification(
  groupCode: string,
  onNotification: (notif: CollabNotificationEvent) => void
): () => void {
  try {
    const notifRef = ref(rtdb, `collabChats/${groupCode}/latestNotification`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as CollabNotificationEvent;
        if (data) onNotification(data);
      }
    });
    return unsubscribe;
  } catch {
    return () => {};
  }
}

/**
 * Update real-time typing status in Firebase RTDB
 */
export async function updateCollabGroupTyping(
  groupCode: string,
  username: string,
  isTyping: boolean
): Promise<void> {
  try {
    const safeUserKey = username.replace(/[.#$[\]]/g, '_');
    const typingRef = ref(rtdb, `collabChats/${groupCode}/typing/${safeUserKey}`);
    await rtdbSet(typingRef, isTyping ? { username, time: Date.now() } : null);
  } catch {}
}

/**
 * Real-time listener for typing users in a collaborative group
 */
export function subscribeToCollabGroupTyping(
  groupCode: string,
  onTyping: (typingUsers: string[]) => void
): () => void {
  try {
    const typingRef = ref(rtdb, `collabChats/${groupCode}/typing`);
    const unsubscribe = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const now = Date.now();
        const active: string[] = [];
        if (typeof val === 'object' && val !== null) {
          Object.values(val).forEach((entry: any) => {
            if (entry && entry.username && now - (entry.time || 0) < 4000) {
              active.push(entry.username);
            }
          });
        }
        onTyping(active);
      } else {
        onTyping([]);
      }
    });
    return unsubscribe;
  } catch {
    return () => {};
  }
}

/**
 * Sync student test access audit record to Firebase Realtime Database
 */
export async function syncTestAccessAuditToRTDB(
  username: string,
  testId: string,
  summary: any
): Promise<void> {
  try {
    const safeUser = username.trim().replace(/[.#$[\]]/g, '_');
    const safeTest = testId.trim().replace(/[.#$[\]]/g, '_');
    const testAuditRef = ref(rtdb, `studentsTestAccessAudit/${safeUser}/${safeTest}`);
    await rtdbSet(testAuditRef, summary);
  } catch (err) {
    console.warn(`Failed to sync test access audit for ${username} - ${testId} to RTDB:`, err);
  }
}

/**
 * Real-time listener for students test access audits from Firebase Realtime Database
 */
export function subscribeToAllTestAccessAudit(
  onUpdate: (map: Record<string, Record<string, any>>) => void
): () => void {
  try {
    const auditRef = ref(rtdb, 'studentsTestAccessAudit');
    const unsubscribe = onValue(
      auditRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            onUpdate(snapshot.val() || {});
          } else {
            onUpdate({});
          }
        } catch (err) {
          console.warn('Error handling studentsTestAccessAudit update:', err);
        }
      },
      (error) => {
        console.warn('RTDB studentsTestAccessAudit error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to studentsTestAccessAudit in RTDB:', err);
    return () => {};
  }
}
