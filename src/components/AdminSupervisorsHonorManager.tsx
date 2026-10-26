import React, { useState } from 'react';
import {
  Award,
  Crown,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ArrowUp,
  ArrowDown,
  BookOpen,
} from 'lucide-react';
import {
  getSupervisorsBoardConfig,
  saveSupervisorsBoardConfig,
  resetSupervisorsBoardConfig,
  INITIAL_RESEARCHER_INFO,
} from '../utils/supervisorsStorage';
import { SupervisorsHonorBoardConfig, SupervisorCard, ResearcherInfo } from '../types';
import { addActivityLog } from '../utils/adminStorage';
import { SupervisorsHonorBoard } from './SupervisorsHonorBoard';

export const AdminSupervisorsHonorManager: React.FC = () => {
  const [config, setConfig] = useState<SupervisorsHonorBoardConfig>(() => getSupervisorsBoardConfig());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // File Upload Helper for Hikmat (Researcher)
  const handleResearcherPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setErrorMessage('يرجى اختيار صورة بصيغة JPG أو JPEG أو PNG صالحة.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('حجم الصورة كبير، يرجى اختيار صورة أقل من 2 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      if (base64Data) {
        setConfig((prev) => ({
          ...prev,
          researcherInfo: {
            ...(prev.researcherInfo || INITIAL_RESEARCHER_INFO),
            imageUrl: base64Data,
          },
        }));
        setSuccessMessage('تم تعيين صورة الباحثة (حكمت) بنجاح! لا تنسَ الضغط على "حفظ التعديلات".');
      }
    };
    reader.readAsDataURL(file);
  };

  // File Upload Helper for Supervisors
  const handlePhotoUpload = (cardId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file format: jpg, jpeg, png
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setErrorMessage('يرجى اختيار صورة بصيغة JPG أو JPEG أو PNG صالحة.');
      return;
    }

    // Limit size to 2MB to keep localStorage healthy
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('حجم الصورة كبير، يرجى اختيار صورة أقل من 2 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      if (base64Data) {
        setConfig((prev) => ({
          ...prev,
          supervisors: prev.supervisors.map((card) =>
            card.id === cardId ? { ...card, imageUrl: base64Data } : card
          ),
        }));
        setSuccessMessage('تم تعيين صورة المشرف بنجاح! لا تنسَ الضغط على "حفظ التعديلات".');
      }
    };
    reader.readAsDataURL(file);
  };

  const arabicOrdinals = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];

  // Add new supervisor card with automatic alignment & ordinal naming
  const handleAddCard = () => {
    const nextIdx = config.supervisors.length + 1;
    const ordinal = arabicOrdinals[nextIdx - 1] || `${nextIdx}`;
    const newCard: SupervisorCard = {
      id: `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      cardIndex: nextIdx,
      cardLabel: `المشرف ${ordinal}`,
      name: 'د/ اسم المشرف الجديد',
      title: 'كلية التربية النوعية - جامعة طنطا',
      role: 'مشرف علمي على البحث',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      accentColor: '#ffd700',
    };

    setConfig((prev) => {
      const updated = [...prev.supervisors, newCard].map((c, i) => ({
        ...c,
        cardIndex: i + 1,
        cardLabel: c.cardLabel?.startsWith('المشرف') ? `المشرف ${arabicOrdinals[i] || i + 1}` : c.cardLabel,
      }));
      return { ...prev, supervisors: updated };
    });
    setSuccessMessage(`تمت إضافة بطاقة جديدة (${newCard.cardLabel}) وتمت إعادة محاذاة وتوسيط اللوحة تلقائياً.`);
  };

  // Delete supervisor card with automatic re-alignment & ordinal re-indexing
  const handleDeleteCard = (cardId: string, cardLabel: string) => {
    if (supervisorsToManage.length <= 1) {
      setErrorMessage('يجب أن تحتوي لوحة الشرف على مشرف واحد على الأقل.');
      return;
    }

    if (window.confirm(`هل أنت متأكد من حذف ${cardLabel} من لوحة الشرف؟`)) {
      setConfig((prev) => {
        const remaining = prev.supervisors.filter((c) => c.id !== cardId);
        // Automatically re-index and re-align card labels and indices
        const realigned = remaining.map((c, i) => ({
          ...c,
          cardIndex: i + 1,
          cardLabel: c.cardLabel?.startsWith('المشرف') ? `المشرف ${arabicOrdinals[i] || i + 1}` : c.cardLabel,
        }));
        return {
          ...prev,
          supervisors: realigned,
        };
      });
      setSuccessMessage(`تم حذف ${cardLabel} بنجاح، وتمت إعادة محاذاة وتوسيط البطاقات تلقائياً لتظهر بمظهر لائق ومتناسق.`);
    }
  };

  // Move supervisor card
  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const newSupervisors = [...config.supervisors];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newSupervisors.length) return;

    const temp = newSupervisors[index];
    newSupervisors[index] = newSupervisors[targetIdx];
    newSupervisors[targetIdx] = temp;

    setConfig((prev) => ({
      ...prev,
      supervisors: newSupervisors.map((c, i) => ({
        ...c,
        cardIndex: i + 1,
      })),
    }));
  };

  // Save all
  const handleSaveAll = () => {
    try {
      saveSupervisorsBoardConfig(config);
      addActivityLog('تم تحديث وتعديل بيانات لوحة الشرف للمشرفين والباحثة', 'المشرف', 'success');
      setSuccessMessage('تم حفظ كافة إعدادات لوحة الشرف وبطاقات المشرفين بنجاح!');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      setErrorMessage('حدث خطأ أثناء حفظ الإعدادات، يرجى المحاولة ثانية.');
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('هل تريد استعادة البيانات الافتراضية للوحة شرف مشرفي جامعة طنطا؟')) {
      const def = resetSupervisorsBoardConfig();
      setConfig(def);
      addActivityLog('تمت استعادة الضبط الافتراضي للوحة الشرف للمشرفين', 'المشرف', 'warning');
      setSuccessMessage('تمت استعادة البيانات الافتراضية للوحة الشرف بنجاح.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const researcher = config.researcherInfo || INITIAL_RESEARCHER_INFO;
  // Supervisors to manage (excluding any legacy Hikmat entry if present)
  const supervisorsToManage = config.supervisors.filter(
    (s) => !s.name?.includes('حكمت') && s.id !== 'sup-4'
  );

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif]" id="admin-supervisors-honor-manager">
      {/* Top Banner & Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#171330] via-[#100c24] to-[#0a0817] border-2 border-[#ffd700]/70 p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-28 bg-[#ffd700]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ffd700] via-amber-400 to-[#d4af37] text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(255,215,0,0.45)] shrink-0">
              <Crown className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[#ffd700]/20 border border-[#ffd700] text-[#ffd700] text-xs font-black">
                  إدارة لوحة الشرف
                </span>
                <span className="text-xs text-amber-200 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>اسم وصورة حكمت في الأعلى + المشرفون الثلاثة في الصف السفلي</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Tajawal']">
                لوحة الشرف والتقدير للباحثة والمشرفين
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                تخصيص صورة واسم الباحثة (حكمت) في صدارة اللوحة، وإدارة بطاقات المشرفين الثلاثة ووظائفهم وصورهم.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
            >
              <Eye className="w-4 h-4 text-[#ffd700]" />
              <span>معاينة حية للوحة الشرف</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(255,215,0,0.4)]"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white text-xs underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white text-xs underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* 🌟 القسم 1: بيانات وصورة حكمت في الأعلى 🌟 */}
      <div className="rounded-3xl bg-gradient-to-b from-[#111936]/95 to-[#0b1024]/95 border-2 border-emerald-500/50 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/40">
                في صدارة اللوحة (أعلى الشاشة)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-['Tajawal'] mt-1">
              <Crown className="w-5 h-5 text-amber-300" />
              <span>1. بيانات وصورة الباحثة (حكمت) في الأعلى</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              تظهر هذه البيانات بشكل بارز في صدارة لوحة الشرف أعلى المشرفين تقديراً لجهد إعداد البيئة والرسالة.
            </p>
          </div>
        </div>

        {/* Researcher Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Researcher Photo Upload Card */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900/80 border-2 border-emerald-400/40 text-center space-y-3">
            <span className="text-xs font-bold text-emerald-300">صورة الباحثة (حكمت)</span>

            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-[#ffd700] to-emerald-400 shadow-[0_0_25px_rgba(255,215,0,0.45)]">
                <img
                  src={researcher.imageUrl}
                  alt={researcher.name}
                  className="w-full h-full rounded-full object-cover border-2 border-slate-950"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            </div>

            <label
              htmlFor="upload-researcher-photo"
              className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع صورة جديدة (JPG/PNG)</span>
              <input
                type="file"
                id="upload-researcher-photo"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleResearcherPhotoUpload}
                className="hidden"
              />
            </label>

            <div className="w-full space-y-1 text-right">
              <label className="text-[11px] text-slate-400">أو رابط الصورة المباشر:</label>
              <input
                type="text"
                value={researcher.imageUrl}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    researcherInfo: {
                      ...(prev.researcherInfo || INITIAL_RESEARCHER_INFO),
                      imageUrl: e.target.value,
                    },
                  }))
                }
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs  outline-none"
              />
            </div>
          </div>

          {/* Researcher Text Fields */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  اسم الباحثة بالكامل:
                </label>
                <input
                  type="text"
                  value={researcher.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig((prev) => ({
                      ...prev,
                      researcher: val,
                      researcherInfo: {
                        ...(prev.researcherInfo || INITIAL_RESEARCHER_INFO),
                        name: val,
                      },
                    }));
                  }}
                  placeholder="الباحثة/ حكمت عزت محمد غنيم"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 text-white text-xs sm:text-sm outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  الصفة في اللوحة:
                </label>
                <input
                  type="text"
                  value={researcher.role}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      researcherInfo: {
                        ...(prev.researcherInfo || INITIAL_RESEARCHER_INFO),
                        role: e.target.value,
                      },
                    }))
                  }
                  placeholder="الباحثة ومعدة الدراسة"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 text-white text-xs sm:text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">
                الوظيفة والمسمى الأكاديمي:
              </label>
              <input
                type="text"
                value={researcher.title}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    researcherInfo: {
                      ...(prev.researcherInfo || INITIAL_RESEARCHER_INFO),
                      title: e.target.value,
                    },
                  }))
                }
                placeholder="معيدة بقسم تكنولوجيا التعليم ومصممة بيئة الألعاب التعليمية"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 text-white text-xs sm:text-sm outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">
                عنوان الرسالة العلمية:
              </label>
              <textarea
                rows={2}
                value={config.researchTitle || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, researchTitle: e.target.value }))}
                placeholder="تصميم بيئة ألعاب تعليمية إلكترونية قائمة على التفاعل بين نمط التغذية الراجعة ونمط التعلم"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 text-white text-xs sm:text-sm outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 القسم 2: المشرفين الثلاثة في الصف السفلي 🌟 */}
      <div className="rounded-3xl bg-[#0f0c22]/90 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40">
                في الصف السفلي (تحت الباحثة)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-['Tajawal'] mt-1">
              <Award className="w-5 h-5 text-[#ffd700]" />
              <span>2. المشرفون الثلاثة في الصف السفلي</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              إدارة أسماء ووظائف وصور أساتذة لجنة الإشراف العلمي الثلاثة المعروضين في الصف السفلي.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddCard}
            id="btn-add-supervisor-card"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة مشرف</span>
          </button>
        </div>

        {/* List of Supervisors in Bottom Row with Auto-alignment */}
        <div className={`grid gap-5 ${
          supervisorsToManage.length <= 1 ? 'grid-cols-1 max-w-md mx-auto' :
          supervisorsToManage.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
          'grid-cols-1 lg:grid-cols-3'
        }`}>
          {supervisorsToManage.map((card, idx) => (
            <div
              key={card.id}
              className="rounded-2xl bg-gradient-to-b from-[#13102c]/95 via-[#0c091d]/95 to-[#070512]/95 border-2 border-slate-700/80 hover:border-amber-500/80 p-5 shadow-lg relative space-y-4 group transition-all"
            >
              {/* Card Header with Label & Actions */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400 text-amber-300 font-black text-xs font-['Cairo'] shadow-sm">
                    {card.cardLabel || `المشرف ${idx + 1}`}
                  </span>
                  <span className="text-[11px] text-slate-400 ">
                    #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="تحريك لأعلى/لليمين"
                    disabled={idx === 0}
                    onClick={() => handleMoveCard(idx, 'up')}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="تحريك لأسفل/لليسار"
                    disabled={idx === supervisorsToManage.length - 1}
                    onClick={() => handleMoveCard(idx, 'down')}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="حذف هذه البطاقة"
                    onClick={() => handleDeleteCard(card.id, card.cardLabel)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-300 hover:text-white border border-red-800/60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Photo & Upload Area */}
              <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-[#ffd700] to-yellow-200 shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-full h-full rounded-full object-cover border-2 border-slate-950"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src =
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-1.5">
                  <label
                    htmlFor={`upload-photo-${card.id}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/50 text-blue-200 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Upload className="w-3 h-3 text-blue-300" />
                    <span>رفع صورة (JPG)</span>
                    <input
                      type="file"
                      id={`upload-photo-${card.id}`}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handlePhotoUpload(card.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Fields: Name, Role, Job Title */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    اسم المشرف:
                  </label>
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) => ({
                        ...prev,
                        supervisors: prev.supervisors.map((c) =>
                          c.id === card.id ? { ...c, name: val } : c
                        ),
                      }));
                    }}
                    placeholder="أ.د/ اسم المشرف"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white font-bold text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    الصفة في الإشراف:
                  </label>
                  <input
                    type="text"
                    value={card.role}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) => ({
                        ...prev,
                        supervisors: prev.supervisors.map((c) =>
                          c.id === card.id ? { ...c, role: val } : c
                        ),
                      }));
                    }}
                    placeholder="رئيس لجنة الإشراف / مشرف علمي"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-purple-200 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    الوظيفة والكلية:
                  </label>
                  <textarea
                    rows={2}
                    value={card.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) => ({
                        ...prev,
                        supervisors: prev.supervisors.map((c) =>
                          c.id === card.id ? { ...c, title: val } : c
                        ),
                      }));
                    }}
                    placeholder="أستاذ تكنولوجيا التعليم بكلية التربية النوعية جامعة طنطا"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-slate-200 text-xs outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🌟 القسم 3: الإعدادات العامة للوحة الشرف 🌟 */}
      <div className="rounded-3xl bg-[#0f0c22]/90 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-['Tajawal'] border-b border-slate-800 pb-3">
          <GraduationCap className="w-5 h-5 text-blue-400" />
          <span>3. الإعدادات العامة للوحة الشرف والعنوان الذهبي</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-amber-300">
              عنوان لوحة الشرف (الذهبي المميز):
            </label>
            <input
              type="text"
              value={config.boardTitle}
              onChange={(e) => setConfig((prev) => ({ ...prev, boardTitle: e.target.value }))}
              placeholder="لوحة الشرف لمشرفي المشروع والرسالة العلمية"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-400/50 text-amber-200 text-xs sm:text-sm font-bold outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200">
              التبعية والجامعة:
            </label>
            <input
              type="text"
              value={config.university}
              onChange={(e) => setConfig((prev) => ({ ...prev, university: e.target.value }))}
              placeholder="جامعة طنطا - كلية التربية النوعية - قسم تكنولوجيا التعليم"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200">
              الوصف والإهداء الأكاديمي للوحة:
            </label>
            <textarea
              rows={2}
              value={config.boardSubtitle}
              onChange={(e) => setConfig((prev) => ({ ...prev, boardSubtitle: e.target.value }))}
              placeholder="اكتب وصفاً أو إهداءً أكاديمياً للوحة (اختياري)..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none resize-none"
            />
          </div>

          {/* Auto Display on Student Login Switch */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-900/60 border border-blue-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  عرض لوحة الشرف تلقائياً بعد تسجيل دخول الطالب
                </h4>
                <p className="text-[11px] text-slate-300">
                  بمجرد تسجيل دخول الطالب تظهر له البطاقة الزجاجية الكبيرة تقديراً للباحثة والمشرفين قبل استكمال اللعبة.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.showOnStudentLogin !== false}
                onChange={(e) => setConfig((prev) => ({ ...prev, showOnStudentLogin: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Section 4: Bottom Controls (حفظ واستعادة) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c091d] border border-slate-800">
        <button
          type="button"
          onClick={handleResetToDefault}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الضبط الافتراضي (مشرفي وباحثة جامعة طنطا)</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Eye className="w-4 h-4 text-[#ffd700]" />
            <span>معاينة البطاقة الزجاجية</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_25px_rgba(255,215,0,0.45)]"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>حفظ جميع التعديلات</span>
          </button>
        </div>
      </div>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <SupervisorsHonorBoard
          isModal={true}
          onClose={() => setIsPreviewOpen(false)}
          onContinue={() => setIsPreviewOpen(false)}
          showContinueButton={true}
        />
      )}
    </div>
  );
};
