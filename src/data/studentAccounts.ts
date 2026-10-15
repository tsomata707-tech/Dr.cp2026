import { PortalUser } from '../types';

export interface GroupMeta {
  code: 'G1' | 'G2' | 'G3' | 'G4';
  id: 'grp-1' | 'grp-2' | 'grp-3' | 'grp-4';
  name: string;
  learningMode: 'تنافسي' | 'تعاوني';
  feedbackMode: 'فورية' | 'مرجئة';
  tagline: string;
}

export const RESEARCH_GROUPS_META: Record<string, GroupMeta> = {
  G1: {
    code: 'G1',
    id: 'grp-1',
    name: 'تنافس فوري',
    learningMode: 'تنافسي',
    feedbackMode: 'فورية',
    tagline: 'السرعة الفردية مع التعزيز اللحظي',
  },
  G2: {
    code: 'G2',
    id: 'grp-2',
    name: 'تنافس مرجأ',
    learningMode: 'تنافسي',
    feedbackMode: 'مرجئة',
    tagline: 'التحدي الفردي والتقرير التراكمي الشامل',
  },
  G3: {
    code: 'G3',
    id: 'grp-3',
    name: 'تعاوني فوري',
    learningMode: 'تعاوني',
    feedbackMode: 'فورية',
    tagline: 'العمل الجماعي المشترك والتوجيه المباشر',
  },
  G4: {
    code: 'G4',
    id: 'grp-4',
    name: 'تعاوني مرجأ',
    learningMode: 'تعاوني',
    feedbackMode: 'مرجئة',
    tagline: 'الحوار التشاركي والتقييم الختامي',
  },
};

// Generates distinct, secure and testable unique passwords for all 60 students
// Group 1: Cp@9101 ... Cp@9115
// Group 2: Cp@9201 ... Cp@9215
// Group 3: Cp@9301 ... Cp@9315
// Group 4: Cp@9401 ... Cp@9415
export function getStudentPassword(groupCode: 'G1' | 'G2' | 'G3' | 'G4', padNum: string): string {
  const groupNum = groupCode.replace('G', '');
  return `Cp@9${groupNum}${padNum}`;
}

// Generates the 60 students (15 in each of the 4 groups)
// Format requested: G1_Cp_01 ... G1_Cp_15, G2_Cp_01 ... G2_Cp_15, G3_Cp_01 ... G3_Cp_15, G4_Cp_01 ... G4_Cp_15
export function generateSixtyStudents(): PortalUser[] {
  const students: PortalUser[] = [];
  const groups: Array<'G1' | 'G2' | 'G3' | 'G4'> = ['G1', 'G2', 'G3', 'G4'];

  groups.forEach((grpCode) => {
    const meta = RESEARCH_GROUPS_META[grpCode];

    for (let i = 1; i <= 15; i++) {
      const padNum = i < 10 ? `0${i}` : `${i}`;
      // Canonical requested username: G1_Cp_01, G1_Cp_02 ...
      const username = `${grpCode}_Cp_${padNum}`;
      const uniquePassword = getStudentPassword(grpCode, padNum);

      students.push({
        id: `usr_${username.toLowerCase()}`,
        username: username,
        fullName: username,
        role: 'member',
        password: uniquePassword, // Distinct, unique password for each student
        isActive: true,
        createdAt: '2026-03-01',
        lastLogin: i % 3 === 0 ? '2026-09-08 05:55' : undefined,
        groupCode: grpCode,
        groupId: meta.id,
        groupName: meta.name,
      });
    }
  });

  return students;
}

export const SIXTY_STUDENT_USERS = generateSixtyStudents();

// Normalizes usernames to support flexible inputs:
// G1_Cp_01, g1_cp_01, Group1_Cp_01, G1_CB_01, G101, etc. -> returns canonical G1_Cp_01
export function normalizeStudentUsername(input: string): string {
  const clean = input.trim();
  const upper = clean.toUpperCase();

  // If user typed Group1_Cp_01 or Group1_CB_01 -> G1_Cp_01
  const groupLongMatch = upper.match(/^GROUP([1-4])_(?:CP|CB)_(\d{1,2})$/);
  if (groupLongMatch) {
    const num = parseInt(groupLongMatch[2], 10);
    const pad = num < 10 ? `0${num}` : `${num}`;
    return `G${groupLongMatch[1]}_Cp_${pad}`;
  }

  // If user typed G1_Cp_01, G1_cp_01, G1_CB_01, G1-Cp-01 etc.
  const altMatch = upper.match(/^G([1-4])[-_]?(?:CP|CB)[-_]?(\d{1,2})$/);
  if (altMatch) {
    const num = parseInt(altMatch[2], 10);
    const pad = num < 10 ? `0${num}` : `${num}`;
    return `G${altMatch[1]}_Cp_${pad}`;
  }

  // If user typed G101 -> G1_Cp_01
  const legacyMatch = upper.match(/^G([1-4])(\d{2})$/);
  if (legacyMatch) {
    return `G${legacyMatch[1]}_Cp_${legacyMatch[2]}`;
  }

  return clean;
}

export function getGroupByUsername(username: string): GroupMeta | null {
  const norm = normalizeStudentUsername(username);
  const match = norm.toUpperCase().match(/^G([1-4])/);
  if (match) {
    const code = `G${match[1]}` as 'G1' | 'G2' | 'G3' | 'G4';
    return RESEARCH_GROUPS_META[code] || null;
  }
  return null;
}

export function getStudentByUsername(username: string): PortalUser | null {
  const norm = normalizeStudentUsername(username);
  const students = generateSixtyStudents();
  return students.find((s) => s.username.toUpperCase() === norm.toUpperCase()) || null;
}

