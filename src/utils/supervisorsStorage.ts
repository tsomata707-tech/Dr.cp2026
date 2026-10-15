import { SupervisorCard, SupervisorsHonorBoardConfig, ResearcherInfo } from '../types';
import { syncGlobalQuestionsAndLevels } from './realtimeService';

const SUPERVISORS_STORAGE_KEY = 'cp_supervisors_honor_board_v4';
const PREV_SUPERVISORS_STORAGE_KEY = 'cp_supervisors_honor_board_v3';

export const INITIAL_RESEARCHER_INFO: ResearcherInfo = {
  name: 'الباحثة/ حكمت عزت محمد غنيم',
  title: 'معيدة بقسم تكنولوجيا التعليم ومصممة بيئة الألعاب التعليمية',
  role: 'الباحثة ومعدة الدراسة',
  imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  degree: 'ماجستير في تكنولوجيا التعليم',
  accentColor: '#10b981',
};

export const INITIAL_SUPERVISORS_CONFIG: SupervisorsHonorBoardConfig = {
  boardTitle: 'لوحة الشرف لمشرفي المشروع والرسالة العلمية',
  boardSubtitle: '',
  university: 'جامعة طنطا - كلية التربية النوعية - قسم تكنولوجيا التعليم',
  researcher: 'الباحثة/ حكمت عزت محمد غنيم',
  researcherInfo: INITIAL_RESEARCHER_INFO,
  researchTitle: 'تصميم بيئة ألعاب تعليمية إلكترونية قائمة على التفاعل بين نمط التغذية الراجعة (فورية / مرجئة) ونمط التعلم (تعاوني / تنافسي) وأثره على تنمية مهارات إنتاج وتصميم الوسائط المتعددة والتقبل التكنولوجي لدى طلاب تكنولوجيا التعليم',
  showOnStudentLogin: true,
  supervisors: [
    {
      id: 'sup-1',
      cardIndex: 1,
      cardLabel: 'المشرف الأول',
      name: 'أ.د/ حسناء عبد العاطي الطباخ',
      title: 'أستاذ تكنولوجيا التعليم ورئيس القسم بكلية التربية النوعية جامعة طنطا',
      role: 'رئيس لجنة الإشراف العلمي',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      accentColor: '#ffd700',
    },
    {
      id: 'sup-2',
      cardIndex: 2,
      cardLabel: 'المشرف الثاني',
      name: 'أ.م.د/ أمل إبراهيم حماده',
      title: 'أستاذ تكنولوجيا التعليم المساعد بكلية التربية النوعية جامعة طنطا',
      role: 'مشرف علمي على البحث',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      accentColor: '#a855f7',
    },
    {
      id: 'sup-3',
      cardIndex: 3,
      cardLabel: 'المشرف الثالث',
      name: 'د/ حنان جلال قلقيلة',
      title: 'مدرس تكنولوجيا التعليم بكلية التربية النوعية جامعة طنطا',
      role: 'مشرف علمي على البحث',
      imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
      accentColor: '#06b6d4',
    },
  ],
  updatedAt: '2026-03-01 10:00',
};

export function getSupervisorsBoardConfig(): SupervisorsHonorBoardConfig {
  try {
    const raw = localStorage.getItem(SUPERVISORS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.supervisors)) {
        // If boardSubtitle contains the removed phrase 'تقديراً وعرفاناً', clear it
        const cleanedSubtitle = parsed.boardSubtitle?.includes('تقديراً وعرفاناً')
          ? ''
          : (parsed.boardSubtitle || '');

        return {
          ...INITIAL_SUPERVISORS_CONFIG,
          ...parsed,
          boardSubtitle: cleanedSubtitle,
          researcherInfo: {
            ...INITIAL_RESEARCHER_INFO,
            ...(parsed.researcherInfo || {}),
          },
          showOnStudentLogin: parsed.showOnStudentLogin !== false,
        };
      }
    }

    // Migration from previous v3 if present
    const prevRaw = localStorage.getItem(PREV_SUPERVISORS_STORAGE_KEY);
    if (prevRaw) {
      const prevParsed = JSON.parse(prevRaw);
      if (prevParsed && Array.isArray(prevParsed.supervisors)) {
        // Extract Hikmat card if present in previous supervisors
        const hikmatCard = prevParsed.supervisors.find(
          (c: SupervisorCard) => c.name?.includes('حكمت') || c.id === 'sup-4'
        );
        const supervisorsWithoutHikmat = prevParsed.supervisors.filter(
          (c: SupervisorCard) => !c.name?.includes('حكمت') && c.id !== 'sup-4'
        );

        const migrated: SupervisorsHonorBoardConfig = {
          ...INITIAL_SUPERVISORS_CONFIG,
          ...prevParsed,
          researcherInfo: {
            ...INITIAL_RESEARCHER_INFO,
            imageUrl: hikmatCard?.imageUrl || INITIAL_RESEARCHER_INFO.imageUrl,
            name: hikmatCard?.name || INITIAL_RESEARCHER_INFO.name,
            title: hikmatCard?.title || INITIAL_RESEARCHER_INFO.title,
            role: hikmatCard?.role || INITIAL_RESEARCHER_INFO.role,
          },
          supervisors: supervisorsWithoutHikmat.length > 0 ? supervisorsWithoutHikmat : INITIAL_SUPERVISORS_CONFIG.supervisors,
        };
        localStorage.setItem(SUPERVISORS_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

    // Default init
    localStorage.setItem(SUPERVISORS_STORAGE_KEY, JSON.stringify(INITIAL_SUPERVISORS_CONFIG));
    return INITIAL_SUPERVISORS_CONFIG;
  } catch {
    return INITIAL_SUPERVISORS_CONFIG;
  }
}

const ARABIC_ORDINALS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];

