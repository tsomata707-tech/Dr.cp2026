import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Gamepad2,
  Trophy,
  Flame,
  Heart,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Zap,
  HelpCircle,
  Eye,
  RefreshCw,
  Award,
  ChevronRight,
  Star,
  Users,
  Radio,
  Wifi,
  Volume2,
  Video,
  Play,
  Home,
  Upload,
  FileText,
  Trash2,
  Image as ImageIcon,
  X,
  FileCheck,
  Target,
} from 'lucide-react';
import { CARTOON_AVATARS, GAME_LEVELS_DATA, GameLevelDef } from '../data/gameLevelsData';
import {
  getStudentProgress,
  submitLevelChallenge,
  updateStudentAvatar,
  saveStudentLevelActivity,
} from '../utils/gameStorage';
import { useEducationalVideos } from '../utils/videoStorage';
import { MultiPartVideoPlayer } from './MultiPartVideoPlayer';
import { GameLevelUnlockLoader } from './GameLevelUnlockLoader';
import { DraggableLevelInstructions } from './DraggableLevelInstructions';
import { LevelTransitionLoader5s } from './LevelTransitionLoader5s';
import { getGroupByUsername, getStudentByUsername, RESEARCH_GROUPS_META } from '../data/studentAccounts';
import {
  StudentGameProgress,
  CompletedLevelResult,
  GroupRoomState,
  RealtimeQuestionAnswer,
  RealtimeVote,
  RealtimeStudentParticipant,
  StudentActivitySubmission,
  LevelMediaItem,
  EducationalVideo,
} from '../types';
import {
  subscribeToGroupRoom,
  joinGroupRoom,
  selectQuestionOptionRealtime,
  submitGroupLevelRealtime,
  syncStudentProgressToFirestore,
  getDefaultRoomState,
} from '../utils/realtimeService';

interface EducationalGameViewProps {
  username: string;
  onBackToHome?: () => void;
  onCompleteAllLevels?: () => void;
  selectedGroupId?: string;
}

