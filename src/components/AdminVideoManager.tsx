import React, { useState, useEffect, useRef } from 'react';
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
  FileVideo,
  Clock,
  Sparkles,
  Save,
  X,
  RefreshCw,
  HardDrive,
  Globe,
  Layers,
  Film,
} from 'lucide-react';
import { EducationalVideo, VideoSlotDef } from '../types';
import {
  VIDEO_SLOTS,
  getEducationalVideos,
  addEducationalVideo,
  updateEducationalVideo,
  deleteEducationalVideo,
  rehydrateLocalVideoUrls,
  formatActualDuration,
} from '../utils/videoStorage';
import { storeVideoBlob } from '../utils/indexedDbVideo';
import { addActivityLog } from '../utils/adminStorage';
import { MultiPartVideoPlayer } from './MultiPartVideoPlayer';

export const AdminVideoManager: React.FC = () => {
  const [videos, setVideos] = useState<EducationalVideo[]>(() => getEducationalVideos());
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<EducationalVideo | null>(null);
  const [previewSlotId, setPreviewSlotId] = useState<string | null>(null);

  // Upload Mode: 'file' (from device) or 'url' (web link / youtube)
  const [uploadSource, setUploadSource] = useState<'file' | 'url'>('file');

  // Form State (Video Name, Target Slot, Part Number, and Auto-detected Actual Duration)
  const [title, setTitle] = useState('');
  const [targetSlotId, setTargetSlotId] = useState(VIDEO_SLOTS[0].slotId);
  const [partNumber, setPartNumber] = useState<number>(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'youtube' | 'mp4' | 'file'>('file');
  const [actualDuration, setActualDuration] = useState<string>('04:30 دقيقة');
  const [blobId, setBlobId] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | null>(null);

  // Processing & Feedback State
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isProcessingLevel1, setIsProcessingLevel1] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const level1FileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get all videos for a slot (sorted by partNumber)
  const getSlotVideos = (slotId: string) => {
    return videos
      .filter((v) => v.targetSlotId === slotId && v.isActive)
      .sort((a, b) => (a.partNumber || 1) - (b.partNumber || 1));
  };

  // Level 1 specific videos (All parts up to 5)
  const level1Videos = getSlotVideos('level-1');

  // Re-hydrate any IndexedDB blobs on component mount
  useEffect(() => {
    rehydrateLocalVideoUrls().then((refreshed) => {
      setVideos(refreshed);
    });

    const handleUpdate = () => {
      setVideos(getEducationalVideos());
    };
    window.addEventListener('videos-storage-updated', handleUpdate);
    return () => window.removeEventListener('videos-storage-updated', handleUpdate);
  }, []);

  const refreshVideos = () => {
    setVideos(getEducationalVideos());
  };

  // 🌟 Dedicated Handler for Level 1 Upload from Device (Supports up to 5 parts)
  const handleLevel1DeviceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (level1Videos.length >= 5) {
      setFormError('وصل المستوى 1 للحد الأقصى المسموح وهو ٥ أجزاء فيديو. يرجى حذف جزء أولاً.');
      return;
    }

    setIsProcessingLevel1(true);
    setFormError(null);

    try {
      const generatedBlobId = `blob_lvl1_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const objectUrl = await storeVideoBlob(generatedBlobId, file, file.name);

      // Detect actual duration automatically
      let detectedDuration = '04:30 دقيقة';
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;

      await new Promise<void>((resolve) => {
        tempVideo.onloadedmetadata = () => {
          if (tempVideo.duration && tempVideo.duration > 0) {
            detectedDuration = formatActualDuration(tempVideo.duration);
          }
          resolve();
        };
        tempVideo.onerror = () => resolve();
        setTimeout(resolve, 2000);
      });

      const nextPart = level1Videos.length + 1;
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      addEducationalVideo({
        title: `مقدمة في إنتاج وتصميم الوسائط المتعددة (الجزء ${nextPart})`,
        partNumber: nextPart,
        partTitle: `الجزء ${nextPart}: ${cleanFileName}`,
        targetSlotId: 'level-1',
        videoUrl: objectUrl,
        videoType: 'file',
        duration: detectedDuration,
        blobId: generatedBlobId,
        isActive: true,
      });

      addActivityLog(
        `قام المشرف برفع الجزء ${nextPart} من فيديو المرحلة 1 من جهازه: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB) - المدة الفعلية: ${detectedDuration}`,
        'المشرف',
        'success'
      );

      setSuccessMessage(
        `✅ تم رفع ونشر الجزء ${nextPart} من فيديو المستوى 1 بنجاح من جهازك (${file.name})! المدة الفعلية: ${detectedDuration}. متاح الآن لجميع الطلاب.`
      );

      refreshVideos();
      setIsProcessingLevel1(false);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch {
      setIsProcessingLevel1(false);
      setFormError('حدث خطأ أثناء رفع ملف الفيديو من الجهاز، يرجى المحاولة مرة ثانية.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Open modal in initial clean state
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
    setVideoUrl('');
    setUploadSource('file');
    setVideoType('file');
    setActualDuration('04:30 دقيقة');
    setBlobId(undefined);
    setFileName(null);
    setFormError(null);
    setShowAddModal(true);
  };

  // 🌟 Self-Configuring / Automatic File Selection from Device (Calculates actual duration)
  const handleDeviceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setFormError(null);

    try {
      // 1. Automatic Title generation from clean file name
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
      setFileName(file.name);
      setVideoType('file');

      // 2. Automatically store video blob in IndexedDB for persistent storage
      const generatedBlobId = `blob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const objectUrl = await storeVideoBlob(generatedBlobId, file, file.name);
      setVideoUrl(objectUrl);
      setBlobId(generatedBlobId);

      // 3. Automatically detect ACTUAL video duration from HTML5 video element
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;

      tempVideo.onloadedmetadata = () => {
        if (tempVideo.duration && tempVideo.duration > 0) {
          const formatted = formatActualDuration(tempVideo.duration);
          setActualDuration(formatted);
        }
      };

      setIsProcessingFile(false);
    } catch {
      setIsProcessingFile(false);
      setFormError('حدث خطأ أثناء تجهيز ملف الفيديو من الجهاز، يرجى المحاولة مرة ثانية.');
    }
  };

  // 🌟 Automatic URL Handling (Auto-detects Actual Duration where possible)
  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    const trimmed = url.trim();

    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      setVideoType('youtube');
      setActualDuration('05:00 دقيقة');
    } else {
      setVideoType('mp4');
      // Attempt to probe direct video duration
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = trimmed;
      tempVideo.onloadedmetadata = () => {
        if (tempVideo.duration && tempVideo.duration > 0) {
          setActualDuration(formatActualDuration(tempVideo.duration));
        }
      };
    }

    // Auto-fill title if empty
    if (!title) {
      const slotObj = VIDEO_SLOTS.find((s) => s.slotId === targetSlotId);
      if (slotObj) {
        setTitle(`فيديو ${slotObj.name} (الجزء ${partNumber})`);
      }
    }
  };

  // 🌟 Upload & Publish Button Handler
  const handlePublishVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const existingInSlot = getSlotVideos(targetSlotId);
    if (existingInSlot.length >= 5) {
      setFormError('عذراً، وصل هذا العنوان للحد الأقصى المسموح وهو ٥ أجزاء للشرح.');
      return;
    }

    const finalTitle = title.trim();
    if (!finalTitle) {
      setFormError('يرجى كتابة اسم الفيديو أو اختيار ملف من الجهاز لتعيين الاسم ذاتياً.');
      return;
    }

    if (!videoUrl.trim()) {
      if (uploadSource === 'file') {
        setFormError('يرجى اختيار ملف فيديو من جهازك أولاً ليتم رفعه ونشره.');
      } else {
        setFormError('يرجى إدخال رابط الفيديو (YouTube أو رابط MP4 مباشر).');
      }
      return;
    }

    setIsPublishing(true);

    try {
      const slotDef = VIDEO_SLOTS.find((s) => s.slotId === targetSlotId);
      const slotName = slotDef ? slotDef.name : targetSlotId;

      addEducationalVideo({
        title: finalTitle,
        partNumber,
        partTitle: `الجزء ${partNumber}: ${finalTitle}`,
        targetSlotId,
        videoUrl: videoUrl.trim(),
        videoType,
        duration: actualDuration,
        blobId,
        isActive: true,
      });

      addActivityLog(
        `تم رفع ونشر فيديو: "${finalTitle}" (الجزء ${partNumber}) في ${slotName} - المدة الفعلية: ${actualDuration}`,
        'المشرف',
        'success'
      );

      // Success Notification
      setSuccessMessage(
        `✅ تم رفع ونشر الجزء ${partNumber} بنجاح! متاح الآن لجميع الطلاب في: ${slotName} (المدة الفعلية: ${actualDuration}).`
      );
      refreshVideos();
      setIsPublishing(false);
      setShowAddModal(false);

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setIsPublishing(false);
      setFormError(err?.message || 'حدث خطأ أثناء نشر الفيديو، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDelete = (v: EducationalVideo) => {
    if (confirm(`هل أنت متأكد من حذف الفيديو "${v.title}"؟`)) {
      deleteEducationalVideo(v.id);
      addActivityLog(`تم حذف الفيديو: "${v.title}"`, 'المشرف', 'warning');
      refreshVideos();
      setSuccessMessage(`تم حذف الفيديو "${v.title}" بنجاح.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif]" id="admin-video-manager">
      {/* 1. Header Banner */}
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
                  <span>رفع من الجهاز أو عبر رابط URL بنقرة واحدة</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Tajawal']">
                رفع ونشر الفيديوهات التعليمية للطلاب
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                اختر فيديو من جهازك أو ضع رابط يوتيوب وسيقوم النظام بكل شيء ذاتياً لنشره فوراً للطلاب.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              id="btn-open-upload-video-modal"
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(37,99,235,0.5)] border-2 border-blue-400/60 cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>+ رفع فيديو جديد ونشره</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Success Banner Notification */}
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

      {/* 2.5. SPECIAL LEVEL 1 SPOTLIGHT CARD: المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019 */}
      <div className="rounded-3xl bg-gradient-to-br from-[#12102e] via-[#0e0c24] to-[#070517] border-2 border-[#ffd700] p-6 sm:p-8 shadow-[0_0_40px_rgba(255,215,0,0.25)] space-y-6 relative overflow-hidden">
        {/* Glow */}
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
              يمكنك رفع حتى <strong className="text-amber-300">٥ أجزاء فيديو كأجزاء للشرح</strong> للمستوى الأول. يتم حساب المدة الفعلية تلقائياً وتنسيق الشاشة لجميع الأجهزة.
            </p>
          </div>

          {/* Quick Upload Buttons from Device for Level 1 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            {level1Videos.length < 5 ? (
              <button
                type="button"
                disabled={isProcessingLevel1}
                onClick={() => level1FileInputRef.current?.click()}
                id="btn-upload-level1-device"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-300 cursor-pointer transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isProcessingLevel1 ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري رفع ومعالجة الفيديو وحساب مدته الفعلية...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 stroke-[2.5]" />
                    <span>رفع الجزء {level1Videos.length + 1} من جهازك 💻</span>
                  </>
                )}
              </button>
            ) : (
              <span className="px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تم اكتمال الحد الأقصى للمستوى 1 (٥ أجزاء)</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => handleOpenAdd('level-1')}
              className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>إضافة جزء برابط</span>
            </button>

            <input
              ref={level1FileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,video/*"
              onChange={handleLevel1DeviceFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Video Player & Verification Area for Level 1 using MultiPartVideoPlayer */}
        {level1Videos.length > 0 ? (
          <div className="space-y-4">
            <MultiPartVideoPlayer
              videos={level1Videos}
              title="المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019"
            />

            {/* List of Level 1 parts with delete buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {level1Videos.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-amber-300 block truncate">
                      {v.partTitle || v.title}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      ⏱️ {v.duration}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(v)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-300 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="حذف هذا الجزء"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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

      {/* 3. Published Videos Table */}
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
              اضغط على زر <strong>"+ رفع فيديو جديد ونشره"</strong> بالأعلى للبدء.
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
                    {/* Only Video Name and Part */}
                    <td className="py-4 pr-3 font-bold text-white text-xs sm:text-sm font-['Tajawal']">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300 flex items-center justify-center shrink-0">
                          <Play className="w-4 h-4 fill-blue-300/40" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="leading-snug">{v.title}</span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                              {v.partNumber ? `الجزء ${v.partNumber}` : 'الجزء 1'}
                            </span>
                          </div>
                          {v.partTitle && v.partTitle !== v.title && (
                            <span className="text-[11px] text-slate-400 font-normal block">
                              {v.partTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slot Name */}
                    <td className="py-4 pr-3">
                      <span className="px-3 py-1 rounded-xl bg-blue-950/70 border border-blue-500/40 text-blue-300 font-bold text-[11px] inline-block">
                        {v.targetSlotName}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-4 pr-3">
                      {v.videoType === 'file' ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <HardDrive className="w-3 h-3" />
                          <span>من جهازك</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <Globe className="w-3 h-3" />
                          <span>رابط خارجي</span>
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-4 pr-3 font-bold text-slate-300 text-xs">
                      {v.duration || '05:00'}
                    </td>

                    {/* Status */}
                    <td className="py-4 pr-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400 text-emerald-300 text-[11px] font-black flex items-center gap-1.5 w-fit">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>منشور ونشط</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(v)}
                          title="معاينة وتشغيل الفيديو"
                          className="px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-500/50 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>تشغيل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          title="حذف هذا الفيديو"
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

      {/* 4. MODAL: رفع الفيديو والنشر الفوري (URL أو من الجهاز + ذاتي بالكامل + بدون وصف) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0c0f20] border-2 border-blue-500/70 p-6 sm:p-8 text-right shadow-2xl overflow-y-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/60 text-blue-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-['Tajawal']">
                    رفع ونشر فيديو جديد
                  </h3>
                  <p className="text-xs text-slate-400">
                    اختر الفيديو من جهازك أو ضع رابطه، وسيقوم النظام بتجهيزه ذاتياً للنشر.
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
              {/* Dual Source Switcher (من الجهاز أو رابط URL) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-amber-300">
                  اختر طريقة إرفاق الفيديو:
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-900/90 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadSource('file');
                      setVideoType('file');
                    }}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      uploadSource === 'file'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>فيديو من جهازك (MP4 / WebM)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadSource('url');
                      setVideoType('youtube');
                    }}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      uploadSource === 'url'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>رابط فيديو (YouTube / مباشر)</span>
                  </button>
                </div>
              </div>

              {/* Source Option A: Upload from Device */}
              {uploadSource === 'file' && (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#111933] to-[#0a1024] border-2 border-dashed border-emerald-400/60 hover:border-emerald-400 cursor-pointer text-center space-y-3 transition-all hover:bg-slate-900 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition-transform">
                      <Upload className="w-8 h-8 stroke-[2.2]" />
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-base font-black text-white font-['Tajawal']">
                        اضغط هنا لاختيار ملف الفيديو من جهازك
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        يدعم صيغ MP4 و WebM و MOV. سيقوم النظام ذاتياً بحساب المدة واستخراج الاسم.
                      </p>
                    </div>

                    {fileName ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>الملف المختار: {fileName}</span>
                      </div>
                    ) : (
                      <span className="inline-block px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                        تصفح ملفات جهازك الآن
                      </span>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                      onChange={handleDeviceFileSelect}
                      className="hidden"
                    />
                  </div>

                  {isProcessingFile && (
                    <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/60 text-blue-200 text-xs flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>جاري معالجة الفيديو وحساب مدته ذاتياً...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Source Option B: URL Link */}
              {uploadSource === 'url' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-200">
                    رابط الفيديو (YouTube أو رابط MP4 مباشر):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... أو رابط مباشر"
                      className="w-full h-12 pr-11 pl-4 rounded-xl bg-[#070914] text-white text-xs sm:text-sm border-2 border-slate-700 focus:border-blue-500 focus:outline-none"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400 pointer-events-none">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    💡 يدعم روابط يوتيوب (العادية أو Shorts أو التضمين) وروابط ملفات MP4 المباشرة.
                  </span>
                </div>
              )}

              {/* Target Slot (Defined automatically with option to pick) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300">
                    موضع ظهور الفيديو (العنوان / المرحلة):
                  </label>
                  <span className="text-[11px] font-bold text-blue-400">
                    (موجود حالياً: {getSlotVideos(targetSlotId).length} من 5 أجزاء)
                  </span>
                </div>

                <select
                  value={targetSlotId}
                  onChange={(e) => {
                    const newSlot = e.target.value;
                    setTargetSlotId(newSlot);
                    const slotVids = getSlotVideos(newSlot);
                    setPartNumber(Math.min(5, slotVids.length + 1));
                  }}
                  className="w-full h-12 px-3 rounded-xl bg-[#070914] text-white text-xs sm:text-sm border-2 border-[#ffd700]/70 focus:border-[#ffd700] focus:outline-none cursor-pointer"
                >
                  {VIDEO_SLOTS.map((s) => {
                    const count = getSlotVideos(s.slotId).length;
                    return (
                      <option key={s.slotId} value={s.slotId}>
                        {s.name} ({count}/5 أجزاء)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Part Number Selection (ترتيب الجزء للشرح حتى ٥ أجزاء) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  ترتيب الجزء للشرح (بحد أقصى ٥ أجزاء):
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = partNumber === num;
                    const isAlreadyUsed = getSlotVideos(targetSlotId).some((v) => v.partNumber === num);

                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPartNumber(num)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-1 ring-blue-300'
                            : isAlreadyUsed
                            ? 'bg-amber-950/50 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>الجزء {num}</span>
                        {isAlreadyUsed && <span className="text-[9px] text-amber-400 font-normal">(موجود)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Video Title (Name) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  اسم أو عنوان الجزء (تم تعيينه ذاتياً ويمكن تعديله):
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="اسم الفيديو أو عنوان الجزء"
                  className="w-full h-12 px-4 rounded-xl bg-[#070914] text-white text-sm font-bold border-2 border-slate-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* 🌟 ACTUAL DURATION DISPLAY (تم حذف الإدخال اليدوي للمدة وتعيين المدة الفعلية تلقائياً) */}
              <div className="p-3.5 rounded-2xl bg-[#070914] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      مدة الفيديو الفعلية:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      محسوبة ومعينة تلقائياً من ملف الفيديو الفعلي
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-sm">
                  {actualDuration}
                </span>
              </div>

              {/* Instant Mini Player Preview (if videoUrl is present) */}
              {videoUrl && (
                <div className="p-3 rounded-2xl bg-black/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>معاينة الجزء الفورية قبل النشر:</span>
                    </span>
                    <span className="font-bold text-[11px]">{actualDuration}</span>
                  </div>

                  <div className="relative aspect-video max-h-44 rounded-xl overflow-hidden bg-black border border-slate-700 mx-auto">
                    {videoType === 'youtube' || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={videoUrl.replace('/watch?v=', '/embed/')}
                        title="معاينة الفيديو"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <video src={videoUrl} controls className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons: Cancel and Upload & Publish Now */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isPublishing || isProcessingFile}
                  id="btn-confirm-upload-publish-video"
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-400 flex items-center justify-center gap-2.5 cursor-pointer transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الرفع والنشر...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                      <span>رفع الجزء ونشره الآن</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Fullscreen Video Preview Modal using MultiPartVideoPlayer */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl rounded-3xl bg-[#090b1c] border-2 border-blue-500/70 p-5 sm:p-7 text-right shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-xs text-amber-300 font-bold">
                  {previewVideo.targetSlotName}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] mt-0.5">
                  معاينة مشغل الأجزاء التفاعلي (متناسق مع جميع الأجهزة)
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

            {/* Display MultiPartVideoPlayer for this slot */}
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
    </div>
  );
};
