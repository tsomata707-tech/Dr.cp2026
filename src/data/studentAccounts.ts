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
  | 'G1-A' | 'G1-B' | 'G1-C' | 'G1-D' | 'G1-E'
  | 'G2-A' | 'G2-B' | 'G2-C' | 'G2-D' | 'G2-E'
  | 'G3-A' | 'G3-B' | 'G3-C' | 'G3-D' | 'G3-E'
  | 'G4-A' | 'G4-B' | 'G4-C' | 'G4-D' | 'G4-E';

export interface CollaborativeGroupDef {
  code: CollaborativeGroupCode;
  subCode: 'A' | 'B' | 'C' | 'D' | 'E';
  modeCode: 'G1' | 'G2' | 'G3' | 'G4';
  modeTitle: string;
  name: string;
  members: string[]; // exactly 3 student usernames
  description: string;
}

export const G1_COLLAB_GROUPS: CollaborativeGroupCode[] = [
  'G1-A', 'G1-B', 'G1-C', 'G1-D', 'G1-E'
];

export const G2_COLLAB_GROUPS: CollaborativeGroupCode[] = [
  'G2-A', 'G2-B', 'G2-C', 'G2-D', 'G2-E'
];

export const G3_COLLAB_GROUPS: CollaborativeGroupCode[] = [
  'G3-A', 'G3-B', 'G3-C', 'G3-D', 'G3-E'
];

export const G4_COLLAB_GROUPS: CollaborativeGroupCode[] = [
  'G4-A', 'G4-B', 'G4-C', 'G4-D', 'G4-E'
];

export const ALL_COLLAB_GROUPS: CollaborativeGroupCode[] = [
  ...G1_COLLAB_GROUPS,
  ...G2_COLLAB_GROUPS,
  ...G3_COLLAB_GROUPS,
  ...G4_COLLAB_GROUPS
];

