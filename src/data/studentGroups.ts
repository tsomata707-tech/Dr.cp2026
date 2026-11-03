import { getCollaborativeGroupByUsername, getGroupByUsername } from './studentAccounts';

export const getStudentGroup = (username: string): string | null => {
  // Returns the sub-group letter (A, B, C, D, or E)
  const collabGroup = getCollaborativeGroupByUsername(username);
  if (collabGroup) {
    const parts = collabGroup.split('-');
    return parts[1] || null;
  }
  return null;
};

export const getStudentFullGroupCode = (username: string): string | null => {
  // Returns the full code like G3-A
  return getCollaborativeGroupByUsername(username);
};

