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
  totalMaxScore?: number; // Total max score for level (default 50: 25 Section 1 + 25 Section 2)
  section1Score?: number; // Section 1 points (default 25)
  section2Score?: number; // Section 2 points (default 25)
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
    instructions: '1. تأكد من توافر نظام 64-Bit لتشغيل Adobe Captivate 2019.\n2. افتح ملف التثبيت القياسي وقم بضبط دعم اللغة العربية من قائمة التفضيلات Preferences.\n3. تصفح الفيديوهات والصور التعليمية الخاصة بالمستوى.\n4. أجب عن أنشطة وأسئلة المستوى التفاعلية.\n5. ارفع نشاطك الخاص بأسفل المستوى (فيديو أو صورة أو PDF) ثم اضغط على زر Finish Level 1 للانتقال للمستوى التالي.',
    totalMaxScore: 100,
    section1Score: 25,
    section2Score: 75,
    badgeName: 'وسام البداية الرقمية',
    badgeEmoji: '🛡️',
    videos: [],
    images: [],
    questions: [
      {
        id: 'q1-1',
        question: 'ما هي معمارية نظام التشغيل المطلوبة لتشغيل برنامج Adobe Captivate 2019 بكفاءة قياسية؟',
        options: [
          'معمارية 32-Bit فقط',
          'معمارية 64-Bit حصرياً لدعم المعالجة المتقدمة',
          'معمارية 16-Bit القديمة',
          'لا يشترط معمارية محددة'
        ],
        correctIndex: 1,
        explanation: 'يتطلب Adobe Captivate 2019 معمارية 64-Bit لتوفير استقرار معالجة الوسائط المتعددة والمحاكاة التفاعلية.',
        points: 25,
      },
      {
        id: 'q1-2',
        question: 'عند اكتمال تثبيت البرنامج، ما هو الإجراء الضروري لضمان ظهور النصوص العربية بشكل سليم واتجاه صحيح؟',
        options: [
          'حذف ملفات الخطوط من نظام التشغيل',
          'تفعيل خيار دعم لغات الشرق الأوسط (Middle Eastern Text Support) في التفضيلات',
          'إلغاء تثبيت برنامج Captivate',
          'استخدام اللغة الإنجليزية فقط'
        ],
        correctIndex: 1,
        explanation: 'يتم ضبط تفضيلات Preferences واختيار محرك النصوص لدعم اللغة العربية وتوجيه النص من اليمين إلى اليسار.',
        points: 25,
      },
    ],
  },
  {
    levelNumber: 2,
    moduleId: 'mod-2',
    title: 'المستوى 2: جولة واجهة المستخدم وشاشات البداية',
    shortTitle: 'واجهة المستخدم',
    storyMission: 'استكشف لوحات التحكم ومناطق العمل، وتعرف على شريط الأدوات الرئيسي (Toolbar) ولوحة الخصائص (Properties Panel).',
    instructions: '1. استكشف شريط الأدوات الرئيسي Toolbar ولوحة الخصائص Properties Panel.\n2. تعرف على متصفح الشرائح Filmstrip وطرق ترتيب الشرائح.\n3. شاهد الفيديوهات التوضيحية وتصفح الصور التعليمية.\n4. أجب عن أنشطة وأسئلة المستوى التفاعلية.\n5. ارفع نشاطك الخاص بأسفل الصفحة ثم اضغط Finish Level 2.',
    totalMaxScore: 100,
    section1Score: 25,
    section2Score: 75,
    badgeName: 'وسام الملاح السيبراني',
    badgeEmoji: '🧭',
    videos: [],
    images: [],
    questions: [
      {
        id: 'q2-1',
        question: 'ما هي اللوحة الأساسية التي تستخدم لتعديل أبعاد وموضع وتأثيرات أي كائن يتم تحديده على المسرح؟',
        options: [
          'لوحة الخصائص (Properties Panel)',
          'لوحة الطباعة (Print Panel)',
          'شريط المهام الخاص بنظام التشغيل',
          'لوحة المتصفح الخارجية'
        ],
        correctIndex: 0,
        explanation: 'لوحة الخصائص (Properties) تعرض الخيارات الديناميكية لكل كائن محدد مثل الحجم، التنسيق، التوقيت، وحالات الزر.',
        points: 25,
      },
      {
        id: 'q2-2',
        question: 'ما الوظيفة الأساسية للشاشة الافتتاحية (Welcome Screen) عند تشغيل Adobe Captivate 2019؟',
        options: [
          'إغلاق الجهاز تلقائياً',
          'إتاحة إنشاء مشروعات جديدة (Responsive, Blank, VR) وفتح المشروعات الأخيرة',
          'حذف المشروعات القديمة',
          'تعديل خلفية سطح المكتب'
        ],
        correctIndex: 1,
        explanation: 'توفر الشاشة الافتتاحية خيارات إنشاء مشروع متجاوب أو فارغ أو واقع افتراضي والوصول للقوالب الجاهزة.',
        points: 25,
      },
    ],
  },
  {
    levelNumber: 3,
    moduleId: 'mod-3',
    title: 'المستوى 3: إنشاء المشروعات التعليمية التفاعلية',
    shortTitle: 'إنشاء المشروعات',
    storyMission: 'اختر نوع المشروع المناسب للمتعلم: متجاوب (Responsive)، أو فارغ (Blank)، أو واقع افتراضي (VR Project).',
    instructions: '1. تعرف على أنواع المشروعات: Responsive, Blank, VR Project.\n2. اضبط أبعاد المشروع بالبكسل المناسب وتعرف على تقنية Fluid Boxes.\n3. استعرض الوسائط والصور المرفقة بالمستوى.\n4. حل أسئلة التقويم التفاعلية للمستوى.\n5. ارفع نشاطك الخاص بأسفل المستوى ثم اضغط Finish Level 3.',
    totalMaxScore: 100,
    section1Score: 25,
    section2Score: 75,
    badgeName: 'وسام المعماري الرقمي',
    badgeEmoji: '📐',
    videos: [],
    images: [],
    questions: [
      {
        id: 'q3-1',
        question: 'ما الميزة الحصرية التي يوفرها نمط المشروع المتجاوب (Responsive Project) في Captivate 2019؟',
        options: [
          'ثبات أبعاد المحتوى وعدم تغيره نهائياً',
          'إعادة تنظيم وترتيب العناصر تلقائياً لتناسب شاشات الهواتف والأجهزة اللوحية والكمبيوتر بتقنية Fluid Boxes',
          'تحويل المشروع إلى ملف صوتي فقط',
          'منع ظهور الفيديو'
        ],
        correctIndex: 1,
        explanation: 'المشروع المتجاوب يعتمد على الصناديق المرنة (Fluid Boxes) لضبط المحتوى آلياً مع أحجام ومقاسات الشاشات المختلفة.',
        points: 25,
      },
      {
        id: 'q3-2',
        question: 'لإنشاء بيئة تعلم غامرة بزاوية 360 درجة، أي نوع من المشروعات يجب اختياره من الشاشة الافتتاحية؟',
        options: [
          'مشروع نصي فقط (Text Project)',
          'مشروع الواقع الافتراضي (Virtual Reality Project)',
          'مشروع جدول بيانات',
          'مشروع تسجيل صوتي فقط'
        ],
        correctIndex: 1,
        explanation: 'مشروع VR Project يتيح إدراج صور أو مقاطع فيديو 360 درجة وإضافة نقاط ساخنة تفاعلية (Hotspots).',
        points: 25,
      },
    ],
  },
  {
    levelNumber: 4,
    moduleId: 'mod-4',
    title: 'المستوى 4: إدارة الشرائح والتخطيطات الرئيسية',
    shortTitle: 'إدارة الشرائح',
    storyMission: 'أتقن تنظيم مسارات الشرائح، الشريحة الرئيسية (Master Slide)، وانتقالات العرض الزمني.',
    instructions: '1. أتقن استخدام الشرائح الرئيسية Master Slides لتوحيد التصميم والهوية.\n2. تدرب على تغيير خلفيات الشرائح وتكرارها وحذفها.\n3. تصفح الفيديوهات والصور التوضيحية للمستوى.\n4. أجب عن الأنشطة التفاعلية.\n5. ارفع نشاطك الخاص بأسفل الصفحة واضغط Finish Level 4.',
    totalMaxScore: 100,
    section1Score: 25,
    section2Score: 75,
    badgeName: 'وسام قائد الشرائح',
    badgeEmoji: '🎞️',
    videos: [],
    images: [],
    questions: [
      {
        id: 'q4-1',
        question: 'ما الفائدة الكبرى لاستخدام "الشرائح الرئيسية" (Master Slides) في بناء الموديول التعليمي؟',
        options: [
          'زيادة حجم الملف فقط',
          'توحيد التصميم والهوية والشعارات وأزرار التنقل عبر كافة شرائح المشروع مرة واحدة',
          'منع إضافة نصوص في الشرائح',
          'حذف الشرائح الفرعية'
        ],
        correctIndex: 1,
        explanation: 'الشرائح الرئيسية تطبق عناصر التصميم الموحدة (خلفيات، أزرار، ترويسات) على كافة الشرائح التابعة لتوفير الوقت.',
        points: 25,
      },
      {
        id: 'q4-2',
        question: 'عند الرغبة في تكرار شريحة كاملة بجميع محتوياتها وكائناتها، نستخدم الأمر:',
        options: [
          'Duplicate Slide',
          'Delete Slide',
          'Hide Slide',
          'Lock Slide'
        ],
        correctIndex: 0,
        explanation: 'أمر تكرار الشريحة (Duplicate) ينشئ نسخة مطابقة تماماً للشريحة المحددة بكافة كائناتها ومساراتها.',
        points: 25,
      },
    ],
  },
  {
    levelNumber: 5,
    moduleId: 'mod-5',
    title: 'المستوى 5: إدراج الوسائط الرقمية (نصوص، أصوات، صور، فيديو)',
    shortTitle: 'إدراج الوسائط',
    storyMission: 'ادمج عناصر الوسائط المتعددة بانسجام: النصوص التوضيحية، المقاطع الصوتية، وتزامن الفيديو.',
    instructions: '1. تعلم ضبط التوقيت بالخط الزمني Timeline لظهور الوسائط المتعددة بدقة.\n2. اختر صيغ الفيديو والصوت المتوافقة مثل MP4 و WAV/MP3.\n3. شاهد الفيديوهات والصور المرفقة واستفد من الشرح.\n4. أجب عن أسئلة المستوى التفاعلية.\n5. ارفع نشاطك الخاص واضغط Finish Level 5.',
    totalMaxScore: 100,
    section1Score: 25,
    section2Score: 75,
    badgeName: 'وسام مهندس الوسائط المتعددة',
    badgeEmoji: '🎬',
    videos: [],
    images: [],
    questions: [
      {
        id: 'q5-1',
        question: 'ما اللوحة المسؤولة عن ضبط توقيت ظهور واختفاء عناصر الصوت والصورة على الشريحة بدقة الأجزاء من الثانية؟',
        options: [
          'لوحة الخط الزمني (Timeline)',
          'لوحة الألوان (Swatches)',
          'لوحة المساعدة (Help)',
          'لوحة الخطوط (Fonts)'
        ],
        correctIndex: 0,
        explanation: 'الخط الزمني (Timeline) يحدد موضع بداية ونهاية ظهور كل كائن ومدة بقائه وتزامنه مع الصوت.',
        points: 25,
      },
      {
        id: 'q5-2',
        question: 'ما هي الصيغة الأكثر توافقاً والأمثل لإدراج مقاطع الفيديو في Captivate 2019 لتعمل بسلاسة على كافة المتصفحات؟',
        options: [
          'صيغة MP4 بترميز H.264',
          'صيغة AVI غير المضغوطة الكبيرة جداً',
          'ملف TXT نصي',
          'صيغة BMP للصور'
        ],
        correctIndex: 0,
        explanation: 'صيغة MP4/H.264 هي المعيار العالمي لمشروعات الويب وHTML5 وتوفر أعلى جودة مع أقل حجم ملف.',
        points: 25,
      },
    ],
  },
  {
    levelNumber: 6,
    moduleId: 'mod-6',
    title: 'المستوى 6: الكائنات التفاعلية والأزرار ومشغلات الأحداث',
    shortTitle: 'الكائنات التفاعلية',
    storyMission: 'ابنِ مسارات التعلم التفاعلية باستخدام الأزرار الذكية، صناديق النقر (Click Boxes)، ومناطق الإفلات.',
    instructions: '1. تدرب على إضافة الكائنات التفاعلية وصناديق النقر Click Boxes.\n2. اضبط حالات الأزرار التفاعلية الثلاث (Normal, RollOver, Down).\n3. حدد إجراءات الانتقال Jump to Slide.\n4. أجب عن أسئلة المستوى.\n5. ارفع نشاطك الخاص واضغط Finish Level 6.',
    totalMaxScore: 100,
    section1Score: 25,
    section2Score: 75,
    badgeName: 'وسام خبير التفاعل',
    badgeEmoji: '⚡',
    videos: [],
    images: [],
    questions: [
      {
        id: 'q6-1',
        question: 'ما هو الكائن غير المرئي المستخدم لتحويل أي منطقة معينة في الشريحة إلى منطقة حساسة للنقر؟',
        options: [
          'صندوق النقر (Click Box)',
          'مربع النص الثابت',
          'خط الترويسة',
          'إطار الشريحة'
        ],
        correctIndex: 0,
        explanation: 'صندوق النقر Click Box كائن شفاف يُوضع فوق أي عنصر ليصبح قابلاً للنقر ويطلق إجراءات التنقل.',
        points: 25,
      },
      {
        id: 'q6-2',
        question: 'ما الإجراء (Action) الذي يجعل المتعلم يقفز مباشرة إلى شريحة اختبار أو محاكاة محددة برقمها؟',
        options: [
          'إجراء Jump to Slide',
          'إجراء Exit Project',
          'إجراء Mute Audio',
          'إجراء Close Window'
        ],
        correctIndex: 0,
        explanation: 'أمر Jump to Slide يتيح التفرع التعليمي والانتقال إلى أي شريحة محددة بناءً على اختيار المتعلم.',
        points: 25,
      },
    ],
  },
  {
    levelNumber: 7,
    moduleId: 'mod-7',
    title: 'المستوى 7: بنوك الأسئلة وبناء الاختبارات التفاعلية',
    shortTitle: 'الاختبارات التفاعلية',
    storyMission: 'صمم أدوات التقويم الإلكتروني: أسئلة الاختيار من متعدد، الصواب والخطأ، وبنوك الأسئلة العشوائية.',
    instructions: '1. تعرف على بناء بنوك الأسئلة Question Pools وتوليد نماذج متكافئة.\n2. اضبط شريحة النتائج Quiz Results Slide ونسبة الاجتياز.\n3. تعرف على فرق التغذية الراجعة الفورية والمرجأة.\n4. أجب عن أسئلة المستوى التفاعلية.\n5. ارفع نشاطك الخاص واضغط Finish Level 7.',
    totalMaxScore: 100,
    section1Score: 25,
    section2Score: 75,
    badgeName: 'وسام خبير القياس والتقويم',
    badgeEmoji: '🏆',
    videos: [],
    images: [],
    questions: [
      {
        id: 'q7-1',
        question: 'عند إنشاء اختبار تفاعلي، ما الغرض الأساسي من استخدام "بنوك الأسئلة" (Question Pools)؟',
        options: [
          'عرض نفس الترتيب دائماً دون تغيير',
          'توليد أسئلة عشوائية لكل طالب لتقليل الغش وضمان عدالة وموثوقية التقييم',
          'منع تصحيح الإجابات',
          'إلغاء احتساب الدرجات'
        ],
        correctIndex: 1,
        explanation: 'بنوك الأسئلة تسحب عدداً محدداً من الأسئلة عشوائياً لكل متعلم، مما يخلق نماذج اختبارية متكافئة ومتنوعة.',
        points: 25,
      },
      {
        id: 'q7-2',
        question: 'ما هي الشريحة التلقائية التي تظهر في نهاية الاختبار لعرض نتيجة الطالب ونسبة إتقانه وحالة النجاح والرسوب؟',
        options: [
          'شريحة النتائج (Quiz Results Slide)',
          'الشريحة الافتتاحية',
          'شريحة الخط الزمني',
          'شريحة إعدادات الميكروفون'
        ],
        correctIndex: 0,
        explanation: 'شريحة النتائج Quiz Results تعرض مجموع النقاط المحققة والنسبة المئوية وحد النجاح وزر المراجعة.',
        points: 25,
      },
    ],
  },
  {
    levelNumber: 8,
    moduleId: 'mod-8',
    title: 'المستوى 8: تسجيل الشاشة والمحاكاة التفاعلية البرمجية',
    shortTitle: 'المحاكاة التفاعلية',
    storyMission: 'سجل تطبيقات الحاسب بالأنماط الثلاثة: العرض التوضيحي (Demo)، التدريب (Training)، والتقييم (Assessment).',
    instructions: '1. تدرب على تسجيل الشاشة بالأنماط الثلاثة: Demo, Training, Assessment.\n2. أتقن نمط التدريب لتقديم التلميحات ونمط التقييم لاختبار المهارة.\n3. تصفح الفيديوهات والصور المرفقة بالمستوى.\n4. أجب عن أسئلة المستوى.\n5. ارفع نشاطك الخاص واضغط Finish Level 8.',
    totalMaxScore: 100,
    section1Score: 25,
    section2Score: 75,
    badgeName: 'وسام سيد المحاكاة',
    badgeEmoji: '🖥️',
    videos: [],
    images: [],
    questions: [
      {
        id: 'q8-1',
        question: 'أي نمط محاكاة يوجه المتعلم خطوة بخطوة مع عرض تلميحات فورية وأدلة مساعدة عند ارتكاب خطأ؟',
        options: [
          'نمط التدريب (Training Mode)',
          'نمط العرض التوضيحي السلبي (Demo Mode)',
          'نمط إيقاف التشغيل',
          'نمط مسح الشاشة'
        ],
        correctIndex: 0,
        explanation: 'نمط التدريب Training يسمح للمتعلم بالتطبيق العملي مع ظهور رسائل توجيهية وتلميحات إذا تعثر في النقر.',
        points: 25,
      },
      {
        id: 'q8-2',
        question: 'في نمط التقييم (Assessment Mode)، كيف يتعامل البرنامج مع نقرات المتعلم؟',
        options: [
          'يحل عنه الأسئلة تلقائياً',
          'يختبر مهارة المتعلم بدون تلميحات مساعدة ويحسب درجات على النقر الصحيح والخطأ',
          'يغلق البرنامج',
          'يعرض فيديو ترفيهي'
        ],
        correctIndex: 1,
        explanation: 'نمط التقييم يقيس الإتقان الفعلي؛ فلا تظهر مساعدة أثناء النقر، وتُسجل النقاط بناءً على دقة الأداء.',
        points: 25,
      },
    ],
  },
  {
    levelNumber: 9,
    moduleId: 'mod-9',
    title: 'المستوى 9: استيراد PowerPoint ونشر وتصدير المشروعات (HTML5 / SCORM)',
    shortTitle: 'أنشطة وتطبيقات المستوى 9',
    storyMission: 'حول العروض التقديمية الساكنة إلى تجارب تعلم نشطة تفاعلية، وانشر المشروع بصيغة HTML5 المتوافقة مع نظم LMS ومعايير SCORM.',
    instructions: '1. استيراد ملفات العروض التقديمية PowerPoint وربطها ديناميكياً داخل Adobe Captivate.\n2. تحويل الشرائح الساكنة إلى عناصر تعليمية نشطة وتفاعلية.\n3. ضبط إعدادات التصدير ومعايير حزم التعلم الإلكتروني SCORM و xAPI لتتبع الدرجات في منصات LMS.\n4. نشر وتصدير المشروع النهائي بصيغة HTML5 المتوافقة مع كافة المتصفحات والأجهزة الذكية.\n5. تنفيذ ورفع النشاط التطبيقي العملي الخاص بالمستوى بنجاح.',
    totalMaxScore: 100,
    section1Score: 25,
    section2Score: 75,
    badgeName: 'وسام تاج التميز الرقمي المطلق',
    badgeEmoji: '👑',
    videos: [],
    images: [],
    questions: [
      {
        id: 'q9-1',
        question: 'عند قيامك باستيراد ملف عرض تقديمي (PowerPoint) إلى Adobe Captivate، ما هو الإجراء العملي الأفضل لضمان مزامنة أي تعديل يطرأ على ملف العرض الأصلي مستقبلاً؟',
        options: [
          'تفعيل خيار الربط الديناميكي (Link) لمزامنة التعديلات تلقائياً',
          'طباعة الشرائح يدوياً على ورق وإعادة مسحها ضوئياً',
          'حذف ملف البوربوينت الأصلي من جهاز الكمبيوتر',
          'تغيير امتداد العرض إلى ملف مفكرة نصي TXT'
        ],
        correctIndex: 0,
        explanation: 'خيار Link يتيح لك تعديل شرائح البوربوينت مستقبلاً وتحديثها تلقائياً داخل مشروع Captivate بضغطة زر.',
        points: 25,
      },
      {
        id: 'q9-2',
        question: 'أثناء إعدادك لنشر وتصدير المشروع التعليمي، ما هي المعايير القياسية العالمية التي تضبطها لتمكين نظام إدارة التعلم LMS من تتبع درجاتك ونسبة إنجازك؟',
        options: [
          'معايير حزم التعلم الإلكتروني SCORM (1.2 / 2004) و xAPI',
          'معايير وتنسيقات مستندات Word القياسية',
          'معايير الطباعة الورقية والكتب المصورة',
          'تنسيق ملفات الأقراص المدمجة القديمة ISO'
        ],
        correctIndex: 0,
        explanation: 'معايير SCORM/xAPI هي البروتوكول المعتمد عالمياً لتبادل بيانات إنجاز الطالب والدرجات بين المحتوى والمنصة.',
        points: 25,
      },
    ],
  },
];

