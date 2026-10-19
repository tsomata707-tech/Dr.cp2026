import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Edit3,
  Search,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  X,
  Upload,
  ArrowRight,
  Layers,
  Gamepad2,
  Trophy,
  Filter,
  Eye,
  Link as LinkIcon,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  Copy,
  Target,
  Save,
} from 'lucide-react';
import { PreTestQuestion, LevelQuestion } from '../types';
import {
  getPreTestQuestions,
  savePreTestQuestions,
  resetPreTestQuestionsToDefault,
  getPostTestQuestions,
  savePostTestQuestions,
  resetPostTestQuestionsToDefault,
  copyPreTestQuestionsToPostTest,
} from '../data/preTestData';
import {
  GAME_LEVELS_DATA,
  GameLevelDef,
  getCustomGameLevels,
  saveCustomGameLevels,
  resetGameLevelsToDefault,
} from '../data/gameLevelsData';

type ActiveTestTab = 'pretest' | 'posttest' | 'levels';

// Global helper: compress image file to standard optimal lightweight dataURL
export const compressImage = (
  file: File,
  callback: (dataUrl: string) => void,
  onComplete?: () => void
) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 700; // Optimal lightweight size for question and answer images
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        callback(dataUrl);
      }
      if (onComplete) onComplete();
    };
    img.onerror = () => {
      if (onComplete) onComplete();
    };
    img.src = event.target?.result as string;
  };
  reader.onerror = () => {
    if (onComplete) onComplete();
  };
  reader.readAsDataURL(file);
};

