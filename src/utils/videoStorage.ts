import { useState, useEffect } from 'react';
import { EducationalVideo, VideoSlotDef } from '../types';
import { storeVideoBlob, getVideoBlobUrl, deleteVideoBlob } from './indexedDbVideo';

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

// Initial educational videos seeding (Only title, slot, and url - NO description!)
const INITIAL_VIDEOS: EducationalVideo[] = [
  {
    id: 'vid-1',
    title: 'مقدمة في إنتاج وتصميم الوسائط المتعددة',
    targetSlotId: 'level-1',
    targetSlotName: 'المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoType: 'youtube',
    duration: '04:30',
    addedAt: '2026-03-01 10:00',
    isActive: true,
  },
  {
    id: 'vid-2',
    title: 'جولة استكشافية في واجهة Adobe Captivate 2019',
    targetSlotId: 'level-2',
    targetSlotName: 'المرحلة 2: التعرف على واجهة Adobe Captivate 2019',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoType: 'youtube',
    duration: '06:15',
    addedAt: '2026-03-01 10:30',
    isActive: true,
  },
  {
    id: 'vid-3',
    title: 'إدارة وتخطيط الشرائح والمشاهد في كابتيفيت',
    targetSlotId: 'level-3',
    targetSlotName: 'المرحلة 3: إدارة وتصميم الشرائح والمشاهد التفاعلية',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoType: 'youtube',
    duration: '05:45',
    addedAt: '2026-03-01 11:00',
    isActive: true,
  },
  {
    id: 'vid-8',
    title: 'تقنيات الفيديو التفاعلي في Adobe Captivate',
    targetSlotId: 'level-8',
    targetSlotName: 'المرحلة 8: إدراج ومعالجة الفيديو التفاعلي والمحاكاة',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoType: 'youtube',
    duration: '08:00',
    addedAt: '2026-03-01 12:00',
    isActive: true,
  },
  {
    id: 'vid-task',
    title: 'دليل تنفيذ المهمة التطبيقية العملية',
    targetSlotId: 'app-task',
    targetSlotName: 'شاشة المهمة التطبيقية (Practical Application Task)',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoType: 'youtube',
    duration: '05:00',
    addedAt: '2026-03-01 13:00',
    isActive: true,
  },
];

export function getEducationalVideos(): EducationalVideo[] {
  try {
    const raw = localStorage.getItem(VIDEOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }

    // Try migration from v1
    const prevRaw = localStorage.getItem(PREV_VIDEOS_STORAGE_KEY);
    if (prevRaw) {
      const prevParsed = JSON.parse(prevRaw);
      if (Array.isArray(prevParsed)) {
        localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(prevParsed));
        return prevParsed;
      }
    }

    localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(INITIAL_VIDEOS));
    return INITIAL_VIDEOS;
  } catch {
    return INITIAL_VIDEOS;
  }
}

export function saveEducationalVideos(videos: EducationalVideo[]): void {
  localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(videos));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('videos-storage-updated', { detail: videos }));
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
  const existingInSlot = all.filter((v) => v.targetSlotId === videoData.targetSlotId);

  // Maximum 5 videos allowed per slot
  if (existingInSlot.length >= 5) {
    throw new Error('تم الوصول للحد الأقصى (٥ فيديوهات) لهذا العنوان. يرجى حذف جزء أولاً.');
  }

  const slotDef = VIDEO_SLOTS.find((s) => s.slotId === videoData.targetSlotId);
  const partNumber = videoData.partNumber || (existingInSlot.length + 1);
  const partTitle = videoData.partTitle || `الجزء ${partNumber}: ${videoData.title}`;

  const newVideo: EducationalVideo = {
    ...videoData,
    partNumber,
    partTitle,
    id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    targetSlotName: slotDef ? slotDef.name : videoData.targetSlotId,
    videoUrl: normalizeVideoUrl(videoData.videoUrl),
    addedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    isActive: true,
  };

  // Add without deleting existing videos of same slot!
  all.unshift(newVideo);
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

  const updated: EducationalVideo = {
    ...all[index],
    ...updates,
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
 * Normalizes YouTube URLs into proper embed iframe URLs
 */
export function normalizeVideoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  // YouTube watch URL: https://www.youtube.com/watch?v=XXXX or shorts or embed or youtu.be
  const watchMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  }

  return trimmed;
}
