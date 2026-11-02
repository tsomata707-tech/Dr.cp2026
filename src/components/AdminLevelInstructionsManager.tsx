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
  Upload,
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
import { storeVideoBlob, getVideoBlobUrl } from '../utils/indexedDbVideo';
import { formatRealFileSize } from '../utils/mediaSafety';

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
  const currentLevel = levels.find((l) => l.levelNumber === selectedLevelNum) || levels[0];
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<LevelMediaItem | null>(null);

  // External Video URL Modal state
  const [showVideoUrlModal, setShowVideoUrlModal] = useState<boolean>(false);
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [videoTitleInput, setVideoTitleInput] = useState<string>('');
  const [editingVideoUrlId, setEditingVideoUrlId] = useState<string | null>(null);
  const [videoLevelSelect, setVideoLevelSelect] = useState<number>(1);

  // Device Video Upload Modal state
  const [showDeviceVideoModal, setShowDeviceVideoModal] = useState<boolean>(false);
  const [deviceVideoFile, setDeviceVideoFile] = useState<File | null>(null);
  const [deviceVideoTitle, setDeviceVideoTitle] = useState<string>('');
  const [deviceVideoLevelSelect, setDeviceVideoLevelSelect] = useState<number>(1);
  const [isUploadingDeviceVideo, setIsUploadingDeviceVideo] = useState<boolean>(false);

  // External Image/PDF URL Modal state
  const [showImageUrlModal, setShowImageUrlModal] = useState<boolean>(false);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [imageTitleInput, setImageTitleInput] = useState<string>('');
  const [imageTypeInput, setImageTypeInput] = useState<'image' | 'pdf'>('image');
  const [editingImageUrlId, setEditingImageUrlId] = useState<string | null>(null);
  const [imageLevelSelect, setImageLevelSelect] = useState<number>(1);

  // Device Image/PDF Upload Modal state
  const [showDeviceImageModal, setShowDeviceImageModal] = useState<boolean>(false);
  const [deviceImageFile, setDeviceImageFile] = useState<File | null>(null);
  const [deviceImageTitle, setDeviceImageTitle] = useState<string>('');
  const [deviceImageLevelSelect, setDeviceImageLevelSelect] = useState<number>(1);
  const [isUploadingDeviceImage, setIsUploadingDeviceImage] = useState<boolean>(false);

  const [rehydratedBlobUrls, setRehydratedBlobUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    const rehydrate = async () => {
      const vids = currentLevel?.videos || [];
      for (const v of vids) {
        if (v.blobId) {
          const freshUrl = await getVideoBlobUrl(v.blobId);
          if (freshUrl && isMounted) {
            setRehydratedBlobUrls((prev) => ({ ...prev, [v.id]: freshUrl }));
          }
        }
      }
    };
    rehydrate();
    return () => {
      isMounted = false;
    };
  }, [currentLevel]);

  const openDeviceVideoModal = () => {
    setDeviceVideoFile(null);
    setDeviceVideoTitle('');
    setDeviceVideoLevelSelect(selectedLevelNum);
    setShowDeviceVideoModal(true);
  };

  const handleDeviceVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDeviceVideoFile(file);
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '').trim();
    if (!deviceVideoTitle.trim()) {
      setDeviceVideoTitle(cleanFileName);
    }
    e.target.value = '';
  };

  const handleConfirmDeviceVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceVideoFile) {
      showError('يرجى اختيار ملف الفيديو من جهازك أولاً.');
      return;
    }
    const targetLvl = levels.find((l) => l.levelNumber === deviceVideoLevelSelect) || currentLevel;
    const currentVids = targetLvl?.videos || [];
    if (currentVids.length >= 7) {
      showError(`عذراً، المستوى ${deviceVideoLevelSelect} يحتوي بالفعل على الحد الأقصى (7 أجزاء فيديوهات).`);
      return;
    }

    setIsUploadingDeviceVideo(true);
    try {
      const mediaId = `vid-device-${Date.now()}`;
      // Store in IndexedDB for reliable video storage without localStorage quota crashes
      const objectUrl = await storeVideoBlob(mediaId, deviceVideoFile, deviceVideoFile.name);
      const cleanFileName = deviceVideoFile.name.replace(/\.[^/.]+$/, '').trim();
      const partNum = currentVids.length + 1;
      const finalTitle = deviceVideoTitle.trim() || cleanFileName || `فيديو المستوى ${deviceVideoLevelSelect} (الجزء ${partNum})`;
      const finalPartTitle = `الجزء ${partNum}: ${finalTitle}`;

      const newMedia: LevelMediaItem = {
        id: mediaId,
        blobId: mediaId,
        title: finalTitle,
        partCustomTitle: finalPartTitle,
        url: objectUrl,
        type: 'video',
        format: deviceVideoFile.type || 'video/mp4',
        size: deviceVideoFile.size, // Real file size in bytes
        addedAt: new Date().toISOString(),
      };

      const updated = addMediaToLevel(deviceVideoLevelSelect, newMedia);
      setLevels([...updated]);
      setSelectedLevelNum(deviceVideoLevelSelect);
      const sizeText = formatRealFileSize(deviceVideoFile.size);
      showToast(`✅ تم رفع ونشر الفيديو في المستوى ${deviceVideoLevelSelect} بنجاح! ${sizeText ? `(الحجم: ${sizeText})` : ''}`);
      setShowDeviceVideoModal(false);
      setDeviceVideoFile(null);
      setDeviceVideoTitle('');
    } catch (err: any) {
      showError(err?.message || 'حدث خطأ أثناء قراءة وحفظ ملف الفيديو.');
    } finally {
      setIsUploadingDeviceVideo(false);
    }
  };

  const openDeviceImageModal = () => {
    setDeviceImageFile(null);
    setDeviceImageTitle('');
    setDeviceImageLevelSelect(selectedLevelNum);
    setShowDeviceImageModal(true);
  };

  const handleDeviceImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDeviceImageFile(file);
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '').trim();
    if (!deviceImageTitle.trim()) {
      setDeviceImageTitle(cleanFileName);
    }
    e.target.value = '';
  };

  const handleConfirmDeviceImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceImageFile) {
      showError('يرجى اختيار ملف الصورة أو المستند من جهازك أولاً.');
      return;
    }
    const targetLvl = levels.find((l) => l.levelNumber === deviceImageLevelSelect) || currentLevel;
    const currentImgs = targetLvl?.images || [];
    if (currentImgs.length >= 5) {
      showError(`عذراً، المستوى ${deviceImageLevelSelect} يحتوي بالفعل على الحد الأقصى (5 صور/مستندات).`);
      return;
    }

    setIsUploadingDeviceImage(true);
    const isPdf = deviceImageFile.type === 'application/pdf' || deviceImageFile.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const mediaId = `img-device-${Date.now()}`;
      const cleanFileName = deviceImageFile.name.replace(/\.[^/.]+$/, '').trim();
      const finalTitle = deviceImageTitle.trim() || cleanFileName || 'ملف مرفق';

      const newMedia: LevelMediaItem = {
        id: mediaId,
        title: finalTitle,
        url: dataUrl,
        type: isPdf ? 'pdf' : 'image',
        format: isPdf ? 'application/pdf' : 'image/jpeg',
        size: deviceImageFile.size,
        addedAt: new Date().toISOString(),
      };

      const updated = addMediaToLevel(deviceImageLevelSelect, newMedia);
      setLevels([...updated]);
      setSelectedLevelNum(deviceImageLevelSelect);
      showToast(`✅ تم رفع ونشر الملف في المستوى ${deviceImageLevelSelect} بنجاح!`);
      setShowDeviceImageModal(false);
      setDeviceImageFile(null);
      setDeviceImageTitle('');
      setIsUploadingDeviceImage(false);
    };
    reader.onerror = () => {
      showError('حدث خطأ أثناء قراءة الملف.');
      setIsUploadingDeviceImage(false);
    };
    reader.readAsDataURL(deviceImageFile);
  };

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
    if (currentVids.length >= 7) {
      showError('الحد الأقصى هو 7 أجزاء فيديوهات لكل مستوى.');
      return;
    }
    setEditingVideoUrlId(null);
    setVideoUrlInput('');
    setVideoTitleInput(`فيديو المستوى ${selectedLevelNum}`);
    setVideoLevelSelect(selectedLevelNum);
    setShowVideoUrlModal(true);
  };

  const openReplaceVideoUrlModal = (video: LevelMediaItem) => {
    setEditingVideoUrlId(video.id);
    setVideoUrlInput(video.url || '');
    setVideoTitleInput(video.partCustomTitle || video.title || '');
    setVideoLevelSelect(selectedLevelNum);
    setShowVideoUrlModal(true);
  };

  const handleSaveVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput.trim()) {
      showError('يرجى إدخال رابط الفيديو المباشر.');
      return;
    }

    const rawUrl = videoUrlInput.trim();
    const cleanUrl = normalizeVideoUrl(rawUrl);
    const targetLvlNum = videoLevelSelect || selectedLevelNum;
    const targetLvl = levels.find((l) => l.levelNumber === targetLvlNum) || currentLevel;
    const cleanTitle = videoTitleInput.trim() || `فيديو المستوى ${targetLvlNum}`;
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
      const updated = replaceMediaInLevel(targetLvlNum, editingVideoUrlId, updatedMedia);
      setLevels([...updated]);
      setSelectedLevelNum(targetLvlNum);
      showToast(`✅ تم استبدال فيديو المستوى ${targetLvlNum} عبر الرابط بنجاح!`);
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
      const updated = addMediaToLevel(targetLvlNum, newMedia);
      setLevels([...updated]);
      setSelectedLevelNum(targetLvlNum);
      showToast(`✅ تم إدراج فيديو جديد للمستوى ${targetLvlNum} عبر الرابط بنجاح!`);
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
    setImageLevelSelect(selectedLevelNum);
    setShowImageUrlModal(true);
  };

  const openReplaceImageUrlModal = (item: LevelMediaItem) => {
    setEditingImageUrlId(item.id);
    setImageUrlInput(item.url || '');
    setImageTitleInput(item.title || '');
    setImageTypeInput(item.type === 'pdf' ? 'pdf' : 'image');
    setImageLevelSelect(selectedLevelNum);
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
    const targetLvlNum = imageLevelSelect || selectedLevelNum;

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
      const updated = replaceMediaInLevel(targetLvlNum, editingImageUrlId, updatedMedia);
      setLevels([...updated]);
      setSelectedLevelNum(targetLvlNum);
      showToast(`✅ تم استبدال الملف في المستوى ${targetLvlNum} عبر الرابط بنجاح!`);
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
      const updated = addMediaToLevel(targetLvlNum, newMedia);
      setLevels([...updated]);
      setSelectedLevelNum(targetLvlNum);
      showToast(`✅ تم إدراج ملف جديد في المستوى ${targetLvlNum} عبر الرابط بنجاح!`);
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
    const trimmed = customTitle.trim();
    if (!trimmed) return;
    const updated = updateMediaItemInLevel(selectedLevelNum, videoId, {
      title: trimmed,
      partCustomTitle: trimmed,
    });
    setLevels([...updated]);
    showToast(`✅ تم تعديل اسم الفيديو إلى "${trimmed}" بنجاح!`);
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
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 text-purple-400">
              <Video className="w-5 h-5" />
              <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">فيديوهات المستوى {selectedLevelNum}</h3>
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300">
              {currentVideos.length} من 7 أجزاء مرفوعة
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={currentVideos.length >= 7}
              onClick={openDeviceVideoModal}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>رفع فيديو من الجهاز 💻</span>
            </button>
            <button
              type="button"
              disabled={currentVideos.length >= 7}
              onClick={openAddVideoUrlModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 transition-colors"
            >
              <Link2 className="w-4 h-4" />
              <span>رابط خارجي 🔗</span>
            </button>
          </div>
        </div>

        {currentVideos.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-slate-400 text-xs">
            لا توجد فيديوهات لهذا المستوى حالياً. يمكنك رفع حتى ٧ أجزاء فيديو من جهازك أو إضافة رابط خارجي مباشر.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentVideos.map((vid, idx) => {
              const activeUrl = (vid.blobId && rehydratedBlobUrls[vid.id]) ? rehydratedBlobUrls[vid.id] : vid.url;
              const cleanActiveUrl = activeUrl?.trim() || '';
              const isLocal = cleanActiveUrl.startsWith('data:') || cleanActiveUrl.startsWith('blob:') || cleanActiveUrl.endsWith('.mp4') || cleanActiveUrl.endsWith('.webm');
              const normalizedEmbed = cleanActiveUrl ? normalizeVideoUrl(cleanActiveUrl) : '';
              const sizeText = formatRealFileSize(vid.size);

              return (
                <div key={vid.id || idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-black">
                        🎬 الجزء {idx + 1} من {currentVideos.length}
                      </span>
                      {sizeText ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                          💾 الحجم الحقيقي: {sizeText}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[11px] font-bold">
                          🔗 رابط خارجي
                        </span>
                      )}
                    </div>

                    <div className="aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                      {cleanActiveUrl && isLocal ? (
                        <video controls className="w-full h-full object-contain bg-black" src={cleanActiveUrl} preload="metadata" />
                      ) : normalizedEmbed && normalizedEmbed.trim() ? (
                        <iframe
                          src={normalizedEmbed.trim()}
                          title={vid.title}
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      ) : (
                        <div className="text-slate-500 text-xs">جاري تجهيز مشغل الفيديو...</div>
                      )}
                    </div>

                    <div className="space-y-1 pt-1 text-right">
                      <label className="block text-[11px] font-bold text-slate-300 font-['Cairo']">
                        اسم / مسمى الفيديو:
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          defaultValue={vid.partCustomTitle || vid.title}
                          id={`vid-title-input-${vid.id}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleUpdateVideoCustomTitle(vid.id, (e.target as HTMLInputElement).value);
                            }
                          }}
                          placeholder="أدخل اسم الفيديو..."
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-['Cairo']"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const inputEl = document.getElementById(`vid-title-input-${vid.id}`) as HTMLInputElement | null;
                            if (inputEl) {
                              handleUpdateVideoCustomTitle(vid.id, inputEl.value);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-sm transition-colors"
                          title="حفظ اسم الفيديو الجديد"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>حفظ</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => openReplaceVideoUrlModal(vid)}
                      className="flex-1 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/50 border border-blue-500/30 text-blue-300 text-xs font-bold transition cursor-pointer"
                    >
                      تبديل الرابط 🔗
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="p-1.5 rounded-xl bg-red-900/40 hover:bg-red-800/50 border border-red-500/30 text-red-300 transition cursor-pointer"
                      title="حذف هذا الجزء"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-[#090d20] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <ImageIcon className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">{imagesTitleDraft || `صور ومستندات المستوى ${selectedLevelNum}`}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={currentImages.length >= 5}
              onClick={openDeviceImageModal}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>رفع ملف من الجهاز 💻</span>
            </button>
            <button
              type="button"
              disabled={currentImages.length >= 5}
              onClick={openAddImageUrlModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Link2 className="w-4 h-4" />
              <span>رابط خارجي 🔗</span>
            </button>
          </div>
        </div>

        {currentImages.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-slate-400 text-xs">لا توجد صور أو مستندات. يمكنك رفع ملف من جهازك أو إضافة رابط خارجي.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentImages.map((img) => (
              <div key={img.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                  {img.type === 'pdf' ? (
                    <div className="text-center p-3"><FileText className="w-10 h-10 mx-auto text-red-400" /><span className="text-[10px] text-slate-300 block truncate">{img.title}</span></div>
                  ) : img.url && img.url.trim() ? (
                    <img src={img.url.trim()} alt={img.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-slate-500 text-xs font-bold">صورة</div>
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
              <h3 className="text-base font-black text-white font-['Tajawal']">تعديل السؤال وإضافة صور الخيارات 🖼️</h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">نص السؤال:</label>
              <textarea
                rows={3}
                value={editingQuestion.question}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">رابط صورة السؤال الرئيسية (اختياري URL):</label>
              <input
                type="url"
                value={editingQuestion.imageUrl || ''}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
                placeholder="https://... (رابط الصورة الرئيسية للتوضيح فوق الإجابات)"
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-200 text-xs outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-200">
                خيارات الإجابة والصور المخصصة للخيارات (اختر الإجابة الصحيحة بالراديو):
              </label>
              {editingQuestion.options.map((opt, optIdx) => {
                const optImg = editingQuestion.optionImages?.[optIdx] || '';
                return (
                  <div key={optIdx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="q-correct-idx"
                        checked={editingQuestion.correctIndex === optIdx}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctIndex: optIdx })}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                        title="عين كإجابة صحيحة"
                      />
                      <span className="text-xs font-bold text-amber-400 shrink-0 w-6">
                        {['أ', 'ب', 'ج', 'د', 'هـ'][optIdx] || optIdx + 1}:
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...editingQuestion.options];
                          newOpts[optIdx] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: newOpts });
                        }}
                        placeholder={`نص الخيار ${['أ', 'ب', 'ج', 'د'][optIdx] || optIdx + 1}`}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 pr-12">
                      <span className="text-[11px] font-bold text-emerald-400 shrink-0 flex items-center gap-1">
                        🖼️ رابط صورة الخيار:
                      </span>
                      <input
                        type="url"
                        value={optImg}
                        onChange={(e) => {
                          const newImgs = [...(editingQuestion.optionImages || ['', '', '', ''])];
                          newImgs[optIdx] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, optionImages: newImgs });
                        }}
                        placeholder="ضع رابط صورة الإجابة المباشرة هنا (https://...)"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-200 text-xs outline-none focus:border-emerald-400"
                      />
                    </div>

                    {optImg && optImg.trim() ? (
                      <div className="mr-12 mt-1">
                        <img
                          src={optImg.trim()}
                          alt={`معاينة خيار ${optIdx + 1}`}
                          className="h-16 w-auto object-contain rounded-lg border border-emerald-500/30 bg-black/50 p-1"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">التغذية الراجعة والتوضيح:</label>
              <textarea
                rows={2}
                value={editingQuestion.explanation || ''}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                placeholder="شرح الإجابة الصحيحة والتوجيه الأكاديمي للطالب..."
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
              <button onClick={() => setEditingQuestion(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer">إلغاء</button>
              <button onClick={() => handleSaveQuestion(editingQuestion)} className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg">حفظ ونشر السؤال 💾</button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Modal: External Image/PDF URL */}
      {showImageUrlModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0c0f20] border-2 border-emerald-500 shadow-2xl space-y-5 text-right font-['Cairo']">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">{editingImageUrlId ? 'تبديل الملف عبر رابط 🔗' : 'إضافة ملف برابط خارجي 🔗'}</h3>
              <button onClick={() => setShowImageUrlModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">🎯 اختر المستوى للملف (1 إلى 9):</label>
              <select
                value={imageLevelSelect}
                onChange={(e) => setImageLevelSelect(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs outline-none cursor-pointer"
              >
                {levels.map((num) => (
                  <option key={num.levelNumber} value={num.levelNumber}>
                    المستوى {num.levelNumber}: {num.shortTitle || num.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setImageTypeInput('image')} className={`py-2 rounded-xl border font-bold text-xs cursor-pointer ${imageTypeInput === 'image' ? 'bg-emerald-600 text-white border-emerald-300' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>صورة 🖼️</button>
              <button onClick={() => setImageTypeInput('pdf')} className={`py-2 rounded-xl border font-bold text-xs cursor-pointer ${imageTypeInput === 'pdf' ? 'bg-rose-600 text-white border-rose-300' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>PDF 📄</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الملف:</label>
              <input type="text" value={imageTitleInput} onChange={(e) => setImageTitleInput(e.target.value)} placeholder="عنوان الملف" className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-emerald-400" />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">رابط الملف المباشر (URL):</label>
              <input type="url" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="https://... رابط الصورة أو مستند PDF" className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 text-xs outline-none focus:border-emerald-400" />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setShowImageUrlModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer">إلغاء</button>
              <button onClick={handleSaveImageUrl} className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-lg">حفظ الملف 💾</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: External Video URL */}
      {showVideoUrlModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0c0f20] border-2 border-cyan-500 shadow-2xl space-y-5 text-right font-['Cairo']">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white font-['Tajawal']">{editingVideoUrlId ? 'تعديل/تبديل فيديو المستوى عبر رابط' : 'رفع/إضافة فيديو في المستوى عبر رابط 📺'}</h3>
              <button onClick={() => setShowVideoUrlModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">🎯 اختر المستوى للفيديو (1 إلى 9):</label>
              <select
                value={videoLevelSelect}
                onChange={(e) => setVideoLevelSelect(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs outline-none cursor-pointer"
              >
                {levels.map((lvl) => (
                  <option key={lvl.levelNumber} value={lvl.levelNumber}>
                    المستوى {lvl.levelNumber}: {lvl.shortTitle || lvl.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">عنوان أو اسم الفيديو:</label>
              <input
                type="text"
                value={videoTitleInput}
                onChange={(e) => setVideoTitleInput(e.target.value)}
                placeholder="مثال: فيديو شرح الدرس الأول..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">رابط الفيديو المباشر (YouTube / Direct MP4 / Google Drive):</label>
              <input
                type="url"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="ضع رابط الفيديو هنا... https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/50 text-cyan-200 text-xs outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowVideoUrlModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveVideoUrl}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xs cursor-pointer shadow-lg hover:scale-105 transition-transform"
              >
                حفظ ونشر الفيديو 📺
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Device Video Upload with Target Level Selector */}
      {showDeviceVideoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleConfirmDeviceVideo} className="w-full max-w-lg p-6 rounded-3xl bg-[#0c0f20] border-2 border-cyan-500 shadow-2xl space-y-5 text-right font-['Cairo']">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Video className="w-5 h-5" />
                <h3 className="text-lg font-black text-white font-['Tajawal']">رفع فيديو من الجهاز 💻</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeviceVideoModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Level Selection */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                🎯 اختر المستوى المستهدف لوضع الفيديو فيه (1 إلى 9):
              </label>
              <select
                value={deviceVideoLevelSelect}
                onChange={(e) => setDeviceVideoLevelSelect(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs outline-none cursor-pointer"
              >
                {levels.map((lvl) => (
                  <option key={lvl.levelNumber} value={lvl.levelNumber}>
                    المستوى {lvl.levelNumber}: {lvl.shortTitle || lvl.title}
                  </option>
                ))}
              </select>
            </div>

            {/* File Chooser */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                📁 اختر ملف الفيديو من جهازك:
              </label>
              <input
                type="file"
                accept="video/*,.mp4,.webm,.mov,.mkv,.avi"
                onChange={handleDeviceVideoFileChange}
                className="w-full text-xs text-slate-400 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer bg-slate-950 p-2.5 rounded-xl border border-slate-800"
              />
              {deviceVideoFile && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 truncate">{deviceVideoFile.name}</span>
                  <span className="font-bold text-emerald-400 shrink-0 mr-2">
                    💾 {formatRealFileSize(deviceVideoFile.size)}
                  </span>
                </div>
              )}
            </div>

            {/* Video Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ✏️ اسم أو مسمى الفيديو في المستوى:
              </label>
              <input
                type="text"
                value={deviceVideoTitle}
                onChange={(e) => setDeviceVideoTitle(e.target.value)}
                placeholder="مثال: فيديو شرح الدرس الأول..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeviceVideoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={!deviceVideoFile || isUploadingDeviceVideo}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs cursor-pointer shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploadingDeviceVideo ? 'جاري الرفع والحفظ...' : 'تأكيد ورفع الفيديو للمستوى المحدد 🚀'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Modal: Device Image/PDF Upload with Target Level Selector */}
      {showDeviceImageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleConfirmDeviceImage} className="w-full max-w-lg p-6 rounded-3xl bg-[#0c0f20] border-2 border-emerald-500 shadow-2xl space-y-5 text-right font-['Cairo']">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <ImageIcon className="w-5 h-5" />
                <h3 className="text-lg font-black text-white font-['Tajawal']">رفع صورة أو مستند من الجهاز 💻</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeviceImageModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Level Selection */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                🎯 اختر المستوى المستهدف لوضع الصورة أو المستند فيه (1 إلى 9):
              </label>
              <select
                value={deviceImageLevelSelect}
                onChange={(e) => setDeviceImageLevelSelect(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-bold text-xs outline-none cursor-pointer"
              >
                {levels.map((lvl) => (
                  <option key={lvl.levelNumber} value={lvl.levelNumber}>
                    المستوى {lvl.levelNumber}: {lvl.shortTitle || lvl.title}
                  </option>
                ))}
              </select>
            </div>

            {/* File Chooser */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                📁 اختر الملف من جهازك (صورة أو PDF):
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleDeviceImageFileChange}
                className="w-full text-xs text-slate-400 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-slate-950 p-2.5 rounded-xl border border-slate-800"
              />
              {deviceImageFile && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 truncate">{deviceImageFile.name}</span>
                  <span className="font-bold text-emerald-400 shrink-0 mr-2">
                    💾 {formatRealFileSize(deviceImageFile.size)}
                  </span>
                </div>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ✏️ مسمى أو عنوان الملف في المستوى:
              </label>
              <input
                type="text"
                value={deviceImageTitle}
                onChange={(e) => setDeviceImageTitle(e.target.value)}
                placeholder="مثال: مخطط الواجهة والمشروع..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeviceImageModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={!deviceImageFile || isUploadingDeviceImage}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs cursor-pointer shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploadingDeviceImage ? 'جاري الرفع...' : 'تأكيد رفع الملف للمستوى المحدد 🚀'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {previewMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setPreviewMedia(null)}>
          <div className="relative max-w-4xl w-full bg-slate-950 border-2 border-amber-400 rounded-3xl p-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewMedia(null)} className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900 text-white"><X className="w-5 h-5" /></button>
            <div className="flex items-center justify-center p-4">
              {previewMedia.type === 'pdf' ? (
                <FileText className="w-32 h-32 text-red-500" />
              ) : previewMedia.url && previewMedia.url.trim() ? (
                <img src={previewMedia.url.trim()} alt={previewMedia.title} className="max-h-[75vh] object-contain" />
              ) : null}
            </div>
            <p className="text-center text-xs font-bold text-amber-300 pb-2">{previewMedia.title}</p>
          </div>
        </div>
      )}
    </div>
  );
};
