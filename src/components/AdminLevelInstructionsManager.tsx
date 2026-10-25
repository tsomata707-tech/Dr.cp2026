import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Edit3,
  Video,
  Image as ImageIcon,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload,
  Play,
  Eye,
  X,
  Sparkles,
  Link2,
} from 'lucide-react';
import {
  getCustomGameLevels,
  saveCustomGameLevels,
  GameLevelDef,
  addMediaToLevel,
  removeMediaFromLevel,
  replaceMediaInLevel,
  updateMediaItemInLevel,
} from '../data/gameLevelsData';
import { LevelMediaItem, LevelQuestion } from '../types';

export const AdminLevelInstructionsManager: React.FC = () => {
  const [levels, setLevels] = useState<GameLevelDef[]>(() => getCustomGameLevels());
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(1);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<LevelMediaItem | null>(null);

  // Hidden inputs for file uploads
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const replaceVideoInputRef = useRef<HTMLInputElement | null>(null);
  const [replacingVideoId, setReplacingVideoId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const replaceImageInputRef = useRef<HTMLInputElement | null>(null);
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);

  // Question editing modal or inline
  const [editingQuestion, setEditingQuestion] = useState<LevelQuestion | null>(null);

  // Active level data
  const currentLevel = levels.find((l) => l.levelNumber === selectedLevelNum) || levels[0];

  // Draft form state for the selected level
  const [titleDraft, setTitleDraft] = useState<string>(currentLevel?.title || '');
  const [shortTitleDraft, setShortTitleDraft] = useState<string>(currentLevel?.shortTitle || '');
  const [storyDraft, setStoryDraft] = useState<string>(currentLevel?.storyMission || '');
  const [instructionsDraft, setInstructionsDraft] = useState<string>(currentLevel?.instructions || '');
  const [activityPromptDraft, setActivityPromptDraft] = useState<string>(currentLevel?.activityPrompt || '');
  const [imagesTitleDraft, setImagesTitleDraft] = useState<string>(currentLevel?.imagesSectionTitle || '');
  const [imagesDescDraft, setImagesDescDraft] = useState<string>(currentLevel?.imagesSectionDesc || '');

  // Update drafts when selectedLevelNum changes
  useEffect(() => {
    if (currentLevel) {
      setTitleDraft(currentLevel.title || '');
      setShortTitleDraft(currentLevel.shortTitle || '');
      setStoryDraft(currentLevel.storyMission || '');
      setInstructionsDraft(currentLevel.instructions || '');
      setActivityPromptDraft(currentLevel.activityPrompt || '');
      setImagesTitleDraft(currentLevel.imagesSectionTitle || '');
      setImagesDescDraft(currentLevel.imagesSectionDesc || '');
    }
  }, [selectedLevelNum, levels]);

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  // Save textual details of level
  const handleSaveLevelDetails = () => {
    const updatedLevels = [...levels];
    const target = updatedLevels.find((l) => l.levelNumber === selectedLevelNum);
    if (!target) return;

    target.title = titleDraft.trim() || target.title;
    target.shortTitle = shortTitleDraft.trim() || target.shortTitle;
    target.storyMission = storyDraft.trim() || target.storyMission;
    target.instructions = instructionsDraft.trim() || target.instructions;
    target.activityPrompt = activityPromptDraft.trim() || target.activityPrompt;
    target.imagesSectionTitle = imagesTitleDraft.trim() || target.imagesSectionTitle;
    target.imagesSectionDesc = imagesDescDraft.trim() || target.imagesSectionDesc;

    saveCustomGameLevels(updatedLevels, true);
    setLevels(updatedLevels);
    showToast(`تم حفظ وتحديث بيانات وأهداف المستوى ${selectedLevelNum} بنجاح!`);
  };

  // Handle Video Upload (Up to 5)
  const handleUploadVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      showError('حجم الفيديو كبير جداً (أكبر من 4.5 ميجابايت). يرجى ضغط الفيديو أو اختيار ملف أصغر حجماً.');
      e.target.value = '';
      return;
    }

    const existingVideos = currentLevel.videos || [];
    if (existingVideos.length >= 5) {
      showError('الحد الأقصى هو 5 فيديوهات لكل مستوى.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const newMedia: LevelMediaItem = {
        id: `vid-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url,
        type: 'video',
        format: file.type || 'video/mp4',
        size: file.size,
        addedAt: new Date().toISOString(),
      };

      try {
        const updated = addMediaToLevel(selectedLevelNum, newMedia);
        setLevels([...updated]);
        showToast(`تم رفع الفيديو (${file.name}) بنجاح للمستوى ${selectedLevelNum}`);
      } catch (err: unknown) {
        showError((err as Error).message || 'فشل رفع الفيديو');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Replace existing video
  const handleReplaceVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingVideoId) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const updatedMedia: LevelMediaItem = {
        id: replacingVideoId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url,
        type: 'video',
        format: file.type || 'video/mp4',
        size: file.size,
        addedAt: new Date().toISOString(),
      };

      const updated = replaceMediaInLevel(selectedLevelNum, replacingVideoId, updatedMedia);
      setLevels([...updated]);
      showToast('تم استبدال الفيديو بنجاح!');
      setReplacingVideoId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Delete Video
  const handleDeleteVideo = (videoId: string) => {
    const updated = removeMediaFromLevel(selectedLevelNum, videoId);
    setLevels([...updated]);
    showToast('تم حذف الفيديو بنجاح');
  };

  // Update Video Part Custom Title / Question Topic
  const handleUpdateVideoCustomTitle = (videoId: string, customTitle: string) => {
    const updated = updateMediaItemInLevel(selectedLevelNum, videoId, {
      partCustomTitle: customTitle.trim() || undefined,
    });
    setLevels([...updated]);
    showToast('تم حفظ مسمى جزء الفيديو حسب السؤال بنجاح ✅');
  };

  // Handle Image or PDF Upload (Up to 5)
  const handleUploadImageOrPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      showError('حجم الملف كبير جداً (أكبر من 4.5 ميجابايت). يرجى اختيار ملف أصغر حجماً.');
      e.target.value = '';
      return;
    }

    const existingImages = currentLevel.images || [];
    if (existingImages.length >= 5) {
      showError('الحد الأقصى هو 5 صور أو ملفات PDF لكل مستوى.');
      e.target.value = '';
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const newMedia: LevelMediaItem = {
        id: `img-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url,
        type: isPdf ? 'pdf' : 'image',
        format: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        size: file.size,
        addedAt: new Date().toISOString(),
      };

      try {
        const updated = addMediaToLevel(selectedLevelNum, newMedia);
        setLevels([...updated]);
        showToast(`تم رفع ${isPdf ? 'ملف الـ PDF' : 'الصورة'} بنجاح!`);
      } catch (err: unknown) {
        showError((err as Error).message || 'فشل رفع الملف');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Replace existing Image or PDF
  const handleReplaceImageOrPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingImageId) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const updatedMedia: LevelMediaItem = {
        id: replacingImageId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url,
        type: isPdf ? 'pdf' : 'image',
        format: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        size: file.size,
        addedAt: new Date().toISOString(),
      };

      const updated = replaceMediaInLevel(selectedLevelNum, replacingImageId, updatedMedia);
      setLevels([...updated]);
      showToast(`تم استبدال ${isPdf ? 'ملف الـ PDF' : 'الصورة'} بنجاح!`);
      setReplacingImageId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Delete Image or PDF
  const handleDeleteImageOrPdf = (mediaId: string) => {
    const updated = removeMediaFromLevel(selectedLevelNum, mediaId);
    setLevels([...updated]);
    showToast('تم حذف الملف بنجاح');
  };

  // Add Question to current level
  const handleAddNewQuestion = () => {
    const newQ: LevelQuestion = {
      id: `q${selectedLevelNum}-${Date.now()}`,
      question: 'نص السؤال الجديد للمستوى...',
      options: ['الخيار الأول', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'],
      correctIndex: 0,
      explanation: 'شرح وتوضيح الإجابة الصحيحة والتغذية الراجعة للمتعلم.',
      points: 33,
      levelNumber: selectedLevelNum,
    };

    const updatedLevels = levels.map((lvl) => {
      if (lvl.levelNumber !== selectedLevelNum) return lvl;
      return {
        ...lvl,
        questions: [...lvl.questions, newQ],
      };
    });

    saveCustomGameLevels(updatedLevels, true);
    setLevels(updatedLevels);
    setEditingQuestion(newQ);
    showToast('تمت إضافة سؤال جديد إلى المستوى بنجاح!');
  };

  // Save edited question
  const handleSaveQuestion = (updatedQ: LevelQuestion) => {
    const updatedLevels = levels.map((lvl) => {
      if (lvl.levelNumber !== selectedLevelNum) return lvl;
      const exists = lvl.questions.some((q) => q.id === updatedQ.id);
      const newQuestions = exists
        ? lvl.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q))
        : [...lvl.questions, updatedQ];
      return {
        ...lvl,
        questions: newQuestions,
      };
    });

    saveCustomGameLevels(updatedLevels, true);
    setLevels(updatedLevels);
    setEditingQuestion(null);
    showToast('تم حفظ تعديلات السؤال بنجاح!');
  };

  // Delete Question
  const handleDeleteQuestion = (qId: string) => {
    const updatedLevels = levels.map((lvl) => {
      if (lvl.levelNumber !== selectedLevelNum) return lvl;
      return {
        ...lvl,
        questions: lvl.questions.filter((q) => q.id !== qId),
      };
    });

    saveCustomGameLevels(updatedLevels, true);
    setLevels(updatedLevels);
    showToast('تم حذف السؤال بنجاح');
  };

  const currentVideos = currentLevel?.videos || [];
  const currentImages = currentLevel?.images || [];
  const currentQuestions = currentLevel?.questions || [];

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif]" dir="rtl">
      {/* Toast notifications */}
      {saveSuccessMsg && (
        <div className="fixed top-24 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-300 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-24 right-6 z-50 px-5 py-3 rounded-2xl bg-red-600 text-white font-black text-sm shadow-[0_0_30px_rgba(239,68,68,0.5)] border-2 border-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*,.mp4,.webm,.mkv,.mov"
        className="hidden"
        onChange={handleUploadVideo}
      />
      <input
        ref={replaceVideoInputRef}
        type="file"
        accept="video/*,.mp4,.webm,.mkv,.mov"
        className="hidden"
        onChange={handleReplaceVideo}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,.pdf,.png,.jpg,.jpeg,.webp,.gif,.svg"
        className="hidden"
        onChange={handleUploadImageOrPdf}
      />
      <input
        ref={replaceImageInputRef}
        type="file"
        accept="image/*,.pdf,.png,.jpg,.jpeg,.webp,.gif,.svg"
        className="hidden"
        onChange={handleReplaceImageOrPdf}
      />

      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#101535] to-slate-900 border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>إدارة المستويات الـ 9 المعتمدة</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal']">
                تعديل الليفل والأهداف والوسائط والأنشطة
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveLevelDetails}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(251,191,36,0.4)] border border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>حفظ تعديلات المستوى {selectedLevelNum}</span>
          </button>
        </div>

        {/* Level Quick Tabs 1 to 9 */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-300 mb-2">
            اختر المستوى للتعديل (1 إلى 9):
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvlNum) => {
              const isSelected = lvlNum === selectedLevelNum;
              return (
                <button
                  key={lvlNum}
                  type="button"
                  onClick={() => setSelectedLevelNum(lvlNum)}
                  className={`py-3 px-2 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-105 ring-2 ring-amber-400'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <span className="text-base sm:text-lg font-mono font-bold">L{lvlNum}</span>
                  <span className="text-[10px] font-normal truncate max-w-full px-1">
                    المستوى {lvlNum}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Level Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Level Title, Content & Story */}
        <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-bold">
            <Edit3 className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
              اسم ومضمون المستوى {selectedLevelNum}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              اسم المستوى الكامل (Level Title):
            </label>
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white font-bold text-sm focus:outline-none transition-colors"
              placeholder="مثال: المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              الاسم المختصر للمستوى (Short Title):
            </label>
            <input
              type="text"
              value={shortTitleDraft}
              onChange={(e) => setShortTitleDraft(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white font-bold text-sm focus:outline-none transition-colors"
              placeholder="مثال: تثبيت البرنامج"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              مضمون ومحتوى وشرح المستوى (Story Mission & Content):
            </label>
            <textarea
              rows={4}
              value={storyDraft}
              onChange={(e) => setStoryDraft(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs leading-relaxed focus:outline-none transition-colors"
              placeholder="اكتب مضمون المستوى والمهمة المعرفية والشرح الخاص بهذا المستوى..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              عنوان ورسالة طلب رفع النشاط للطالب (Activity Prompt):
            </label>
            <textarea
              rows={2}
              value={activityPromptDraft}
              onChange={(e) => setActivityPromptDraft(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs leading-relaxed focus:outline-none transition-colors"
              placeholder="مثال: قم برفع ملف تطبيقك العملي..."
            />
          </div>
        </div>

        {/* Panel 2: Draggable Floating Instructions for Level */}
        <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-cyan-400 font-bold">
            <HelpCircle className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
              أهداف المستوى
            </h3>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed">
            💡 الأهداف المذكورة أدناه تظهر للطالب في القائمة العائمة أثناء اللعب.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              نص أهداف المستوى {selectedLevelNum}:
            </label>
            <textarea
              rows={6}
              value={instructionsDraft}
              onChange={(e) => setInstructionsDraft(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-xs leading-relaxed focus:outline-none transition-colors font-mono"
              placeholder="1. تصفح الفيديوهات والصور التوضيحية...\n2. أجب عن أسئلة المستوى التفاعلية...\n3. ارفع نشاطك الخاص بأسفل الصفحة واضغط إنهاء المستوى..."
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveLevelDetails}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ الأهداف</span>
            </button>
          </div>
        </div>
      </div>

      {/* Videos Section (Up to 5 Videos with replacement and deletion) */}
      <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-purple-400">
            <Video className="w-5 h-5" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
                فيديوهات المستوى {selectedLevelNum}
              </h3>
              <span className="text-xs text-slate-400">
                إمكانية رفع حتى 5 فيديوهات بحد أقصى (يقبل جميع امتدادات الفيديو MP4, WebM, MKV, MOV مع إمكانية التبديل)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 text-xs font-bold font-mono">
              {currentVideos.length} / 5 فيديوهات
            </span>
            <button
              type="button"
              disabled={currentVideos.length >= 5}
              onClick={() => videoInputRef.current?.click()}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition ${
                currentVideos.length >= 5
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>رفع فيديو جديد ➕</span>
            </button>
          </div>
        </div>

        {/* Video Cards Grid */}
        {currentVideos.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-slate-400 text-xs space-y-2">
            <Video className="w-8 h-8 mx-auto text-purple-400/50" />
            <p>لا توجد فيديوهات مرفوعة لهذا المستوى حالياً.</p>
            <p className="text-[11px] text-slate-500">
              اضغط على زر "رفع فيديو جديد" لإضافة حتى 5 مقاطع فيديو تعليمية للمستوى.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentVideos.map((vid, idx) => (
              <div
                key={vid.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                    <span>فيديو {idx + 1}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {vid.format || 'MP4'}
                  </span>
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                  <video
                    src={vid.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    defaultValue={vid.partCustomTitle || ''}
                    onBlur={(e) => handleUpdateVideoCustomTitle(vid.id, e.target.value)}
                    placeholder={vid.title}
                    className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => {
                      setReplacingVideoId(vid.id);
                      replaceVideoInputRef.current?.click();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>تبديل الفيديو</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(vid.id)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 transition cursor-pointer"
                    title="حذف الفيديو"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images & PDF Section (Up to 5 images/PDFs with replacement and deletion) */}
      <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
        {/* Editable Title & Description for Images Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">عنوان قسم الصور والمستندات:</label>
            <input
              type="text"
              value={imagesTitleDraft}
              onChange={(e) => setImagesTitleDraft(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-400 outline-none"
              placeholder={`صور ومستندات المستوى ${selectedLevelNum}`}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">وصف قسم الصور والمستندات:</label>
            <input
              type="text"
              value={imagesDescDraft}
              onChange={(e) => setImagesDescDraft(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-400 outline-none"
              placeholder="إمكانية رفع حتى 5 صور أو ملفات PDF..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <ImageIcon className="w-5 h-5" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
                {imagesTitleDraft || `صور ومستندات المستوى ${selectedLevelNum}`}
              </h3>
              <span className="text-xs text-slate-400">
                {imagesDescDraft || 'إمكانية رفع حتى 5 صور أو ملفات PDF بحد أقصى (يقبل جميع امتدادات الصور PNG, JPG, WebP, GIF, SVG و PDF مع إمكانية التبديل)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold font-mono">
              {currentImages.length} / 5 ملفات
            </span>
            <button
              type="button"
              disabled={currentImages.length >= 5}
              onClick={() => imageInputRef.current?.click()}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition ${
                currentImages.length >= 5
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black shadow-md'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>رفع صورة أو PDF ➕</span>
            </button>
          </div>
        </div>

        {/* Media Cards Grid */}
        {currentImages.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-slate-400 text-xs space-y-2">
            <ImageIcon className="w-8 h-8 mx-auto text-emerald-400/50" />
            <p>لا توجد صور أو مستندات مرفوعة لهذا المستوى حالياً.</p>
            <p className="text-[11px] text-slate-500">
              اضغط على زر "رفع صورة أو PDF" لإضافة حتى 5 ملفات توضيحية للمستوى.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentImages.map((img, idx) => (
              <div
                key={img.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    {img.type === 'pdf' ? (
                      <FileText className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{img.type === 'pdf' ? `مستند PDF (${idx + 1})` : `صورة ${idx + 1}`}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">
                    {img.type === 'pdf' ? 'PDF' : img.format?.split('/')[1] || 'IMG'}
                  </span>
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 p-1">
                  {img.type === 'pdf' ? (
                    <div className="text-center p-3 space-y-1">
                      <FileText className="w-10 h-10 mx-auto text-red-400" />
                      <span className="text-[11px] font-bold text-slate-300 block truncate max-w-[200px]">
                        {img.title}.pdf
                      </span>
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-[10px] text-blue-400 underline"
                      >
                        فتح المستند في نافذة معاينة
                      </a>
                    </div>
                  ) : (
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-contain cursor-zoom-in"
                      onClick={() => setPreviewMedia(img)}
                    />
                  )}
                </div>

                <p className="text-xs font-bold text-white truncate" title={img.title}>
                  {img.title}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => {
                      setReplacingImageId(img.id);
                      replaceImageInputRef.current?.click();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>تبديل الملف</span>
                  </button>

                  {img.type !== 'pdf' && (
                    <button
                      type="button"
                      onClick={() => setPreviewMedia(img)}
                      className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 transition cursor-pointer"
                      title="معاينة مكبرة"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteImageOrPdf(img.id)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 transition cursor-pointer"
                    title="حذف الملف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Level Questions Section */}
      <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] flex items-center gap-2">
              <span className="text-amber-400">❓</span>
              <span>أسئلة وأنشطة المستوى {selectedLevelNum}</span>
            </h3>
            <span className="text-xs text-slate-400">
              إمكانية تعديل نصوص الأسئلة والخيارات، وتحديد الإجابة الصحيحة، وصور السؤال والإجابات
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddNewQuestion}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سؤال جديد في هذا المستوى</span>
          </button>
        </div>

        {/* Questions list */}
        <div className="space-y-3">
          {currentQuestions.map((q, qIdx) => (
            <div
              key={q.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {qIdx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {q.question}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(JSON.parse(JSON.stringify(q)))}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>تعديل السؤال</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 transition cursor-pointer"
                    title="حذف السؤال"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Options pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctIndex;
                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isCorrect && (
                        <span className="text-[10px] text-emerald-400 shrink-0 font-bold">
                          (الإجابة الصحيحة ✔️)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1228] border-2 border-amber-400 rounded-3xl p-6 max-w-2xl w-full text-right shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>تعديل السؤال والخيارات والإجابة الصحيحة</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                نص السؤال:
              </label>
              <textarea
                rows={3}
                value={editingQuestion.question}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, question: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs leading-relaxed focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                خيارات الإجابة (حدد الإجابة الصحيحة بالدائرة):
              </label>
              {editingQuestion.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={editingQuestion.correctIndex === optIdx}
                    onChange={() =>
                      setEditingQuestion({ ...editingQuestion, correctIndex: optIdx })
                    }
                    className="w-4 h-4 text-emerald-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...editingQuestion.options];
                      newOpts[optIdx] = e.target.value;
                      setEditingQuestion({ ...editingQuestion, options: newOpts });
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الشرح والتغذية الراجعة (Explanation):
              </label>
              <textarea
                rows={2}
                value={editingQuestion.explanation}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                صورة أو فيديو توضيحي للسؤال (رابط أو رفع ملف):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingQuestion.imageUrl || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })
                  }
                  placeholder="https://... أو رفع ملف"
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
                <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0">
                  <span>📁 رفع ملف</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 4.5 * 1024 * 1024) {
                        showError('حجم الملف كبير جداً (أكبر من 4.5 ميجابايت).');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setEditingQuestion({ ...editingQuestion, imageUrl: reader.result as string });
                        showToast('تم إرفاق الملف بنجاح بالسؤال');
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {editingQuestion.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setEditingQuestion({ ...editingQuestion, imageUrl: undefined })}
                    className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold"
                  >
                    إزالة
                  </button>
                )}
              </div>
              {editingQuestion.imageUrl && (
                <div className="mt-2 h-24 rounded-xl overflow-hidden border border-slate-700 bg-black/50 p-1 flex items-center justify-center">
                  <img src={editingQuestion.imageUrl} alt="معاينة" className="max-h-full max-w-full object-contain rounded-lg" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleSaveQuestion(editingQuestion)}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md"
              >
                حفظ تعديل السؤال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Zoom Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-950 border-2 border-amber-400 rounded-3xl p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900 text-white cursor-pointer hover:bg-red-900 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center p-4">
              <img
                src={previewMedia.url}
                alt={previewMedia.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
            <p className="text-center text-xs font-bold text-amber-300 pb-2">
              {previewMedia.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
