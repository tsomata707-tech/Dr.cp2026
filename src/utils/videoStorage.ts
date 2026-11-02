import { useState, useEffect } from 'react';
import { EducationalVideo, VideoSlotDef } from '../types';
import { storeVideoBlob, getVideoBlobUrl, deleteVideoBlob } from './indexedDbVideo';
import { syncGlobalQuestionsAndLevels } from './realtimeService';

export const VIDEO_SLOTS: VideoSlotDef[] = [
  {
    slotId: 'level-1',
    name: 'المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019',
    levelNumber: 1,
    description: 'فيديو المرحلة: مقدمة في إنتاج وتصميم الوسائط المتعددة - يظهر في بيئة التعلم واللعبة والمحتوى.',
    recommendedDuration: '04:30',
  },
  {
    slotId: 'level-2',
    name: 'المرحلة 2: التعرف على واجهة Adobe Captivate 2019',
    levelNumber: 2,
    description: 'يظهر في شاشة المحتوى للمرحلة الثانية لشرح لوحات العمل والأدوات وقوائم البرنامج.',
    recommendedDuration: '06:15',
  },
  {
    slotId: 'level-3',
    name: 'المرحلة 3: إدارة وتصميم الشرائح والمشاهد التفاعلية',
    levelNumber: 3,
    description: 'يظهر في المرحلة الثالثة لشرح خصائص الشريحة والماستر سلايد والتنقل بين المشاهد.',
    recommendedDuration: '05:45',
  },
  {
    slotId: 'level-4',
    name: 'المرحلة 4: التعامل مع النصوص والأشكال والأزرار الذكية',
    levelNumber: 4,
    description: 'يظهر في المرحلة الرابعة لشرح إدراج النصوص وتنسيق الخطوط والأشكال الذكية Smart Shapes.',
    recommendedDuration: '06:00',
  },
  {
    slotId: 'level-5',
    name: 'المرحلة 5: إدراج وتنسيق الأصوات والصور الرقمية',
    levelNumber: 5,
    description: 'يظهر في المرحلة الخامسة لشرح مكتبة الوسائط وتسجيل الصوت وتحرير الصور في Captivate.',
    recommendedDuration: '05:20',
  },
  {
    slotId: 'level-6',
    name: 'المرحلة 6: التفاعلية المتقدمة وبرمجة الإجراءات (Actions)',
    levelNumber: 6,
    description: 'يظهر في المرحلة السادسة لشرح المشغلات التفاعلية والأزرار البرمجية والمتغيرات.',
    recommendedDuration: '07:10',
  },
  {
    slotId: 'level-7',
    name: 'المرحلة 7: الأنماط والمؤثرات البصرية وتأثيرات الحركة',
    levelNumber: 7,
    description: 'يظهر في المرحلة السابعة لشرح خط الزمن Timeline وتأثيرات الدخول والخروج والحركات.',
    recommendedDuration: '05:50',
  },
  {
    slotId: 'level-8',
    name: 'المرحلة 8: إدراج ومعالجة الفيديو التفاعلي والمحاكاة',
    levelNumber: 8,
    description: 'يظهر في المرحلة الثامنة لشرح دمج مقاطع الفيديو وإضافة نقاط التوقف والأسئلة التفاعلية التراكبية.',
    recommendedDuration: '08:00',
  },
  {
    slotId: 'level-9',
    name: 'المرحلة 9: بنوك الأسئلة والاختبارات التفاعلية والتقييم',
    levelNumber: 9,
    description: 'يظهر في المرحلة التاسعة لشرح إنشاء شرائح الأسئلة، إعداد الدرجات، وتصميم التغذية الراجعة.',
    recommendedDuration: '07:30',
  },
  {
    slotId: 'level-10',
    name: 'المرحلة 10: نشر وتصدير المشروع النهائي (HTML5 / SCORM)',
    levelNumber: 10,
    description: 'يظهر في المرحلة العاشرة لشرح معايير النشر على منصات LMS وتصدير حزم SCORM للويب.',
    recommendedDuration: '06:40',
  },
  {
    slotId: 'app-task',
    name: 'شاشة المهمة التطبيقية (Practical Application Task)',
    description: 'يظهر في شاشة المهام التطبيقية كشرح إرشادي مرئي لكيفية تنفيذ خطوات المهمة في Captivate خارج البيئة.',
    recommendedDuration: '05:00',
  },
  {
    slotId: 'general-intro',
    name: 'شاشة التمهيد العام للبيئة (Environment Guide)',
    description: 'يظهر في الصفحة التمهيدية أو شاشة الأهداف لشرح آليات اللعب ونظام النقاط والشارات.',
    recommendedDuration: '03:30',
  },
];

