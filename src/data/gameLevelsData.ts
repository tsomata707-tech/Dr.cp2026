import { CartoonAvatar, LevelQuestion, LevelMediaItem } from '../types';
import { syncGlobalQuestionsAndLevels } from '../utils/realtimeService';

export const CARTOON_AVATARS: CartoonAvatar[] = [
  {
    id: 'avatar-cpbot',
    name: 'كابتن كابتيفايت (Cp-Bot)',
    title: 'الروبوت السيبراني الذكي',
    emoji: '🤖',
    bgGradient: 'from-amber-500/30 to-yellow-600/30',
    borderClass: 'border-amber-400',
    description: 'يمتلك معالجاً فائقاً لتحليل سيناريوهات Adobe Captivate 2019 وحل التحديات بسرعة البرق.',
  },
  {
    id: 'avatar-knight',
    name: 'فارس الوسائط (Media Knight)',
    title: 'بطل معالجة الصوت والصورة',
    emoji: '🧙‍♂️',
    bgGradient: 'from-purple-500/30 to-indigo-600/30',
    borderClass: 'border-purple-400',
    description: 'يدمج المؤثرات الصوتية والبصرية بسحر واحترافية فائقة في كافة الشرائح.',
  },
  {
    id: 'avatar-astro',
    name: 'رائد الفضاء التعليمي (Astro-Learn)',
    title: 'مستكشف التفاعل والتغذية الراجعة',
    emoji: '👨‍🚀',
    bgGradient: 'from-cyan-500/30 to-blue-600/30',
    borderClass: 'border-cyan-400',
    description: 'يخترق مدارات التفاعل ويبني استجابات تفاعلية مبتكرة تعزز خبرة المتعلم.',
  },
  {
    id: 'avatar-heroine',
    name: 'بطلة التصميم (Design Hero)',
    title: 'مهندسة المشروعات المتجاوبة',
    emoji: '🦸‍♀️',
    bgGradient: 'from-emerald-500/30 to-teal-600/30',
    borderClass: 'border-emerald-400',
    description: 'تبتكر تصاميم Fluid Boxes فائقة الدقة لجميع الشاشات والأجهزة اللوحية.',
  },
  {
    id: 'avatar-fox',
    name: 'المستكشف الذكي (Smart Fox)',
    title: 'صائد الأوسمة وبنوك الأسئلة',
    emoji: '🦊',
    bgGradient: 'from-rose-500/30 to-orange-600/30',
    borderClass: 'border-rose-400',
    description: 'خبير في بناء الاختبارات التفاعلية وحصد الأوسمة الذهبية بلا أخطاء.',
  },
];

export interface GameLevelDef {
  levelNumber: number;
  moduleId: string;
  title: string;
  shortTitle: string;
  storyMission: string;
  instructions?: string;
  objectives?: string;
  activityPrompt?: string;
  totalMaxScore?: number; // Total max score for level (default 100)
  section1Score?: number; // Section 1 points (default 100)
  section2Score?: number; // Section 2 points (default 0)
  imagesSectionTitle?: string;
  imagesSectionDesc?: string;
  badgeName: string;
  badgeEmoji: string;
  videos?: LevelMediaItem[];
  images?: LevelMediaItem[];
  questions: LevelQuestion[];
}

