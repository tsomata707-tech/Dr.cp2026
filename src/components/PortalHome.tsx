import React, { useState, useEffect } from 'react';
import { CpLogo } from './CpLogo';
import { WhatsAppSupport } from './WhatsAppSupport';
import { CURRICULUM_MODULES, RESEARCH_INFO } from '../data/curriculumData';
import { RightSidebarModules } from './RightSidebarModules';
import { ModuleDetailsView } from './ModuleDetailsView';
import { HonorBoard } from './HonorBoard';
import { ResearchGroups } from './ResearchGroups';
import { EducationalGameView } from './EducationalGameView';
import { WelcomeScreen } from './WelcomeScreen';
import { InstructionsScreen } from './InstructionsScreen';
import { ProfileScreen } from './ProfileScreen';
import { LearningMapScreen } from './LearningMapScreen';
import { LeaderboardOrTeamBoard } from './LeaderboardOrTeamBoard';
import { ApplicationTaskModal } from './ApplicationTaskModal';
import { PointsCelebrationModal } from './PointsCelebrationModal';
import { ProgressBoardView } from './ProgressBoardView';
import { DesignChallengeView } from './DesignChallengeView';
import { SupervisorsHonorBoard } from './SupervisorsHonorBoard';
import { PreTestGameView } from './PreTestGameView';
import { StudentWelcomeFloatingCard } from './StudentWelcomeFloatingCard';
import { getSupervisorsBoardConfig } from '../utils/supervisorsStorage';
import { getGroupByUsername } from '../data/studentAccounts';
import { getStudentProgress, getAllStudentsProgress, saveAllStudentsProgress } from '../utils/gameStorage';
import { GAME_LEVELS_DATA } from '../data/gameLevelsData';
import {
  GraduationCap,
  Trophy,
  Crown,
  Users,
  BookOpen,
  LogOut,
  Layers,
  Sparkles,
  Zap,
  Shield,
  Gamepad2,
  Compass,
  User,
  HelpCircle,
  Award,
  FileCheck,
  CheckCircle,
  Home,
  ArrowLeft,
  Database,
} from 'lucide-react';

interface PortalHomeProps {
  username: string;
  onLogout: () => void;
}

export type PortalSection =
  | 'map'
  | 'welcome'
  | 'instructions'
  | 'pretest'
  | 'posttest'
  | 'profile'
  | 'game'
  | 'task'
  | 'progress'
  | 'challenge'
  | 'ranking'
  | 'honor'
  | 'groups'
  | 'levels';

