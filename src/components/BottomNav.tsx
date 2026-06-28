import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Bookmark, Settings, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Keyboard } from '@capacitor/keyboard';
import SettingsModal from './SettingsModal';
import { useStore } from '../store/useStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: Home, label: 'الرئيسية', path: '/' },
  { icon: Bookmark, label: 'المفضلة', path: '/bookmarks' },
  { icon: Mail, label: '', path: '/heart-message', isSpecial: true },
  { icon: Search, label: 'البحث', path: '/search' },
  { icon: Settings, label: 'الإعدادات', path: '__settings__' },
];

export default function BottomNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { modalCount } = useStore();
  const location = useLocation();

  useEffect(() => {
    let showHandle: any;
    let hideHandle: any;

    const setupKeyboard = async () => {
      showHandle = await Keyboard.addListener('keyboardWillShow', () => {
        setIsKeyboardVisible(true);
      });
      hideHandle = await Keyboard.addListener('keyboardWillHide', () => {
        setIsKeyboardVisible(false);
      });
    };

    setupKeyboard();

    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 50) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
      if (showHandle) showHandle.remove();
      if (hideHandle) hideHandle.remove();
    };
  }, [lastScrollY]);

  if (isKeyboardVisible) return null;

  return (
    <>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md">
        <AnimatePresence>
          {isVisible && modalCount === 0 && (
            <motion.nav
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass rounded-[2rem] card-shadow px-2 py-2.5 flex justify-around items-center w-full border border-white/20 dark:border-white/5"
            >
              {navItems.map((item) => {
                if (item.path === '__settings__') {
                  return (
                    <button
                      key={item.path}
                      onClick={() => setIsSettingsOpen(true)}
                      className={cn(
                        "relative flex flex-col items-center gap-1 transition-all duration-300",
                        isSettingsOpen
                          ? "text-primary dark:text-emerald-400 scale-110 active:scale-95"
                          : "text-slate-600 active:text-black dark:text-slate-400 dark:active:text-slate-200 active:scale-95"
                      )}
                    >
                      <item.icon size={22} strokeWidth={isSettingsOpen ? 2.5 : 2} />
                      <span className="text-xs font-black tracking-tighter">{item.label}</span>
                    </button>
                  );
                }

                if (item.isSpecial) {
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "relative flex flex-col items-center justify-center transition-all duration-300",
                          isActive ? "scale-110" : "active:scale-95"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <div className={cn(
                          "w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all border border-emerald-500/40 dark:border-emerald-500/60",
                          "!shadow-[0_0_25px_rgba(16,185,129,0.5)] dark:!shadow-[0_0_30px_rgba(16,185,129,0.7)]",
                          "bg-emerald-500/15 dark:bg-emerald-500/25",
                          isActive 
                            ? "text-emerald-700 dark:text-emerald-300 scale-110" 
                            : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                          {isActive && (
                            <motion.div
                              layoutId="activeNav"
                              className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                            />
                          )}
                        </div>
                      )}
                    </NavLink>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "relative flex flex-col items-center gap-1 transition-all duration-300",
                        isActive ? "text-primary dark:text-emerald-400 scale-110 active:scale-95" : "text-slate-600 active:text-black dark:text-slate-400 dark:active:text-slate-200 active:scale-95"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-xs font-black tracking-tighter">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
