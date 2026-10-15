import { PreTestQuestion, PreTestResult, StudentGameProgress } from '../types';
import { getAllStudentsProgress, saveAllStudentsProgress } from '../utils/gameStorage';
import { addActivityLog } from '../utils/adminStorage';
import { syncGlobalQuestionsAndLevels } from '../utils/realtimeService';

const PRETEST_QUESTIONS_KEY = 'cp_pretest_questions_bank_v2';
const POSTTEST_QUESTIONS_KEY = 'cp_posttest_questions_bank_v2';

export const DEFAULT_PRETEST_QUESTIONS: PreTestQuestion[] = [
  {
    id: 'pt-1',
    question: 'تعد ..................... نظام رقمي متكامل يجمع بين النصوص والصور الثابتة والمتحركة والصوت والفيديو، مع إتاحة التفاعل بين المستخدم والمحتوى، بما يسهم في تقديم المعلومات بطريقة فعالة تحقق أهداف التعلم.',
    options: [
      'Multimedia (الوسائط المتعددة)',
      'Virtual Reality (الواقع الافتراضي)',
      'Operating System (أنظمة التشغيل)',
      'Artificial Intelligence (الذكاء الاصطناعي)',
    ],
    correctIndex: 0,
    explanation: 'الوسائط المتعددة (Multimedia) هي منظومة رقمية متكاملة تدمج النصوص والصور الثابتة والمتحركة والصوت والفيديو مع التفاعل النشط.',
    points: 50,
  },
  {
    id: 'pt-2',
    question: 'رتب الخطوات الآتية للحصول على نسخة مفعلة من برنامج Adobe Captivate 2019 تعمل بشكل سليم على جهازك:\n(أ. نذهب لمكان الحفظ ونضغط على Setup | ب. نختار اسم البرنامج ثم نضغط Close | ج. النقر مرتين بزر الفأرة على التطبيق | د. اختيار مكان حفظ البرنامج ثم Next)',
    options: [
      'ج ⬅️ أ ⬅️ د ⬅️ ب',
      'أ ⬅️ د ⬅️ ج ⬅️ ب',
      'ب ⬅️ أ ⬅️ د ⬅️ ج',
      'د ⬅️ ج ⬅️ أ ⬅️ ب',
    ],
    correctIndex: 0,
    explanation: 'الترتيب الصحيح لتثبيت وتفعيل البرنامج هو: النقر مرتين على الملف، التوجه لمكان الحفظ والضغط على Setup، تحديد مسار الحفظ والمتابعة، ثم اختيار اسم البرنامج والإغلاق.',
    points: 50,
  },
  {
    id: 'pt-3',
    question: 'يمكن فتح برنامج Adobe Captivate 2019 بالضغط على أيقونة البحث في نظام التشغيل ( )',
    options: [
      'صواب (صح)',
      'خطأ',
      'غير متاح في النظام',
      'لا ينطبق',
    ],
    correctIndex: 0,
    explanation: 'يمكن كتابة اسم البرنامج في مربع أو أيقونة البحث بنظام التشغيل لفتحه مباشرة.',
    points: 50,
  },
  {
    id: 'pt-4',
    question: 'رتب الخطوات التالية لتدعيم اللغة العربية بداخل البرنامج:\n(أ. تفعيل الخيار Requires an Indic composer | ب. قائمة Category | ج. نختار General settings | د. من قائمة Edit نختار Preferences)',
    options: [
      'د ⬅️ ب ⬅️ ج ⬅️ أ (Edit ⬅️ Preferences ⬅️ Category ⬅️ General settings ⬅️ Indic composer)',
      'أ ⬅️ ب ⬅️ ج ⬅️ د',
      'ج ⬅️ د ⬅️ أ ⬅️ ب',
      'ب ⬅️ ج ⬅️ د ⬅️ أ',
    ],
    correctIndex: 0,
    explanation: 'لدعم اللغة العربية نذهب إلى قائمة Edit ثم Preferences ومن Category نختار General settings ثم نفعّل خيار Indic composer.',
    points: 50,
  },
  {
    id: 'pt-5',
    question: 'أي من العناصر التالية يُعد من مكونات الواجهة الرئيسية في برنامج Adobe Captivate 2019:',
    options: [
      'شاشة الترحيب (Welcome Screen)',
      'شريط التنقل السريع (Quick Access Toolbar)',
      'شريط المهام (Taskbar الخاص بالويندوز)',
      'مستكشف الملفات الخارجي (File Explorer)',
    ],
    correctIndex: 0,
    explanation: 'شاشة الترحيب (Welcome Screen) وشريط القوائم وأدوات العمل تمثل الركائز الأساسية لواجهة Adobe Captivate 2019.',
    points: 50,
  },
  {
    id: 'pt-6',
    question: 'تُستخدم قائمة Window لإظهار وإخفاء اللوحات (Panels) وأدوات البرنامج المختلفة ( )',
    options: [
      'صواب (صح)',
      'خطأ',
      'قائمة Window مخصصة لحفظ الملفات فقط',
      'لا توجد قائمة بهذا الاسم',
    ],
    correctIndex: 0,
    explanation: 'قائمة Window تتيح إظهار وإخفاء لوحات التحكم مثل Properties و Timeline و Library.',
    points: 50,
  },
  {
    id: 'pt-7',
    question: 'يتم إنشاء مشروع جديد من قائمة File ( )',
    options: [
      'صواب (صح)',
      'خطأ',
      'فقط من قائمة Edit',
      'فقط من قائمة Help',
    ],
    correctIndex: 0,
    explanation: 'قائمة File تحتوي على أمر إنشاء مشروع جديد (New Project) بمختلف صيغه.',
    points: 50,
  },
  {
    id: 'pt-8',
    question: 'يمكن إنشاء مشروع جديد أو فتح مشروع تم إنشاؤه مسبقاً باستخدام لوحة المفاتيح بالضغط على Ctrl+O ( )',
    options: [
      'خطأ (Ctrl+O لفتح مشروع موجود فقط، بينما الجديد Ctrl+N)',
      'صواب',
      'صواب لكافة المشروعات',
      'لا يمكن استخدام لوحة المفاتيح',
    ],
    correctIndex: 0,
    explanation: 'العبارة خطأ؛ لأن الاختصار Ctrl+O يفتح مشروعاً مسبقاً فقط (Open)، بينما إنشاء مشروع جديد يتم عبر Ctrl+N.',
    points: 50,
  },
  {
    id: 'pt-9',
    question: 'أي العناصر التالية يُستخدم لإضافة شرح أو تعليق على الشريحة:',
    options: [
      'Text Caption (مربع النص التوضيحي)',
      'Text Entry Box',
      'Text Animation',
      'Title Text',
    ],
    correctIndex: 0,
    explanation: 'يُستخدم Text Caption لإضافة نصوص الشرح والتعليقات التوضيحية داخل الشريحة.',
    points: 50,
  },
  {
    id: 'pt-10',
    question: 'رتب الخطوات الآتية لإضافة شكل معين داخل الشريحة:\n(أ. من القائمة المنسدلة اختر Shape | ب. اسحب بمؤشر الفأرة على الشريحة | ج. من شريط القوائم اختر Insert | د. اضغط على قائمة الأشكال واختر الشكل المطلوب)',
    options: [
      'ج ⬅️ أ ⬅️ د ⬅️ ب (Insert ⬅️ Shape ⬅️ اختيار الشكل ⬅️ السحب على الشريحة)',
      'ب ⬅️ أ ⬅️ د ⬅️ ج',
      'أ ⬅️ د ⬅️ ج ⬅️ ب',
      'د ⬅️ ج ⬅️ ب ⬅️ أ',
    ],
    correctIndex: 0,
    explanation: 'الخطوات هي اختيار Insert ثم Shape واختيار الشكل ثم السحب بمؤشر الفأرة على الشريحة لتحديد حجمه ومكانه.',
    points: 50,
  },
  {
    id: 'pt-11',
    question: 'يُستخدم تبويب Record لتسجيل ملف صوتي بشكل مباشر من خلال البرنامج ( )',
    options: [
      'صواب (صح)',
      'خطأ',
      'فقط للاستيراد الخارجي',
      'لا يدعم التسجيل الصوتي',
    ],
    correctIndex: 0,
    explanation: 'تبويب Record يتيح تسجيل التعليق الصوتي للمشروع مباشرة بالميكروفون.',
    points: 50,
  },
  {
    id: 'pt-12',
    question: 'يمكن إضافة ملف فيديو باستخدام شريط القوائم وكذلك شريط الأدوات ( )',
    options: [
      'صواب (صح)',
      'خطأ',
      'فقط من شريط الأدوات',
      'فقط من خلال لوحة المفاتيح',
    ],
    correctIndex: 0,
    explanation: 'إدراج الفيديو متاح عبر شريط القوائم Insert/Media وكذلك من شريط الأدوات العلوي.',
    points: 50,
  },
  {
    id: 'pt-13',
    question: 'نضغط على الأمر Image Slide الموجود بقائمة .... لإضافة الشريحة كصورة:',
    options: [
      'Insert',
      'File',
      'Edit',
      'View',
    ],
    correctIndex: 0,
    explanation: 'يتواجد الأمر Image Slide ضمن قائمة Insert لإدراج شريحة على هيئة صورة كاملة.',
    points: 50,
  },
  {
    id: 'pt-14',
    question: 'أي من الأدوات التالية يُمكّنك من تنفيذ إجراء معين (Action) عند تفاعل المتعلم معها:',
    options: [
      'الأزرار (Buttons)',
      'مربعات النص التوضيحية (Text Captions)',
      'مربعات العنوان (Title Boxes)',
      'الصور الثابتة (Static Images)',
    ],
    correctIndex: 0,
    explanation: 'الأزرار التفاعلية ومربعات النقر هي الأدوات التي تستجيب لنقر المتعلم وتنفذ إجراءات مثل الانتقال وتشغيل الأصوات.',
    points: 50,
  },
  {
    id: 'pt-15',
    question: 'لترتيب العناصر والكائنات المتواجدة على الشريحة يمكننا النقر على الأمر:',
    options: [
      'Arrange (ترتيب الطبقات)',
      'Duplicate',
      'Delete',
      'Align',
    ],
    correctIndex: 0,
    explanation: 'أمر Arrange يتحكم في ترتيب مستويات الكائنات (إحضار إلى المقدمة، إرسال إلى الخلف).',
    points: 50,
  },
  {
    id: 'pt-16',
    question: 'نضغط على Ctrl+D من لوحة المفاتيح لحذف عنصر أو كائن بعد تحديده ( )',
    options: [
      'خطأ (Ctrl+D للتكرار والمطابقة Duplicate، بينما الحذف مفتاح Delete)',
      'صواب',
      'صواب في جميع الشاشات',
      'يقوم بإخفاء الكائن مؤقتاً',
    ],
    correctIndex: 0,
    explanation: 'العبارة خطأ؛ لأن Ctrl+D يكرر الكائن (Duplicate)، بينما الحذف يتم بمفتاح Delete.',
    points: 50,
  },
  {
    id: 'pt-17',
    question: 'لعمل مطابقة وتكرار للشريحة نضغط على قائمة Edit ثم نختار الأمر:',
    options: [
      'Duplicate',
      'Delete',
      'Align',
      'Arrange',
    ],
    correctIndex: 0,
    explanation: 'الأمر Duplicate في قائمة Edit مخصص لمطابقة وتكرار الشريحة المحددة.',
    points: 50,
  },
  {
    id: 'pt-18',
    question: 'يُستخدم الأمر ...... لتحديد صلاحية التعامل مع العناصر والكائنات للحفاظ عليها ومنع تعديلها بالخطأ:',
    options: [
      'Lock (قفل الكائن)',
      'Distribution',
      'Align',
      'Arrange',
    ],
    correctIndex: 0,
    explanation: 'أمر Lock يقوم بقفل الكائن لمنع تحريكه أو العبث به أثناء تصميم بقية العناصر.',
    points: 50,
  },
  {
    id: 'pt-19',
    question: 'يمكن إضافة خلفية للشريحة عن طريق السحب والإفلات Drag and Drop ( )',
    options: [
      'صواب (صح)',
      'خطأ',
      'غير مدعوم في كابتيفايت',
      'فقط عبر نافذة الأوامر البرمجية',
    ],
    correctIndex: 0,
    explanation: 'السحب والإفلات للصورة مباشرة فوق الشريحة يتيح تعيينها كخلفية بكل سلاسة.',
    points: 50,
  },
  {
    id: 'pt-20',
    question: 'يمكن إدراج سؤال اختيار من متعدد من قائمة:',
    options: [
      'Quiz (قائمة الاختبارات)',
      'Edit',
      'View',
      'Insert (تعتمد قائمة Quiz المتخصصة)',
    ],
    correctIndex: 0,
    explanation: 'قائمة Quiz هي القائمة المخصصة لإدراج شرائح الأسئلة والاختبارات التفاعلية.',
    points: 50,
  },
  {
    id: 'pt-21',
    question: 'أي مما يلي يُعد من أنواع الأسئلة التي يمكن إنشاؤها داخل برنامج Adobe Captivate 2019:',
    options: [
      'جميع ما سبق (Multiple Choice, True/False, Matching, Fill-in-blank)',
      'Multiple Choice فقط',
      'True/False فقط',
      'Matching فقط',
    ],
    correctIndex: 0,
    explanation: 'يوفر Adobe Captivate حزمة متنوعة تشمل الاختيار من متعدد، الصواب والخطأ، المطابقة، وملء الفراغات.',
    points: 50,
  },
  {
    id: 'pt-22',
    question: 'ما هي التقنية التي تجعل محتوى التعلم متجاوباً ومتوافقاً مع الهواتف والأجهزة اللوحية دون تداخل العناصر؟',
    options: [
      'Fluid Boxes والتصميم المتجاوب Responsive Design',
      'تصدير الشريحة كملف نصي Word',
      'تحويل المشروع إلى ملف صوتي خام',
      'إلغاء الشرائح التفاعلية',
    ],
    correctIndex: 0,
    explanation: 'ميزة Fluid Boxes تنظم العناصر في شبكة متجاوبة تتكيف تلقائياً مع حجم أي شاشة.',
    points: 50,
  },
  {
    id: 'pt-23',
    question: 'ما هو المعيار العالمي الأبرز لتصدير حزم المحتوى الإلكتروني وتتبع درجات ونسب إكمال الطلاب عبر أنظمة LMS؟',
    options: [
      'معيار SCORM / xAPI بحزمة HTML5 تفاعلية',
      'ملف نصي TXT بدون شفرة تفاعلية',
      'صورة ثابتة PNG',
      'ملف فيديو صامت بدون تحكم',
    ],
    correctIndex: 0,
    explanation: 'معايير SCORM و xAPI تتيح لأنظمة إدارة التعلم تتبع درجات الطلاب وإجاباتهم وزمن التعلم بدقة.',
    points: 50,
  },
  {
    id: 'pt-24',
    question: 'ما فائدة استخدام المتغيرات (Variables) والإجراءات المتقدمة (Advanced Actions) في كابتيفايت؟',
    options: [
      'برمجة مسارات تفاعلية متفرعة وحساب الدرجات وتقديم تغذية راجعة شرطية مخصصة',
      'تغيير إعدادات الطابعة المكتبية فقط',
      'حذف سجلات نظام ويندوز',
      'ضغط الملفات الصوتية دون معالجة',
    ],
    correctIndex: 0,
    explanation: 'المتغيرات والإجراءات المتقدمة تمنح المطور القدرة على برمجة شروط (If... Else) وبناء تجارب تعلم تفرعية ذكية.',
    points: 50,
  },
  {
    id: 'pt-25',
    question: 'في المخطط الزمني (Timeline) لبرنامج Adobe Captivate، كيف يؤثر ترتيب الطبقات على ظهور العناصر على الشريحة؟',
    options: [
      'العنصر في الطبقة العليا يظهر أمام العناصر في الطبقات التي تليه أسفل منه',
      'ترتيب الطبقات لا يؤثر إطلاقاً على تداخل العناصر',
      'الطبقات السفلية تظهر دائماً في المقدمة',
      'البرنامج يدمج جميع الطبقات في طبقة واحدة عشوائية',
    ],
    correctIndex: 0,
    explanation: 'العنصر الموجود في أعلى طبقات الـ Timeline يظهر في المقدمة البصرية على مساحة العمل.',
    points: 50,
  },
  {
    id: 'pt-26',
    question: 'ما الفرق الجوهري بين زر الإجراء (Button) ومربع النقر الشفاف (Click Box) في Captivate؟',
    options: [
      'الـ Click Box كائن شفاف غير مرئي يستخدم لتحديد مساحة نقر تفاعلية فوق الصور أو مقاطع الفيديو',
      'الـ Button لا يقبل تنفيذ أي إجراء تفاعلي',
      'الـ Click Box يظهر كزر رمادي بارز دائماً للمتعلم',
      'كلاهما يؤدي نفس التصميم دون أي اختلاف في الشفافية أو التخصيص',
    ],
    correctIndex: 0,
    explanation: 'مربع النقر (Click Box) هو مساحة تفاعلية غير مرئية توضع فوق أجزاء معينة لتنشيط استجابة المتعلم عند النقر عليها.',
    points: 50,
  },
  {
    id: 'pt-27',
    question: 'ما هو الكائن التفاعلي المستخدم لاستقبال مدخلات نصية ورقمية يكتبها الطالب والتحقق من صحتها؟',
    options: [
      'Text Entry Box (مربع إدخال النص)',
      'Smart Shape (الأشكال الذكية)',
      'Web Object (كائن الويب)',
      'Rollover Caption (التلميح المنبثق)',
    ],
    correctIndex: 0,
    explanation: 'يستخدم مربع إدخال النص (Text Entry Box - TEB) لالتقاط إجابات وكتابات المتعلم ومقارنتها بقيم صحيحة مبرمجة.',
    points: 50,
  },
  {
    id: 'pt-28',
    question: 'ما هي الصيغة المفضلة لإدراج مقاطع الفيديو التفاعلية المتوافقة عالمياً مع معايير HTML5 داخل المشروع؟',
    options: [
      'MP4 (H.264 Video)',
      'WMV القديمة',
      'AVI غير المضغوطة',
      'FLV غير المتوافقة مع المتصفحات الحديثة',
    ],
    correctIndex: 0,
    explanation: 'صيغة MP4 المشفرة بمعيار H.264 هي المعيار القياسي المتوافق مع جميع متصفحات الويب والأجهزة الذكية في بيئة HTML5.',
    points: 50,
  },
  {
    id: 'pt-29',
    question: 'تُستخدم ميزة (Closed Captioning - CC) في برنامج Adobe Captivate بهدف:',
    options: [
      'عرض نصوص مكتوبة متزامنة مع الصوت لمساعدة ذوي الإعاقة السمعية وتعزيز الاستيعاب',
      'إغلاق البرنامج تلقائياً بعد انتهاء الشريحة',
      'حجب عناصر الشريحة بكلمة سر',
      'تقليل حجم الصور النقطية',
    ],
    correctIndex: 0,
    explanation: 'ميزة التعليقات التوضيحية المغلقة (Closed Captioning) تقدم نصاً مكتوباً متزامناً مع التعليق الصوتي لسهولة النفاذ والإتاحة الرقمية.',
    points: 50,
  },
  {
    id: 'pt-30',
    question: 'ما الوظيفة الأساسية للشريحة الرئيسية (Master Slide) في مشاريع Captivate 2019؟',
    options: [
      'توحيد التصميم والخلفيات والشعارات والعناصر المتكررة على كافة شرائح المشروع التابعة لها',
      'عرض تقرير الدرجات النهائي فقط',
      'تشغيل المؤثرات الصوتية للشريحة الأولى فقط',
      'إنهاء جلسة الاختبار فورياً',
    ],
    correctIndex: 0,
    explanation: 'تحدد الـ Master Slide التخطيط العام والألوان والشعارات والعناصر المشتركة لتوريثها لجميع الشرائح التابعة لها.',
    points: 50,
  },
  {
    id: 'pt-31',
    question: 'تعتمد تقنية (Fluid Boxes) في Adobe Captivate 2019 على تنظيم محتوى الشريحة التجاوبية من خلال:',
    options: [
      'حاويات تخطيط ذكية تتدفق وتعيد ترتيب وتغيير أحجام العناصر تلقائياً بحسب حجم شاشة الجهاز',
      'تجميد أبعاد العناصر بأحجام ثابتة غير قابلة للتغيير',
      'تحويل نصوص الشريحة إلى صور ثابتة غير قابلة للتكبير',
      'حذف العناصر الزائدة عند فتح المشروع على الهاتف',
    ],
    correctIndex: 0,
    explanation: 'تقنية الصناديق الانسيابية (Fluid Boxes) تضمن تجاوب العناصر وتدفقها السلس رأسياً وأفقياً على مختلف مقاسات الشاشات.',
    points: 50,
  },
  {
    id: 'pt-32',
    question: 'في سؤال البقعة الساخنة (Hotspot Question)، كيف يُجيب الطالب على السؤال بشكل صحيح؟',
    options: [
      'بالنقر المباشر على منطقة محددة ومبرمجة سلفاً داخل الصورة المعروضة',
      'بكتابة نص طويل في مربع الحوار',
      'بسحب عنصر نصي إلى سلة المحذوفات',
      'بالضغط على زر الخروج من الشريحة',
    ],
    correctIndex: 0,
    explanation: 'سؤال الـ Hotspot يطلب من المتعلم النقر بالفأرة أو اللمس فوق موضع أو منطقة جغرافية أو عضو محدد داخل الصورة.',
    points: 50,
  },
  {
    id: 'pt-33',
    question: 'ما هو نمط السؤال التفاعلي الذي يطلب من الطالب إعادة ترتيب مجموعة من العناصر أو الخطوات تسلسلياً؟',
    options: [
      'Sequence Question (سؤال الترتيب والتسلسل)',
      'True/False (صح وخطأ)',
      'Fill in the Blanks (أكمل الفراغ)',
      'Likert Scale (مقياس ليكرت)',
    ],
    correctIndex: 0,
    explanation: 'سؤال الـ Sequence يختبر قدرة المتعلم على ترتيب الخطوات الإجرائية أو الزمنية بالترتيب الصحيح.',
    points: 50,
  },
  {
    id: 'pt-34',
    question: 'في سؤال المزاوجة والتوصيل (Matching Question)، يعتمد التفاعل الأساسي للطالب على:',
    options: [
      'ربط كل عنصر من العمود الأول بالعنصر المناسب له والمكمل له في العمود الثاني',
      'تحديد خيار واحد فقط بين أربعة بدائل',
      'تسجيل صوته عبر الميكروفون',
      'تحريك الشريحة للأمام والخلف',
    ],
    correctIndex: 0,
    explanation: 'سؤال المزاوجة (Matching) يقوم على المواءمة والربط بين قائمتين من المفاهيم أو التعريفات المتقابلة.',
    points: 50,
  },
  {
    id: 'pt-35',
    question: 'أي مما يلي يمثل متغيراً من متغيرات المستخدم (User Variables) في Captivate؟',
    options: [
      'متغير مخصص ينشئه المصمم لتخزين اسم الطالب أو اختياره أو مجموع نقاطه في نشاط معين',
      'متغير نظام للقراءة فقط مثل تاريخ اليوم الحالي',
      'خاصية ثابته لا يمكن تعديل قيمتها أثناء التشغيل',
      'ملف فيديو مدمج في المشروع',
    ],
    correctIndex: 0,
    explanation: 'متغير المستخدم ينشئه المطور لتخزين بيانات ديناميكية كاسم الطالب أو نتيجته واستخدامها عبر شرائح المشروع.',
    points: 50,
  },
  {
    id: 'pt-36',
    question: 'المتغير النظامي (cpQuizInfoPointsscored) في Adobe Captivate يُستخدم لـ:',
    options: [
      'تخزين إجمالي النقاط والدرجات الفعلية التي أحرزها الطالب في أسئلة الاختبار',
      'تغيير سرعة دوران مؤشر الفأرة',
      'حساب زمن بقاء الحاسوب متصلاً بالكهرباء',
      'عرض رقم إصدار نظام ويندوز',
    ],
    correctIndex: 0,
    explanation: 'متغير النظام cpQuizInfoPointsscored هو متغير مدمج يحمل القيمة الرقمية للنقاط التي حصدها المتعلم حتى اللحظة.',
    points: 50,
  },
  {
    id: 'pt-37',
    question: 'تتيح الإجراءات المتقدمة المشروطة (Conditional Advanced Actions) للمطور التعليمي:',
    options: [
      'تنفيذ أوامر بناءً على شرط محدد (إذا كان س أكبر من ص افعل كذا وإلا افعل كذا)',
      'تغيير لغة لوحة المفاتيح أثناء العرض',
      'حذف أسئلة الاختبار عشوائياً',
      'تشغيل البرنامج بدون اتصال بالإنترنت فقط',
    ],
    correctIndex: 0,
    explanation: 'الإجراءات المشروطة تمكّن المصمم من بناء خوارزميات منطقية (If... Else) توفر تفرعات وتغذية راجعة ذكية متكيفة.',
    points: 50,
  },
  {
    id: 'pt-38',
    question: 'عند بناء سيناريو تعليمي تفرعي (Branching Scenario)، ما الإجراء المناسب إذا حصل الطالب على درجة متدنية في الاختبار التكويني؟',
    options: [
      'توجيهه تلقائياً إلى شريحة مراجعة وشرح إضافي قبل إعادة المحاولة',
      'إنهاء البرنامج وإيقاف تشغيل الجهاز',
      'نقله مباشرة إلى شريحة شهادة التخرج',
      'تجاهل نتيجته وإخفاء الشاشة',
    ],
    correctIndex: 0,
    explanation: 'التفرع التعليمي الذكي يوجه المتعلم الضعيف لمسار استدراكي تعزيزي وفق درجاته لضمان الإتقان.',
    points: 50,
  },
  {
    id: 'pt-39',
    question: 'عند استيراد عرض تقديمي من PowerPoint (.pptx) إلى Adobe Captivate، ما الخيار الأفضل للحفاظ على التفاعلية المستقبلية؟',
    options: [
      'استيراد الشرائح وربطها أو تحويل كائناتها لتعديلها بحرية داخل Captivate',
      'تحويل كافة الشرائح إلى صور ثابتة غير قابلة للنقر',
      'حذف جميع النصوص والأشكال التلقائية',
      'تصدير العرض كملف صوتي فقط',
    ],
    correctIndex: 0,
    explanation: 'يتيح Captivate استيراد شرائح PowerPoint وتحويل كائناتها لعناصر قابلة للتفاعل وإضافة أزرار وأسئلة فوقها.',
    points: 50,
  },
  {
    id: 'pt-40',
    question: 'في نمط محاكاة العرض التوضيحي (Demo Mode)، كيف يتعلم الطالب خطوات استخدام البرنامج؟',
    options: [
      'بمشاهدة عرض آلي تسجيلي يشرح الخطوات وحركة الفأرة تلقائياً دون مطالبته بالنقر',
      'بمطالبته بإدخال كافة الأوامر بمفرده وإلا يفشل',
      'بحذف خطوات الشرح والاعتماد على التخمين',
      'بإجراء مكالمة مرئية مع المعلم',
    ],
    correctIndex: 0,
    explanation: 'نمط العرض (Demo Mode) هو محاكاة بصرية تلقائية توضح للمتعلم خطوات العمل مع شروح نصية وحركة مؤشر موجهة.',
    points: 50,
  },
  {
    id: 'pt-41',
    question: 'في نمط محاكاة التدريب الموجه (Training Mode)، ماذا يحدث إذا ضغط الطالب في مكان غير صحيح؟',
    options: [
      'تظهر له تلميحات إرشادية وتغذية راجعة فورية توضح موضع النقر الصحيح دون احتساب رسوب',
      'يتم إغلاق التطبيق فورياً',
      'تُخصم جميع درجاته في المقرر',
      'ينتقل مباشرة إلى الشريحة الأخيرة',
    ],
    correctIndex: 0,
    explanation: 'نمط التدريب (Training Mode) يتيح للطالب الممارسة بنفسه مع تقديم تلميحات وتغذية راجعة تصحيحية عند الخطأ.',
    points: 50,
  },
  {
    id: 'pt-42',
    question: 'ما الذي يميز نمط محاكاة التقييم والاختبار (Assessment Mode) عن نمطي العرض والتدريب؟',
    options: [
      'يختبر الطالب في بيئة محاكاة واقعية بدون تلميحات مساعدة ويحسب الدرجات في سجل الإنجاز',
      'يعرض الإجابات الصحيحة مسبقاً بشكل ملون',
      'لا يسمح للطالب بتحريك الفأرة',
      'يسمح بمشاهدة مقطع الفيديو دون حل مهام',
    ],
    correctIndex: 0,
    explanation: 'نمط التقييم (Assessment Mode) يختبر تمكن الطالب الفعلي من المهارة دون إرشادات ويصدر درجة تقييمية للأدمن.',
    points: 50,
  },
  {
    id: 'pt-43',
    question: 'ما الغرض من شريحة مراجعة نتائج الاختبار (Quiz Results Slide) في نهاية كويز Captivate؟',
    options: [
      'عرض تقرير تفصيلي بالدرجة المحرزة، النسبة المئوية، حالة النجاح أو الرسوب، وزر مراجعة الأسئلة',
      'إعادة تعيين إعدادات الشاشة للشكل الأصلي',
      'تغيير كلمة مرور المشرف',
      'حذف سجل درجات الطلاب السابقة',
    ],
    correctIndex: 0,
    explanation: 'شريحة النتائج تعرض ملخصاً دقيقاً لدرجة الطالب والنسبة المئوية وزر (Review Quiz) لمراجعة الإجابات.',
    points: 50,
  },
  {
    id: 'pt-44',
    question: 'أين يتم تحديد نسبة النجاح المطلوبة لاجتياز الاختبار (Passing Score %) في Captivate؟',
    options: [
      'من نافذة إعدادات الاختبار (Quiz Preferences) تحت بند Pass/Fail',
      'من لوحة إدارة الخطوط والألوان في الويندوز',
      'من إعدادات ميكروفون الحاسوب',
      'من قائمة مساعدة البرنامج (Help)',
    ],
    correctIndex: 0,
    explanation: 'في نافذة Quiz Preferences يحدد المصمم نسبة النجاح (مثلاً 50% أو 80%) وما يحدث للطالب عند النجاح أو الرسوب.',
    points: 50,
  },
  {
    id: 'pt-45',
    question: 'لتصدير حزمة متوافقة مع أنظمة إدارة التعلم الإلكتروني (LMS) كـ Moodle أو Blackboard، يجب تفعيل معيار:',
    options: [
      'SCORM 1.2 أو SCORM 2004 مع تفعيل تقارير التعلم (Reporting)',
      'MP3 Audio File',
      'PDF Document',
      'Word Document (.docx)',
    ],
    correctIndex: 0,
    explanation: 'معيار SCORM هو المعيار العالمي المعتمد لحزم التعلم الإلكتروني القابلة للتشغيل وتتبع درجات الطلاب داخل منصات الـ LMS.',
    points: 50,
  },
  {
    id: 'pt-46',
    question: 'ما الميزة الإضافية التي يقدمها معيار SCORM 2004 مقارنة بمعيار SCORM 1.2؟',
    options: [
      'دعم التسلسل والتفرع المتقدم (Sequencing and Navigation) وتخزين بيانات تتبع أكثر تفصيلاً',
      'تشغيل الملفات بدون شاشة عرض',
      'حظر استخدام الصور الملونة',
      'دعم ملفات الفلاش القديمة فقط',
    ],
    correctIndex: 0,
    explanation: 'يوفر SCORM 2004 ميزات إدارة مسارات التتابع والتفرع المشروط (Sequencing & Navigation) وتخزين أكبر للاستجابات.',
    points: 50,
  },
  {
    id: 'pt-47',
    question: 'عند نشر المشروع النهائي (Publish)، لماذا يُفضل النشر بصيغة HTML5؟',
    options: [
      'لضمان عمل المحتوى على جميع المتصفحات الحديثة، الهواتف الذكية، والأجهزة اللوحية دون الحاجة لمشغلات إضافية',
      'لأنها تعمل فقط على نظام ويندوز إكس بي',
      'لأنها تلغي التفاعل بالكامل وتجعل المحتوى ثابتاً',
      'لتقليل دقة العرض إلى النصف',
    ],
    correctIndex: 0,
    explanation: 'صيغة HTML5 هي المعيار الويب القياسي المفتوح والمتوافق مع جميع الهواتف الذكية والأجهزة اللوحية والحواسيب.',
    points: 50,
  },
  {
    id: 'pt-48',
    question: 'ما هي الأداة المتاحة في Captivate 2019 لاختبار ومعاينة مظهر المحتوى التجاوبي على شاشات الهواتف والحواسيب قبل النشر؟',
    options: [
      'شريط معاينة الأجهزة المتعددة (Responsive Preview Slider / Device View)',
      'برنامج الرسام في الويندوز',
      'لوحة المفاتيح الافتراضية',
      'نافذة إعدادات الطابعة',
    ],
    correctIndex: 0,
    explanation: 'أداة Device View تتيح للمصمم رؤية مشروعه كما سيظهر تماماً على شاشات الآيفون، الآيباد، وشاشات سطح المكتب.',
    points: 50,
  },
  {
    id: 'pt-49',
    question: 'كيف يمكن توظيف شرائح الواقع الافتراضي 360 (360 VR Slides) في Adobe Captivate 2019 لتعزيز الانغماس؟',
    options: [
      'بإدراج صور أو فيديوهات 360 درجة وإضافة نقاط ساخنة تفاعلية (Hotspots) وأسئلة داخل البيئة المكانية',
      'بتحويل الشاشة إلى لون رمادي صامت',
      'بعرض نصوص مسطحة دون تفاعل بصري',
      'بحذف المؤثرات الصوتية للشريحة',
    ],
    correctIndex: 0,
    explanation: 'تتيح شرائح 360 VR استكشاف بيئات افتراضية بانورامية والتفاعل مع نقاط ساخنة وأسئلة داخل المشهد بزاوية 360 درجة.',
    points: 50,
  },
  {
    id: 'pt-50',
    question: 'تتيح ميزة الفيديو التفاعلي (Interactive Video) في Adobe Captivate 2019 للمصمم التعليمي:',
    options: [
      'إيقاف تشغيل الفيديو عند نقاط زمنية محددة وعرض أسئلة تفاعلية وبطاقات معلومات فوق الشاشة',
      'تسريع الصوت لدرجة غير مفهومة',
      'حذف مسار الصوت من الفيديو نهائياً',
      'منع الطالب من التفاعل مع أي زر في الفيديو',
    ],
    correctIndex: 0,
    explanation: 'ميزة Interactive Video تُمكّن من وضع تراكيب تفاعلية (Interactive Overlays) وأسئلة تظهر فوق مقطع الفيديو في أزمنة محددة.',
    points: 50,
  },
];

