import React, { useState, useEffect, useRef } from 'react';
import {
  HardDrive,
  Upload,
  Copy,
  Check,
  Trash2,
  Video,
  Image as ImageIcon,
  FileText,
  Search,
  Link,
  Plus,
  X,
  FileCheck,
  AlertCircle,
  Play,
  Maximize2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  StoredAsset,
  getStoredAssets,
  hydrateAssetUrls,
  addStoredAsset,
  addUrlAsset,
  deleteStoredAsset,
} from '../utils/mediaStorage';
import { subscribeToGlobalData } from '../utils/realtimeService';
import { normalizeVideoUrl } from '../utils/videoStorage';

export const AdminMediaStorageManager: React.FC = () => {
  const [assets, setAssets] = useState<StoredAsset[]>(() => getStoredAssets());
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New URL Asset Modal state
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlTitleInput, setUrlTitleInput] = useState('');
  const [urlTypeInput, setUrlTypeInput] = useState<'video' | 'image' | 'document'>('video');

  // Preview Modal
  const [previewAsset, setPreviewAsset] = useState<StoredAsset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to updates from other tabs or remote RTDB
  useEffect(() => {
    // Hydrate blob URLs from IndexedDB on load
    hydrateAssetUrls().then((hydrated) => {
      if (hydrated && hydrated.length > 0) setAssets(hydrated);
    });

    const handleLocalUpdate = () => {
      setAssets(getStoredAssets());
    };
    window.addEventListener('cp-media-storage-updated', handleLocalUpdate);

    // Sync remote storageAssets if available in Firebase RTDB
    const unsubscribeRemote = subscribeToGlobalData('storageAssets' as any, (remoteList) => {
      if (Array.isArray(remoteList) && remoteList.length > 0) {
        setAssets((prev) => {
          const map = new Map<string, StoredAsset>();
          prev.forEach((a) => map.set(a.id, a));
          remoteList.forEach((ra: any) => {
            if (ra && ra.id) {
              const existing = map.get(ra.id);
              map.set(ra.id, {
                ...ra,
                url: existing?.url || ra.url || '',
              });
            }
          });
          return Array.from(map.values());
        });
      }
    });

    return () => {
      window.removeEventListener('cp-media-storage-updated', handleLocalUpdate);
      unsubscribeRemote();
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await addStoredAsset(file, file.name, (pct) => {
          setUploadProgress(pct);
        });
      }
      setAssets(getStoredAssets());
    } catch (err: any) {
      setUploadError(err?.message || 'حدث خطأ أثناء رفع الملف وإضافته للتخزين');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  const handleAddUrlAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !urlTitleInput.trim()) return;

    const normalized = urlTypeInput === 'video' ? normalizeVideoUrl(urlInput.trim()) : urlInput.trim();
    addUrlAsset(normalized, urlTitleInput.trim(), urlTypeInput);
    setAssets(getStoredAssets());
    setShowUrlModal(false);
    setUrlInput('');
    setUrlTitleInput('');
    setCopyNotice('✅ تم إضافة الرابط بنجاح وجاهز للاستخدام الفوري لجميع الطلاب!');
    setTimeout(() => setCopyNotice(null), 4000);
  };

  const handleCopyLink = (asset: StoredAsset) => {
    const linkToCopy = asset.url;
    if (!linkToCopy) return;

    navigator.clipboard.writeText(linkToCopy).then(() => {
      setCopiedId(asset.id);
      if (linkToCopy.startsWith('blob:')) {
        setCopyNotice('⚠️ تم نسخ الرابط المحلي (Blob). لكي يشاهد الطلاب هذا الفيديو من أجهزتهم، يفضل استخدام رابط خارجي سحابي (مثل يوتيوب أو Google Drive).');
      } else {
        setCopyNotice('✅ تم نسخ الرابط السحابي بنجاح! يعمل لدى جميع الطلاب في نفس الوقت.');
      }
      setTimeout(() => {
        setCopiedId(null);
        setCopyNotice(null);
      }, 5000);
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت تأكد من إزالة هذا الملف من مركز التخزين؟')) {
      deleteStoredAsset(id);
      setAssets(getStoredAssets());
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return 'رابط خارجي';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filtering
  const filteredAssets = assets.filter((asset) => {
    const matchesFilter = filterType === 'all' || asset.type === filterType;
    const matchesSearch =
      !searchQuery.trim() ||
      asset.customTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-['Cairo',_sans-serif] text-right" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 border-2 border-sky-400/40 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border-2 border-sky-400/50 flex items-center justify-center text-sky-300 shadow-lg shrink-0">
              <HardDrive className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 border border-sky-400/30 text-sky-200 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>مركز رفع الوسائط وإنشاء الروابط المباشرة 🔗</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-white tracking-tight">
                مكان التخزين واستخراج روابط الفيديوهات والصور
              </h2>
              <p className="text-xs sm:text-sm text-sky-200/80 mt-1">
                قم برفع الفيديوهات والصور والمستندات للحصول على رابط مباشر دائم يمكن استخدامه داخل بنك الأسئلة والمستويات فوراً!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer border border-emerald-400/30 hover:scale-105 active:scale-95"
            >
              <Upload className="w-5 h-5" />
              <span>رفع فيديو / صورة من الجهاز 📁</span>
            </button>

            <button
              onClick={() => setShowUrlModal(true)}
              className="px-4 py-3 rounded-2xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-100 font-bold text-sm transition-all flex items-center gap-2 border border-sky-400/40 cursor-pointer"
            >
              <Link className="w-4 h-4 text-sky-300" />
              <span>إضافة رابط خارجي</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*,image/*,.mp4,.webm,.mov,.mkv,.avi,.wmv,.flv,.3gp,.pdf,.png,.jpg,.jpeg,.webp,.svg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-6 p-4 rounded-2xl bg-sky-950/80 border border-sky-400/50 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs font-bold text-sky-200">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-400 animate-bounce" />
                جاري معالجة الملف وإنشاء الرابط المباشر...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-sky-500/30">
              <div
                className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Notice */}
        {uploadError && (
          <div className="mt-4 p-3 rounded-xl bg-red-900/60 border border-red-500/50 text-red-200 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              {uploadError}
            </span>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {copyNotice && (
        <div className={`p-4 rounded-2xl border-2 text-xs font-black flex items-center gap-2 shadow-xl animate-fadeIn ${
          copyNotice.startsWith('⚠️') ? 'bg-amber-950/90 border-amber-500 text-amber-200' : 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
        }`}>
          <span>{copyNotice}</span>
        </div>
      )}

      {/* Usage Quick Guide Banner */}
      <div className="bg-sky-950/50 border border-sky-800/60 rounded-2xl p-4 text-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sky-200 block text-sm">كيف تستخدم الروابط المستخرجة؟</span>
            <span className="text-sky-300/80">
              اضغط على زر <strong className="text-emerald-300">"نسخ الرابط المباشر 🔗"</strong> بجانب أي فيديو أو صورة، ثم قم بدمجه أو لصقه في خيارات الأسئلة أو شروحات المستويات.
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            الكل ({assets.length})
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'video'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-purple-300" />
            فيديوهات ({assets.filter((a) => a.type === 'video').length})
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'image'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />
            صور ({assets.filter((a) => a.type === 'image').length})
          </button>
          <button
            onClick={() => setFilterType('document')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'document'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            مستندات ({assets.filter((a) => a.type === 'document').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث برقم أو اسم الملف..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">لا توجد ملفات مخزنة حالياً</h3>
            <p className="text-xs text-slate-400 mt-1">
              اضغط على زر "رفع فيديو / صورة من الجهاز" أعلاه لإضافة أول ملف واستخراج رابط مباشر له.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>رفع ملف جديد الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => {
            const isCopied = copiedId === asset.id;
            const isVideo = asset.type === 'video';
            const isDoc = asset.type === 'document';

            return (
              <div
                key={asset.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between group"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-video bg-black/60 flex items-center justify-center overflow-hidden border-b border-slate-800">
                  {isVideo ? (
                    asset.url ? (
                      <video
                        src={asset.url}
                        controls
                        preload="metadata"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-purple-400">
                        <Video className="w-10 h-10" />
                        <span className="text-xs">فيديو مسجل</span>
                      </div>
                    )
                  ) : isDoc ? (
                    <div className="flex flex-col items-center gap-2 text-amber-400 p-4 text-center">
                      <FileText className="w-12 h-12" />
                      <span className="text-xs font-bold text-slate-200">{asset.name}</span>
                    </div>
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.customTitle || asset.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/400x225/0f172a/38bdf8?text=صورة+معاينة';
                      }}
                    />
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-bold text-slate-200 flex items-center gap-1">
                    {isVideo && <Video className="w-3 h-3 text-purple-400" />}
                    {asset.type === 'image' && <ImageIcon className="w-3 h-3 text-emerald-400" />}
                    {isDoc && <FileText className="w-3 h-3 text-amber-400" />}
                    <span>{isVideo ? 'فيديو' : isDoc ? 'PDF' : 'صورة'}</span>
                  </div>

                  {/* Fullscreen Expand Button */}
                  {asset.url && (
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700/60 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      title="معاينة الشاشة الكاملة"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 truncate" title={asset.customTitle || asset.name}>
                      {asset.customTitle || asset.name}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>الحجم: {formatFileSize(asset.sizeBytes)}</span>
                      <span>•</span>
                      <span>تاريخ الرفع: {asset.createdAt}</span>
                    </div>
                  </div>

                  {/* Reusable Link Field & One-Click Copy */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="text-[10px] font-bold text-sky-400 block">الرابط المباشر للملف (جاهز للاستخدام):</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={asset.url || 'جاري تحميل الرابط...'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-sky-300 select-all focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyLink(asset)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ الرابط</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      className="text-slate-400 hover:text-sky-300 flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>معاينة مكبرة</span>
                    </button>

                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: External Link Asset */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-5 text-right font-['Cairo',_sans-serif]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <Link className="w-5 h-5 text-sky-400" />
                <span>إضافة رابط وسائط خارجي</span>
              </h3>
              <button
                onClick={() => setShowUrlModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUrlAssetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الملف / الفيديو:</label>
                <input
                  type="text"
                  required
                  value={urlTitleInput}
                  onChange={(e) => setUrlTitleInput(e.target.value)}
                  placeholder="مثال: فيديو شريحة 1 - Captivate"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نوع الوسائط:</label>
                <select
                  value={urlTypeInput}
                  onChange={(e) => setUrlTypeInput(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="video">فيديو 🎥</option>
                  <option value="image">صورة 🖼️</option>
                  <option value="document">مستند / PDF 📄</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الرابط المباشر (URL):</label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://domain.com/video.mp4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  حفظ وحفظ الرابط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fullscreen Preview */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">{previewAsset.customTitle || previewAsset.name}</h3>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              {previewAsset.type === 'video' ? (
                <video src={previewAsset.url} controls autoPlay className="max-h-[55vh] w-auto object-contain" />
              ) : (
                <img src={previewAsset.url} alt={previewAsset.name} className="max-h-[55vh] w-auto object-contain" />
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => handleCopyLink(previewAsset)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>نسخ الرابط المباشر</span>
              </button>
              <button
                onClick={() => setPreviewAsset(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
