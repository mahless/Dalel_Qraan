import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ScrollText, Sparkles, Library, Settings, Heart } from 'lucide-react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';
import { useStore } from '../store/useStore';
import surahsData from '../data/surahs.json';
import storiesData from '../data/stories.json';
import VerseExplanationModal from '../components/VerseExplanationModal';
import SettingsModal from '../components/SettingsModal';
import QuranVerse from '../components/QuranVerse';
import { getDailyFeaturedStories, getDailyRotatedStaticVerse } from '../utils/arabicUtils';
import { formatPeaceBeUponHim } from '../utils/textFormatters';
import staticTafsirs from '../data/static_tafsirs.json';
import hadithDailyData from '../data/hadith/hadith_daily.json';
import QuranWirdCard from '../components/QuranWirdCard';
import AyahNumber from '../components/AyahNumber';
import HadithExplanationModal from '../components/HadithExplanationModal';
import { Quote } from 'lucide-react';

const categories = [
  { id: 'surahs', title: 'القرآن', image: '/images/quran_rehal.png', color: 'bg-emerald-500', darkColor: 'dark:bg-emerald-500/20 dark:text-emerald-400', path: '/surahs' },
  { id: 'stories', title: 'القصص', icon: ScrollText, color: 'bg-amber-500', darkColor: 'dark:bg-amber-500/20 dark:text-amber-400', path: '/stories' },
];

