import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  Star,
  Award,
  TrendingUp,
  Gamepad2,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Check,
  Edit3,
  HelpCircle,
  Sparkles,
  Package,
} from 'lucide-react';
import {
  getSiteInstructionsConfig,
  saveSiteInstructionsConfig,
  resetSiteInstructionsToDefault,
  SiteInstructionsConfig,
  InstructionCardItem,
} from '../utils/instructionsStorage';
import {
  getPreTestQuestions,
  savePreTestQuestions,
  resetPreTestQuestionsToDefault,
  getPostTestQuestions,
  savePostTestQuestions,
} from '../data/preTestData';
import { PreTestQuestion } from '../types';

export const AdminInstructionsManager: React.FC = () => {
  const [config, setConfig] = useState<SiteInstructionsConfig>(() => getSiteInstructionsConfig());
  const [preTestQuestions, setPreTestQuestions] = useState<PreTestQuestion[]>(() => getPreTestQuestions());
  const [postTestQuestions, setPostTestQuestions] = useState<PreTestQuestion[]>(() => getPostTestQuestions());
  const [selectedBankType, setSelectedBankType] = useState<'pre' | 'post'>('pre');
  const [activeSubTab, setActiveSubTab] = useState<'instructions_cards' | 'pretest_questions'>('instructions_cards');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [activeEditingCardId, setActiveEditingCardId] = useState<string>('pretest');

  // New Bullet temp state
  const [newBulletText, setNewBulletText] = useState('');

  // New Rule / Card Form State
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardTag, setNewCardTag] = useState('');
  const [newCardText, setNewCardText] = useState('');

  // Handle saving
  const handleSaveConfig = () => {
    saveSiteInstructionsConfig(config);
    savePreTestQuestions(preTestQuestions);
    savePostTestQuestions(postTestQuestions);
    setSaveSuccessMsg('تم حفظ قواعد وإرشادات الموقع وبنوك الأسئلة (القبلي والبعدي) بنجاح!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل أنت متأكد من استعادة النصوص والمعايير والقواعد الافتراضية المعتمدة؟')) {
      const def = resetSiteInstructionsToDefault();
      const defQ = resetPreTestQuestionsToDefault();
      setConfig(def);
      setPreTestQuestions(defQ);
      setPostTestQuestions(defQ);
      setActiveEditingCardId(def.cards[0]?.id || 'pretest');
      setSaveSuccessMsg('تمت استعادة القواعد والمعايير الافتراضية بنجاح.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Add a new Rule (Card)
  const handleAddNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    const newId = 'rule_' + Date.now();
    const newRuleCard: InstructionCardItem = {
      id: newId,
      title: newCardTitle.trim(),
      tag: newCardTag.trim() || 'قاعدة جديدة',
      tagColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/50',
      borderColor: 'border-indigo-500/50',
      bgColor: 'from-indigo-950/40 via-slate-900/40 to-slate-950/70',
      iconKey: 'custom',
      text: newCardText.trim() || 'شرح وتفاصيل هذه القاعدة أو الإرشاد في بيئة الألعاب...',
      bullets: ['بند إرشادي رقم 1 لهذه القاعدة الجديدة'],
    };

    setConfig((prev) => ({
      ...prev,
      cards: [...prev.cards, newRuleCard],
    }));
    setActiveEditingCardId(newId);
    setNewCardTitle('');
    setNewCardTag('');
    setNewCardText('');
    setShowAddCardModal(false);
    setSaveSuccessMsg(`تمت إضافة قاعدة جديدة: "${newRuleCard.title}". لا تنسَ النقر على زر الحفظ لتثبيتها!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Delete a Rule (Card)
  const handleDeleteRule = (cardId: string) => {
    if (config.cards.length <= 1) {
      alert('يجب الإبقاء على قاعدة أو بطاقة واحدة على الأقل في بيئة التعلم.');
      return;
    }
    const cardToDelete = config.cards.find((c) => c.id === cardId);
    if (window.confirm(`هل أنت متأكد من حذف القاعدة: "${cardToDelete?.title || cardId}"؟`)) {
      const filtered = config.cards.filter((c) => c.id !== cardId);
      setConfig((prev) => ({
        ...prev,
        cards: filtered,
      }));
      if (activeEditingCardId === cardId) {
        setActiveEditingCardId(filtered[0].id);
      }
      setSaveSuccessMsg('تم حذف القاعدة بنجاح. تذكّر الضغط على زر الحفظ لتثبيت التعديل.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  const activeCard = config.cards.find((c) => c.id === activeEditingCardId) || config.cards[0] || {
    id: 'temp',
    title: '',
    tag: '',
    tagColor: '',
    borderColor: '',
    bgColor: '',
    iconKey: 'custom',
    text: '',
    bullets: [],
  };

  const updateActiveCardField = <K extends keyof InstructionCardItem>(field: K, value: InstructionCardItem[K]) => {
    setConfig((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === activeCard.id ? { ...c, [field]: value } : c)),
    }));
  };

  const handleAddBulletToActiveCard = () => {
    if (!newBulletText.trim()) return;
    updateActiveCardField('bullets', [...activeCard.bullets, newBulletText.trim()]);
    setNewBulletText('');
  };

  const handleRemoveBullet = (index: number) => {
    const updated = activeCard.bullets.filter((_, idx) => idx !== index);
    updateActiveCardField('bullets', updated);
  };

  const handleEditBullet = (index: number, val: string) => {
    const updated = [...activeCard.bullets];
    updated[index] = val;
    updateActiveCardField('bullets', updated);
  };

  // Questions bank handlers (Pre & Post)
  const activeQuestionsList = selectedBankType === 'pre' ? preTestQuestions : postTestQuestions;
  const setActiveQuestionsList = selectedBankType === 'pre' ? setPreTestQuestions : setPostTestQuestions;

  const handleUpdateQuestion = (qId: string, field: keyof PreTestQuestion, val: any) => {
    setActiveQuestionsList((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, [field]: val } : q))
    );
  };

  const handleUpdateQuestionOption = (qId: string, optIdx: number, val: string) => {
    setActiveQuestionsList((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const opts = [...q.options];
        opts[optIdx] = val;
        return { ...q, options: opts };
      })
    );
  };

  const handleAddNewQuestion = () => {
    const nextNum = activeQuestionsList.length + 1;
    const prefix = selectedBankType === 'pre' ? 'pt' : 'post';
    const newQ: PreTestQuestion = {
      id: `${prefix}-${Date.now()}`,
      question: `سؤال جديد رقم #${nextNum}: اكتب نص السؤال هنا...`,
      options: [
        'الخيار الأول (صحيح)',
        'الخيار الثاني',
        'الخيار الثالث',
        'الخيار الرابع',
      ],
      correctIndex: 0,
      explanation: 'اكتب التفسير الأكاديمي والتعليمي لهذا السؤال...',
      points: 50,
    };

    setActiveQuestionsList((prev) => [newQ, ...prev]);
    setSaveSuccessMsg(`تمت إضافة سؤال جديد إلى ${selectedBankType === 'pre' ? 'الاختبار القبلي' : 'الاختبار البعدي'}. تذكّر الضغط على زر الحفظ لتثبيته!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (activeQuestionsList.length <= 1) {
      alert('يجب أن يحتوي بنك الأسئلة على سؤال واحد على الأقل.');
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذا السؤال من بنك الأسئلة؟')) {
      setActiveQuestionsList((prev) => prev.filter((q) => q.id !== qId));
      setSaveSuccessMsg('تم حذف السؤال. تذكّر الضغط على زر الحفظ لتثبيت التعديل.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#120e26] via-[#1a1435] to-[#120e26] border-2 border-[#d4af37]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-[#ffd700] text-slate-950 font-black text-xs">
              صلاحية المشرف الكاملة
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 text-xs font-bold">
              إدارة القواعد والأسئلة (إضافة / تعديل / حذف)
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-['Tajawal']">
            إدارة قواعد اللعبة وبنوك أسئلة الاختبارين القبلي والبعدي
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
            يمكن للأدمن هنا إضافة أو تعديل أو حذف أي قاعدة من قواعد اللعبة، وكذلك إضافة أسئلة جديدة أو تعديل وحذف أسئلة لعبتي الاختبار القبلي والبعدي (لعبة سيارة السباق للـ 25 سؤال الأولى ولعبة الصناديق 📦 للـ 25 سؤال التالية).
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex-1 md:flex-initial px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            type="button"
            id="btn-save-site-instructions"
            onClick={handleSaveConfig}
            className="flex-1 md:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffd700] to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black transition shadow-[0_0_20px_rgba(255,215,0,0.4)] flex items-center justify-center gap-2 cursor-pointer border border-amber-300 transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كافة التعديلات في المنصة</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-200 text-sm font-bold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Sub Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#090b17] border border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('instructions_cards')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'instructions_cards'
              ? 'bg-[#ffd700] text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>إدارة قواعد اللعبة والإرشادات ({config.cards.length} قواعد)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pretest_questions')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'pretest_questions'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>إدارة وبنك أسئلة الاختبارين القبلي والبعدي ({activeQuestionsList.length} سؤال)</span>
        </button>
      </div>

      {/* TAB 1: INSTRUCTIONS & RULES EDITOR (ADD, EDIT, DELETE RULES) */}
      {activeSubTab === 'instructions_cards' && (
        <div className="space-y-6">
          {/* Main Guidance Banner Editor */}
          <div className="p-6 rounded-2xl bg-[#0e1224] border-2 border-amber-500/40 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ffd700]" />
                <h4 className="text-base font-black text-white font-['Tajawal']">
                  نص التوجيه الإرشادي الرئيسي لقواعد اللعبة
                </h4>
              </div>
              <span className="text-xs text-amber-300 font-bold">
                يظهر أعلى بطاقات القواعد لتوجيه الطالب
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                عبارة التوجيه الإرشادي:
              </label>
              <textarea
                value={config.guidanceNotice}
                onChange={(e) => setConfig({ ...config, guidanceNotice: e.target.value })}
                rows={2}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#ffd700] text-sm text-white focus:outline-none leading-relaxed"
                placeholder="اكتب التوجيه الإرشادي هنا..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  عنوان شاشة قواعد اللعبة:
                </label>
                <input
                  type="text"
                  value={config.siteTitle}
                  onChange={(e) => setConfig({ ...config, siteTitle: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#ffd700] text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  وصف الشاشة المختصر:
                </label>
                <input
                  type="text"
                  value={config.siteDescription}
                  onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#ffd700] text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Pretest Requirement Checkbox */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="chk-pretest-required"
                  checked={config.pretestRequiredBeforeLevels}
                  onChange={(e) => setConfig({ ...config, pretestRequiredBeforeLevels: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <label htmlFor="chk-pretest-required" className="text-xs sm:text-sm font-bold text-slate-200 cursor-pointer">
                  إلزامية أداء لعبة الاختبار القبلي قبل فتح مستويات بيئة الألعاب
                </label>
              </div>

              <span className="text-[11px] text-emerald-400 font-mono">
                {config.pretestRequiredBeforeLevels ? '✓ مفعّل إجبارياً' : 'اختياري'}
              </span>
            </div>
          </div>

          {/* Cards Selector & Add New Rule Button */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white font-['Tajawal']">
                قواعد اللعبة الحالية (اختر قاعدة لتعديلها أو حذفها):
              </h4>

              <button
                type="button"
                onClick={() => setShowAddCardModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قاعدة جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {config.cards.map((c) => {
                const isSelected = c.id === activeCard.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveEditingCardId(c.id)}
                    className={`p-3 rounded-2xl border transition-all text-center cursor-pointer flex flex-col items-center gap-1.5 relative group ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-950/80 to-[#120e26] border-[#ffd700] text-white shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-[1.02]'
                        : 'bg-[#0d1021] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black truncate max-w-full">{c.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300 truncate max-w-full">
                      {c.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal / Form to Add a New Rule */}
          {showAddCardModal && (
            <div className="p-5 rounded-2xl bg-[#141029] border-2 border-emerald-500/60 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-black text-white">إضافة قاعدة أو إرشاد جديد للموقع</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ إلغاء
                </button>
              </div>

              <form onSubmit={handleAddNewRule} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">عنوان القاعدة الجديدة:</label>
                    <input
                      type="text"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="مثال: ميثاق العمل والتعاون الجماعي"
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الوسم أو الشارة (Tag):</label>
                    <input
                      type="text"
                      value={newCardTag}
                      onChange={(e) => setNewCardTag(e.target.value)}
                      placeholder="مثال: ميثاق الالتزام"
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الشرح التفصيلي للقاعدة:</label>
                  <textarea
                    value={newCardText}
                    onChange={(e) => setNewCardText(e.target.value)}
                    rows={2}
                    placeholder="اكتب التوجيه الإرشادي والتفصيلي لهذه القاعدة هنا..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCardModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>تأكيد إضافة القاعدة</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Card Detailed Content Editor */}
          {activeCard && (
            <div className="p-6 rounded-2xl bg-[#0b0e1e] border-2 border-blue-500/30 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-400" />
                  <h4 className="text-base font-black text-white font-['Tajawal']">
                    تعديل قاعدة: <span className="text-[#ffd700]">{activeCard.title}</span>
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-blue-950 text-blue-300 border-blue-500/50">
                    معرف القاعدة: {activeCard.id}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteRule(activeCard.id)}
                    className="px-3 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    title="حذف هذه القاعدة بالكامل من الموقع"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف القاعدة</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان القاعدة:</label>
                  <input
                    type="text"
                    value={activeCard.title}
                    onChange={(e) => updateActiveCardField('title', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#ffd700] text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الشارة / الوسم الصغير (Tag):</label>
                  <input
                    type="text"
                    value={activeCard.tag}
                    onChange={(e) => updateActiveCardField('tag', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#ffd700] text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">النص التوضيحي للقاعدة:</label>
                <textarea
                  value={activeCard.text}
                  onChange={(e) => updateActiveCardField('text', e.target.value)}
                  rows={3}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#ffd700] text-sm text-white focus:outline-none leading-relaxed"
                />
              </div>

              {/* Bullets List Editor */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>عناصر وبنود القاعدة (النقاط الفرعية):</span>
                  </label>
                  <span className="text-[11px] text-slate-400">({activeCard.bullets.length} بنود)</span>
                </div>

                <div className="space-y-2">
                  {activeCard.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleEditBullet(idx, e.target.value)}
                        className="flex-1 h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-[#ffd700] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(idx)}
                        className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 text-rose-300 transition cursor-pointer"
                        title="حذف هذا البند"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Bullet */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newBulletText}
                    onChange={(e) => setNewBulletText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBulletToActiveCard();
                      }
                    }}
                    placeholder="أدخل بنداً أو معياراً جديداً..."
                    className="flex-1 h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddBulletToActiveCard}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة بند للقاعدة</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUESTIONS BANK (PRE & POST) WITH ADD, EDIT, DELETE CAPABILITY */}
      {activeSubTab === 'pretest_questions' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e1224] border border-blue-500/40">
            <div>
              <h4 className="text-sm font-black text-white font-['Tajawal']">
                {selectedBankType === 'pre'
                  ? 'أسئلة الاختبار القبلي (المستوى التمهيدي الأول - 50 سؤالاً مقسمة إلى لعبتين)'
                  : 'أسئلة الاختبار البعدي (المستوى الختامي - 50 سؤالاً مقسمة إلى لعبتين)'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                الأسئلة الـ 25 الأولى: لعبة سيارة السباق 🏎️ • الأسئلة الـ 25 التالية: لعبة اختيار الصناديق 📦 (تظهر الدرجات في لوحة الأدمن فقط دون كشف النتيجة للطالب).
              </p>
            </div>

            {/* Switcher & Add Question Button */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddNewQuestion}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال جديد</span>
              </button>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedBankType('pre')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                    selectedBankType === 'pre'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الاختبار القبلي ({preTestQuestions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBankType('post')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                    selectedBankType === 'post'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الاختبار البعدي ({postTestQuestions.length})
                </button>
              </div>
            </div>
          </div>

          {/* Quick game split indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏎️</span>
                <div>
                  <span className="font-bold text-rose-300 block">اللعبة الأولى (الأسئلة 1 إلى 25):</span>
                  <span className="text-[11px] text-slate-400">لعبة قيادة سيارة السباق نحو محطة الإجابة</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 font-bold border border-rose-500/40">
                25 سؤالاً
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <div>
                  <span className="font-bold text-amber-300 block">اللعبة الثانية (الأسئلة 26 إلى 50 وما بعدها):</span>
                  <span className="text-[11px] text-slate-400">لعبة اختيار الصناديق 📦 كل صندوق يحمل إجابة</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 font-bold border border-amber-500/40">
                25+ سؤالاً
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {activeQuestionsList.map((q, qIndex) => {
              const isBoxGame = qIndex >= 25;
              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl bg-[#0b0e1e] border-2 transition-all space-y-4 ${
                    isBoxGame
                      ? 'border-amber-500/40 hover:border-amber-400/70'
                      : 'border-slate-800 hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-950 text-[#ffd700] text-xs font-black border border-amber-500/40">
                        السؤال #{qIndex + 1} ({q.points} XP)
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                          isBoxGame
                            ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                            : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {isBoxGame ? '📦 لعبة الصناديق' : '🏎️ لعبة سيارة السباق'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">ID: {q.id}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 transition cursor-pointer"
                        title="حذف هذا السؤال نهائياً"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">نص السؤال:</label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(q.id, 'question', e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-[#ffd700] focus:outline-none"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      {isBoxGame
                        ? 'إجابات الصناديق 📦 (انقر على الصندوق لتعيين الإجابة الصحيحة):'
                        : 'الخيارات الأربعة (حدد الإجابة الصحيحة بالنقر على الزر):'}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctIndex === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                              isCorrect
                                ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleUpdateQuestion(q.id, 'correctIndex', optIdx)}
                              className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 cursor-pointer border ${
                                isCorrect
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow'
                                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                              }`}
                              title={isCorrect ? 'الإجابة الصحيحة' : 'تعيين كإجابة صحيحة'}
                            >
                              {isCorrect ? <Check className="w-3.5 h-3.5" /> : isBoxGame ? `📦${optIdx + 1}` : ['أ', 'ب', 'ج', 'د'][optIdx]}
                            </button>

                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateQuestionOption(q.id, optIdx, e.target.value)}
                              className="flex-1 bg-transparent text-xs focus:outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      التفسير الأكاديمي والتغذية الراجعة للسؤال:
                    </label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestion(q.id, 'explanation', e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-[#ffd700] focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