const VIDEOS_STORAGE_KEY = 'cp_educational_videos_v2';
const PREV_VIDEOS_STORAGE_KEY = 'cp_educational_videos_v1';

/**
 * Helper to identify and purge any dummy/placeholder videos (such as YouTube Rickroll dQw4w9WgXcQ)
 */
export function isPlaceholderVideo(video: { videoUrl?: string; id?: string; title?: string }): boolean {
  if (!video) return true;
  const url = video.videoUrl || '';
  if (url.includes('dQw4w9WgXcQ')) return true;
  if (video.id && ['vid-1', 'vid-2', 'vid-3', 'vid-8', 'vid-task'].includes(video.id) && url.includes('dQw4w9WgXcQ')) {
    return true;
  }
  return false;
}

// Initial educational videos seeding: Strictly empty so ONLY real admin-uploaded videos ever exist!
const INITIAL_VIDEOS: EducationalVideo[] = [];

/**
 * Deduplicate videos strictly by normalized URL + slot ID, and purge placeholders
 */
export function deduplicateEducationalVideos(videos: EducationalVideo[]): EducationalVideo[] {
  if (!Array.isArray(videos)) return [];
  const seenKeys = new Set<string>();
  const cleanList: EducationalVideo[] = [];

  for (const v of videos) {
    if (!v || isPlaceholderVideo(v) || !v.isActive) continue;
    const rawUrl = v.videoUrl?.trim() || v.dataUrl?.trim() || '';
    if (!rawUrl) continue;
    const normUrl = normalizeVideoUrl(rawUrl);
    if (!normUrl) continue;

    const dedupeKey = `${v.targetSlotId || 'default'}::${normUrl}`;
    if (!seenKeys.has(dedupeKey)) {
      seenKeys.add(dedupeKey);
      cleanList.push({
        ...v,
        videoUrl: normUrl,
      });
    }
  }

  // Sort by partNumber
  cleanList.sort((a, b) => (a.partNumber || 1) - (b.partNumber || 1));
  return cleanList;
}

export function getEducationalVideos(): EducationalVideo[] {
  try {
    const raw = localStorage.getItem(VIDEOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strictly purge any dummy placeholder videos and deduplicate
        const clean = deduplicateEducationalVideos(parsed);
        if (clean.length !== parsed.length) {
          localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(clean));
        }
        return clean;
      }
    }

    // Try migration from v1, also purging placeholders and deduplicating
    const prevRaw = localStorage.getItem(PREV_VIDEOS_STORAGE_KEY);
    if (prevRaw) {
      const prevParsed = JSON.parse(prevRaw);
      if (Array.isArray(prevParsed)) {
        const cleanPrev = deduplicateEducationalVideos(prevParsed);
        localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(cleanPrev));
        return cleanPrev;
      }
    }

    return INITIAL_VIDEOS;
  } catch {
    return INITIAL_VIDEOS;
  }
}

export function saveEducationalVideos(videos: EducationalVideo[], syncRemote: boolean = true): void {
  const clean = deduplicateEducationalVideos(videos);
  localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(clean));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('videos-storage-updated', { detail: clean }));
  }

  if (syncRemote) {
    try {
      // Sync authoritative deduplicated videos to Firebase RTDB for real-time student updates
      const syncPayload = clean.map((v) => ({
        ...v,
        videoUrl: v.videoUrl && !v.videoUrl.startsWith('blob:') ? v.videoUrl : (v.dataUrl || v.videoUrl || ''),
        dataUrl: v.dataUrl || (v.videoUrl?.startsWith('data:') ? v.videoUrl : undefined),
      }));
      syncGlobalQuestionsAndLevels('videos', syncPayload).catch(() => {});
    } catch {
      // Ignore background network errors
    }
  }
}