export const PortalHome: React.FC<PortalHomeProps> = ({ username, onLogout }) => {
  // Detect user's research group based on username (G1_Cp_01 -> G1)
  const userGroupMeta = getGroupByUsername(username);
  const isCollaborative = userGroupMeta?.learningMode === 'تعاوني';

  // Student Game Progress
  const [studentGame, setStudentGame] = useState(() => getStudentProgress(username));

  // Main Section Navigation:
  // الترتيب الصحيح المعتمد: تسجيل الدخول -> لوحة الشرف -> القواعد والإرشادات -> الانتقال إلى بيئة الألعاب
  const [activeMainSection, setActiveMainSection] = useState<PortalSection>('honor');

  // Floating welcome card upon login for 15 seconds with loading bar
  const [showWelcomeFloatingCard, setShowWelcomeFloatingCard] = useState<boolean>(true);

  // Auto-display supervisors honor board after welcome card closes
  const [showSupervisorModal, setShowSupervisorModal] = useState<boolean>(false);

  // Modals for Task and Celebration
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    points: number;
    total: number;
    message: string;
  } | null>(null);

  // Selected Research Group defaults strictly to student's assigned group
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    userGroupMeta ? userGroupMeta.id : 'grp-1'
  );

  useEffect(() => {
    if (userGroupMeta) {
      setSelectedGroupId(userGroupMeta.id);
    }
  }, [username]);

  // Always scroll to the very top immediately whenever activeMainSection changes or mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeMainSection]);

  // Global listener to return to student personal home page
  useEffect(() => {
    const handleReturnToStudentHome = () => {
      setShowSupervisorModal(false);
      setActiveMainSection('map');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };
    window.addEventListener('cp_navigate_to_student_home', handleReturnToStudentHome);
    return () => window.removeEventListener('cp_navigate_to_student_home', handleReturnToStudentHome);
  }, []);

  const refreshProgress = () => {
    setStudentGame(getStudentProgress(username));
  };

  // Educational Levels State
  const [activeModuleId, setActiveModuleId] = useState<string>(CURRICULUM_MODULES[0].id);
  const [completedObjectives, setCompletedObjectives] = useState<Record<string, boolean>>({
    'obj-1-1': true,
    'obj-1-2': true,
    'obj-2-1': true,
  });

  const handleToggleObjective = (objId: string) => {
    setCompletedObjectives((prev) => ({
      ...prev,
      [objId]: !prev[objId],
    }));
  };

  const activeModuleIndex = CURRICULUM_MODULES.findIndex((m) => m.id === activeModuleId);
  const currentModule = CURRICULUM_MODULES[activeModuleIndex] || CURRICULUM_MODULES[0];

  // Calculation of progress
  const completedCountByModule: Record<string, number> = {};
  let totalObjectivesCount = 0;
  let totalCompletedCount = 0;

  CURRICULUM_MODULES.forEach((mod) => {
    let count = 0;
    mod.objectives.forEach((obj) => {
      totalObjectivesCount++;
      if (completedObjectives[obj.id]) {
        count++;
        totalCompletedCount++;
      }
    });
    completedCountByModule[mod.id] = count;
  });

  const handleTaskComplete = (bonusPoints: number) => {
    const all = getAllStudentsProgress();
    const prog = getStudentProgress(username);
    prog.totalScore += bonusPoints;
    saveAllStudentsProgress(all);
    refreshProgress();
    setShowTaskModal(false);

    // Open points celebration screen (Screen 13)
    setCelebrationData({
      points: bonusPoints,
      total: prog.totalScore,
      message: `لقد أنهيت المهمة التطبيقية للمرحلة ${prog.currentLevel} بنجاح!`,
    });
  };

  const handleChallengeSolve = (bonusPoints: number) => {
    const all = getAllStudentsProgress();
    const prog = getStudentProgress(username);
    prog.totalScore += bonusPoints;
    saveAllStudentsProgress(all);
    refreshProgress();

    setCelebrationData({
      points: bonusPoints,
      total: prog.totalScore,
      message: 'رائع! لقد قمت بحل مشكلة التصميم في Adobe Captivate بنجاح وحصدت نقاط التميز.',
    });
  };

  const currentLevelDef =
    GAME_LEVELS_DATA.find((l) => l.levelNumber === studentGame.currentLevel) || GAME_LEVELS_DATA[0];

  // Smart test & learning continuation tracker: يتابع من مكان ما توقف في الاختبارات وحسب ما يراه النظام
  const getSmartResumeAction = () => {
    // 1. If Pre-Test is not completed yet, system directs student to start/finish Pre-Test
    if (!studentGame.preTestResult?.completed) {
      return {
        stepLabel: 'المحطة 1: المستوى التمهيدي',
        title: 'متابعة من حيث توقفت: لعبة الاختبار القبلي (البداية المنهجية)',
        description: '',
        badge: 'مطلوب الآن ⭐',
        buttonText: 'متابعة الاختبار القبلي الآن 🏎️',
        action: () => {
          setActiveMainSection('pretest');
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        },
        gradient: 'from-amber-500 via-[#ffd700] to-yellow-500',
        textColor: 'text-slate-950',
      };
    }

    // 2. If Pre-Test is done, but the student hasn't completed all 10 educational levels
    const completedLevelsCount = Object.keys(studentGame.completedLevels || {}).length;
    if (studentGame.currentLevel <= 10 && completedLevelsCount < 10) {
      return {
        stepLabel: `المحطة 2: المراحل التعليمية (${completedLevelsCount}/10 مكتملة)`,
        title: `متابعة من حيث توقفت: المرحلة ${studentGame.currentLevel} (النشاط والتقييم اللحظي)`,
        description: `أنجزت ${completedLevelsCount} من 10 مستويات بنجاح. استأنف الآن تحديات وأسئلة المستوى ${studentGame.currentLevel} لكسب النقاط.`,
        badge: `المرحلة الحالية: L${studentGame.currentLevel} 🎮`,
        buttonText: `متابعة المرحلة ${studentGame.currentLevel} الآن 🚀`,
        action: () => {
          setActiveMainSection('game');
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        },
        gradient: 'from-blue-600 via-indigo-600 to-purple-600',
        textColor: 'text-white',
      };
    }

    // 3. If all 10 levels are completed, but Post-Test is not completed yet
    if (!studentGame.postTestResult?.completed) {
      return {
        stepLabel: 'المحطة 3: الاختبار البعدي الختامي',
        title: 'متابعة من حيث توقفت: لعبة الاختبار البعدي (المحطة الختامية)',
        description: 'أتممت كافة المراحل التعليمية بنجاح! استأنف الآن لعبة الاختبار البعدي الختامي.',
        badge: 'المحطة الختامية 🏁',
        buttonText: 'بدء الاختبار البعدي الآن 🏆',
        action: () => {
          setActiveMainSection('posttest');
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        },
        gradient: 'from-purple-600 via-pink-600 to-rose-600',
        textColor: 'text-white',
      };
    }

    // 4. Everything completed!
    return {
      stepLabel: 'المسار التعليمي مكتمل بالكامل بنجاح 100%',
      title: 'أتممت كافة الاختبارات والمراحل بنجاح باهر! 🎉',
      description: 'لقد اجتزت الاختبار القبلي وجميع المستويات العشرة والاختبار البعدي. استعرض رتبتك في لوحة الشرف.',
      badge: 'مكتمل بنسبة 100% 👑',
      buttonText: 'استعراض لوحة الشرف والإنجازات 🏆',
      action: () => {
        setActiveMainSection('honor');
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      },
      gradient: 'from-amber-400 via-[#ffd700] to-yellow-500',
      textColor: 'text-slate-950',
    };
  };

  const smartResume = getSmartResumeAction();

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 space-y-6" id="portal-dashboard">
      {/* Top Banner Overview Card */}
      <div className="rounded-3xl bg-[#0b0f1e]/95 backdrop-blur-2xl border-2 border-blue-500/40 shadow-[0_0_35px_rgba(37,99,235,0.2)] p-6 sm:p-8 text-right overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          {/* Right Header & Greeting */}
          <div className="flex items-center gap-4">
            <CpLogo size="lg" showText={false} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold font-['Cairo']">
                  جلسة تعليمية نشطة
                </span>
                {userGroupMeta ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-400/50 text-blue-300 text-xs font-bold font-['Cairo']">
                    {userGroupMeta.name}
                  </span>
                ) : (
                  <span className="text-xs text-[#ffd700] font-semibold font-['Cairo']">
                    {RESEARCH_INFO.software}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
                بيئة الألعاب التعليمية الإلكترونية: مرحباً بك، <span className="text-[#ffd700] font-mono">{username}</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1 font-['Cairo']">
                جامعة طنطا - كلية التربية النوعية • قسم تكنولوجيا التعليم
              </p>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#080d1e] border border-blue-500/30 text-center sm:text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">النقاط الفعلية</span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-['Outfit']">
                {studentGame.totalScore} ⭐
              </span>
            </div>

            <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#080d1e] border border-purple-500/30 text-center sm:text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">المرحلة الحالية</span>
              <span className="text-base sm:text-lg font-black text-purple-300 font-['Outfit']">
                L{studentGame.currentLevel} / 10
              </span>
            </div>

            <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#080d1e] border border-emerald-500/30 text-center sm:text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">الأوسمة الفعلية</span>
              <span className="text-base sm:text-lg font-black text-emerald-300 font-['Outfit']">
                {studentGame.badges.length} 🏅
              </span>
            </div>
          </div>
        </div>

        {/* Master Storyboard Navigation Bar: All key screens accessible in 1 click */}
        <div className="pt-5 sm:pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#070a16] border border-blue-500/30 shadow-inner w-full overflow-x-auto touch-pan-x scrollbar-thin">
            {/* 1. لوحة الشرف (الخطوة الأولى بعد الدخول) */}
            <button
              type="button"
              id="tab-honor-board"
              onClick={() => setActiveMainSection('honor')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'honor'
                  ? 'bg-gradient-to-r from-amber-400 via-[#ffd700] to-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.5)]'
                  : 'text-[#ffd700] hover:text-white hover:bg-slate-900 border border-amber-500/40'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>🏆 لوحة الشرف</span>
            </button>

            {/* 1. قواعد اللعبة والإرشادات */}
            <button
              type="button"
              id="tab-instructions"
              onClick={() => setActiveMainSection('instructions')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'instructions'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-[0_0_15px_rgba(2,132,199,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>📋 القواعد والإرشادات</span>
            </button>

            {/* 2. بيئة الألعاب والصفحة الخاصة للطالب */}
            <button
              type="button"
              id="tab-learning-map"
              onClick={() => setActiveMainSection('map')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'map'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-[#ffd700]" />
              <span>🎮 بيئة الألعاب</span>
            </button>

            {/* المستوى التمهيدي: لعبة الاختبار القبلي */}
            <button
              type="button"
              id="tab-pretest"
              onClick={() => setActiveMainSection('pretest')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'pretest'
                  ? 'bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(255,215,0,0.45)]'
                  : studentGame.preTestResult?.completed
                  ? 'text-emerald-300 hover:text-white hover:bg-slate-900 border border-emerald-500/30'
                  : 'text-amber-300 hover:text-white hover:bg-slate-900 border border-amber-500/50 animate-pulse'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>
                {studentGame.preTestResult?.completed ? '✅ الاختبار القبلي (مكتمل)' : '⭐ الاختبار القبلي (البداية)'}
              </span>
            </button>

            {/* المحطة الختامية: لعبة الاختبار البعدي */}
            <button
              type="button"
              id="tab-posttest"
              onClick={() => setActiveMainSection('posttest')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'posttest'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.45)]'
                  : studentGame.postTestResult?.completed
                  ? 'text-emerald-300 hover:text-white hover:bg-slate-900 border border-emerald-500/30'
                  : 'text-purple-300 hover:text-white hover:bg-slate-900 border border-purple-500/30'
              }`}
            >
              <Trophy className="w-4 h-4 text-purple-400" />
              <span>
                {studentGame.postTestResult?.completed ? '🏆 الاختبار البعدي (مكتمل)' : '🏁 الاختبار البعدي'}
              </span>
            </button>

            {/* 2. النشاط والتقييم */}
            <button
              type="button"
              id="tab-educational-game"
              onClick={() => setActiveMainSection('game')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'game'
                  ? 'bg-gradient-to-r from-[#ffd700] via-amber-400 to-[#d4af37] text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>🎮 النشاط والتقييم اللحظي</span>
            </button>

            {/* 3. المهمة التطبيقية */}
            <button
              type="button"
              id="tab-task"
              onClick={() => setShowTaskModal(true)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap text-amber-300 hover:text-white bg-[#141029] hover:bg-[#1a1636] border border-amber-500/40`}
            >
              <FileCheck className="w-4 h-4 text-[#ffd700]" />
              <span>🛠️ المهمة التطبيقية (+50 ⭐)</span>
            </button>

            {/* 4. لوحة التقدم العام */}
            <button
              type="button"
              id="tab-progress-board"
              onClick={() => setActiveMainSection('progress')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'progress'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>📊 لوحة التقدم العام</span>
            </button>



            {/* 6. التحدي ومشكلة التصميم */}
            <button
              type="button"
              id="tab-challenge"
              onClick={() => setActiveMainSection('challenge')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'challenge'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-700 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>⚡ التحدي ومشكلة التصميم</span>
            </button>

            {/* 7. الملف الشخصي */}
            <button
              type="button"
              id="tab-profile"
              onClick={() => setActiveMainSection('profile')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'profile'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>👤 الملف الشخصي</span>
            </button>



            {/* 9. شاشة الترحيب */}
            <button
              type="button"
              id="tab-welcome"
              onClick={() => {
                setShowWelcomeFloatingCard(true);
                setActiveMainSection('welcome');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'welcome'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>👋 بطاقة الترحيب</span>
            </button>

            {/* 11. الأربع مجموعات */}
            <button
              type="button"
              id="tab-research-groups"
              onClick={() => setActiveMainSection('groups')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'groups'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>المجموعات الـ 4</span>
            </button>


          </div>
        </div>
      </div>

      {/* Main Content Render based on Selected Master Tab */}
      {/* 1. بيئة التعلم التفاعلية (Screen 6 & Screen 7 Stage Intro) */}
      {activeMainSection === 'map' && (
        <LearningMapScreen
          username={username}
          onSelectStageForContent={() => setActiveMainSection('levels')}
          onSelectStageForActivity={() => setActiveMainSection('game')}
          onSelectPreTest={() => setActiveMainSection('pretest')}
          onSelectPostTest={() => setActiveMainSection('posttest')}
        />
      )}

      {/* 2. شاشة الترحيب (Screen 3) */}
      {activeMainSection === 'welcome' && (
        <WelcomeScreen
          username={username}
          onStartLearning={() => setActiveMainSection('instructions')}
          onOpenInstructions={() => setActiveMainSection('instructions')}
          onGoToHome={() => setActiveMainSection('map')}
        />
      )}

      {/* 3. شاشة التعليمات وقواعد اللعبة (Screen 4) */}
      {activeMainSection === 'instructions' && (
        <InstructionsScreen
          onGotIt={() => {
            const prog = getStudentProgress(username);
            if (!prog.preTestResult?.completed) {
              setActiveMainSection('pretest');
            } else {
              setActiveMainSection('map');
            }
          }}
          onBackToHome={() => setActiveMainSection('map')}
          onBackToWelcome={() => setActiveMainSection('map')}
          actionButtonText="الانتقال إلى بيئة الألعاب 🎮"
        />
      )}

      {/* المستوى التمهيدي: لعبة الاختبار القبلي (Screen Pre-Test) */}
      {activeMainSection === 'pretest' && (
        <PreTestGameView
          username={username}
          mode="pre"
          onFinishPreTest={() => {
            refreshProgress();
            setActiveMainSection('map');
          }}
          onBackToInstructions={() => setActiveMainSection('instructions')}
        />
      )}

      {/* المحطة الختامية: لعبة الاختبار البعدي (Screen Post-Test) */}
      {activeMainSection === 'posttest' && (
        <PreTestGameView
          username={username}
          mode="post"
          onFinishPreTest={() => {
            refreshProgress();
            setActiveMainSection('map');
          }}
          onBackToInstructions={() => setActiveMainSection('map')}
        />
      )}

      {/* 4. الملف الشخصي (Screen 5) */}
      {activeMainSection === 'profile' && (
        <ProfileScreen
          username={username}
          onNavigateToMap={() => setActiveMainSection('map')}
        />
      )}

      {/* 5. اللعبة التعليمية والنشاط والتغذية الراجعة المتمايزة (Screens 8, 9, 10, 11) */}
      {activeMainSection === 'game' && (
        <EducationalGameView
          username={username}
          onBackToHome={() => setActiveMainSection('map')}
        />
      )}

      {/* 6. لوحة التقدم العام (Screen 14) */}
      {activeMainSection === 'progress' && (
        <ProgressBoardView
          username={username}
          onSelectStage={(lvlNum) => {
            setActiveMainSection('game');
          }}
        />
      )}

      {/* 7. التحدي ومشكلة التصميم (Screen 17) */}
      {activeMainSection === 'challenge' && (
        <DesignChallengeView
          currentLevel={studentGame.currentLevel}
          onSolveChallenge={handleChallengeSolve}
        />
      )}

      {/* 8. لوحة الشرف العامة */}
      {activeMainSection === 'honor' && (
        <HonorBoard
          currentUsername={username}
          onContinueToInstructions={() => setActiveMainSection('instructions')}
        />
      )}

      {/* 9. المجموعات البحثية الأربعة */}
      {activeMainSection === 'groups' && (
        <ResearchGroups
          selectedGroupId={selectedGroupId}
          onSelectGroup={(id) => setSelectedGroupId(id)}
          currentUsername={username}
        />
      )}

      {/* Screen 12: المهمة التطبيقية Modal */}
      {showTaskModal && (
        <ApplicationTaskModal
          levelNumber={studentGame.currentLevel}
          stageTitle={currentLevelDef.title}
          isCollaborative={isCollaborative}
          onCompleteTask={handleTaskComplete}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {/* Screen 13: شاشة النقاط والاحتفال Modal */}
      {celebrationData && (
        <PointsCelebrationModal
          pointsGained={celebrationData.points}
          totalScore={celebrationData.total}
          isCollaborative={isCollaborative}
          message={celebrationData.message}
          onContinue={() => setCelebrationData(null)}
        />
      )}

      {/* 1. بطاقة ترحيب عائمة لمدة 10 ثوانٍ فقط مع شريط تحميل أنيق بدون عداد وبياناتك صحيحة ثم تظهر لوحة الشرف */}
      {showWelcomeFloatingCard && (
        <StudentWelcomeFloatingCard
          username={username}
          durationSeconds={10}
          onFinish={() => {
            setShowWelcomeFloatingCard(false);
            setShowSupervisorModal(true);
            setActiveMainSection('honor');
          }}
        />
      )}

      {/* 2. لوحة الشرف الخاصة بمشرفي المشروع والرسالة */}
      {showSupervisorModal && (
        <SupervisorsHonorBoard
          isModal={true}
          onClose={() => {
            setShowSupervisorModal(false);
            setActiveMainSection('instructions');
          }}
          onContinue={() => {
            setShowSupervisorModal(false);
            setActiveMainSection('instructions');
          }}
          showContinueButton={true}
          continueButtonText="الانتقال إلى القواعد والإرشادات 📋"
        />
      )}

      {/* Smart Resume Card (باسفل الصفحة: يتابع من مكان ما توقف في الاختبارات وحسب ما يراه النظام) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0d122b] via-[#090d20] to-[#0d122b] border-2 border-[#ffd700]/70 p-6 sm:p-8 shadow-[0_0_40px_rgba(255,215,0,0.25)] relative overflow-hidden animate-fadeIn">
        <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 text-right max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-[#ffd700] text-xs font-black">
                {smartResume.stepLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold">
                المسار الموصى به 🧭
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white font-['Tajawal'] tracking-tight">
              {smartResume.title}
            </h3>
            {smartResume.description ? (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-['Cairo']">
                {smartResume.description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            id="btn-smart-resume-tests"
            onClick={smartResume.action}
            className={`w-full md:w-auto min-w-[260px] px-8 py-4 rounded-2xl bg-gradient-to-r ${smartResume.gradient} ${smartResume.textColor} font-black text-sm sm:text-base shadow-[0_0_30px_rgba(255,215,0,0.35)] border-2 border-amber-300/60 transition-all cursor-pointer flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0`}
          >
            <span>{smartResume.buttonText}</span>
            <ArrowLeft className="w-5 h-5 shrink-0" />
          </button>
        </div>
      </div>

      {/* Bottom Footer Utilities */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <WhatsAppSupport />

        <button
          type="button"
          onClick={onLogout}
          id="btn-portal-bottom-logout"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-red-500/40 bg-red-950/30 hover:bg-red-900/40 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج والعودة لصفحة البداية</span>
        </button>
      </div>
    </div>
  );
};
