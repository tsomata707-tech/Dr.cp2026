import React, { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Play,
  Upload,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
  Globe,
  Edit3,
} from 'lucide-react';
import { EducationalVideo } from '../types';
import {
  VIDEO_SLOTS,
  getEducationalVideos,
  saveEducationalVideos,
  deduplicateEducationalVideos,
  addEducationalVideo,
  updateEducationalVideo,
  deleteEducationalVideo,
  rehydrateLocalVideoUrls,
  formatActualDuration,
  isPlaceholderVideo,
  clearAllEducationalVideos,
} from '../utils/videoStorage';
import { addActivityLog } from '../utils/adminStorage';
import { MultiPartVideoPlayer } from './MultiPartVideoPlayer';

export const AdminVideoManager: React.FC = () => {
  const [videos, setVideos] = useState<EducationalVideo[]>(() => deduplicateEducationalVideos(getEducationalVideos()));
  
  useEffect(() => {
    const handleUpdate = () => {
      setVideos(deduplicateEducationalVideos(getEducationalVideos()));
    };
    window.addEventListener('videos-storage-updated', handleUpdate);
    return () => window.removeEventListener('videos-storage-updated', handleUpdate);
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<EducationalVideo | null>(null);
  const [previewSlotId, setPreviewSlotId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [targetSlotId, setTargetSlotId] = useState(VIDEO_SLOTS[0].slotId);
  const [partNumber, setPartNumber] = useState<number>(1);
  const [partCustomTitle, setPartCustomTitle] = useState<string>('الجزء 1');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'youtube' | 'mp4'>('youtube');
  const [actualDuration, setActualDuration] = useState<string>('04:30 دقيقة');

  // Edit Video State
  const [editingVideo, setEditingVideo] = useState<EducationalVideo | null>(null);
  const [editPartCustomTitle, setEditPartCustomTitle] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editPartNumber, setEditPartNumber] = useState<number>(1);
  const [editVideoUrl, setEditVideoUrl] = useState<string>('');
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [deletingVideo, setDeletingVideo] = useState<EducationalVideo | null>(null);
  const [isPurging, setIsPurging] = useState<boolean>(false);

  // Processing & Feedback State
  const [isPublishing, setIsPublishing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePurgeAll = () => {
    if (window.confirm('⚠️ تنبيه هام: هل أنت متأكد من رغبتك في حذف جميع الفيديوهات الحالية؟ سيتم مسح الذاكرة المؤقتة والبدء من جديد. لا يمكن التراجع عن هذا الإجراء.')) {
      setIsPurging(true);
      clearAllEducationalVideos();
      addActivityLog('قام المشرف بتصفير ومسح جميع الفيديوهات التعليمية', 'المشرف', 'error');
      setTimeout(() => {
        setIsPurging(false);
        refreshVideos();
        setSuccessMessage('✅ تم تصفير جميع الفيديوهات بنجاح. يمكنك الآن البدء بإضافة الفيديوهات المطلوبة بروابط خارجية حصراً.');
      }, 1000);
    }
  };

  const getSlotVideos = (slotId: string) => {
    return videos
      .filter((v) => v.targetSlotId === slotId && v.isActive && !isPlaceholderVideo(v))
      .sort((a, b) => (a.partNumber || 1) - (b.partNumber || 1));
  };

  const level1Videos = getSlotVideos('level-1');

  useEffect(() => {
    rehydrateLocalVideoUrls().then((refreshed) => {
      const clean = deduplicateEducationalVideos(refreshed);
      if (clean.length !== refreshed.length) {
        saveEducationalVideos(clean, true);
      }
      setVideos(clean);
    });
  }, []);

  const handleDeduplicate = () => {
    const rawList = getEducationalVideos();
    const cleanList = deduplicateEducationalVideos(rawList);
    saveEducationalVideos(cleanList, true);
    setVideos(cleanList);
    addActivityLog('قام المشرف بتنظيف الفيديوهات المكررة وعدم دمج الصفوف', 'المشرف', 'info');
    setSuccessMessage(`✅ تم تنظيف الصفوف المكررة بنجاح! الإجمالي الحقيقي الآن: ${cleanList.length} فيديوهات.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const refreshVideos = () => {
    setVideos(deduplicateEducationalVideos(getEducationalVideos()));
  };

  const handleOpenAdd = (defaultSlotId?: string) => {
    const slot = defaultSlotId || VIDEO_SLOTS[0].slotId;
    const slotObj = VIDEO_SLOTS.find((s) => s.slotId === slot);
    const existingInSlot = getSlotVideos(slot);

    if (existingInSlot.length >= 5) {
      alert('وصل هذا العنوان للحد الأقصى المسموح وهو ٥ أجزاء فيديو. يرجى حذف جزء أولاً.');
      return;
    }

    const nextPart = Math.min(5, existingInSlot.length + 1);
    const slotBaseName = slotObj ? slotObj.name.split(':')[0] : '';

    setTitle(
      slot === 'level-1'
        ? `مقدمة في إنتاج وتصميم الوسائط المتعددة (الجزء ${nextPart})`
        : `فيديو شرح ${slotBaseName} (الجزء ${nextPart})`
    );
    setTargetSlotId(slot);
    setPartNumber(nextPart);
    setPartCustomTitle(`الجزء ${nextPart}`);
    setVideoUrl('');
    setVideoType('youtube');
    setActualDuration('04:30 دقيقة');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    const trimmed = url.trim();

    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      setVideoType('youtube');
      setActualDuration('05:00 دقيقة');
    } else {
      setVideoType('mp4');
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = trimmed;
      tempVideo.onloadedmetadata = () => {
        if (tempVideo.duration && tempVideo.duration > 0) {
          setActualDuration(formatActualDuration(tempVideo.duration));
        }
      };
    }

    if (!title) {
      const slotObj = VIDEO_SLOTS.find((s) => s.slotId === targetSlotId);
      if (slotObj) {
        setTitle(`فيديو ${slotObj.name} (الجزء ${partNumber})`);
      }
    }
  };

  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const existingInSlot = getSlotVideos(targetSlotId);
    if (existingInSlot.length >= 5) {
      setFormError('عذراً، وصل هذا العنوان للحد الأقصى المسموح وهو ٥ أجزاء للشرح.');
      return;
    }

    const finalTitle = title.trim();
    if (!finalTitle) {
      setFormError('يرجى كتابة اسم الفيديو.');
      return;
    }

    if (!videoUrl.trim()) {
      setFormError('يرجى إدخال رابط الفيديو (YouTube أو رابط MP4 مباشر).');
      return;
    }

    setIsPublishing(true);

    try {
      const slotDef = VIDEO_SLOTS.find((s) => s.slotId === targetSlotId);
      const slotName = slotDef ? slotDef.name : targetSlotId;
      const customPartLabel = partCustomTitle.trim() || `الجزء ${partNumber}`;

      addEducationalVideo({
        title: finalTitle,
        partNumber,
        partCustomTitle: customPartLabel,
        partTitle: `${customPartLabel}: ${finalTitle}`,
        targetSlotId,
        videoUrl: videoUrl.trim(),
        videoType,
        duration: actualDuration,
        isActive: true,
      });

      addActivityLog(
        `تم رفع ونشر فيديو: "${finalTitle}" (${customPartLabel}) في ${slotName} - المدة الفعلية: ${actualDuration}`,
        'المشرف',
        'success'
      );

      setSuccessMessage(
        `✅ تم تحميل الفيديو بنجاح! متاح الآن لجميع الطلاب في: ${slotName} (المدة الفعلية: ${actualDuration}).`
      );
      refreshVideos();
      setIsPublishing(false);
      setShowAddModal(false);

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setIsPublishing(false);
      setFormError(err?.message || 'حدث خطأ أثناء نشر الفيديو، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleOpenEdit = (v: EducationalVideo) => {
    setEditingVideo(v);
    setEditPartCustomTitle(v.partCustomTitle || (v.partNumber ? `الجزء ${v.partNumber}` : 'الجزء 1'));
    setEditTitle(v.title);
    setEditPartNumber(v.partNumber || 1);
    setEditVideoUrl(v.videoUrl);
    setEditFormError(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    const finalTitle = editTitle.trim();
    if (!finalTitle) {
      setEditFormError('يرجى إدخال اسم أو عنوان الفيديو.');
      return;
    }

    const finalCustomPart = editPartCustomTitle.trim() || (editPartNumber ? `الجزء ${editPartNumber}` : 'الجزء 1');
    setIsSavingEdit(true);

    try {
      updateEducationalVideo(editingVideo.id, {
        title: finalTitle,
        partNumber: editPartNumber,
        partCustomTitle: finalCustomPart,
        partTitle: `${finalCustomPart}: ${finalTitle}`,
        videoUrl: editVideoUrl.trim() || editingVideo.videoUrl,
      });

      addActivityLog(
        `قام المشرف بتعديل تسمية/اسم الفيديو إلى: "${finalCustomPart}" (${finalTitle}) في ${editingVideo.targetSlotName}`,
        'المشرف',
        'success'
      );

      setSuccessMessage(`✅ تم تحديث وتغيير اسم الجزء إلى "${finalCustomPart}" بنجاح! تم تطبيق التعديل للطلاب.`);
      refreshVideos();
      setIsSavingEdit(false);
      setEditingVideo(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setIsSavingEdit(false);
      setEditFormError(err?.message || 'حدث خطأ أثناء حفظ تعديلات الفيديو.');
    }
  };

  const handleDelete = (v: EducationalVideo) => {
    setDeletingVideo(v);
  };

  const confirmDelete = () => {
    if (!deletingVideo) return;
    const v = deletingVideo;
    deleteEducationalVideo(v.id);
    addActivityLog(`تم حذف الفيديو: "${v.title}"`, 'المشرف', 'warning');
    refreshVideos();
    setSuccessMessage(`تم حذف الفيديو "${v.title}" بنجاح.`);
    setDeletingVideo(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <>
      <div className="space-y-6 text-right font-['Cairo',_sans-serif]" id="admin-video-manager">
        <div className="rounded-3xl bg-gradient-to-r from-[#171330] via-[#100c24] to-[#0a0817] border-2 border-[#ffd700]/70 p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-28 bg-[#ffd700]/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.45)] shrink-0">
                <Video className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300 text-xs font-black">
                    إدارة ورفع الفيديوهات
                  </span>
                  <span className="text-xs text-amber-200 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                    <span>إضافة عبر رابط URL بنقرة واحدة</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Tajawal']">
                  إدارة ونشر الفيديوهات التعليمية (روابط خارجية حصراً)
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  ضع روابط فيديوهات الشرح من يوتيوب أو جوجل درايف أو أي رابط خارجي مباشر، وسيتم نشرها فوراً للطلاب.
                  <br />
                  <span className="text-amber-400 font-bold">💡 تنبيه: يمنع رفع الفيديوهات من الجهاز مباشرة لضمان سرعة التحميل وتجنب تجاوز سعة الذاكرة. استخدم روابط خارجية فقط.</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {videos.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleDeduplicate}
                    className="px-4 py-3 rounded-2xl bg-amber-600/20 hover:bg-amber-600 border-2 border-amber-500/50 text-amber-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                    title="إزالة أي تكرار فوراً وتنظيف الصفوف المتراكمة"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>تنظيف التكرار ({videos.length}) 🧹</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPurging}
                    onClick={handlePurgeAll}
                    className="px-4 py-3 rounded-2xl bg-red-600/20 hover:bg-red-600 border-2 border-red-500/50 text-red-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                    title="تصفير وحذف جميع الفيديوهات الحالية للبدء من جديد"
                  >
                    {isPurging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>مسح الكل 🗑️</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => handleOpenAdd()}
                id="btn-open-upload-video-modal"
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(37,99,235,0.5)] border-2 border-blue-400/60 cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                <LinkIcon className="w-4 h-4 stroke-[2.5]" />
                <span>+ إضافة فيديو برابط خارجي 🔗</span>
              </button>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#0d2a1d]/90 to-emerald-950/90 border-2 border-emerald-400 text-emerald-200 text-xs sm:text-sm font-black flex items-center justify-between gap-3 shadow-[0_0_30px_rgba(16,185,129,0.35)] animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-white text-xs underline cursor-pointer shrink-0"
            >
              إغلاق
            </button>
          </div>
        )}

        <div className="rounded-3xl bg-gradient-to-br from-[#12102e] via-[#0e0c24] to-[#070517] border-2 border-[#ffd700] p-6 sm:p-8 shadow-[0_0_40px_rgba(255,215,0,0.25)] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-1/3 w-80 h-32 bg-[#ffd700]/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10 border-b border-slate-800/80 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#ffd700] text-slate-950 font-black text-xs font-['Cairo'] shadow-sm">
                  المستوى 1: المرحلة الحالية المطلوبة
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-400 text-blue-300 text-xs font-bold font-['Cairo']">
                  فيديو المرحلة: مقدمة في إنتاج وتصميم الوسائط المتعددة
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-400 text-purple-300 text-xs font-bold">
                  {level1Videos.length} من 5 أجزاء مرفوعة
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
                المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-['Cairo'] leading-relaxed">
                يمكنك إضافة حتى <strong className="text-amber-300">٥ أجزاء فيديو</strong> للمستوى الأول عبر <strong className="text-white underline">روابط Google Drive أو YouTube</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleOpenAdd('level-1')}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-2 border-blue-400 font-black text-sm flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)]"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>إضافة جزء فيديو للمستوى 1 (برابط خارجي 🔗)</span>
              </button>
            </div>
          </div>

          {level1Videos.length > 0 ? (
            <div className="space-y-4">
              <MultiPartVideoPlayer
                videos={level1Videos}
                title="المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                {level1Videos.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-black text-[11px] border border-amber-500/30">
                          {v.partCustomTitle || (v.partNumber ? `الجزء ${v.partNumber}` : 'الجزء')}
                        </span>
                      </div>
                      <span className="font-bold text-slate-200 block truncate mt-0.5" title={v.title}>
                        {v.title}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                        ⏱️ {v.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(v)}
                        className="p-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-800 text-blue-300 hover:text-white transition-colors cursor-pointer border border-blue-500/40"
                        title="تعديل اسم الجزء"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(v)}
                        className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-300 hover:text-white transition-colors cursor-pointer border border-red-500/40"
                        title="حذف هذا الجزء"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-2">
              <Video className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold">لا يوجد فيديوهات مرفوعة حالياً للمستوى الأول.</p>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-[#0f0c22]/90 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-['Tajawal']">
                <Play className="w-5 h-5 text-[#ffd700]" />
                <span>قائمة الفيديوهات المنشورة للطلاب</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                الفيديوهات النشطة المتاحة للطلاب في مراحل وبيئة التعلم.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 font-bold">
                إجمالي {videos.length} فيديوهات منشورة
              </span>
            </div>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
              <Video className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold">لا توجد فيديوهات منشورة حالياً.</p>
              <p className="text-xs text-slate-500">
                اضغط على زر <strong>"+ إضافة فيديو برابط خارجي 🔗"</strong> بالأعلى للبدء.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-['Cairo']">
                    <th className="pb-3 pr-3">اسم الفيديو ورقم الجزء</th>
                    <th className="pb-3 pr-3">موضع الظهور المحدد</th>
                    <th className="pb-3 pr-3">مصدر الفيديو</th>
                    <th className="pb-3 pr-3">المدة الفعلية</th>
                    <th className="pb-3 pr-3">حالة النشر</th>
                    <th className="pb-3 pr-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {videos.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-4 pr-3 font-bold text-white text-xs sm:text-sm font-['Tajawal']">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300 flex items-center justify-center shrink-0">
                            <Play className="w-4 h-4 fill-blue-300/40" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="leading-snug">{v.title}</span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black">
                                {v.partCustomTitle || (v.partNumber ? `الجزء ${v.partNumber}` : 'الجزء 1')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-3">
                        <span className="px-3 py-1 rounded-xl bg-blue-950/70 border border-blue-500/40 text-blue-300 font-bold text-[11px] inline-block">
                          {v.targetSlotName}
                        </span>
                      </td>
                      <td className="py-4 pr-3">
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <Globe className="w-3 h-3" />
                          <span>رابط خارجي</span>
                        </span>
                      </td>
                      <td className="py-4 pr-3 font-bold text-slate-300 text-xs">
                        {v.duration || '05:00'}
                      </td>
                      <td className="py-4 pr-3">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400 text-emerald-300 text-[11px] font-black flex items-center gap-1.5 w-fit">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>منشور ونشط</span>
                        </span>
                      </td>
                      <td className="py-4 pr-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewVideo(v);
                              setPreviewSlotId(v.targetSlotId);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-950/80 border border-blue-500/50 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>تشغيل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(v)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(v)}
                            className="p-1.5 rounded-xl bg-red-950/60 border border-red-500/40 hover:bg-red-800 text-red-300 hover:text-white cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-2xl rounded-3xl bg-[#0c0f20] border-2 border-blue-500/70 p-6 sm:p-8 text-right shadow-2xl overflow-y-auto max-h-[92vh]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/60 text-blue-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white font-['Tajawal']">
                      إضافة فيديو برابط خارجي
                    </h3>
                    <p className="text-xs text-slate-400">
                      ضع رابط الفيديو من يوتيوب أو جوجل درايف وسيتم نشره فوراً.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3.5 mb-4 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handlePublishVideo} className="space-y-5 text-right">
                <div className="p-4 rounded-2xl bg-blue-900/20 border border-blue-500/30 text-blue-200 text-xs leading-relaxed">
                  ⚠️ <strong>سياسة الرفع الصارمة:</strong> يمنع نهائياً رفع ملفات الفيديو مباشرة للمنصة. يرجى استخدام روابط <strong>Google Drive</strong> أو <strong>YouTube</strong>.
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-200">رابط الفيديو الخارجي:</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={videoUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="أدخل رابط Google Drive أو YouTube..."
                      className="w-full h-12 pr-11 pl-4 rounded-xl bg-[#070914] text-white text-xs sm:text-sm border-2 border-blue-500 focus:border-cyan-400 focus:outline-none shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-blue-400 pointer-events-none">
                      <Globe className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-300">موضع ظهور الفيديو:</label>
                  <select
                    value={targetSlotId}
                    onChange={(e) => {
                      setTargetSlotId(e.target.value);
                      const slotVids = getSlotVideos(e.target.value);
                      setPartNumber(Math.min(5, slotVids.length + 1));
                    }}
                    className="w-full h-12 px-3 rounded-xl bg-[#070914] text-white text-xs sm:text-sm border-2 border-[#ffd700]/70 focus:border-[#ffd700] focus:outline-none cursor-pointer"
                  >
                    {VIDEO_SLOTS.map((s) => (
                      <option key={s.slotId} value={s.slotId}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">ترتيب الجزء (1-5):</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPartNumber(num)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          partNumber === num ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        الجزء {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">عنوان الفيديو:</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: فيديو شرح تثبيت البرنامج"
                    className="w-full h-12 px-4 rounded-xl bg-[#070914] text-white text-sm font-bold border-2 border-slate-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="flex-1 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-sm shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {isPublishing ? 'جاري النشر...' : 'نشر الفيديو الآن 🚀'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {previewVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-4xl rounded-3xl bg-[#090b1c] border-2 border-blue-500/70 p-5 sm:p-7 text-right shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <span className="text-xs text-amber-300 font-bold">
                    {previewVideo.targetSlotName}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] mt-0.5">
                    معاينة الفيديو
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewVideo(null);
                    setPreviewSlotId(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <MultiPartVideoPlayer
                videos={previewSlotId ? getSlotVideos(previewSlotId) : [previewVideo]}
                title={previewVideo.targetSlotName}
              />

              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewVideo(null);
                    setPreviewSlotId(null);
                  }}
                  className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {editingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-lg rounded-3xl bg-[#0c0f20] border-2 border-amber-500/80 p-6 sm:p-7 text-right shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/60 text-amber-400 flex items-center justify-center shadow-sm">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
                      تعديل بيانات الفيديو
                    </h3>
                    <p className="text-xs text-slate-400">
                      {editingVideo.targetSlotName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {editFormError && (
                <div className="p-3 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{editFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-200 font-['Tajawal']">
                    عنوان الفيديو:
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#070914] text-white text-sm font-black border-2 border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    رابط الفيديو (URL):
                  </label>
                  <input
                    type="text"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#070914] text-white text-xs border-2 border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingVideo(null)}
                    className="px-5 py-3 rounded-xl bg-slate-900 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="flex-1 px-8 py-3.5 rounded-2xl bg-amber-600 text-slate-950 font-black text-sm shadow-lg cursor-pointer"
                  >
                    {isSavingEdit ? 'جاري الحفظ...' : 'حفظ التعديلات ✅'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deletingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-[#0c0f20] border-2 border-red-500/70 p-6 text-center shadow-2xl space-y-5">
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white font-['Tajawal']">هل أنت متأكد من الحذف؟</h3>
                <p className="text-xs text-slate-400">سيتم حذف الفيديو "{deletingVideo.title}" نهائياً من المنصة.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingVideo(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  تراجع
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-xs cursor-pointer"
                >
                  تأكيد الحذف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
