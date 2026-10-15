import defaultSplashImg from '../assets/images/captivate_suit_student_1791844175400.jpg';
import { syncGlobalQuestionsAndLevels } from './realtimeService';

const SPLASH_IMAGE_KEY = 'cp_custom_splash_image_url_v1';

export interface SplashPreset {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const SPLASH_PRESETS: SplashPreset[] = [
  {
    id: 'suit_student',
    name: 'طالب أنيق ببدلة يحمل كتاب Adobe Captivate',
    url: defaultSplashImg,
    description: 'صورة الطالب الأنيق بالبدلة الرسمية مع أجواء ألعاب مستقبلية وكتاب كابتفيت',
  },
  {
    id: 'multimedia_student',
    name: 'طالب في معمل الوسائط المتعددة',
    url: '/assets/student_multimedia_journey_1790979986545.jpg',
    description: 'طالب تكنولوجيا التعليم في معمل حاسوب حديث',
  },
  {
    id: 'cyber_tech',
    name: 'بيئة سيبرانية تعليمية متقدمة',
    url: '/assets/futuristic_robot_bg_1788866669506.jpg',
    description: 'أجواء تكنولوجية مستقبلية عالية الدقة',
  },
];

export function getSplashImageUrl(): string {
  try {
    const saved = localStorage.getItem(SPLASH_IMAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {
    // Ignore error
  }
  return defaultSplashImg;
}

export function saveSplashImageUrl(url: string, syncRemote: boolean = true): void {
  try {
    const cleanUrl = url && url.trim() ? url.trim() : '';
    const current = localStorage.getItem(SPLASH_IMAGE_KEY) || '';
    if (cleanUrl === current && !syncRemote) {
      return; // Already matched, no need to dispatch or save
    }
    if (!cleanUrl) {
      localStorage.removeItem(SPLASH_IMAGE_KEY);
    } else {
      localStorage.setItem(SPLASH_IMAGE_KEY, cleanUrl);
    }
    if (syncRemote) {
      syncGlobalQuestionsAndLevels('splash', { url: cleanUrl }).catch(() => {});
    }
    window.dispatchEvent(new CustomEvent('cp_splash_image_updated', { detail: cleanUrl }));
  } catch {
    // Ignore error
  }
}

export function resetSplashImageToDefault(): void {
  try {
    localStorage.removeItem(SPLASH_IMAGE_KEY);
    syncGlobalQuestionsAndLevels('splash', { url: defaultSplashImg }).catch(() => {});
    window.dispatchEvent(new CustomEvent('cp_splash_image_updated', { detail: defaultSplashImg }));
  } catch {
    // Ignore error
  }
}
