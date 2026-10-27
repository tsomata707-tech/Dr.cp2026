import { PreTestQuestion, PreTestResult, StudentGameProgress } from '../types';
import { getAllStudentsProgress, saveAllStudentsProgress } from '../utils/gameStorage';
import { addActivityLog } from '../utils/adminStorage';
import { syncGlobalQuestionsAndLevels, syncStudentProgressToFirestore } from '../utils/realtimeService';
import { MATCHING_ASSETS_Q4, MATCHING_ASSETS_Q8 } from './matchingQuestionAssets';

const PRETEST_QUESTIONS_KEY = 'cp_pretest_questions_bank_v2';
const POSTTEST_QUESTIONS_KEY = 'cp_posttest_questions_bank_v2';

export const DEFAULT_PRETEST_QUESTIONS: PreTestQuestion[] = [
  // ================= MODULE 1 (Q1 - Q6) =================
  {
    id: 'pt-1',
    question: 'ما هي معمارية نظام التشغيل المطلوبة لتشغيل برنامج Adobe Captivate 2019 بكفاءة قياسية؟',
    options: [
      'معمارية 32-Bit فقط',
      'معمارية 64-Bit حصرياً لدعم استقرار المعالجة',
      'معمارية 16-Bit القديمة',
      'لا يشترط معمارية محددة'
    ],
    correctIndex: 1,
    explanation: 'يتطلب Adobe Captivate 2019 معمارية 64-Bit لتوفير استقرار معالجة الوسائط المتعددة والمحاكاة التفاعلية.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-2',
    question: 'تتكون منظومة "الوسائط المتعددة" (Multimedia) التفاعلية في جوهرها من تكامل العناصر التالية:\nأ - النصوص المكتوبة\nب - الأصوات والمؤثرات الصوتية\nج - الصور الثابتة والمتحركة ومقاطع الفيديو\nد - عناصر التحكم التفاعلي واستجابة المتعلم',
    options: [
      'النصوص فقط دون أي عنصر آخر',
      'الصوت والفيديو فقط دون تفاعل المتعلم',
      'النص، الصوت، الصورة، الفيديو، وعناصر التحكم التفاعلي',
      'ملفات الطباعة الورقية الثابتة'
    ],
    correctIndex: 2,
    explanation: 'الوسائط المتعددة تجمع النصوص المكتوبة، الأصوات، الصور الثابتة والمتحركة، الفيديو، مع إمكانية التفاعل الرقمي.',
    points: 1,
    questionType: 'mcq',
    layout: 'stacked',
  },
  {
    id: 'pt-3',
    question: 'عند اكتمال تثبيت البرنامج، ما الإجراء الضروري لضمان ظهور النصوص العربية بشكل سليم واتجاه صحيح من اليمين لليسار؟',
    options: [
      'تثبيت خطوط إضافية على نظام التشغيل فقط',
      'تفعيل خيار معالج النصوص الشرقية Indic Composer من تفضيلات البرنامج Preferences',
      'إعادة تثبيت نظام التشغيل Windows بالكامل',
      'لا يدعم البرنامج اللغة العربية إطلاقاً'
    ],
    correctIndex: 1,
    explanation: 'يتم تفعيل Indic Composer من نافذة Preferences ضمن General Settings لتمكين كتابة الأحرف العربية متصلة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-4',
    question: 'رتب الخطوات العملية الصحيحة لتدعيم وتفعيل اللغة العربية داخل برنامج Adobe Captivate 2019 عبر نظام المزاوجة:',
    options: [
      'الدخول إلى قائمة التفضيلات Edit -> Preferences',
      'تحديد فئة الإعدادات العامة General Settings',
      'تحديد خيار معالج النصوص الشرقية Indic Composer',
      'حفظ الإعدادات وإعادة تشغيل برنامج Captivate'
    ],
    correctIndex: 0,
    explanation: 'لتفعيل اللغة العربية: Edit > Preferences > General Settings > تفعيل Indic Composer ثم إعادة تشغيل البرنامج.',
    points: 1,
    questionType: 'matching',
    matchingPairs: [
      { id: 'm4-1', text: 'الخطوة 1: الدخول إلى قائمة التفضيلات Edit -> Preferences', imageUrl: MATCHING_ASSETS_Q4.step1_preferences },
      { id: 'm4-2', text: 'الخطوة 2: تحديد فئة الإعدادات العامة General Settings', imageUrl: MATCHING_ASSETS_Q4.step2_category },
      { id: 'm4-3', text: 'الخطوة 3: تحديد خيار معالج النصوص الشرقية Indic Composer', imageUrl: MATCHING_ASSETS_Q4.step3_indicComposer },
      { id: 'm4-4', text: 'الخطوة 4: حفظ الإعدادات وإعادة تشغيل برنامج Captivate', imageUrl: MATCHING_ASSETS_Q4.step4_restart }
    ]
  },
  {
    id: 'pt-5',
    question: 'ما الوظيفة الأساسية للشاشة الافتتاحية (Welcome Screen) عند تشغيل Adobe Captivate 2019؟',
    options: [
      'عرض لوحة الشرف والمشرفين فقط',
      'توفير وصول سريع لإنشاء مشروعات جديدة بمختلف الأنماط وفتح الملفات الأخيرة',
      'تشغيل مشغل الوسائط Windows Media Player',
      'إغلاق البرنامج فوراً'
    ],
    correctIndex: 1,
    explanation: 'الشاشة الافتتاحية تتيح اختيار نمط المشروع (فارغ، متجاوب، واقع افتراضي، محاكاة) واستعراض الملفات السابقة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-6',
    question: 'أي نمط مشروع يُفضل اختياره من الشاشة الافتتاحية لإنشاء درس تعليمي فارغ بأبعاد محددة يدوياً؟',
    options: [
      'مشروع فارغ (Blank Project)',
      'تسجيل الشاشة فقط (Video Demo)',
      'تطبيق هاتف ذكي مغلق',
      'ملف نصي عادي'
    ],
    correctIndex: 0,
    explanation: 'نمط Blank Project يمنح المصمم مساحة عمل بيضاء بأبعاد قابلة للتخصيصل الكامل حسب متطلبات الدرس.',
    points: 1,
    questionType: 'mcq',
    layout: 'stacked',
  },

  // ================= MODULE 2 (Q7 - Q11) =================
  {
    id: 'pt-7',
    question: 'ما هي المساحة المركزية في واجهة البرنامج التي يتم فيها إدراج وتنسيق عناصر ومحتويات الشريحة؟',
    options: [
      'مسرح العمل (Stage)',
      'لوحة المسار الزمني (Timeline)',
      'شريط العنوان (Title Bar)',
      'لوحة المكتبة (Library)'
    ],
    correctIndex: 0,
    explanation: 'مسرح العمل (Stage) هو المساحة البيضاء في منتصف الشاشة التي تمثل الشريحة وتستقبل كائنات التعلم.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-8',
    question: 'قم بمزاوجة وتوصيل الإجراء والوظيفة الرئيسية بما يناسبها من اختصارات وأوامر إدارة المشاريع في Captivate 2019:',
    options: [
      'إنشاء مشروع جديد فارغ (Ctrl+N)',
      'فتح مشروع عمل سابق مخزن (Ctrl+O)',
      'حفظ ملف المشروع وتحديث التغييرات (Ctrl+S)',
      'معاينة المشروع بالكامل داخل متصفح الويب (F11)'
    ],
    correctIndex: 0,
    explanation: 'الاختصارات القياسية: جديد Ctrl+N، فتح Ctrl+O، حفظ Ctrl+S، معاينة بالمتصفح F11.',
    points: 1,
    questionType: 'matching',
    matchingPairs: [
      { id: 'm8-1', text: 'إنشاء مشروع جديد فارغ عبر اختصار لوحة المفاتيح (Ctrl+N)', imageUrl: MATCHING_ASSETS_Q8.step1_newProject },
      { id: 'm8-2', text: 'فتح مشروع عمل سابق مخزن على جهاز الحاسب (Ctrl+O)', imageUrl: MATCHING_ASSETS_Q8.step2_openProject },
      { id: 'm8-3', text: 'حفظ ملف المشروع وتحديث التغييرات بصيغة CPTX (Ctrl+S)', imageUrl: MATCHING_ASSETS_Q8.step3_saveProject },
      { id: 'm8-4', text: 'معاينة المشروع بالكامل داخل متصفح الويب الافتراضي (F11)', imageUrl: MATCHING_ASSETS_Q8.step4_previewBrowser }
    ]
  },
  {
    id: 'pt-9',
    question: 'ما اللوحة الأساسية التي تستخدم لتعديل أبعاد وموضع وتأثيرات أي كائن يتم تحديده على المسرح؟',
    options: [
      'لوحة الخصائص (Properties Panel)',
      'لوحة مسجل الصوت (Audio Panel)',
      'لوحة المتغيرات (Variables)',
      'شريط المسطرة العلوية'
    ],
    correctIndex: 0,
    explanation: 'لوحة Properties تظهر كافة خصائص الكائن النشط مثل الأبعاد (Width, Height)، والموضع (X, Y)، ونمط الخط والتعبئة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-10',
    question: 'أين تظهر معاينة شرائح المشروع بترتيبها التسلسلي الرأسي على يسار واجهة البرنامج؟',
    options: [
      'لوحة شريط الشرائح المصغرة (Filmstrip)',
      'لوحة المكتبة (Library)',
      'شريط القوائم الرئيسي (Menu Bar)',
      'لوحة المشرفين'
    ],
    correctIndex: 0,
    explanation: 'لوحة Filmstrip تعرض مصغرات لكافة شرائح المشروع وتسمح بإعادة ترتيبها وتكرارها وحذفها بسهولة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-11',
    question: 'ما اللوحة المسؤولة عن تخزين وتنظيم ملفات الوسائط المستوردة (صور، أصوات، فيديو) لإعادة استخدامها؟',
    options: [
      'لوحة المكتبة (Library)',
      'لوحة المحاذاة (Align)',
      'لوحة الإجراءات (Actions)',
      'لوحة التلميحات'
    ],
    correctIndex: 0,
    explanation: 'لوحة Library تحتفظ بكافة الأصول والوسائط الرقمية للمشروع وتتيح إعادة إدراجها دون تكرار حجم الملف.',
    points: 1,
    questionType: 'mcq',
  },

  // ================= MODULE 3 (Q12 - Q16) =================
  {
    id: 'pt-12',
    question: 'ما الميزة الحصرية التي يوفرها نمط المشروع المتجاوب (Responsive Project) في Captivate 2019؟',
    options: [
      'التكيف الذكي مع مقاسات الشاشات المختلفة كالحاسب والأجهزة اللوحية والهواتف عبر Fluid Boxes',
      'طباعة الشرائح على طابعات الليزر فقط',
      'منع تشغيل المشروع على شاشات الجوال',
      'إلغاء المؤثرات التفاعلية تلقائياً'
    ],
    correctIndex: 0,
    explanation: 'المشروعات المتجاوبة تعتمد على شبكات Fluid Boxes لإعادة تنظيم العناصر ذاتياً وفق أبعاد شاشة جهاز المستخدم.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-13',
    question: 'لإنشاء بيئة تعلم غامرة وتفاعلية بزاوية 360 درجة، أي نوع من المشروعات يجب اختياره؟',
    options: [
      'مشروع الواقع الافتراضي (Virtual Reality Project)',
      'مشروع فارغ عادي (Blank Project)',
      'عرض تقديمي مجرد (PowerPoint)',
      'ملف صوتي MP3 فقط'
    ],
    correctIndex: 0,
    explanation: 'مشروع VR يتيح إدراج صور وفيديوهات 360 درجة وإضافة نقاط تفاعلية وأسئلة بصرية غامرة.',
    points: 1,
    questionType: 'mcq',
    layout: 'stacked',
  },
  {
    id: 'pt-14',
    question: 'ما هي وحدة قياس أبعاد المسرح الافتراضية عند تحديد مقاس مشروع فارغ (Blank Project)؟',
    options: [
      'السنتيمتر (cm)',
      'البكسل (Pixels)',
      'البوصة (Inches)',
      'المتر المربع'
    ],
    correctIndex: 1,
    explanation: 'تستخدم الشاشات الرقمية وحدة البكسل (Pixels) كمعيار قياسي لضبط دقة العرض وتناسق الأبعاد.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-15',
    question: 'ما الامتداد البرمجي الافتراضي المعتمد لحفظ ملفات المشروعات القابلة للتعديل والتحرير داخل Captivate 2019؟',
    options: [
      '.CPTX',
      '.DOCX',
      '.MP4',
      '.EXE'
    ],
    correctIndex: 0,
    explanation: 'صيغة CPTX هي الامتداد المصدري الأصلي المعتمد لمشاريع Adobe Captivate القابلة للتحرير والتطوير.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-16',
    question: 'عند الرغبة في إنشاء قالب موحد للمشروعات يحفظ نفس الألوان والخطوط لكافة الدروس، يُحفظ بصيغة:',
    options: [
      'قالب مشروع Captivate Template بصيغة .CPTL',
      'صورة نقطية .BMP',
      'ملف نصي .TXT',
      'أيقونة ثابتة .ICO'
    ],
    correctIndex: 0,
    explanation: 'صيغة CPTL تمثل قوالب المشروعات (Templates) التي تضمن توحيد التصميم والهوية البصرية للمقررات.',
    points: 1,
    questionType: 'mcq',
  },

  // ================= MODULE 4 (Q17 - Q21) =================
  {
    id: 'pt-17',
    question: 'ما الفائدة الكبرى لاستخدام "الأشكال الذكية" (Smart Shapes) في بناء محتوى الشريحة؟',
    options: [
      'تصلح فقط كخلفيات صامتة دون نص',
      'تجمع بين إمكانية الرسم، واحتواء النصوص المنسقة، والتحول إلى أزرار تفاعلية',
      'تزيد حجم الملف بشكل مفرط',
      'تعطل استجابة الفأرة'
    ],
    correctIndex: 1,
    explanation: 'Smart Shapes مرنة جداً وتستخدم كأشكال هندسية، ومربعات نصوص، وأزرار تفاعلية بنقرة زر واحدة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-18',
    question: 'لتحويل شكل ذكي (Smart Shape) إلى زر تفاعلي ينفذ أوامر عند نقره، نقوم بتفعيل خيار:',
    options: [
      'Use as Button من لوحة Properties',
      'Lock Size من لوحة Align',
      'Convert to Audio',
      'Hide from Stage'
    ],
    correctIndex: 0,
    explanation: 'تفعيل خيار Use as Button يضيف تبويب Actions وحالات الزر التفاعلية (Normal, Rollover, Down).',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-19',
    question: 'كيف يمكن تغيير لون خلفية شريحة محددة في المسرح؟',
    options: [
      'من لوحة Properties الخاصة بالشريحة واختيار اللون من قسم Style',
      'بحذف الشريحة وإعادة إنشائها',
      'بالنقر المزدوج على سطح المكتب',
      'من خلال إعدادات شاشة الحاسوب الخارجية'
    ],
    correctIndex: 0,
    explanation: 'تحديد الشريحة يظهر خيارات خلفيتها (Solid Color, Gradient, Image) في لوحة الخصائص Properties.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-20',
    question: 'عند الرغبة في تكرار شريحة كاملة بجميع محتوياتها وكائناتها، نستخدم الأمر:',
    options: [
      'تكرار الشريحة (Duplicate Slide)',
      'حذف الشريحة (Delete)',
      'إخفاء الشريحة (Hide)',
      'قص الشريحة دون لصق'
    ],
    correctIndex: 0,
    explanation: 'الأمر Duplicate Slide (Ctrl+D) ينشئ نسخة مطابقة تماماً من الشريحة مع الحفاظ على التوقيت والبرمجة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-21',
    question: 'ما هي صيغة الصور الرقمية المثالية لإدراج الشعارات والرموز الشفافة دون خلفية بيضاء مشوهة؟',
    options: [
      'صيغة PNG الشفافة (Transparent PNG)',
      'صيغة BMP الثقيلة',
      'صيغة JPEG المعتمة دائماً',
      'ملف وورد DOCX'
    ],
    correctIndex: 0,
    explanation: 'صيغة PNG تدعم قناة الشفافية Alpha Channel مما يجعل الأيقونات والشعارات تندمج بانسيابية مع خلفية الشريحة.',
    points: 1,
    questionType: 'mcq',
  },

  // ================= MODULE 5 (Q22 - Q26) =================
  {
    id: 'pt-22',
    question: 'ما الغرض من استخدام ميزة "الأدلة الذكية" (Smart Guides) أثناء تحريك الكائنات على الشريحة؟',
    options: [
      'مساعدة المصمم على محاذاة الكائنات أفقياً ورأسياً وضبط المسافات البينية تلقائياً',
      'تسجيل الصوت تلقائياً',
      'إغلاق المشروع عند الخطأ',
      'تلوين النص بالألوان العشوائية'
    ],
    correctIndex: 0,
    explanation: 'تظهر الخطوط الإرشادية Smart Guides أثناء سحب العناصر لتدل على محاذاتها التامة مع حواف الكائنات المجاورة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-23',
    question: 'للتحكم في ترتيب طبقات العناصر المتداخلة وتقديم كائن ليغطي كائناً آخر، نستخدم أمر:',
    options: [
      'Bring to Front من قائمة Arrange',
      'Align Left من لوحة المحاذاة',
      'Clear Formatting',
      'Flip Horizontal'
    ],
    correctIndex: 0,
    explanation: 'أوامر Arrange تتحكم في ترتيب العمق Z-Order لتقديم الكائنات للأمام أو إرجاعها للخلف.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-24',
    question: 'عند تطبيق تأثير حركة (Motion Effect) على كائن، في أي مساحة يتم ضبط مسار وزمن الحركة بدقة؟',
    options: [
      'لوحة التأثيرات Effects ومسار الكائن في الخط الزمني Timeline',
      'لوحة المكتبة Library فقط',
      'الشاشة الافتتاحية',
      'سجل المتصفح'
    ],
    correctIndex: 0,
    explanation: 'يتم رسم مسار الحركة Motion Path وتحديد زمن البداية والانتهاء عبر Timeline ولوحة Effects.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-25',
    question: 'ما الوظيفة التي تتيح تجميع عدة عناصر على الشريحة لتسهيل تحريكها وتغيير حجمها ككتلة واحدة؟',
    options: [
      'وظيفة التجميع Grouping (Ctrl+G)',
      'وظيفة الحذف الكلي',
      'أمر فك التثبيت',
      'أداة القطارة'
    ],
    correctIndex: 0,
    explanation: 'تجميع الكائنات يدمجها في مجموعة واحدة (Group) مع الاحتفاظ بإمكانية تعديل عناصرها الداخلية.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-26',
    question: 'أي إجراء يمنع تحريك أو تعديل كائن معين بالخطأ أثناء العمل على الشريحة؟',
    options: [
      'قفل طبقة الكائن (Lock) في الخط الزمني Timeline',
      'حذف الكائن فوراً',
      'تغيير اسم الشريحة',
      'إيقاف بطاقة الشاشة'
    ],
    correctIndex: 0,
    explanation: 'أيقونة القفل (Lock) في الخط الزمني تثبت الكائن في موضعه وتمنع تحديده أو إزاحته بالخطأ.',
    points: 1,
    questionType: 'mcq',
  },

  // ================= MODULE 6 (Q27 - Q31) =================
  {
    id: 'pt-27',
    question: 'ما نوع السؤال التفاعلي الذي يطلب من المتعلم النقر المباشر على جزء معين من صورة للإجابة؟',
    options: [
      'سؤال المنطقة الساخنة (Hotspot Question)',
      'سؤال المقال الطويل',
      'سؤال الاختيار الفردي النصي',
      'سؤال ملء الفراغات'
    ],
    correctIndex: 0,
    explanation: 'سؤال Hotspot يحدد مساحة حساسة داخل الصورة، وتعتبر الإجابة صحيحة إذا نقر المتعلم داخل حدودها.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-28',
    question: 'ما الفائدة الأكاديمية لاستخدام "بنوك الأسئلة" (Question Pools) في الاختبارات التفاعلية؟',
    options: [
      'سحب أسئلة عشوائية لكل طالب لمنع الغش وتحقيق تكافؤ الفرص في التقييم',
      'إلغاء احتساب درجات الاختبار',
      'إجبار الطلاب على حل نفس السؤال دائماً',
      'حذف أسئلة الاختبار بعد الاستخدام'
    ],
    correctIndex: 0,
    explanation: 'بنوك الأسئلة تخزن مجموعة كبيرة من الأسئلة، ويقوم البرنامج بتوزيعها عشوائياً بين نماذج الطلاب.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-29',
    question: 'ما هي الشريحة التلقائية التي تظهر في نهاية الاختبار لعرض نتيجة الطالب ونسبة إتقانه وحالة النجاح والرسوب؟',
    options: [
      'شريحة نتيجة الاختبار (Quiz Result Slide)',
      'شريحة العنوان الرئيسية',
      'شريحة فارغة بيضاء',
      'الشاشة الافتتاحية للمشروع'
    ],
    correctIndex: 0,
    explanation: 'تولد شريحة Quiz Result Slide تلقائياً لتعرض Score، و Max Score، و Passing Score، ودرجة الإتقان.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-30',
    question: 'في إعدادات الاختبار، ماذا يتيح تفعيل خيار "Allow Review" للمتعلم بعد انتهاء الاختبار؟',
    options: [
      'مراجعة إجاباته السابقة والتعرف على الأسئلة الصحيحة والخاطئة بتغذية راجعة',
      'إلغاء نتيجة اختباره وإعادتها للصفر',
      'تغيير اسم المشرف على المقرر',
      'تصدير المشروع لبرنامج آخر'
    ],
    correctIndex: 0,
    explanation: 'ميزة Review Quiz تسمح للطالب بالرجوع للشرائح ليرى اختياراته والتصحيح النموذجي لكل سؤال.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-31',
    question: 'لتحديد درجة النجاح الصغرى المشروطة لاجتياز الاختبار، يتم ضبط خيار:',
    options: [
      'درجة الاجتياز (Passing Score) في تبويب Pass/Fail',
      'مدة عرض الشريحة',
      'اسم مصمم المشروع',
      'حجم خط السؤال'
    ],
    correctIndex: 0,
    explanation: 'تحدد درجة Passing Score كنسبة مئوية أو عدد نقاط، وبناءً عليها يتفرع مسار الطالب نحو النجاح أو الإعادة.',
    points: 1,
    questionType: 'mcq',
  },

  // ================= MODULE 7 (Q32 - Q37) =================
  {
    id: 'pt-32',
    question: 'ما اللوحة المسؤولة عن ضبط توقيت ظهور واختفاء عناصر الصوت والصورة على الشريحة بدقة الأجزاء من الثانية؟',
    options: [
      'لوحة المسار الزمني (Timeline)',
      'لوحة الخصائص (Properties)',
      'لوحة الأنماط (Styles)',
      'شريط الحالة السفلي'
    ],
    correctIndex: 0,
    explanation: 'الخط الزمني (Timeline) يعرض كل كائن في طبقة زمنية لتحديد ثواني البداية ومدة البقاء ونهاية الظهور.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-33',
    question: 'ما هي وظيفة "الإشارات المرجعية" (Bookmarks) المضافة إلى الفيديو التفاعلي في Captivate 2019؟',
    options: [
      'إيقاف الفيديو تلقائياً عند نقطة زمنية لعرض شريحة معلوماتية أو سؤال تقويمي تفاعلي',
      'تسريع تشغيل الفيديو للضعف',
      'حذف الفيديو من المشروع نهائياً',
      'خفض سطوع الشاشة'
    ],
    correctIndex: 0,
    explanation: 'نقاط Bookmarks تجعل الفيديو تفاعلياً وتسمح بتضمين تراكبات Knowledge Check أو القفز لمحطات أخرى.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-34',
    question: 'ما هي الصيغة الأكثر توافقاً والأمثل لإدراج مقاطع الفيديو في Captivate 2019 لتعمل بسلاسة على كافة المتصفحات؟',
    options: [
      'صيغة MP4 بتكويد H.264 القياسي',
      'صيغة AVI القديمة غير المضغوطة',
      'صيغة WMV التابعة لمايكروسوفت فقط',
      'ملف فوتوشوب PSD'
    ],
    correctIndex: 0,
    explanation: 'تعتبر صيغة MP4 (H.264) المعيار العالمي المدعوم من كافة متصفحات HTML5 وأجهزة الهواتف الذكية.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-35',
    question: 'عند تسجيل تعليق صوتي مصاحب للشريحة (Audio Narration)، أين تظهر موجة الصوت لإدارتها داخل الشريحة؟',
    options: [
      'في مسار الصوت الخاص بالشريحة في أسفل الخط الزمني Timeline',
      'داخل لوحة Filmstrip فقط',
      'في نافذة التفضيلات',
      'في شريط المهام خارج البرنامج'
    ],
    correctIndex: 0,
    explanation: 'يظهر مسار Audio أسفل الشريحة في التايم لاين لتسهيل مزامنة التعليق الصوتي مع ظهور الكائنات ونصوص الشرح.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-36',
    question: 'في بيئات التعلم التي تطبق "التغذية الراجعة الفورية" (Immediate Feedback)، متى يتلقى المتعلم التوجيه والتعزيز؟',
    options: [
      'مباشرة فور استجابته وتأكيد إجابته على السؤال الحالي',
      'بعد نهاية المقرر الدراسي كاملاً',
      'في بداية الفصل الدراسي القادم',
      'لا تقدم له أي تغذية راجعة مطلقا'
    ],
    correctIndex: 0,
    explanation: 'التغذية الفورية تقدم التعزيز والتصحيح في نفس لحظة الاستجابة لتثبيت المفهوم وتلافي ترسيخ الخطأ.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-37',
    question: 'في بيئات التعلم التي تطبق "التغذية الراجعة المرجأة" (Delayed Feedback)، متى يتم إظهار التقييم والنتائج؟',
    options: [
      'بعد انتهاء الطالب من إكمال الاختبار كاملاً أو نهاية المرحلة التعليمية بأكملها',
      'قبل أن يبدأ الطالب في قراءة السؤال',
      'بشكل فوري بعد كل نقرة مفردة',
      'عن طريق الهاتف فقط'
    ],
    correctIndex: 0,
    explanation: 'التغذية المرجأة تؤجل عرض النتائج والتفسيرات حتى انتهاء سلسلة من المهام لقياس الاستيعاب الكلي.',
    points: 1,
    questionType: 'mcq',
  },

  // ================= MODULE 8 (Q38 - Q42) =================
  {
    id: 'pt-38',
    question: 'ما هي صيغة ملفات عروض PowerPoint المدعومة للاستيراد المباشر داخل Adobe Captivate 2019؟',
    options: [
      'ملفات العروض التقديمية بصيغة .PPTX',
      'ملفات قواعد البيانات .MDB',
      'ملفات الفلاش الملغاة .SWF',
      'ملفات إكسل .XLSX'
    ],
    correctIndex: 0,
    explanation: 'يدعم Captivate استيراد شرائح PowerPoint بصيغة PPTX وتحويلها لشرائح تفاعلية مع الاحتفاظ بالتصميم.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-39',
    question: 'عند استيراد ملف PowerPoint، ما الخيار الذي يضمن تحديث الشرائح في Captivate تلقائياً إذا عُدلت في PowerPoint الأصلية؟',
    options: [
      'تفعيل خيار الربط الديناميكي (Link Presentation)',
      'حفظ الملف باسم جديد كل مرة',
      'فصل الاتصال بالإنترنت',
      'حظر التعديلات في النظام'
    ],
    correctIndex: 0,
    explanation: 'خيار Link يربط شرائح Captivate بالملف المصدري، فإذا قام الأستاذ بتعديل العرض يُحدّث في المشروع بنقرة زر.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-40',
    question: 'ما الميزة التي يقدمها خيار "Edit with Adobe Captivate" عند التعامل مع عناصر PowerPoint المستوردة؟',
    options: [
      'تحويل كائنات ونصوص الشريحة إلى عناصر قابلة للتحرير والتفاعل والتحريك داخل Captivate',
      'تحويل العرض إلى صورة ثابتة صامتة',
      'إغلاق البرنامج فوراً',
      'حذف الخطوط الأصلية'
    ],
    correctIndex: 0,
    explanation: 'يتيح هذا الخيار تفكيك عناصر الشريحة لتصبح أشكالاً ونصوصاً مستقلة يمكن برمجتها وإضافة التفاعل إليها.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-41',
    question: 'ما هي نسبة العرض إلى الارتفاع الافتراضية العصرية الموصى بها لمشروعات الشاشات العريضة الحديثة؟',
    options: [
      'نسبة الشاشة العريضة 16:9 (Widescreen بدقة 1920x1080 أو 1280x720)',
      'نسبة الشاشات المربعة القديمة 4:3 فقط',
      'نسبة الشاشات العمودية الضيقة 1:1',
      'لا توجد نسب معتمدة'
    ],
    correctIndex: 0,
    explanation: 'نسبة 16:9 هي النسبة القياسية لمعظم شاشات الحواسيب المحمولة والشاشات التفاعلية وأجهزة العرض الحديثة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-42',
    question: 'أين تظهر شرائح عرض PowerPoint المستوردة بعد تأكيد استيرادها بنجاح في Captivate؟',
    options: [
      'ضمن تسلسل شرائح المشروع في شريط Filmstrip الجانبي',
      'في سلة المهملات',
      'في نافذة تسجيل الدخول',
      'على سطح المكتب خارج المشروع'
    ],
    correctIndex: 0,
    explanation: 'تدرج الشرائح المستوردة كشرائح جديدة ضمن لوحة Filmstrip بالترتيب الذي اختاره المصمم.',
    points: 1,
    questionType: 'mcq',
  },

  // ================= MODULE 9 (Q43 - Q48) =================
  {
    id: 'pt-43',
    question: 'ما هو الكائن غير المرئي المستخدم لتحويل أي منطقة معينة في الشريحة إلى منطقة حساسة للنقر؟',
    options: [
      'صندوق النقر الشفاف (Click Box)',
      'الشكل الهندسي الملون',
      'شريحة الاختبار',
      'المؤقت الزمني'
    ],
    correctIndex: 0,
    explanation: 'كائن Click Box شفاف تماماً في العرض النهائي ويوضع فوق أزرار صورية أو رسومات لتحفيز التفاعل عند النقر.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-44',
    question: 'ما هي الحالات الثلاث (States) التفاعلية الافتراضية لكل زر يتم إنشاؤه في Captivate 2019؟',
    options: [
      'حالة Normal (عادية)، وحالة Rollover (تمرير الفأرة)، وحالة Down (الضغط)',
      'حالة Start، و Stop، و Pause',
      'حالة Red، و Green، و Blue',
      'حالة Small، و Medium، و Large'
    ],
    correctIndex: 0,
    explanation: 'تلك الحالات الثلاث تقدم استجابة بصرية للمتعلم عند الاقتراب من الزر، وعند الضغط عليه، وعند تركه.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-45',
    question: 'ما الإجراء (Action) الذي يجعل المتعلم يقفز مباشرة إلى شريحة اختبار أو محاكاة محددة برقمها؟',
    options: [
      'إجراء القفز إلى شريحة (Jump to Slide)',
      'إجراء إيقاف التشغيل المساعد',
      'إجراء الخروج الفوري',
      'إجراء حفظ الشريحة كملف خارجي'
    ],
    correctIndex: 0,
    explanation: 'أمر Jump to Slide هو أحد أهم أوامر التفرع التفاعلي (Branching) لتوجيه المتعلم وفق مسارات مخصصة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-46',
    question: 'أي نمط محاكاة برمجية (Software Simulation) يوجه المتعلم خطوة بخطوة مع عرض تلميحات فورية وأدلة مساعدة عند ارتكاب خطأ؟',
    options: [
      'نمط التدريب (Training Mode)',
      'نمط التقييم الصامت (Assessment Mode)',
      'نمط العرض الصامت (Demo Mode)',
      'نمط القراءة فقط'
    ],
    correctIndex: 0,
    explanation: 'نمط التدريب يقدم للمتعلم بيئة تجريبية آمنة مع تلميحات مرئية وصوتية توجهه إلى الخطوة التالية بدقة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-47',
    question: 'في نمط محاكاة التقييم (Assessment Mode)، كيف يتعامل البرنامج مع نقرات واستجابات المتعلم؟',
    options: [
      'يسجل النقرات بدقة ويحتسب الدرجة دون إظهار أي تلميحات أو توجيهات مساعدة أثناء الاختبار',
      'يحل الأسئلة نيابة عن المتعلم',
      'يعيد تشغيل الحاسوب عند الخطأ',
      'يوقف حركة المؤشر نهائياً'
    ],
    correctIndex: 0,
    explanation: 'نمط التقييم مخصص لقياس الأداء الفعلي للمتعلم دون تدخل تعليمي، ويسجل زمن الإنجاز وعدد الأخطاء والدرجة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-48',
    question: 'ما هو الكائن المستخدم لاستقبال إجابات نصية أو أرقام يكتبها المتعلم بلوحة المفاتيح والتحقق من صحتها؟',
    options: [
      'صندوق إدخال النص (Text Entry Box - TEB)',
      'صندوق النقر الشفاف (Click Box)',
      'الشكل الذكي البيضاوي',
      'شريحة النتائج'
    ],
    correctIndex: 0,
    explanation: 'صندوق TEB يستقبل كتابة الطالب ويقارنها بالإجابات الصحيحة المبرمجة مسبقاً مع إمكانية التغاضي عن المسافات.',
    points: 1,
    questionType: 'mcq',
  },

  // ================= MODULE 10 (Q49 - Q53) =================
  {
    id: 'pt-49',
    question: 'لماذا يُعتبر تصدير المحتوى بصيغة HTML5 هو الخيار العصري الإلزامي بدلاً من تقنية Flash القديمة؟',
    options: [
      'لأن HTML5 متوافق عالمياً مع كافة المتصفحات الحديثة، والأجهزة اللوحية، والهواتف الذكية دون مشغلات إضافية',
      'لأنها تقلل جودة الرسوم',
      'لأنها تمنع تشغيل الفيديو',
      'لأنها تعمل على الحواسيب المغلقة فقط'
    ],
    correctIndex: 0,
    explanation: 'توقفت تقنية Flash عالمياً، وأصبحت HTML5 هي المعيار القياسي الآمن عالي الأداء لتشغيل الوسائط والمحاكاة.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-50',
    question: 'ما هي معايير حزم التعلم الإلكتروني القياسية التي تسمح بتتبع درجات وتقدم الطالب ونقلها لنظام إدارة التعلم LMS؟',
    options: [
      'معايير سكورم (SCORM 1.2 / SCORM 2004) ومعيار AICC / xAPI',
      'معايير شبكات الواي فاي فقط',
      'معايير ألوان الطابعات CMYK',
      'معايير ضغط ملفات MP3 الصوتية'
    ],
    correctIndex: 0,
    explanation: 'معيار SCORM هو البروتوكول العالمي الذي ينظم لغة التواصل بين المحتوى التفاعلي ومنصة التعلم (مثل Moodle).',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-51',
    question: 'عند تفعيل إعداد "Quiz Reporting" في نافذة النشر، ما الميزة التي يحصل عليها أستاذ المقرر والمشرف؟',
    options: [
      'إرسال درجات الطلاب، وزمن الإجابة، وحالة الاجتياز مباشرة إلى سجل الدرجات في نظام LMS',
      'حذف بيانات الطلاب لمنع التتبع',
      'تحويل الاختبار إلى ورق مطبوع',
      'إلغاء التقييم البعدي'
    ],
    correctIndex: 0,
    explanation: 'خاصية Reporting تنقل بيانات درجات الطلاب ونسب إتمامهم وحالة Pass/Fail تلقائياً إلى قاعدة بيانات المنصة.',
    points: 1,
    questionType: 'mcq',
    layout: 'stacked',
  },
  {
    id: 'pt-52',
    question: 'ما هو نوع الملف النهائي المضغوط الذي ينتجه البرنامج عند نشر حزمة تعليمية متوافقة مع معايير SCORM؟',
    options: [
      'ملف أرشيف مضغوط بصيغة ZIP (.zip) يحتوي على ملف المانيفست imsmanifest.xml وكافة أصول المحتوى',
      'ملف صورة واحدة .JPEG',
      'ملف تنفيذي مجهول .DLL',
      'ملف وورد نصي'
    ],
    correctIndex: 0,
    explanation: 'حزمة SCORM القياسية تجمع كافة ملفات HTML5 والأكواد في ملف مضغوط ZIP يرفع مباشرة على منصة إدارة التعلم.',
    points: 1,
    questionType: 'mcq',
  },
  {
    id: 'pt-53',
    question: 'ما الأمر والاختصار المستخدم لمعاينة المشروع التفاعلي كاملاً داخل متصفح الإنترنت والتأكد من تفاعل الأزرار واحتساب النتيجة؟',
    options: [
      'معاينة في المتصفح (Preview in Browser) عبر مفتاح الاختصار F11',
      'حفظ الملف باسم جديد',
      'طباعة الشريحة الورقية',
      'إغلاق نافذة البرنامج'
    ],
    correctIndex: 0,
    explanation: 'معاينة المتصفح (F11) تشغل المشروع التفاعلي في بيئة ويب حقيقية ومطابقة تماماً لتجربة المتعلم النهائية.',
    points: 1,
    questionType: 'mcq',
  },
];