export function clearAllEducationalVideos(): void {
  localStorage.removeItem(VIDEOS_STORAGE_KEY);
  localStorage.removeItem(PREV_VIDEOS_STORAGE_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('videos-storage-updated', { detail: [] }));
  }
  syncGlobalQuestionsAndLevels('videos', []).catch(() => {});
}

/**
 * Authoritative sync of remote educational videos from Firebase RTDB.
 * CRITICAL: Replaces local state with remote state instead of merging,
 * preventing old cached ghost rows and duplicates from accumulating!
 */
export function syncRemoteEducationalVideos(remoteVideos: EducationalVideo[]): void {
  if (!Array.isArray(remoteVideos)) return;
  const clean = deduplicateEducationalVideos(remoteVideos);

  localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(clean));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('videos-storage-updated', { detail: clean }));
  }
}

export function getVideoBySlot(slotId: string): EducationalVideo | undefined {
  const all = getEducationalVideos();
  const slotVideos = all.filter((v) => v.targetSlotId === slotId && v.isActive);
  slotVideos.sort((a, b) => (a.partNumber || 1) - (b.partNumber || 1));
  return slotVideos[0];
}

export function getVideosBySlot(slotId: string): EducationalVideo[] {
  const all = getEducationalVideos();
  const slotVideos = all.filter((v) => v.targetSlotId === slotId && v.isActive);
  slotVideos.sort((a, b) => (a.partNumber || 1) - (b.partNumber || 1));
  return slotVideos;
}

/**
 * Format total seconds into a clean actual duration string
 */
export function formatActualDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00 دقيقة';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} دقيقة`;
}

/**
 * React hook to access and automatically rehydrate all videos of a slot (up to 5 parts)
 */
export function useEducationalVideos(slotId: string): EducationalVideo[] {
  const [videos, setVideos] = useState<EducationalVideo[]>(() => getVideosBySlot(slotId));

  useEffect(() => {
    let isMounted = true;

    const resolveCurrent = async () => {
      const currentList = getVideosBySlot(slotId);
      if (currentList.length === 0) {
        if (isMounted) setVideos([]);
        return;
      }

      const rehydrated = await Promise.all(
        currentList.map(async (v) => {
          if (v.videoType === 'file' && v.blobId) {
            const freshUrl = await getVideoBlobUrl(v.blobId);
            if (freshUrl) {
              return { ...v, videoUrl: freshUrl };
            }
          }
          return v;
        })
      );

      if (isMounted) {
        setVideos(rehydrated);
      }
    };

    resolveCurrent();

    const handleUpdate = () => {
      resolveCurrent();
    };

    window.addEventListener('videos-storage-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('videos-storage-updated', handleUpdate);
    };
  }, [slotId]);

  return videos;
}

/**
 * React hook to access first video of a slot for backward compatibility
 */
export function useEducationalVideo(slotId: string): EducationalVideo | undefined {
  const videos = useEducationalVideos(slotId);
  return videos[0];
}

/**
 * Ensures video URL is valid, rehydrating local IndexedDB blob URLs if needed
 */
export async function rehydrateLocalVideoUrls(): Promise<EducationalVideo[]> {
  const all = getEducationalVideos();
  let changed = false;

  const resolved = await Promise.all(
    all.map(async (v) => {
      if (v.videoType === 'file' && v.blobId) {
        const freshUrl = await getVideoBlobUrl(v.blobId);
        if (freshUrl && freshUrl !== v.videoUrl) {
          changed = true;
          return { ...v, videoUrl: freshUrl };
        }
      }
      return v;
    })
  );

  if (changed) {
    saveEducationalVideos(resolved);
  }
  return resolved;
}