export const GAME_LEVELS_DATA: GameLevelDef[] = [
  {
    levelNumber: 1,
    moduleId: 'mod-1',
    title: 'المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019',
    shortTitle: 'تثبيت البرنامج',
    storyMission: 'مهمتك الأولى يا بطل: تهيئة بيئة العمل الرقمية، التحقق من معمارية 64-Bit، وتشغيل معالج التثبيت القياسي للبرنامج بنجاح.',
    totalMaxScore: 100,
    section1Score: 50,
    section2Score: 50,
    badgeName: 'وسام البداية الرقمية',
    badgeEmoji: '🛡️',
    videos: [],
    images: [],
    questions: [],
  },
  {
    levelNumber: 2,
    moduleId: 'mod-1',
    title: 'المستوى 2: واجهة البرنامج وإدارة الشرائط الزمنية',
    shortTitle: 'واجهة البرنامج',
    storyMission: 'استكشف لوحة التحكم الرئيسية والـ Timeline لإدارة ظهور العناصر بدقة احترافية.',
    totalMaxScore: 100,
    section1Score: 50,
    section2Score: 50,
    badgeName: 'وسام مهندس الواجهة',
    badgeEmoji: '⚙️',
    videos: [],
    images: [],
    questions: [],
  },
  {
    levelNumber: 3,
    moduleId: 'mod-1',
    title: 'المستوى 3: إدراج وتنسيق الوسائط المتعددة',
    shortTitle: 'إدراج الوسائط',
    storyMission: 'المهمة: دمج الصور والأصوات والفيديو داخل مشروعك التعليمي لجعله أكثر حيوية.',
    totalMaxScore: 100,
    section1Score: 50,
    section2Score: 50,
    badgeName: 'وسام مدمج الوسائط',
    badgeEmoji: '🎨',
    videos: [],
    images: [],
    questions: [],
  },
  {
    levelNumber: 4,
    moduleId: 'mod-2',
    title: 'المستوى 4: التفاعل والبرمجة البسيطة للأزرار',
    shortTitle: 'التفاعل الأساسي',
    storyMission: 'حول المحتوى الثابت إلى تفاعلي عبر برمجة الأزرار ونقاط النقر (Click Boxes).',
    totalMaxScore: 100,
    section1Score: 50,
    section2Score: 50,
    badgeName: 'وسام المبرمج الصغير',
    badgeEmoji: '🖱️',
    videos: [],
    images: [],
    questions: [],
  },
  {
    levelNumber: 5,
    moduleId: 'mod-2',
    title: 'المستوى 5: بناء الشرائح المتجاوبة (Fluid Boxes)',
    shortTitle: 'التصميم المتجاوب',
    storyMission: 'صمم مشروعك ليعمل على كافة الشاشات (موبايل، تابلت، كمبيوتر) باستخدام Fluid Boxes.',
    totalMaxScore: 100,
    section1Score: 50,
    section2Score: 50,
    badgeName: 'وسام خبير التجاوب',
    badgeEmoji: '📱',
    videos: [],
    images: [],
    questions: [],
  },
  {
    levelNumber: 6,
    moduleId: 'mod-2',
    title: 'المستوى 6: مسارات التعلم والمشاهد التفاعلية',
    shortTitle: 'مسارات التعلم',
    storyMission: 'ابنِ مسارات تعليمية ذكية تعتمد على اختيارات المتعلم داخل اللعبة.',
    totalMaxScore: 100,
    section1Score: 50,
    section2Score: 50,
    badgeName: 'وسام مخطط المسارات',
    badgeEmoji: '🛤️',
    videos: [],
    images: [],
    questions: [],
  },
  {
    levelNumber: 7,
    moduleId: 'mod-3',
    title: 'المستوى 7: بنوك الأسئلة والاختبارات التفاعلية',
    shortTitle: 'بناء الاختبارات',
    storyMission: 'أنشئ اختبارات تقويمية قوية لقياس مهارات زملائك في اللعبة.',
    totalMaxScore: 100,
    section1Score: 50,
    section2Score: 50,
    badgeName: 'وسام سيد الاختبارات',
    badgeEmoji: '📝',
    videos: [],
    images: [],
    questions: [],
  },
  {
    levelNumber: 8,
    moduleId: 'mod-3',
    title: 'المستوى 8: المتغيرات والإجراءات المتقدمة (Advanced Actions)',
    shortTitle: 'الإجراءات المتقدمة',
    storyMission: 'استخدم المتغيرات والشروط البرمجية (Variables) لعمل تفاعلات ذكية معقدة.',
    totalMaxScore: 100,
    section1Score: 50,
    section2Score: 50,
    badgeName: 'وسام خبير المتغيرات',
    badgeEmoji: '💎',
    videos: [],
    images: [],
    questions: [],
  },
  {
    levelNumber: 9,
    moduleId: 'mod-3',
    title: 'المستوى 9: تصدير المشروع ونشره كصفحة ويب',
    shortTitle: 'تصدير المشروع',
    storyMission: 'المهمة الأخيرة: استخرج مشروعك النهائي كـ HTML5 وشاركه مع العالم!',
    totalMaxScore: 100,
    section1Score: 50,
    section2Score: 50,
    badgeName: 'وسام المبدع النهائي',
    badgeEmoji: '🚀',
    videos: [],
    images: [],
    questions: [],
  },
];

