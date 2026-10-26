import React, { useState, useEffect } from 'react';
import {
  Image,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Upload,
  Eye,
  Check,
} from 'lucide-react';
import {
  getSplashImageUrl,
  saveSplashImageUrl,
  resetSplashImageToDefault,
  SPLASH_PRESETS,
} from '../utils/splashStorage';
import { addActivityLog } from '../utils/adminStorage';

export const AdminSplashManager: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>(() => getSplashImageUrl());
  const [customInputUrl, setCustomInputUrl] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUrl(getSplashImageUrl());
    };
    window.addEventListener('cp_splash_image_updated', handleUpdate);
    return () => window.removeEventListener('cp_splash_image_updated', handleUpdate);
  }, []);

  const handleSelectPreset = (url: string) => {
    saveSplashImageUrl(url);
    setCurrentUrl(url);
    setPreviewError(false);
    addActivityLog('تم تغيير صورة الدخول في بداية الموقع إلى نموذج محدد', 'المشرف', 'success');
    setSaveSuccessMsg('تم اعتماد وتغيير صورة الدخول بنجاح!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleSaveCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;
    saveSplashImageUrl(customInputUrl.trim());
    setCurrentUrl(customInputUrl.trim());
    setCustomInputUrl('');
    setPreviewError(false);
    addActivityLog('تم تعيين رابط مخصص لصورة شاشة الدخول في بداية الموقع', 'المشرف', 'success');
    setSaveSuccessMsg('تم حفظ وتحديث صورة الدخول في بداية الموقع بنجاح!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        saveSplashImageUrl(reader.result);
        setCurrentUrl(reader.result);
        setPreviewError(false);
        addActivityLog('تم رفع صورة جديدة من الجهاز لشاشة الدخول في بداية الموقع', 'المشرف', 'success');
        setSaveSuccessMsg('تم رفع وحفظ صورة الدخول بنجاح!');
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (window.confirm('هل تريد استعادة صورة الدخول المعتمدة الأصلية (طالب أنيق يرتدي بدلة مع كتاب Adobe Captivate)؟')) {
      resetSplashImageToDefault();
      const def = getSplashImageUrl();
      setCurrentUrl(def);
      setPreviewError(false);
      addActivityLog('تمت استعادة صورة شاشة الدخول الافتراضية الأصلية', 'المشرف', 'success');
      setSaveSuccessMsg('تمت استعادة الصورة الأصلية المعتمدة بنجاح');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif]">
      {/* Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#120e26] via-[#1a1435] to-[#120e26] border-2 border-[#d4af37]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-[#ffd700] text-slate-950 font-black text-xs">
              لوحة تحكم الأدمن
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 text-xs font-bold">
              تغيير صور الدخول في بداية الموقع
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-['Tajawal']">
            إدارة وتغيير صور شاشة الدخول التمهيدية في بداية الموقع
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
            يمكن للمشرف اختيار الصورة المعروضة في شاشة الدخول الأولى (طالب أنيق ببدلة يحمل كتاب Adobe Captivate أو بيئات ألعاب سيبرانية)، أو رفع صورة مخصصة من جهازه، أو إدخال رابط خارجي.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>استعادة الصورة المعتمدة</span>
        </button>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-200 text-sm font-bold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Active Preview on Left, Selector/Upload on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Preview */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0b0e1e] border-2 border-blue-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#ffd700]" />
              <h4 className="text-base font-black text-white font-['Tajawal']">
                الصورة المعتمدة حالياً في شاشة الدخول
              </h4>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
              مفعلة الآن 🌟
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border-2 border-[#ffd700]/70 bg-slate-950 aspect-[4/3] flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.25)]">
            {previewError ? (
              <div className="p-6 text-center text-xs text-rose-300">
                تعذر تحميل معاينة الصورة. يرجى التأكد من الرابط.
              </div>
            ) : (
              <img
                src={currentUrl}
                alt="معاينة صورة الدخول"
                onError={() => setPreviewError(true)}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 inset-x-3 text-center">
              <span className="text-xs font-bold text-amber-200 bg-black/80 px-3 py-1 rounded-full border border-amber-500/40 inline-block shadow">
                تظهر للطلاب في أول شاشة بالموقع فور الدخول
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
            <span className="font-bold text-[#ffd700]">ملاحظة أكاديمية: </span>
            تُعرض هذه الصورة في البطاقة الزجاجية لشاشة الدخول التمهيدية لتمنح الطلاب إيحاءً بالاحترافية والأناقة مع أجواء الألعاب التعليمية وكتاب كابتفيت.
          </div>
        </div>

        {/* Change / Upload Options */}
        <div className="lg:col-span-7 space-y-5">
          {/* Presets List */}
          <div className="p-6 rounded-2xl bg-[#0b0e1e] border-2 border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-black text-white font-['Tajawal']">
                1. اختيار من النماذج والصور الجاهزة
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SPLASH_PRESETS.map((preset) => {
                const isSelected = currentUrl === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-amber-950/40 border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.3)] scale-[1.02]'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-700 bg-black">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#ffd700] text-slate-950 flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-black text-white block">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-2">
                        {preset.description}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                        isSelected
                          ? 'bg-[#ffd700] text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ معتمدة حالياً' : 'تطبيق هذه الصورة'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Custom File from Device */}
          <div className="p-6 rounded-2xl bg-[#0b0e1e] border-2 border-slate-800 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Upload className="w-5 h-5 text-blue-400" />
              <h4 className="text-base font-black text-white font-['Tajawal']">
                2. رفع صورة جديدة من جهاز الكمبيوتر
              </h4>
            </div>

            <p className="text-xs text-slate-300">
              اختر أي صورة من جهازك بصيغة (JPG, PNG, WebP) ليتم حفظها وعرضها فوراً في شاشة الدخول الأولى.
            </p>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-500/50 hover:border-blue-400 rounded-2xl bg-blue-950/20 hover:bg-blue-950/30 transition cursor-pointer text-center group">
              <Upload className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-xs font-bold text-white">انقر هنا لاختيار ملف صورة من جهازك</span>
              <span className="text-[10px] text-slate-400 mt-1">الحد الأقصى الموصى به: 5 ميجابايت</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Enter External Image URL */}
          <div className="p-6 rounded-2xl bg-[#0b0e1e] border-2 border-slate-800 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Image className="w-5 h-5 text-purple-400" />
              <h4 className="text-base font-black text-white font-['Tajawal']">
                3. تعيين رابط صورة خارجي (URL)
              </h4>
            </div>

            <form onSubmit={handleSaveCustomUrl} className="flex gap-2">
              <input
                type="url"
                value={customInputUrl}
                onChange={(e) => setCustomInputUrl(e.target.value)}
                placeholder="https://example.com/student-suit-captivate.jpg"
                className="flex-1 h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#ffd700] text-xs text-white placeholder-slate-500 focus:outline-none text-left "
              />
              <button
                type="submit"
                disabled={!customInputUrl.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>حفظ الرابط</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
