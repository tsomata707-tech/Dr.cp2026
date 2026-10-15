import { CartoonAvatar, LevelQuestion } from '../types';
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
  badgeName: string;
  badgeEmoji: string;
  questions: LevelQuestion[];
}

export const GAME_LEVELS_DATA: GameLevelDef[] = [
  {
    levelNumber: 1,
    moduleId: 'mod-1',
    title: 'المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019',
    shortTitle: 'تثبيت البرنامج',
    storyMission: 'مهمتك الأولى يا بطل: تهيئة بيئة العمل الرقمية، التحقق من معمارية 64-Bit، وتشغيل معالج التثبيت القياسي للبرنامج بنجاح.',
    badgeName: 'وسام البداية الرقمية',
    badgeEmoji: '🛡️',
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
        points: 34,
      },
      {
        id: 'q1-2',
        question: 'تتكون منظومة "الوسائط المتعددة" (Multimedia) التفاعلية في جوهرها من دمج:',
        options: [
          'النصوص فقط دون أي عنصر آخر',
          'الصوت والفيديو فقط دون تفاعل المستخدم',
          'النص، الصوت، الصورة، الفيديو، وعناصر التحكم التفاعلي',
          'ملفات الطباعة الورقية الثابتة'
        ],
        correctIndex: 2,
        explanation: 'الوسائط المتعددة التفاعلية هي منظومة رقمية تدمج النص المكتوب والمسموع والصور الثابتة والمتحركة والفيديو تحت تحكم المتعلم.',
        points: 33,
      },
      {
        id: 'q1-3',
        question: 'عند اكتمال تثبيت البرنامج، ما هو الإجراء الضروري لضمان ظهور النصوص العربية بشكل سليم واتجاه صحيح؟',
        options: [
          'حذف ملفات الخطوط من نظام التشغيل',
          'تفعيل خيار دعم لغات الشرق الأوسط (Middle Eastern Text Support) في التفضيلات',
          'إلغاء تثبيت برنامج Captivate',
          'استخدام اللغة الإنجليزية فقط'
        ],
        correctIndex: 1,
        explanation: 'يتم ضبط تفضيلات Preferences واختيار محرك النصوص لدعم اللغة العربية وتوجيه النص من اليمين إلى اليسار.',
        points: 33,
      },
    ],
  },
  {
    levelNumber: 2,
    moduleId: 'mod-2',
    title: 'المستوى 2: جولة واجهة المستخدم وشاشات البداية',
    shortTitle: 'واجهة المستخدم',
    storyMission: 'استكشف لوحات التحكم ومناطق العمل، وتعرف على شريط الأدوات الرئيسي (Toolbar) ولوحة الخصائص (Properties Panel).',
    badgeName: 'وسام الملاح السيبراني',
    badgeEmoji: '🧭',
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
        points: 34,
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
        points: 33,
      },
      {
        id: 'q2-3',
        question: 'أين تظهر معاينة شرائح المشروع بترتيبها التسلسلي على يسار واجهة البرنامج؟',
        options: [
          'في شريط المسرح الرئيسي',
          'في لوحة متصفح الشرائح (Filmstrip)',
          'في لوحة المكتبة (Library)',
          'في سلة المهملات'
        ],
        correctIndex: 1,
        explanation: 'لوحة شريط الشرائح (Filmstrip) تعرض مصغرات الشرائح بالترتيب وتسمح بإعادة ترتيبها وتكرارها وحذفها.',
        points: 33,
      },
    ],
  },
  {
    levelNumber: 3,
    moduleId: 'mod-3',
    title: 'المستوى 3: إنشاء المشروعات التعليمية التفاعلية',
    shortTitle: 'إنشاء المشروعات',
    storyMission: 'اختر نوع المشروع المناسب للمتعلم: متجاوب (Responsive)، أو فارغ (Blank)، أو واقع افتراضي (VR Project).',
    badgeName: 'وسام المعماري الرقمي',
    badgeEmoji: '📐',
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
        points: 34,
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
        points: 33,
      },
      {
        id: 'q3-3',
        question: 'ما هي وحدة قياس أبعاد المسرح الافتراضية عند تحديد مقاس مشروع فارغ (Blank Project)؟',
        options: [
          'السنتيمتر (cm)',
          'البوصة (inch)',
          'البكسل (Pixels)',
          'المتر (Meter)'
        ],
        correctIndex: 2,
        explanation: 'تُقاس أبعاد شاشات ومشروعات التعلم الإلكتروني الرقمية بوحدة البكسل (مثل 1024×768 أو 1920×1080).',
        points: 33,
      },
    ],
  },
  {
    levelNumber: 4,
    moduleId: 'mod-4',
    title: 'المستوى 4: إدارة الشرائح والتخطيطات الرئيسية',
    shortTitle: 'إدارة الشرائح',
    storyMission: 'أتقن تنظيم مسارات الشرائح، الشريحة الرئيسية (Master Slide)، وانتقالات العرض الزمني.',
    badgeName: 'وسام قائد الشرائح',
    badgeEmoji: '🎞️',
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
        points: 34,
      },
      {
        id: 'q4-2',
        question: 'كيف يمكن تغيير لون خلفية شريحة محددة في المسرح؟',
        options: [
          'من خلال لوحة الخصائص (Properties) واختيار Background ثم تعيين اللون المطلوب',
          'بإعادة تشغيل الكمبيوتر',
          'بالضغط على زر مسافة من لوحة المفاتيح',
          'لا يمكن تغيير الخلفية في البرنامج'
        ],
        correctIndex: 0,
        explanation: 'من لوحة خصائص الشريحة يتم تحديد نوع الخلفية (لون مصمت، تدريج لوني، أو صورة مخصصة).',
        points: 33,
      },
      {
        id: 'q4-3',
        question: 'عند الرغبة في تكرار شريحة كاملة بجميع محتوياتها وكائناتها، نستخدم الأمر:',
        options: [
          'Duplicate Slide',
          'Delete Slide',
          'Hide Slide',
          'Lock Slide'
        ],
        correctIndex: 0,
        explanation: 'أمر تكرار الشريحة (Duplicate) ينشئ نسخة مطابقة تماماً للشريحة المحددة بكافة كائناتها ومساراتها.',
        points: 33,
      },
    ],
  },
  {
    levelNumber: 5,
    moduleId: 'mod-5',
    title: 'المستوى 5: إدراج الوسائط الرقمية (نصوص، أصوات، صور، فيديو)',
    shortTitle: 'إدراج الوسائط',
    storyMission: 'ادمج عناصر الوسائط المتعددة بانسجام: النصوص التوضيحية، المقاطع الصوتية، وتزامن الفيديو.',
    badgeName: 'وسام مهندس الوسائط المتعددة',
    badgeEmoji: '🎬',
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
        points: 34,
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
        points: 33,
      },
      {
        id: 'q5-3',
        question: 'عند تسجيل تعليق صوتي مصاحب للشريحة (Audio Narration)، أين يتم تخزين الملف الصوتي تلقائياً داخل المشروع؟',
        options: [
          'في لوحة المكتبة (Library) ضمن مجلد Audio',
          'في ذاكرة الشاشة الخارجية',
          'في ملف نصي خارجي',
          'يتم حذفه فوراً'
        ],
        correctIndex: 0,
        explanation: 'مكتبة المشروع (Library) تحتفظ بجميع الوسائط المضافة (أصوات، صور، فيديو) لاستخدامها وتكرارها بسهولة.',
        points: 33,
      },
    ],
  },
  {
    levelNumber: 6,
    moduleId: 'mod-6',
    title: 'المستوى 6: الكائنات التفاعلية والأزرار ومشغلات الأحداث',
    shortTitle: 'الكائنات التفاعلية',
    storyMission: 'ابنِ مسارات التعلم التفاعلية باستخدام الأزرار الذكية، صناديق النقر (Click Boxes)، ومناطق الإفلات.',
    badgeName: 'وسام خبير التفاعل',
    badgeEmoji: '⚡',
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
        points: 34,
      },
      {
        id: 'q6-2',
        question: 'ما هي الحالات الثلاث (States) التفاعلية الافتراضية لكل زر يتم إنشاؤه في Captivate 2019؟',
        options: [
          'العادية (Normal) - التحويم (RollOver) - الضغط (Down)',
          'مفتوح - مغلق - مؤجل',
          'أحمر - أخضر - أزرق',
          'صامت - ناطق - مترجم'
        ],
        correctIndex: 0,
        explanation: 'أزرار البرنامج تدعم الحالات التفاعلية التلقائية لإعطاء تغذية مرئية للمتعلم عند تمرير الفأرة والنقر.',
        points: 33,
      },
      {
        id: 'q6-3',
        question: 'ما الإجراء (Action) الذي يجعل المتعلم يقفز مباشرة إلى شريحة اختبار أو محاكاة محددة برقمها؟',
        options: [
          'إجراء Jump to Slide',
          'إجراء Exit Project',
          'إجراء Mute Audio',
          'إجراء Close Window'
        ],
        correctIndex: 0,
        explanation: 'أمر Jump to Slide يتيح التفرع التعليمي والانتقال إلى أي شريحة محددة بناءً على اختيار المتعلم.',
        points: 33,
      },
    ],
  },
  {
    levelNumber: 7,
    moduleId: 'mod-7',
    title: 'المستوى 7: بنوك الأسئلة وبناء الاختبارات التفاعلية',
    shortTitle: 'الاختبارات التفاعلية',
    storyMission: 'صمم أدوات التقويم الإلكتروني: أسئلة الاختيار من متعدد، الصواب والخطأ، وبنوك الأسئلة العشوائية.',
    badgeName: 'وسام خبير القياس والتقويم',
    badgeEmoji: '🏆',
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
        points: 34,
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
        points: 33,
      },
      {
        id: 'q7-3',
        question: 'في المجموعات التي تعتمد "التغذية الراجعة الفورية"، متى يرى المتعلم إشعار صحة إجابته والتصويب؟',
        options: [
          'بعد انتهاء الفصل الدراسي كاملاً',
          'مباشرة فور النقر على زر Submit الخاص بالسؤال',
          'بعد إغلاق المتصفح',
          'لا تظهر له إطلاقاً'
        ],
        correctIndex: 1,
        explanation: 'التغذية الفورية تقدم التعزيز أو التصحيح لحظياً فور استجابة المتعلم لترسيخ المفهوم الصحيح في الذاكرة.',
        points: 33,
      },
    ],
  },
  {
    levelNumber: 8,
    moduleId: 'mod-8',
    title: 'المستوى 8: تسجيل الشاشة والمحاكاة التفاعلية البرمجية',
    shortTitle: 'المحاكاة التفاعلية',
    storyMission: 'سجل تطبيقات الحاسب بالأنماط الثلاثة: العرض التوضيحي (Demo)، التدريب (Training)، والتقييم (Assessment).',
    badgeName: 'وسام سيد المحاكاة',
    badgeEmoji: '🖥️',
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
        points: 34,
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
        points: 33,
      },
      {
        id: 'q8-3',
        question: 'ما الميزة التي يقدمها مسجل الشاشة الذكي في Captivate عند التقاط نقرات الفأرة؟',
        options: [
          'إنشاء صناديق نصية توضيحية وحركات مؤشر الفأرة تلقائياً لكل نقرة',
          'حذف البرنامج من الجهاز',
          'تشويش الشاشة',
          'منع حفظ التسجيل'
        ],
        correctIndex: 0,
        explanation: 'البرنامج يولد تلقائياً كائنات النص التوضيحي ومؤشر الفأرة ومربعات النقر لكل شاشة تم النقر عليها.',
        points: 33,
      },
    ],
  },
  {
    levelNumber: 9,
    moduleId: 'mod-9',
    title: 'المستوى 9: استيراد عروض PowerPoint وتطويرها تفاعلياً',
    shortTitle: 'استيراد البوربوينت',
    storyMission: 'حول العروض التقديمية الساكنة إلى تجارب تعلم نشطة، تفاعلية، ومدعومة بالتقويم والوسائط.',
    badgeName: 'وسام محول المحتوى النشط',
    badgeEmoji: '📊',
    questions: [
      {
        id: 'q9-1',
        question: 'عند استيراد ملف PowerPoint (PPTX) إلى Captivate 2019، ما الخيار الأفضل للحفاظ على الارتباط والتعديل المستمر؟',
        options: [
          'تفعيل خيار الربط الديناميكي (Link) لمزامنة أي تعديل في ملف العرض الأصلي',
          'تحويل الملف إلى صورة ورقية وطباعتها',
          'حذف ملف البوربوينت نهائياً',
          'تغيير امتداد الملف إلى ملف نصي'
        ],
        correctIndex: 0,
        explanation: 'خيار Link يتيح لك تعديل شرائح البوربوينت مستقبلاً وتحديثها تلقائياً داخل مشروع Captivate بضغطة زر.',
        points: 34,
      },
      {
        id: 'q9-2',
        question: 'ما القيمة المضافة لتحويل عرض تقديمي عادي إلى مشروع في Adobe Captivate 2019؟',
        options: [
          'إمكانية إضافة أسئلة اختبار تفاعلية، تفرع معرفي، ومحاكاة برمجية، وتصدير متوافق مع معايير SCORM',
          'تقليل جودة الشرائح',
          'منع الطلاب من مشاهدة العرض',
          'جعل الشرائح غير قابلة للنقر'
        ],
        correctIndex: 0,
        explanation: 'التحويل يمنح المحتوى صفة التفاعلية الذاتية ويدمجه مع نظم إدارة التعلم ومنصات التقييم الإلكتروني.',
        points: 33,
      },
      {
        id: 'q9-3',
        question: 'هل يمكن إضافة عناصر كائنات تفاعلية إضافية (مثل أزرار ذكية أو فيديو تفاعلي) فوق شرائح البوربوينت المستوردة؟',
        options: [
          'نعم، يمكن إدراج وتراكب كافة كائنات وأدوات Captivate فوق الشرائح المستوردة بكل سهولة',
          'لا، يتم تجميد الشريحة كلياً',
          'فقط النصوص دون الصور',
          'يتطلب حذف الشريحة أولاً'
        ],
        correctIndex: 0,
        explanation: 'شرائح البوربوينت تصبح شريحة كابتيفايت متكاملة تدعم إضافة الأصوات، الكائنات التفاعلية، والاختبارات.',
        points: 33,
      },
    ],
  },
  {
    levelNumber: 10,
    moduleId: 'mod-10',
    title: 'المستوى 10: نشر وتصدير المشروعات (HTML5 / SCORM / LMS)',
    shortTitle: 'نشر وتصدير المشروعات',
    storyMission: 'المستوى الختامي الأسطوري: تصدير المشروع بصيغة HTML5 المتوافقة مع منصات التعلم الإلكتروني ومعايير SCORM.',
    badgeName: 'وسام تاج التميز الرقمي المطلق',
    badgeEmoji: '👑',
    questions: [
      {
        id: 'q10-1',
        question: 'ما هي معايير حزم التعلم الإلكتروني القياسية التي تسمح بتتبع درجات وتقدم الطالب ونقلها لنظام LMS (مثل Moodle أو Blackboard)؟',
        options: [
          'معايير SCORM (1.2 أو 2004) و xAPI',
          'معايير ملفات الوورد DOCX',
          'معايير طباعة الورق العادي',
          'معايير الأقراص المرنة'
        ],
        correctIndex: 0,
        explanation: 'معايير SCORM/xAPI هي البروتوكول المعتمد عالمياً لتبادل بيانات إنجاز الطالب والدرجات بين المحتوى والمنصة.',
        points: 34,
      },
      {
        id: 'q10-2',
        question: 'لماذا يُعتبر تصدير المحتوى بصيغة HTML5 هو الخيار العصري الإلزامي بدلاً من تقنية Flash القديمة؟',
        options: [
          'لأن HTML5 تعمل على كافة متصفحات الويب والهواتف الذكية وأجهزة الأندرويد والآيفون بكفاءة وأمان تام',
          'لأنها تتطلب برامج إضافية معقدة',
          'لأنها لا تدعم الألوان',
          'لأنها تعمل على أجهزة الكمبيوتر القديمة فقط'
        ],
        correctIndex: 0,
        explanation: 'صيغة HTML5 مفتوحة المعايير وتعمل على جميع شاشات ومتصفحات الأجهزة المحمولة بدون الحاجة لأي مشغلات خارجية.',
        points: 33,
      },
      {
        id: 'q10-3',
        question: 'في نهاية الموديول العاشر واللعبة التعليمية كاملة، كيف تُعرض نتائج ودرجات الطالب في النمط المرجأ (Deferred Feedback)؟',
        options: [
          'تُحذف الدرجات نهائياً',
          'يتم إتاحة التقرير التراكمي الشامل لكافة المستويات وإظهار إجمالي النقاط والشهادة المستحقة بعد إنجاز الدورة',
          'تؤجل لعام كامل',
          'تُرسل كرسالة ورقية بريدية'
        ],
        correctIndex: 1,
        explanation: 'في النمط المرجأ يُكشف التقرير الختامي الشامل للمتعلم في نهاية السلسلة لاختبار أثر الاحتفاظ وتنمية التأمل.',
        points: 33,
      },
    ],
  },
];

