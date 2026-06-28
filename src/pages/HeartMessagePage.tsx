import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Share2, ArrowRight, Heart, Sparkles, BookOpenText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import dailyData from '../data/daily_data.json';

interface MessageContent {
  verse: string;
  surah: string;
  adhkar: string[];
}

interface DayContent {
  day: number;
  morning: MessageContent;
  evening: MessageContent;
  motivation: string;
}

export default function HeartMessagePage() {
  const navigate = useNavigate();
  const [isOpened, setIsOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("جاري تجهيز شيء يسعدك ويريح قلبك...");
  const [displayData, setDisplayData] = useState<any>(null);

  useEffect(() => {
    checkLastOpened();
  }, []);

  const checkLastOpened = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { value } = await Preferences.get({ key: 'last_opened_date' });
    
    if (value === today) {
      setIsOpened(true);
      prepareData();
    }
  };

  const prepareData = () => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const isFriday = now.getDay() === 5;
    const isMorning = now.getHours() < 17;

    const dayData = dailyData.monthly_content.find(d => d.day === dayOfMonth) || dailyData.monthly_content[0];
    const periodData = isMorning ? dayData.morning : dayData.evening;

    let combinedAdhkar = [...periodData.adhkar];
    let combinedVerses = [periodData.verse];

    if (isFriday) {
      combinedAdhkar = [...combinedAdhkar, ...dailyData.friday_special.adhkar];
      combinedVerses = [...combinedVerses, ...dailyData.friday_special.verses];
    }

    setDisplayData({
      verse: periodData.verse,
      surah: periodData.surah,
      adhkar: combinedAdhkar.slice(0, 5), // Limit to 5 for UI clarity
      motivation: dayData.motivation,
      isFriday,
      fridayReminder: isFriday ? dailyData.friday_special.reminder : null
    });
  };

  const handleDiscover = async () => {
    // Trigger Haptics
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      console.warn('Haptics not supported');
    }

    setLoading(true);
    
    // Simulate loading for 3 seconds as requested
    setTimeout(async () => {
      const today = new Date().toISOString().split('T')[0];
      await Preferences.set({ key: 'last_opened_date', value: today });
      
      prepareData();
      setLoading(false);
      setIsOpened(true);
    }, 4000);
  };

  const handleShare = async () => {
    if (!displayData) return;

    const shareText = `💌 رسالة لقلبك اليوم:\n\n📖 قال تعالى: "${displayData.verse}" [سورة ${displayData.surah}]\n\n✨ ${displayData.motivation}\n\n📱 تم الإرسال عبر تطبيق دليل القرآن`;
    
    try {
      await Share.share({
        title: 'رسالة لقلبك',
        text: shareText,
        dialogTitle: 'شارك الرسالة مع من تحب',
      });
    } catch (e) {
      console.error('Error sharing', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-dark-bg transition-colors duration-500 pb-40">
      {/* Header */}
      <div className="fixed top-12 left-0 right-0 z-40 px-2.5 py-4 bg-[#FDFBF7]/85 dark:bg-dark-bg/85 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
          >
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">رسالة لقلبك</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="pt-32 px-2.5 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!isOpened && !loading && (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center pt-4 pb-20 text-center"
            >
              <div className="w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Mail size={48} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4">لديك رسالة خاصة تنتظرك</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
                شيء ما تم اختياره ليناسب قلبك في هذه اللحظة، هل أنت مستعد؟
              </p>
              
              <button
                onClick={handleDiscover}
                className="w-full py-5 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 rounded-3xl font-black text-lg shadow-[0_0_25px_rgba(16,185,129,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span>اكتشف ماذا يحتاج قلبك الآن</span>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Heart size={24} className="text-red-500" fill="currentColor" />
                </motion.div>
              </button>
            </motion.div>
          )}

          {loading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="relative mb-12">
                {/* Pulse Animation */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.2, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-emerald-400 dark:bg-emerald-500 rounded-full blur-2xl"
                />
                <div className="relative w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Heart size={36} className="text-red-500" fill="currentColor" />
                  </motion.div>
                </div>
              </div>
              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-lg font-bold text-slate-700 dark:text-slate-200"
              >
                {loadingText}
              </motion.p>
            </motion.div>
          )}

          {isOpened && displayData && (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-6"
            >
              {/* Status Message for already opened */}
              <div className="mb-6 text-center">
                <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-100 dark:border-emerald-800">
                    هذه رسالتك اليوم، استمتع بنورها.
                </span>
              </div>

              {/* Main Card - Glassmorphism */}
              <div className="glass p-5 rounded-[2.5rem] card-shadow border border-white/20 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-400/10 rounded-bl-[100px] -mr-8 -mt-8" />
                
                {/* Verse Section */}
                <div className="text-center mb-6">
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <div className="h-[1px] w-8 bg-emerald-500/20" />
                    <Sparkles size={16} className="text-emerald-500" />
                    <div className="h-[1px] w-8 bg-emerald-500/20" />
                  </div>
                  <h3 
                    className="quran-text-center text-3xl leading-[2.1] text-slate-800 dark:text-emerald-50 mb-4"
                    style={{ fontFamily: 'var(--font-quran)' }}
                  >
                    {displayData.verse}
                  </h3>
                  <div className="inline-block px-4 py-1.5 bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-black">
                    سورة {displayData.surah}
                  </div>
                </div>

                {/* Adhkar Section */}
                <div className="mb-6 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 pr-1">أذكار مريحة للقلب</h4>
                  {displayData.adhkar.map((dhikr: string, idx: number) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      key={idx}
                      className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{dhikr}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Motivation Section */}
                <div className="p-4 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-3xl border border-emerald-500/10 dark:border-emerald-400/10 mb-5">
                  <p className="text-slate-600 dark:text-slate-300 text-center font-medium leading-relaxed">
                    " {displayData.motivation} "
                  </p>
                </div>

                {/* Friday Special Reminder */}
                {displayData.isFriday && (
                   <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800/50 mb-5 text-center">
                    <p className="text-amber-700 dark:text-amber-400 text-sm font-black flex items-center justify-center gap-2">
                       {displayData.fridayReminder}
                    </p>
                   </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-grow py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <Share2 size={20} />
                    <span>مشاركة الرسالة</span>
                  </button>
                </div>
              </div>
              
              <div className="mt-8 text-center text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                تم اختيار هذه الرسالة لقلبك بعناية
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
