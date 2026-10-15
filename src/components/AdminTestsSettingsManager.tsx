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
} from 'lucide-react';
import { PreTestQuestion, LevelQuestion } from '../types';
import {
  getPreTestQuestions,
  savePreTestQuestions,
  resetPreTestQuestionsToDefault,
  getPostTestQuestions,
  savePostTestQuestions,
  resetPostTestQuestionsToDefault,
} from '../data/preTestData';
import {
  GAME_LEVELS_DATA,
  GameLevelDef,
  getCustomGameLevels,
  saveCustomGameLevels,
  resetGameLevelsToDefault,
} from '../data/gameLevelsData';

type ActiveTestTab = 'pretest' | 'posttest' | 'levels';

export const AdminTestsSettingsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTestTab>('pretest');

  // Pre-Test & Post-Test state
  const [preTestQuestions, setPreTestQuestions] = useState<PreTestQuestion[]>(() => getPreTestQuestions());
  const [postTestQuestions, setPostTestQuestions] = useState<PreTestQuestion[]>(() => getPostTestQuestions());

  // 10 Stages state
  const [gameLevels, setGameLevels] = useState<GameLevelDef[]>(() => getCustomGameLevels());
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addPosition, setAddPosition] = useState<'top' | 'bottom'>('bottom');
  const [editingQuestionType, setEditingQuestionType] = useState<ActiveTestTab>('pretest');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null); // null means new question
  const [editingTargetLevel, setEditingTargetLevel] = useState<number>(1); // For levels

  // Form Fields for Modal
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formPoints, setFormPoints] = useState<number>(50);
  const [formImageUrl, setFormImageUrl] = useState<string>('');

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

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Helper: compress image file to standard optimal dataURL
  const compressImage = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 700; // Optimal lightweight size for question images
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
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Upload handler for Modal file input
  const handleModalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    compressImage(file, (dataUrl) => {
      setFormImageUrl(dataUrl);
      showNotification('تم رفع ومعالجة صورة السؤال بنجاح');
    });
    e.target.value = '';
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

    compressImage(file, (dataUrl) => {
      if (directUploadTarget.type === 'pretest') {
        const updated = preTestQuestions.map((q) =>
          q.id === directUploadTarget.questionId ? { ...q, imageUrl: dataUrl } : q
        );
        setPreTestQuestions(updated);
        savePreTestQuestions(updated, true);
        showNotification('تم رفع وتثبيت صورة السؤال في الاختبار القبلي ومزامنته للجميع عبر فايربيس');
      } else if (directUploadTarget.type === 'posttest') {
        const updated = postTestQuestions.map((q) =>
          q.id === directUploadTarget.questionId ? { ...q, imageUrl: dataUrl } : q
        );
        setPostTestQuestions(updated);
        savePostTestQuestions(updated, true);
        showNotification('تم رفع وتثبيت صورة السؤال في الاختبار البعدي ومزامنته للجميع عبر فايربيس');
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
        showNotification(`تم رفع وتثبيت صورة السؤال في المستوى ${directUploadTarget.levelNum} ومزامنته للجميع عبر فايربيس`);
      }
      setDirectUploadTarget(null);
    });
    e.target.value = '';
  };

  // Direct card set URL link
  const handleDirectSetImageUrl = (type: ActiveTestTab, questionId: string, cleanUrl: string, levelNum?: number) => {
    if (type === 'pretest') {
      const updated = preTestQuestions.map((q) =>
        q.id === questionId ? { ...q, imageUrl: cleanUrl || undefined } : q
      );
      setPreTestQuestions(updated);
      savePreTestQuestions(updated, true);
      showNotification(cleanUrl ? 'تم تحديث رابط صورة السؤال ومزامنته للجميع' : 'تم حذف صورة السؤال');
    } else if (type === 'posttest') {
      const updated = postTestQuestions.map((q) =>
        q.id === questionId ? { ...q, imageUrl: cleanUrl || undefined } : q
      );
      setPostTestQuestions(updated);
      savePostTestQuestions(updated, true);
      showNotification(cleanUrl ? 'تم تحديث رابط صورة السؤال ومزامنته للجميع' : 'تم حذف صورة السؤال');
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
      showNotification(cleanUrl ? 'تم تحديث رابط صورة السؤال ومزامنته للجميع' : 'تم حذف صورة السؤال');
    }
  };

  // Direct card remove image
  const handleDirectRemoveImage = (type: ActiveTestTab, questionId: string, levelNum?: number) => {
    if (type === 'pretest') {
      const updated = preTestQuestions.map((q) =>
        q.id === questionId ? { ...q, imageUrl: undefined } : q
      );
      setPreTestQuestions(updated);
      savePreTestQuestions(updated, true);
      showNotification('تم حذف صورة السؤال بنجاح ومزامنة التحديث');
    } else if (type === 'posttest') {
      const updated = postTestQuestions.map((q) =>
        q.id === questionId ? { ...q, imageUrl: undefined } : q
      );
      setPostTestQuestions(updated);
      savePostTestQuestions(updated, true);
      showNotification('تم حذف صورة السؤال بنجاح ومزامنة التحديث');
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
      showNotification('تم حذف صورة السؤال بنجاح ومزامنة التحديث');
    }
  };

  // Open Add Modal with position (top or bottom)
  const handleOpenAddModal = (tab: ActiveTestTab, position: 'top' | 'bottom' = 'bottom') => {
    setEditingQuestionType(tab);
    setEditingQuestionId(null);
    setAddPosition(position);
    setFormQuestionText('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormPoints(tab === 'levels' ? 34 : 50);
    setFormImageUrl('');
    setEditingTargetLevel(typeof selectedLevelFilter === 'number' ? selectedLevelFilter : 1);
    setIsModalOpen(true);
  };

  // Open Edit Modal for Pre-Test / Post-Test
  const handleOpenEditPrePostModal = (tab: 'pretest' | 'posttest', q: PreTestQuestion) => {
    setEditingQuestionType(tab);
    setEditingQuestionId(q.id);
    setFormQuestionText(q.question || '');
    setFormOptions(q.options && q.options.length > 0 ? [...q.options] : ['', '']);
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
    setFormOptions(q.options && q.options.length > 0 ? [...q.options] : ['', '']);
    setFormCorrectIndex(typeof q.correctIndex === 'number' ? q.correctIndex : 0);
    setFormExplanation(q.explanation || '');
    setFormPoints(q.points || 34);
    setFormImageUrl(q.imageUrl || '');
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveQuestion = () => {
    if (!formQuestionText.trim()) {
      showNotification('يرجى كتابة نص السؤال أولاً', 'error');
      return;
    }
    const cleanOptions = formOptions.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      showNotification('يرجى كتابة خيارين على الأقل للسؤال', 'error');
      return;
    }
    const safeCorrectIndex = formCorrectIndex >= cleanOptions.length ? 0 : formCorrectIndex;

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
                correctIndex: safeCorrectIndex,
                explanation: formExplanation.trim(),
                points: Number(formPoints) || 50,
                imageUrl: formImageUrl.trim() || undefined,
              }
            : q
        );
      } else {
        // Add new (top or bottom)
        const newQ: PreTestQuestion = {
          id: `pt-custom-${Date.now()}`,
          question: formQuestionText.trim(),
          options: cleanOptions,
          correctIndex: safeCorrectIndex,
          explanation: formExplanation.trim(),
          points: Number(formPoints) || 50,
          imageUrl: formImageUrl.trim() || undefined,
        };
        updated = addPosition === 'top' ? [newQ, ...preTestQuestions] : [...preTestQuestions, newQ];
      }
      setPreTestQuestions(updated);
      savePreTestQuestions(updated, true);
      showNotification('تم حفظ السؤال في الاختبار القبلي ومزامنته للجميع عبر فايربيس بنجاح');
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
                correctIndex: safeCorrectIndex,
                explanation: formExplanation.trim(),
                points: Number(formPoints) || 50,
                imageUrl: formImageUrl.trim() || undefined,
              }
            : q
        );
      } else {
        // Add new (top or bottom)
        const newQ: PreTestQuestion = {
          id: `post-custom-${Date.now()}`,
          question: formQuestionText.trim(),
          options: cleanOptions,
          correctIndex: safeCorrectIndex,
          explanation: formExplanation.trim(),
          points: Number(formPoints) || 50,
          imageUrl: formImageUrl.trim() || undefined,
        };
        updated = addPosition === 'top' ? [newQ, ...postTestQuestions] : [...postTestQuestions, newQ];
      }
      setPostTestQuestions(updated);
      savePostTestQuestions(updated, true);
      showNotification('تم حفظ السؤال في الاختبار البعدي ومزامنته للجميع عبر فايربيس بنجاح');
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
      showNotification(`تم حفظ السؤال في المستوى ${editingTargetLevel} ومزامنته للجميع عبر فايربيس بنجاح`);
    }

    setIsModalOpen(false);
  };

  // Direct Inline Save from Card
  const handleInlineSaveQuestion = (
    type: ActiveTestTab,
    questionId: string,
    updatedData: {
      question: string;
      options: string[];
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
    const cleanOptions = updatedData.options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      showNotification('يرجى كتابة خيارين على الأقل', 'error');
      return;
    }
    const safeCorrectIndex = updatedData.correctIndex >= cleanOptions.length ? 0 : updatedData.correctIndex;

    if (type === 'pretest') {
      const updated = preTestQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              question: updatedData.question.trim(),
              options: cleanOptions,
              correctIndex: safeCorrectIndex,
              explanation: updatedData.explanation.trim(),
              points: Number(updatedData.points) || 50,
              imageUrl: updatedData.imageUrl,
            }
          : q
      );
      setPreTestQuestions(updated);
      savePreTestQuestions(updated, true);
      showNotification('تم حفظ وتحديث السؤال في الاختبار القبلي ومزامنته للجميع بنجاح');
    } else if (type === 'posttest') {
      const updated = postTestQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              question: updatedData.question.trim(),
              options: cleanOptions,
              correctIndex: safeCorrectIndex,
              explanation: updatedData.explanation.trim(),
              points: Number(updatedData.points) || 50,
              imageUrl: updatedData.imageUrl,
            }
          : q
      );
      setPostTestQuestions(updated);
      savePostTestQuestions(updated, true);
      showNotification('تم حفظ وتحديث السؤال في الاختبار البعدي ومزامنته للجميع بنجاح');
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
      showNotification(`تم حفظ وتحديث السؤال في المستوى ${levelNum} ومزامنته للجميع بنجاح`);
    }

    setInlineEditingCardId(null);
  };

  // Delete Question
  const handleDeleteQuestion = (type: ActiveTestTab, questionId: string, levelNum?: number) => {
    if (type === 'pretest') {
      const updated = preTestQuestions.filter((q) => q.id !== questionId);
      setPreTestQuestions(updated);
      savePreTestQuestions(updated, true);
      showNotification('تم حذف السؤال من الاختبار القبلي ومزامنة التحديث');
    } else if (type === 'posttest') {
      const updated = postTestQuestions.filter((q) => q.id !== questionId);
      setPostTestQuestions(updated);
      savePostTestQuestions(updated, true);
      showNotification('تم حذف السؤال من الاختبار البعدي ومزامنة التحديث');
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
      showNotification(`تم حذف السؤال من المستوى ${levelNum} ومزامنة التحديث`);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = (type: ActiveTestTab) => {
    if (type === 'pretest') {
      const restored = resetPreTestQuestionsToDefault();
      setPreTestQuestions(restored);
      showNotification('تمت استعادة أسئلة الاختبار القبلي القياسية ومزامنتها للجميع');
    } else if (type === 'posttest') {
      const restored = resetPostTestQuestionsToDefault();
      setPostTestQuestions(restored);
      showNotification('تمت استعادة أسئلة الاختبار البعدي القياسية ومزامنتها للجميع');
    } else {
      const restored = resetGameLevelsToDefault();
      setGameLevels(restored);
      showNotification('تمت استعادة أسئلة المراحل العشر القياسية ومزامنتها للجميع');
    }
  };

  // Options modification in modal form
  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...formOptions];
    updated[idx] = val;
    setFormOptions(updated);
  };

  const handleAddOption = () => {
    if (formOptions.length >= 6) {
      showNotification('الحد الأقصى للخيارات هو 6 خيارات', 'error');
      return;
    }
    setFormOptions([...formOptions, '']);
  };

  const handleRemoveOption = (idx: number) => {
    if (formOptions.length <= 2) {
      showNotification('يجب أن يحتوي السؤال على خيارين على الأقل', 'error');
      return;
    }
    const updated = formOptions.filter((_, i) => i !== idx);
    setFormOptions(updated);
    if (formCorrectIndex >= updated.length) {
      setFormCorrectIndex(updated.length - 1);
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
  const preWithImages = preTestQuestions.filter((q) => !!q.imageUrl).length;
  const postWithImages = postTestQuestions.filter((q) => !!q.imageUrl).length;
  let levelsTotalQ = 0;
  let levelsWithImages = 0;
  gameLevels.forEach((lvl) => {
    levelsTotalQ += lvl.questions.length;
    levelsWithImages += lvl.questions.filter((q) => !!q.imageUrl).length;
  });

  return (
    <div className="space-y-6 font-['Cairo',_sans-serif] text-right">
      {/* Hidden File Input for Modal Device Image Upload */}
      <input
        ref={modalFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleModalImageUpload}
        className="hidden"
      />

      {/* Hidden File Input for Direct Card Device Image Upload */}
      <input
        ref={directFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectFileSelected}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-950/90 via-purple-950/60 to-slate-950 border-2 border-amber-500/50 shadow-[0_0_35px_rgba(251,191,36,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-950/60 shrink-0 font-black">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black">
                لوحة المشرف المتقدمة • مزامنة فايربيس الحية
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] tracking-tight">
              إعدادات وبنوك أسئلة الاختبارات والمراحل العشر
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              إمكانية تعديل أي سؤال مباشرة في البطاقة، إضافة أسئلة من أعلى أو أسفل كل قسم، وإرفاق الصور من جهازك مع مزامنة فورية لدى جميع الطلاب عبر فايربيس.
            </p>
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
            className="text-xs opacity-75 hover:opacity-100 font-bold px-2 py-1 rounded bg-black/40"
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
            <span>بصور: {preWithImages}</span>
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
              <span>🏆 الاختبار البعدي (Post-Test)</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeTab === 'posttest' ? 'bg-slate-950 text-purple-300' : 'bg-slate-900 text-slate-300'
              }`}
            >
              {postTestQuestions.length} سؤال
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs opacity-90">
            <span>النقاط: {postTestQuestions.reduce((a, b) => a + (b.points || 0), 0)} XP</span>
            <span>•</span>
            <span>بصور: {postWithImages}</span>
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
              <span>🎮 المراحل العشر (10 Stages)</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeTab === 'levels' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-900 text-slate-300'
              }`}
            >
              {levelsTotalQ} سؤال
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs opacity-90">
            <span>10 مستويات</span>
            <span>•</span>
            <span>بصور: {levelsWithImages}</span>
          </div>
        </button>
      </div>

      {/* Sub-Filters & Search Bar & Reset Defaults */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#090b17] border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في نص السؤال، التفسير، أو الخيارات..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Level Filter Dropdown if activeTab === 'levels' */}
          {activeTab === 'levels' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
              <select
                value={selectedLevelFilter}
                onChange={(e) =>
                  setSelectedLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-bold focus:border-cyan-500 outline-none cursor-pointer"
              >
                <option value="all">كافة المستويات العشر (الكل)</option>
                {gameLevels.map((lvl) => (
                  <option key={lvl.levelNumber} value={lvl.levelNumber}>
                    المستوى {lvl.levelNumber}: {lvl.shortTitle} ({lvl.questions.length})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Reset to Defaults button */}
        <button
          type="button"
          onClick={() => handleResetDefaults(activeTab)}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
          title="استعادة بنك الأسئلة الافتراضي المعتمد"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>استعادة الأسئلة القياسية</span>
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
                onToggleInlineEdit={() => setInlineEditingCardId(inlineEditingCardId === q.id ? null : q.id)}
                onSaveInline={(updated) => handleInlineSaveQuestion('pretest', q.id, updated)}
                onOpenModalEdit={() => handleOpenEditPrePostModal('pretest', q)}
                onDelete={() => handleDeleteQuestion('pretest', q.id)}
                onZoomImage={(url) => setZoomedImageUrl(url)}
                onTriggerFileUpload={() => handleTriggerDirectUpload('pretest', q.id)}
                onSetImageUrl={(url) => handleDirectSetImageUrl('pretest', q.id, url)}
                onRemoveImage={() => handleDirectRemoveImage('pretest', q.id)}
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
            <button
              type="button"
              onClick={() => handleOpenAddModal('posttest', 'top')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>➕ إضافة سؤال جديد في أعلى الاختبار البعدي (البداية)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredPostTest.map((q, idx) => (
              <QuestionAdminCard
                key={q.id}
                index={idx + 1}
                question={q}
                isInlineEditing={inlineEditingCardId === q.id}
                onToggleInlineEdit={() => setInlineEditingCardId(inlineEditingCardId === q.id ? null : q.id)}
                onSaveInline={(updated) => handleInlineSaveQuestion('posttest', q.id, updated)}
                onOpenModalEdit={() => handleOpenEditPrePostModal('posttest', q)}
                onDelete={() => handleDeleteQuestion('posttest', q.id)}
                onZoomImage={(url) => setZoomedImageUrl(url)}
                onTriggerFileUpload={() => handleTriggerDirectUpload('posttest', q.id)}
                onSetImageUrl={(url) => handleDirectSetImageUrl('posttest', q.id, url)}
                onRemoveImage={() => handleDirectRemoveImage('posttest', q.id)}
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
        <div className="space-y-4">
          {/* Top Add Question Button in 10 Stages */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/40">
            <span className="text-xs font-bold text-blue-200">
              عرض {filteredLevelsQuestions.length} سؤال في المراحل التعليمية العشر
              {typeof selectedLevelFilter === 'number' && ` (المستوى ${selectedLevelFilter})`}
            </span>
            <button
              type="button"
              onClick={() => handleOpenAddModal('levels', 'top')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>➕ إضافة سؤال جديد في أعلى المراحل العشر (البداية)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredLevelsQuestions.map(({ level, question }, idx) => (
              <QuestionAdminCard
                key={question.id}
                index={idx + 1}
                levelBadge={`المستوى ${level.levelNumber}: ${level.shortTitle}`}
                question={question}
                isInlineEditing={inlineEditingCardId === question.id}
                onToggleInlineEdit={() => setInlineEditingCardId(inlineEditingCardId === question.id ? null : question.id)}
                onSaveInline={(updated) => handleInlineSaveQuestion('levels', question.id, updated, level.levelNumber)}
                onOpenModalEdit={() => handleOpenEditLevelModal(level.levelNumber, question)}
                onDelete={() => handleDeleteQuestion('levels', question.id, level.levelNumber)}
                onZoomImage={(url) => setZoomedImageUrl(url)}
                onTriggerFileUpload={() => handleTriggerDirectUpload('levels', question.id, level.levelNumber)}
                onSetImageUrl={(url) => handleDirectSetImageUrl('levels', question.id, url, level.levelNumber)}
                onRemoveImage={() => handleDirectRemoveImage('levels', question.id, level.levelNumber)}
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
              <span>➕ إضافة سؤال جديد في نهاية المراحل العشر</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================= ADD / EDIT MODAL (SOLID, HIGH CONTRAST, ZERO BLACK SCREEN) ======================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
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
                    {editingQuestionId ? 'تعديل السؤال وإعداداته' : `إضافة سؤال جديد (${addPosition === 'top' ? 'في البداية' : 'في النهاية'})`}
                  </h3>
                  <span className="text-xs text-amber-300 font-bold">
                    {editingQuestionType === 'pretest'
                      ? 'الاختبار القبلي (Pre-Test)'
                      : editingQuestionType === 'posttest'
                      ? 'الاختبار البعدي (Post-Test)'
                      : `المراحل العشر (المستوى ${editingTargetLevel})`}
                  </span>
                </div>
              </div>
              <button
                type="button"
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

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                نص السؤال: <span className="text-amber-400">*</span>
              </label>
              <textarea
                rows={3}
                value={formQuestionText}
                onChange={(e) => setFormQuestionText(e.target.value)}
                placeholder="اكتب نص السؤال هنا بدقة ووضوح..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs sm:text-sm leading-relaxed outline-none transition-all resize-y"
              />
            </div>

            {/* IMAGE ATTACHMENT SECTION */}
            <div className="p-4 rounded-2xl bg-[#0a0d1f] border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>الصورة التوضيحية للسؤال (رفع ملف أو رابط مباشر)</span>
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
                    className="max-h-56 w-auto max-w-full rounded-xl object-contain shadow-lg"
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
                  <span>اختر ملف من جهازك / هاتفك</span>
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

            {/* Options List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">
                  خيارات الإجابة (حدد الإجابة الصحيحة بالدائرة الخضراء):
                </label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة خيار</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {formOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                      formCorrectIndex === idx
                        ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correct-option-group"
                      id={`opt-radio-${idx}`}
                      checked={formCorrectIndex === idx}
                      onChange={() => setFormCorrectIndex(idx)}
                      className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer shrink-0"
                    />
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {['أ', 'ب', 'ج', 'د', 'هـ', 'و'][idx] || idx + 1}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`نص الخيار رقم ${idx + 1}...`}
                      className="flex-1 bg-transparent border-0 text-white text-xs sm:text-sm outline-none px-2 py-1"
                    />
                    {formOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                        title="حذف هذا الخيار"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
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

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/50 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ ومزامنة عبر فايربيس</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= IMAGE ZOOM MODAL ======================= */}
      {zoomedImageUrl && (
        <div
          onClick={() => setZoomedImageUrl(null)}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
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
              alt="تكبير صورة السؤال"
              className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ======================= SINGLE QUESTION CARD COMPONENT WITH INLINE EDITING =======================
interface QuestionAdminCardProps {
  index: number;
  levelBadge?: string;
  question: PreTestQuestion | LevelQuestion;
  isInlineEditing: boolean;
  onToggleInlineEdit: () => void;
  onSaveInline: (updatedData: {
    question: string;
    options: string[];
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
}

const QuestionAdminCard: React.FC<QuestionAdminCardProps> = ({
  index,
  levelBadge,
  question,
  isInlineEditing,
  onToggleInlineEdit,
  onSaveInline,
  onOpenModalEdit,
  onDelete,
  onZoomImage,
  onTriggerFileUpload,
  onSetImageUrl,
  onRemoveImage,
}) => {
  // Local state for inline editing
  const [draftQuestion, setDraftQuestion] = useState(question.question || '');
  const [draftOptions, setDraftOptions] = useState<string[]>(
    question.options && question.options.length > 0 ? [...question.options] : ['', '']
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
    setDraftOptions(question.options && question.options.length > 0 ? [...question.options] : ['', '']);
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
      correctIndex: draftCorrectIndex,
      explanation: draftExplanation,
      points: draftPoints,
      imageUrl: draftImageUrl.trim() || undefined,
    });
  };

  const handleAddInlineOption = () => {
    if (draftOptions.length >= 6) return;
    setDraftOptions([...draftOptions, '']);
  };

  const handleRemoveInlineOption = (idx: number) => {
    if (draftOptions.length <= 2) return;
    const updated = draftOptions.filter((_, i) => i !== idx);
    setDraftOptions(updated);
    if (draftCorrectIndex >= updated.length) {
      setDraftCorrectIndex(updated.length - 1);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#090c1e] border-2 border-slate-800/90 hover:border-amber-500/40 transition-all space-y-4">
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
              <span>مرفق صورة</span>
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
            <span>اختر ملف صورة</span>
          </button>

          {/* Direct Link button */}
          <button
            type="button"
            onClick={() => setShowUrlInputBar(!showUrlInputBar)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
            title="إضافة أو تعديل رابط الصورة المباشر"
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
                : 'bg-violet-950/70 hover:bg-violet-900 border-violet-500/60 text-violet-200 hover:text-white'
            }`}
            title="تعديل هذا السؤال مباشرة في مكانه"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isInlineEditing ? 'إغلاق التعديل' : 'تعديل السؤال'}</span>
          </button>

          {/* Modal Edit Question button */}
          <button
            type="button"
            onClick={onOpenModalEdit}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer"
            title="فتح نافذة التعديل المنبثقة"
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
      </div>

      {/* Inline Image URL Bar if toggled */}
      {showUrlInputBar && (
        <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/50 flex flex-col sm:flex-row items-center gap-2 animate-fadeIn">
          <LinkIcon className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            type="url"
            value={urlBarValue}
            onChange={(e) => setUrlBarValue(e.target.value)}
            placeholder="الصق رابط الصورة المباشر للسؤال (https://...)..."
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
              <span>تعديل السؤال مباشرة داخل البطاقة</span>
            </span>
            <button
              type="button"
              onClick={onToggleInlineEdit}
              className="text-xs text-slate-400 hover:text-white"
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

          {/* Image Upload & Link for Inline Editor */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>صورة السؤال</span>
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
                  className="max-h-48 w-auto max-w-full rounded-lg object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onTriggerFileUpload}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>اختر ملف من جهازك</span>
              </button>
              <input
                type="url"
                value={draftImageUrl.startsWith('data:') ? '' : draftImageUrl}
                onChange={(e) => setDraftImageUrl(e.target.value)}
                placeholder="أو الصق رابط صورة مباشر (URL)..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Options with Radio Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                خيارات الإجابة (حدد الإجابة الصحيحة بالدائرة):
              </label>
              <button
                type="button"
                onClick={handleAddInlineOption}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة خيار</span>
              </button>
            </div>

            <div className="space-y-2">
              {draftOptions.map((opt, optIdx) => (
                <div
                  key={optIdx}
                  className={`flex items-center gap-2 p-2 rounded-xl border ${
                    draftCorrectIndex === optIdx
                      ? 'bg-emerald-950/40 border-emerald-500'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name={`inline-opt-group-${question.id}`}
                    checked={draftCorrectIndex === optIdx}
                    onChange={() => setDraftCorrectIndex(optIdx)}
                    className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer shrink-0"
                  />
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {['أ', 'ب', 'ج', 'د', 'هـ', 'و'][optIdx] || optIdx + 1}
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
                    className="flex-1 bg-transparent border-0 text-white text-xs sm:text-sm outline-none px-2"
                  />
                  {draftOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInlineOption(optIdx)}
                      className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
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

          {/* Save / Cancel buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onToggleInlineEdit}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
            >
              إلغاء التعديل
            </button>
            <button
              type="button"
              onClick={handleSaveInlineForm}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>✓ حفظ التعديل والمزامنة فوراً</span>
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

          {/* Image Thumbnail if attached */}
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
                  <span>انقر للتكبير</span>
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

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {question.options.map((opt, optIdx) => {
              const isCorrect = optIdx === question.correctIndex;
              return (
                <div
                  key={optIdx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2.5 ${
                    isCorrect
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-md text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {['أ', 'ب', 'ج', 'د', 'هـ', 'و'][optIdx] || optIdx + 1}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </div>
                  {isCorrect && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full shrink-0">
                      ✓ الإجابة الصحيحة
                    </span>
                  )}
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
    </div>
  );
};