export function getPreTestQuestions(): PreTestQuestion[] {
  try {
    const raw = localStorage.getItem(PRETEST_QUESTIONS_KEY);
    if (!raw) {
      savePreTestQuestions(DEFAULT_PRETEST_QUESTIONS);
      return DEFAULT_PRETEST_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      savePreTestQuestions(DEFAULT_PRETEST_QUESTIONS);
      return DEFAULT_PRETEST_QUESTIONS;
    }
    return parsed;
  } catch {
    return DEFAULT_PRETEST_QUESTIONS;
  }
}

export function savePreTestQuestions(questions: PreTestQuestion[], syncRemote: boolean = true): void {
  try {
    localStorage.setItem(PRETEST_QUESTIONS_KEY, JSON.stringify(questions));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pretest-questions-updated', { detail: questions }));
    }
  } catch (e) {
    console.warn('localStorage savePreTestQuestions error:', e);
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

  questions.forEach((q) => {
    maxScore += q.points;
    if (chosenAnswers[q.id] === q.correctIndex) {
      score += q.points;
    }
  });

  const passed = score >= Math.floor(maxScore * 0.4);

  // Result stored for Admin, but score hidden from the student!
  const result: PreTestResult = {
    completed: true,
    score,
    maxScore,
    answers: chosenAnswers,
    completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    timeSpentSeconds,
    passed,
  };

  prog.preTestResult = result;
  // NOTE: Pre-test score is NOT added to student totalScore so student cannot deduce their score!
  const badgeName = 'وسام المستكشف التمهيدي (الاختبار القبلي)';
  if (!prog.badges.includes(badgeName)) {
    prog.badges.push(badgeName);
  }
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  all[username] = prog;
  saveAllStudentsProgress(all);

  addActivityLog(
    `إتمام الاختبار القبلي: أنهى الطالب ${username} الاختبار القبلي وحصد ${score}/${maxScore} نقطة (محفوظ للأدمن فقط)`,
    username,
    'success'
  );

  return { progress: prog, result };
}

