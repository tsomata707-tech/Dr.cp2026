import { ref, set as rtdbSet, onValue, remove as rtdbRemove } from 'firebase/database';
import { rtdb } from '../firebase';
import { getPortalUsers, savePortalUsers } from './adminStorage';
import { normalizeStudentUsername } from '../data/studentAccounts';

export interface TripartiteName {
  firstName: string;   // اسم الطالب
  fatherName: string;  // اسم الأب
  familyName: string;  // اللقب / اسم العائلة
}

const TRIPARTITE_STORAGE_KEY = 'cp_student_tripartite_names_v2';

export function getAllTripartiteNames(): Record<string, TripartiteName> {
  try {
    const raw = localStorage.getItem(TRIPARTITE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAllTripartiteNames(map: Record<string, TripartiteName>): void {
  try {
    localStorage.setItem(TRIPARTITE_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Tripartite names localStorage warning:', err);
  }
}

/**
 * Get student's three-part name (الاسم، الأب، اللقب)
 */
export function getStudentTripartiteName(username: string): TripartiteName {
  const norm = normalizeStudentUsername(username).toUpperCase();
  const map = getAllTripartiteNames();
  
  if (map[norm] && (map[norm].firstName || map[norm].fatherName || map[norm].familyName)) {
    return {
      firstName: map[norm].firstName || '',
      fatherName: map[norm].fatherName || '',
      familyName: map[norm].familyName || '',
    };
  }

  // Fallback: check if PortalUser has a non-username fullName that can be split into 3 parts
  const users = getPortalUsers();
  const user = users.find((u) => u.username.toUpperCase() === norm);
  if (user && user.fullName && user.fullName.trim() !== user.username) {
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length >= 3) {
      const parsed: TripartiteName = {
        firstName: parts[0],
        fatherName: parts[1],
        familyName: parts.slice(2).join(' '),
      };
      map[norm] = parsed;
      saveAllTripartiteNames(map);
      return parsed;
    }
  }

  return { firstName: '', fatherName: '', familyName: '' };
}

/**
 * Checks whether all 3 parts of the tripartite name are completely filled
 * Requirement: "ولا يمكن تسجيل الدخول الا بإكمال جميع الخانات"
 */
export function isStudentTripartiteNameCompleted(username: string): boolean {
  if (username.trim().toLowerCase() === 'admin') return true;
  const name = getStudentTripartiteName(username);
  return (
    name.firstName.trim().length > 0 &&
    name.fatherName.trim().length > 0 &&
    name.familyName.trim().length > 0
  );
}

/**
 * Assemble student's full name: firstName + fatherName + familyName
 */
export function getStudentFullName(username: string): string {
  if (username.trim().toLowerCase() === 'admin') {
    return 'مدير المنظومة (المشرف العام)';
  }
  const parts = getStudentTripartiteName(username);
  const full = `${parts.firstName.trim()} ${parts.fatherName.trim()} ${parts.familyName.trim()}`.trim();
  if (full) return full;

  const users = getPortalUsers();
  const user = users.find((u) => u.username.toUpperCase() === normalizeStudentUsername(username).toUpperCase());
  if (user && user.fullName && user.fullName.trim() !== user.username) {
    return user.fullName.trim();
  }

  return '';
}

/**
 * Formats student display name: e.g. "أحمد محمود السيد (@G1_Cp_01)"
 * Requirement: "ويظهر الاسم بجوار اليوزر دائما في كامل الموقع حتي في الشات وفي شيتات الطلاب"
 */
export function formatStudentDisplayName(username: string): string {
  if (!username) return '';
  if (username.trim().toLowerCase() === 'admin') {
    return '👑 المشرف العام (Admin)';
  }
  const fullName = getStudentFullName(username);
  if (fullName) {
    return `${fullName} (@${username})`;
  }
  return `@${username}`;
}

/**
 * Save student's tripartite name:
 * 1. Saves to local map
 * 2. Updates PortalUser.fullName in getPortalUsers() & savePortalUsers()
 * 3. Syncs to Firebase RTDB
 * 4. Dispatches window event cp_student_name_updated
 */
export function saveStudentTripartiteName(
  username: string,
  parts: TripartiteName,
  syncRemote: boolean = true
): string {
  const norm = normalizeStudentUsername(username).toUpperCase();
  const cleanParts: TripartiteName = {
    firstName: parts.firstName.trim(),
    fatherName: parts.fatherName.trim(),
    familyName: parts.familyName.trim(),
  };

  const fullName = `${cleanParts.firstName} ${cleanParts.fatherName} ${cleanParts.familyName}`.trim();

  // 1. Update local tripartite names map
  const map = getAllTripartiteNames();
  map[norm] = cleanParts;
  saveAllTripartiteNames(map);

  // 2. Update PortalUser.fullName in adminStorage
  const users = getPortalUsers();
  const updatedUsers = users.map((u) => {
    if (u.username.toUpperCase() === norm) {
      return { ...u, fullName: fullName || u.username };
    }
    return u;
  });
  savePortalUsers(updatedUsers, syncRemote);

  // 3. Dispatch event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('cp_student_name_updated', {
        detail: { username: norm, fullName, parts: cleanParts },
      })
    );
  }

  // 4. Sync to Firebase RTDB
  if (syncRemote) {
    try {
      const nameRef = ref(rtdb, `student_names/${norm}`);
      rtdbSet(nameRef, {
        username: norm,
        fullName,
        parts: cleanParts,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  return fullName;
}

/**
 * Reset student name to empty (Admin action)
 * Requirement: "ويتم تعين الاسم الي فارغ او تغيره من الادمن"
 */
export function resetStudentNameToEmpty(username: string, syncRemote: boolean = true): void {
  const norm = normalizeStudentUsername(username).toUpperCase();
  
  // 1. Clear in local tripartite names map
  const map = getAllTripartiteNames();
  delete map[norm];
  saveAllTripartiteNames(map);

  // 2. Clear in PortalUser.fullName
  const users = getPortalUsers();
  const updatedUsers = users.map((u) => {
    if (u.username.toUpperCase() === norm) {
      return { ...u, fullName: '' };
    }
    return u;
  });
  savePortalUsers(updatedUsers, syncRemote);

  // 3. Dispatch event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('cp_student_name_updated', {
        detail: { username: norm, fullName: '', parts: { firstName: '', fatherName: '', familyName: '' } },
      })
    );
  }

  // 4. Clear in Firebase RTDB
  if (syncRemote) {
    try {
      const nameRef = ref(rtdb, `student_names/${norm}`);
      rtdbRemove(nameRef).catch(() => {});
    } catch {
      // ignore
    }
  }
}

/**
 * Real-time subscription to student names across devices
 */
export function subscribeToStudentNames(
  callback: (allNames: Record<string, TripartiteName>) => void
): () => void {
  callback(getAllTripartiteNames());

  const handleUpdate = () => {
    callback(getAllTripartiteNames());
  };
  window.addEventListener('cp_student_name_updated', handleUpdate);

  let unsubRtdb: (() => void) | null = null;
  try {
    const namesRef = ref(rtdb, 'student_names');
    unsubRtdb = onValue(namesRef, (snap) => {
      const data = snap.val();
      if (data && typeof data === 'object') {
        const localMap = getAllTripartiteNames();
        let changed = false;
        Object.entries(data).forEach(([uKey, val]: [string, any]) => {
          if (val && val.parts) {
            localMap[uKey] = val.parts;
            changed = true;
          }
        });
        if (changed) {
          saveAllTripartiteNames(localMap);
          callback(localMap);
        }
      }
    });
  } catch (err) {
    console.warn('RTDB subscribe student_names warning:', err);
  }

  return () => {
    window.removeEventListener('cp_student_name_updated', handleUpdate);
    if (unsubRtdb) unsubRtdb();
  };
}
