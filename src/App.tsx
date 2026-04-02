import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import { useStore } from './store/useStore';
import { Filesystem } from '@capacitor/filesystem';
import { App as CapApp } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { useNavigate } from 'react-router-dom';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Surahs = lazy(() => import('./pages/Surahs'));
const SurahDetails = lazy(() => import('./pages/SurahDetails'));
const Stories = lazy(() => import('./pages/Stories'));
const StoryDetails = lazy(() => import('./pages/StoryDetails'));
const Rulings = lazy(() => import('./pages/Rulings'));
const Search = lazy(() => import('./pages/Search'));
const QuranWird = lazy(() => import('./pages/QuranWird'));
const Library = lazy(() => import('./pages/Library'));
const StaticTafsirs = lazy(() => import('./pages/StaticTafsirs'));
const ProphetMuhammad = lazy(() => import('./pages/ProphetMuhammad'));
const Azkar = lazy(() => import('./pages/Azkar'));
const BestDhikr = lazy(() => import('./pages/BestDhikr'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const VerseSearch = lazy(() => import('./pages/VerseSearch'));
const Ruqyah = lazy(() => import('./pages/Ruqyah'));
const Hadith = React.lazy(() => import('./pages/Hadith'));

const PageTransition = ({ children, location }: { children: React.ReactNode; location: any }) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{ willChange: 'opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

import { notificationService } from './services/NotificationService';

function AppContent() {
  const { theme, uiFontSize } = useStore();
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'auto') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = theme === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      setIsDark(isDark);
      // Save current preference for reference
      localStorage.setItem('theme-mode', theme);
    };

    applyTheme();
    root.style.fontSize = `${uiFontSize}px`;

    // Listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, uiFontSize]);

  React.useEffect(() => {
    const initApp = async () => {
      try {
        const fsStatus = await Filesystem.checkPermissions();
        if (fsStatus.publicStorage !== 'granted') {
          await Filesystem.requestPermissions();
        }
        await notificationService.init();
      } catch (e) {
        console.warn('Initial setup failed', e);
      }
    };
    initApp();
  }, []);

  React.useEffect(() => {
    let backListener: any;
    
    const setupAppEvents = async () => {
      // Handle Hardware Back Button
      backListener = await CapApp.addListener('backButton', ({ canGoBack }) => {
        if (location.pathname.includes('/library/azkar/')) {
          // Allow Azkar component to handle its own back button logic
          return;
        }

        if (canGoBack) {
          window.history.back();
        } else if (location.pathname !== '/') {
          navigate('/');
        }
      });
    };

    setupAppEvents();

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-dark-bg transition-colors duration-500 relative overflow-hidden">
      {/* Top safe area background (to ensure area above headers is solid) */}
      <div
        className="fixed top-0 left-0 right-0 h-12 z-[48] pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: isDark ? '#0f172a' : '#FDFBF7' }}
      />

      {/* Background atmospheric glow for dark mode */}
      <div className="fixed inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000 atmosphere-gradient" />

      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <PageTransition location={location}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/surahs" element={<Surahs />} />
            <Route path="/surahs/:id" element={<SurahDetails />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<StoryDetails />} />
            <Route path="/rulings" element={<Rulings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/wird" element={<QuranWird />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/static-tafsirs" element={<StaticTafsirs />} />
            <Route path="/library/prophet-muhammad" element={<ProphetMuhammad />} />
            <Route path="/library/azkar/:category" element={<Azkar />} />
            <Route path="/library/best-dhikr" element={<BestDhikr />} />
            <Route path="/library/ruqyah" element={<Ruqyah />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/verse-search" element={<VerseSearch />} />
            <Route path="/library/hadith" element={<Hadith />} />
          </Routes>
        </PageTransition>
      </Suspense>
      <BottomNav />

      {/* Bottom safe area background (to ensure area below nav is solid) */}
      <div
        className="fixed bottom-0 left-0 right-0 h-12 z-[48] pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: isDark ? '#0f172a' : '#FDFBF7' }}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}
