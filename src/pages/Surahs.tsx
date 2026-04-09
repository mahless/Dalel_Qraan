import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Filter, LayoutGrid, Layers } from 'lucide-react';
import SurahCard from '../components/SurahCard';
import surahsData from '../data/surahs.json';
import juzMapping from '../data/juz_mapping.json';
import { Surah } from '../types/quran';
import { useStore } from '../store/useStore';
import { normalizeArabic } from '../utils/arabicUtils';
import AyahNumber from '../components/AyahNumber';
import { Link } from 'react-router-dom';

const JUZ_WORDS: Record<number, string> = {
  1:  'الأول',  2: 'الثاني',   3: 'الثالث',
  4:  'الرابع',  5: 'الخامس',  6: 'السادس',
  7:  'السابع',  8: 'الثامن',  9: 'التاسع',
  10: 'العاشر',  11: 'الحادي عشر', 12: 'الثاني عشر',
  13: 'الثالث عشر', 14: 'الرابع عشر', 15: 'الخامس عشر',
  16: 'السادس عشر', 17: 'السابع عشر', 18: 'الثامن عشر',
  19: 'التاسع عشر', 20: 'العشرون',  21: 'الحادي والعشرون',
  22: 'الثاني والعشرون', 23: 'الثالث والعشرون', 24: 'الرابع والعشرون',
  25: 'الخامس والعشرون', 26: 'السادس والعشرون', 27: 'السابع والعشرون',
  28: 'الثامن والعشرون', 29: 'التاسع والعشرون', 30: 'الثلاثون'
};

export default function Surahs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'surah' | 'juz'>('surah');
  const { theme } = useStore();
  
  const normalizedQuery = normalizeArabic(searchQuery);
  const filteredSurahs = (surahsData as Surah[]).filter(surah => {
    const normalizedName = normalizeArabic(surah.name.toString());
    return normalizedName.includes(normalizedQuery) || 
           surah.number.toString().includes(searchQuery);
  });

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-3 flex items-center gap-4 max-w-2xl mx-auto card-shadow">
          <div className="flex-shrink-0 pr-2">
            <h1 className="text-lg font-black text-black dark:text-slate-100 leading-none">سور القرآن</h1>
            <p className="text-xs text-black/60 dark:text-slate-400 font-medium mt-1">114 سورة</p>
          </div>
          
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <SearchIcon size={16} />
            </div>
            <input
              type="text"
              placeholder="ابحث عن سورة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 py-2 pr-9 pl-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:bg-white dark:focus:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </header>
      </div>

      <div className="mt-4"></div>

      <div className="mt-4 mb-6">
        <div className="glass p-1.5 rounded-2xl flex items-center gap-1.5 card-shadow max-w-xs mx-auto">
          {[
            { id: 'surah', label: 'السور', icon: LayoutGrid },
            { id: 'juz', label: 'الأجزاء', icon: Layers }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 relative py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === tab.id 
                ? 'text-primary dark:text-emerald-400 font-black' 
                : 'text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 dark:bg-emerald-500/10 rounded-xl border border-primary/20 dark:border-emerald-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon size={18} className="relative z-10" />
              <span className="text-sm relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'surah' ? (
          <motion.div 
            key="surah-grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 gap-4"
          >
            {filteredSurahs.map((surah, index) => (
              <SurahCard key={surah.number} surah={surah as Surah} index={index} />
            ))}
            {filteredSurahs.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-400">لم يتم العثور على نتائج</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="juz-grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 gap-3"
          >
            {juzMapping.map((juz, index) => {
              const startSurah = (surahsData as any[]).find(s => s.number === juz.surah);
              return (
                <motion.div
                  key={juz.juz}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link
                    to={`/surahs/${juz.surah}?v=${juz.ayah}`}
                    className="block glass p-2 rounded-2xl card-shadow active:scale-[0.98] transition-all border border-transparent active:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AyahNumber number={juz.juz} size="md" />
                        <div>
                          <h3 className="text-2xl font-black text-black dark:text-slate-100 flex items-center gap-2" style={{ fontFamily: 'var(--font-quran)' }}>
                            الجزء {JUZ_WORDS[juz.juz] || juz.juz}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            بدايةً من سورة {startSurah?.name || ''} (آية {juz.ayah})
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/5 dark:bg-emerald-500/5 flex items-center justify-center text-primary dark:text-emerald-400">
                        <Layers size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
