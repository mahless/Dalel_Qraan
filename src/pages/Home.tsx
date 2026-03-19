import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ScrollText, Scale, Search, ArrowLeft, Bookmark, Sparkles, Library } from 'lucide-react';
import { useStore } from '../store/useStore';
import surahsData from '../data/surahs.json';
import storiesData from '../data/stories.json';
import BookmarksModal from '../components/BookmarksModal';
import VerseExplanationModal from '../components/VerseExplanationModal';
import ThemeToggle from '../components/ThemeToggle';
import QuranVerse from '../components/QuranVerse';
import { getDailyFeaturedStories, getDailyRotatedStaticVerse } from '../utils/arabicUtils';
import staticTafsirs from '../data/static_tafsirs.json';

const categories = [
  { id: 'surahs', title: 'القرآن', icon: BookOpen, color: 'bg-emerald-500', darkColor: 'dark:bg-emerald-500/20 dark:text-emerald-400', path: '/surahs' },
  { id: 'stories', title: 'القصص', icon: ScrollText, color: 'bg-amber-500', darkColor: 'dark:bg-amber-500/20 dark:text-amber-400', path: '/stories' },
  { id: 'rulings', title: 'الأحكام', icon: Scale, color: 'bg-blue-500', darkColor: 'dark:bg-blue-500/20 dark:text-blue-400', path: '/rulings' },
  { id: 'saved-tafsirs', title: 'المكتبة', icon: Library, color: 'bg-rose-500', darkColor: 'dark:bg-rose-500/20 dark:text-rose-400', path: '/saved-tafsirs' },
];

export default function Home() {
  const { lastReadSurah, darkMode, toggleDarkMode } = useStore();
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [dailyVerseText, setDailyVerseText] = useState("إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ");
  const [dailyVerseInfo, setDailyVerseInfo] = useState("سورة الإسراء - آية ٩");
  
  const lastSurah = lastReadSurah ? (surahsData as any[]).find(s => s.number === lastReadSurah) : null;
  const featuredStories = React.useMemo(() => getDailyFeaturedStories(storiesData), []);
  
  // Deterministic daily rotation from static database
  const dailyVerseData = React.useMemo(() => getDailyRotatedStaticVerse(staticTafsirs), []);

  useEffect(() => {
    if (dailyVerseData) {
      setDailyVerseText(dailyVerseData.text);
      setDailyVerseInfo(`سورة ${dailyVerseData.surah} - آية ${dailyVerseData.ayah_number}`);
    }
  }, [dailyVerseData]);

  return (
    <div className="pb-32 pt-32 px-6 max-w-2xl mx-auto">
      <div className="fixed top-8 left-0 right-0 z-50 px-4 py-3">
        <header className="glass rounded-2xl px-6 py-4 flex items-center justify-between max-w-2xl mx-auto card-shadow">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-black text-primary dark:text-emerald-400">المصحف الشريف</h1>
              <p className="text-[10px] text-black/60 dark:text-slate-400 font-medium">رحلة بين آيات القرآن والقصص</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsBookmarksOpen(true)}
              className="w-10 h-10 rounded-full bg-primary/10 dark:bg-emerald-500/10 flex items-center justify-center text-primary dark:text-emerald-400 hover:bg-primary/20 active:scale-95 transition-all"
              title="العلامات المرجعية"
            >
              <Bookmark size={20} />
            </button>
            <ThemeToggle isDark={darkMode} toggle={toggleDarkMode} />
          </div>
        </header>
      </div>

      <BookmarksModal 
        isOpen={isBookmarksOpen} 
        onClose={() => setIsBookmarksOpen(false)} 
      />

      <VerseExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        verseText={dailyVerseText}
        verseInfo={dailyVerseInfo}
        surahNumber={dailyVerseData?.surah_number || 0}
        ayahNumber={dailyVerseData?.ayah_number || 0}
        surahName={dailyVerseData?.surah || ""}
      />

      <section className="mb-6">
        <div className="glass p-4 rounded-2xl card-shadow mb-6 overflow-hidden relative">
          <div className="relative z-10 flex flex-col items-center w-full">
            <p className="text-[10px] font-bold text-primary dark:text-emerald-400 mb-1">آية اليوم</p>
            <QuranVerse text={dailyVerseText} className="!my-1 !text-2xl" />
            
            <div className="flex items-center justify-between w-full mt-4 px-1">
              <p className="text-[11px] text-black/60 dark:text-slate-400 font-medium">{dailyVerseInfo}</p>
              <button
                onClick={() => setIsExplanationOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 rounded-full text-[11px] font-bold hover:bg-primary/20 dark:hover:bg-emerald-500/20 transition-colors"
              >
                <Sparkles size={14} />
                <span>شرح الآية</span>
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        </div>

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
                className="block glass p-3 rounded-2xl card-shadow group hover:bg-white dark:hover:bg-slate-800/50 transition-all relative overflow-hidden"
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-9 h-9 ${cat.color} ${cat.darkColor} rounded-xl flex items-center justify-center text-white card-shadow group-hover:scale-110 transition-transform`}>
                    <cat.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-black dark:text-slate-100">{cat.title}</h4>
                    <p className="text-[9px] text-black/50 dark:text-slate-500">استكشف</p>
                  </div>
                </div>
                
                {/* Decorative glow */}
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${cat.color}`} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-black dark:text-slate-100">اقتراحات اليوم</h3>
          <Link to="/stories" className="text-primary dark:text-emerald-400 text-sm font-bold">عرض الكل</Link>
        </div>
        <div className="space-y-4">
          {featuredStories.map((story) => (
            <Link 
              key={story.id} 
              to={`/stories/${story.id}`}
              className="glass p-3 rounded-2xl flex items-center gap-3 card-shadow hover:bg-white dark:hover:bg-slate-800/50 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                <ScrollText size={18} />
              </div>
              <div>
                <h4 className="text-base font-bold text-black dark:text-slate-100">{story.title}</h4>
                <p className="text-[9px] text-black/60 dark:text-slate-400 line-clamp-1">{story.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