export const DEFAULT_GAME_LEVELS_DATA: GameLevelDef[] = JSON.parse(JSON.stringify(GAME_LEVELS_DATA));

export const GAME_LEVELS_STORAGE_KEY = 'cp_game_levels_custom_v3';

export function getCustomGameLevels(): GameLevelDef[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return GAME_LEVELS_DATA;
    }
    const raw = localStorage.getItem(GAME_LEVELS_STORAGE_KEY);
    if (!raw) {
      return GAME_LEVELS_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Sync into memory array
      parsed.forEach((customLvl: GameLevelDef) => {
        const found = GAME_LEVELS_DATA.find((l) => l.levelNumber === customLvl.levelNumber);
        if (found) {
          found.title = customLvl.title || found.title;
          found.shortTitle = customLvl.shortTitle || found.shortTitle;
          found.storyMission = customLvl.storyMission || found.storyMission;
          found.instructions = customLvl.instructions || found.instructions;
          found.objectives = customLvl.objectives || found.objectives;
          found.activityPrompt = customLvl.activityPrompt !== undefined ? customLvl.activityPrompt : found.activityPrompt;
          found.totalMaxScore = customLvl.totalMaxScore !== undefined ? customLvl.totalMaxScore : found.totalMaxScore;
          found.section1Score = customLvl.section1Score !== undefined ? customLvl.section1Score : found.section1Score;
          found.section2Score = customLvl.section2Score !== undefined ? customLvl.section2Score : found.section2Score;
          found.imagesSectionTitle = customLvl.imagesSectionTitle !== undefined ? customLvl.imagesSectionTitle : found.imagesSectionTitle;
          found.imagesSectionDesc = customLvl.imagesSectionDesc !== undefined ? customLvl.imagesSectionDesc : found.imagesSectionDesc;
          found.videos = customLvl.videos || [];
          found.images = customLvl.images || [];
          found.questions = customLvl.questions || found.questions;
        }
      });
      return GAME_LEVELS_DATA;
    }
    return GAME_LEVELS_DATA;
  } catch {
    return GAME_LEVELS_DATA;
  }
}