export const EducationalGameView: React.FC<EducationalGameViewProps> = ({
  username,
  onBackToHome,
  onCompleteAllLevels,
  selectedGroupId,
}) => {
  const isAdmin = username.trim().toLowerCase() === 'admin';
  const [progress, setProgress] = useState<StudentGameProgress>(() => getStudentProgress(username));
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(() => Math.min(9, progress.currentLevel));
  const [chosenAnswers, setChosenAnswers] = useState<Record<string, number>>({});
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(true);
  const [loadingLevelForGame, setLoadingLevelForGame] = useState<GameLevelDef | null>(null);

  // 5-second transition state as requested: "وبعدها شريط تحميل ٥ ثواني مكتوب أعلاه جاري الانتقال الي ليفل ٢"
  const [isTransitioning5s, setIsTransitioning5s] = useState<boolean>(false);
  const [transitionTargetLevel, setTransitionTargetLevel] = useState<number>(2);

  // Student level activity upload state (نشاطك الخاص)
  const activityFileInputRef = useRef<HTMLInputElement | null>(null);
  const [studentActivity, setStudentActivity] = useState<StudentActivitySubmission | null>(
    () => progress.studentActivities?.[selectedLevelNum] || null
  );
  const [previewMediaZoom, setPreviewMediaZoom] = useState<LevelMediaItem | null>(null);
  const currentLevelVideos = useEducationalVideos(`level-${selectedLevelNum}`);
  const [feedbackModal, setFeedbackModal] = useState<{
    result: CompletedLevelResult;
    isImmediate: boolean;
    levelDef: GameLevelDef;
  } | null>(null);

  // Group metadata: for admin, resolve dynamically based on selectedGroupId (allowing admin to enter and inspect ANY group)
  const userGroupMeta = useMemo(() => {
    if (isAdmin && selectedGroupId) {
      const codeMap: Record<string, 'G1' | 'G2' | 'G3' | 'G4'> = {
        'grp-1': 'G1',
        'grp-2': 'G2',
        'grp-3': 'G3',
        'grp-4': 'G4',
      };
      const code = codeMap[selectedGroupId] || 'G1';
      return RESEARCH_GROUPS_META[code] || null;
    }
    return getGroupByUsername(username);
  }, [username, isAdmin, selectedGroupId]);

  const groupCode = userGroupMeta?.code || 'G1';
  const isCollaborative = userGroupMeta?.learningMode === 'تعاوني';
  const isImmediateGroup = userGroupMeta ? userGroupMeta.feedbackMode === 'فورية' : true;
  const studentInfo = useMemo(() => getStudentByUsername(username), [username]);

  // Real-time group room state from Firebase Firestore
  const [roomState, setRoomState] = useState<GroupRoomState>(() => getDefaultRoomState(groupCode));
  const [isConnectedToFirebase, setIsConnectedToFirebase] = useState<boolean>(true);

  // Always scroll to top when changing levels or mounting
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [selectedLevelNum]);

  // Sync progress from local storage
  useEffect(() => {
    const current = getStudentProgress(username);
    setProgress(current);
    setSelectedLevelNum(current.currentLevel);
  }, [username]);

  // Current avatar
  const currentAvatar =
    CARTOON_AVATARS.find((a) => a.id === progress.avatarId) || CARTOON_AVATARS[0];

  // Subscribe to Firebase Firestore real-time room
  useEffect(() => {
    const unsub = subscribeToGroupRoom(groupCode, (updatedRoom) => {
      setRoomState(updatedRoom);
      setIsConnectedToFirebase(true);

      // In real-time collaborative rooms, sync questions answers when updated by peers
      if (updatedRoom.currentAnswers && Object.keys(updatedRoom.currentAnswers).length > 0) {
        setChosenAnswers((prev) => {
          const next = { ...prev };
          Object.entries(updatedRoom.currentAnswers).forEach(([qId, ansObj]) => {
            if (ansObj && typeof ansObj.selectedOption === 'number') {
              next[qId] = ansObj.selectedOption;
            }
          });
          return next;
        });
      }
    });

    // Announce presence to all 15 students in this group
    joinGroupRoom(groupCode, {
      username,
      fullName: studentInfo?.fullName || `طالب (${username})`,
      avatarEmoji: currentAvatar.emoji,
      avatarId: currentAvatar.id,
    });

    return () => {
      unsub();
    };
  }, [groupCode, username, studentInfo, currentAvatar]);

  // Current level definition
  const currentLevelDef =
    GAME_LEVELS_DATA.find((l) => l.levelNumber === selectedLevelNum) || GAME_LEVELS_DATA[0];

  // Status of the currently viewed level
  const isLevelCompleted = !!progress.completedLevels[selectedLevelNum];
  const completedResult = progress.completedLevels[selectedLevelNum];
  const isLevelUnlocked = selectedLevelNum <= progress.currentLevel;

  // Handle option selection with Real-time broadcast to all 15 students
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isLevelCompleted) return; // Cannot modify if already completed

    // Update local state instantly (admin can preview interactive choices locally)
    setChosenAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));

    // Broadcast in real-time to Firebase Firestore for regular students (admin is read-only)
    if (!isAdmin) {
      selectQuestionOptionRealtime(groupCode, selectedLevelNum, questionId, optionIndex, {
        username,
        fullName: studentInfo?.fullName || username,
        avatarEmoji: currentAvatar.emoji,
      });
    }
  };

  // Sync student activity when level changes
  useEffect(() => {
    setStudentActivity(progress.studentActivities?.[selectedLevelNum] || null);
  }, [selectedLevelNum, progress]);

  // Handle uploading special activity (Video, Image, or PDF)
  const handleUploadActivity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    const fileType: 'video' | 'image' | 'pdf' = isVid ? 'video' : isPdf ? 'pdf' : 'image';

    const reader = new FileReader();
    reader.onload = () => {
      const fileUrl = reader.result as string;
      const submission: StudentActivitySubmission = {
        fileUrl,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      };

      const updatedProg = saveStudentLevelActivity(username, selectedLevelNum, submission);
      setProgress(updatedProg);
      setStudentActivity(submission);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveActivity = () => {
    if (progress.studentActivities && progress.studentActivities[selectedLevelNum]) {
      const updatedProg = { ...progress };
      if (updatedProg.studentActivities) {
        delete updatedProg.studentActivities[selectedLevelNum];
      }
      setProgress(updatedProg);
      setStudentActivity(null);
    }
  };

  // Finish Level Click: triggers 5-second loading bar
  // "ثم زر finish level 1 وبعدها شريط تحميل ٥ ثواني مكتوب أعلاه جاري الانتقال الي ليفل ٢ وهكذا الي ان تنتهي ال ٩ ليفل"
  const handleFinishLevelClick = async () => {
    if (!isAdmin && !studentActivity) {
      alert('يرجى رفع نشاطك الخاص لهذا المستوى أولاً (فيديو أو صورة أو PDF) لإكمال المستوى');
      return;
    }

    if (!isAdmin && Object.keys(chosenAnswers).length < currentLevelDef.questions.length) {
      alert('يرجى الإجابة على جميع الأسئلة قبل الانتقال للمستوى التالي');
      return;
    }

    if (isAdmin) {
      // In read-only admin mode, advance level without saving or polluting scores
      const nextLvl = selectedLevelNum + 1;
      setTransitionTargetLevel(nextLvl);
      setIsTransitioning5s(true);
      return;
    }

    const { progress: updatedProgress, levelResult, isImmediateFeedback } = submitLevelChallenge(
      username,
      selectedLevelNum,
      chosenAnswers,
      60
    );

    // Sync to Firebase
    await submitGroupLevelRealtime(groupCode, selectedLevelNum, chosenAnswers, {
      username,
      fullName: studentInfo?.fullName || username,
      avatarEmoji: currentAvatar.emoji,
    });
    await syncStudentProgressToFirestore(updatedProgress);
    setProgress(updatedProgress);

    // Launch 5-second transition loader with heading
    const nextLvl = selectedLevelNum + 1;
    setTransitionTargetLevel(nextLvl);
    setIsTransitioning5s(true);
  };

  const handle5sTransitionComplete = () => {
    setIsTransitioning5s(false);
    if (selectedLevelNum < 9) {
      const nextLvl = selectedLevelNum + 1;
      setSelectedLevelNum(nextLvl);
      const freshProg = getStudentProgress(username);
      setProgress(freshProg);
      setChosenAnswers({});
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      // Completed Level 9! Transfer to Post-Test
      if (onCompleteAllLevels) {
        onCompleteAllLevels();
      }
      window.dispatchEvent(new CustomEvent('cp_navigate_to_posttest'));
    }
  };

  // Submit level challenge with Real-time sync to Firestore
  const handleSubmitChallenge = async () => {
    handleFinishLevelClick();
  };

  const handleNextLevel = () => {
    setFeedbackModal(null);
    if (selectedLevelNum < 9) {
      setSelectedLevelNum(selectedLevelNum + 1);
    } else {
      if (onCompleteAllLevels) {
        onCompleteAllLevels();
      }
      window.dispatchEvent(new CustomEvent('cp_navigate_to_posttest'));
    }
  };

  return (
    <div className="space-y-6 text-right" id="educational-game-arena">
      {/* Admin Read-Only Notice Banner */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#0d1815] to-emerald-950/90 border-2 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm font-['Cairo'] text-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shrink-0 shadow-inner">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-emerald-300 font-['Tajawal'] text-sm sm:text-base">
                  وضع استعراض المشرف (حساب للقراءة فقط 👁️)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 border border-emerald-400/50 text-[11px] text-emerald-200 font-bold">
                  {userGroupMeta?.name || 'مجموعة تجريبية'} ({groupCode})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                يمكنك التنقل بين المستويات الـ 9 واختبار أي مجموعة وتجربة الأسئلة بحرية، ولن يتم احتساب أو اعتماد أي إجابات أو تعديلات على درجات وبيانات المنظومة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 0. RETURN TO STUDENT HOME BUTTON (🏠 الصفحة الخاصة للطالب) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#0c1024]/95 border-2 border-amber-500/60 shadow-[0_0_25px_rgba(255,215,0,0.2)]">
        <button
          type="button"
          onClick={() => {
            if (onBackToHome) {
              onBackToHome();
            } else {
              window.dispatchEvent(new CustomEvent('cp_navigate_to_student_home'));
            }
          }}
          id="btn-game-back-to-student-home"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Home className="w-4 h-4 text-slate-950" />
          <span>العودة للرئيسية 🏠</span>
        </button>

        <span className="text-xs text-amber-300 font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>أنت الآن في: لعبة التحدي للمستوى {selectedLevelNum} ({currentLevelDef.shortTitle})</span>
        </span>
      </div>

      {/* 1. TOP GAME HUD (Header Bar) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0d0a1a] via-[#141029] to-[#0d0a1a] border-2 border-[#d4af37] p-5 sm:p-7 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Avatar & Player Profile */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div
              onClick={() => setShowAvatarModal(true)}
              className="relative group cursor-pointer"
              title="انقر لتغيير الشخصية الكرتونية"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border-2 border-[#ffd700] flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-105 transition-all overflow-hidden relative">
                {progress.customPhotoUrl ? (
                  <img
                    src={progress.customPhotoUrl}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentAvatar.emoji}</span>
                )}
              </div>
              <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-md bg-[#ffd700] text-slate-950 text-[9px] font-black shadow flex items-center gap-0.5">
                <RefreshCw className="w-2.5 h-2.5" />
                تغيير
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-amber-300 text-[11px] font-bold font-['Cairo']">
                  {currentAvatar.title}
                </span>
                {userGroupMeta && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border font-['Cairo'] shadow-sm ${
                      userGroupMeta.feedbackMode === 'فورية'
                        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                        : 'bg-purple-950/80 border-purple-500/60 text-purple-300'
                    }`}
                  >
                    {userGroupMeta.name}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] mt-1 flex items-center gap-2">
                <span className="text-[#ffd700] font-mono">{username}</span>
              </h2>

              <p className="text-xs text-slate-300 font-['Cairo'] mt-0.5 max-w-md line-clamp-1">
                {currentAvatar.description}
              </p>
            </div>
          </div>

          {/* Game Stats (XP Points, Level, Hearts, Streak) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            {/* Total XP Points */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-[#ffd700]/50 text-center shadow-[0_0_15px_rgba(255,215,0,0.15)]">
              <div className="flex items-center justify-center gap-1 text-[#ffd700] text-xs font-bold font-['Cairo'] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>النقاط الذهبية</span>
              </div>
              <span className="text-xl font-black text-white font-['Outfit']">
                {progress.totalScore} <span className="text-xs text-[#ffd700]">XP</span>
              </span>
            </div>

            {/* Level Counter */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/50 text-center">
              <div className="flex items-center justify-center gap-1 text-purple-300 text-xs font-bold font-['Cairo'] mb-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>المستوى الحالي</span>
              </div>
              <span className="text-xl font-black text-purple-200 font-['Outfit']">
                {progress.currentLevel} <span className="text-xs text-slate-400">/ 9</span>
              </span>
            </div>

            {/* Hearts (طاقة المحاولة) */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-rose-500/50 text-center">
              <div className="flex items-center justify-center gap-1 text-rose-300 text-xs font-bold font-['Cairo'] mb-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>طاقة المحاولة</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-base pt-0.5">
                {[1, 2, 3].map((h) => (
                  <span key={h} className="text-rose-500 animate-pulse">❤️</span>
                ))}
              </div>
            </div>

            {/* Badges Earned */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/50 text-center">
              <div className="flex items-center justify-center gap-1 text-cyan-300 text-xs font-bold font-['Cairo'] mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>الأوسمة المكتسبة</span>
              </div>
              <span className="text-xl font-black text-cyan-200 font-['Outfit']">
                {progress.badges.length} <span className="text-xs text-slate-400">أوسمة</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GAME PROGRESS MAP (The 9 Levels Track) */}
      <div className="rounded-3xl bg-[#0b0914] border-2 border-slate-800 p-5 sm:p-6 text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#ffd700]" />
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
              مراحل بيئة الألعاب (9 مستويات تفاعلية)
            </h3>
          </div>
          <span className="text-xs text-amber-300 font-['Cairo']">
            المستوى الذي تُعتمد إجاباته ويُسلّم نشاطه يُقفل تلقائياً للمتابعة للأمام
          </span>
        </div>

        {/* 9 Level Nodes Horizontal / Grid Track */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
          {GAME_LEVELS_DATA.map((lvl) => {
            const isCompleted = !!progress.completedLevels[lvl.levelNumber];
            const isCurrent = lvl.levelNumber === progress.currentLevel && !isCompleted;
            const isUpcoming = lvl.levelNumber > progress.currentLevel;
            const isSelected = lvl.levelNumber === selectedLevelNum;

            return (
              <button
                key={lvl.levelNumber}
                type="button"
                onClick={() => {
                  if (isUpcoming) {
                    return;
                  }
                  if (lvl.levelNumber === 1 || lvl.levelNumber !== selectedLevelNum) {
                    setLoadingLevelForGame(lvl);
                  } else {
                    setSelectedLevelNum(lvl.levelNumber);
                  }
                }}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-[#ffd700] scale-105'
                    : 'hover:scale-102'
                } ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-300'
                    : isCurrent
                    ? 'bg-amber-950/60 border-[#ffd700] text-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.3)] animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                {/* Level Icon/Badge */}
                <div className="text-xl mb-1">
                  {isCompleted ? (
                    '🔒'
                  ) : isCurrent ? (
                    '⚡'
                  ) : (
                    '⏳'
                  )}
                </div>

                <span className="text-xs font-black font-['Outfit']">
                  L{lvl.levelNumber}
                </span>

                <span className="text-[10px] font-bold font-['Cairo'] line-clamp-1 mt-0.5">
                  {lvl.shortTitle}
                </span>

                {/* Sub status tag */}
                <span className="text-[9px] mt-1 font-mono">
                  {isCompleted
                    ? 'مكتمل ومتقن'
                    : isCurrent
                    ? 'نشط الآن'
                    : 'قيد الانتظار'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE LEVEL MISSION & CHALLENGE ARENA */}
      <div className="rounded-3xl bg-[#0f0c1f] border-2 border-[#d4af37] p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.2)] text-right">
        {/* Mission Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-[#ffd700] text-slate-950 text-xs font-black font-['Cairo']">
                المستوى {currentLevelDef.levelNumber} من 9
              </span>
              <span className="px-3 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 text-xs font-bold font-['Cairo']">
                الجائزة: {currentLevelDef.badgeEmoji} {currentLevelDef.badgeName}
              </span>
              {isLevelCompleted && (
                <span className="px-3 py-0.5 rounded-full bg-red-950/80 border border-red-500 text-red-300 text-xs font-bold font-['Cairo'] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-red-400" />
                  مستوى مكتمل ومقفل نهائياً
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] mt-2">
              {currentLevelDef.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-['IBM_Plex_Sans_Arabic'] mt-2 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              🎯 <strong className="text-amber-300">السيناريو والمهمة الكرتونية:</strong> {currentLevelDef.storyMission}
            </p>

            {selectedLevelNum === 9 && (currentLevelDef.objectives || currentLevelDef.instructions) && (
              <div className="text-xs sm:text-sm text-cyan-200 font-['IBM_Plex_Sans_Arabic'] mt-3 leading-relaxed bg-cyan-950/40 p-3.5 rounded-2xl border border-cyan-500/40 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span>🎯 أهداف المستوى 9:</span>
                </div>
                <p className="whitespace-pre-line text-slate-200 text-xs">
                  {currentLevelDef.objectives || currentLevelDef.instructions}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">إجمالي النقاط المتاحة</span>
              <span className="text-xl font-black text-amber-300 font-['Outfit']">
                {currentLevelDef.questions.length * 50} XP
              </span>
            </div>
          </div>
        </div>

        {/* 🌟 STAGE VIDEOS (تتسع حتى 5 فيديوهات وفق متطلبات الأدمن) */}
        {((currentLevelDef.videos && currentLevelDef.videos.length > 0) || currentLevelVideos.length > 0) && (
          <div className="my-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 font-['Cairo'] flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-400" />
                <span>فيديوهات شرح المستوى {selectedLevelNum} ({(currentLevelDef.videos?.length || 0) + currentLevelVideos.length} فيديو متاح):</span>
              </span>

              <button
                type="button"
                onClick={() => setIsVideoOpen(!isVideoOpen)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 border border-blue-500/50 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isVideoOpen ? 'إخفاء الفيديوهات' : 'عرض مشغل الفيديوهات'}</span>
              </button>
            </div>

            {isVideoOpen && (
              <MultiPartVideoPlayer
                videos={[
                  ...(currentLevelDef.videos || []).map((v, idx): EducationalVideo => ({
                    id: v.id,
                    title: v.title,
                    targetSlotId: `level-${selectedLevelNum}`,
                    targetSlotName: `المستوى ${selectedLevelNum}`,
                    videoUrl: v.url,
                    videoType: 'file',
                    partNumber: idx + 1,
                    partTitle: v.title,
                    addedAt: v.addedAt || new Date().toISOString(),
                    isActive: true,
                  })),
                  ...currentLevelVideos.filter(
                    (cv) => !(currentLevelDef.videos || []).some((v) => v.url === cv.videoUrl)
                  ),
                ]}
                title={`شرح المستوى ${selectedLevelNum}: ${currentLevelDef.title}`}
              />
            )}
          </div>
        )}

        {/* 🖼️ STAGE IMAGES & PDF DOCUMENTS (تتسع حتى 5 صور أو ملفات PDF مع إمكانية المعاينة والتكبير) */}
        {currentLevelDef.images && currentLevelDef.images.length > 0 && (
          <div className="my-6 p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-300 font-['Cairo'] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>{currentLevelDef.imagesSectionTitle || `صور ومستندات المستوى ${selectedLevelNum} (${currentLevelDef.images.length} ملفات):`}</span>
              </span>
              <span className="text-[11px] text-slate-300 font-semibold">
                {currentLevelDef.imagesSectionDesc || 'إمكانية رفع حتى 5 صور أو ملفات PDF بحد أقصى (يقبل جميع امتدادات الصور PNG, JPG, WebP, GIF, SVG و PDF مع إمكانية التبديل)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {currentLevelDef.images.map((imgItem) => (
                <div
                  key={imgItem.id}
                  onClick={() => setPreviewMediaZoom(imgItem)}
                  className="rounded-xl overflow-hidden border border-slate-700 hover:border-amber-400 bg-black/50 p-2 cursor-pointer transition-transform hover:scale-105 flex flex-col items-center justify-center text-center space-y-1.5 group"
                >
                  {imgItem.type === 'pdf' ? (
                    <div className="w-full h-24 rounded-lg bg-rose-500/15 border border-rose-500/40 flex flex-col items-center justify-center text-rose-300">
                      <FileText className="w-8 h-8" />
                      <span className="text-[10px] font-mono font-bold mt-1">PDF مستند</span>
                    </div>
                  ) : (
                    <img
                      src={imgItem.url}
                      alt={imgItem.title}
                      className="w-full h-24 object-contain rounded-lg"
                    />
                  )}
                  <span className="text-[10px] font-bold text-slate-300 line-clamp-1 group-hover:text-amber-300">
                    {imgItem.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2.5 REAL-TIME COLLABORATIVE LIVE BAR (FIREBASE SYNC) */}
        <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-300 font-['Tajawal'] flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  التزامن اللحظي المباشر للجلسة التفاعلية
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-[10px] font-bold border border-purple-400/30">
                  غرفة {userGroupMeta ? userGroupMeta.name : groupCode}
                </span>
              </div>
            </div>

            {/* Active Peers Counter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-['Cairo']">
                الطلاب المتصلين بالغرفة الآن:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffd700]/20 border border-[#ffd700] text-[#ffd700] text-xs font-black font-mono">
                {(Object.values(roomState.activeStudents || {}) as RealtimeStudentParticipant[]).filter((s) => s.isOnline).length || 1} من 15
              </span>
            </div>
          </div>

          {/* Active Members Avatars Ribbon */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-['Cairo'] flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              أعضاء المجموعة المتفاعلون:
            </span>
            {(Object.values(roomState.activeStudents || {}) as RealtimeStudentParticipant[]).map((participant) => (
              <div
                key={participant.username}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all ${
                  participant.username === username
                    ? 'bg-amber-500/20 border-[#ffd700] text-amber-200 font-bold'
                    : 'bg-slate-950/80 border-slate-700 text-slate-300'
                }`}
                title={participant.fullName}
              >
                <span className="text-sm">{participant.avatarEmoji}</span>
                <span className="text-[11px] font-bold font-['Cairo']">
                  {participant.username} {participant.username === username ? '(أنت)' : ''}
                </span>
              </div>
            ))}
          </div>


          {/* Live Activity Marquee Ticker */}
          {roomState.liveEvents && roomState.liveEvents.length > 0 && (
            <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-300/90 font-['Cairo'] bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="font-bold text-slate-400 shrink-0">آخر حركة لحظية:</span>
              <span className="truncate font-['Cairo'] text-slate-200">
                {roomState.liveEvents[0].text}
              </span>
              <span className="text-[9px] font-mono text-slate-500 mr-auto shrink-0">
                {roomState.liveEvents[0].time}
              </span>
            </div>
          )}
        </div>

        {/* LOCKED NOTICE IF LEVEL ALREADY COMPLETED */}
        {isLevelCompleted && (
          <div className="my-6 p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-500/60 flex items-center gap-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center shrink-0 text-amber-300">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-200 font-['Tajawal']">
                المستوى {selectedLevelNum} معتمد
              </h4>
              {isImmediateGroup && completedResult && (
                <p className="text-xs text-slate-300 font-['Cairo'] mt-0.5">
                  النتيجة: {completedResult.score} من {completedResult.maxScore} XP
                </p>
              )}
            </div>
          </div>
        )}


        {/* LEVEL 9 ACTIVITIES BANNER */}
        {selectedLevelNum === 9 && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 border border-blue-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-xl bg-blue-500/20 border border-blue-400/40">🎯</span>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white font-['Tajawal']">
                  أنشطة ومهام المستوى 9 (أنشطة تطبيقية يقوم بها الطالب)
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  جميع أسئلة هذا المستوى عبارة عن أنشطة ومهام يقوم بها الطالب لتحقيق المهارات المستهدفة ونواتج التعلم.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/40 text-xs font-bold shrink-0">
              {currentLevelDef.questions.length} أنشطة
            </span>
          </div>
        )}

        {/* QUESTIONS LIST */}
        <div className="mt-6 space-y-6">
          {currentLevelDef.questions.map((q, qIndex) => {
            const isLevel9 = selectedLevelNum === 9;
            const chosen = isLevelCompleted && completedResult
              ? completedResult.answers[q.id]
              : chosenAnswers[q.id];

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 text-right"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <span className="min-w-7 px-2 h-7 rounded-xl bg-[#ffd700]/20 border border-[#ffd700] text-[#ffd700] font-black text-xs flex items-center justify-center font-['Outfit'] shrink-0 mt-0.5">
                      {isLevel9 ? `نشاط ${qIndex + 1}` : qIndex + 1}
                    </span>
                    <div>
                      {isLevel9 && (
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-bold mb-1.5">
                          🎯 نشاط يقوم به الطالب
                        </span>
                      )}
                      <h4 className="text-sm sm:text-base font-bold text-white font-['Tajawal'] leading-relaxed">
                        {q.question}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/40 shrink-0">
                    +{q.points} XP
                  </span>
                </div>

                {/* Question Image (if attached) */}
                {q.imageUrl && (
                  <div className="my-3 flex justify-center items-center">
                    <div className="relative max-w-full rounded-2xl overflow-hidden border-2 border-amber-400/50 bg-[#070914] shadow-2xl p-1.5">
                      <img
                        src={q.imageUrl}
                        alt="توضيح السؤال"
                        className="max-h-56 sm:max-h-80 w-auto max-w-full rounded-xl object-contain shadow-md mx-auto"
                      />
                    </div>
                  </div>
                )}

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    const realtimeAnswerForQ = roomState.currentAnswers?.[q.id];
                    const isLatestPeerChoice = !isLevelCompleted && realtimeAnswerForQ?.selectedOption === optIdx;
                    const votersForThisOpt = (Object.values(roomState.votes?.[q.id] || {}) as RealtimeVote[]).filter(
                      (v) => v.optionIndex === optIdx
                    );


                    let optionStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-[#d4af37]/60';

                    if (isLevelCompleted && isImmediateGroup) {
                      // Reveal correct and wrong
                      if (optIdx === q.correctIndex) {
                        optionStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold';
                      } else if (isSelected && optIdx !== q.correctIndex) {
                        optionStyle = 'bg-red-950/70 border-red-500 text-red-200 line-through';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-amber-950/80 border-[#ffd700] text-amber-200 font-bold shadow-[0_0_15px_rgba(212,175,55,0.25)]';
                    } else if (isLatestPeerChoice) {
                      optionStyle = 'bg-purple-950/40 border-purple-500/80 text-purple-200';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isLevelCompleted}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3.5 rounded-xl border-2 text-right text-xs sm:text-sm font-['Cairo'] transition-all flex flex-col justify-between gap-2 ${
                          isLevelCompleted ? 'cursor-not-allowed' : 'cursor-pointer'
                        } ${optionStyle}`}
                      >
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span className="leading-relaxed font-medium">{opt}</span>
                          <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center shrink-0 text-[10px] font-mono">
                            {['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][optIdx] || String.fromCharCode(65 + optIdx)}
                          </span>
                        </div>

                        {/* Optional Option Image - Balanced & Layout Preserving */}
                        {q.optionImages?.[optIdx] && (
                          <div className="w-full h-28 sm:h-36 my-2 rounded-xl overflow-hidden border border-slate-700/80 bg-black/60 p-2 flex justify-center items-center shadow-inner">
                            <img
                              src={q.optionImages[optIdx]!}
                              alt={`صورة الخيار`}
                              className="max-h-full max-w-full object-contain rounded-lg hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Real-time Peer Choice Indicator & Live Votes */}
                        {!isLevelCompleted && (isLatestPeerChoice || votersForThisOpt.length > 0) && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60 w-full">
                            {isLatestPeerChoice && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/40 animate-pulse">
                                <span>{realtimeAnswerForQ.avatarEmoji}</span>
                                <span>اختاره لحظياً: {realtimeAnswerForQ.studentName?.split(' ')[0] || realtimeAnswerForQ.selectedBy}</span>
                              </span>
                            )}
                            {votersForThisOpt.length > 0 && (
                              <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 mr-auto">
                                <span className="flex -space-x-1">
                                  {votersForThisOpt.slice(0, 4).map((v) => (
                                    <span key={v.username} className="text-xs" title={`${v.studentName} اختار هذا الخيار`}>
                                      {v.avatarEmoji}
                                    </span>
                                  ))}
                                </span>
                                <span className="text-[9px] font-mono font-bold text-amber-300">
                                  ({votersForThisOpt.length} أصوات)
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}

                </div>

                {/* Explanation in Immediate Feedback mode for completed level */}
                {isLevelCompleted && isImmediateGroup && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 font-['Cairo'] leading-relaxed">
                    💡 <strong>التغذية الراجعة الفورية المعتمدة:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* 4. قسم "نشاطك الخاص" - ينتهي الليفل بعد رفع الطالب نشاطه */}
        {/* ======================================================== */}
        <div className="mt-8 pt-8 border-t-2 border-amber-500/40 space-y-6" id="student-activity-section">
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#120e26] via-[#1a1438] to-[#120e26] border-2 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.25)] text-right relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-md">
                  🎯
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-[11px] font-black">
                      متطلب إنهاء المستوى {selectedLevelNum}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold">
                      {studentActivity ? '✅ تم رفع النشاط' : '⏳ مطلوب رفع النشاط أولاً'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white font-['Tajawal'] mt-1">
                    نشاطك الخاص (المستوى {selectedLevelNum})
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {currentLevelDef.activityPrompt || 'قم برفع ملف تطبيقك العملي أو مخرج التدريب لهذا المستوى. يقبل النظام جميع امتدادات الفيديو، الصور، ومستندات PDF.'}
                  </p>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={activityFileInputRef}
                type="file"
                accept="image/*,.pdf,video/*"
                onChange={handleUploadActivity}
                className="hidden"
                id={`activity-upload-input-${selectedLevelNum}`}
              />
            </div>

            {/* If No Activity Uploaded Yet */}
            {!studentActivity ? (
              <div
                onClick={() => activityFileInputRef.current?.click()}
                className="mt-5 p-8 rounded-2xl border-2 border-dashed border-amber-400/60 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/40 group-hover:scale-110 group-hover:bg-amber-500/20 text-amber-300 flex items-center justify-center transition-all text-3xl">
                  📁
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white font-['Tajawal']">
                    اضغط هنا لرفع نشاطك الخاص
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-['Cairo']">
                    يقبل جميع امتدادات الفيديو (MP4, WebM, ...) والصور (PNG, JPG, ...) وملفات الـ PDF
                  </p>
                </div>
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 pointer-events-none"
                >
                  <Upload className="w-4 h-4" />
                  <span>اختيار ملف النشاط من جهازك</span>
                </button>
              </div>
            ) : (
              /* If Activity Is Uploaded: Preview and Metadata */
              <div className="mt-5 p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/50 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {studentActivity.fileType === 'video' ? '🎬' : studentActivity.fileType === 'pdf' ? '📄' : '🖼️'}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono truncate max-w-xs sm:max-w-md">
                        {studentActivity.fileName}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-bold">
                          {studentActivity.fileType.toUpperCase()}
                        </span>
                        {studentActivity.fileSize && (
                          <span>{(studentActivity.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                        )}
                        <span>• تم الرفع بنجاح</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => activityFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>تبديل الملف</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveActivity}
                      className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/50 text-red-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

                {/* Inline Preview according to File Type */}
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/60 p-2 flex justify-center items-center">
                  {studentActivity.fileType === 'video' ? (
                    <video
                      controls
                      src={studentActivity.fileUrl}
                      className="max-h-72 w-auto max-w-full rounded-lg shadow-lg"
                    />
                  ) : studentActivity.fileType === 'image' ? (
                    <img
                      src={studentActivity.fileUrl}
                      alt="معاينة نشاطك الخاص"
                      className="max-h-72 w-auto max-w-full rounded-lg object-contain shadow-lg"
                    />
                  ) : (
                    <div className="p-6 text-center space-y-2">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-300 flex items-center justify-center mx-auto text-2xl font-bold">
                        PDF
                      </div>
                      <p className="text-xs text-slate-300 font-mono">{studentActivity.fileName}</p>
                      <a
                        href={studentActivity.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فتح ومعاينة ملف PDF</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Finish Level Action Button: "ثم زر finish level 1 وبعدها شريط تحميل ٥ ثواني" */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
              <div className="text-xs text-slate-400 font-['Cairo']">
                {!studentActivity ? (
                  <span className="text-amber-300 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    يجب رفع نشاطك الخاص لتفعيل زر إنهاء المستوى
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    النشاط مكتمل وجاهز للتسليم والإنهاء
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  id={`btn-finish-level-${selectedLevelNum}`}
                  onClick={() => {
                    const unanswered = currentLevelDef.questions.some(
                      (q) => chosenAnswers[q.id] === undefined
                    );
                    if (unanswered) {
                      alert('يرجى الإجابة على جميع أسئلة المستوى أولاً');
                      return;
                    }
                    if (!studentActivity) {
                      alert('يرجى رفع نشاطك الخاص أولاً (فيديو أو صورة أو PDF) لإكمال المستوى');
                      return;
                    }
                    handleFinishLevelClick();
                  }}
                  className={`w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg ${
                    studentActivity
                      ? 'bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_0_25px_rgba(255,215,0,0.45)] border-2 border-amber-300'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:border-amber-400/50'
                  }`}
                >
                  <span>finish level {selectedLevelNum}</span>
                  <ArrowLeft className="w-5 h-5 shrink-0" />
                </button>

                {isLevelCompleted && selectedLevelNum < 9 && (
                  <button
                    type="button"
                    onClick={() => setSelectedLevelNum(selectedLevelNum + 1)}
                    className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <span>المستوى {selectedLevelNum + 1}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL BEFORE FINAL SUBMISSION */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f0c1f] border-2 border-[#ffd700] rounded-3xl p-6 sm:p-8 max-w-md w-full text-right shadow-[0_0_50px_rgba(212,175,55,0.3)] space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-[#ffd700] text-[#ffd700] flex items-center justify-center mx-auto text-2xl">
              🔒
            </div>

            <h3 className="text-xl font-black text-white text-center font-['Tajawal']">
              اعتماد المستوى {selectedLevelNum}
            </h3>

            <p className="text-sm text-center text-slate-300 font-['Cairo']">
              هل تريد تأكيد اعتماد إجابات هذا المستوى؟
            </p>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleSubmitChallenge}
                className="px-6 py-2.5 rounded-xl bg-[#ffd700] hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <span>تأكيد الاعتماد 🔒</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* RESULT FEEDBACK MODAL: IMMEDIATE vs DEFERRED */}
      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f0c1f] border-2 border-[#ffd700] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-right shadow-[0_0_60px_rgba(212,175,55,0.4)] space-y-5">
            {feedbackModal.isImmediate ? (
              /* SCREEN 10: IMMEDIATE FEEDBACK SCREEN (G1 & G3) */
              <>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce">
                    ✔️
                  </div>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-black font-['Cairo']">
                    التغذية الراجعة الفورية المباشرة
                  </span>
                  <h3 className="text-2xl font-black text-white font-['Tajawal']">
                    أحسنت! إجابتك صحيحة وأتقنت مهارات المرحلة {feedbackModal.result.levelNumber}
                  </h3>
                  <p className="text-xs text-slate-300 font-['Cairo']">
                    تُستخدم أدوات Adobe Captivate 2019 لبناء بيئات وتجارب تعليمية تفاعلية غنية.
                  </p>
                </div>

                {/* Score badge & Team or Individual Points */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-[#ffd700]/50 flex items-center justify-around text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">
                      {isCollaborative ? 'نقاط مضافة لرصيد الفريق' : 'نقاط المكافأة المكتسبة'}
                    </span>
                    <span className="text-2xl font-black text-[#ffd700] font-['Outfit']">
                      +{feedbackModal.result.score} ⭐ XP
                    </span>
                  </div>
                  <div className="w-px h-10 bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">الوسام الممنوح</span>
                    <span className="text-sm font-black text-[#ffd700] font-['Cairo'] flex items-center gap-1">
                      {feedbackModal.levelDef.badgeEmoji} {feedbackModal.levelDef.badgeName}
                    </span>
                  </div>
                </div>

                {/* Detailed Questions Feedback Breakdown */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {feedbackModal.levelDef.questions.map((q, idx) => {
                    const isCorrect = feedbackModal.result.answers[q.id] === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border text-xs leading-relaxed ${
                          isCorrect
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                            : 'bg-red-950/40 border-red-500/50 text-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span>نشاط {idx + 1}: {isCorrect ? '✔️ إجابة صحيحة (+50 XP)' : '❌ إجابة غير دقيقة (0 XP)'}</span>
                        </div>
                        <p className="text-[11px] opacity-90">{q.explanation}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleNextLevel}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>التالي (المرحلة التالية) 🚀</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* SCREEN 11: DELAYED FEEDBACK SCREEN (G2 & G4) */
              <>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border-2 border-purple-400 text-purple-300 flex items-center justify-center mx-auto text-3xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    📊
                  </div>
                  <span className="px-3 py-0.5 rounded-full bg-purple-950 border border-purple-500 text-purple-300 text-xs font-black font-['Cairo']">
                    تقرير أداء المرحلة (التغذية الراجعة المرجأة)
                  </span>
                  <h3 className="text-2xl font-black text-white font-['Tajawal']">
                    تقرير أداء المرحلة {feedbackModal.result.levelNumber}
                  </h3>
                  <p className="text-xs text-slate-300 font-['Cairo']">
                    لقد أكملت الأنشطة الخاصة بـ [{feedbackModal.levelDef.shortTitle}]. يمكنك الآن مراجعة أدائك الإجمالي.
                  </p>
                </div>

                {/* Table showing activities, status, and points earned according to Storyboard */}
                <div className="p-4 rounded-2xl bg-[#090714] border border-purple-500/40 space-y-2.5">
                  <div className="space-y-1.5 font-mono text-xs">
                      {feedbackModal.levelDef.questions.map((q, idx) => {
                        const isCorrect = feedbackModal.result.answers[q.id] === q.correctIndex;
                        return (
                          <div
                            key={q.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800"
                          >
                            <span className="text-slate-300 font-['Cairo'] font-bold">
                              نشاط {idx + 1}: {q.question.substring(0, 32)}...
                            </span>
                            {/* Only show result if not a student in deferred mode, or if admin */}
                            {!isImmediateGroup || isAdmin ? (
                              <span
                                className={`font-black font-mono ${
                                  isCorrect ? 'text-emerald-400' : 'text-red-400'
                                }`}
                              >
                                {isCorrect ? '✔️ +50 نقطة' : '❌ 0 نقطة'}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-mono text-[10px]">
                                تم تسجيل الإجابة
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!isImmediateGroup && !isAdmin && (
                       <div className="pt-2 border-t border-slate-800 text-center">
                         <span className="text-[10px] text-slate-400 font-['Cairo']">
                           النتائج التفصيلية ستكون متاحة لاحقاً
                         </span>
                       </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-['Cairo']">
                        {isImmediateGroup || isAdmin ? 'إجمالي نقاط المرحلة المكتسبة:' : 'تم رصد النشاط:'}
                      </span>
                      {(isImmediateGroup || isAdmin) && (
                        <span className="text-lg font-black text-[#ffd700] font-['Outfit']">
                          +{feedbackModal.result.score} ⭐
                        </span>
                      )}
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/50 text-xs text-purple-200 font-['Cairo'] leading-relaxed">
                  💡 <strong>التغذية الراجعة العامة:</strong> لقد أنجزت خطوات هذه المرحلة بنجاح وفق متطلبات المعالجة التجريبية المرجأة، وتم حفظ إجاباتك وتحديث سجلك التراكمي في لوحة الإشراف.
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleNextLevel}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>عرض الإنجاز والمتابعة 🚀</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AVATAR SELECTION MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f0c1f] border-2 border-[#ffd700] rounded-3xl p-6 sm:p-8 max-w-xl w-full text-right shadow-[0_0_50px_rgba(212,175,55,0.3)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white font-['Tajawal'] flex items-center gap-2">
                <span>اختر شخصيتك الكرتونية التفاعلية</span>
                <span className="text-xl">🦸‍♂️🤖</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold font-['Cairo'] cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {CARTOON_AVATARS.map((avatar) => {
                const isSelected = avatar.id === progress.avatarId;

                return (
                  <div
                    key={avatar.id}
                    onClick={() => {
                      const updated = updateStudentAvatar(username, avatar.id);
                      setProgress(updated);
                      setShowAvatarModal(false);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-amber-950/70 border-[#ffd700] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shrink-0">
                      {avatar.emoji}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white font-['Tajawal']">
                        {avatar.name}
                      </h4>
                      <span className="text-[10px] text-amber-300 font-bold font-['Cairo'] block">
                        {avatar.title}
                      </span>
                      <p className="text-[10px] text-slate-400 font-['Cairo'] mt-1 line-clamp-2">
                        {avatar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* 🎮 ARCADE GAME PROGRESS BAR (1 TO 100%) WITH MOVING ANIME MASCOT */}
      {loadingLevelForGame && (
        <GameLevelUnlockLoader
          levelNumber={loadingLevelForGame.levelNumber}
          levelTitle={loadingLevelForGame.title}
          badgeEmoji={loadingLevelForGame.badgeEmoji}
          onComplete={() => {
            const num = loadingLevelForGame.levelNumber;
            setSelectedLevelNum(num);
            setIsVideoOpen(true);
            setLoadingLevelForGame(null);
          }}
          onCancel={() => setLoadingLevelForGame(null)}
        />
      )}

      {/* 5-SECOND LEVEL TRANSITION LOADER
          "وبعدها شريط تحميل ٥ ثواني مكتوب أعلاه جاري الانتقال الي ليفل ٢ وهكذا الي ان تنتهي ال ٩ ليفل" */}
      {isTransitioning5s && (
        <LevelTransitionLoader5s
          currentLevel={selectedLevelNum}
          nextLevel={transitionTargetLevel}
          isFinalLevel={selectedLevelNum >= 9}
          onComplete={handle5sTransitionComplete}
        />
      )}

      {/* 📋 FLOATING DRAGGABLE INSTRUCTIONS MENU
          "مع اضافه قائمه عائمه يمكن تحركها في اي مكان تتضمن أهداف كل ليفل" */}
      <DraggableLevelInstructions
        key={selectedLevelNum}
        levelNumber={selectedLevelNum}
        levelTitle={currentLevelDef.title}
        instructions={(selectedLevelNum === 9 ? (currentLevelDef.objectives || currentLevelDef.instructions) : currentLevelDef.instructions) || ''}
      />

      {/* 🔍 MEDIA ZOOM & PREVIEW MODAL FOR IMAGES AND PDF DOCUMENTS */}
      {previewMediaZoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewMediaZoom(null)}
        >
          <div
            className="bg-[#0f0c1f] border-2 border-[#ffd700] rounded-3xl p-5 sm:p-6 max-w-4xl w-full text-right space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">{previewMediaZoom.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewMediaZoom(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex justify-center items-center">
              {previewMediaZoom.type === 'pdf' ? (
                <iframe
                  src={previewMediaZoom.url}
                  className="w-full h-96 rounded-xl border border-slate-800"
                  title="معاينة PDF"
                />
              ) : (
                <img
                  src={previewMediaZoom.url}
                  alt={previewMediaZoom.title}
                  className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