export const AdminTestsSettingsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTestTab>('pretest');

  // Pre-Test & Post-Test state
  const [preTestQuestions, setPreTestQuestions] = useState<PreTestQuestion[]>(() => getPreTestQuestions());
  const [postTestQuestions, setPostTestQuestions] = useState<PreTestQuestion[]>(() => getPostTestQuestions());

  // 10 Stages state
  const [gameLevels, setGameLevels] = useState<GameLevelDef[]>(() => getCustomGameLevels());
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');

  // Level Objectives state (Editable Objectives for Level 9 and all levels)
  const [editingLevelNum, setEditingLevelNum] = useState<number>(9);
  const [levelObjectivesText, setLevelObjectivesText] = useState<string>(() => {
    const l9 = getCustomGameLevels().find((l) => l.levelNumber === 9);
    return l9?.objectives || l9?.instructions || '';
  });
  const [isSavingObjectives, setIsSavingObjectives] = useState<boolean>(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addPosition, setAddPosition] = useState<'top' | 'bottom'>('bottom');
  const [editingQuestionType, setEditingQuestionType] = useState<ActiveTestTab>('pretest');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null); // null means new question
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);
  const [editingTargetLevel, setEditingTargetLevel] = useState<number>(1); // For levels

  // Form Fields for Modal
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formQuestionKind, setFormQuestionKind] = useState<'mcq' | 'matching'>('mcq');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formOptionImages, setFormOptionImages] = useState<(string | null | undefined)[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formPoints, setFormPoints] = useState<number>(50);
  const [formImageUrl, setFormImageUrl] = useState<string>('');

  // Loading Spinners states for enhanced UX
  const [isSavingModal, setIsSavingModal] = useState<boolean>(false);
  const [savingCardId, setSavingCardId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Inline editing ID for cards (guaranteed zero black screen!)
  const [inlineEditingCardId, setInlineEditingCardId] = useState<string | null>(null);

  // Zoom Image Modal
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  // Modal file input ref
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Direct card-level file upload target
  const [directUploadTarget, setDirectUploadTarget] = useState<{
    type: ActiveTestTab;
    questionId: string;
    levelNum?: number;
  } | null>(null);
  const directFileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize state when custom events are triggered (from Firebase real-time sync)
  useEffect(() => {
    const handlePreUpdate = (e: any) => {
      if (e.detail) setPreTestQuestions(e.detail);
    };
    const handlePostUpdate = (e: any) => {
      if (e.detail) setPostTestQuestions(e.detail);
    };
    const handleLevelsUpdate = (e: any) => {
      if (e.detail) setGameLevels(e.detail);
    };

    window.addEventListener('pretest-questions-updated', handlePreUpdate);
    window.addEventListener('posttest-questions-updated', handlePostUpdate);
    window.addEventListener('game-levels-updated', handleLevelsUpdate);

    return () => {
      window.removeEventListener('pretest-questions-updated', handlePreUpdate);
      window.removeEventListener('posttest-questions-updated', handlePostUpdate);
      window.removeEventListener('game-levels-updated', handleLevelsUpdate);
    };
  }, []);

  // Copy all PreTest questions to PostTest
  const handleCopyPreToPost = () => {
    if (preTestQuestions.length === 0) {
      showNotification('لا توجد أسئلة مسجلة في الاختبار القبلي لنسخها حالياً!', 'error');
      return;
    }
    const synced = copyPreTestQuestionsToPostTest();
    setPostTestQuestions(synced);
    showNotification(`✓ تم نسخ كافة أسئلة الاختبار القبلي (${synced.length} سؤال) إلى الاختبار البعدي فوراً ومزامنتها للجميع بنجاح`);
  };

  // Save / Update Level Objectives (and instructions) with real-time sync
  const handleSaveLevelObjectives = async (levelNum: number, newObjectives: string) => {
    setIsSavingObjectives(true);
    try {
      const updatedLevels = gameLevels.map((lvl) => {
        if (lvl.levelNumber === levelNum) {
          return {
            ...lvl,
            objectives: newObjectives.trim(),
            instructions: newObjectives.trim(),
          };
        }
        return lvl;
      });
      setGameLevels(updatedLevels);
      saveCustomGameLevels(updatedLevels, true);
      showNotification(`✓ تم حفظ وتحديث أهداف المستوى ${levelNum} بنجاح ومزامنتها لجميع الطلاب فوراً`);
    } finally {
      setTimeout(() => setIsSavingObjectives(false), 250);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Upload handler for Modal question image
  const handleModalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    compressImage(
      file,
      (dataUrl) => {
        setFormImageUrl(dataUrl);
        showNotification('✓ تم رفع ومعالجة صورة السؤال بنجاح');
      },
      () => setIsUploadingImage(false)
    );
    e.target.value = '';
  };

  // Upload handler for Modal answer option image
  const handleModalOptionImagePick = (optIdx: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setIsUploadingImage(true);
        compressImage(
          file,
          (dataUrl) => {
            const updated = [...formOptionImages];
            updated[optIdx] = dataUrl;
            setFormOptionImages(updated);
            showNotification(`✓ تم رفع وتثبيت صورة الإجابة رقم ${optIdx + 1}`);
          },
          () => setIsUploadingImage(false)
        );
      }
    };
    input.click();
  };

  const handleModalOptionImageRemove = (optIdx: number) => {
    const updated = [...formOptionImages];
    updated[optIdx] = '';
    setFormOptionImages(updated);
    showNotification(`✓ تم حذف صورة الإجابة رقم ${optIdx + 1}`);
  };

  // Trigger direct card upload
  const handleTriggerDirectUpload = (type: ActiveTestTab, questionId: string, levelNum?: number) => {
    setDirectUploadTarget({ type, questionId, levelNum });
    if (directFileInputRef.current) {
      directFileInputRef.current.value = '';
      directFileInputRef.current.click();
    }
  };

  // Handle direct file selection on card
  const handleDirectFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !directUploadTarget) return;

    setSavingCardId(directUploadTarget.questionId);
    setIsUploadingImage(true);
    compressImage(
      file,
      (dataUrl) => {
        if (directUploadTarget.type === 'pretest') {
          const updated = preTestQuestions.map((q) =>
            q.id === directUploadTarget.questionId ? { ...q, imageUrl: dataUrl } : q
          );
          setPreTestQuestions(updated);
          savePreTestQuestions(updated, true);
          showNotification('✓ تم رفع صورة السؤال في الاختبار القبلي ومزامنتها للجميع فوراً');
        } else if (directUploadTarget.type === 'posttest') {
          const updated = postTestQuestions.map((q) =>
            q.id === directUploadTarget.questionId ? { ...q, imageUrl: dataUrl } : q
          );
          setPostTestQuestions(updated);
          savePostTestQuestions(updated, true);
          showNotification('✓ تم رفع صورة السؤال في الاختبار البعدي ومزامنتها للجميع فوراً');
        } else if (directUploadTarget.type === 'levels' && directUploadTarget.levelNum !== undefined) {
          const updatedLevels = gameLevels.map((lvl) => {
            if (lvl.levelNumber !== directUploadTarget.levelNum) return lvl;
            return {
              ...lvl,
              questions: lvl.questions.map((q) =>
                q.id === directUploadTarget.questionId ? { ...q, imageUrl: dataUrl } : q
              ),
            };
          });
          setGameLevels(updatedLevels);
          saveCustomGameLevels(updatedLevels, true);
          showNotification(`✓ تم رفع صورة السؤال في المستوى ${directUploadTarget.levelNum} ومزامنتها للجميع فوراً`);
        }
        setSavingCardId(null);
        setDirectUploadTarget(null);
      },
      () => setIsUploadingImage(false)
    );
    e.target.value = '';
  };

  // Direct card set URL link
  const handleDirectSetImageUrl = (type: ActiveTestTab, questionId: string, cleanUrl: string, levelNum?: number) => {
    setSavingCardId(questionId);
    if (type === 'pretest') {
      const updated = preTestQuestions.map((q) =>
        q.id === questionId ? { ...q, imageUrl: cleanUrl || undefined } : q
      );
      setPreTestQuestions(updated);
      savePreTestQuestions(updated, true);
      showNotification(cleanUrl ? '✓ تم تحديث رابط صورة السؤال ومزامنته للجميع' : '✓ تم حذف صورة السؤال');
    } else if (type === 'posttest') {
      const updated = postTestQuestions.map((q) =>
        q.id === questionId ? { ...q, imageUrl: cleanUrl || undefined } : q
      );
      setPostTestQuestions(updated);
      savePostTestQuestions(updated, true);
      showNotification(cleanUrl ? '✓ تم تحديث رابط صورة السؤال ومزامنته للجميع' : '✓ تم حذف صورة السؤال');
    } else if (type === 'levels' && levelNum !== undefined) {
      const updatedLevels = gameLevels.map((lvl) => {
        if (lvl.levelNumber !== levelNum) return lvl;
        return {
          ...lvl,
          questions: lvl.questions.map((q) =>
            q.id === questionId ? { ...q, imageUrl: cleanUrl || undefined } : q
          ),
        };
      });
      setGameLevels(updatedLevels);
      saveCustomGameLevels(updatedLevels, true);
      showNotification(cleanUrl ? '✓ تم تحديث رابط صورة السؤال ومزامنته للجميع' : '✓ تم حذف صورة السؤال');
    }
    setTimeout(() => setSavingCardId(null), 300);
  };

  // Direct card remove image
  const handleDirectRemoveImage = (type: ActiveTestTab, questionId: string, levelNum?: number) => {
    setSavingCardId(questionId);
    if (type === 'pretest') {
      const updated = preTestQuestions.map((q) =>
        q.id === questionId ? { ...q, imageUrl: undefined } : q
      );
      setPreTestQuestions(updated);
      savePreTestQuestions(updated, true);
      showNotification('✓ تم حذف صورة السؤال بنجاح ومزامنة التحديث');
    } else if (type === 'posttest') {
      const updated = postTestQuestions.map((q) =>
        q.id === questionId ? { ...q, imageUrl: undefined } : q
      );
      setPostTestQuestions(updated);
      savePostTestQuestions(updated, true);
      showNotification('✓ تم حذف صورة السؤال بنجاح ومزامنة التحديث');
    } else if (type === 'levels' && levelNum !== undefined) {
      const updatedLevels = gameLevels.map((lvl) => {
        if (lvl.levelNumber !== levelNum) return lvl;
        return {
          ...lvl,
          questions: lvl.questions.map((q) =>
            q.id === questionId ? { ...q, imageUrl: undefined } : q
          ),
        };
      });
      setGameLevels(updatedLevels);
      saveCustomGameLevels(updatedLevels, true);
      showNotification('✓ تم حذف صورة السؤال بنجاح ومزامنة التحديث');
    }
    setTimeout(() => setSavingCardId(null), 300);
  };

  // Direct card set option image with instant Firebase sync & loading spinner
  const handleDirectSetOptionImage = (
    type: ActiveTestTab,
    questionId: string,
    optIdx: number,
    dataUrl: string,
    levelNum?: number
  ) => {
    setSavingCardId(questionId);
    if (type === 'pretest') {
      const updated = preTestQuestions.map((q) => {
        if (q.id !== questionId) return q;
        const curImgs = q.optionImages && q.optionImages.length > 0 ? [...q.optionImages] : new Array(q.options.length).fill('');
        while (curImgs.length < q.options.length) curImgs.push('');
        curImgs[optIdx] = dataUrl;
        return { ...q, optionImages: curImgs };
      });
      setPreTestQuestions(updated);
      savePreTestQuestions(updated, true);
      showNotification('✓ تم رفع صورة خيار الإجابة ومزامنتها للجميع فوراً');
    } else if (type === 'posttest') {
      const updated = postTestQuestions.map((q) => {
        if (q.id !== questionId) return q;
        const curImgs = q.optionImages && q.optionImages.length > 0 ? [...q.optionImages] : new Array(q.options.length).fill('');
        while (curImgs.length < q.options.length) curImgs.push('');
        curImgs[optIdx] = dataUrl;
        return { ...q, optionImages: curImgs };
      });
      setPostTestQuestions(updated);
      savePostTestQuestions(updated, true);
      showNotification('✓ تم رفع صورة خيار الإجابة ومزامنتها للجميع فوراً');
    } else if (type === 'levels' && levelNum !== undefined) {
      const updatedLevels = gameLevels.map((lvl) => {
        if (lvl.levelNumber !== levelNum) return lvl;
        return {
          ...lvl,
          questions: lvl.questions.map((q) => {
            if (q.id !== questionId) return q;
            const curImgs = q.optionImages && q.optionImages.length > 0 ? [...q.optionImages] : new Array(q.options.length).fill('');
            while (curImgs.length < q.options.length) curImgs.push('');
            curImgs[optIdx] = dataUrl;
            return { ...q, optionImages: curImgs };
          }),
        };
      });
      setGameLevels(updatedLevels);
      saveCustomGameLevels(updatedLevels, true);
      showNotification('✓ تم رفع صورة خيار الإجابة ومزامنتها للجميع فوراً');
    }
    setTimeout(() => setSavingCardId(null), 350);
  };

  // Direct card remove option image with instant Firebase sync
  const handleDirectRemoveOptionImage = (
    type: ActiveTestTab,
    questionId: string,
    optIdx: number,
    levelNum?: number
  ) => {
    setSavingCardId(questionId);
    if (type === 'pretest') {
      const updated = preTestQuestions.map((q) => {
        if (q.id !== questionId) return q;
        const curImgs = q.optionImages && q.optionImages.length > 0 ? [...q.optionImages] : new Array(q.options.length).fill('');
        curImgs[optIdx] = '';
        return { ...q, optionImages: curImgs };
      });
      setPreTestQuestions(updated);
      savePreTestQuestions(updated, true);
      showNotification('✓ تم حذف صورة خيار الإجابة ومزامنة التحديث');
    } else if (type === 'posttest') {
      const updated = postTestQuestions.map((q) => {
        if (q.id !== questionId) return q;
        const curImgs = q.optionImages && q.optionImages.length > 0 ? [...q.optionImages] : new Array(q.options.length).fill('');
        curImgs[optIdx] = '';
        return { ...q, optionImages: curImgs };
      });
      setPostTestQuestions(updated);
      savePostTestQuestions(updated, true);
      showNotification('✓ تم حذف صورة خيار الإجابة ومزامنة التحديث');
    } else if (type === 'levels' && levelNum !== undefined) {
      const updatedLevels = gameLevels.map((lvl) => {
        if (lvl.levelNumber !== levelNum) return lvl;
        return {
          ...lvl,
          questions: lvl.questions.map((q) => {
            if (q.id !== questionId) return q;
            const curImgs = q.optionImages && q.optionImages.length > 0 ? [...q.optionImages] : new Array(q.options.length).fill('');
            curImgs[optIdx] = '';
            return { ...q, optionImages: curImgs };
          }),
        };
      });
      setGameLevels(updatedLevels);
      saveCustomGameLevels(updatedLevels, true);
      showNotification('✓ تم حذف صورة خيار الإجابة ومزامنة التحديث');
    }
    setTimeout(() => setSavingCardId(null), 300);
  };

  // Open Add Modal with position (top or bottom)
  const handleOpenAddModal = (tab: ActiveTestTab, position: 'top' | 'bottom' = 'bottom') => {
    setEditingQuestionType(tab);
    setEditingQuestionId(null);
    setInsertAfterIndex(null);
    setAddPosition(position);
    setFormQuestionText('');
    setFormQuestionKind('mcq');
    setFormOptions(['', '', '', '']);
    setFormOptionImages(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormPoints(tab === 'levels' ? 34 : 50);
    setFormImageUrl('');
    setEditingTargetLevel(typeof selectedLevelFilter === 'number' ? selectedLevelFilter : 1);
    setIsModalOpen(true);
  };

  const handleOpenAddModalForIndex = (tab: ActiveTestTab, index: number, levelNum?: number) => {
    setEditingQuestionType(tab);
    setEditingQuestionId(null);
    setInsertAfterIndex(index);
    setFormQuestionText('');
    setFormQuestionKind('mcq');
    setFormOptions(['', '', '', '']);
    setFormOptionImages(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormPoints(tab === 'levels' ? 34 : 50);
    setFormImageUrl('');
    if (levelNum !== undefined) setEditingTargetLevel(levelNum);
    setIsModalOpen(true);
  };

  // Open Edit Modal for Pre-Test / Post-Test
  const handleOpenEditPrePostModal = (tab: 'pretest' | 'posttest', q: PreTestQuestion) => {
    setEditingQuestionType(tab);
    setEditingQuestionId(q.id);
    setFormQuestionText(q.question || '');
    const isMatching =
      q.questionType === 'matching' ||
      (Boolean(q.matchingPairs) && (q.matchingPairs?.length ?? 0) > 0) ||
      q.id === 'pt-4' ||
      q.id === 'pt-8';
    setFormQuestionKind(isMatching ? 'matching' : 'mcq');
    const opts = q.options && q.options.length > 0 ? [...q.options] : ['', ''];
    setFormOptions(opts);
    setFormOptionImages(
      q.optionImages && q.optionImages.length > 0
        ? [...q.optionImages]
        : new Array(opts.length).fill('')
    );
    setFormCorrectIndex(typeof q.correctIndex === 'number' ? q.correctIndex : 0);
    setFormExplanation(q.explanation || '');
    setFormPoints(q.points || 50);
    setFormImageUrl(q.imageUrl || '');
    setIsModalOpen(true);
  };

  // Open Edit Modal for Levels
  const handleOpenEditLevelModal = (levelNum: number, q: LevelQuestion) => {
    setEditingQuestionType('levels');
    setEditingQuestionId(q.id);
    setEditingTargetLevel(levelNum);
    setFormQuestionText(q.question || '');
    const isMatching =
      q.questionType === 'matching' ||
      (Boolean(q.matchingPairs) && (q.matchingPairs?.length ?? 0) > 0);
    setFormQuestionKind(isMatching ? 'matching' : 'mcq');
    const opts = q.options && q.options.length > 0 ? [...q.options] : ['', ''];
    setFormOptions(opts);
    setFormOptionImages(
      q.optionImages && q.optionImages.length > 0
        ? [...q.optionImages]
        : new Array(opts.length).fill('')
    );
    setFormCorrectIndex(typeof q.correctIndex === 'number' ? q.correctIndex : 0);
    setFormExplanation(q.explanation || '');
    setFormPoints(q.points || 34);
    setFormImageUrl(q.imageUrl || '');
    setIsModalOpen(true);
  };

  // Modal option handlers (Add / Remove / Change)
  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...formOptions];
    updated[idx] = val;
    setFormOptions(updated);
  };

  const handleAddOption = () => {
    if (formOptions.length >= 8) {
      showNotification('الحد الأقصى للخيارات هو 8 خيارات', 'error');
      return;
    }
    setFormOptions([...formOptions, '']);
    setFormOptionImages([...formOptionImages, '']);
  };

  const handleRemoveOption = (idx: number) => {
    if (formOptions.length <= 2) {
      showNotification('يجب أن يحتوي السؤال على خيارين على الأقل', 'error');
      return;
    }
    const updatedOpts = formOptions.filter((_, i) => i !== idx);
    const updatedImgs = formOptionImages.filter((_, i) => i !== idx);
    setFormOptions(updatedOpts);
    setFormOptionImages(updatedImgs);
    if (formCorrectIndex >= updatedOpts.length) {
      setFormCorrectIndex(updatedOpts.length - 1);
    }
    showNotification('✓ تم حذف خيار الإجابة');
  };

  // Save Modal Form with Loading Spinner & Option Images Support
  const handleSaveQuestion = async () => {
    if (!formQuestionText.trim()) {
      showNotification('يرجى كتابة نص السؤال أولاً', 'error');
      return;
    }

    // Clean options and optionImages keeping them strictly aligned
    const cleanPairs = formOptions
      .map((opt, idx) => ({
        text: opt.trim(),
        image: formOptionImages[idx]?.trim() || undefined,
      }))
      .filter((pair) => pair.text || pair.image);

    if (cleanPairs.length < 2) {
      showNotification('يرجى إدخال خيارين على الأقل (نص أو صورة)', 'error');
      return;
    }

    const cleanOptions = cleanPairs.map((p) => p.text);
    const cleanOptionImages = cleanPairs.map((p) => p.image);
    const safeCorrectIndex = formCorrectIndex >= cleanOptions.length ? 0 : formCorrectIndex;

    const isMatching = formQuestionKind === 'matching';
    const cleanMatchingPairs = isMatching
      ? cleanPairs.map((p, idx) => ({
          id: `pair-${Date.now()}-${idx}`,
          text: p.text,
          imageUrl: p.image || '',
        }))
      : undefined;

    setIsSavingModal(true);
    try {
      if (editingQuestionType === 'pretest') {
        let updated: PreTestQuestion[];
        if (editingQuestionId) {
          // Edit existing
          updated = preTestQuestions.map((q) =>
            q.id === editingQuestionId
              ? {
                  ...q,
                  question: formQuestionText.trim(),
                  options: cleanOptions,
                  optionImages: cleanOptionImages,
                  correctIndex: safeCorrectIndex,
                  explanation: formExplanation.trim(),
                  points: Number(formPoints) || 50,
                  imageUrl: formImageUrl.trim() || undefined,
                  questionType: formQuestionKind,
                  matchingPairs: cleanMatchingPairs,
                }
              : q
          );
        } else {
          // Add new (top, bottom, or below specific index)
          const newQ: PreTestQuestion = {
            id: `pt-custom-${Date.now()}`,
            question: formQuestionText.trim(),
            options: cleanOptions,
            optionImages: cleanOptionImages,
            correctIndex: safeCorrectIndex,
            explanation: formExplanation.trim(),
            points: Number(formPoints) || 50,
            imageUrl: formImageUrl.trim() || undefined,
            questionType: formQuestionKind,
            matchingPairs: cleanMatchingPairs,
          };
          if (insertAfterIndex !== null) {
            updated = [...preTestQuestions];
            updated.splice(insertAfterIndex + 1, 0, newQ);
          } else {
            updated = addPosition === 'top' ? [newQ, ...preTestQuestions] : [...preTestQuestions, newQ];
          }
        }
        setPreTestQuestions(updated);
        savePreTestQuestions(updated, true);
        // Mirror to PostTest as well
        setPostTestQuestions(updated);
        savePostTestQuestions(updated, true);
        showNotification('✓ تم حفظ وتحديث السؤال في الاختبارين القبلي والبعدي ومزامنتهما للجميع فوراً');
      } else if (editingQuestionType === 'posttest') {
        let updated: PreTestQuestion[];
        if (editingQuestionId) {
          // Edit existing
          updated = postTestQuestions.map((q) =>
            q.id === editingQuestionId
              ? {
                  ...q,
                  question: formQuestionText.trim(),
                  options: cleanOptions,
                  optionImages: cleanOptionImages,
                  correctIndex: safeCorrectIndex,
                  explanation: formExplanation.trim(),
                  points: Number(formPoints) || 50,
                  imageUrl: formImageUrl.trim() || undefined,
                  questionType: formQuestionKind,
                  matchingPairs: cleanMatchingPairs,
                }
              : q
          );
        } else {
          // Add new (top, bottom, or below specific index)
          const newQ: PreTestQuestion = {
            id: `post-custom-${Date.now()}`,
            question: formQuestionText.trim(),
            options: cleanOptions,
            optionImages: cleanOptionImages,
            correctIndex: safeCorrectIndex,
            explanation: formExplanation.trim(),
            points: Number(formPoints) || 50,
            imageUrl: formImageUrl.trim() || undefined,
            questionType: formQuestionKind,
            matchingPairs: cleanMatchingPairs,
          };
          if (insertAfterIndex !== null) {
            updated = [...postTestQuestions];
            updated.splice(insertAfterIndex + 1, 0, newQ);
          } else {
            updated = addPosition === 'top' ? [newQ, ...postTestQuestions] : [...postTestQuestions, newQ];
          }
        }
        setPostTestQuestions(updated);
        savePostTestQuestions(updated, true);
        showNotification('✓ تم حفظ وتحديث السؤال والإجابات وصور التوصيل في الاختبار البعدي فوراً');
      } else {
        // 10 Stages (levels)
        const updatedLevels = gameLevels.map((lvl) => {
          if (lvl.levelNumber !== editingTargetLevel) return lvl;

          let updatedQuestions: LevelQuestion[];
          if (editingQuestionId) {
            // Edit existing
            updatedQuestions = lvl.questions.map((q) =>
              q.id === editingQuestionId
                ? {
                    ...q,
                    question: formQuestionText.trim(),
                    options: cleanOptions,
                    optionImages: cleanOptionImages,
                    correctIndex: safeCorrectIndex,
                    explanation: formExplanation.trim(),
                    points: Number(formPoints) || 34,
                    imageUrl: formImageUrl.trim() || undefined,
                  }
                : q
            );
          } else {
            // Add new (top or bottom)
            const newQ: LevelQuestion = {
              id: `q${editingTargetLevel}-custom-${Date.now()}`,
              question: formQuestionText.trim(),
              options: cleanOptions,
              optionImages: cleanOptionImages,
              correctIndex: safeCorrectIndex,
              explanation: formExplanation.trim(),
              points: Number(formPoints) || 34,
              imageUrl: formImageUrl.trim() || undefined,
            };
            updatedQuestions = addPosition === 'top' ? [newQ, ...lvl.questions] : [...lvl.questions, newQ];
          }
          return { ...lvl, questions: updatedQuestions };
        });

        setGameLevels(updatedLevels);
        saveCustomGameLevels(updatedLevels, true);
        showNotification(`✓ تم حفظ وتحديث السؤال والإجابات في المستوى ${editingTargetLevel} فوراً`);
      }
    } finally {
      setTimeout(() => {
        setIsSavingModal(false);
        setIsModalOpen(false);
      }, 250);
    }
  };

  // Direct Inline Save from Card with Loading Spinner & Option Images Support
  const handleInlineSaveQuestion = async (
    type: ActiveTestTab,
    questionId: string,
    updatedData: {
      question: string;
      options: string[];
      optionImages?: (string | null | undefined)[];
      correctIndex: number;
      explanation: string;
      points: number;
      imageUrl?: string;
    },
    levelNum?: number
  ) => {
    if (!updatedData.question.trim()) {
      showNotification('يرجى كتابة نص السؤال', 'error');
      return;
    }

    const cleanPairs = updatedData.options
      .map((opt, idx) => ({
        text: opt.trim(),
        image: updatedData.optionImages?.[idx]?.trim() || undefined,
      }))
      .filter((pair) => pair.text || pair.image);

    if (cleanPairs.length < 2) {
      showNotification('يرجى إدخال خيارين على الأقل (نص أو صورة)', 'error');
      return;
    }

    const cleanOptions = cleanPairs.map((p) => p.text);
    const cleanOptionImages = cleanPairs.map((p) => p.image);
    const safeCorrectIndex = updatedData.correctIndex >= cleanOptions.length ? 0 : updatedData.correctIndex;

    setSavingCardId(questionId);
    try {
      if (type === 'pretest') {
        const updated = preTestQuestions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                question: updatedData.question.trim(),
                options: cleanOptions,
                optionImages: cleanOptionImages,
                correctIndex: safeCorrectIndex,
                explanation: updatedData.explanation.trim(),
                points: Number(updatedData.points) || 50,
                imageUrl: updatedData.imageUrl,
              }
            : q
        );
        setPreTestQuestions(updated);
        savePreTestQuestions(updated, true);
        showNotification('✓ تم حفظ وتحديث السؤال والإجابات في الاختبار القبلي ومزامنته فوراً للجميع');
      } else if (type === 'posttest') {
        const updated = postTestQuestions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                question: updatedData.question.trim(),
                options: cleanOptions,
                optionImages: cleanOptionImages,
                correctIndex: safeCorrectIndex,
                explanation: updatedData.explanation.trim(),
                points: Number(updatedData.points) || 50,
                imageUrl: updatedData.imageUrl,
              }
            : q
        );
        setPostTestQuestions(updated);
        savePostTestQuestions(updated, true);
        showNotification('✓ تم حفظ وتحديث السؤال والإجابات في الاختبار البعدي ومزامنته فوراً للجميع');
      } else if (type === 'levels' && levelNum !== undefined) {
        const updatedLevels = gameLevels.map((lvl) => {
          if (lvl.levelNumber !== levelNum) return lvl;
          return {
            ...lvl,
            questions: lvl.questions.map((q) =>
              q.id === questionId
                ? {
                    ...q,
                    question: updatedData.question.trim(),
                    options: cleanOptions,
                    optionImages: cleanOptionImages,
                    correctIndex: safeCorrectIndex,
                    explanation: updatedData.explanation.trim(),
                    points: Number(updatedData.points) || 34,
                    imageUrl: updatedData.imageUrl,
                  }
                : q
            ),
          };
        });
        setGameLevels(updatedLevels);
        saveCustomGameLevels(updatedLevels, true);
        showNotification(`✓ تم حفظ وتحديث السؤال والإجابات في المستوى ${levelNum} ومزامنته فوراً للجميع`);
      }
    } finally {
      setTimeout(() => {
        setSavingCardId(null);
        setInlineEditingCardId(null);
      }, 250);
    }
  };

  // Delete Question
  const handleDeleteQuestion = (type: ActiveTestTab, questionId: string, levelNum?: number) => {
    setSavingCardId(questionId);
    if (type === 'pretest') {
      const updated = preTestQuestions.filter((q) => q.id !== questionId);
      setPreTestQuestions(updated);
      savePreTestQuestions(updated, true);
      showNotification('✓ تم حذف السؤال من الاختبار القبلي ومزامنة التحديث فوراً');
    } else if (type === 'posttest') {
      const updated = postTestQuestions.filter((q) => q.id !== questionId);
      setPostTestQuestions(updated);
      savePostTestQuestions(updated, true);
      showNotification('✓ تم حذف السؤال من الاختبار البعدي ومزامنة التحديث فوراً');
    } else if (type === 'levels' && levelNum !== undefined) {
      const updatedLevels = gameLevels.map((lvl) => {
        if (lvl.levelNumber !== levelNum) return lvl;
        return {
          ...lvl,
          questions: lvl.questions.filter((q) => q.id !== questionId),
        };
      });
      setGameLevels(updatedLevels);
      saveCustomGameLevels(updatedLevels, true);
      showNotification(`✓ تم حذف السؤال من المستوى ${levelNum} ومزامنة التحديث فوراً`);
    }
    setTimeout(() => setSavingCardId(null), 300);
  };

  // Reset to Defaults
  const handleResetDefaults = (type: ActiveTestTab) => {
    if (type === 'pretest') {
      const def = resetPreTestQuestionsToDefault();
      setPreTestQuestions([...def]);
      showNotification('✓ تم استعادة الأسئلة الافتراضية للاختبار القبلي ومزامنتها بنجاح');
    } else if (type === 'posttest') {
      const def = resetPostTestQuestionsToDefault();
      setPostTestQuestions([...def]);
      showNotification('✓ تم استعادة الأسئلة الافتراضية للاختبار البعدي ومزامنتها بنجاح');
    } else {
      const def = resetGameLevelsToDefault();
      setGameLevels([...def]);
      showNotification('✓ تم استعادة الأسئلة الافتراضية للمراحل العشر ومزامنتها بنجاح');
    }
  };

  // Filter questions based on search query
  const filterQuestion = (q: PreTestQuestion | LevelQuestion) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      q.question.toLowerCase().includes(term) ||
      (q.explanation && q.explanation.toLowerCase().includes(term)) ||
      q.id.toLowerCase().includes(term) ||
      q.options.some((o) => o.toLowerCase().includes(term))
    );
  };

  const filteredPreTest = preTestQuestions.filter(filterQuestion);
  const filteredPostTest = postTestQuestions.filter(filterQuestion);

  // Flattened or filtered levels questions
  const filteredLevelsQuestions: { level: GameLevelDef; question: LevelQuestion }[] = [];
  gameLevels.forEach((lvl) => {
    if (selectedLevelFilter === 'all' || selectedLevelFilter === lvl.levelNumber) {
      lvl.questions.forEach((q) => {
        if (filterQuestion(q)) {
          filteredLevelsQuestions.push({ level: lvl, question: q });
        }
      });
    }
  });

  // Calculate statistics
  const preWithImages = preTestQuestions.filter((q) => !!q.imageUrl || q.optionImages?.some(Boolean)).length;
  const postWithImages = postTestQuestions.filter((q) => !!q.imageUrl || q.optionImages?.some(Boolean)).length;
  let totalLevelsQuestions = 0;
  let levelsWithImages = 0;
  gameLevels.forEach((l) => {
    totalLevelsQuestions += l.questions.length;
    levelsWithImages += l.questions.filter((q) => !!q.imageUrl || q.optionImages?.some(Boolean)).length;
  });

  return (
    <div className="space-y-6 font-['Cairo',_sans-serif] text-right" dir="rtl">
      {/* Hidden File Input for Card-level Direct Upload */}
      <input
        type="file"
        ref={directFileInputRef}
        onChange={handleDirectFileSelected}
        accept="image/*"
        className="hidden"
      />

      {/* Hidden File Input for Modal Upload */}
      <input
        type="file"
        ref={modalFileInputRef}
        onChange={handleModalImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Global Loading Overlay / Indicator when Uploading Image */}
      {isUploadingImage && (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0b0e20] border-2 border-amber-400 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <p className="text-sm font-black text-white">جاري معالجة ورفع الصورة وتثبيتها...</p>
            <span className="text-xs text-amber-300">يتم ضغط الصورة تلقائياً لسرعة المزامنة اللحظية</span>
          </div>
        </div>
      )}

      {/* Header with Title and Global Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/50 text-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.25)]">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] tracking-tight flex items-center gap-2">
                <span>إعدادات وضبط وتعديل بنك الأسئلة والاختبارات</span>
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold shadow-sm">
                  مزامنة لحظية مباشرة
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                صلاحية كاملة للأدمن لتعديل الأسئلة والإجابات، وضع صور في خيارات الإجابة، حذف الإجابة أو تعديلها، مع ظهور فوري للتعديلات للجميع.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Add Question */}
        <button
          type="button"
          onClick={() => handleOpenAddModal(activeTab, 'bottom')}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(251,191,36,0.35)] flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة سؤال جديد</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-red-950/90 border-red-500 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold">{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-xs opacity-75 hover:opacity-100 font-bold px-2 py-1 rounded bg-black/40 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 3 Section Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-1.5 rounded-2xl bg-[#090b17] border border-slate-800">
        {/* 1. الاختبار القبلي */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('pretest');
            setSearchQuery('');
          }}
          className={`p-4 rounded-xl text-right transition-all cursor-pointer border flex flex-col justify-between ${
            activeTab === 'pretest'
              ? 'bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(255,215,0,0.35)] font-black'
              : 'bg-[#101324] hover:bg-[#161a33] text-slate-300 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base font-black font-['Tajawal'] flex items-center gap-2">
              <span>🏎️ الاختبار القبلي (Pre-Test)</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeTab === 'pretest' ? 'bg-slate-950 text-[#ffd700]' : 'bg-slate-900 text-slate-300'
              }`}
            >
              {preTestQuestions.length} سؤال
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs opacity-90">
            <span>النقاط: {preTestQuestions.reduce((a, b) => a + (b.points || 0), 0)} XP</span>
            <span>•</span>
            <span>بصور وأسئلة: {preWithImages}</span>
          </div>
        </button>

        {/* 2. الاختبار البعدي */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('posttest');
            setSearchQuery('');
          }}
          className={`p-4 rounded-xl text-right transition-all cursor-pointer border flex flex-col justify-between ${
            activeTab === 'posttest'
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.35)] font-black'
              : 'bg-[#101324] hover:bg-[#161a33] text-slate-300 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base font-black font-['Tajawal'] flex items-center gap-2">
              <span>🎯 الاختبار البعدي (Post-Test)</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeTab === 'posttest' ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              {postTestQuestions.length} سؤال
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs opacity-90">
            <span>النقاط: {postTestQuestions.reduce((a, b) => a + (b.points || 0), 0)} XP</span>
            <span>•</span>
            <span>بصور وأسئلة: {postWithImages}</span>
          </div>
        </button>

        {/* 3. المراحل العشر */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('levels');
            setSearchQuery('');
          }}
          className={`p-4 rounded-xl text-right transition-all cursor-pointer border flex flex-col justify-between ${
            activeTab === 'levels'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white border-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.35)] font-black'
              : 'bg-[#101324] hover:bg-[#161a33] text-slate-300 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base font-black font-['Tajawal'] flex items-center gap-2">
              <span>🎮 أسئلة المراحل الـ 10 (Levels)</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeTab === 'levels' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-900 text-slate-300'
              }`}
            >
              {totalLevelsQuestions} سؤال
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs opacity-90">
            <span>10 مراحل متدرجة</span>
            <span>•</span>
            <span>بصور: {levelsWithImages}</span>
          </div>
        </button>
      </div>

      {/* Filter / Search Bar & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d1024] p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم السؤال، نصه، خيارات الإجابة، أو التفسير العلمي..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white text-xs sm:text-sm outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              مسح
            </button>
          )}
        </div>

        {/* If tab is Levels, show stage selector */}
        {activeTab === 'levels' && (
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedLevelFilter}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setSelectedLevelFilter(val);
                if (typeof val === 'number') {
                  setEditingLevelNum(val);
                  const targetLvl = gameLevels.find((l) => l.levelNumber === val);
                  setLevelObjectivesText(targetLvl?.objectives || targetLvl?.instructions || '');
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">جميع المراحل (10 مراحل)</option>
              {gameLevels.map((lvl) => (
                <option key={lvl.levelNumber} value={lvl.levelNumber}>
                  المستوى {lvl.levelNumber}: {lvl.shortTitle} ({lvl.questions.length})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset to Defaults button */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('هل أنت متأكد؟ سيتم حذف جميع الأسئلة والمستويات من المتصفح؟')) {
              localStorage.removeItem('cp_pretest_questions_bank_v2');
              localStorage.removeItem('cp_posttest_questions_bank_v2');
              localStorage.removeItem('cp_game_levels_storage_v1');
              window.location.reload();
            }
          }}
          className="px-4 py-2.5 rounded-xl border border-red-900 bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-red-100 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
          title="حذف كل محتوى الأسئلة والمستويات من هذا المتصفح"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف كافة محتوى الأسئلة (بدء من الصفر)</span>
        </button>
      </div>

      {/* ======================= SECTION 1: PRE-TEST QUESTIONS ======================= */}
      {activeTab === 'pretest' && (
        <div className="space-y-4">
          {/* Top Add Question Button in Pre-Test */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40">
            <span className="text-xs font-bold text-amber-200">
              عرض {filteredPreTest.length} من إجمالي {preTestQuestions.length} سؤال في الاختبار القبلي
            </span>
            <button
              type="button"
              onClick={() => handleOpenAddModal('pretest', 'top')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>➕ إضافة سؤال جديد في أعلى الاختبار القبلي (البداية)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredPreTest.map((q, idx) => (
              <QuestionAdminCard
                key={q.id}
                index={idx + 1}
                question={q}
                isInlineEditing={inlineEditingCardId === q.id}
                isSavingThisCard={savingCardId === q.id}
                onToggleInlineEdit={() => setInlineEditingCardId(inlineEditingCardId === q.id ? null : q.id)}
                onSaveInline={(updated) => handleInlineSaveQuestion('pretest', q.id, updated)}
                onOpenModalEdit={() => handleOpenEditPrePostModal('pretest', q)}
                onDelete={() => handleDeleteQuestion('pretest', q.id)}
                onZoomImage={(url) => setZoomedImageUrl(url)}
                onTriggerFileUpload={() => handleTriggerDirectUpload('pretest', q.id)}
                onSetImageUrl={(url) => handleDirectSetImageUrl('pretest', q.id, url)}
                onRemoveImage={() => handleDirectRemoveImage('pretest', q.id)}
                onSetOptionImage={(optIdx, dataUrl) => handleDirectSetOptionImage('pretest', q.id, optIdx, dataUrl)}
                onRemoveOptionImage={(optIdx) => handleDirectRemoveOptionImage('pretest', q.id, optIdx)}
                onAddBelow={() => handleOpenAddModalForIndex('pretest', idx)}
              />
            ))}
            {filteredPreTest.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400 text-sm">
                لم يتم العثور على أي أسئلة مطابقة للبحث
              </div>
            )}
          </div>

          {/* Bottom Add Question Button in Pre-Test */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleOpenAddModal('pretest', 'bottom')}
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-dashed border-amber-500/50 hover:border-amber-400 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 hover:text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>➕ إضافة سؤال جديد في نهاية الاختبار القبلي</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================= SECTION 2: POST-TEST QUESTIONS ======================= */}
      {activeTab === 'posttest' && (
        <div className="space-y-4">
          {/* Top Add Question Button in Post-Test */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/40">
            <span className="text-xs font-bold text-purple-200">
              عرض {filteredPostTest.length} من إجمالي {postTestQuestions.length} سؤال في الاختبار البعدي
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPreToPost}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                title="نسخ كافة أسئلة الاختبار القبلي ومطابقتها في الاختبار البعدي فوراً"
              >
                <Copy className="w-4 h-4 text-amber-400" />
                <span>📋 نسخ ومطابقة كافة أسئلة القبلي (53 سؤالاً) للبعدي</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddModal('posttest', 'top')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>➕ إضافة سؤال جديد في أعلى الاختبار البعدي (البداية)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredPostTest.map((q, idx) => (
              <QuestionAdminCard
                key={q.id}
                index={idx + 1}
                question={q}
                isInlineEditing={inlineEditingCardId === q.id}
                isSavingThisCard={savingCardId === q.id}
                onToggleInlineEdit={() => setInlineEditingCardId(inlineEditingCardId === q.id ? null : q.id)}
                onSaveInline={(updated) => handleInlineSaveQuestion('posttest', q.id, updated)}
                onOpenModalEdit={() => handleOpenEditPrePostModal('posttest', q)}
                onDelete={() => handleDeleteQuestion('posttest', q.id)}
                onZoomImage={(url) => setZoomedImageUrl(url)}
                onTriggerFileUpload={() => handleTriggerDirectUpload('posttest', q.id)}
                onSetImageUrl={(url) => handleDirectSetImageUrl('posttest', q.id, url)}
                onRemoveImage={() => handleDirectRemoveImage('posttest', q.id)}
                onSetOptionImage={(optIdx, dataUrl) => handleDirectSetOptionImage('posttest', q.id, optIdx, dataUrl)}
                onRemoveOptionImage={(optIdx) => handleDirectRemoveOptionImage('posttest', q.id, optIdx)}
                onAddBelow={() => handleOpenAddModalForIndex('posttest', idx)}
              />
            ))}
            {filteredPostTest.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400 text-sm">
                لم يتم العثور على أي أسئلة مطابقة للبحث
              </div>
            )}
          </div>

          {/* Bottom Add Question Button in Post-Test */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleOpenAddModal('posttest', 'bottom')}
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-dashed border-purple-500/50 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 hover:text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>➕ إضافة سؤال جديد في نهاية الاختبار البعدي</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================= SECTION 3: THE 10 STAGES QUESTIONS ======================= */}
      {activeTab === 'levels' && (
        <div className="space-y-5">
          {/* ================= LEVEL OBJECTIVES / INSTRUCTIONS EDITOR CARD ================= */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0d1433] via-[#121c45] to-[#0d1433] border-2 border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.2)] space-y-4 text-right">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-400/40">
                      {`المستوى ${editingLevelNum}`}
                    </span>
                    <span className="text-[11px] text-amber-300 font-bold">
                      أهداف المستوى
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] mt-0.5">
                    {`أهداف المستوى ${editingLevelNum}`}
                  </h3>
                </div>
              </div>

              {/* Level Selector for Objectives */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-slate-300 font-bold">تحديد المستوى لتعديل أهدافه:</span>
                <select
                  value={editingLevelNum}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setEditingLevelNum(num);
                    const targetLvl = gameLevels.find((l) => l.levelNumber === num);
                    setLevelObjectivesText(targetLvl?.objectives || targetLvl?.instructions || '');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/50 text-cyan-200 text-xs font-bold outline-none cursor-pointer"
                >
                  {gameLevels.map((lvl) => (
                    <option key={lvl.levelNumber} value={lvl.levelNumber}>
                      المستوى {lvl.levelNumber}: {lvl.shortTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                نص أهداف المستوى:
              </label>
              <textarea
                value={levelObjectivesText}
                onChange={(e) => setLevelObjectivesText(e.target.value)}
                rows={4}
                placeholder="اكتب أهداف المستوى هنا..."
                className="w-full p-3.5 rounded-2xl bg-slate-950/90 border border-slate-700 focus:border-cyan-400 text-white text-xs leading-relaxed outline-none transition font-['IBM_Plex_Sans_Arabic']"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-400">
                ✨ تنعكس تعديلات الأهداف لحظياً للطلاب
              </span>
              <button
                type="button"
                disabled={isSavingObjectives}
                onClick={() => handleSaveLevelObjectives(editingLevelNum, levelObjectivesText)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                {isSavingObjectives ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>💾 حفظ وتحديث أهداف المستوى ومزامنتها فوراً</span>
              </button>
            </div>
          </div>

          {/* Top Add Question Button in 10 Stages */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/40">
            <span className="text-xs font-bold text-blue-200">
              {selectedLevelFilter === 9
                ? `عرض ${filteredLevelsQuestions.length} نشاط في المستوى 9 (أنشطة تطبيقية يقوم بها الطالب)`
                : `عرض ${filteredLevelsQuestions.length} سؤال في المراحل التعليمية العشر ${typeof selectedLevelFilter === 'number' ? `(المستوى ${selectedLevelFilter})` : ''}`}
            </span>
            <button
              type="button"
              onClick={() => handleOpenAddModal('levels', 'top')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>
                {selectedLevelFilter === 9
                  ? '➕ إضافة نشاط جديد في أعلى المستوى 9 (البداية)'
                  : '➕ إضافة سؤال جديد في أعلى المراحل العشر (البداية)'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredLevelsQuestions.map(({ level, question }, idx) => (
              <QuestionAdminCard
                key={question.id}
                index={idx + 1}
                levelBadge={
                  level.levelNumber === 9
                    ? `المستوى 9: أنشطة ومهام يقوم بها الطالب`
                    : `المستوى ${level.levelNumber}: ${level.shortTitle}`
                }
                question={question}
                isInlineEditing={inlineEditingCardId === question.id}
                isSavingThisCard={savingCardId === question.id}
                onToggleInlineEdit={() => setInlineEditingCardId(inlineEditingCardId === question.id ? null : question.id)}
                onSaveInline={(updated) => handleInlineSaveQuestion('levels', question.id, updated, level.levelNumber)}
                onOpenModalEdit={() => handleOpenEditLevelModal(level.levelNumber, question)}
                onDelete={() => handleDeleteQuestion('levels', question.id, level.levelNumber)}
                onZoomImage={(url) => setZoomedImageUrl(url)}
                onTriggerFileUpload={() => handleTriggerDirectUpload('levels', question.id, level.levelNumber)}
                onSetImageUrl={(url) => handleDirectSetImageUrl('levels', question.id, url, level.levelNumber)}
                onRemoveImage={() => handleDirectRemoveImage('levels', question.id, level.levelNumber)}
                onSetOptionImage={(optIdx, dataUrl) => handleDirectSetOptionImage('levels', question.id, optIdx, dataUrl, level.levelNumber)}
                onRemoveOptionImage={(optIdx) => handleDirectRemoveOptionImage('levels', question.id, optIdx, level.levelNumber)}
                onAddBelow={() => handleOpenAddModalForIndex('levels', idx, level.levelNumber)}
              />
            ))}
            {filteredLevelsQuestions.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400 text-sm">
                لم يتم العثور على أي أسئلة مطابقة للبحث
              </div>
            )}
          </div>

          {/* Bottom Add Question Button in 10 Stages */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleOpenAddModal('levels', 'bottom')}
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-dashed border-blue-500/50 hover:border-blue-400 bg-blue-950/20 hover:bg-blue-950/40 text-blue-300 hover:text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>
                {selectedLevelFilter === 9
                  ? '➕ إضافة نشاط جديد في نهاية المستوى 9 (نشاط يقوم به الطالب)'
                  : '➕ إضافة سؤال جديد في نهاية المراحل العشر'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ======================= ADD / EDIT MODAL (SOLID, HIGH CONTRAST, ZERO BLACK SCREEN) ======================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingModal) setIsModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-[#0f142e] border-2 border-amber-400/90 p-5 sm:p-7 shadow-[0_0_60px_rgba(251,191,36,0.3)] space-y-5 text-right my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-['Tajawal']">
                    {editingQuestionType === 'levels' && editingTargetLevel === 9
                      ? (editingQuestionId ? 'تعديل نشاط المستوى 9 (نشاط يقوم به الطالب)' : `إضافة نشاط جديد في المستوى 9 (${addPosition === 'top' ? 'في البداية' : 'في النهاية'})`)
                      : (editingQuestionId ? 'تعديل السؤال وخيارات الإجابة والصور' : `إضافة سؤال جديد (${addPosition === 'top' ? 'في البداية' : 'في النهاية'})`)}
                  </h3>
                  <span className="text-xs text-amber-300 font-bold">
                    {editingQuestionType === 'pretest'
                      ? 'الاختبار القبلي (Pre-Test)'
                      : editingQuestionType === 'posttest'
                      ? 'الاختبار البعدي (Post-Test)'
                      : editingTargetLevel === 9
                      ? 'المستوى 9: أنشطة ومهام تطبيقية يقوم بها الطالب'
                      : `المراحل العشر (المستوى ${editingTargetLevel})`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={isSavingModal}
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Position Selector if new */}
            {!editingQuestionId && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-300 font-bold ml-2">موضع إضافة السؤال:</span>
                <button
                  type="button"
                  onClick={() => setAddPosition('top')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    addPosition === 'top'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  في أعلى القسم (البداية)
                </button>
                <button
                  type="button"
                  onClick={() => setAddPosition('bottom')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    addPosition === 'bottom'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  في نهاية القسم
                </button>
              </div>
            )}

            {/* If Tab is Levels, allow switching Target Level */}
            {editingQuestionType === 'levels' && !editingQuestionId && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المستوى التابع له السؤال (1 إلى 10):
                </label>
                <select
                  value={editingTargetLevel}
                  onChange={(e) => setEditingTargetLevel(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-amber-400 outline-none cursor-pointer"
                >
                  {gameLevels.map((lvl) => (
                    <option key={lvl.levelNumber} value={lvl.levelNumber}>
                      المستوى {lvl.levelNumber}: {lvl.shortTitle}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Question Type Selector: MCQ vs Matching Table */}
            <div className="p-3.5 rounded-2xl bg-[#0d1226] border border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                نوع السؤال ونمطه التفاعلي:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormQuestionKind('mcq')}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    formQuestionKind === 'mcq'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>🔘 اختيار من متعدد عادي (MCQ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormQuestionKind('matching')}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    formQuestionKind === 'matching'
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-300 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>🔗 سؤال توصيل وترتيب صور (Matching)</span>
                </button>
              </div>

              {formQuestionKind === 'matching' && (
                <div className="p-2.5 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/40 text-[11px] text-fuchsia-200 leading-relaxed font-['Cairo']">
                  💡 <strong>نمط التوصيل:</strong> اكتب في كل صف العبارة/الخطوة (الجملة في الجدول) وضع الصورة المقابلة لها. سيقوم الطالب بسحب الصور غير المرتبة لوضعها في المكان الصحيح بالجدول.
                </div>
              )}
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                {editingQuestionType === 'levels' && editingTargetLevel === 9
                  ? 'نص النشاط / المهمة (نشاط يقوم به الطالب):'
                  : 'نص السؤال:'} <span className="text-amber-400">*</span>
              </label>
              <textarea
                rows={3}
                value={formQuestionText}
                onChange={(e) => setFormQuestionText(e.target.value)}
                placeholder="اكتب نص السؤال هنا بدقة ووضوح..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs sm:text-sm leading-relaxed outline-none transition-all resize-y"
              />
            </div>

            {/* QUESTION IMAGE ATTACHMENT SECTION */}
            <div className="p-4 rounded-2xl bg-[#0a0d1f] border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>الصورة التوضيحية للسؤال (رفع ملف من الجهاز أو رابط مباشر)</span>
                </span>
                {formImageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('')}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الصورة</span>
                  </button>
                )}
              </div>

              {/* Image Preview if present */}
              {formImageUrl && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-black/60 p-2 flex justify-center items-center">
                  <img
                    src={formImageUrl}
                    alt="معاينة صورة السؤال"
                    className="max-h-56 w-auto max-w-full rounded-xl object-contain shadow-lg cursor-pointer"
                    onClick={() => setZoomedImageUrl(formImageUrl)}
                  />
                </div>
              )}

              {/* 2 Clear Options: Upload File OR Paste Direct URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>اختر ملف صورة السؤال من جهازك</span>
                </button>

                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={formImageUrl.startsWith('data:') ? '' : formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="أو الصق رابط صورة مباشر (URL)..."
                    className="w-full pr-9 pl-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ANSWER OPTIONS LIST WITH DYNAMIC IMAGES, ADD & DELETE OPTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-200 block">
                    {formQuestionKind === 'matching'
                      ? 'جمل وخطوات الجدول وصور التوصيل المقابلة لها (سؤال توصيل):'
                      : 'خيارات الإجابة وصورها (حدد الإجابة الصحيحة بالدائرة، ويمكنك إضافة صور لكل خيار أو حذفه):'}
                  </label>
                  <span className="text-[11px] text-amber-300/80 font-medium">
                    {formQuestionKind === 'matching'
                      ? 'اكتب الجملة في الجدول ثم اختر صورة التوصيل المقابلة لها (يقوم الطالب بسحب الصور لوضعها بالجدول):'
                      : 'يمكن وضع صورة لكل خيار إجابة بالضغط على زر 📷 صورة الخيار'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 hover:text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{formQuestionKind === 'matching' ? '➕ إضافة جملة وصورة توصيل' : '➕ إضافة إجابة جديدة'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {formOptions.map((opt, idx) => {
                  const optImage = formOptionImages[idx];
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition-all space-y-2.5 ${
                        formQuestionKind === 'matching'
                          ? 'bg-fuchsia-950/20 border-fuchsia-500/50 shadow-[0_0_15px_rgba(192,132,252,0.15)]'
                          : formCorrectIndex === idx
                          ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {formQuestionKind === 'matching' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-fuchsia-950 border border-fuchsia-500/60 text-fuchsia-300 font-bold text-[10px] shrink-0">
                            صف #{idx + 1}
                          </span>
                        ) : (
                          <input
                            type="radio"
                            name="correct-option-group"
                            id={`opt-radio-${idx}`}
                            checked={formCorrectIndex === idx}
                            onChange={() => setFormCorrectIndex(idx)}
                            className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer shrink-0"
                            title="تحديد هذا الخيار كإجابة صحيحة"
                          />
                        )}
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][idx] || idx + 1}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={
                            formQuestionKind === 'matching'
                              ? `الجملة / العبارة رقم ${idx + 1} بالجدول...`
                              : `نص الخيار رقم ${idx + 1}...`
                          }
                          className="flex-1 bg-slate-900/80 border border-slate-700/80 focus:border-amber-400 text-white text-xs sm:text-sm outline-none px-3 py-1.5 rounded-xl"
                        />

                        {/* Pick image for this option */}
                        <button
                          type="button"
                          onClick={() => handleModalOptionImagePick(idx)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-sm"
                          title={formQuestionKind === 'matching' ? 'رفع صورة التوصيل المقابلة لهذه الجملة' : 'رفع صورة لهذا الخيار من جهازك'}
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>{formQuestionKind === 'matching' ? 'صورة التوصيل' : 'صورة الخيار'}</span>
                        </button>

                        {/* Delete this option */}
                        {formOptions.length > 2 ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="px-2.5 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-500/60 text-red-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
                            title="حذف هذا الخيار من الإجابات"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>حذف</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 px-2 py-1 font-bold shrink-0">
                            (حد أدنى خيارين)
                          </span>
                        )}
                      </div>

                      {/* Attached Option Image Preview and URL Input */}
                      {optImage ? (
                        <div className="flex items-center gap-3 pr-8 pt-1">
                          <div
                            onClick={() => setZoomedImageUrl(optImage)}
                            className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400/80 bg-black/70 p-0.5 cursor-pointer hover:scale-105 transition-transform shrink-0 shadow"
                            title="انقر لتكبير صورة الإجابة"
                          >
                            <img
                              src={optImage}
                              alt={`صورة الخيار ${idx + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              <span>مرفق صورة مع هذا الخيار</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleModalOptionImageRemove(idx)}
                              className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer w-fit"
                            >
                              <X className="w-3 h-3" />
                              <span>إزالة صورة الخيار</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pr-8">
                          <input
                            type="url"
                            placeholder="أو الصق رابط صورة مباشر لهذا الخيار (https://...)..."
                            className="w-full px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 text-[11px] outline-none"
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                const updated = [...formOptionImages];
                                updated[idx] = e.target.value.trim();
                                setFormOptionImages(updated);
                                e.target.value = '';
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Points & Explanation Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  نقاط السؤال (XP):
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={formPoints}
                  onChange={(e) => setFormPoints(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[#ffd700] text-sm font-black font-mono outline-none text-center"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  التغذية الراجعة والتفسير العلمي (Explanation):
                </label>
                <input
                  type="text"
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="الشرح والتفسير العلمي الذي يظهر للطالب بعد إتمام الإجابة..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Modal Actions with Loading Spinner */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSavingModal}
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSavingModal}
                onClick={handleSaveQuestion}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/50 cursor-pointer flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {isSavingModal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>جاري الحفظ والمزامنة السحابية...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ ومزامنة عبر فايربيس</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= IMAGE ZOOM MODAL ======================= */}
      {zoomedImageUrl && (
        <div
          onClick={() => setZoomedImageUrl(null)}
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2 bg-[#080914] rounded-3xl border-2 border-[#ffd700] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setZoomedImageUrl(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-black/80 text-white hover:bg-slate-800 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImageUrl}
              alt="تكبير الصورة"
              className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ======================= SINGLE QUESTION CARD COMPONENT WITH INLINE EDITING & LOADING SPINNERS =======================
interface QuestionAdminCardProps {
  index: number;
  levelBadge?: string;
  question: PreTestQuestion | LevelQuestion;
  isInlineEditing: boolean;
  isSavingThisCard?: boolean;
  onToggleInlineEdit: () => void;
  onSaveInline: (updatedData: {
    question: string;
    options: string[];
    optionImages?: (string | null | undefined)[];
    correctIndex: number;
    explanation: string;
    points: number;
    imageUrl?: string;
  }) => void;
  onOpenModalEdit: () => void;
  onDelete: () => void;
  onZoomImage: (url: string) => void;
  onTriggerFileUpload: () => void;
  onSetImageUrl: (url: string) => void;
  onRemoveImage: () => void;
  onSetOptionImage: (optIdx: number, dataUrl: string) => void;
  onRemoveOptionImage: (optIdx: number) => void;
  onAddBelow?: () => void;
}

const QuestionAdminCard: React.FC<QuestionAdminCardProps> = ({
  index,
  levelBadge,
  question,
  isInlineEditing,
  isSavingThisCard = false,
  onToggleInlineEdit,
  onSaveInline,
  onOpenModalEdit,
  onDelete,
  onZoomImage,
  onTriggerFileUpload,
  onSetImageUrl,
  onRemoveImage,
  onSetOptionImage,
  onRemoveOptionImage,
  onAddBelow,
}) => {
  // Mini state for direct card option URL input
  const [activeOptionUrlIdx, setActiveOptionUrlIdx] = useState<number | null>(null);
  const [optionUrlInputValue, setOptionUrlInputValue] = useState<string>('');

  const handlePickDirectOptionImage = (optIdx: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        compressImage(file, (dataUrl) => {
          onSetOptionImage(optIdx, dataUrl);
        });
      }
    };
    input.click();
  };

  // Local state for inline editing
  const [draftQuestion, setDraftQuestion] = useState(question.question || '');
  const [draftOptions, setDraftOptions] = useState<string[]>(
    question.options && question.options.length > 0 ? [...question.options] : ['', '']
  );
  const [draftOptionImages, setDraftOptionImages] = useState<(string | null | undefined)[]>(
    question.options
      ? question.optionImages && question.optionImages.length > 0
        ? [...question.optionImages]
        : new Array(question.options.length).fill('')
      : ['', '']
  );
  const [draftCorrectIndex, setDraftCorrectIndex] = useState(
    typeof question.correctIndex === 'number' ? question.correctIndex : 0
  );
  const [draftExplanation, setDraftExplanation] = useState(question.explanation || '');
  const [draftPoints, setDraftPoints] = useState(question.points || 50);
  const [draftImageUrl, setDraftImageUrl] = useState(question.imageUrl || '');

  // Inline URL input bar toggle
  const [showUrlInputBar, setShowUrlInputBar] = useState(false);
  const [urlBarValue, setUrlBarValue] = useState(question.imageUrl || '');

  // Confirm delete UI state (no window.confirm!)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync draft state when question prop changes
  useEffect(() => {
    setDraftQuestion(question.question || '');
    const opts = question.options && question.options.length > 0 ? [...question.options] : ['', ''];
    setDraftOptions(opts);
    setDraftOptionImages(
      question.optionImages && question.optionImages.length > 0
        ? [...question.optionImages]
        : new Array(opts.length).fill('')
    );
    setDraftCorrectIndex(typeof question.correctIndex === 'number' ? question.correctIndex : 0);
    setDraftExplanation(question.explanation || '');
    setDraftPoints(question.points || 50);
    setDraftImageUrl(question.imageUrl || '');
    setUrlBarValue(question.imageUrl || '');
  }, [question]);

  const handleSaveInlineForm = () => {
    onSaveInline({
      question: draftQuestion,
      options: draftOptions,
      optionImages: draftOptionImages,
      correctIndex: draftCorrectIndex,
      explanation: draftExplanation,
      points: draftPoints,
      imageUrl: draftImageUrl.trim() || undefined,
    });
  };

  const handleAddInlineOption = () => {
    if (draftOptions.length >= 8) return;
    setDraftOptions([...draftOptions, '']);
    setDraftOptionImages([...draftOptionImages, '']);
  };

  const handleRemoveInlineOption = (idx: number) => {
    if (draftOptions.length <= 2) return;
    const updatedOpts = draftOptions.filter((_, i) => i !== idx);
    const updatedImgs = draftOptionImages.filter((_, i) => i !== idx);
    setDraftOptions(updatedOpts);
    setDraftOptionImages(updatedImgs);
    if (draftCorrectIndex >= updatedOpts.length) {
      setDraftCorrectIndex(updatedOpts.length - 1);
    }
  };

  const handlePickOptionImage = (optIdx: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        compressImage(file, (dataUrl) => {
          const updated = [...draftOptionImages];
          updated[optIdx] = dataUrl;
          setDraftOptionImages(updated);
        });
      }
    };
    input.click();
  };

  const handleRemoveDraftOptionImage = (optIdx: number) => {
    const updated = [...draftOptionImages];
    updated[optIdx] = '';
    setDraftOptionImages(updated);
  };

  return (
    <div
      className={`p-5 rounded-2xl bg-[#090c1e] border-2 transition-all space-y-4 relative ${
        isSavingThisCard
          ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.35)]'
          : isInlineEditing
          ? 'border-amber-400 shadow-xl'
          : 'border-slate-800/90 hover:border-amber-500/40'
      }`}
    >
      {/* Loading banner on the card when saving or uploading */}
      {isSavingThisCard && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 font-black text-xs shadow-md animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>جاري المزامنة فوراً...</span>
        </div>
      )}

      {/* Top Header of the Question Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
            #{index}
          </span>
          {levelBadge && (
            <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold">
              {levelBadge}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold">
            +{question.points} XP
          </span>
          {question.imageUrl && (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>صورة سؤال</span>
            </span>
          )}
          {question.optionImages?.some(Boolean) && (
            <span className="px-2 py-0.5 rounded-lg bg-blue-950/70 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>صور بالإجابات</span>
            </span>
          )}
          {(question.questionType === 'matching' || (Boolean(question.matchingPairs) && (question.matchingPairs?.length ?? 0) > 0) || question.id === 'pt-4' || question.id === 'pt-8') && (
            <span className="px-2.5 py-0.5 rounded-lg bg-fuchsia-950/90 border border-fuchsia-500/60 text-fuchsia-300 font-bold text-[10px] flex items-center gap-1 shadow-sm">
              <span>🔗 سؤال توصيل وترتيب صور</span>
            </span>
          )}
        </div>

        {/* Action Buttons: Direct File Upload / Link / Edit / Delete */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct File Upload button on every question */}
          <button
            type="button"
            onClick={onTriggerFileUpload}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="اختر ملف صورة من جهازك لهذا السؤال مباشرة"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>اختر صورة السؤال</span>
          </button>

          {/* Direct Link button */}
          <button
            type="button"
            onClick={() => setShowUrlInputBar(!showUrlInputBar)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
            title="إضافة أو تعديل رابط صورة السؤال"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>رابط صورة</span>
          </button>

          {/* Inline Edit Question button (Toggle) */}
          <button
            type="button"
            onClick={onToggleInlineEdit}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
              isInlineEditing
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30'
                : 'bg-violet-950/80 hover:bg-violet-900 border-violet-500/60 text-violet-200 hover:text-white'
            }`}
            title="تعديل هذا السؤال وخيارات إجابته وصورها مباشرة في مكانه"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isInlineEditing ? 'إغلاق التعديل' : 'تعديل السؤال والإجابات'}</span>
          </button>

          {/* Modal Edit Question button */}
          <button
            type="button"
            onClick={onOpenModalEdit}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer"
            title="فتح نافذة التعديل المنبثقة الكاملة"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Delete Question with Inline Confirmation */}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 bg-red-950 border border-red-500/70 p-1 rounded-xl">
              <span className="text-[10px] text-red-200 font-bold px-1">تأكيد الحذف؟</span>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
                className="px-2 py-0.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-500 cursor-pointer"
              >
                نعم، احذف
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 hover:text-red-200 text-xs font-bold transition-all cursor-pointer"
              title="مسح السؤال نهائياً"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {onAddBelow && (
          <button
            type="button"
            onClick={onAddBelow}
            className="w-full mt-3 py-2 rounded-xl border border-dashed border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>➕ إضافة سؤال جديد تحت هذا السؤال</span>
          </button>
        )}
      </div>


      {/* Inline Image URL Bar if toggled */}
      {showUrlInputBar && (
        <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/50 flex flex-col sm:flex-row items-center gap-2 animate-fadeIn">
          <LinkIcon className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            type="url"
            value={urlBarValue}
            onChange={(e) => setUrlBarValue(e.target.value)}
            placeholder="الصق رابط صورة السؤال المباشر (https://...)..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none w-full"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onSetImageUrl(urlBarValue.trim());
                setShowUrlInputBar(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
            >
              حفظ الرابط
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInputBar(false)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ======================= INLINE EDITING MODE (ZERO BLACK SCREEN!) ======================= */}
      {isInlineEditing ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1026] border-2 border-amber-400/80 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>تعديل السؤال والإجابات وصورها مباشرة داخل البطاقة</span>
            </span>
            <button
              type="button"
              onClick={onToggleInlineEdit}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕ إغلاق
            </button>
          </div>

          {/* Question Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              نص السؤال: <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={3}
              value={draftQuestion}
              onChange={(e) => setDraftQuestion(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none resize-y"
              placeholder="اكتب نص السؤال هنا..."
            />
          </div>

          {/* Question Image Upload & Link for Inline Editor */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>صورة السؤال (رفع من الجهاز أو رابط)</span>
              </span>
              {draftImageUrl && (
                <button
                  type="button"
                  onClick={() => setDraftImageUrl('')}
                  className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الصورة</span>
                </button>
              )}
            </div>

            {draftImageUrl && (
              <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-black/50 p-2 flex justify-center">
                <img
                  src={draftImageUrl}
                  alt="معاينة"
                  className="max-h-48 w-auto max-w-full rounded-lg object-contain cursor-pointer"
                  onClick={() => onZoomImage(draftImageUrl)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onTriggerFileUpload}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>اختر ملف صورة السؤال من جهازك</span>
              </button>
              <input
                type="url"
                value={draftImageUrl.startsWith('data:') ? '' : draftImageUrl}
                onChange={(e) => setDraftImageUrl(e.target.value)}
                placeholder="أو الصق رابط صورة السؤال (URL)..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Options with Radio Selection, Dynamic Images, Add, and Delete Option */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-200 block">
                  خيارات الإجابة والصور (اضغط الدائرة لتحديد الصحيحة، ويمكن وضع صور لكل خيار):
                </label>
                <span className="text-[11px] text-amber-300/80 font-medium">
                  يمكن رفع صورة لكل خيار إجابة من جهازك لتظهر للطلاب في الاختبار
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddInlineOption}
                className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 hover:text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>➕ إضافة إجابة جديدة</span>
              </button>
            </div>

            <div className="space-y-3">
              {draftOptions.map((opt, optIdx) => {
                const optImage = draftOptionImages[optIdx];
                return (
                  <div
                    key={optIdx}
                    className={`p-3 rounded-2xl border transition-all space-y-2.5 ${
                      draftCorrectIndex === optIdx
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`inline-opt-group-${question.id}`}
                        checked={draftCorrectIndex === optIdx}
                        onChange={() => setDraftCorrectIndex(optIdx)}
                        className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer shrink-0"
                        title="تحديد هذا الخيار كإجابة صحيحة"
                      />
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][optIdx] || optIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...draftOptions];
                          updated[optIdx] = e.target.value;
                          setDraftOptions(updated);
                        }}
                        placeholder={`نص الخيار ${optIdx + 1}...`}
                        className="flex-1 bg-slate-900/80 border border-slate-700/80 focus:border-amber-400 text-white text-xs sm:text-sm outline-none px-3 py-1.5 rounded-xl"
                      />

                      {/* Pick option image */}
                      <button
                        type="button"
                        onClick={() => handlePickOptionImage(optIdx)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-all shadow-sm"
                        title="اختر صورة لهذا الخيار من جهازك"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">صورة الخيار</span>
                      </button>

                      {/* Delete Option */}
                      {draftOptions.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveInlineOption(optIdx)}
                          className="px-2.5 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-500/60 text-red-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
                          title="حذف هذا الخيار من الإجابات"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          <span className="hidden sm:inline">حذف</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 px-2 py-1 font-bold shrink-0">
                          (حد أدنى خيارين)
                        </span>
                      )}
                    </div>

                    {/* Attached Option Image Preview and URL Input */}
                    {optImage ? (
                      <div className="flex items-center gap-3 pr-8 pt-1">
                        <div
                          onClick={() => onZoomImage(optImage)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400/70 bg-black/70 p-0.5 cursor-pointer hover:scale-105 transition-transform shrink-0 shadow"
                          title="انقر لتكبير صورة الإجابة"
                        >
                          <img
                            src={optImage}
                            alt={`صورة الخيار ${optIdx + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>مرفق صورة مع هذا الخيار</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDraftOptionImage(optIdx)}
                            className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer w-fit"
                          >
                            <X className="w-3 h-3" />
                            <span>إزالة صورة الخيار</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pr-8">
                        <input
                          type="url"
                          placeholder="أو الصق رابط صورة مباشر لهذا الخيار (https://...)..."
                          className="w-full px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 text-[11px] outline-none"
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              const updated = [...draftOptionImages];
                              updated[optIdx] = e.target.value.trim();
                              setDraftOptionImages(updated);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points & Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                النقاط (XP):
              </label>
              <input
                type="number"
                value={draftPoints}
                onChange={(e) => setDraftPoints(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold text-center text-xs outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                التفسير العلمي (Explanation):
              </label>
              <input
                type="text"
                value={draftExplanation}
                onChange={(e) => setDraftExplanation(e.target.value)}
                placeholder="التفسير الذي يظهر للطالب بعد الإجابة..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Save / Cancel buttons with Loading Spinner */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              disabled={isSavingThisCard}
              onClick={onToggleInlineEdit}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
            >
              إلغاء التعديل
            </button>
            <button
              type="button"
              disabled={isSavingThisCard}
              onClick={handleSaveInlineForm}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isSavingThisCard ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري الحفظ والمزامنة...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>✓ حفظ التعديل والمزامنة فوراً</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ======================= NORMAL CARD VIEW ======================= */
        <>
          {/* Question Text */}
          <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed font-['Tajawal']">
            {question.question}
          </h3>

          {/* Question Image Thumbnail if attached */}
          {question.imageUrl && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div
                onClick={() => onZoomImage(question.imageUrl!)}
                className="relative rounded-xl overflow-hidden border-2 border-amber-400/50 bg-black/50 p-1 cursor-pointer max-w-xs shadow-md group"
              >
                <img
                  src={question.imageUrl}
                  alt="صورة السؤال"
                  className="max-h-36 w-auto object-contain rounded-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                  <Eye className="w-4 h-4" />
                  <span>انقر لتكبير صورة السؤال</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onRemoveImage}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-500/30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الصورة</span>
              </button>
            </div>
          )}

          {/* Options Grid with Option Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {question.options.map((opt, optIdx) => {
              const isCorrect = optIdx === question.correctIndex;
              const optImg = question.optionImages?.[optIdx];

              return (
                <div
                  key={optIdx}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-2.5 ${
                    isCorrect
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-md text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                          isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        {['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][optIdx] || optIdx + 1}
                      </span>
                      <span className="leading-relaxed">{opt || '(خيار بالصورة)'}</span>
                    </div>

                    {isCorrect && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full shrink-0">
                        ✓ الإجابة الصحيحة
                      </span>
                    )}
                  </div>

                  {/* Option Image Thumbnail if present */}
                  {optImg && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onZoomImage(optImg);
                      }}
                      className="relative rounded-xl overflow-hidden border-2 border-amber-400/70 bg-black/70 p-1 cursor-pointer hover:border-amber-400 flex items-center justify-center max-h-28 group/img shadow-inner"
                      title="انقر لتكبير صورة الخيار"
                    >
                      <img
                        src={optImg}
                        alt={`صورة الخيار ${optIdx + 1}`}
                        className="max-h-24 w-auto object-contain rounded-lg group-hover/img:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[10px] font-bold gap-1 transition-opacity">
                        <Eye className="w-3 h-3" />
                        <span>تكبير</span>
                      </div>
                    </div>
                  )}

                  {/* Actions under EACH answer option: Upload Image, Change, Delete, or Link */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
                    {optImg ? (
                      <div className="flex items-center justify-between gap-1.5 w-full">
                        <button
                          type="button"
                          onClick={() => handlePickDirectOptionImage(optIdx)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                          title="تغيير صورة هذا الخيار من جهازك"
                        >
                          <Upload className="w-3 h-3 text-amber-400" />
                          <span>تغيير صورة الإجابة</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveOptionImage(optIdx)}
                          className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                          title="حذف صورة هذا الخيار"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>حذف</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePickDirectOptionImage(optIdx)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 hover:border-amber-500/60 border border-slate-800 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm group/btn"
                            title="اختر صورة لهذا الخيار من جهازك"
                          >
                            <Upload className="w-3.5 h-3.5 text-amber-400 group-hover/btn:scale-110 transition-transform" />
                            <span>📷 رفع صورة لهذه الإجابة</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveOptionUrlIdx(activeOptionUrlIdx === optIdx ? null : optIdx);
                              setOptionUrlInputValue('');
                            }}
                            className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 text-[10px] font-bold cursor-pointer"
                            title="إدخال رابط صورة عبر URL"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* URL input bar for this specific option */}
                        {activeOptionUrlIdx === optIdx && (
                          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-amber-500/50 animate-fadeIn">
                            <input
                              type="url"
                              placeholder="الصق رابط الصورة (https://...)..."
                              value={optionUrlInputValue}
                              onChange={(e) => setOptionUrlInputValue(e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (optionUrlInputValue.trim()) {
                                  onSetOptionImage(optIdx, optionUrlInputValue.trim());
                                }
                                setActiveOptionUrlIdx(null);
                                setOptionUrlInputValue('');
                              }}
                              className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-black text-[10px] cursor-pointer"
                            >
                              حفظ
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveOptionUrlIdx(null);
                                setOptionUrlInputValue('');
                              }}
                              className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 text-[10px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation Box */}
          {question.explanation && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 leading-relaxed flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 ml-1">التفسير العلمي:</strong>
                <span>{question.explanation}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add New Question Below This Question Button */}
      {onAddBelow && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAddBelow}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-dashed border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" />
            <span>➕ إضافة سؤال جديد تحت هذا السؤال رقم ({index})</span>
          </button>
        </div>
      )}
    </div>
  );
};
