export interface AdminSettings {
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  whatsappEnabled: boolean;
  adminPasswordHash: string; // Stored securely in localStorage
  systemName: string;
  maintenanceMode: boolean;
  allowLogins: boolean;
}

export interface PortalUser {
  id: string;
  username: string;
  fullName: string;
  role: 'member' | 'supervisor' | 'analyst';
  password: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  groupCode?: 'G1' | 'G2' | 'G3' | 'G4';
  groupId?: 'grp-1' | 'grp-2' | 'grp-3' | 'grp-4';
  groupName?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ip: string;
  status: 'success' | 'warning' | 'error';
}

export interface CartoonAvatar {
  id: string;
  name: string;
  title: string;
  emoji: string;
  bgGradient: string;
  borderClass: string;
  description: string;
}

export interface MatchingPairItem {
  id: string;
  text: string;
  imageUrl: string;
}

export interface LevelQuestion {
  id: string;
  question: string;
  options: string[];
  optionImages?: (string | null | undefined)[];
  correctIndex: number;
  explanation: string;
  points: number;
  imageUrl?: string;
  levelNumber?: number;
  questionType?: 'mcq' | 'matching';
  matchingPairs?: MatchingPairItem[];
  layout?: 'grid' | 'stacked';
}

export interface CompletedLevelResult {
  levelNumber: number;
  score: number;
  maxScore: number;
  answers: Record<string, number>; // questionId -> chosenIndex
  questionScores?: Record<string, number>; // questionId -> 1 or 0
  completedAt: string;
  timeSpentSeconds: number;
  feedbackRevealedToStudent: boolean; // true for G1 & G3, false for G2 & G4
}

export interface PreTestQuestion {
  id: string;
  question: string;
  options: string[];
  optionImages?: (string | null | undefined)[];
  correctIndex: number;
  explanation: string;
  points: number;
  imageUrl?: string;
  questionType?: 'mcq' | 'matching';
  matchingPairs?: MatchingPairItem[];
  layout?: 'grid' | 'stacked';
}

export interface QuestionAnswerDetail {
  chosenIndex: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface PreTestResult {
  completed: boolean;
  score: number;
  maxScore: number;
  answers: Record<string, number>; // questionId -> chosenIndex
  questionScores?: Record<string, number>; // questionId -> 1 or 0
  questionDetails?: Record<string, QuestionAnswerDetail>; // questionId -> detail
  completedAt: string;
  timeSpentSeconds: number;
  passed: boolean;
}

export interface LevelMediaItem {
  id: string;
  title: string;
  partCustomTitle?: string; // Admin customized title e.g. "شرح السؤال 1: معمارية Captivate"
  url: string;
  type: 'video' | 'image' | 'pdf';
  format?: string;
  size?: number;
  addedAt?: string;
}

export interface StudentActivitySubmission {
  id?: string;
  fileUrl: string;
  fileName: string;
  fileType: 'video' | 'image' | 'pdf' | string;
  fileSize?: number;
  uploadedAt: string;
  notes?: string;
  studentUsername?: string;
  studentFullName?: string;
  groupCode?: string;
  levelNumber?: number;
  activityTitle?: string;
  grade?: number | null;
  maxPoints?: number;
  feedback?: string;
  status?: 'pending' | 'graded';
  gradedAt?: string;
  gradedBy?: string;
}

export interface LevelActivityConfig {
  levelNumber: number;
  activityTitle: string;
  instructions: string;
  maxPoints: number;
  updatedAt?: string;
}

export interface StudentGameProgress {
  username: string;
  avatarId: string;
  customPhotoUrl?: string; // Student custom uploaded photo from their device
  currentLevel: number; // 1 to 9
  completedLevels: Record<number, CompletedLevelResult>;
  studentActivities?: Record<number, StudentActivitySubmission>; // Level 1..9 activities uploaded by student
  preTestResult?: PreTestResult;
  postTestResult?: PreTestResult;
  totalScore: number;
  hearts: number;
  badges: string[];
  lastActive: string;
}

export interface RealtimeStudentParticipant {
  username: string;
  fullName: string;
  avatarEmoji: string;
  avatarId: string;
  joinedAt: string;
  lastPing: number;
  isOnline: boolean;
}

export interface RealtimeQuestionAnswer {
  selectedOption: number;
  selectedBy: string;
  studentName: string;
  avatarEmoji: string;
  updatedAt: string;
}

export interface RealtimeVote {
  username: string;
  studentName: string;
  avatarEmoji: string;
  optionIndex: number;
}

export interface LiveRoomEvent {
  id: string;
  text: string;
  time: string;
  type: 'answer' | 'join' | 'submit' | 'info';
  actorName?: string;
  actorEmoji?: string;
}

export interface GroupRoomState {
  groupId: string; // 'G1' | 'G2' | 'G3' | 'G4'
  activeLevel: number;
  currentAnswers: Record<string, RealtimeQuestionAnswer>;
  votes: Record<string, Record<string, RealtimeVote>>; // questionId -> (username -> vote)
  activeStudents: Record<string, RealtimeStudentParticipant>;
  completedLevels: Record<number, CompletedLevelResult>;
  liveEvents: LiveRoomEvent[];
  lastUpdatedAt: string;
}

export interface VideoSlotDef {
  slotId: string;
  name: string;
  levelNumber?: number;
  description: string;
  recommendedDuration: string;
}

export interface EducationalVideo {
  id: string;
  title: string;
  description?: string;
  targetSlotId: string; // e.g. 'level-1', 'level-2', ..., 'level-10', 'app-task'
  targetSlotName: string;
  videoUrl: string; // YouTube, MP4 or file
  videoType: 'youtube' | 'mp4' | 'embed' | 'file';
  duration?: string;
  partNumber?: number; // 1, 2, 3, 4, 5 (up to 5 videos per topic)
  partTitle?: string; // e.g. "الجزء 1: مقدمة في التثبيت"
  partCustomTitle?: string; // Custom part title set by admin according to question, e.g. "شرح السؤال الأول"
  addedAt: string;
  updatedAt?: string;
  isActive: boolean;
  blobId?: string;
}

export interface ResearcherInfo {
  name: string;
  title: string;
  role: string;
  imageUrl: string;
  degree?: string;
  accentColor?: string;
}

export interface SupervisorCard {
  id: string;
  cardIndex: number; // 1, 2, 3...
  cardLabel: string; // "البطاقة 1", "البطاقة 2"...
  name: string;
  title: string;
  role: string;
  imageUrl: string; // jpg file or URL
  accentColor?: string;
}

export interface SupervisorsHonorBoardConfig {
  boardTitle: string; // Golden main title
  boardSubtitle: string;
  university: string;
  researcher?: string;
  researcherInfo?: ResearcherInfo;
  researchTitle?: string;
  showOnStudentLogin?: boolean;
  supervisors: SupervisorCard[];
  updatedAt: string;
}

