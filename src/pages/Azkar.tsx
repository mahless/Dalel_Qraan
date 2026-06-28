import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, ChevronUp, Check, RotateCcw } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import azkarData from '../data/azkar.json';
import QuranVerse from '../components/QuranVerse';

type AzkarCategory = 'morning_evening' | 'sleep' | 'waking_up' | 'food' | 'home' | 'washroom' | 'clothing' | 'travel' | 'general' | 'quick';

interface AzkarItem {
  id: number;
  title: string;
  text: string;
  count: number;
  reward?: string;
  note?: string;
  isVerse?: boolean;
}

export default function Azkar() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const selectedCategory = (category as AzkarCategory) || 'morning_evening';
  const hours = new Date().getHours();
  const isMorning = hours >= 4 && hours < 16;
  const timeKey = isMorning ? 'morning' : 'evening';
  const dateKey = new Date().toISOString().split('T')[0];
  const storageKey = `azkar_counts_${selectedCategory}_${timeKey}_${dateKey}`;

  const [counts, setCounts] = useState<Record<number, number>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setCounts(stored ? JSON.parse(stored) : {});
    } catch {
      setCounts({});
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(counts));
  }, [counts, storageKey]);

  // Dynamic Quick Azkar Logic
  const getQuickData = () => {
    if (selectedCategory === 'quick') {
      const timeData = isMorning ? (azkarData as any).quick_morning : (azkarData as any).quick_evening;
      return (timeData as AzkarItem[]) || [];
    }
    
    return ((azkarData as any)[selectedCategory] as AzkarItem[]) || [];
  };

  // Custom Back Navigation Logic
  useEffect(() => {
    let backListener: any;

    const handleBackPress = () => {
      if (selectedCategory === 'quick') {
        navigate('/library', { replace: true });
      } else {
        navigate('/library/best-dhikr');
      }
    };

    const setupListener = async () => {
      // Hardware back button for Android
      backListener = await App.addListener('backButton', () => {
        handleBackPress();
      });
    };

    setupListener();

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, [selectedCategory, navigate]);

  let data = getQuickData();

  // Progress Calculation
  const totalItems = data.length;
  const completedItems = data.filter(zikr => (counts[zikr.id] || 0) >= zikr.count).length;
  const percentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const getHeaderInfo = () => {

    switch (selectedCategory) {
      case 'sleep':
        return {
          title: 'أذكار النوم',
          subtitle: 'سكينة وطمأنينة قبل المنام'
        };
      case 'waking_up':
        return {
          title: 'أذكار الاستيقاظ',
          subtitle: 'الحمد لله الذي أحيانا'
        };
      case 'food':
        return {
          title: 'أذكار الطعام',
          subtitle: 'بركة الرزق وحمد المنعم'
        };
      case 'home':
        return {
          title: 'أذكار المنزل',
          subtitle: 'تحصين البيت وعند الخروج'
        };
      case 'washroom':
        return {
          title: 'أذكار الخلاء',
          subtitle: 'أدعية الدخول والخروج'
        };
      case 'clothing':
        return {
          title: 'أذكار اللباس',
          subtitle: 'شكر الله على نِعمه'
        };
      case 'travel':
        return {
          title: 'أذكار السفر',
          subtitle: 'حفظ الله في الترحال'
        };
      case 'general':
        return {
          title: 'أذكار عامة',
          subtitle: 'بذكر الله تطمئن القلوب'
        };
      case 'quick':
        return {
          title: isMorning ? 'أذكار الصباح السريعة' : 'أذكار المساء السريعة',
          subtitle: isMorning ? 'ابدأ يومك بذكر الله في دقائق' : 'اختم يومك بذكر الله في دقائق'
        };
      case 'morning_evening':
      default:
        return {
          title: 'أذكار الصباح والمساء',
          subtitle: 'أفضل ما يفتتح به المسلم يومه ويختمه'
        };
    }
  };

  const header = getHeaderInfo();

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const incrementCount = (id: number, target: number) => {
    const current = counts[id] || 0;
    if (current < target) {
      setCounts(prev => ({ ...prev, [id]: current + 1 }));
      if (current + 1 === target && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
  };

  const resetCount = (id: number) => {
    setCounts(prev => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto min-h-screen">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-3 flex flex-col gap-2 max-w-2xl mx-auto card-shadow">
          <div className="flex items-center gap-4 w-full px-2">
            <button 
              onClick={() => {
                if (selectedCategory === 'quick') {
                  navigate('/library', { replace: true });
                } else {
                  navigate('/library/best-dhikr');
                }
              }}
              className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-white active:bg-black/10 dark:active:bg-white/10 transition-colors shrink-0"
            >
              <ArrowRight size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-black text-black dark:text-white leading-none">{header.title}</h1>
              <p className="text-xs text-black/60 dark:text-slate-400 font-medium mt-1">
                {header.subtitle}
              </p>
            </div>
          </div>
          
          {selectedCategory === 'quick' && (
            <div className="w-full px-3 mb-1 mt-1">
              <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className="h-full rounded-full bg-gradient-to-l from-primary to-primary/60 dark:from-emerald-500 dark:to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.8)] dark:shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </header>
      </div>

      <div className="space-y-4">
        {data.map((zikr) => {
          const currentCount = counts[zikr.id] || 0;
          const isDone = currentCount === zikr.count;

          return (
            <motion.div
              key={zikr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass rounded-[2rem] card-shadow overflow-hidden border transition-all ${
                isDone 
                  ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10' 
                  : 'border-transparent active:border-emerald-500/20'
              }`}
            >
              <div 
                className="p-4 pt-6 cursor-pointer relative"
                onClick={() => toggleExpand(zikr.id)}
              >
                {zikr.reward && (
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-black/20 dark:text-white/20">
                    {expandedId === zikr.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                )}

                {zikr.isVerse ? (
                  <QuranVerse text={zikr.text} className="!text-2xl !my-0.5" />
                ) : (
                  <p dir="rtl" className={`text-right text-sm font-bold text-black/80 dark:text-slate-200 leading-relaxed whitespace-pre-wrap ${zikr.reward ? 'pl-8' : ''}`}>
                    {zikr.text}
                  </p>
                )}
                
                {zikr.note && (
                  <p dir="rtl" className="text-right text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-3 font-medium italic">
                    * {zikr.note}
                  </p>
                )}
              </div>

              <div className="px-4 pb-4 flex items-center justify-between gap-3" dir="rtl">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    incrementCount(zikr.id, zikr.count);
                  }}
                  disabled={isDone}
                  className={`flex-1 h-12 rounded-full text-sm font-black transition-all flex items-center justify-center gap-2 ${
                    isDone
                      ? 'bg-emerald-500/10 text-emerald-500 cursor-default'
                      : 'bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 active:scale-[0.95]'
                  }`}
                >
                  {isDone ? 'تم القراءة' : 'ابدأ العد'}
                </button>
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all flex-shrink-0 ${
                  isDone 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {isDone ? <Check size={20} /> : `${currentCount}/${zikr.count}`}
                </div>

                {currentCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetCount(zikr.id);
                    }}
                    className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex flex-shrink-0 items-center justify-center text-black/40 dark:text-white/40 active:bg-red-500/10 active:text-red-500 transition-colors"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {expandedId === zikr.id && zikr.reward && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-6 pt-0" dir="rtl">
                      <div className="bg-emerald-500/5 dark:bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10">
                        <p className="text-xs font-bold text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest mb-2">فضل الذكر</p>
                        <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                          {zikr.reward}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
