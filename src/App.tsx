import React, { Suspense, lazy } from 'react';
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
const SavedTafsirs = lazy(() => import('./pages/SavedTafsirs'));

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function AppContent() {
  const { darkMode, toggleDarkMode } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    try {
      const root = window.document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      console.warn('Failed to save theme preference');
    }
  }, [darkMode]);

  React.useEffect(() => {
    const setupAppEvents = async () => {
      // Handle Hardware Back Button
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else if (location.pathname !== '/') {
          navigate('/');
        }
      });

      // Request Permissions
      try {
        const status = await Filesystem.checkPermissions();
        if (status.publicStorage !== 'granted') {
          await Filesystem.requestPermissions();
        }
      } catch (e) {
        console.warn('Filesystem permissions not available', e);
      }
    };
    
    setupAppEvents();

    return () => {
      CapApp.removeAllListeners();
    };
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-dark-bg transition-colors duration-500 relative overflow-hidden">
      {/* Top safe area background (to ensure area above headers is solid) */}
      <div 
        className="fixed top-0 left-0 right-0 h-12 z-[48] pointer-events-none transition-colors duration-500" 
        style={{ backgroundColor: darkMode ? '#0f172a' : '#FDFBF7' }}
      />
      
      {/* Background atmospheric glow for dark mode */}
      <div className="fixed inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000 atmosphere-gradient" />
      
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/surahs" element={<Surahs />} />
            <Route path="/surahs/:id" element={<SurahDetails />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<StoryDetails />} />
            <Route path="/rulings" element={<Rulings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/saved-tafsirs" element={<SavedTafsirs />} />
          </Routes>
        </PageTransition>
      </Suspense>
      <BottomNav />
      
      {/* Bottom safe area background (to ensure area below nav is solid) */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-12 z-[48] pointer-events-none transition-colors duration-500" 
        style={{ backgroundColor: darkMode ? '#0f172a' : '#FDFBF7' }}
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
