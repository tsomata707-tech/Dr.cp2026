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

export interface CollaborativeGroupDef {
  code: 'A' | 'B' | 'C' | 'D' | 'E';
  name: string;
  members: string[];
  description: string;
}

// Exact 15 G3 student usernames from Admin panel mapped to 5 groups (A, B, C, D, E) of 3 students each
export const COLLABORATIVE_GROUPS_DEF: Record<'A' | 'B' | 'C' | 'D' | 'E', CollaborativeGroupDef> = {
  A: {
    code: 'A',
    name: 'المجموعة التعاونية الأولى (A)',
    members: ['G3_Cp_01', 'G3_Cp_02', 'G3_Cp_03'],
    description: 'فريق العمل التعاوني الأول (G3_Cp_01, G3_Cp_02, G3_Cp_03) مع المشرف',
  },
  B: {
    code: 'B',
    name: 'المجموعة التعاونية الثانية (B)',
    members: ['G3_Cp_04', 'G3_Cp_05', 'G3_Cp_06'],
    description: 'فريق العمل التعاوني الثاني (G3_Cp_04, G3_Cp_05, G3_Cp_06) مع المشرف',
  },
  C: {
    code: 'C',
    name: 'المجموعة التعاونية الثالثة (C)',
    members: ['G3_Cp_07', 'G3_Cp_08', 'G3_Cp_09'],
    description: 'فريق العمل التعاوني الثالث (G3_Cp_07, G3_Cp_08, G3_Cp_09) مع المشرف',
  },
  D: {
    code: 'D',
    name: 'المجموعة التعاونية الرابعة (D)',
    members: ['G3_Cp_10', 'G3_Cp_11', 'G3_Cp_12'],
    description: 'فريق العمل التعاوني الرابع (G3_Cp_10, G3_Cp_11, G3_Cp_12) مع المشرف',
  },
  E: {
    code: 'E',
    name: 'المجموعة التعاونية الخامسة (E)',
    members: ['G3_Cp_13', 'G3_Cp_14', 'G3_Cp_15'],
    description: 'فريق العمل التعاوني الخامس (G3_Cp_13, G3_Cp_14, G3_Cp_15) مع المشرف',
  },
};

// Generates distinct, secure and testable unique passwords for all students
export function getStudentPassword(groupCode: 'G1' | 'G2' | 'G3' | 'G4', padNum: string): string {
  const groupNum = groupCode.replace('G', '');
  return `Cp@9${groupNum}${padNum}`;
}

// Generates the 60 students (15 in each of the 4 groups: G1, G2, G3, G4)
export function generateSixtyStudents(): PortalUser[] {
  const students: PortalUser[] = [];
  const groups: Array<'G1' | 'G2' | 'G3' | 'G4'> = ['G1', 'G2', 'G3', 'G4'];

  groups.forEach((grpCode) => {
    const meta = RESEARCH_GROUPS_META[grpCode];

    for (let i = 1; i <= 15; i++) {
      const padNum = i < 10 ? `0${i}` : `${i}`;
      const username = `${grpCode}_Cp_${padNum}`;
      const uniquePassword = getStudentPassword(grpCode, padNum);

      students.push({
        id: `usr_${username.toLowerCase()}`,
        username: username,
        fullName: username,
        role: 'member',
        password: uniquePassword,
        isActive: true,
        createdAt: '2026-03-01',
        lastLogin: i % 3 === 0 ? '2026-09-08 05:55' : undefined,
        groupCode: grpCode,
        groupId: meta.id,
        groupName: grpCode === 'G3' ? COLLABORATIVE_GROUPS_DEF[getCollaborativeGroupByUsername(username) || 'A'].name : meta.name,
      });
    }
  });

  return students;
}

export const SIXTY_STUDENT_USERS = generateSixtyStudents();

export function normalizeStudentUsername(input: string): string {
  const clean = input.trim();
  const upper = clean.toUpperCase();

  const groupLongMatch = upper.match(/^GROUP([1-4])_(?:CP|CB)_(\d{1,2})$/);
  if (groupLongMatch) {
    const num = parseInt(groupLongMatch[2], 10);
    const pad = num < 10 ? `0${num}` : `${num}`;
    return `G${groupLongMatch[1]}_Cp_${pad}`;
  }

  const altMatch = upper.match(/^G([1-4])[-_]?(?:CP|CB)[-_]?(\d{1,2})$/);
  if (altMatch) {
    const num = parseInt(altMatch[2], 10);
    const pad = num < 10 ? `0${num}` : `${num}`;
    return `G${altMatch[1]}_Cp_${pad}`;
  }

  const legacyMatch = upper.match(/^G([1-4])(\d{2})$/);
  if (legacyMatch) {
    return `G${legacyMatch[1]}_Cp_${legacyMatch[2]}`;
  }

  return clean;
}

export function getCollaborativeGroupByUsername(username: string): 'A' | 'B' | 'C' | 'D' | 'E' | null {
  const norm = normalizeStudentUsername(username).toUpperCase();
  if (norm.startsWith('G3_')) {
    const numMatch = norm.match(/_(\d{2})$/);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      if (n >= 1 && n <= 3) return 'A';
      if (n >= 4 && n <= 6) return 'B';
      if (n >= 7 && n <= 9) return 'C';
      if (n >= 10 && n <= 12) return 'D';
      if (n >= 13 && n <= 15) return 'E';
    }
    return 'A';
  }
  return null;
}

export function getGroupByUsername(username: string): GroupMeta | null {
  const norm = normalizeStudentUsername(username).toUpperCase();
  if (norm.startsWith('COLLAB_') || norm.startsWith('G3_')) {
    return RESEARCH_GROUPS_META['G3'];
  }
  const match = norm.match(/^G([1-4])/);
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
