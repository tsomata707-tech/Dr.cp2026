import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RobotBackground } from './components/RobotBackground';
import { SplashScreen } from './components/SplashScreen';
import { LoginCard } from './components/LoginCard';
import { GamingLineArtBackground } from './components/GamingLineArtBackground';
import { PortalHome } from './components/PortalHome';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Mail } from 'lucide-react';
import { rehydrateLocalVideoUrls, syncRemoteEducationalVideos } from './utils/videoStorage';
import { subscribeToGlobalData } from './utils/realtimeService';
import { savePreTestQuestions, savePostTestQuestions } from './data/preTestData';
import { saveCustomGameLevels } from './data/gameLevelsData';

import { saveSiteInstructionsConfig } from './utils/instructionsStorage';
import { saveSplashImageUrl } from './utils/splashStorage';
import { saveSupervisorsBoardConfig } from './utils/supervisorsStorage';
import { saveSiteTitleConfig } from './utils/siteTitleStorage';
import { recordStudentLogin } from './utils/studentAuditStorage';

import { seedPreTestSubmissions } from './data/preTestSubmissionsSeed';

const SESSION_KEY = 'cp_active_session_username_v1';
const ADMIN_SESSION_KEY = 'cp_active_admin_session_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authScreen, setAuthScreen] = useState<'splash' | 'login'>('splash');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem(SESSION_KEY);
    if (savedUser) setCurrentUser(savedUser);
    
    const savedAdmin = localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    if (savedAdmin) setIsAdminMode(true);

    // Ensure all 60 students have completed and passed the Pre-Test, starting directly at levels 1..9
    try {
      seedPreTestSubmissions(false);
    } catch {
      // Ignore
    }
  }, []);

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
    const unsubVideos = subscribeToGlobalData('videos', (data) => {
      if (Array.isArray(data)) {
        syncRemoteEducationalVideos(data);
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
      unsubVideos();
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
          <div className="flex flex-col items-center justify-center min-h-[78vh] py-4 relative">
            <GamingLineArtBackground />
            <SplashScreen
              onEnter={() => setAuthScreen('login')}
              onOpenAdminLogin={() => setIsAdminModalOpen(true)}
            />
          </div>
        ) : (
          /* Screen 2: Login Screen (شاشة تسجيل الدخول النموذجية) */
          <div className="flex flex-col items-center justify-center min-h-[78vh] py-4 relative">
            <GamingLineArtBackground />
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

      {/* Footer Note */}
      <footer className="relative z-10 py-5 text-center border-t border-slate-900/80 backdrop-blur-sm bg-black/40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 px-6 py-2.5 rounded-2xl bg-slate-200 border border-slate-300 text-sm sm:text-base font-black text-slate-900 font-['Cairo'] shadow-md">
            <span>حقوق التصميم والنشر</span>
            <span className="text-slate-500 hidden sm:inline">:</span>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=tsomata.707@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-slate-900 hover:text-black underline underline-offset-4 font-black font-['Cairo'] transition-all hover:scale-105 cursor-pointer"
              title="إرسال رسالة إلى tsomata.707@gmail.com عبر بريد Gmail"
            >
              <Mail className="w-4.5 h-4.5 text-slate-900 shrink-0" />
              <span>tsomata.707@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
