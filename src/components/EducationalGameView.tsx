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
  Download,
  Clock,
  FileText,
  Trash2,
  Image as ImageIcon,
  X,
  FileCheck,
  Target,
  HardDrive,
} from 'lucide-react';
import { CARTOON_AVATARS, GAME_LEVELS_DATA, GameLevelDef } from '../data/gameLevelsData';
import {
  getStudentProgress,
  submitLevelChallenge,
  updateStudentAvatar,
  saveStudentLevelActivity,
  saveSingleStudentProgress,
  calculateStudentTotalScore,
} from '../utils/gameStorage';
import {
  getLevelActivityConfig,
  submitStudentActivity,
  deleteStudentActivity,
  subscribeToLevelActivityConfigs,
} from '../utils/studentActivityStorage';
import { useEducationalVideos } from '../utils/videoStorage';
import { MultiPartVideoPlayer } from './MultiPartVideoPlayer';
import { GameLevelUnlockLoader } from './GameLevelUnlockLoader';
import { DraggableLevelInstructions } from './DraggableLevelInstructions';
import { LevelTransitionLoader5s } from './LevelTransitionLoader5s';
import { LevelInteractiveGames } from './LevelInteractiveGames';
import { getGroupByUsername, getStudentByUsername, RESEARCH_GROUPS_META, getCollaborativeGroupByUsername } from '../data/studentAccounts';
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
  TestAccessSession,
} from '../types';
import {
  recordTestEntry,
  recordTestExit,
  markTestCompletedInAudit,
} from '../utils/testAccessAuditStorage';
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
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(true);
  const [loadingLevelForGame, setLoadingLevelForGame] = useState<GameLevelDef | null>(null);

  // [FIX 3]: القلوب لكل مستوى تبدأ بـ 1 فقط بدلاً من 2
  const [heartsPerLevel, setHeartsPerLevel] = useState<Record<number, number>>({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1 });
  const [hintUsedPerLevel, setHintUsedPerLevel] = useState<Record<number, boolean>>({});

  // [FIX 8]: حالة الخيار المُستبعد عشوائياً عند استخدام المساعدة (Hint) لكل مستوى
  const [hintEliminatedOption, setHintEliminatedOption] = useState<Record<number, number | null>>({});

  // Section 1 Score earned per level (25 points or 0)
  const [section1ScorePerLevel, setSection1ScorePerLevel] = useState<Record<number, number>>(() => {
    const initScores: Record<number, number> = {};
    const prog = getStudentProgress(username);
    Object.entries(prog.completedLevels || {}).forEach(([lvlNum, res]) => {
      const num = Number(lvlNum);
      const lvlDef = GAME_LEVELS_DATA.find((l) => l.levelNumber === num);
      const q1Id = lvlDef?.questions[0]?.id;
      if (q1Id && res.questionScores && res.questionScores[q1Id] !== undefined) {
        initScores[num] = res.questionScores[q1Id];
      } else if (res.score) {
        initScores[num] = Math.min(lvlDef?.section1Score ?? 25, Math.round(res.score * 0.5));
      }
    });
    return initScores;
  });

  // Section 2 Interactive Activity score earned per level (25 or 50 points)
  const [activityScorePerLevel, setActivityScorePerLevel] = useState<Record<number, number>>(() => {
    const initScores: Record<number, number> = {};
    const prog = getStudentProgress(username);
    Object.entries(prog.completedLevels || {}).forEach(([lvlNum, res]) => {
      const num = Number(lvlNum);
      const lvlDef = GAME_LEVELS_DATA.find((l) => l.levelNumber === num);
      if (res.questionScores?.['section2_activity'] !== undefined) {
        initScores[num] = res.questionScores['section2_activity'];
      } else if (res.score) {
        initScores[num] = Math.max(0, res.score - (initScores[num] || (lvlDef?.section1Score ?? 25)));
      }
    });
    return initScores;
  });

  const [lastHeartWarning, setLastHeartWarning] = useState<string | null>(null);

  // [FIX 7 & FIX 9]: تعميم خصم الفيديو على كل المستويات وتنظيف المتغيرات غير المستخدمة
  const [videoPenaltyAppliedPerLevel, setVideoPenaltyAppliedPerLevel] = useState<Record<number, boolean>>({});
  const [videoScorePerLevel, setVideoScorePerLevel] = useState<Record<number, number>>({ 1: 25, 2: 25, 3: 25, 4: 25, 5: 25, 6: 25, 7: 25, 8: 25, 9: 25 });

  // 5-second transition state as requested
  const [isTransitioning5s, setIsTransitioning5s] = useState<boolean>(false);
  const [transitionTargetLevel, setTransitionTargetLevel] = useState<number>(2);

  // Student level activity upload state
  const activityFileInputRef = useRef<HTMLInputElement | null>(null);
  const [studentActivity, setStudentActivity] = useState<StudentActivitySubmission | null>(
    () => progress.studentActivities?.[selectedLevelNum] || null
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>('جاري قراءة الملف...');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewMediaZoom, setPreviewMediaZoom] = useState<LevelMediaItem | null>(null);
  const currentLevelVideos = useEducationalVideos(`level-${selectedLevelNum}`);
  const [feedbackModal, setFeedbackModal] = useState<{
    result: CompletedLevelResult;
    isImmediate: boolean;
    levelDef: GameLevelDef;
  } | null>(null);

  // Group metadata
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

  const collabSubGroup = getCollaborativeGroupByUsername(username);
  const [teammateAnswerInfo, setTeammateAnswerInfo] = useState<{ completedBy: string; score: number } | null>(null);

  useEffect(() => {
    if (isCollaborative && isImmediateGroup && collabSubGroup) {
      try {
        const rawTeam = localStorage.getItem('cp_collab_team_answers_v1');
        if (rawTeam) {
          const teamAnswers = JSON.parse(rawTeam);
          const record = teamAnswers[`${collabSubGroup}_${selectedLevelNum}`];
          if (record && record.completedBy && record.completedBy.toUpperCase() !== username.toUpperCase()) {
            setTeammateAnswerInfo(record);
          } else {
            setTeammateAnswerInfo(null);
          }
        }
      } catch {
        setTeammateAnswerInfo(null);
      }
    } else {
      setTeammateAnswerInfo(null);
    }
  }, [username, selectedLevelNum, isCollaborative, isImmediateGroup, collabSubGroup, progress]);

  // Real-time group room state from Firebase Firestore
  const [roomState, setRoomState] = useState<GroupRoomState>(() => getDefaultRoomState(groupCode));
  const [isConnectedToFirebase, setIsConnectedToFirebase] = useState<boolean>(true);

  // Always scroll to top when changing levels or mounting
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [selectedLevelNum]);

  // Level Test Access Session Tracking
  const levelAccessSessionRef = useRef<TestAccessSession | null>(null);

  useEffect(() => {
    const levelTestId = `level-${selectedLevelNum}`;
    const levelTestName = `تحدي المستوى التعليمي ${selectedLevelNum}`;
    const sess = recordTestEntry(username, levelTestId, levelTestName);
    levelAccessSessionRef.current = sess;

    return () => {
      if (levelAccessSessionRef.current) {
        recordTestExit(levelAccessSessionRef.current.id);
      }
    };
  }, [selectedLevelNum, username]);

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
    });

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

  const isLevelCompleted = !!progress.completedLevels[selectedLevelNum];
  const completedResult = progress.completedLevels[selectedLevelNum];
  const isLevelUnlocked = selectedLevelNum <= progress.currentLevel;

  const q1 = currentLevelDef.questions[0];
  const q1Points = currentLevelDef.section1Score ?? q1?.points ?? 25;

  // [FIX 3]: القلوب الحالية تنزل إلى 1 افتراضياً
  const currentHearts = heartsPerLevel[selectedLevelNum] ?? 1;
  const hasAnsweredQ1 = isLevelCompleted || (q1 ? chosenAnswers[q1.id] !== undefined : false);
  const isSection1Done = hasAnsweredQ1;

  // [FIX 7]: تعميم خصم تقديم/تأخير الفيديو على كل المستويات
  const [videoWarning, setVideoWarning] = useState<string | null>(null);
  const handleVideoSeek = () => {
    if (!videoPenaltyAppliedPerLevel[selectedLevelNum]) {
      setVideoPenaltyAppliedPerLevel((prev) => ({ ...prev, [selectedLevelNum]: true }));
      setVideoScorePerLevel((prev) => ({ ...prev, [selectedLevelNum]: 20 }));
      setVideoWarning('لا يُسمح بتقديم أو تأخير الفيديو — تم خصم 5 درجات.');
      setTimeout(() => setVideoWarning(null), 5000);
    }
  };

  // [FIX 8]: استخدام المساعدة (Hint) يستهلك القلب الوحيد ويستبعد خياراً خاطئاً عشوائياً مع خصم 5 درجات
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const handleUseHint = () => {
    if (isLevelCompleted || isSection1Done || hintUsedPerLevel[selectedLevelNum]) return;
    const currentHeartCount = heartsPerLevel[selectedLevelNum] ?? 1;
    if (currentHeartCount <= 0) return;

    setHeartsPerLevel((prev) => ({ ...prev, [selectedLevelNum]: 0 }));
    setHintUsedPerLevel((prev) => ({ ...prev, [selectedLevelNum]: true }));

    // [FIX 8]: اختيار خيار خاطئ عشوائياً واستبعاده
    if (q1 && q1.options) {
      const wrongIndices = q1.options
        .map((_, idx) => idx)
        .filter((idx) => idx !== q1.correctIndex);
      if (wrongIndices.length > 0) {
        const randomWrongIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        setHintEliminatedOption((prev) => ({ ...prev, [selectedLevelNum]: randomWrongIdx }));
      }
    }

    // خصم 5 درجات من نتيجة القسم الأول عند استخدام الـ Hint
    const existingScore = section1ScorePerLevel[selectedLevelNum] ?? q1Points;
    const newScore = Math.max(0, existingScore - 5);
    setSection1ScorePerLevel((prev) => ({
      ...prev,
      [selectedLevelNum]: newScore,
    }));

    setHintMessage('تم استخدام المساعدة (−5 درجات). تم تلميح وإستبعاد إجابة خاطئة!');
  };

  // [FIX 2 & FIX 9]: عند الإجابة الصحيحة الحفاظ على خصم الـ Hint وتنظيف فروع hearts === 2
  const handleSelectSection1Option = (optIdx: number) => {
    if (isLevelCompleted || isSection1Done) return;
    if (!q1) return;

    // منع النقر على الخيار المستبعد بواسطة الـ Hint
    if (hintEliminatedOption[selectedLevelNum] === optIdx) return;

    const isCorrect = optIdx === q1.correctIndex;

    setChosenAnswers((prev) => ({
      ...prev,
      [q1.id]: optIdx,
    }));

    if (!isAdmin) {
      selectQuestionOptionRealtime(groupCode, selectedLevelNum, q1.id, optIdx, {
        username,
        fullName: studentInfo?.fullName || username,
        avatarEmoji: currentAvatar.emoji,
      });
    }

    if (isCorrect) {
      // [FIX 2]: الحفاظ على خصم الـ 5 درجات للـ Hint عند الإجابة الصحيحة
      const hadHintDeduction = !!hintUsedPerLevel[selectedLevelNum];
      const finalScore = hadHintDeduction ? Math.max(0, q1Points - 5) : q1Points;

      setSection1ScorePerLevel((prev) => ({
        ...prev,
        [selectedLevelNum]: finalScore,
      }));
      setLastHeartWarning(null);
    } else {
      // الإجابة خاطئة: بما أن لكل مستوى قلب 1 فقط
      setHeartsPerLevel((prev) => ({ ...prev, [selectedLevelNum]: 0 }));
      setSection1ScorePerLevel((prev) => ({
        ...prev,
        [selectedLevelNum]: 0,
      }));
      setLastHeartWarning('إجابة غير صحيحة! استنفدت فرصة هذا المستوى.');
    }
  };

  // Section 2: Applied activity completion handler
  const handleActivityCompleted = (activityScore: number) => {
    setActivityScorePerLevel((prev) => ({
      ...prev,
      [selectedLevelNum]: activityScore,
    }));
  };

  // Sync student activity when level changes
  useEffect(() => {
    setStudentActivity(progress.studentActivities?.[selectedLevelNum] || null);
  }, [selectedLevelNum, progress]);

  // Dynamic Level Activity Config
  const [levelActivityConfig, setLevelActivityConfig] = useState<import('../types').LevelActivityConfig>(() =>
    getLevelActivityConfig(selectedLevelNum)
  );

  useEffect(() => {
    setLevelActivityConfig(getLevelActivityConfig(selectedLevelNum));
    const unsub = subscribeToLevelActivityConfigs((allConfigs) => {
      if (allConfigs[selectedLevelNum]) {
        setLevelActivityConfig(allConfigs[selectedLevelNum]);
      }
    });
    return () => unsub();
  }, [selectedLevelNum]);

  // Live listener when Admin grades the activity
  useEffect(() => {
    const handleGraded = (e: any) => {
      if (e.detail?.username?.toLowerCase() === username.toLowerCase()) {
        const updated = getStudentProgress(username);
        setProgress(updated);
        if (e.detail.levelNumber === selectedLevelNum) {
          setStudentActivity(e.detail.submission || updated.studentActivities?.[selectedLevelNum] || null);
        }
      }
    };
    window.addEventListener('cp_student_activity_graded', handleGraded);
    return () => window.removeEventListener('cp_student_activity_graded', handleGraded);
  }, [username, selectedLevelNum]);

  const handleTriggerUpload = () => {
    const questionsList = currentLevelDef.questions || [];
    const minRequired = Math.min(3, questionsList.length);
    const answeredCount = questionsList.filter((q) => chosenAnswers[q.id] !== undefined).length;

    if (!isAdmin && answeredCount < minRequired) {
      setUploadError(`يجب الإجابة على 3 أسئلة على الأقل قبل رفع النشاط (تمت الإجابة على ${answeredCount} من ${minRequired})`);
      setTimeout(() => setUploadError(null), 6000);
      return;
    }

    setUploadError(null);
    activityFileInputRef.current?.click();
  };

  // [FIX 11]: شريط تقدم صادق مقسّم على مرحلتين (قراءة الملف المحلي ثم الرفع السحابي مع تحديث النص)
  const handleUploadActivity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = 20 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(`حجم الملف كبير جداً (${(file.size / (1024 * 1024)).toFixed(1)} MB). الحد الأقصى المسموح به هو 20 ميجابايت.`);
      setTimeout(() => setUploadError(null), 6000);
      e.target.value = '';
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    const fileType: 'video' | 'image' | 'pdf' = isVid ? 'video' : isPdf ? 'pdf' : 'image';

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusText('جاري قراءة الملف المحتوي...');

    const reader = new FileReader();

    // المرحله الأولى: 0% -> 60%
    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 60);
        setUploadProgress(pct);
      }
    };

    reader.onload = async () => {
      // المرحلة الثانية: 60% -> 95% أثناء المعالجة والرفع
      setUploadProgress(65);
      setUploadStatusText('جاري الرفع المباشر إلى السحابة وتوثيق النشاط...');

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 92) return prev + 5;
          return prev;
        });
      }, 150);

      const fileUrl = reader.result as string;
      const cfg = getLevelActivityConfig(selectedLevelNum);

      // [FIX 12]: إرسال status بـ auto_granted_pending_review بدلاً من pending لمنع التعارض مع درجة 50 الممنوحة تلقائياً
      const submission: StudentActivitySubmission = {
        fileUrl,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        studentUsername: username,
        studentFullName: studentInfo?.fullName || username,
        groupCode,
        levelNumber: selectedLevelNum,
        activityTitle: cfg.activityTitle,
        maxPoints: 50,
        status: 'auto_granted_pending_review',
        grade: 50, // منح تلقائي فوري مطلوب
      };

      const saved = await submitStudentActivity(submission);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatusText('تم الرفع واكتمال النشاط بنجاح! 🟢');

      setActivityScorePerLevel((prev) => ({
        ...prev,
        [selectedLevelNum]: 50,
      }));

      const updatedProg = getStudentProgress(username);
      setProgress(updatedProg);
      setStudentActivity(saved);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1200);
    };

    reader.onerror = () => {
      setIsUploading(false);
      setUploadError('حدث خطأ أثناء قراءة الملف. يرجى المحاولة مرة أخرى.');
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // [FIX 4]: عند حذف النشاط، خصم الـ 50 وإعادة حساب totalScore وإعادة حفظ تقدم الطالب
  const handleRemoveActivity = async () => {
    if (studentActivity?.id) {
      await deleteStudentActivity(studentActivity.id);
    }
    const updatedProg = getStudentProgress(username);

    // إذا كان المستوى مكتملاً وبداخل questionScores نشاط القسم الثاني، فصفّر قيمته
    if (updatedProg.completedLevels && updatedProg.completedLevels[selectedLevelNum]) {
      const completedLvl = updatedProg.completedLevels[selectedLevelNum];
      if (completedLvl.questionScores && completedLvl.questionScores['section2_activity'] !== undefined) {
        completedLvl.questionScores['section2_activity'] = 0;
        completedLvl.score = Object.values(completedLvl.questionScores).reduce((a, b) => a + b, 0);
      }
    }

    updatedProg.totalScore = calculateStudentTotalScore(updatedProg);
    saveSingleStudentProgress(username, updatedProg);
    setProgress(updatedProg);
    setStudentActivity(null);
    setActivityScorePerLevel((prev) => ({
      ...prev,
      [selectedLevelNum]: 0,
    }));
  };

  // [FIX 1]: عند إنهاء المستوى تمرير s2Score = 0 دائماً لأن درجة الـ 50 موجودة أصلاً في studentActivities
  const handleFinishLevelClick = async () => {
    if (!isAdmin && !studentActivity) {
      alert('يرجى رفع نشاطك الخاص لهذا المستوى أولاً (فيديو أو صورة أو PDF) لإكمال المستوى');
      return;
    }

    const firstQ = currentLevelDef.questions[0];
    if (!isAdmin && firstQ && chosenAnswers[firstQ.id] === undefined && !isLevelCompleted) {
      alert('يرجى الإجابة على سؤال تحدي المعرفة (القسم الأول) قبل إنهاء المستوى');
      return;
    }

    if (isAdmin) {
      const nextLvl = selectedLevelNum + 1;
      setTransitionTargetLevel(nextLvl);
      setIsTransitioning5s(true);
      return;
    }

    const s1ScoreOverride = section1ScorePerLevel[selectedLevelNum];

    // [FIX 1]: تمرير s2Score = 0 دائماً لمنع حساب الـ 50 درجة مرتين (لأن الدرجة موجودة في studentActivities وتُحسب في calculateStudentTotalScore)
    const s2Score = 0;
    const videoScore = videoScorePerLevel[selectedLevelNum] ?? 25;

    const { progress: updatedProgress } = submitLevelChallenge(
      username,
      selectedLevelNum,
      chosenAnswers,
      60,
      s2Score,
      s1ScoreOverride,
      videoScore
    );

    markTestCompletedInAudit(username, `level-${selectedLevelNum}`);

    await submitGroupLevelRealtime(groupCode, selectedLevelNum, chosenAnswers, {
      username,
      fullName: studentInfo?.fullName || username,
      avatarEmoji: currentAvatar.emoji,
    });
    await syncStudentProgressToFirestore(updatedProgress);
    setProgress(updatedProgress);

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
      if (onCompleteAllLevels) {
        onCompleteAllLevels();
      }
      window.dispatchEvent(new CustomEvent('cp_navigate_to_posttest'));
    }
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
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#0d1815] to-emerald-950/90 border-2 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.3)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs sm:text-sm font-['Cairo'] text-emerald-200">
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

          <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-emerald-500/40">
            <span className="text-xs text-emerald-300 font-bold whitespace-nowrap">تبديل المجموعة:</span>
            <select
              value={groupCode}
              onChange={(e) => {
                const targetCode = e.target.value;
                const groupObj = Object.values(RESEARCH_GROUPS_META).find((g) => g.code === targetCode);
                if (groupObj) {
                  window.dispatchEvent(new CustomEvent('cp_admin_switch_group', { detail: { groupId: groupObj.id, groupCode: targetCode } }));
                }
              }}
              className="bg-slate-950 border border-emerald-500/60 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-black cursor-pointer"
            >
              <option value="G1">G1 - فردي وتغذية فورية</option>
              <option value="G2">G2 - فردي وتغذية مرجئة</option>
              <option value="G3">G3 - تعاوني وتغذية فورية</option>
              <option value="G4">G4 - تعاوني وتغذية مرجئة</option>
            </select>
          </div>
        </div>
      )}

      {/* Collaborative Team Immediate Answer Notification Banner */}
      {teammateAnswerInfo && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-[#0d1c24] to-cyan-950/90 border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center gap-3 text-cyan-200 text-xs sm:text-sm font-['Cairo'] animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <span className="font-black text-white font-['Tajawal'] text-sm sm:text-base block">
              🤝 إشعار الفريق التعاوني الفوري (إجابة مشتركة للفريق):
            </span>
            <span>
              لقد قام صديقك في مجموعتك التعاونية، وهو المستخدم <strong className="text-amber-300 font-bold underline">{teammateAnswerInfo.completedBy}</strong>، بالإجابة وإتمام هذا المستوى مسبقاً! إجاباتكم الفريقية مسجلة ومشتركة.
            </span>
          </div>
        </div>
      )}

      {/* 0. RETURN TO STUDENT HOME BUTTON */}
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

      {/* 1. TOP GAME HUD */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0d0a1a] via-[#141029] to-[#0d0a1a] border-2 border-[#d4af37] p-5 sm:p-7 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
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
                    className="px-3.5 py-1 rounded-full text-xs font-black font-['Cairo'] bg-slate-200 border border-slate-300 text-slate-900 shadow-sm"
                  >
                    المجموعة {userGroupMeta.code}: {userGroupMeta.name}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] mt-1 flex items-center gap-2">
                <span className="text-[#ffd700] font-black">{username}</span>
              </h2>

              <p className="text-xs text-slate-300 font-['Cairo'] mt-0.5 max-w-md line-clamp-1">
                {currentAvatar.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-[#ffd700]/50 text-center shadow-[0_0_15px_rgba(255,215,0,0.15)]">
              <div className="flex items-center justify-center gap-1 text-[#ffd700] text-xs font-bold font-['Cairo'] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>النقاط الذهبية</span>
              </div>
              <span className="text-xl font-black text-white font-['Outfit']">
                {progress.totalScore} <span className="text-xs text-[#ffd700]">XP</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/50 text-center">
              <div className="flex items-center justify-center gap-1 text-purple-300 text-xs font-bold font-['Cairo'] mb-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>المستوى الحالي</span>
              </div>
              <span className="text-xl font-black text-purple-200 font-['Outfit']">
                {progress.currentLevel} <span className="text-xs text-slate-400">/ 9</span>
              </span>
            </div>

            {/* [FIX 3]: طاقة المحاولة تعرض قلب 1 فقط لكل مستوى */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-rose-500/50 text-center">
              <div className="flex items-center justify-center gap-1 text-rose-300 text-xs font-bold font-['Cairo'] mb-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>طاقة المحاولة</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-base pt-0.5 rounded-lg" style={{ backgroundColor: '#f5dccf' }}>
                <span className={currentHearts >= 1 ? "text-rose-500 animate-pulse" : "text-slate-600 opacity-60"}>
                  {currentHearts >= 1 ? "❤️" : "🖤"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/50 text-center">
              <div className="flex items-center justify-center gap-1 text-cyan-300 text-xs font-bold font-['Cairo'] mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>الأوسمة المكتسبة</span>
              </div>
              <span className="text-xl font-black text-cyan-200 font-['Outfit']">
                {(progress.badges || []).length} <span className="text-xs text-slate-400">أوسمة</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GAME PROGRESS MAP */}
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

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
          {GAME_LEVELS_DATA.map((lvl) => {
            const isCompleted = !!progress.completedLevels[lvl.levelNumber];
            const isCurrent = lvl.levelNumber === progress.currentLevel && !isCompleted;
            const isUpcoming = !isAdmin && lvl.levelNumber > progress.currentLevel;
            const isSelected = lvl.levelNumber === selectedLevelNum;

            return (
              <button
                key={lvl.levelNumber}
                type="button"
                onClick={() => {
                  if (isUpcoming) return;
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
                <div className="text-xl mb-1">
                  {isCompleted ? '🔒' : isCurrent ? '⚡' : '⏳'}
                </div>

                <span className="text-xs font-black font-['Outfit']">
                  L{lvl.levelNumber}
                </span>

                <span className="text-[10px] font-bold font-['Cairo'] line-clamp-1 mt-0.5">
                  {lvl.shortTitle}
                </span>

                <span className="text-[9px] mt-1 font-bold">
                  {isCompleted ? 'مكتمل ومتقن' : isCurrent ? 'نشط الآن' : 'قيد الانتظار'}
                </span>

                <div className="mt-1 pt-1 border-t border-slate-700/60 w-full flex items-center justify-center">
                  {isCompleted ? (
                    <span className="text-[10px] font-black text-emerald-300 font-['Outfit']">
                      ⭐ {progress.completedLevels[lvl.levelNumber]?.score ?? 50} / {progress.completedLevels[lvl.levelNumber]?.maxScore ?? 50}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-300 font-['Outfit']">
                      50 XP
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE LEVEL MISSION & CHALLENGE ARENA */}
      <div className="rounded-3xl bg-[#0f0c1f] border-2 border-[#d4af37] p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.2)] text-right">
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
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">إجمالي النقاط المتاحة</span>
              <span className="text-xl font-black text-amber-300 font-['Outfit']">
                75 XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 STAGE VIDEOS */}
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
                  partCustomTitle: v.partCustomTitle,
                  addedAt: v.addedAt || new Date().toISOString(),
                  isActive: true,
                })),
                ...currentLevelVideos.filter(
                  (cv) => !(currentLevelDef.videos || []).some((v) => v.url === cv.videoUrl)
                ),
              ]}
              title={`شرح المستوى ${selectedLevelNum}: ${currentLevelDef.title}`}
              onSeek={handleVideoSeek}
            />
          )}

          {/* Video Warning Banner if penalty applied */}
          {videoWarning && (
            <div className="p-3 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold flex items-center gap-2 animate-bounce">
              <span>⚠️ {videoWarning}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/50 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold">درجة الفيديو التعليمي لهذا المستوى:</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-300 font-black font-['Outfit']">
              {videoScorePerLevel[selectedLevelNum] ?? 25} / 25 XP
            </span>
          </div>
        </div>
      )}

      {/* STAGE IMAGES & PDF DOCUMENTS */}
      {currentLevelDef.images && currentLevelDef.images.length > 0 && (
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-300 font-['Cairo'] flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span>{currentLevelDef.imagesSectionTitle || `صور ومستندات المستوى ${selectedLevelNum} (${currentLevelDef.images.length} ملفات):`}</span>
            </span>
            <span className="text-[11px] text-slate-300 font-semibold">
              {currentLevelDef.imagesSectionDesc || 'إمكانية رفع حتى 5 صور أو ملفات PDF بحد أقصى'}
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
                    <span className="text-[10px] font-bold mt-1">مستند PDF</span>
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

      {/* REAL-TIME COLLABORATIVE LIVE BAR */}
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-['Cairo']">
              الطلاب المتصلين بالغرفة الآن:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffd700]/20 border border-[#ffd700] text-[#ffd700] text-xs font-black">
              {(Object.values(roomState.activeStudents || {}) as RealtimeStudentParticipant[]).filter((s) => s.isOnline).length || 1} من 15
            </span>
          </div>
        </div>

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
                النتيجة المعروضة: {completedResult.score} من {completedResult.maxScore} XP
              </p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 1: KNOWLEDGE CHALLENGE */}
      {q1 && (
        <div className="mt-6 p-6 rounded-3xl bg-slate-950/90 border-2 border-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.25)] space-y-5 text-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-md">
                ❤️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-black">
                    القسم الأول: تحدي المعرفة الرقمية
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-[10px] font-black">
                    +{q1Points} درجة
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] mt-0.5">
                  سؤال التحدي وبطاقات الإجابات
                </h3>
              </div>
            </div>

            {/* [FIX 3]: عرض قلب 1 للمساعدة */}
            <div className="flex items-center gap-3 self-end sm:self-auto bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-rose-500/50 shadow-inner">
              <span className="text-xs text-rose-200 font-bold">المساعدة (Hint):</span>
              <div className="flex items-center gap-1.5 text-2xl">
                {currentHearts >= 1 ? (
                  <span className="text-rose-500 animate-pulse" title="قلب المساعدة المتاح">❤️</span>
                ) : (
                  <span className="text-slate-600 opacity-60" title="تم استهلاك قلب المساعدة">🖤</span>
                )}
              </div>

              {!hintUsedPerLevel[selectedLevelNum] && !isLevelCompleted && !isSection1Done ? (
                <button
                  type="button"
                  onClick={handleUseHint}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  استخدام المساعدة ❤️ (−5)
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-bold px-2 py-1 bg-slate-800 rounded-lg">
                  {hintUsedPerLevel[selectedLevelNum] ? 'تم استخدام المساعدة (−5 درجات)' : 'مغلق'}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-bold text-white font-['Tajawal'] leading-relaxed">
              {q1.question}
            </h4>

            {q1.imageUrl && (
              <div className="my-3 flex justify-center items-center">
                <div className="relative max-w-full rounded-2xl overflow-hidden border-2 border-amber-400/50 bg-[#070914] shadow-2xl p-1.5">
                  <img
                    src={q1.imageUrl}
                    alt="توضيح السؤال"
                    className="max-h-56 sm:max-h-80 w-auto max-w-full rounded-xl object-contain shadow-md mx-auto"
                  />
                </div>
              </div>
            )}

            {lastHeartWarning && (
              <div className="p-3 rounded-2xl bg-amber-950/70 border border-amber-500/60 text-amber-200 font-bold text-xs flex items-center gap-2">
                <span>⚠️ {lastHeartWarning}</span>
              </div>
            )}

            {/* Answer Cards Grid with [FIX 8]: visual elimination for wrong option when hint is used */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {q1.options.map((opt, optIdx) => {
                const chosen = isLevelCompleted && completedResult
                  ? completedResult.answers[q1.id]
                  : chosenAnswers[q1.id];
                const isSelected = chosen === optIdx;
                const isCorrect = optIdx === q1.correctIndex;
                const isPassed = isLevelCompleted || (hasAnsweredQ1 && (section1ScorePerLevel[selectedLevelNum] ?? 0) > 0);

                // [FIX 8]: تمييز واستبعاد الخيار عند استخدام الـ Hint
                const isEliminatedByHint = hintEliminatedOption[selectedLevelNum] === optIdx;

                let cardStyle = 'bg-slate-900/90 border-slate-700/80 text-slate-100 hover:border-amber-400/80 hover:bg-slate-800/90';
                if (isEliminatedByHint) {
                  cardStyle = 'bg-rose-950/30 border-rose-900/50 text-rose-400/50 opacity-40 cursor-not-allowed pointer-events-none line-through';
                } else if (isPassed && isCorrect) {
                  cardStyle = 'bg-emerald-950/80 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.3)] font-bold';
                } else if (isPassed && isSelected && !isCorrect) {
                  cardStyle = 'bg-red-950/60 border-red-500/80 text-red-300 line-through opacity-70';
                } else if (isSelected) {
                  cardStyle = 'bg-amber-950/80 border-2 border-amber-400 text-amber-200 font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isLevelCompleted || isPassed || isEliminatedByHint}
                    onClick={() => handleSelectSection1Option(optIdx)}
                    className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col justify-between gap-3 ${
                      isLevelCompleted || isPassed || isEliminatedByHint ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01]'
                    } ${cardStyle}`}
                  >
                    <div className="flex items-start justify-between gap-3 w-full">
                      <span className="text-xs sm:text-sm font-medium leading-relaxed font-['Cairo']">
                        {opt}
                      </span>
                      <span className="w-6 h-6 rounded-full border border-slate-600 bg-slate-950 flex items-center justify-center shrink-0 text-xs font-bold text-amber-400">
                        {['أ', 'ب', 'ج', 'د', 'هـ'][optIdx] || optIdx + 1}
                      </span>
                    </div>

                    {isEliminatedByHint && (
                      <span className="text-[11px] text-rose-400 font-bold font-['Cairo'] block pt-1 border-t border-rose-900/40">
                        ❌ خيار مُستبعد بواسطة المساعدة (−5 درجات)
                      </span>
                    )}

                    {isPassed && isCorrect && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold pt-1 border-t border-emerald-500/40">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>إجابة صحيحة ومتقنة (+{section1ScorePerLevel[selectedLevelNum] ?? q1Points} درجة)</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* [FIX 10]: عرض 0 / 25 بدلاً من 25 / 25 قبل إجابة الطالب */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/50 flex items-center justify-between text-xs mt-3">
              <span className="text-slate-300 font-bold">درجة سؤال التحدي (القسم الأول):</span>
              <span className="px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-400 text-amber-300 font-black font-['Outfit']">
                {chosenAnswers[q1?.id ?? ''] !== undefined
                  ? (section1ScorePerLevel[selectedLevelNum] ?? 0)
                  : 0} / {q1Points} XP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: APPLIED INTERACTIVE ACTIVITY */}
      <div className="mt-6">
        <LevelInteractiveGames
          levelNumber={selectedLevelNum}
          isLevelCompleted={isLevelCompleted}
          initialCompleted={activityScorePerLevel[selectedLevelNum] !== undefined && activityScorePerLevel[selectedLevelNum] > 0}
          earnedScore={activityScorePerLevel[selectedLevelNum] || 0}
          maxScore={currentLevelDef.section2Score || 25}
          onCompleteActivity={handleActivityCompleted}
        />
      </div>

      {/* LEVEL TOTAL SCORE SUMMARY CARD */}
      <div className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-[#170e2b] via-[#22133d] to-[#170e2b] border-2 border-amber-400/90 shadow-[0_0_30px_rgba(251,191,36,0.25)] text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-amber-300 font-black flex items-center gap-1.5 mb-1.5">
              <span>⭐</span>
              <span>درجة المستوى {selectedLevelNum} الإجمالية:</span>
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200">
                مشاهدة الفيديو: <strong className="text-emerald-400">{videoScorePerLevel[selectedLevelNum] ?? 25} / 25 XP</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200">
                سؤال التحدي (25 درجة): <strong className="text-amber-400">{chosenAnswers[q1?.id ?? ''] !== undefined ? (section1ScorePerLevel[selectedLevelNum] ?? 0) : 0} / {q1Points} XP</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200">
                النشاط التطبيقي (50 درجة): <strong className="text-cyan-400">{studentActivity ? 50 : 0} / 50 XP</strong>
              </span>
              <span className="px-3.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black shadow-sm">
                المجموع المعتمد للمستوى: {(videoScorePerLevel[selectedLevelNum] ?? 25) + (chosenAnswers[q1?.id ?? ''] !== undefined ? (section1ScorePerLevel[selectedLevelNum] ?? 0) : 0) + (studentActivity ? 50 : 0)} / 100 XP
              </span>
            </div>
          </div>

          <div className="text-left shrink-0">
            {isLevelCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-black text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تم اعتماد واحتساب درجات المستوى بالكامل</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-300 font-bold text-xs">
                <span>⏳ تُعتمد الدرجة تلقائياً وتُضاف لشيت المستويات الـ 9 عند إنهاء المستوى</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. SECTION: نشاطك الخاص */}
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
                  {levelActivityConfig?.activityTitle || `نشاط المستوى ${selectedLevelNum}`}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {levelActivityConfig?.instructions || currentLevelDef.activityPrompt || 'قم برفع ملف تطبيقك العملي أو مخرج التدريب لهذا المستوى.'}
                </p>
              </div>
            </div>

            <input
              ref={activityFileInputRef}
              type="file"
              accept="image/*,.pdf,video/*,.cptx,.zip"
              onChange={handleUploadActivity}
              className="hidden"
              id={`activity-upload-input-${selectedLevelNum}`}
            />
          </div>

          {uploadError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/90 border-2 border-rose-500 text-rose-200 text-xs font-bold flex items-center gap-2 animate-shake">
              <span>⚠️ {uploadError}</span>
            </div>
          )}

          {/* [FIX 11]: شريط تقدم صادق متعدد المراحل مع نص متغير */}
          {isUploading && (
            <div className="mb-4 p-4 rounded-2xl bg-slate-900/90 border border-sky-500/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                <span>{uploadStatusText}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-sky-500/40">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {!studentActivity ? (
            <div
              onClick={handleTriggerUpload}
              className="mt-5 p-8 rounded-2xl border-2 border-dashed border-amber-400/60 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/40 group-hover:scale-110 group-hover:bg-amber-500/20 text-amber-300 flex items-center justify-center transition-all text-3xl">
                📁
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white font-['Tajawal']">
                  اضغط هنا لرفع {levelActivityConfig?.activityTitle || 'نشاطك الخاص'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-['Cairo']">
                  يقبل جميع امتدادات الفيديو، الصور، مستندات الـ PDF ومشاريع Captivate (.cptx, .zip)
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
            <div className="mt-5 p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/50 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {studentActivity.fileType === 'video' ? '🎬' : studentActivity.fileType === 'pdf' ? '📄' : '🖼️'}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                      {studentActivity.fileName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-bold uppercase">
                        {studentActivity.fileType}
                      </span>
                      {studentActivity.fileSize && (
                        <span>{(studentActivity.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                      )}
                      <span>• تم الرفع بنجاح</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <a
                    href={studentActivity.fileUrl}
                    download={studentActivity.fileName}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل الملف</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleTriggerUpload}
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

              <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/60 p-2 flex justify-center items-center">
                {!studentActivity.fileUrl ? (
                  <div className="p-10 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                      <HardDrive className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-300">الملف محفوظ بأمان في السحابة</p>
                  </div>
                ) : studentActivity.fileType === 'video' ? (
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
                    <p className="text-xs text-slate-300 font-bold">{studentActivity.fileName}</p>
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

              {/* [FIX 12]: عرض حالة المنح التلقائي للـ 50 درجة مع توضيح انتظار مراجعة الأدمن */}
              {studentActivity.status === 'graded' ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-emerald-950/90 border-2 border-emerald-400 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center text-xl shrink-0">
                      ⭐
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-emerald-300 font-['Tajawal']">
                        تم تقييم النشاط ورصد الدرجة بنجاح من المشرف
                      </div>
                      {studentActivity.feedback && (
                        <div className="text-xs text-slate-200 mt-0.5">
                          ملاحظة المشرف: <span className="font-bold text-white">{studentActivity.feedback}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 font-black text-base font-['Outfit'] shrink-0 shadow-md">
                    {studentActivity.grade} / {studentActivity.maxPoints || 50} XP ⭐
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-amber-950/60 to-emerald-950/80 border-2 border-emerald-400/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center text-xl shrink-0">
                      ✅
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-emerald-300 font-['Tajawal']">
                        ✅ تم منح 50 درجة تلقائياً — بانتظار مراجعة الأدمن
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        تم احتساب الـ 50 درجة الخاصة بالنشاط فور رفع الملف، وهي بانتظار الاعتماد والمراجعة النهائية من المشرف.
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black text-xs shrink-0">
                    50 / 50 XP (ممنوحة تلقائياً)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Finish Level Action Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
            <div className="text-xs text-slate-400 font-['Cairo']">
              {isAdmin ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  وضع المشرف (قراءة فقط 👁️): يمكنك الانتقال وتصفح أي مستوى بحرية.
                </span>
              ) : !studentActivity ? (
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
                  if (!isAdmin) {
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
                  }
                  handleFinishLevelClick();
                }}
                className={`w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg ${
                  studentActivity || isAdmin
                    ? 'bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_0_25px_rgba(255,215,0,0.45)] border-2 border-amber-300'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:border-amber-400/50'
                }`}
              >
                <span>finish level {selectedLevelNum}</span>
                <ArrowLeft className="w-5 h-5 shrink-0" />
              </button>

              {(isLevelCompleted || isAdmin) && selectedLevelNum < 9 && (
                <button
                  type="button"
                  onClick={() => setSelectedLevelNum(selectedLevelNum + 1)}
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg"
                >
                  <span>المستوى {selectedLevelNum + 1}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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

      {isTransitioning5s && (
        <LevelTransitionLoader5s
          currentLevel={selectedLevelNum}
          nextLevel={transitionTargetLevel}
          isFinalLevel={selectedLevelNum >= 9}
          onComplete={handle5sTransitionComplete}
        />
      )}

      <DraggableLevelInstructions
        key={selectedLevelNum}
        levelNumber={selectedLevelNum}
        levelTitle={currentLevelDef.title}
        instructions={currentLevelDef.instructions || ''}
      />

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