export function saveSupervisorsBoardConfig(config: SupervisorsHonorBoardConfig): void {
  // Ensure cards have standardized auto-aligned labels if empty or standard pattern: المشرف الأول, المشرف الثاني...
  const normalizedSupervisors = config.supervisors.map((s, idx) => {
    const ordinal = ARABIC_ORDINALS[idx] || `${idx + 1}`;
    const autoLabel =
      !s.cardLabel || s.cardLabel.startsWith('المشرف') || s.cardLabel.startsWith('البطاقة')
        ? `المشرف ${ordinal}`
        : s.cardLabel.trim();

    return {
      ...s,
      cardIndex: idx + 1,
      cardLabel: autoLabel,
    };
  });

  const updatedConfig: SupervisorsHonorBoardConfig = {
    ...config,
    researcherInfo: config.researcherInfo || INITIAL_RESEARCHER_INFO,
    supervisors: normalizedSupervisors,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  localStorage.setItem(SUPERVISORS_STORAGE_KEY, JSON.stringify(updatedConfig));
  syncGlobalQuestionsAndLevels('supervisors', updatedConfig).catch(() => {});

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supervisors-honor-board-updated', { detail: updatedConfig }));
  }
}

export function resetSupervisorsBoardConfig(): SupervisorsHonorBoardConfig {
  localStorage.setItem(SUPERVISORS_STORAGE_KEY, JSON.stringify(INITIAL_SUPERVISORS_CONFIG));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supervisors-honor-board-updated', { detail: INITIAL_SUPERVISORS_CONFIG }));
  }
  return INITIAL_SUPERVISORS_CONFIG;
}

export function addSupervisorCard(
  cardData: Omit<SupervisorCard, 'id' | 'cardIndex' | 'cardLabel'> & { cardLabel?: string }
): SupervisorsHonorBoardConfig {
  const current = getSupervisorsBoardConfig();
  const nextIndex = current.supervisors.length + 1;

  const newCard: SupervisorCard = {
    ...cardData,
    id: `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    cardIndex: nextIndex,
    cardLabel: cardData.cardLabel?.trim() || `المشرف ${nextIndex}`,
    imageUrl: cardData.imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  };

  const updated: SupervisorsHonorBoardConfig = {
    ...current,
    supervisors: [...current.supervisors, newCard],
  };

  saveSupervisorsBoardConfig(updated);
  return getSupervisorsBoardConfig();
}

export function updateSupervisorCard(
  id: string,
  updates: Partial<Omit<SupervisorCard, 'id' | 'cardIndex'>>
): SupervisorsHonorBoardConfig {
  const current = getSupervisorsBoardConfig();
  const index = current.supervisors.findIndex((s) => s.id === id);
  if (index === -1) return current;

  current.supervisors[index] = {
    ...current.supervisors[index],
    ...updates,
  };

  saveSupervisorsBoardConfig(current);
  return getSupervisorsBoardConfig();
}

export function deleteSupervisorCard(id: string): SupervisorsHonorBoardConfig {
  const current = getSupervisorsBoardConfig();
  const filtered = current.supervisors.filter((s) => s.id !== id);

  saveSupervisorsBoardConfig({
    ...current,
    supervisors: filtered,
  });
  return getSupervisorsBoardConfig();
}