export const DEFAULT_POSTTEST_QUESTIONS: PreTestQuestion[] = JSON.parse(
  JSON.stringify(DEFAULT_PRETEST_QUESTIONS)
);

export function ensureMatchingQuestionsIntegrity(questions: PreTestQuestion[]): PreTestQuestion[] {
  if (!Array.isArray(questions)) return [];
  return questions.map((q, idx) => {
    const questionNumber = idx + 1;
    if ([2, 6, 13, 51].includes(questionNumber) || ['pt-2', 'pt-6', 'pt-13', 'pt-51'].includes(q.id)) {
      if (q.layout !== 'stacked') {
        return { ...q, layout: 'stacked' };
      }
    }
    return q;
  });
}

export function getPreTestQuestions(): PreTestQuestion[] {
  try {
    const raw = localStorage.getItem(PRETEST_QUESTIONS_KEY);
    if (!raw) {
      savePreTestQuestions(DEFAULT_PRETEST_QUESTIONS, false);
      return ensureMatchingQuestionsIntegrity(DEFAULT_PRETEST_QUESTIONS);
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      savePreTestQuestions(DEFAULT_PRETEST_QUESTIONS, false);
      return ensureMatchingQuestionsIntegrity(DEFAULT_PRETEST_QUESTIONS);
    }
    return ensureMatchingQuestionsIntegrity(parsed);
  } catch {
    return ensureMatchingQuestionsIntegrity(DEFAULT_PRETEST_QUESTIONS);
  }
}

