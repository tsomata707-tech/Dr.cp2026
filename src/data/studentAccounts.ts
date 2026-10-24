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

export const COLLABORATIVE_GROUPS_DEF: Record<'A' | 'B' | 'C' | 'D' | 'E', CollaborativeGroupDef> = {
  A: {
    code: 'A',
    name: 'المجموعة التعاونية الأولى (A)',
    members: ['Collab_A_01', 'Collab_A_02', 'Collab_A_03'],
    description: 'فريق العمل التعاوني الأول لإنتاج وتصميم الوسائط المتعددة (مع المشرف)',
  },
  B: {
    code: 'B',
    name: 'المجموعة التعاونية الثانية (B)',
    members: ['Collab_B_01', 'Collab_B_02', 'Collab_B_03'],
    description: 'فريق العمل التعاوني الثاني لإنتاج وتصميم الوسائط المتعددة (مع المشرف)',
  },
  C: {
    code: 'C',
    name: 'المجموعة التعاونية الثالثة (C)',
    members: ['Collab_C_01', 'Collab_C_02', 'Collab_C_03'],
    description: 'فريق العمل التعاوني الثالث لإنتاج وتصميم الوسائط المتعددة (مع المشرف)',
  },
  D: {
    code: 'D',
    name: 'المجموعة التعاونية الرابعة (D)',
    members: ['Collab_D_01', 'Collab_D_02', 'Collab_D_03'],
    description: 'فريق العمل التعاوني الرابع لإنتاج وتصميم الوسائط المتعددة (مع المشرف)',
  },
  E: {
    code: 'E',
    name: 'المجموعة التعاونية الخامسة (E)',
    members: ['Collab_E_01', 'Collab_E_02', 'Collab_E_03'],
    description: 'فريق العمل التعاوني الخامس لإنتاج وتصميم الوسائط المتعددة (مع المشرف)',
  },
};

// Generates distinct, secure and testable unique passwords for all students
export function getStudentPassword(groupCode: 'G1' | 'G2' | 'G3' | 'G4', padNum: string): string {
  const groupNum = groupCode.replace('G', '');
  return `Cp@9${groupNum}${padNum}`;
}

export function getCollaborativePassword(groupCode: 'A' | 'B' | 'C' | 'D' | 'E', padNum: string): string {
  return `Cp@${groupCode}${padNum}`;
}

// Generates the 60 students (15 in each of the 4 groups) + Collaborative A-E students
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
        groupName: meta.name,
      });
    }
  });

  // Generate Collaborative Groups A, B, C, D, E users (3 students each)
  const collabCodes: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];
  collabCodes.forEach((code) => {
    const def = COLLABORATIVE_GROUPS_DEF[code];
    for (let i = 1; i <= 3; i++) {
      const padNum = `0${i}`;
      const username = `Collab_${code}_${padNum}`;
      const password = getCollaborativePassword(code, padNum);

      students.push({
        id: `usr_${username.toLowerCase()}`,
        username: username,
        fullName: `${username} (${def.name})`,
        role: 'member',
        password: password,
        isActive: true,
        createdAt: '2026-03-01',
        groupCode: 'G3',
        groupId: 'grp-3',
        groupName: def.name,
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

  const collabMatch = upper.match(/^COLLAB_([A-E])_(\d{2})$/);
  if (collabMatch) {
    return `Collab_${collabMatch[1]}_${collabMatch[2]}`;
  }

  return clean;
}

export function getCollaborativeGroupByUsername(username: string): 'A' | 'B' | 'C' | 'D' | 'E' | null {
  const norm = normalizeStudentUsername(username).toUpperCase();
  const match = norm.match(/^COLLAB_([A-E])_/);
  if (match) {
    return match[1] as 'A' | 'B' | 'C' | 'D' | 'E';
  }
  if (norm.startsWith('G3_')) {
    const numMatch = norm.match(/_(\d{2})$/);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      if (n <= 3) return 'A';
      if (n <= 6) return 'B';
      if (n <= 9) return 'C';
      if (n <= 12) return 'D';
      return 'E';
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
