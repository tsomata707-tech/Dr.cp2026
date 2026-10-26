import { syncGlobalQuestionsAndLevels } from './realtimeService';

export interface InstructionCardItem {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  borderColor: string;
  bgColor: string;
  iconKey: 'pretest' | 'goals' | 'points' | 'badges' | 'levels' | 'custom';
  text: string;
  bullets: string[];
}

export interface SiteInstructionsConfig {
  guidanceNotice: string;
  siteTitle: string;
  siteDescription: string;
  pretestRequiredBeforeLevels: boolean;
  cards: InstructionCardItem[];
  updatedAt: string;
}

const INSTRUCTIONS_STORAGE_KEY = 'cp_site_instructions_and_standards_v5';

export const DEFAULT_INSTRUCTIONS_CONFIG: SiteInstructionsConfig = {
  guidanceNotice: 'ابدأ بالاختبار القبلي للانطلاق في باقي المستويات التعليمية التفاعلية.',
  siteTitle: 'قواعد ونظام بيئة الألعاب التعليمية',
  siteDescription: 'أهلاً بك! هذه البيئة تعتمد على التعلم القائم على الألعاب (Gamification) لتنمية مهارات إنتاج وتصميم الوسائط المتعددة.',
  pretestRequiredBeforeLevels: true,
  cards: [
    {
      id: 'pretest',
      title: 'الاختبار القبلي (المستوى التمهيدي)',
      tag: '⭐ نقطة الانطلاق الإلزامية',
      tagColor: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black border border-sky-300 shadow-md',
      borderColor: 'border-sky-400/80',
      bgColor: 'from-slate-900 via-sky-950/70 to-slate-950',
      iconKey: 'pretest',
      text: 'ادخل الاختبار القبلي أولاً ثم تابع باقي المستويات. صُمم الاختبار القبلي على هيئة لعبة أسئلة تفاعلية ممتعة لتشخيص مهاراتك القبلية وتحديد نقطة انطلاقك.',
      bullets: [
        'أداء لعبة الاختبار القبلي متطلب إلزامي يفتح لك تلقائياً المستوى الأول.',
        'تتكون اللعبة من أسئلة تشخيصية تفاعلية تقيس مهارات الوسائط المتعددة.',
        'تحصل على نقاط تمهيدية وشارة انطلاق فور إكمال الاختبار.',
        'تُرصد نتائجك بدقة في لوحة الإشراف الأكاديمي لمتابعة تقدمك.',
      ],
    },
    {
      id: 'goals',
      title: 'الأهداف التعليمية والمهارية',
      tag: '🎯 الأهداف الرئيسية',
      tagColor: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black border border-emerald-300 shadow-md',
      borderColor: 'border-emerald-400/80',
      bgColor: 'from-slate-900 via-teal-950/70 to-slate-950',
      iconKey: 'goals',
      text: 'تنمية مهارات إنتاج وتصميم الوسائط المتعددة التفاعلية باستخدام برنامج Adobe Captivate 2019 وتعزيز التقبل التكنولوجي للتعلم القائم على الألعاب.',
      bullets: [
        'إتقان واجهة البرنامج وإدارة الشرائح والمشاهد التفاعلية.',
        'إدراج وتنسيق الوسائط (النصوص، الصور، الأصوات، الفيديو).',
        'برمجة الأزرار ونقاط التفاعل ومسارات التعلم المتقدمة.',
        'إنشاء بنوك الأسئلة والاختبارات التفاعلية وتصدير المشاريع بدقة.',
      ],
    },
    {
      id: 'points',
      title: 'نظام النقاط التراكمي (XP)',
      tag: '⭐ رصيد XP',
      tagColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black border border-blue-300 shadow-md',
      borderColor: 'border-blue-400/70',
      bgColor: 'from-slate-900 via-blue-950/60 to-slate-950',
      iconKey: 'points',
      text: 'تحصل على نقاط ذهبية (XP) عند حل الأنشطة والمهام التعليمية. الإجابة الصحيحة والسريعة تمنحك نقاطاً أكثر لتعزيز ترتيبك وإنجازك.',
      bullets: [
        'كل سؤال صحيح يمنحك نقاطاً تضاف مباشرة لسجلك.',
        'الدقة والتركيز في المحاولة الأولى تمنحك مكافآت إضافية.',
        'في النمط التعاوني: نقاطك تساهم مباشرة في رفع رصيد وإنجاز فريقك المشترك.',
        'في النمط التنافسي: نقاطك تحدد ترتيبك الفردي على لوحة متصدري الدفعة.',
      ],
    },
    {
      id: 'badges',
      title: 'نظام الشارات والأوسمة',
      tag: '🏅 أوسمة شرف',
      tagColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black border border-purple-300 shadow-md',
      borderColor: 'border-purple-400/70',
      bgColor: 'from-slate-900 via-purple-950/60 to-slate-950',
      iconKey: 'badges',
      text: 'إنجازات محددة تمنحك شارات مميزة تثبت جدارتك مثل "وسام المستكشف التمهيدي"، "خبير التفاعل"، "مهندس الشرائح"، و"نجم الوسائط".',
      bullets: [
        'وسام خاص لاجتياز لعبة الاختبار القبلي بنجاح.',
        'كل مرحلة من الـ 10 مراحل تمنحك وساماً نوعياً عند إتقان مهاراتها.',
        'أوسمة خاصة للسرعة الفائقة والتفوق الخالي من الأخطاء.',
        'تُعرض أوسمتك في ملفك الشخصي ولوحة الشرف أمام زملائك.',
      ],
    },
    {
      id: 'levels',
      title: 'نظام المستويات والترقية',
      tag: '📈 سلم الترقية',
      tagColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black border border-amber-300 shadow-md',
      borderColor: 'border-amber-400/70',
      bgColor: 'from-slate-900 via-teal-950/60 to-slate-950',
      iconKey: 'levels',
      text: 'اجمع النقاط وأكمل المهام للانتقال التدريجي من المستوى التمهيدي إلى مستوى "مبتدئ" ثم "ممارس" ثم "متقدم" وصولاً إلى "خبير ومصمم محترف".',
      bullets: [
        'المستوى التمهيدي: الاختبار القبلي التشخيصي.',
        'المستوى 1-2: مبتدئ (استكشاف المفاهيم الأساسية وواجهة البرنامج).',
        'المستوى 3-5: ممارس (التعامل الاحترافي مع الشرائح والوسائط).',
        'المستوى 6-8: متقدم (بناء التفاعلية والمحاكاة والتقييمات).',
        'المستوى 9-10: خبير ومصمم محترف (النشر والتكامل والجودة التعليمية).',
      ],
    },
  ],
  updatedAt: new Date().toISOString(),
};

