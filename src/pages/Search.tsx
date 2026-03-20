import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Book, ScrollText, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import surahsData from '../data/surahs.json';
import storiesData from '../data/stories.json';
import rulingsData from '../data/rulings.json';
import versesData from '../data/verses_search.json';
import { useStore } from '../store/useStore';
import { arabicIncludes } from '../utils/arabicUtils';

export default function Search() {
  const { searchQuery, setSearchQuery } = useStore();

  const results = {
    surahs: (surahsData as any[]).filter(s => arabicIncludes(s.name, searchQuery)),
    stories: storiesData.filter(s => arabicIncludes(s.title, searchQuery) || arabicIncludes(s.summary, searchQuery)),
    rulings: rulingsData.filter(r => arabicIncludes(r.title, searchQuery) || arabicIncludes((r as any).summary, searchQuery)),
    verses: (versesData as any[]).filter(v => arabicIncludes(v.t, searchQuery)).slice(0, 50), // Limit to 50 results for performance
  };

  const hasResults = searchQuery.length > 1 && (
    results.surahs.length > 0 || 
    results.stories.length > 0 || 
    results.rulings.length > 0 ||
    results.verses.length > 0
  );

  return (
    <div className="pb-32 pt-32 px-6 max-w-2xl mx-auto">
      <div className="fixed top-8 left-0 right-0 z-50 px-4 py-3">
        <header className="glass rounded-2xl px-6 py-4 flex items-center justify-between max-w-2xl mx-auto card-shadow">
          <div>
            <h1 className="text-xl font-black text-black dark:text-slate-100">البحث الشامل</h1>
            <p className="text-[10px] text-black/60 dark:text-slate-400 font-medium">ابحث في السور، الآيات، والقصص</p>
          </div>
        </header>
      </div>

      <div className="relative mb-8 mt-4">
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <SearchIcon size={20} />
        </div>
        <input
          type="text"
          placeholder="اكتب ما تبحث عنه..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full glass py-5 pr-12 pl-12 rounded-3xl card-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg dark:text-slate-100 dark:focus:bg-slate-800/80"
        />
        <AnimatePresence>
          {searchQuery.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 left-4 flex items-center text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-emerald-400 transition-colors"
              title="مسح البحث"
            >
              <X size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {hasResults ? (
        <div className="space-y-8">
          {results.surahs.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Book size={16} /> السور
              </h3>
              <div className="grid gap-3">
                {results.surahs.map(s => (
                  <Link key={s.number} to={`/surahs/${s.number}`} className="glass p-4 rounded-2xl card-shadow block font-bold text-black dark:text-slate-200 hover:text-primary dark:hover:text-emerald-400 transition-colors">
                    سورة {s.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.stories.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ScrollText size={16} /> القصص
              </h3>
              <div className="grid gap-3">
                {results.stories.map(s => (
                  <Link key={s.id} to={`/stories/${s.id}`} className="glass p-4 rounded-2xl card-shadow block font-bold text-black dark:text-slate-200 hover:text-primary dark:hover:text-emerald-400 transition-colors">
                    {s.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.verses.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Book size={16} /> الآيات القرآنية
              </h3>
              <div className="grid gap-4">
                {results.verses.map((v, idx) => (
                  <Link 
                    key={`${v.s}-${v.v}-${idx}`} 
                    to={`/surahs/${v.s}?v=${v.v}`} 
                    className="glass p-6 rounded-2xl card-shadow block hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-lg dark:bg-emerald-400/10 dark:text-emerald-400">
                        سورة {v.n} - آية {v.v}
                      </span>
                    </div>
                    <p className="text-xl font-quran leading-relaxed text-slate-800 dark:text-slate-100 text-right group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors">
                      {v.t}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : searchQuery.length > 1 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 dark:text-slate-500">لا توجد نتائج مطابقة لبحثك</p>
        </div>
      ) : (
        <div className="text-center py-20 opacity-20 dark:opacity-10 dark:text-slate-100">
          <SearchIcon size={80} className="mx-auto mb-4" />
          <p>ابدأ الكتابة للبحث</p>
        </div>
      )}
    </div>
  );
}
