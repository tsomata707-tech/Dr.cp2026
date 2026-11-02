import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Edit3,
  Video,
  Image as ImageIcon,
  FileText,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Sparkles,
  Link2,
  Plus,
  Eye,
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
import { normalizeVideoUrl } from '../utils/videoStorage';

export const AdminLevelInstructionsManager: React.FC = () => {
  const [levels, setLevels] = useState<GameLevelDef[]>(() => getCustomGameLevels());
  
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (Array.isArray(e.detail)) {
        setLevels(e.detail);
      }
    };
    window.addEventListener('game-levels-updated', handleUpdate);
    return () => window.removeEventListener('game-levels-updated', handleUpdate);
  }, []);

  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(1);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<LevelMediaItem | null>(null);

  // External Video URL Modal state
  const [showVideoUrlModal, setShowVideoUrlModal] = useState<boolean>(false);
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [videoTitleInput, setVideoTitleInput] = useState<string>('');
  const [editingVideoUrlId, setEditingVideoUrlId] = useState<string | null>(null);

  // External Image/PDF URL Modal state
  const [showImageUrlModal, setShowImageUrlModal] = useState<boolean>(false);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [imageTitleInput, setImageTitleInput] = useState<string>('');
  const [imageTypeInput, setImageTypeInput] = useState<'image' | 'pdf'>('image');
  const [editingImageUrlId, setEditingImageUrlId] = useState<string | null>(null);

  const currentLevel = levels.find((l) => l.levelNumber === selectedLevelNum) || levels[0];

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  const openAddVideoUrlModal = () => {
    const currentVids = currentLevel?.videos || [];
    if (currentVids.length >= 5) {
      showError('الحد الأقصى هو 5 فيديوهات لكل مستوى.');
      return;
    }
    setEditingVideoUrlId(null);
    setVideoUrlInput('');
    setVideoTitleInput(`فيديو ${currentVids.length + 1}`);
    setShowVideoUrlModal(true);
  };

  const openReplaceVideoUrlModal = (video: LevelMediaItem) => {
    setEditingVideoUrlId(video.id);
    setVideoUrlInput(video.url || '');
    setVideoTitleInput(video.partCustomTitle || video.title || '');
    setShowVideoUrlModal(true);
  };

  const handleSaveVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput.trim()) {
      showError('يرجى إدخال رابط الفيديو.');
      return;
    }

    const rawUrl = videoUrlInput.trim();
    const cleanUrl = normalizeVideoUrl(rawUrl);
    const cleanTitle = videoTitleInput.trim() || `فيديو ${currentLevel?.videos?.length || 1}`;
    const isYt = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');

    if (editingVideoUrlId) {
      const updatedMedia: LevelMediaItem = {
        id: editingVideoUrlId,
        title: cleanTitle,
        partCustomTitle: cleanTitle,
        url: cleanUrl,
        type: 'video',
        format: isYt ? 'YouTube' : 'MP4/WebM',
        size: 0,
        addedAt: new Date().toISOString(),
      };
      const updated = replaceMediaInLevel(selectedLevelNum, editingVideoUrlId, updatedMedia);
      setLevels([...updated]);
      showToast('✅ تم استبدال فيديو المستوى عبر الرابط بنجاح!');
    } else {
      const videoId = `vid-url-${Date.now()}`;
      const newMedia: LevelMediaItem = {
        id: videoId,
        title: cleanTitle,
        partCustomTitle: cleanTitle,
        url: cleanUrl,
        type: 'video',
        format: isYt ? 'YouTube' : 'MP4/WebM',
        size: 0,
        addedAt: new Date().toISOString(),
      };
      const updated = addMediaToLevel(selectedLevelNum, newMedia);
      setLevels([...updated]);
      showToast('✅ تم إدراج فيديو جديد للمستوى عبر الرابط بنجاح!');
    }

    setShowVideoUrlModal(false);
    setVideoUrlInput('');
    setVideoTitleInput('');
    setEditingVideoUrlId(null);
  };

  const openAddImageUrlModal = () => {
    const currentImgs = currentLevel?.images || [];
    if (currentImgs.length >= 5) {
      showError('الحد الأقصى هو 5 صور أو مستندات لكل مستوى.');
      return;
    }
    setEditingImageUrlId(null);
    setImageUrlInput('');
    setImageTitleInput(`صورة أو مستند ${currentImgs.length + 1}`);
    setImageTypeInput('image');
    setShowImageUrlModal(true);
  };

  const openReplaceImageUrlModal = (item: LevelMediaItem) => {
    setEditingImageUrlId(item.id);
    setImageUrlInput(item.url || '');
    setImageTitleInput(item.title || '');
    setImageTypeInput(item.type === 'pdf' ? 'pdf' : 'image');
    setShowImageUrlModal(true);
  };

  const handleSaveImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) {
      showError('يرجى إدخال رابط الملف.');
      return;
    }

    const rawUrl = imageUrlInput.trim();
    const cleanTitle = imageTitleInput.trim() || `ملف خارجي`;
    const isPdf = imageTypeInput === 'pdf' || rawUrl.toLowerCase().endsWith('.pdf');
    const finalType = isPdf ? 'pdf' : 'image';

    if (editingImageUrlId) {
      const updatedMedia: LevelMediaItem = {
        id: editingImageUrlId,
        title: cleanTitle,
        url: rawUrl,
        type: finalType,
        format: finalType === 'pdf' ? 'application/pdf' : 'image/jpeg',
        size: 0,
        addedAt: new Date().toISOString(),
      };
      const updated = replaceMediaInLevel(selectedLevelNum, editingImageUrlId, updatedMedia);
      setLevels([...updated]);
      showToast('✅ تم استبدال الملف عبر الرابط بنجاح!');
    } else {
      const mediaId = `img-url-${Date.now()}`;
      const newMedia: LevelMediaItem = {
        id: mediaId,
        title: cleanTitle,
        url: rawUrl,
        type: finalType,
        format: finalType === 'pdf' ? 'application/pdf' : 'image/jpeg',
        size: 0,
        addedAt: new Date().toISOString(),
      };
      const updated = addMediaToLevel(selectedLevelNum, newMedia);
      setLevels([...updated]);
      showToast('✅ تم إدراج ملف جديد عبر الرابط بنجاح!');
    }

    setShowImageUrlModal(false);
    setImageUrlInput('');
    setImageTitleInput('');
    setEditingImageUrlId(null);
  };

  const [titleDraft, setTitleDraft] = useState<string>(currentLevel?.title || '');
  const [shortTitleDraft, setShortTitleDraft] = useState<string>(currentLevel?.shortTitle || '');
  const [storyDraft, setStoryDraft] = useState<string>(currentLevel?.storyMission || '');
  const [instructionsDraft, setInstructionsDraft] = useState<string>(currentLevel?.instructions || '');
  const [activityPromptDraft, setActivityPromptDraft] = useState<string>(currentLevel?.activityPrompt || '');
  const [imagesTitleDraft, setImagesTitleDraft] = useState<string>(currentLevel?.imagesSectionTitle || '');
  const [imagesDescDraft, setImagesDescDraft] = useState<string>(currentLevel?.imagesSectionDesc || '');

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
    showToast(`تم حفظ وتحديث بيانات المستوى ${selectedLevelNum} بنجاح!`);
  };

  const handleDeleteVideo = (videoId: string) => {
    const updated = removeMediaFromLevel(selectedLevelNum, videoId);
    setLevels([...updated]);
    showToast('تم حذف الفيديو بنجاح');
  };

  const handleUpdateVideoCustomTitle = (videoId: string, customTitle: string) => {
    const updated = updateMediaItemInLevel(selectedLevelNum, videoId, {
      partCustomTitle: customTitle.trim() || undefined,
    });
    setLevels([...updated]);
    showToast('تم حفظ مسمى جزء الفيديو بنجاح ✅');
  };

  const handleDeleteImageOrPdf = (mediaId: string) => {
    const updated = removeMediaFromLevel(selectedLevelNum, mediaId);
    setLevels([...updated]);
    showToast('تم حذف الملف بنجاح');
  };

  const [editingQuestion, setEditingQuestion] = useState<LevelQuestion | null>(null);

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
      return { ...lvl, questions: [...lvl.questions, newQ] };
    });

    saveCustomGameLevels(updatedLevels, true);
    setLevels(updatedLevels);
    setEditingQuestion(newQ);
    showToast('تمت إضافة سؤال جديد بنجاح!');
  };

  const handleSaveQuestion = (updatedQ: LevelQuestion) => {
    const updatedLevels = levels.map((lvl) => {
      if (lvl.levelNumber !== selectedLevelNum) return lvl;
      const exists = lvl.questions.some((q) => q.id === updatedQ.id);
      const newQuestions = exists
        ? lvl.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q))
        : [...lvl.questions, updatedQ];
      return { ...lvl, questions: newQuestions };
    });

    saveCustomGameLevels(updatedLevels, true);
    setLevels(updatedLevels);
    setEditingQuestion(null);
    showToast('تم حفظ تعديلات السؤال بنجاح!');
  };

  const handleDeleteQuestion = (qId: string) => {
    const updatedLevels = levels.map((lvl) => {
      if (lvl.levelNumber !== selectedLevelNum) return lvl;
      return { ...lvl, questions: lvl.questions.filter((q) => q.id !== qId) };
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

      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#101535] to-slate-900 border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>إدارة المستويات الـ 9</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal']">
                تعديل الليفل والأهداف والوسائط (روابط خارجية فقط)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveLevelDetails}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(251,191,36,0.4)] border border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>حفظ تعديلات المستوى {selectedLevelNum}</span>
          </button>
        </div>

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
                  style={{
                    ...(lvlNum >= 1 && lvlNum <= 4 ? { backgroundColor: '#ffffff' } : {}),
                    ...(lvlNum === 1 ? { borderColor: '#ef6109' } : {}),
                  }}
                  className={`py-3 px-2 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-105 ring-2 ring-amber-400'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                  }`}
                >
                  <span className="text-base sm:text-lg font-bold" style={lvlNum === 1 ? { color: '#ce0a0a' } : undefined}>L{lvlNum}</span>
                  <span className="text-[10px] font-normal truncate max-w-full px-1" style={lvlNum === 1 ? { color: '#ce0a0a' } : undefined}>المستوى {lvlNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-bold">
            <Edit3 className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">بيانات المستوى {selectedLevelNum}</h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان المستوى:</label>
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم المختصر:</label>
            <input
              type="text"
              value={shortTitleDraft}
              onChange={(e) => setShortTitleDraft(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">محتوى المستوى:</label>
            <textarea
              rows={4}
              value={storyDraft}
              onChange={(e) => setStoryDraft(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-cyan-400 font-bold">
            <HelpCircle className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">أهداف المستوى</h3>
          </div>
          <textarea
            rows={8}
            value={instructionsDraft}
            onChange={(e) => setInstructionsDraft(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-purple-400">
            <Video className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">فيديوهات المستوى {selectedLevelNum}</h3>
          </div>
          <button
            type="button"
            disabled={currentVideos.length >= 5}
            onClick={openAddVideoUrlModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Link2 className="w-4 h-4" />
            <span>إضافة فيديو برابط خارجي 🔗</span>
          </button>
        </div>

        {currentVideos.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-slate-400 text-xs">لا توجد فيديوهات.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentVideos.map((vid) => (
              <div key={vid.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                  {vid.url && (
                    <iframe
                      src={normalizeVideoUrl(vid.url)}
                      title={vid.title}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  )}
                </div>
                <input
                  type="text"
                  defaultValue={vid.partCustomTitle || vid.title}
                  onBlur={(e) => handleUpdateVideoCustomTitle(vid.id, e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <div className="flex items-center gap-1.5 pt-2">
                  <button onClick={() => openReplaceVideoUrlModal(vid)} className="flex-1 py-1.5 rounded-lg bg-blue-900/40 border border-blue-500/30 text-blue-300 text-[11px] font-bold">تبديل الرابط 🔗</button>
                  <button onClick={() => handleDeleteVideo(vid.id)} className="p-1.5 rounded-lg bg-red-900/40 border border-red-500/30 text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <ImageIcon className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">{imagesTitleDraft || `صور ومستندات المستوى ${selectedLevelNum}`}</h3>
          </div>
          <button
            type="button"
            disabled={currentImages.length >= 5}
            onClick={openAddImageUrlModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Link2 className="w-4 h-4" />
            <span>إضافة صورة/PDF برابط خارجي 🔗</span>
          </button>
        </div>

        {currentImages.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-slate-400 text-xs">لا توجد صور أو مستندات.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentImages.map((img) => (
              <div key={img.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                  {img.type === 'pdf' ? (
                    <div className="text-center p-3"><FileText className="w-10 h-10 mx-auto text-red-400" /><span className="text-[10px] text-slate-300 block truncate">{img.title}</span></div>
                  ) : (
                    <img src={img.url} alt={img.title} className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 pt-2">
                  <button onClick={() => openReplaceImageUrlModal(img)} className="flex-1 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">تبديل الرابط 🔗</button>
                  <button onClick={() => setPreviewMedia(img)} className="p-1.5 rounded-lg bg-blue-900/40 border border-blue-500/30 text-blue-300"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteImageOrPdf(img.id)} className="p-1.5 rounded-lg bg-red-900/40 border border-red-500/30 text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 text-amber-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">أسئلة المستوى التفاعلية</h3>
          </div>
          <button onClick={handleAddNewQuestion} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md">
            <Plus className="w-4 h-4" />
            <span>إضافة سؤال جديد</span>
          </button>
        </div>

        {currentQuestions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-slate-400 text-xs">لا توجد أسئلة.</div>
        ) : (
          <div className="space-y-4">
            {currentQuestions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">س{idx + 1}: {q.question}</h4>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingQuestion(q)} className="p-1.5 rounded-lg bg-amber-900/40 border border-amber-500/30 text-amber-300"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 rounded-lg bg-red-900/40 border border-red-500/30 text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f1228] border-2 border-amber-400 rounded-3xl p-6 max-w-2xl w-full text-right shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">تعديل السؤال</h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <textarea
              rows={3}
              value={editingQuestion.question}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
            />
            <div className="space-y-2">
              {editingQuestion.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input type="radio" checked={editingQuestion.correctIndex === optIdx} onChange={() => setEditingQuestion({ ...editingQuestion, correctIndex: optIdx })} />
                  <input type="text" value={opt} onChange={(e) => {
                    const newOpts = [...editingQuestion.options];
                    newOpts[optIdx] = e.target.value;
                    setEditingQuestion({ ...editingQuestion, options: newOpts });
                  }} className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none" />
                </div>
              ))}
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button onClick={() => setEditingQuestion(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs">إلغاء</button>
              <button onClick={() => handleSaveQuestion(editingQuestion)} className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">حفظ</button>
            </div>
          </div>
        </div>
      )}

      {showImageUrlModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0c0f20] border-2 border-emerald-500 shadow-2xl space-y-5">
            <h3 className="text-lg font-black text-white">{editingImageUrlId ? 'تبديل الملف' : 'إضافة ملف جديد'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setImageTypeInput('image')} className={`py-2 rounded-xl border ${imageTypeInput === 'image' ? 'bg-emerald-600 text-white border-emerald-300' : 'bg-slate-900 text-slate-400'}`}>صورة 🖼️</button>
              <button onClick={() => setImageTypeInput('pdf')} className={`py-2 rounded-xl border ${imageTypeInput === 'pdf' ? 'bg-rose-600 text-white border-rose-300' : 'bg-slate-900 text-slate-400'}`}>PDF 📄</button>
            </div>
            <input type="text" value={imageTitleInput} onChange={(e) => setImageTitleInput(e.target.value)} placeholder="عنوان الملف" className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none" />
            <input type="url" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="رابط الملف المباشر (URL)" className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 text-xs outline-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowImageUrlModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs">إلغاء</button>
              <button onClick={handleSaveImageUrl} className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs">حفظ</button>
            </div>
          </div>
        </div>
      )}

      {showVideoUrlModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0c0f20] border-2 border-cyan-500 shadow-2xl space-y-5">
            <h3 className="text-lg font-black text-white">{editingVideoUrlId ? 'تبديل الفيديو' : 'إضافة فيديو جديد'}</h3>
            <input type="text" value={videoTitleInput} onChange={(e) => setVideoTitleInput(e.target.value)} placeholder="عنوان الفيديو" className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none" />
            <input type="url" value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} placeholder="رابط الفيديو المباشر (URL)" className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 text-xs outline-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowVideoUrlModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs">إلغاء</button>
              <button onClick={handleSaveVideoUrl} className="px-6 py-2 rounded-xl bg-cyan-600 text-white font-black text-xs">حفظ</button>
            </div>
          </div>
        </div>
      )}

      {previewMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setPreviewMedia(null)}>
          <div className="relative max-w-4xl w-full bg-slate-950 border-2 border-amber-400 rounded-3xl p-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewMedia(null)} className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900 text-white"><X className="w-5 h-5" /></button>
            <div className="flex items-center justify-center p-4">
              {previewMedia.type === 'pdf' ? <FileText className="w-32 h-32 text-red-500" /> : <img src={previewMedia.url} alt={previewMedia.title} className="max-h-[75vh] object-contain" />}
            </div>
            <p className="text-center text-xs font-bold text-amber-300 pb-2">{previewMedia.title}</p>
          </div>
        </div>
      )}
    </div>
  );
};
