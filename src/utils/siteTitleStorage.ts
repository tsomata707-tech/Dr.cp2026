import { syncGlobalQuestionsAndLevels } from './realtimeService';

export interface SiteTitleConfig {
  mainTitle: string;
  subtitle: string;
  topBadge1: string;
  topBadge2: string;
  footerUniversity: string;
}

export const DEFAULT_SITE_TITLE_CONFIG: SiteTitleConfig = {
  mainTitle:
    'تصميم بيئة ألعاب تعليمية إلكترونية قائمة على التفاعل بين نمط التغذية الراجعة (فورية / مرجئة) ونمط التعلم (تعاوني / تنافسي) وأثره على تنمية مهارات إنتاج وتصميم الوسائط المتعددة والتقبل التكنولوجي لدى طلاب تكنولوجيا التعليم',
  subtitle:
    'جامعة طنطا - كلية التربية النوعية - قسم تكنولوجيا التعليم • بيئة تفاعلية لاكتساب مهارات Adobe Captivate 2019',
  topBadge1: 'رسالة ماجستير في تكنولوجيا التعليم',
  topBadge2: 'Adobe Captivate 2019',
  footerUniversity: 'جامعة طنطا - كلية التربية النوعية',
};

const SITE_TITLE_STORAGE_KEY = 'cp_site_title_config_v1';

export function getSiteTitleConfig(): SiteTitleConfig {
  try {
    const raw = localStorage.getItem(SITE_TITLE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SITE_TITLE_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_TITLE_CONFIG));
      return DEFAULT_SITE_TITLE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SITE_TITLE_CONFIG, ...parsed };
  } catch {
    return DEFAULT_SITE_TITLE_CONFIG;
  }
}

export function saveSiteTitleConfig(
  config: Partial<SiteTitleConfig>,
  syncRemote: boolean = true
): SiteTitleConfig {
  try {
    const current = getSiteTitleConfig();
    const updated: SiteTitleConfig = {
      ...current,
      ...config,
    };
    localStorage.setItem(SITE_TITLE_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cp_site_title_updated', { detail: updated }));
    }

    if (syncRemote) {
      syncGlobalQuestionsAndLevels('siteTitle', updated).catch(() => {});
    }

    return updated;
  } catch {
    return DEFAULT_SITE_TITLE_CONFIG;
  }
}

export function resetSiteTitleConfigToDefault(): SiteTitleConfig {
  try {
    localStorage.removeItem(SITE_TITLE_STORAGE_KEY);
    localStorage.setItem(SITE_TITLE_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_TITLE_CONFIG));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cp_site_title_updated', { detail: DEFAULT_SITE_TITLE_CONFIG })
      );
    }

    syncGlobalQuestionsAndLevels('siteTitle', DEFAULT_SITE_TITLE_CONFIG).catch(() => {});
    return DEFAULT_SITE_TITLE_CONFIG;
  } catch {
    return DEFAULT_SITE_TITLE_CONFIG;
  }
}
