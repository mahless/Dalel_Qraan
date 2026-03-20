import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Filter, Bookmark } from 'lucide-react';
import SurahCard from '../components/SurahCard';
import surahsData from '../data/surahs.json';
import { Surah } from '../types/quran';
import { useStore } from '../store/useStore';
import BookmarksModal from '../components/BookmarksModal';

export default function Surahs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const { darkMode } = useStore();
  
  const filteredSurahs = (surahsData as Surah[]).filter(surah => 
    surah.name.toString().includes(searchQuery) || 
    surah.number.toString().includes(searchQuery)
  );

  return (
    <div className="pb-32 pt-32 px-6 max-w-2xl mx-auto">
      <div className="fixed top-8 left-0 right-0 z-50 px-4 py-3">
        <header className="glass rounded-2xl px-4 py-3 flex items-center gap-4 max-w-2xl mx-auto card-shadow">
          <div className="flex-shrink-0 pr-2">
            <h1 className="text-lg font-black text-black dark:text-slate-100 leading-none">سور القرآن</h1>
            <p className="text-[9px] text-black/60 dark:text-slate-400 font-medium mt-1">114 سورة</p>
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
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 py-2 pr-9 pl-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:bg-white dark:focus:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <button 
            onClick={() => setIsBookmarksOpen(true)}
            className="w-10 h-10 flex-shrink-0 rounded-xl bg-primary/10 dark:bg-emerald-500/10 flex items-center justify-center text-primary dark:text-emerald-400 hover:bg-primary/20 active:scale-95 transition-all"
            title="العلامات المرجعية"
          >
            <Bookmark size={20} />
          </button>
        </header>
      </div>

      <BookmarksModal 
        isOpen={isBookmarksOpen} 
        onClose={() => setIsBookmarksOpen(false)} 
      />

      <div className="mt-4"></div>

      <div className="grid grid-cols-1 gap-4">
        {filteredSurahs.map((surah, index) => (
          <SurahCard key={surah.number} surah={surah as Surah} index={index} />
        ))}
        {filteredSurahs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400">لم يتم العثور على نتائج</p>
          </div>
        )}
      </div>
    </div>
  );
}