export function getPostTestQuestions(): PreTestQuestion[] {
  try {
    const raw = localStorage.getItem(POSTTEST_QUESTIONS_KEY);
    if (!raw) {
      savePostTestQuestions(DEFAULT_PRETEST_QUESTIONS, false);
      return DEFAULT_PRETEST_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      savePostTestQuestions(DEFAULT_PRETEST_QUESTIONS, false);
      return DEFAULT_PRETEST_QUESTIONS;
    }
    return parsed;
  } catch {
    return DEFAULT_PRETEST_QUESTIONS;
  }
}

export function savePostTestQuestions(questions: PreTestQuestion[], syncRemote: boolean = true): void {
  try {
    localStorage.setItem(POSTTEST_QUESTIONS_KEY, JSON.stringify(questions));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('posttest-questions-updated', { detail: questions }));
    }
  } catch (e) {
    console.warn('localStorage savePostTestQuestions error:', e);
  }
  if (syncRemote) {
    syncGlobalQuestionsAndLevels('posttest', questions).catch(() => {});
  }
}

export function resetPostTestQuestionsToDefault(): PreTestQuestion[] {
  savePostTestQuestions(DEFAULT_PRETEST_QUESTIONS);
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
  let maxScore = 0;

  questions.forEach((q) => {
    maxScore += q.points;
    if (chosenAnswers[q.id] === q.correctIndex) {
      score += q.points;
    }
  });

  const passed = score >= Math.floor(maxScore * 0.5);

  const result: PreTestResult = {
    completed: true,
    score,
    maxScore,
    answers: chosenAnswers,
    completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    timeSpentSeconds,
    passed,
  };

  prog.postTestResult = result;
  // In Post-test, the student DOES know their score, and score is credited!
  prog.totalScore += score;
  const badgeName = 'وسام الإتقان والختام (الاختبار البعدي)';
  if (!prog.badges.includes(badgeName)) {
    prog.badges.push(badgeName);
  }
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  all[username] = prog;
  saveAllStudentsProgress(all);

  addActivityLog(
    `إتمام الاختبار البعدي: أنهى الطالب ${username} الاختبار البعدي وحصد ${score}/${maxScore} نقطة (معلن للطالب)`,
    username,
    'success'
  );

  return { progress: prog, result };
}