export function saveCustomGameLevels(levels: GameLevelDef[], _isManualUpdate: boolean = false) {
  if (!Array.isArray(levels)) {
    console.error('saveCustomGameLevels: levels is not an array', levels);
    return;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cp_game_levels_custom_v3', JSON.stringify(levels));
  }
  syncGlobalQuestionsAndLevels('levels', levels);
  // Dispatch event for UI update
  window.dispatchEvent(new CustomEvent('game-levels-updated', { detail: levels }));
}

export function resetGameLevelsToDefault() {
  saveCustomGameLevels(GAME_LEVELS_DATA, true);
  return GAME_LEVELS_DATA;
}

export function getCustomGameLevels(): GameLevelDef[] {
  if (typeof localStorage === 'undefined') return GAME_LEVELS_DATA;
  const raw = localStorage.getItem('cp_game_levels_custom_v3');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const levels = [...parsed];
        for (let i = 1; i <= 9; i++) {
          if (!levels.some((l) => l && l.levelNumber === i)) {
            const def = GAME_LEVELS_DATA.find((d) => d.levelNumber === i);
            if (def) levels.push(def);
          }
        }
        levels.sort((a, b) => (a?.levelNumber || 0) - (b?.levelNumber || 0));
        return levels;
      }
    } catch {
      return GAME_LEVELS_DATA;
    }
  }
  return GAME_LEVELS_DATA;
}

export function addMediaToLevel(levelNum: number, item: LevelMediaItem) {
  const levels = getCustomGameLevels();
  const idx = levels.findIndex((l) => l.levelNumber === levelNum);
  if (idx !== -1) {
    const type = item.type === 'video' ? 'video' : 'image';
    if (type === 'video') {
      levels[idx].videos = levels[idx].videos || [];
      levels[idx].videos.push(item);
    } else {
      levels[idx].images = levels[idx].images || [];
      levels[idx].images.push(item);
    }
    saveCustomGameLevels(levels);
  }
  return levels;
}

export function replaceMediaInLevel(levelNum: number, itemId: string, newItem: LevelMediaItem) {
  const levels = getCustomGameLevels();
  const idx = levels.findIndex((l) => l.levelNumber === levelNum);
  if (idx !== -1) {
    const type = newItem.type === 'video' ? 'video' : 'image';
    if (type === 'video') {
      const vIdx = (levels[idx].videos || []).findIndex(m => m.id === itemId);
      if (vIdx !== -1) {
        levels[idx].videos![vIdx] = newItem;
      }
    } else {
      const iIdx = (levels[idx].images || []).findIndex(m => m.id === itemId);
      if (iIdx !== -1) {
        levels[idx].images![iIdx] = newItem;
      }
    }
    saveCustomGameLevels(levels);
  }
  return levels;
}

export function removeMediaFromLevel(levelNum: number, itemId: string) {
  const levels = getCustomGameLevels();
  const idx = levels.findIndex((l) => l.levelNumber === levelNum);
  if (idx !== -1) {
    levels[idx].videos = (levels[idx].videos || []).filter((m) => m.id !== itemId);
    levels[idx].images = (levels[idx].images || []).filter((m) => m.id !== itemId);
    saveCustomGameLevels(levels);
  }
  return levels;
}

export function updateMediaItemInLevel(levelNum: number, itemId: string, updates: Partial<LevelMediaItem>) {
  const levels = getCustomGameLevels();
  const idx = levels.findIndex((l) => l.levelNumber === levelNum);
  if (idx !== -1) {
    // Try both lists
    let found = false;
    const vIdx = (levels[idx].videos || []).findIndex(m => m.id === itemId);
    if (vIdx !== -1) {
      levels[idx].videos![vIdx] = { ...levels[idx].videos![vIdx], ...updates };
      found = true;
    }
    const iIdx = (levels[idx].images || []).findIndex(m => m.id === itemId);
    if (iIdx !== -1 && !found) {
      levels[idx].images![iIdx] = { ...levels[idx].images![iIdx], ...updates };
      found = true;
    }
    if (found) {
      saveCustomGameLevels(levels);
    }
  }
  return levels;
}
