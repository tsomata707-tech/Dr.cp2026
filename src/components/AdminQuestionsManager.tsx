import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Settings,
  Hash,
  Award,
  RefreshCw,
} from 'lucide-react';
import {
  GAME_LEVELS_DATA,
  GameLevelDef,
  getCustomGameLevels,
  updateQuestionInLevel,
  addQuestionToLevel,
  deleteQuestionFromLevel,
  resetGameLevelsToDefault,
} from '../data/gameLevelsData';
import { LevelQuestion } from '../types';

export const AdminQuestionsManager: React.FC = () => {
  const [levels, setLevels] = useState<GameLevelDef[]>(() => getCustomGameLevels());
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(1);
  const [editingQuestion, setEditingQuestion] = useState<LevelQuestion | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<Partial<LevelQuestion>>({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    points: 25,
  });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const currentLevel = levels.find((l) => l.levelNumber === selectedLevelNum);

  useEffect(() => {
    const handleUpdate = () => {
      setLevels(getCustomGameLevels());
    };
    window.addEventListener('game-levels-updated', handleUpdate);
    return () => window.removeEventListener('game-levels-updated', handleUpdate);
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateQuestion = (qId: string, updates: Partial<LevelQuestion>) => {
    try {
      const updatedLevels = updateQuestionInLevel(selectedLevelNum, qId, updates);
      setLevels(updatedLevels);
      setEditingQuestion(null);
      showToast('تم تحديث السؤال بنجاح');
    } catch (err) {
      showToast('فشل تحديث السؤال', 'error');
    }
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السؤال نهائياً؟')) return;
    try {
      const updatedLevels = deleteQuestionFromLevel(selectedLevelNum, qId);
      setLevels(updatedLevels);
      showToast('تم حذف السؤال بنجاح');
    } catch (err) {
      showToast('فشل حذف السؤال', 'error');
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question) {
      showToast('يرجى كتابة نص السؤال', 'error');
      return;
    }
    try {
      const q: LevelQuestion = {
        id: `q-${selectedLevelNum}-${Date.now()}`,
        question: newQuestion.question || '',
        options: newQuestion.options || ['', '', '', ''],
        correctIndex: newQuestion.correctIndex ?? 0,
        explanation: newQuestion.explanation || '',
        points: newQuestion.points ?? 25,
      };
      const updatedLevels = addQuestionToLevel(selectedLevelNum, q);
      setLevels(updatedLevels);
      setIsAdding(false);
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        points: 25,
      });
      showToast('تم إضافة السؤال بنجاح');
    } catch (err) {
      showToast('فشل إضافة السؤال', 'error');
    }
  };

  const handleReset = () => {
    if (!window.confirm('سيؤدي هذا إلى إعادة جميع الأسئلة في كافة المستويات إلى الحالة الافتراضية. هل أنت متأكد؟')) return;
    const defaults = resetGameLevelsToDefault();
    setLevels(defaults);
    showToast('تمت إعادة الضبط بنجاح');
  };

  const totalLevelScore = currentLevel?.questions.reduce((sum, q) => sum + (q.points || 50), 0) || 0;

  return (
    <div className="space-y-6 font-['Cairo'] text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-inner">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-['Tajawal']">إدارة أسئلة ودرجات المستويات</h2>
            <p className="text-xs text-slate-400 mt-0.5">تعديل المحتوى التعليمي والتقويمي لكل مستوى بشكل مستقل</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 hover:bg-red-500 hover:text-white transition-all text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة ضبط المصنع</span>
          </button>
        </div>
      </div>

      {/* Level Selector Bar */}
      <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => setSelectedLevelNum(num)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedLevelNum === num
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-slate-900 border border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-amber-300'
            }`}
          >
            المستوى {num}
          </button>
        ))}
      </div>

      {/* Level Summary Stats */}
      {currentLevel && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400">
                <Hash className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-300">عدد الأسئلة:</span>
            </div>
            <span className="text-xl font-black text-white">{currentLevel.questions.length}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-300">إجمالي درجات المستوى:</span>
            </div>
            <span className="text-xl font-black text-emerald-300">{totalLevelScore} XP</span>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="p-4 rounded-2xl bg-amber-500/10 border-2 border-dashed border-amber-500/50 hover:border-amber-400 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Plus className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-black text-amber-400">إضافة سؤال جديد للمستوى</span>
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {currentLevel?.questions.map((q, idx) => (
          <div
            key={q.id}
            className="group rounded-2xl bg-slate-900/90 border border-slate-800 p-5 hover:border-amber-500/40 transition-all relative overflow-hidden"
          >
            {/* Background number */}
            <span className="absolute -left-2 -top-4 text-7xl font-black text-white/5 select-none pointer-events-none">
              {idx + 1}
            </span>

            <div className="flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-400">
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white">{q.question}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-11">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                        oIdx === q.correctIndex
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                        oIdx === q.correctIndex ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'
                      }`}>
                        {oIdx === q.correctIndex ? '✓' : String.fromCharCode(65 + oIdx)}
                      </div>
                      <span className="line-clamp-1">{opt}</span>
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="pr-11 flex items-start gap-2 text-xs text-slate-400 italic">
                    <HelpCircle className="w-4 h-4 shrink-0 text-slate-500" />
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-black">
                  <span>{q.points || 50}</span>
                  <span className="text-[10px] opacity-60">درجة</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingQuestion(q)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="تعديل السؤال"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="حذف السؤال"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {currentLevel?.questions.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-slate-950/60 border-2 border-dashed border-slate-800 text-slate-500">
            <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">لا يوجد أسئلة في هذا المستوى حالياً</p>
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {(editingQuestion || isAdding) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdding ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                  {isAdding ? <Plus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{isAdding ? 'إضافة سؤال جديد' : 'تعديل بيانات السؤال'}</h3>
                  <p className="text-xs text-slate-400">تأكد من اختيار الإجابة الصحيحة وتحديد الدرجة</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setIsAdding(false);
                }}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Question Text */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 px-1">نص السؤال:</label>
                <textarea
                  value={editingQuestion?.question ?? newQuestion.question}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingQuestion) setEditingQuestion({ ...editingQuestion, question: val });
                    else setNewQuestion({ ...newQuestion, question: val });
                  }}
                  placeholder="اكتب السؤال هنا..."
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none transition-all min-h-[100px]"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 px-1">الخيارات (حدد الدائرة للخيار الصحيح):</label>
                <div className="grid grid-cols-1 gap-3">
                  {(editingQuestion?.options ?? newQuestion.options ?? ['', '', '', '']).map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (editingQuestion) setEditingQuestion({ ...editingQuestion, correctIndex: oIdx });
                          else setNewQuestion({ ...newQuestion, correctIndex: oIdx });
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                          (editingQuestion?.correctIndex ?? newQuestion.correctIndex) === oIdx
                            ? 'border-emerald-500 bg-emerald-500 text-slate-950 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'border-slate-700 bg-slate-900 hover:border-amber-500'
                        }`}
                      >
                        {(editingQuestion?.correctIndex ?? newQuestion.correctIndex) === oIdx && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const val = e.target.value;
                          const nextOpts = [...(editingQuestion?.options ?? newQuestion.options ?? ['', '', '', ''])];
                          nextOpts[oIdx] = val;
                          if (editingQuestion) setEditingQuestion({ ...editingQuestion, options: nextOpts });
                          else setNewQuestion({ ...newQuestion, options: nextOpts });
                        }}
                        placeholder={`الخيار ${String.fromCharCode(65 + oIdx)}`}
                        className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 px-1">التفسير أو التغذية الراجعة (اختياري):</label>
                <input
                  type="text"
                  value={editingQuestion?.explanation ?? newQuestion.explanation}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingQuestion) setEditingQuestion({ ...editingQuestion, explanation: val });
                    else setNewQuestion({ ...newQuestion, explanation: val });
                  }}
                  placeholder="اشرح لماذا هذه الإجابة صحيحة..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none transition-all"
                />
              </div>

              {/* Points */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 px-1">درجة السؤال (XP):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={editingQuestion?.points ?? newQuestion.points}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (editingQuestion) setEditingQuestion({ ...editingQuestion, points: val });
                      else setNewQuestion({ ...newQuestion, points: val });
                    }}
                    className="w-32 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none transition-all"
                  />
                  <span className="text-xs text-slate-500">سيتم إضافة هذه الدرجة لرصيد الطالب عند الحل الصحيح</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setIsAdding(false);
                }}
                className="px-6 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 text-sm font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (editingQuestion) handleUpdateQuestion(editingQuestion.id, editingQuestion);
                  else handleAddQuestion();
                }}
                className="px-8 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[110] px-6 py-3 rounded-2xl shadow-2xl border-2 animate-slideUp flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-red-950 border-red-500 text-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{toast.msg}</span>
        </div>
      )}
    </div>
  );
};
