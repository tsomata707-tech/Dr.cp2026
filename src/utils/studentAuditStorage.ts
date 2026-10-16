import { syncStudentLoginAuditToRTDB } from './realtimeService';

export interface StudentLoginSession {
  id: string;
  username: string;
  timestamp: string; // e.g. "2026-10-15 15:30:22"
  date: string; // e.g. "2026-10-15"
  time: string; // e.g. "15:30:22"
  device: string; // e.g. "حاسوب مكتبي (Desktop)" or "هاتف ذكي (Mobile)"
}

export interface StudentLoginAudit {
  username: string;
  firstLogin: string;
  lastLogin: string;
  totalLogins: number;
  sessions: StudentLoginSession[];
}

const LOGIN_AUDIT_STORAGE_KEY = 'cp_students_login_audit_v3';

/**
 * Get all recorded student logins from localStorage
 */
export function getStudentLoginsAuditMap(): Record<string, StudentLoginAudit> {
  try {
    const raw = localStorage.getItem(LOGIN_AUDIT_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save all student login audits
 */
export function saveAllStudentLoginsAudit(map: Record<string, StudentLoginAudit>): void {
  try {
    localStorage.setItem(LOGIN_AUDIT_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Failed to save student logins audit:', err);
  }
}

/**
 * Record a real student login with actual current timestamp and device
 */
export function recordStudentLogin(username: string): StudentLoginAudit {
  const cleanUser = username.trim();
  const now = new Date();

  // Format real date & time
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const timeStr = now.toTimeString().split(' ')[0];
  const fullTimestamp = `${dateStr} ${timeStr}`;

  // Detect device accurately
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
  const device = isMobile ? 'هاتف ذكي / جهاز لوحي (Mobile)' : 'حاسوب / شاشة مكتبية (Desktop)';

  const newSession: StudentLoginSession = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUser,
    timestamp: fullTimestamp,
    date: dateStr,
    time: timeStr,
    device,
  };

  const all = getStudentLoginsAuditMap();
  let updatedRecord: StudentLoginAudit;

  if (!all[cleanUser]) {
    updatedRecord = {
      username: cleanUser,
      firstLogin: fullTimestamp,
      lastLogin: fullTimestamp,
      totalLogins: 1,
      sessions: [newSession],
    };
  } else {
    updatedRecord = {
      ...all[cleanUser],
      totalLogins: (all[cleanUser].totalLogins || 0) + 1,
      lastLogin: fullTimestamp,
      sessions: [newSession, ...(all[cleanUser].sessions || []).slice(0, 49)],
    };
  }

  all[cleanUser] = updatedRecord;
  saveAllStudentLoginsAudit(all);

  // Sync to Firebase RTDB asynchronously
  syncStudentLoginAuditToRTDB(cleanUser, updatedRecord).catch(() => {});

  // Dispatch custom window event for real-time UI reaction
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('student-login-recorded', { detail: updatedRecord })
    );
  }

  return updatedRecord;
}

/**
 * Export data to a downloadable CSV file (UTF-8 BOM for Microsoft Excel & Google Sheets compatibility)
 */
export function downloadCsvSheet(filename: string, headers: string[], rows: (string | number)[][]): void {
  const bom = '\uFEFF'; // Crucial for Arabic characters in Excel
  const csvContent = [
    headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy sheet data to clipboard as Tab-Separated Values (TSV) for direct paste into Excel or Google Sheets
 */
export async function copySheetToClipboard(headers: string[], rows: (string | number)[][]): Promise<boolean> {
  try {
    const tsvContent = [
      headers.join('\t'),
      ...rows.map((row) => row.map((c) => String(c ?? '').replace(/\t/g, ' ')).join('\t')),
    ].join('\n');

    await navigator.clipboard.writeText(tsvContent);
    return true;
  } catch (err) {
    console.warn('Failed to copy to clipboard:', err);
    return false;
  }
}