export const DEFAULT_GAME_LEVELS_DATA: GameLevelDef[] = JSON.parse(JSON.stringify(GAME_LEVELS_DATA));

export const GAME_LEVELS_STORAGE_KEY = 'cp_game_levels_custom_v2';

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
          found.questions = customLvl.questions;
        }
      });
      return parsed;
    }
    return GAME_LEVELS_DATA;
  } catch {
    return GAME_LEVELS_DATA;
  }
}

export function saveCustomGameLevels(levels: GameLevelDef[], syncRemote: boolean = true): void {
  try {
    localStorage.setItem(GAME_LEVELS_STORAGE_KEY, JSON.stringify(levels));
    levels.forEach((customLvl: GameLevelDef) => {
      const found = GAME_LEVELS_DATA.find((l) => l.levelNumber === customLvl.levelNumber);
      if (found) {
        found.questions = customLvl.questions;
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('game-levels-updated', { detail: levels }));
    }
    if (syncRemote) {
      syncGlobalQuestionsAndLevels('levels', levels).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to save custom game levels:', err);
  }
}

export function resetGameLevelsToDefault(): GameLevelDef[] {
  try {
    localStorage.removeItem(GAME_LEVELS_STORAGE_KEY);
    DEFAULT_GAME_LEVELS_DATA.forEach((defLvl) => {
      const found = GAME_LEVELS_DATA.find((l) => l.levelNumber === defLvl.levelNumber);
      if (found) {
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
    const raw = localStorage.getItem(GAME_LEVELS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((customLvl: GameLevelDef) => {
          const found = GAME_LEVELS_DATA.find((l) => l.levelNumber === customLvl.levelNumber);
          if (found) {
            found.questions = customLvl.questions;
          }
        });
      }
    }
  } catch {}
}