export function saveCustomGameLevels(levels: GameLevelDef[], syncRemote: boolean = true): void {
  try {
    localStorage.setItem(GAME_LEVELS_STORAGE_KEY, JSON.stringify(levels));
  } catch (err: unknown) {
    console.error('Failed to save custom game levels:', err);
    if (
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' ||
        err.code === 22 ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      throw new Error('حجم الملف كبير جداً وتجاوز السعة المسموحة لذاكرة المتصفح (5 ميجابايت). يرجى ضغط الفيديو أو اختيار ملف أصغر حجماً.');
    }
    throw new Error('فشل حفظ البيانات في التخزين المحلي.');
  }

  try {
    levels.forEach((customLvl: GameLevelDef) => {
      const found = GAME_LEVELS_DATA.find((l) => l.levelNumber === customLvl.levelNumber);
      if (found) {
        found.title = customLvl.title || found.title;
        found.shortTitle = customLvl.shortTitle || found.shortTitle;
        found.storyMission = customLvl.storyMission || found.storyMission;
        found.instructions = customLvl.instructions || found.instructions;
        found.objectives = customLvl.objectives || found.objectives;
        found.activityPrompt = customLvl.activityPrompt !== undefined ? customLvl.activityPrompt : found.activityPrompt;
        found.totalMaxScore = customLvl.totalMaxScore !== undefined ? customLvl.totalMaxScore : found.totalMaxScore;
        found.section1Score = customLvl.section1Score !== undefined ? customLvl.section1Score : found.section1Score;
        found.section2Score = customLvl.section2Score !== undefined ? customLvl.section2Score : found.section2Score;
        found.imagesSectionTitle = customLvl.imagesSectionTitle !== undefined ? customLvl.imagesSectionTitle : found.imagesSectionTitle;
        found.imagesSectionDesc = customLvl.imagesSectionDesc !== undefined ? customLvl.imagesSectionDesc : found.imagesSectionDesc;
        found.videos = customLvl.videos || [];
        found.images = customLvl.images || [];
        found.questions = customLvl.questions !== undefined ? customLvl.questions : found.questions;
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('game-levels-updated', { detail: levels }));
    }
    if (syncRemote) {
      syncGlobalQuestionsAndLevels('levels', levels).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to sync game levels:', err);
  }
}

export function updateGameLevelDetails(
  levelNumber: number,
  updates: Partial<GameLevelDef>
): GameLevelDef[] {
  const levels = getCustomGameLevels();
  const target = levels.find((l) => l.levelNumber === levelNumber);
  if (target) {
    Object.assign(target, updates);
    saveCustomGameLevels(levels, true);
  }
  return levels;
}

export function addMediaToLevel(
  levelNumber: number,
  media: LevelMediaItem
): GameLevelDef[] {
  const levels = getCustomGameLevels();
  const target = levels.find((l) => l.levelNumber === levelNumber);
  if (!target) return levels;

  if (media.type === 'video') {
    if (!target.videos) target.videos = [];
    if (target.videos.length >= 5) {
      throw new Error('الحد الأقصى للفيديوهات في كل مستوى هو 5 فيديوهات');
    }
    target.videos.push(media);
  } else {
    // image or pdf
    if (!target.images) target.images = [];
    if (target.images.length >= 5) {
      throw new Error('الحد الأقصى للصور والملفات في كل مستوى هو 5 ملفات');
    }
    target.images.push(media);
  }

  saveCustomGameLevels(levels, true);
  return levels;
}

export function removeMediaFromLevel(
  levelNumber: number,
  mediaId: string
): GameLevelDef[] {
  const levels = getCustomGameLevels();
  const target = levels.find((l) => l.levelNumber === levelNumber);
  if (!target) return levels;

  if (target.videos) {
    target.videos = target.videos.filter((v) => v.id !== mediaId);
  }
  if (target.images) {
    target.images = target.images.filter((img) => img.id !== mediaId);
  }

  saveCustomGameLevels(levels, true);
  return levels;
}

export function replaceMediaInLevel(
  levelNumber: number,
  mediaId: string,
  updated: LevelMediaItem
): GameLevelDef[] {
  const levels = getCustomGameLevels();
  const target = levels.find((l) => l.levelNumber === levelNumber);
  if (!target) return levels;

  if (target.videos) {
    const idx = target.videos.findIndex((v) => v.id === mediaId);
    if (idx !== -1) {
      target.videos[idx] = updated;
    }
  }
  if (target.images) {
    const idx = target.images.findIndex((img) => img.id === mediaId);
    if (idx !== -1) {
      target.images[idx] = updated;
    }
  }

  saveCustomGameLevels(levels, true);
  return levels;
}

export function updateQuestionInLevel(
  levelNumber: number,
  questionId: string,
  updates: Partial<LevelQuestion>
): GameLevelDef[] {
  const levels = getCustomGameLevels();
  const target = levels.find((l) => l.levelNumber === levelNumber);
  if (!target) return levels;

  const qIdx = target.questions.findIndex((q) => q.id === questionId);
  if (qIdx !== -1) {
    target.questions[qIdx] = { ...target.questions[qIdx], ...updates };
    saveCustomGameLevels(levels, true);
  }
  return levels;
}

export function addQuestionToLevel(
  levelNumber: number,
  question: LevelQuestion
): GameLevelDef[] {
  const levels = getCustomGameLevels();
  const target = levels.find((l) => l.levelNumber === levelNumber);
  if (!target) return levels;

  target.questions.push(question);
  saveCustomGameLevels(levels, true);
  return levels;
}

export function deleteQuestionFromLevel(
  levelNumber: number,
  questionId: string
): GameLevelDef[] {
  const levels = getCustomGameLevels();
  const target = levels.find((l) => l.levelNumber === levelNumber);
  if (!target) return levels;

  target.questions = target.questions.filter((q) => q.id !== questionId);
  saveCustomGameLevels(levels, true);
  return levels;
}

export function updateMediaItemInLevel(
  levelNumber: number,
  mediaId: string,
  partial: Partial<LevelMediaItem>
): GameLevelDef[] {
  const levels = getCustomGameLevels();
  const target = levels.find((l) => l.levelNumber === levelNumber);
  if (!target) return levels;

  if (target.videos) {
    const idx = target.videos.findIndex((v) => v.id === mediaId);
    if (idx !== -1) {
      target.videos[idx] = { ...target.videos[idx], ...partial };
    }
  }
  if (target.images) {
    const idx = target.images.findIndex((img) => img.id === mediaId);
    if (idx !== -1) {
      target.images[idx] = { ...target.images[idx], ...partial };
    }
  }

  saveCustomGameLevels(levels, true);
  return levels;
}

export function resetGameLevelsToDefault(): GameLevelDef[] {
  try {
    localStorage.removeItem(GAME_LEVELS_STORAGE_KEY);
    DEFAULT_GAME_LEVELS_DATA.forEach((defLvl) => {
      const found = GAME_LEVELS_DATA.find((l) => l.levelNumber === defLvl.levelNumber);
      if (found) {
        found.title = defLvl.title;
        found.shortTitle = defLvl.shortTitle;
        found.storyMission = defLvl.storyMission;
        found.instructions = defLvl.instructions;
        found.videos = [];
        found.images = [];
        found.questions = JSON.parse(JSON.stringify(defLvl.questions));
      }
    });
    const defaultCopy = JSON.parse(JSON.stringify(DEFAULT_GAME_LEVELS_DATA));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('game-levels-updated', { detail: defaultCopy }));
    }
    syncGlobalQuestionsAndLevels('levels', defaultCopy).catch(() => {});
    return defaultCopy;
  } catch {
    return GAME_LEVELS_DATA;
  }
}

// Initial auto-sync from localStorage if present
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    getCustomGameLevels();
  } catch {}
}
