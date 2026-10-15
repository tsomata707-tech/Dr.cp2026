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
  const [editingQuestionType, setEditingQuestionType] = useState<ActiveTestTab>('pretest');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null); // null means new question
  const [editingTargetLevel, setEditingTargetLevel] = useState<number>(1); // For levels

  // Form Fields
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formPoints, setFormPoints] = useState<number>(50);
  const [formImageUrl, setFormImageUrl] = useState<string>('');

  // Zoom Image Modal
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  // Device file input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Helper to compress and convert file to data URL
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800; // Optimal size for questions
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormImageUrl(dataUrl);
          showNotification('تم رفع ومعالجة صورة السؤال بنجاح');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Open Add Modal
  const handleOpenAddModal = (tab: ActiveTestTab) => {
    setEditingQuestionType(tab);
    setEditingQuestionId(null);
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
    setFormQuestionText(q.question);
    setFormOptions(q.options && q.options.length > 0 ? [...q.options] : ['', '']);
    setFormCorrectIndex(q.correctIndex);
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
    setFormQuestionText(q.question);
    setFormOptions(q.options && q.options.length > 0 ? [...q.options] : ['', '']);
    setFormCorrectIndex(q.correctIndex);
    setFormExplanation(q.explanation || '');
    setFormPoints(q.points || 34);
    setFormImageUrl(q.imageUrl || '');
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveQuestion = () => {
    if (!formQuestionText.trim()) {
      alert('يرجى إدخال نص السؤال');
      return;
    }
    const cleanOptions = formOptions.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      alert('يرجى كتابة خيارين على الأقل للسؤال');
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
                imageUrl: formImageUrl || undefined,
              }
            : q
        );
      } else {
        // Add new
        const newQ: PreTestQuestion = {
          id: `pt-custom-${Date.now()}`,
          question: formQuestionText.trim(),
          options: cleanOptions,
          correctIndex: safeCorrectIndex,
          explanation: formExplanation.trim(),
          points: Number(formPoints) || 50,
          imageUrl: formImageUrl || undefined,
        };
        updated = [...preTestQuestions, newQ];
      }
      setPreTestQuestions(updated);
      savePreTestQuestions(updated);
      showNotification('تم حفظ السؤال في الاختبار القبلي بنجاح');
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
                imageUrl: formImageUrl || undefined,
              }
            : q
        );
      } else {
        // Add new
        const newQ: PreTestQuestion = {
          id: `post-custom-${Date.now()}`,
          question: formQuestionText.trim(),
          options: cleanOptions,
          correctIndex: safeCorrectIndex,
          explanation: formExplanation.trim(),
          points: Number(formPoints) || 50,
          imageUrl: formImageUrl || undefined,
        };
        updated = [...postTestQuestions, newQ];
      }
      setPostTestQuestions(updated);
      savePostTestQuestions(updated);
      showNotification('تم حفظ السؤال في الاختبار البعدي بنجاح');
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
                  imageUrl: formImageUrl || undefined,
                }
              : q
          );
        } else {
          // Add new
          const newQ: LevelQuestion = {
            id: `q${editingTargetLevel}-custom-${Date.now()}`,
            question: formQuestionText.trim(),
            options: cleanOptions,
            correctIndex: safeCorrectIndex,
            explanation: formExplanation.trim(),
            points: Number(formPoints) || 34,
            imageUrl: formImageUrl || undefined,
          };
          updatedQuestions = [...lvl.questions, newQ];
        }
        return { ...lvl, questions: updatedQuestions };
      });

      setGameLevels(updatedLevels);
      saveCustomGameLevels(updatedLevels);
      showNotification(`تم حفظ السؤال في المستوى ${editingTargetLevel} بنجاح`);
    }

    setIsModalOpen(false);
  };

  // Delete Question
  const handleDeleteQuestion = (type: ActiveTestTab, questionId: string, levelNum?: number) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا السؤال نهائياً؟')) {
      return;
    }

    if (type === 'pretest') {
      const updated = preTestQuestions.filter((q) => q.id !== questionId);
      setPreTestQuestions(updated);
      savePreTestQuestions(updated);
      showNotification('تم حذف السؤال من الاختبار القبلي');
    } else if (type === 'posttest') {
      const updated = postTestQuestions.filter((q) => q.id !== questionId);
      setPostTestQuestions(updated);
      savePostTestQuestions(updated);
      showNotification('تم حذف السؤال من الاختبار البعدي');
    } else if (type === 'levels' && levelNum !== undefined) {
      const updated = gameLevels.map((lvl) => {
        if (lvl.levelNumber !== levelNum) return lvl;
        return {
          ...lvl,
          questions: lvl.questions.filter((q) => q.id !== questionId),
        };
      });
      setGameLevels(updated);
      saveCustomGameLevels(updated);
      showNotification(`تم حذف السؤال من المستوى ${levelNum}`);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = (type: ActiveTestTab) => {
    if (
      !window.confirm(
        'تحذير: سيتم استعادة بنك الأسئلة الافتراضي القياسي المعتمد، هل تود المتابعة؟'
      )
    ) {
      return;
    }

    if (type === 'pretest') {
      const restored = resetPreTestQuestionsToDefault();
      setPreTestQuestions(restored);
      showNotification('تمت استعادة أسئلة الاختبار القبلي الافتراضية (50 سؤالاً)');
    } else if (type === 'posttest') {
      const restored = resetPostTestQuestionsToDefault();
      setPostTestQuestions(restored);
      showNotification('تمت استعادة أسئلة الاختبار البعدي الافتراضية (50 سؤالاً)');
    } else {
      const restored = resetGameLevelsToDefault();
      setGameLevels(restored);
      showNotification('تمت استعادة أسئلة المراحل العشر الافتراضية (30 سؤالاً)');
    }
  };

  // Options modification in form
  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...formOptions];
    updated[idx] = val;
    setFormOptions(updated);
  };

  const handleAddOption = () => {
    if (formOptions.length >= 6) {
      alert('الحد الأقصى للخيارات هو 6 خيارات');
      return;
    }
    setFormOptions([...formOptions, '']);
  };

  const handleRemoveOption = (idx: number) => {
    if (formOptions.length <= 2) {
      alert('يجب أن يحتوي السؤال على خيارين على الأقل');
      return;
    }
    const updated = formOptions.filter((_, i) => i !== idx);
    setFormOptions(updated);
    if (formCorrectIndex >= updated.length) {
      setFormCorrectIndex(0);
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
      {/* Hidden File Input for Device Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-950/80 via-purple-950/50 to-slate-950 border-2 border-violet-500/60 shadow-[0_0_35px_rgba(139,92,246,0.3)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-950/60 shrink-0">
            <Settings className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-violet-900/60 border border-violet-400/50 text-violet-200 text-xs font-black">
                لوحة تحكم المشرف (الأدمن)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] tracking-tight">
              إعدادات بنوك الأسئلة والاختبارات
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              إضافة، تعديل، مسح، وإدراج الصور التوضيحية لأسئلة الاختبار القبلي والبعدي والمراحل العشر.
            </p>
          </div>
        </div>

        {/* Action Button: Add Question */}
        <button
          type="button"
          onClick={() => handleOpenAddModal(activeTab)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105 shrink-0"
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
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              : 'bg-red-950/80 border-red-500 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold">{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-xs opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 3 Section Tabs (العناوين الثلاثة المطلوبة) */}
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
              <span>🎮 المراحل العشر (10 Levels)</span>
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
            <span>10 مستويات تعليمية</span>
            <span>•</span>
            <span>بصور: {levelsWithImages}</span>
          </div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#090b17] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نص السؤال، الكلمات المفتاحية، أو الإجابات..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-500 transition-all outline-none"
          />
        </div>

        {/* Level Selector (Only for Tab 3: Levels) */}
        {activeTab === 'levels' && (
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-300 font-bold shrink-0">المستوى:</span>
            <button
              type="button"
              onClick={() => setSelectedLevelFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedLevelFilter === 'all'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              كافة المراحل (الكل)
            </button>
            {gameLevels.map((lvl) => (
              <button
                key={lvl.levelNumber}
                type="button"
                onClick={() => setSelectedLevelFilter(lvl.levelNumber)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedLevelFilter === lvl.levelNumber
                    ? 'bg-cyan-600 text-white font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                L{lvl.levelNumber} ({lvl.questions.length})
              </button>
            ))}
          </div>
        )}

        {/* Reset to defaults button */}
        <button
          type="button"
          onClick={() => handleResetDefaults(activeTab)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-amber-300 text-xs font-bold border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          title="استعادة الأسئلة الافتراضية للقسم الحالي"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>استعادة الافتراضي</span>
        </button>
      </div>

      {/* ======================= QUESTIONS LIST ======================= */}

      {/* SECTION 1: PRE-TEST QUESTIONS */}
      {activeTab === 'pretest' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-bold">
            <span>عرض {filteredPreTest.length} من {preTestQuestions.length} سؤال في الاختبار القبلي</span>
            <span>النقاط الإجمالية: {filteredPreTest.reduce((a, b) => a + (b.points || 0), 0)} XP</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredPreTest.map((q, idx) => (
              <QuestionAdminCard
                key={q.id}
                index={idx + 1}
                question={q}
                onEdit={() => handleOpenEditPrePostModal('pretest', q)}
                onDelete={() => handleDeleteQuestion('pretest', q.id)}
                onZoomImage={(url) => setZoomedImageUrl(url)}
              />
            ))}
            {filteredPreTest.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400 text-sm">
                لم يتم العثور على أي أسئلة مطابقة للبحث
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: POST-TEST QUESTIONS */}
      {activeTab === 'posttest' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-bold">
            <span>عرض {filteredPostTest.length} من {postTestQuestions.length} سؤال في الاختبار البعدي</span>
            <span>النقاط الإجمالية: {filteredPostTest.reduce((a, b) => a + (b.points || 0), 0)} XP</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredPostTest.map((q, idx) => (
              <QuestionAdminCard
                key={q.id}
                index={idx + 1}
                question={q}
                onEdit={() => handleOpenEditPrePostModal('posttest', q)}
                onDelete={() => handleDeleteQuestion('posttest', q.id)}
                onZoomImage={(url) => setZoomedImageUrl(url)}
              />
            ))}
            {filteredPostTest.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400 text-sm">
                لم يتم العثور على أي أسئلة مطابقة للبحث
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: THE 10 STAGES QUESTIONS */}
      {activeTab === 'levels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-bold">
            <span>
              عرض {filteredLevelsQuestions.length} سؤال في المراحل التعليمية العشر
              {typeof selectedLevelFilter === 'number' && ` (المستوى ${selectedLevelFilter})`}
            </span>
            <span>النقاط: {filteredLevelsQuestions.reduce((a, b) => a + (b.question.points || 0), 0)} XP</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredLevelsQuestions.map(({ level, question }, idx) => (
              <QuestionAdminCard
                key={question.id}
                index={idx + 1}
                levelBadge={`المستوى ${level.levelNumber}: ${level.shortTitle}`}
                question={question}
                onEdit={() => handleOpenEditLevelModal(level.levelNumber, question)}
                onDelete={() => handleDeleteQuestion('levels', question.id, level.levelNumber)}
                onZoomImage={(url) => setZoomedImageUrl(url)}
              />
            ))}
            {filteredLevelsQuestions.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400 text-sm">
                لا توجد أسئلة في المستوى المختار أو مطابقة للبحث
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= ADD / EDIT MODAL ======================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c0e1e] border-2 border-violet-500/80 p-6 sm:p-8 shadow-[0_0_50px_rgba(139,92,246,0.35)] space-y-5 text-right my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500 text-violet-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-['Tajawal']">
                    {editingQuestionId ? 'تعديل السؤال وإعداداته' : 'إضافة سؤال جديد'}
                  </h3>
                  <span className="text-xs text-violet-300 font-bold">
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
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Tab is Levels, allow switching Target Level */}
            {editingQuestionType === 'levels' && !editingQuestionId && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المستوى التابع له السؤال (1 إلى 10):
                </label>
                <select
                  value={editingTargetLevel}
                  onChange={(e) => setEditingTargetLevel(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-violet-500 outline-none"
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
                نص السؤال: <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={formQuestionText}
                onChange={(e) => setFormQuestionText(e.target.value)}
                placeholder="اكتب نص السؤال هنا بدقة ووضوح..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-violet-400 text-white text-xs sm:text-sm leading-relaxed outline-none transition-all resize-y"
              />
            </div>

            {/* IMAGE ATTACHMENT SECTION (إضافة الصور إلى الأسئلة والحفاظ على القياسات) */}
            <div className="p-4 rounded-2xl bg-[#080a14] border border-violet-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>الصورة التوضيحية للسؤال (اختياري)</span>
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

              {/* Upload from Device or Paste URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع صورة من جهازك / هاتفك</span>
                </button>

                <input
                  type="url"
                  value={formImageUrl.startsWith('data:') ? '' : formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="أو الصق رابط صورة مباشر (URL)..."
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                يتم تنسيق الصورة تلقائياً للحفاظ على الأبعاد والقياسات المناسبة (Responsive Object-Contain) ولن تؤثر سلباً على تصميم الخيارات والنصوص.
              </p>
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
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-violet-950/50 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ التعديلات في النظام</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= IMAGE ZOOM MODAL ======================= */}
      {zoomedImageUrl && (
        <div
          onClick={() => setZoomedImageUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2 bg-[#080914] rounded-3xl border-2 border-[#ffd700] shadow-2xl">
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

// ======================= SINGLE QUESTION CARD COMPONENT =======================
interface QuestionAdminCardProps {
  index: number;
  levelBadge?: string;
  question: PreTestQuestion | LevelQuestion;
  onEdit: () => void;
  onDelete: () => void;
  onZoomImage: (url: string) => void;
}

const QuestionAdminCard: React.FC<QuestionAdminCardProps> = ({
  index,
  levelBadge,
  question,
  onEdit,
  onDelete,
  onZoomImage,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#090c1e] border-2 border-slate-800/80 hover:border-violet-500/50 transition-all space-y-4">
      {/* Top Header of the Question Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/50 text-violet-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
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

        {/* Action Buttons: Edit / Delete */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="px-3 py-1.5 rounded-xl bg-violet-950/60 hover:bg-violet-900/80 border border-violet-500/50 text-violet-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>تعديل</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 hover:text-red-200 text-xs font-bold transition-all cursor-pointer"
            title="مسح السؤال نهائياً"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed font-['Tajawal']">
        {question.question}
      </h3>

      {/* Image Thumbnail if attached */}
      {question.imageUrl && (
        <div className="relative inline-block group">
          <div
            onClick={() => onZoomImage(question.imageUrl!)}
            className="relative rounded-xl overflow-hidden border-2 border-amber-400/50 bg-black/40 p-1 cursor-pointer max-w-xs shadow-md"
          >
            <img
              src={question.imageUrl}
              alt="صورة السؤال"
              className="max-h-36 w-auto object-contain rounded-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
              <Eye className="w-4 h-4" />
              <span>انقر للتكبير</span>
            </div>
          </div>
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
          <HelpCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-violet-300 ml-1">التفسير العلمي:</strong>
            <span>{question.explanation}</span>
          </div>
        </div>
      )}
    </div>
  );
};
