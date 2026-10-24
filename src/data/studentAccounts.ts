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

export type CollaborativeGroupCode =
  | 'G3-A' | 'G3-B' | 'G3-C' | 'G3-D' | 'G3-E'
  | 'G4-A' | 'G4-B' | 'G4-C' | 'G4-D' | 'G4-E';

export interface CollaborativeGroupDef {
  code: CollaborativeGroupCode;
  subCode: 'A' | 'B' | 'C' | 'D' | 'E';
  modeCode: 'G3' | 'G4';
  modeTitle: 'تعاوني فوري' | 'تعاوني مرجأ';
  name: string;
  members: string[]; // exactly 3 student usernames
  description: string;
}

export const G3_COLLAB_GROUPS: CollaborativeGroupCode[] = [
  'G3-A', 'G3-B', 'G3-C', 'G3-D', 'G3-E'
];

export const G4_COLLAB_GROUPS: CollaborativeGroupCode[] = [
  'G4-A', 'G4-B', 'G4-C', 'G4-D', 'G4-E'
];

export const ALL_COLLAB_GROUPS: CollaborativeGroupCode[] = [
  ...G3_COLLAB_GROUPS,
  ...G4_COLLAB_GROUPS
];

// Exact 15 G3 students + 15 G4 students mapped strictly to 5 triads each (3 students per triad + Admin)
export const COLLABORATIVE_GROUPS_DEF: Record<string, CollaborativeGroupDef> = {
  // === نمط التعاون الفوري (G3) - 5 مجموعات ثلاثية ===
  'G3-A': {
    code: 'G3-A',
    subCode: 'A',
    modeCode: 'G3',
    modeTitle: 'تعاوني فوري',
    name: 'المجموعة التعاونية الفورية الأولى (G3-A)',
    members: ['G3_Cp_01', 'G3_Cp_02', 'G3_Cp_03'],
    description: 'فريق التعاون الفوري الأول (G3_Cp_01, G3_Cp_02, G3_Cp_03) مع المشرف (Admin)',
  },
  'G3-B': {
    code: 'G3-B',
    subCode: 'B',
    modeCode: 'G3',
    modeTitle: 'تعاوني فوري',
    name: 'المجموعة التعاونية الفورية الثانية (G3-B)',
    members: ['G3_Cp_04', 'G3_Cp_05', 'G3_Cp_06'],
    description: 'فريق التعاون الفوري الثاني (G3_Cp_04, G3_Cp_05, G3_Cp_06) مع المشرف (Admin)',
  },
  'G3-C': {
    code: 'G3-C',
    subCode: 'C',
    modeCode: 'G3',
    modeTitle: 'تعاوني فوري',
    name: 'المجموعة التعاونية الفورية الثالثة (G3-C)',
    members: ['G3_Cp_07', 'G3_Cp_08', 'G3_Cp_09'],
    description: 'فريق التعاون الفوري الثالث (G3_Cp_07, G3_Cp_08, G3_Cp_09) مع المشرف (Admin)',
  },
  'G3-D': {
    code: 'G3-D',
    subCode: 'D',
    modeCode: 'G3',
    modeTitle: 'تعاوني فوري',
    name: 'المجموعة التعاونية الفورية الرابعة (G3-D)',
    members: ['G3_Cp_10', 'G3_Cp_11', 'G3_Cp_12'],
    description: 'فريق التعاون الفوري الرابع (G3_Cp_10, G3_Cp_11, G3_Cp_12) مع المشرف (Admin)',
  },
  'G3-E': {
    code: 'G3-E',
    subCode: 'E',
    modeCode: 'G3',
    modeTitle: 'تعاوني فوري',
    name: 'المجموعة التعاونية الفورية الخامسة (G3-E)',
    members: ['G3_Cp_13', 'G3_Cp_14', 'G3_Cp_15'],
    description: 'فريق التعاون الفوري الخامس (G3_Cp_13, G3_Cp_14, G3_Cp_15) مع المشرف (Admin)',
  },

  // === نمط التعاون المرجأ (G4) - 5 مجموعات ثلاثية ===
  'G4-A': {
    code: 'G4-A',
    subCode: 'A',
    modeCode: 'G4',
    modeTitle: 'تعاوني مرجأ',
    name: 'المجموعة التعاونية المرجأة الأولى (G4-A)',
    members: ['G4_Cp_01', 'G4_Cp_02', 'G4_Cp_03'],
    description: 'فريق التعاون المرجأ الأول (G4_Cp_01, G4_Cp_02, G4_Cp_03) مع المشرف (Admin)',
  },
  'G4-B': {
    code: 'G4-B',
    subCode: 'B',
    modeCode: 'G4',
    modeTitle: 'تعاوني مرجأ',
    name: 'المجموعة التعاونية المرجأة الثانية (G4-B)',
    members: ['G4_Cp_04', 'G4_Cp_05', 'G4_Cp_06'],
    description: 'فريق التعاون المرجأ الثاني (G4_Cp_04, G4_Cp_05, G4_Cp_06) مع المشرف (Admin)',
  },
  'G4-C': {
    code: 'G4-C',
    subCode: 'C',
    modeCode: 'G4',
    modeTitle: 'تعاوني مرجأ',
    name: 'المجموعة التعاونية المرجأة الثالثة (G4-C)',
    members: ['G4_Cp_07', 'G4_Cp_08', 'G4_Cp_09'],
    description: 'فريق التعاون المرجأ الثالث (G4_Cp_07, G4_Cp_08, G4_Cp_09) مع المشرف (Admin)',
  },
  'G4-D': {
    code: 'G4-D',
    subCode: 'D',
    modeCode: 'G4',
    modeTitle: 'تعاوني مرجأ',
    name: 'المجموعة التعاونية المرجأة الرابعة (G4-D)',
    members: ['G4_Cp_10', 'G4_Cp_11', 'G4_Cp_12'],
    description: 'فريق التعاون المرجأ الرابع (G4_Cp_10, G4_Cp_11, G4_Cp_12) مع المشرف (Admin)',
  },
  'G4-E': {
    code: 'G4-E',
    subCode: 'E',
    modeCode: 'G4',
    modeTitle: 'تعاوني مرجأ',
    name: 'المجموعة التعاونية المرجأة الخامسة (G4-E)',
    members: ['G4_Cp_13', 'G4_Cp_14', 'G4_Cp_15'],
    description: 'فريق التعاون المرجأ الخامس (G4_Cp_13, G4_Cp_14, G4_Cp_15) مع المشرف (Admin)',
  },

  // Aliases for legacy lookup
  'A': {
    code: 'G3-A',
    subCode: 'A',
    modeCode: 'G3',
    modeTitle: 'تعاوني فوري',
    name: 'المجموعة التعاونية الفورية الأولى (G3-A)',
    members: ['G3_Cp_01', 'G3_Cp_02', 'G3_Cp_03'],
    description: 'فريق التعاون الفوري الأول (G3_Cp_01, G3_Cp_02, G3_Cp_03) مع المشرف (Admin)',
  },
  'B': {
    code: 'G3-B',
    subCode: 'B',
    modeCode: 'G3',
    modeTitle: 'تعاوني فوري',
    name: 'المجموعة التعاونية الفورية الثانية (G3-B)',
    members: ['G3_Cp_04', 'G3_Cp_05', 'G3_Cp_06'],
    description: 'فريق التعاون الفوري الثاني (G3_Cp_04, G3_Cp_05, G3_Cp_06) مع المشرف (Admin)',
  },
  'C': {
    code: 'G3-C',
    subCode: 'C',
    modeCode: 'G3',
    modeTitle: 'تعاوني فوري',
    name: 'المجموعة التعاونية الفورية الثالثة (G3-C)',
    members: ['G3_Cp_07', 'G3_Cp_08', 'G3_Cp_09'],
    description: 'فريق التعاون الفوري الثالث (G3_Cp_07, G3_Cp_08, G3_Cp_09) مع المشرف (Admin)',
  },
  'D': {
    code: 'G3-D',
    subCode: 'D',
    modeCode: 'G3',
    modeTitle: 'تعاوني فوري',
    name: 'المجموعة التعاونية الفورية الرابعة (G3-D)',
    members: ['G3_Cp_10', 'G3_Cp_11', 'G3_Cp_12'],
    description: 'فريق التعاون الفوري الرابع (G3_Cp_10, G3_Cp_11, G3_Cp_12) مع المشرف (Admin)',
  },
  'E': {
    code: 'G3-E',
    subCode: 'E',
    modeCode: 'G3',
    modeTitle: 'تعاوني فوري',
    name: 'المجموعة التعاونية الفورية الخامسة (G3-E)',
    members: ['G3_Cp_13', 'G3_Cp_14', 'G3_Cp_15'],
    description: 'فريق التعاون الفوري الخامس (G3_Cp_13, G3_Cp_14, G3_Cp_15) مع المشرف (Admin)',
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
      const collabKey = getCollaborativeGroupByUsername(username);

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
        groupName: collabKey && COLLABORATIVE_GROUPS_DEF[collabKey]
          ? COLLABORATIVE_GROUPS_DEF[collabKey].name
          : meta.name,
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

/**
 * Returns the exact collaborative triad code ('G3-A'..'G3-E' or 'G4-A'..'G4-E') for collaborative students, or null for competitive students
 */
export function getCollaborativeGroupByUsername(username: string): CollaborativeGroupCode | null {
  const norm = normalizeStudentUsername(username).toUpperCase();
  if (norm.startsWith('G3_')) {
    const numMatch = norm.match(/_(\d{2})$/);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      if (n >= 1 && n <= 3) return 'G3-A';
      if (n >= 4 && n <= 6) return 'G3-B';
      if (n >= 7 && n <= 9) return 'G3-C';
      if (n >= 10 && n <= 12) return 'G3-D';
      if (n >= 13 && n <= 15) return 'G3-E';
    }
    return 'G3-A';
  }
  if (norm.startsWith('G4_')) {
    const numMatch = norm.match(/_(\d{2})$/);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      if (n >= 1 && n <= 3) return 'G4-A';
      if (n >= 4 && n <= 6) return 'G4-B';
      if (n >= 7 && n <= 9) return 'G4-C';
      if (n >= 10 && n <= 12) return 'G4-D';
      if (n >= 13 && n <= 15) return 'G4-E';
    }
    return 'G4-A';
  }
  return null;
}

export function getGroupByUsername(username: string): GroupMeta | null {
  const norm = normalizeStudentUsername(username).toUpperCase();
  if (norm.startsWith('COLLAB_') || norm.startsWith('G3_')) {
    return RESEARCH_GROUPS_META['G3'];
  }
  if (norm.startsWith('G4_')) {
    return RESEARCH_GROUPS_META['G4'];
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
