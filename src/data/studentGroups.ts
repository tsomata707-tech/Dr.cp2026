export const STUDENT_GROUPS = {
  'student1': 'A', 'student2': 'A', 'student3': 'A',
  'student4': 'B', 'student5': 'B', 'student6': 'B',
  'student7': 'C', 'student8': 'C', 'student9': 'C',
  'student10': 'D', 'student11': 'D', 'student12': 'D',
  'student13': 'E', 'student14': 'E', 'student15': 'E',
};

export const getStudentGroup = (username: string): string | null => {
  return STUDENT_GROUPS[username as keyof typeof STUDENT_GROUPS] || null;
};