// All 60 students strictly mapped to 5 closed triads (3 students per triad + Admin) for each of the 4 groups
export const COLLABORATIVE_GROUPS_DEF: Record<string, CollaborativeGroupDef> = {
  // === نمط التنافس الفوري (G1) - 5 مجموعات ثلاثية مغلقة ===
  'G1-A': {
    code: 'G1-A',
    subCode: 'A',
    modeCode: 'G1',
    modeTitle: 'تنافس فوري',
    name: 'المجموعة المغلقة الأولى (G1-A)',
    members: ['G1_Cp_01', 'G1_Cp_02', 'G1_Cp_03'],
    description: 'فريق المجموعة الأولى (G1_Cp_01, G1_Cp_02, G1_Cp_03) مع المشرف (Admin)',
  },
  'G1-B': {
    code: 'G1-B',
    subCode: 'B',
    modeCode: 'G1',
    modeTitle: 'تنافس فوري',
    name: 'المجموعة المغلقة الثانية (G1-B)',
    members: ['G1_Cp_04', 'G1_Cp_05', 'G1_Cp_06'],
    description: 'فريق المجموعة الثانية (G1_Cp_04, G1_Cp_05, G1_Cp_06) مع المشرف (Admin)',
  },
  'G1-C': {
    code: 'G1-C',
    subCode: 'C',
    modeCode: 'G1',
    modeTitle: 'تنافس فوري',
    name: 'المجموعة المغلقة الثالثة (G1-C)',
    members: ['G1_Cp_07', 'G1_Cp_08', 'G1_Cp_09'],
    description: 'فريق المجموعة الثالثة (G1_Cp_07, G1_Cp_08, G1_Cp_09) مع المشرف (Admin)',
  },
  'G1-D': {
    code: 'G1-D',
    subCode: 'D',
    modeCode: 'G1',
    modeTitle: 'تنافس فوري',
    name: 'المجموعة المغلقة الرابعة (G1-D)',
    members: ['G1_Cp_10', 'G1_Cp_11', 'G1_Cp_12'],
    description: 'فريق المجموعة الرابعة (G1_Cp_10, G1_Cp_11, G1_Cp_12) مع المشرف (Admin)',
  },
  'G1-E': {
    code: 'G1-E',
    subCode: 'E',
    modeCode: 'G1',
    modeTitle: 'تنافس فوري',
    name: 'المجموعة المغلقة الخامسة (G1-E)',
    members: ['G1_Cp_13', 'G1_Cp_14', 'G1_Cp_15'],
    description: 'فريق المجموعة الخامسة (G1_Cp_13, G1_Cp_14, G1_Cp_15) مع المشرف (Admin)',
  },

  // === نمط التنافس المرجأ (G2) - 5 مجموعات ثلاثية مغلقة ===
  'G2-A': {
    code: 'G2-A',
    subCode: 'A',
    modeCode: 'G2',
    modeTitle: 'تنافس مرجأ',
    name: 'المجموعة المغلقة الأولى (G2-A)',
    members: ['G2_Cp_01', 'G2_Cp_02', 'G2_Cp_03'],
    description: 'فريق المجموعة الأولى (G2_Cp_01, G2_Cp_02, G2_Cp_03) مع المشرف (Admin)',
  },
  'G2-B': {
    code: 'G2-B',
    subCode: 'B',
    modeCode: 'G2',
    modeTitle: 'تنافس مرجأ',
    name: 'المجموعة المغلقة الثانية (G2-B)',
    members: ['G2_Cp_04', 'G2_Cp_05', 'G2_Cp_06'],
    description: 'فريق المجموعة الثانية (G2_Cp_04, G2_Cp_05, G2_Cp_06) مع المشرف (Admin)',
  },
  'G2-C': {
    code: 'G2-C',
    subCode: 'C',
    modeCode: 'G2',
    modeTitle: 'تنافس مرجأ',
    name: 'المجموعة المغلقة الثالثة (G2-C)',
    members: ['G2_Cp_07', 'G2_Cp_08', 'G2_Cp_09'],
    description: 'فريق المجموعة الثالثة (G2_Cp_07, G2_Cp_08, G2_Cp_09) مع المشرف (Admin)',
  },
  'G2-D': {
    code: 'G2-D',
    subCode: 'D',
    modeCode: 'G2',
    modeTitle: 'تنافس مرجأ',
    name: 'المجموعة المغلقة الرابعة (G2-D)',
    members: ['G2_Cp_10', 'G2_Cp_11', 'G2_Cp_12'],
    description: 'فريق المجموعة الرابعة (G2_Cp_10, G2_Cp_11, G2_Cp_12) مع المشرف (Admin)',
  },
  'G2-E': {
    code: 'G2-E',
    subCode: 'E',
    modeCode: 'G2',
    modeTitle: 'تنافس مرجأ',
    name: 'المجموعة المغلقة الخامسة (G2-E)',
    members: ['G2_Cp_13', 'G2_Cp_14', 'G2_Cp_15'],
    description: 'فريق المجموعة الخامسة (G2_Cp_13, G2_Cp_14, G2_Cp_15) مع المشرف (Admin)',
  },

  // === نمط التعاون الفوري (G3) - 5 مجموعات ثلاثية مغلقة ===
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

  // === نمط التعاون المرجأ (G4) - 5 مجموعات ثلاثية مغلقة ===
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
 * Returns the exact 3-student closed triad code ('G1-A'..'G4-E') for all students across the five groups
 */
export function getCollaborativeGroupByUsername(username: string): CollaborativeGroupCode | null {
  const norm = normalizeStudentUsername(username).toUpperCase();
  const match = norm.match(/^G([1-4])_CP_(\d{2})$/);
  if (match) {
    const grp = `G${match[1]}` as 'G1' | 'G2' | 'G3' | 'G4';
    const n = parseInt(match[2], 10);
    let sub: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';
    if (n >= 1 && n <= 3) sub = 'A';
    else if (n >= 4 && n <= 6) sub = 'B';
    else if (n >= 7 && n <= 9) sub = 'C';
    else if (n >= 10 && n <= 12) sub = 'D';
    else if (n >= 13 && n <= 15) sub = 'E';
    return `${grp}-${sub}` as CollaborativeGroupCode;
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

/**
 * Returns all students belonging to a specific group code (e.g. 'G1', 'G2', 'G3', 'G4')
 * Uses the generated SIXTY_STUDENT_USERS array.
 */
export function getStudentsByGroupCode(
  groupCode: string
): Array<{ username: string; fullName: string; groupCode: string }> {
  const normalized = groupCode.trim().toUpperCase();
  return SIXTY_STUDENT_USERS
    .filter((s) => (s.groupCode || '').toUpperCase() === normalized)
    .map((s) => ({
      username: s.username,
      fullName: s.fullName || s.username,
      groupCode: normalized,
    }));
}

/**
 * Returns all students belonging to a collaborative triad (e.g. 'G3-A', 'G4-B')
 * Useful when you want to reset a single collaborative sub-group instead of a whole main group.
 */
export function getStudentsByCollaborativeGroup(
  collabCode: string
): Array<{ username: string; fullName: string; groupCode: string }> {
  const normalized = collabCode.trim().toUpperCase();
  const def = COLLABORATIVE_GROUPS_DEF[normalized];
  if (!def) return [];
  return def.members.map((u) => ({
    username: u,
    fullName: u,
    groupCode: def.modeCode,
  }));
}