export function getSiteInstructionsConfig(): SiteInstructionsConfig {
  try {
    let raw = localStorage.getItem(INSTRUCTIONS_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem('cp_site_instructions_and_standards_v3');
    }
    if (!raw) {
      raw = localStorage.getItem('cp_site_instructions_and_standards_v1');
    }
    if (!raw) {
      saveSiteInstructionsConfig(DEFAULT_INSTRUCTIONS_CONFIG);
      return DEFAULT_INSTRUCTIONS_CONFIG;
    }
    let cleanedRaw = raw
      .replace(/خريطة التعلم/g, 'بيئة الألعاب')
      .replace(/خريطة الألعاب/g, 'بيئة الألعاب')
      .replace(/بيئة الألعاب \(خريطة التعلم\)/g, 'بيئة الألعاب')
      .replace(/بيئة التعلم \(خريطة التعلم\)/g, 'بيئة الألعاب')
      .replace(/خريطة/g, 'بيئة الألعاب')
      .replace(/bg-sky-950\/[0-9]+/g, 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black border border-sky-300 shadow-md')
      .replace(/bg-emerald-950\/[0-9]+/g, 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black border border-emerald-300 shadow-md')
      .replace(/bg-blue-950\/[0-9]+/g, 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black border border-blue-300 shadow-md')
      .replace(/bg-purple-950\/[0-9]+/g, 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black border border-purple-300 shadow-md')
      .replace(/bg-teal-950\/[0-9]+/g, 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black border border-amber-300 shadow-md')
      .replace(/bg-amber-950\/[0-9]+/g, 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black border border-amber-300 shadow-md')
      .replace(/from-amber-950\/[0-9]+/g, 'from-slate-900')
      .replace(/via-yellow-950\/[0-9]+/g, 'via-sky-950/70')
      .replace(/to-slate-950\/[0-9]+/g, 'to-slate-950');

    const parsed = JSON.parse(cleanedRaw);
    if (!parsed.cards || !Array.isArray(parsed.cards) || parsed.cards.length === 0) {
      return DEFAULT_INSTRUCTIONS_CONFIG;
    }
    return parsed;
  } catch {
    return DEFAULT_INSTRUCTIONS_CONFIG;
  }
}

export function saveSiteInstructionsConfig(config: SiteInstructionsConfig, syncRemote: boolean = true): void {
  try {
    config.updatedAt = new Date().toISOString();
    localStorage.setItem(INSTRUCTIONS_STORAGE_KEY, JSON.stringify(config));
    if (syncRemote) {
      syncGlobalQuestionsAndLevels('instructions', config).catch(() => {});
    }
  } catch (e) {
    console.warn('Failed to save instructions config:', e);
  }
}

export function resetSiteInstructionsToDefault(): SiteInstructionsConfig {
  saveSiteInstructionsConfig(DEFAULT_INSTRUCTIONS_CONFIG);
  return DEFAULT_INSTRUCTIONS_CONFIG;
}
