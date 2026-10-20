import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RobotBackground } from './components/RobotBackground';
import { SplashScreen } from './components/SplashScreen';
import { LoginCard } from './components/LoginCard';
import { PortalHome } from './components/PortalHome';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { KeyRound } from 'lucide-react';
import { rehydrateLocalVideoUrls } from './utils/videoStorage';
import { subscribeToGlobalData } from './utils/realtimeService';
import { savePreTestQuestions, savePostTestQuestions } from './data/preTestData';
import { saveCustomGameLevels } from './data/gameLevelsData';

import { saveSiteInstructionsConfig } from './utils/instructionsStorage';
import { saveSplashImageUrl } from './utils/splashStorage';
import { saveSupervisorsBoardConfig } from './utils/supervisorsStorage';
import { saveSiteTitleConfig } from './utils/siteTitleStorage';
import { recordStudentLogin } from './utils/studentAuditStorage';

const SESSION_KEY = 'cp_active_session_username_v1';
const ADMIN_SESSION_KEY = 'cp_active_admin_session_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  });
  const [authScreen, setAuthScreen] = useState<'splash' | 'login'>('splash');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Automatically rehydrate any uploaded videos from IndexedDB on startup
  useEffect(() => {
    rehydrateLocalVideoUrls().catch(() => {});
  }, []);

  // Real-time synchronization of admin tests, levels, instructions, splash, and supervisors from Firebase
  useEffect(() => {
    const unsubPre = subscribeToGlobalData('pretest', (data) => {
      if (Array.isArray(data) && data.length > 0) {
        savePreTestQuestions(data, false);
      }
    });
    const unsubPost = subscribeToGlobalData('posttest', (data) => {
      if (Array.isArray(data) && data.length > 0) {
        savePostTestQuestions(data, false);
      }
    });
    const unsubLevels = subscribeToGlobalData('levels', (data) => {
      if (Array.isArray(data) && data.length > 0) {
        saveCustomGameLevels(data, false);
      }
    });
    const unsubInstructions = subscribeToGlobalData('instructions', (data) => {
      if (data && typeof data === 'object') {
        saveSiteInstructionsConfig(data, false);
      }
    });
    const unsubSplash = subscribeToGlobalData('splash', (data) => {
      if (data && typeof data.url === 'string') {
        saveSplashImageUrl(data.url, false);
      }
    });
    const unsubSupervisors = subscribeToGlobalData('supervisors', (data) => {
      if (data && typeof data === 'object') {
        saveSupervisorsBoardConfig(data, false);
      }
    });
    const unsubSiteTitle = subscribeToGlobalData('siteTitle', (data) => {
      if (data && typeof data === 'object') {
        saveSiteTitleConfig(data, false);
      }
    });

    return () => {
      unsubPre();
      unsubPost();
      unsubLevels();
      unsubInstructions();
      unsubSplash();
      unsubSupervisors();
      unsubSiteTitle();
    };
  }, []);

  // Always scroll to the very top on any major app screen change or startup
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentUser, authScreen, isAdminMode]);

  const handleLoginSuccess = (username: string) => {
    try {
      localStorage.setItem(SESSION_KEY, username);
    } catch {
      // Ignore
    }
    recordStudentLogin(username);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
    setCurrentUser(null);
    setAuthScreen('splash');
  };

  const handleAdminAuthenticated = () => {
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } catch {}
    setIsAdminMode(true);
    setIsAdminModalOpen(false);
  };

  const handleExitAdmin = () => {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
    setIsAdminMode(false);
  };

  const handleLoginAsStudent = (studentUsername: string) => {
    setIsAdminMode(false);
    setCurrentUser(studentUsername);
  };

  return (
    <div className="min-h-screen bg-[#07060c] text-slate-100 flex flex-col font-['IBM_Plex_Sans_Arabic',_'Cairo',_sans-serif] relative overflow-x-hidden selection:bg-[#d4af37]/30 selection:text-amber-200">
      {/* Permanent Fixed Header with Cp Logo on Every Page */}
      <Navbar
        isLoggedIn={!!currentUser}
        username={currentUser || ''}
        isAdmin={isAdminMode}
        onLogout={handleLogout}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onExitAdmin={handleExitAdmin}
      />

      {/* Cybernetic Background Visual */}
      <RobotBackground />

      {/* Main Page Area */}
      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 relative z-10 max-w-7xl mx-auto w-full">
        {isAdminMode ? (
          /* Admin Management Panel */
          <AdminPanel onExitAdmin={handleExitAdmin} onLoginAsStudent={handleLoginAsStudent} />
        ) : currentUser ? (
          /* All Educational Environment Modules & Storyboard Screens */
          <PortalHome key={currentUser} username={currentUser} onLogout={handleLogout} />
        ) : authScreen === 'splash' ? (
          /* Screen 1: Splash Screen (شاشة الدخول التمهيدية) */
          <div className="flex flex-col items-center justify-center min-h-[78vh] py-4">
            <SplashScreen
              onEnter={() => setAuthScreen('login')}
              onOpenAdminLogin={() => setIsAdminModalOpen(true)}
            />
          </div>
        ) : (
          /* Screen 2: Login Screen (شاشة تسجيل الدخول النموذجية) */
          <div className="flex flex-col items-center justify-center min-h-[78vh] py-4">
            <LoginCard
              onLoginSuccess={handleLoginSuccess}
              onOpenAdminLogin={() => setIsAdminModalOpen(true)}
              onBackToSplash={() => setAuthScreen('splash')}
            />
          </div>
        )}
      </main>

      {/* Admin Authentication Modal (Dedicated Secure Password) */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onAdminAuthenticated={handleAdminAuthenticated}
      />

      {/* Footer Note with Admin Link */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-slate-500 border-t border-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>تصميم بيئة ألعاب تعليمية إلكترونية قائمة على التفاعل بين نمط التغذية الراجعة (فورية / مرجئة) ونمط التعلم (تعاوني / تنافسي) &copy; {new Date().getFullYear()} - جميع الحقوق محفوظة</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              id="footer-admin-link"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>دخول الإدارة (باسوورد الأدمن)</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-[#d4af37]/70">Adobe Captivate 2019 (64-Bit)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