export function savePreTestQuestions(questions: PreTestQuestion[], syncRemote: boolean = true): void {
  localStorage.setItem(PRETEST_QUESTIONS_KEY, JSON.stringify(questions));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pretest-questions-updated', { detail: questions }));
  }
  if (syncRemote) {
    syncGlobalQuestionsAndLevels('pretest', questions).catch(() => {});
  }
}

export function resetPreTestQuestionsToDefault(): PreTestQuestion[] {
  savePreTestQuestions(DEFAULT_PRETEST_QUESTIONS, true);
  return DEFAULT_PRETEST_QUESTIONS;
}

export function submitPreTestResult(
  username: string,
  chosenAnswers: Record<string, number>,
  timeSpentSeconds: number
): {
  progress: StudentGameProgress;
  result: PreTestResult;
} {
  const all = getAllStudentsProgress();
  const prog = all[username] || {
    username,
    avatarId: 'avatar-cpbot',
    currentLevel: 1,
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: new Date().toISOString(),
  };

  const questions = getPreTestQuestions();
  let score = 0;
  let maxScore = 0;
  const questionScores: Record<string, number> = {};
  const questionDetails: Record<string, { chosenIndex: number; isCorrect: boolean; answeredAt: string }> = {};
  const completedAtStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  questions.forEach((q) => {
    const pts = q.points || 1;
    maxScore += pts;
    const chosen = chosenAnswers[q.id];
    const isCorrect = chosen === q.correctIndex;
    if (isCorrect) {
      score += pts;
      questionScores[q.id] = pts;
    } else {
      questionScores[q.id] = 0;
    }
    questionDetails[q.id] = {
      chosenIndex: chosen ?? -1,
      isCorrect,
      answeredAt: completedAtStr,
    };
  });

  const finalMaxScore = maxScore > 0 ? maxScore : 53;
  const passed = finalMaxScore === 0 ? true : score >= Math.floor(finalMaxScore * 0.4);

  const result: PreTestResult = {
    completed: true,
    score,
    maxScore: finalMaxScore,
    answers: chosenAnswers,
    questionScores,
    questionDetails,
    completedAt: completedAtStr,
    timeSpentSeconds,
    passed,
  };

  // For admin user (Read-only mode): do not commit answers, do not save scores, do not modify database
  if (username.trim().toLowerCase() === 'admin') {
    return { progress: prog, result };
  }

  prog.preTestResult = result;
  if (!prog.currentLevel || prog.currentLevel < 1) {
    prog.currentLevel = 1;
  }
  const badgeName = 'وسام المستكشف التمهيدي (الاختبار القبلي)';
  if (!prog.badges.includes(badgeName)) {
    prog.badges.push(badgeName);
  }
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  all[username] = prog;
  saveAllStudentsProgress(all);
  syncStudentProgressToFirestore(prog).catch(() => {});
  try {
    window.dispatchEvent(new CustomEvent('cp_student_profile_updated', { detail: { username } }));
  } catch {}

  addActivityLog(
    `إتمام الاختبار القبلي: أنهى الطالب ${username} الاختبار القبلي وحصد ${score}/${finalMaxScore} درجة (تمت إضافتها للشيت وسجل المتابعة)`,
    username,
    'success'
  );

  return { progress: prog, result };
}

