import React, { useState, useEffect } from 'react';
import {
  Type,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Eye,
  GraduationCap,
  Award,
  Loader2,
  Building,
  PhoneCall,
} from 'lucide-react';
import {
  getSiteTitleConfig,
  saveSiteTitleConfig,
  resetSiteTitleConfigToDefault,
  SiteTitleConfig,
  DEFAULT_SITE_TITLE_CONFIG,
} from '../utils/siteTitleStorage';
import { getAdminSettings, saveAdminSettings } from '../utils/adminStorage';

export const AdminSiteTitleManager: React.FC = () => {
  const [config, setConfig] = useState<SiteTitleConfig>(() => getSiteTitleConfig());
  const [mainTitle, setMainTitle] = useState<string>(config.mainTitle);
  const [subtitle, setSubtitle] = useState<string>(config.subtitle);
  const [topBadge1, setTopBadge1] = useState<string>(config.topBadge1);
  const [topBadge2, setTopBadge2] = useState<string>(config.topBadge2);
  const [footerUniversity, setFooterUniversity] = useState<string>(config.footerUniversity);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(config.customLogoUrl || '');
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => getAdminSettings().whatsappNumber || '+201091473136');

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync state if updated externally
  useEffect(() => {
    const handleSync = (e: any) => {
      const updated = e.detail || getSiteTitleConfig();
      setConfig(updated);
      setMainTitle(updated.mainTitle);
      setSubtitle(updated.subtitle);
      setTopBadge1(updated.topBadge1);
      setTopBadge2(updated.topBadge2);
      setFooterUniversity(updated.footerUniversity);
      setCustomLogoUrl(updated.customLogoUrl || '');
    };

    window.addEventListener('cp_site_title_updated', handleSync);
    return () => window.removeEventListener('cp_site_title_updated', handleSync);
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|svg\+xml)$/i)) {
      showNotification('يرجى اختيار صورة صالحة (JPG, PNG, WebP, SVG)', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotification('حجم الصورة كبير، يرجى اختيار صورة أقل من 2 ميجابايت', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setCustomLogoUrl(base64);
        showNotification('تم اختيار وتجهيز شعار الموقع بنجاح! لا تنسَ الضغط على "حفظ وتحديث".');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainTitle.trim()) {
      showNotification('يرجى كتابة عنوان الموقع الرئيسي', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updated = saveSiteTitleConfig(
        {
          mainTitle: mainTitle.trim(),
          subtitle: subtitle.trim(),
          topBadge1: topBadge1.trim(),
          topBadge2: topBadge2.trim(),
          footerUniversity: footerUniversity.trim(),
          customLogoUrl: customLogoUrl.trim(),
        },
        true
      );
      setConfig(updated);

      if (whatsappNumber.trim()) {
        saveAdminSettings({ whatsappNumber: whatsappNumber.trim() });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cp_settings_updated'));
        }
      }

      showNotification('✓ تم حفظ وتحديث عنوان الشعار والموقع بنجاح ومزامنته للجميع فوراً');
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    }
  };

  const handleReset = () => {
    const def = resetSiteTitleConfigToDefault();
    setConfig(def);
    setMainTitle(def.mainTitle);
    setSubtitle(def.subtitle);
    setTopBadge1(def.topBadge1);
    setTopBadge2(def.topBadge2);
    setFooterUniversity(def.footerUniversity);
    setCustomLogoUrl('');
    showNotification('✓ تم استعادة العنوان والبيانات الافتراضية بنجاح ومزامنتها');
  };

  return (
    <div className="space-y-6 font-['Cairo',_sans-serif] text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/50 text-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.25)]">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] tracking-tight flex items-center gap-2">
              <span>تعديل عنوان الموقع وشاشة البداية</span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold shadow-sm">
                مزامنة فورية حية
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              تعديل العنوان الرئيسي والفرعي الموجود في بداية الدخول أعلى صورة الدخول، ومزامنة أي تعديل فوراً لجميع المستخدمين.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>استعادة العنوان الافتراضي</span>
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

      {/* Live Preview Box */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#080b18] border-2 border-amber-400/50 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>معاينة حية لشاشة البداية (كيف تظهر للطلاب أعلى صورة الدخول):</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Live Preview</span>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e142a]/90 border border-blue-500/30 text-center space-y-3">
          {/* Top Badges Preview: Black Background + Golden Text */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {topBadge1 && (
              <span className="badge-gold-on-black px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>{topBadge1}</span>
              </span>
            )}
            {topBadge2 && (
              <span className="badge-gold-on-black px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{topBadge2}</span>
              </span>
            )}
          </div>

          {/* Main Title Preview */}
          <h1 className="text-base sm:text-xl lg:text-2xl font-black text-white font-['Tajawal'] tracking-tight leading-relaxed max-w-3xl mx-auto">
            {mainTitle || '(اكتب العنوان الرئيسي ليظهر هنا)'}
          </h1>

          {/* Subtitle Preview */}
          {subtitle && (
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl mx-auto leading-relaxed font-medium">
              {subtitle}
            </p>
          )}

          {/* Location Badge */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 border border-slate-800 bg-slate-950/80 px-3 py-1 rounded-full inline-block">
              {footerUniversity || 'جامعة طنطا - كلية التربية النوعية'}
            </span>
          </div>
        </div>
      </div>

      {/* Editing Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#090c1e] border border-slate-800 space-y-5 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ffd700]" />
          <span>تخصيص شعار الموقع (لوجو المنصة) وعناوين النصوص</span>
        </h3>

        {/* Custom Logo Image Upload Field */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <label className="block text-xs sm:text-sm font-bold text-slate-200">
            شعار الموقع المخصص (صورة اللوجو في شريط التنقل العلوي):
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-sky-400 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              {customLogoUrl ? (
                <img src={customLogoUrl} alt="معاينة الشعار" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-black text-amber-400 font-['Outfit']">Cp</span>
              )}
            </div>
            <div className="flex-1 space-y-2 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-500 file:cursor-pointer cursor-pointer"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  يرجى اختيار صورة مربعة واضحة (PNG أو JPG أو WebP أقل من 2 ميجابايت).
                </span>
                {customLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setCustomLogoUrl('')}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                  >
                    إزالة الشعار والعودة للوجو الافتراضي (Cp)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 1. Main Title Field */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
            عنوان الموقع الرئيسي (المعروض في بداية الدخول أعلى صورة الدخول): <span className="text-amber-400">*</span>
          </label>
          <textarea
            rows={4}
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            placeholder="اكتب العنوان الرئيسي للموقع أو عنوان رسالة الماجستير..."
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm leading-relaxed outline-none transition-all resize-y"
            required
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            يمكنك كتابة العنوان بالكامل وسيتم تنسيقه بشكل أنيق وتوسيطه أعلى صورة الدخول.
          </span>
        </div>

        {/* 2. Subtitle Field */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
            العنوان الفرعي وتفاصيل الكلية / البيئة:
          </label>
          <textarea
            rows={2}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="مثال: جامعة طنطا - كلية التربية النوعية - قسم تكنولوجيا التعليم • بيئة تفاعلية لاكتساب مهارات Adobe Captivate 2019"
            className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm leading-relaxed outline-none transition-all resize-y"
          />
        </div>

        {/* 3. Badges Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>الشارة الأولى (أعلى العنوان):</span>
            </label>
            <input
              type="text"
              value={topBadge1}
              onChange={(e) => setTopBadge1(e.target.value)}
              placeholder="مثال: رسالة ماجستير في تكنولوجيا التعليم"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>الشارة الثانية (البرنامج / المنظومة):</span>
            </label>
            <input
              type="text"
              value={topBadge2}
              onChange={(e) => setTopBadge2(e.target.value)}
              placeholder="مثال: Adobe Captivate 2019"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs outline-none"
            />
          </div>
        </div>

        {/* 4. Footer University Text */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>نص الجامعة والكلية في أسفل شاشة البداية:</span>
          </label>
          <input
            type="text"
            value={footerUniversity}
            onChange={(e) => setFooterUniversity(e.target.value)}
            placeholder="مثال: جامعة طنطا - كلية التربية النوعية"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs outline-none"
          />
        </div>

        {/* 5. WhatsApp Support Number Field */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>رقم دعم الواتساب للطلاب والمشرفين:</span>
          </label>
          <input
            type="text"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+201091473136"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-emerald-300 font-mono text-xs outline-none text-left"
            dir="ltr"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            الرقم المخصص لتلقي رسائل المساعدة عبر واتساب: +201091473136
          </span>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(255,215,0,0.35)] flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>جاري الحفظ والمزامنة السحابية...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ وتحديث عنوان الموقع فوراً للجميع</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