export function addEducationalVideo(
  videoData: Omit<EducationalVideo, 'id' | 'addedAt' | 'targetSlotName'>
): EducationalVideo {
  const all = getEducationalVideos();
  const slotDef = VIDEO_SLOTS.find((s) => s.slotId === videoData.targetSlotId);
  const partNumber = videoData.partNumber || 1;
  const partCustomTitle = videoData.partCustomTitle?.trim() || `الجزء ${partNumber}`;
  const partTitle = videoData.partTitle || `${partCustomTitle}: ${videoData.title}`;
  const normUrl = normalizeVideoUrl(videoData.videoUrl);

  const newVideo: EducationalVideo = {
    ...videoData,
    partNumber,
    partCustomTitle,
    partTitle,
    id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    targetSlotName: slotDef ? slotDef.name : videoData.targetSlotId,
    videoUrl: normUrl,
    addedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    isActive: true,
  };

  // Prevent row merging/duplication: If a video with the same part number OR same URL exists in this slot, replace it!
  const existingIdx = all.findIndex(
    (v) => v.targetSlotId === videoData.targetSlotId && (v.partNumber === partNumber || normalizeVideoUrl(v.videoUrl) === normUrl)
  );

  if (existingIdx !== -1) {
    all[existingIdx] = newVideo;
  } else {
    const existingInSlot = all.filter((v) => v.targetSlotId === videoData.targetSlotId);
    if (existingInSlot.length >= 5) {
      throw new Error('تم الوصول للحد الأقصى (٥ فيديوهات) لهذا العنوان. يرجى حذف جزء أولاً.');
    }
    all.push(newVideo);
  }

  saveEducationalVideos(all);
  return newVideo;
}

export function updateEducationalVideo(
  id: string,
  updates: Partial<Omit<EducationalVideo, 'id' | 'addedAt'>>
): EducationalVideo | null {
  const all = getEducationalVideos();
  const index = all.findIndex((v) => v.id === id);
  if (index === -1) return null;

  let slotName = all[index].targetSlotName;
  if (updates.targetSlotId) {
    const slotDef = VIDEO_SLOTS.find((s) => s.slotId === updates.targetSlotId);
    if (slotDef) slotName = slotDef.name;
  }

  const updatedPartCustomTitle = updates.partCustomTitle !== undefined 
    ? updates.partCustomTitle.trim() 
    : all[index].partCustomTitle;
  const updatedTitle = updates.title !== undefined ? updates.title.trim() : all[index].title;
  const updatedPartNumber = updates.partNumber !== undefined ? updates.partNumber : all[index].partNumber;
  const defaultLabel = updatedPartCustomTitle || (updatedPartNumber ? `الجزء ${updatedPartNumber}` : 'الجزء');
  const updatedPartTitle = updates.partTitle || `${defaultLabel}: ${updatedTitle}`;

  const updated: EducationalVideo = {
    ...all[index],
    ...updates,
    partCustomTitle: updatedPartCustomTitle,
    partTitle: updatedPartTitle,
    title: updatedTitle,
    targetSlotName: slotName,
    videoUrl: updates.videoUrl ? normalizeVideoUrl(updates.videoUrl) : all[index].videoUrl,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  all[index] = updated;
  saveEducationalVideos(all);
  return updated;
}

export function deleteEducationalVideo(id: string): boolean {
  const all = getEducationalVideos();
  const toDelete = all.find((v) => v.id === id);
  if (toDelete && toDelete.blobId) {
    deleteVideoBlob(toDelete.blobId).catch(() => {});
  }

  const filtered = all.filter((v) => v.id !== id);
  if (filtered.length !== all.length) {
    saveEducationalVideos(filtered);
    return true;
  }
  return false;
}

/**
 * Normalizes YouTube, Google Drive, Vimeo, Dropbox, and cloud URLs into proper embed / stream URLs
 */
export function normalizeVideoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. YouTube watch URL: https://www.youtube.com/watch?v=XXXX or shorts or embed or youtu.be
  const watchMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  }

  // 2. Google Drive video share link, open link, uc export link, or raw file ID
  // e.g. https://drive.google.com/file/d/1ijsE-OgNHzErtRm2OtmFPMV-RWx2X8mo/view
  // MUST use /preview format for clean iframe embedding without X-Frame-Options "refused to connect" errors!
  const driveMatch = trimmed.match(
    /(?:drive\.google\.com\/(?:file\/)?(?:u\/\d+\/)?(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{20,})/
  );
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  // Raw Google Drive file ID detection (e.g. 1ijsE-OgNHzErtRm2OtmFPMV-RWx2X8mo)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed) && !trimmed.includes('http') && !trimmed.includes('youtube')) {
    return `https://drive.google.com/file/d/${trimmed}/preview`;
  }

  // 3. Vimeo link: https://vimeo.com/XXXX -> https://player.vimeo.com/video/XXXX
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // 4. Dropbox share link: convert dl=0 to raw=1 for direct streaming
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}