export function getPostTestQuestions(): PreTestQuestion[] {
  try {
    const raw = localStorage.getItem(POSTTEST_QUESTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return ensureMatchingQuestionsIntegrity(parsed);
    }
    // Automatically copy and sync from PreTest questions if PostTest is empty
    const preQuestions = getPreTestQuestions();
    if (preQuestions && preQuestions.length > 0) {
      savePostTestQuestions(preQuestions, false);
      return ensureMatchingQuestionsIntegrity(preQuestions);
    }
    savePostTestQuestions(DEFAULT_PRETEST_QUESTIONS, false);
    return ensureMatchingQuestionsIntegrity(DEFAULT_PRETEST_QUESTIONS);
  } catch {
    return getPreTestQuestions();
  }
}

export function copyPreTestQuestionsToPostTest(): PreTestQuestion[] {
  const pre = getPreTestQuestions();
  const toCopy = pre.length > 0 ? pre : DEFAULT_PRETEST_QUESTIONS;
  savePostTestQuestions(toCopy, true);
  return toCopy;
}

export function savePostTestQuestions(questions: PreTestQuestion[], syncRemote: boolean = true): void {
  localStorage.setItem(POSTTEST_QUESTIONS_KEY, JSON.stringify(questions));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('posttest-questions-updated', { detail: questions }));
  }
  if (syncRemote) {
    syncGlobalQuestionsAndLevels('posttest', questions).catch(() => {});
  }
}