export default function Home() {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isHadithExplanationOpen, setIsHadithExplanationOpen] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ayah' | 'hadith'>('ayah');
  const [dailyVerseText, setDailyVerseText] = useState("إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ");

  const featuredStories = React.useMemo(() => getDailyFeaturedStories(storiesData), []);

  // Deterministic daily rotation from static database
  const dailyVerseData = React.useMemo(() => getDailyRotatedStaticVerse(staticTafsirs), []);

  // Deterministic daily rotation for Hadith
  const dailyHadith = React.useMemo(() => {
    if (hadithDailyData.length === 0) return null;
    const dateStr = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Cairo' });
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
    return hadithDailyData[daysSinceEpoch % hadithDailyData.length];
  }, []);

  useEffect(() => {
    if (dailyVerseData) {
      setDailyVerseText(dailyVerseData.text);
    }
  }, [dailyVerseData]);

  return (
    <div className="pb-32 pt-32 px-2 max-w-2xl mx-auto">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-4 flex items-center justify-between max-w-2xl mx-auto header-green-shadow">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <img src="/icons/ornament.png" alt="Islamic Ornament" className="absolute w-20 h-20 max-w-none object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-primary dark:text-emerald-400 text-shadow-emerald" style={{ fontFamily: 'var(--font-cairo)' }}>المصحف الشريف</h1>
              <p className="text-xs text-black/60 dark:text-slate-400 font-medium">دليلك لرحلة بين آيات القرآن والقصص</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Settings button removed from here as it's now in the bottom nav */}
          </div>
        </header>
      </div>

      <VerseExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        verseText={dailyVerseText}
        surahName={dailyVerseData?.surah || ""}
        ayahNumber={dailyVerseData?.ayah_number || 0}
        explanation={dailyVerseData?.explanation || ""}
      />

      {dailyHadith && (
        <HadithExplanationModal
          isOpen={isHadithExplanationOpen}
          onClose={() => setIsHadithExplanationOpen(false)}
          book={dailyHadith.book}
          chapter={dailyHadith.chapter}
          explanation={dailyHadith.explanation}
        />
      )}



      <section className="mb-6">
        <div className="glass rounded-[2rem] card-shadow mb-6 overflow-hidden relative">
          {/* Modern Tabs */}
          <div className="bg-black/5 dark:bg-white/5 p-1.5 rounded-full flex mx-4 mt-4 relative">
            {[
              { id: 'ayah', label: 'آية اليوم' },
              { id: 'hadith', label: 'حديث اليوم' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'ayah' | 'hadith')}
                className={`relative flex-1 py-1.5 text-xs font-black transition-colors z-10 ${
                  activeTab === tab.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="home-tab-highlight"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-sm border-[.5px] border-emerald-500 z-[-1]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="px-4 py-4 min-h-[140px] flex items-center justify-center">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeTab === 'ayah' ? (
                <div className="flex flex-col items-center w-full">
                  <QuranVerse text={dailyVerseText} center className="!my-0 !text-[26px] !leading-[2.1]" />
                  <div className="flex items-center gap-2 w-full mt-2 px-1 overflow-hidden">
                    <div className="flex items-center gap-1.5 shrink-0 text-black/60 dark:text-slate-400 font-bold" style={{ fontFamily: 'var(--font-quran)' }}>
                      <p className="text-xs mt-1">
                        سورة {dailyVerseData?.surah}
                      </p>
                      <AyahNumber number={dailyVerseData?.ayah_number || 0} size="sm" className="opacity-70 !text-[20px]" />
                    </div>
                    <div className="flex-1" />
                    <button
                      onClick={() => setIsExplanationOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black active:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                    >
                      <Sparkles size={12} />
                      <span>شرح الآية</span>
                    </button>
                  </div>
                </div>
              ) : dailyHadith && (
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                    <Quote size={14} className="text-emerald-500" />
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{dailyHadith.book}</span>
                  </div>
                  <p className="quran-text !text-[22px] !leading-relaxed text-slate-800 dark:text-slate-100 text-center px-2">
                    {dailyHadith.hadith}
                  </p>
                  <div className="flex items-center justify-between w-full mt-4 px-1">
                    <p className="text-xs text-black/60 dark:text-slate-400 font-bold">{dailyHadith.chapter}</p>
                    <button
                      onClick={() => setIsHadithExplanationOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black active:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                    >
                      <Sparkles size={12} />
                      <span>شرح الحديث</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <QuranWirdCard />

        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={cat.path}
                className="block glass p-3 rounded-2xl card-shadow active:bg-white dark:active:bg-slate-800/50 transition-all relative overflow-hidden"
              >
                <div className="flex items-center gap-0.5 relative z-10">
                  <div className={`w-9 h-9 flex items-center justify-center ${cat.image ? '' : cat.darkColor.replace('dark:bg-emerald-500/20', '').replace('dark:bg-amber-500/20', '')} active:scale-110 transition-transform shrink-0`}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.title} className="w-full h-full object-contain" />
                    ) : (
                      cat.icon && <cat.icon size={18} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-bold text-black dark:text-slate-100 truncate whitespace-nowrap">{cat.title}</h4>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Quick Azkar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 * 0.1 }}
            className="rounded-2xl azkar-glow"
          >
            <Link
              to="/library/azkar/quick"
              className="block glass p-3 rounded-2xl card-shadow transition-colors relative overflow-hidden border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-transparent dark:from-emerald-500/20 dark:to-emerald-900/10 active:opacity-80"
            >
              <div className="flex items-center gap-0.5 relative z-10 w-full">
                <div className="w-9 h-9 shrink-0 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <span className="text-lg">⚡</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">أذكار سريعة</h4>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Library Card moved here to swap with Quick Azkar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3 * 0.1 }}
          >
            <Link
              to="/library"
              className="block glass p-3 rounded-2xl card-shadow active:bg-white dark:active:bg-slate-800/50 transition-all relative overflow-hidden"
            >
              <div className="flex items-center gap-0.5 relative z-10">
                <div className="w-9 h-9 flex items-center justify-center text-rose-500 dark:text-rose-400 active:scale-110 transition-transform shrink-0">
                  <Library size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-bold text-black dark:text-slate-100 truncate whitespace-nowrap">المكتبة</h4>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-black dark:text-slate-100">اقتراحات اليوم</h3>
          <Link to="/stories" className="text-primary dark:text-emerald-400 text-sm font-bold">عرض الكل</Link>
        </div>
        <div className="space-y-4">
          {featuredStories.map((story) => (
            <Link
              key={story.id}
              to={`/stories/${story.id}`}
              className="glass p-3 rounded-2xl flex items-center gap-3 card-shadow active:bg-white dark:active:bg-slate-800/50 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                <ScrollText size={18} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-black dark:text-slate-100">{formatPeaceBeUponHim(story.title)}</h4>
                <p className="text-xs text-black/60 dark:text-slate-400 line-clamp-1">{formatPeaceBeUponHim(story.summary)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Developer Credit Button */}
      <section className="mt-8 mb-2 flex flex-col items-center gap-1">
        <button 
          onClick={() => setIsDevModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 opacity-50 hover:opacity-100 active:scale-95 transition-all text-xs font-bold text-slate-500 dark:text-slate-400 mix-blend-luminosity"
        >
          <Heart size={14} className="text-rose-500" />
          <span>القائم على التطبيق</span>
        </button>
        <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 tracking-widest uppercase">
          الاصدار 2.1.0
        </div>
      </section>

      {/* Developer Credit Modal */}
      <AnimatePresence>
        {isDevModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsDevModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass p-8 rounded-[32px] card-shadow max-w-sm w-full text-center overflow-hidden safe-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-black dark:text-white">( العبد الفقير الي الله )</h3>
              <div className="space-y-4 mb-8">
                <p className="text-slate-600 dark:text-slate-300 font-bold leading-normal">
                  هذا العمل صدقة جارية.. نأمل من الله القبول
                </p>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-emerald-700 dark:text-emerald-400 font-black leading-normal">
                    "  بينك وبين الله.. اجعل للقائم على هذا العمل نصيباً من دعائك   "
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDevModalOpen(false)}
                className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 active:scale-95 transition-all text-sm"
              >
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
