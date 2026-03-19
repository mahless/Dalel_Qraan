import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, ScrollText, Scale, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Keyboard } from '@capacitor/keyboard';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: Home, label: 'الرئيسية', path: '/' },
  { icon: BookOpen, label: 'السور', path: '/surahs' },
  { icon: ScrollText, label: 'القصص', path: '/stories' },
  { icon: Scale, label: 'الأحكام', path: '/rulings' },
  { icon: Search, label: 'البحث', path: '/search' },
];

export default function BottomNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass rounded-[2rem] card-shadow px-4 py-2.5 flex justify-around items-center w-full border border-white/20 dark:border-white/5"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "relative flex flex-col items-center gap-1 transition-all duration-300",
                    isActive ? "text-primary dark:text-emerald-400 scale-110" : "text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-slate-200"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[9px] font-black tracking-tighter">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
