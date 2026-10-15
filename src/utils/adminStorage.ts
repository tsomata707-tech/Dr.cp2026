import { AdminSettings, PortalUser, ActivityLog } from '../types';
import { generateSixtyStudents, normalizeStudentUsername } from '../data/studentAccounts';

const SETTINGS_KEY = 'cp_admin_settings_v1';
const USERS_KEY = 'cp_portal_users_v4'; // Bumped key to load G1_Cp_01... format and unique passwords
const LOGS_KEY = 'cp_activity_logs_v1';

const DEFAULT_SETTINGS: AdminSettings = {
  whatsappNumber: '+201000000000',
  whatsappDefaultMessage: 'مرحباً، أحتاج مساعدة بخصوص تسجيل الدخول في بوابة Cp',
  whatsappEnabled: true,
  adminPasswordHash: 'admin123', // Default admin password
  systemName: 'منظومة Cp المركزية',
  maintenanceMode: false,
  allowLogins: true,
};

const BASE_ADMIN_USERS: PortalUser[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    fullName: 'مدير المنظومة المركزي (المشرف العام)',
    role: 'supervisor',
    password: 'password123',
    isActive: true,
    createdAt: '2026-01-10',
    lastLogin: '2026-09-08 05:55',
  },
];

// Combine Admin + The 60 Students with distinct passwords and G1_Cp_01 format
const DEFAULT_USERS: PortalUser[] = [
  ...BASE_ADMIN_USERS,
  ...generateSixtyStudents(),
];

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-09-08 05:55:00',
    action: 'تحديث أسماء مستخدمي الطلاب إلى تنسيق G1_Cp_01 ... G4_Cp_15 مع كلمات مرور خاصة',
    user: 'admin',
    ip: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'log_2',
    timestamp: '2026-09-08 05:45:00',
    action: 'تعيين كلمات مرور فريدة لكل طالب من الطلاب الـ 60',
    user: 'admin',
    ip: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'log_3',
    timestamp: '2026-09-08 05:20:11',
    action: 'تهيئة حسابات الطلاب الـ 60 (15 طالباً لكل مجموعة)',
    user: 'النظام الأكاديمي',
    ip: '127.0.0.1',
    status: 'success',
  },
];

export function getAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      const legacyPhone = localStorage.getItem('cp_admin_whatsapp');
      if (legacyPhone) {
        DEFAULT_SETTINGS.whatsappNumber = legacyPhone;
      }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAdminSettings(settings: Partial<AdminSettings>): AdminSettings {
  const current = getAdminSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  if (settings.whatsappNumber) {
    localStorage.setItem('cp_admin_whatsapp', settings.whatsappNumber);
  }
  return updated;
}

export function getPortalUsers(): PortalUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed: PortalUser[] = JSON.parse(raw);

    // Verify presence of G1_Cp format
    const hasNewFormat = parsed.some(u => u.username.includes('_Cp_') || u.username.includes('_CP_'));
    if (!hasNewFormat || parsed.length < 60) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }

    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

export function savePortalUsers(users: PortalUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getActivityLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(DEFAULT_LOGS));
      return DEFAULT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LOGS;
  }
}

export function addActivityLog(action: string, user: string, status: 'success' | 'warning' | 'error' = 'success'): void {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    id: 'log_' + Date.now(),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    action,
    user,
    ip: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
    status,
  };
  localStorage.setItem(LOGS_KEY, JSON.stringify([newLog, ...logs.slice(0, 49)]));
}