export function resetPostTestQuestionsToDefault(): PreTestQuestion[] {
  savePostTestQuestions(DEFAULT_PRETEST_QUESTIONS, true);
  return DEFAULT_PRETEST_QUESTIONS;
}

export function submitPostTestResult(
  username: string,
  chosenAnswers: Record<string, number>,
  timeSpentSeconds: number
): {
  progress: StudentGameProgress;
  result: PreTestResult;
} {
  const all = getAllStudentsProgress();
  const prog = all[username] || {
    username,
    avatarId: 'avatar-cpbot',
    currentLevel: 1,
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: new Date().toISOString(),
  };

  const questions = getPostTestQuestions();
  let score = 0;
  const questionScores: Record<string, number> = {};
  const questionDetails: Record<string, { chosenIndex: number; isCorrect: boolean; answeredAt: string }> = {};
  const completedAtStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  questions.forEach((q) => {
    const chosen = chosenAnswers[q.id];
    const isCorrect = chosen === q.correctIndex;
    if (isCorrect) {
      score += 1; // 1 point per correct answer
      questionScores[q.id] = 1;
    } else {
      questionScores[q.id] = 0;
    }
    questionDetails[q.id] = {
      chosenIndex: chosen ?? -1,
      isCorrect,
      answeredAt: completedAtStr,
    };
  });

  const maxScore = questions.length > 0 ? questions.length : 53;
  const passed = maxScore === 0 ? true : score >= Math.floor(maxScore * 0.5);

  const result: PreTestResult = {
    completed: true,
    score,
    maxScore,
    answers: chosenAnswers,
    questionScores,
    questionDetails,
    completedAt: completedAtStr,
    timeSpentSeconds,
    passed,
  };

  // For admin user (Read-only mode): do not commit answers, do not save scores, do not modify database
  if (username.trim().toLowerCase() === 'admin') {
    return { progress: prog, result };
  }

  prog.postTestResult = result;
  prog.totalScore += score;
  const badgeName = 'وسام الإتقان والختام (الاختبار البعدي)';
  if (!prog.badges.includes(badgeName)) {
    prog.badges.push(badgeName);
  }
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  all[username] = prog;
  saveAllStudentsProgress(all);
  syncStudentProgressToFirestore(prog).catch(() => {});
  try {
    window.dispatchEvent(new CustomEvent('cp_student_profile_updated', { detail: { username } }));
  } catch {}

  addActivityLog(
    `إتمام الاختبار البعدي: أنهى الطالب ${username} الاختبار البعدي وحصد ${score}/${maxScore} درجة (تمت إضافتها للشيت ومعلنة)`,
    username,
    'success'
  );

  return { progress: prog, result };
}
