import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Book, ScrollText, X, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import surahsData from '../data/surahs.json';
import storiesData from '../data/stories.json';
import rulingsData from '../data/rulings.json';
import versesData from '../data/verses_search.json';
import azkarData from '../data/azkar.json';
import prophetData from '../data/prophet_muhammad.json';
import staticTafsirsData from '../data/static_tafsirs.json';
import { useStore } from '../store/useStore';
import { getArabicMatchScore } from '../utils/arabicUtils';

export default function Search() {
  const { searchQuery, setSearchQuery } = useStore();

  const results = {
    surahs: (surahsData as any[])
      .map(s => ({ ...s, score: getArabicMatchScore(s.name, searchQuery) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score),
      
    stories: storiesData
      .map(s => ({ 
        ...s, 
        score: Math.max(
          getArabicMatchScore(s.title, searchQuery) * 2,
          getArabicMatchScore(s.summary, searchQuery)
        ) 
      }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score),
      
    rulings: rulingsData
      .map(r => ({ 
        ...r, 
        score: Math.max(
          getArabicMatchScore(r.title, searchQuery) * 2,
          getArabicMatchScore((r as any).summary, searchQuery)
        ) 
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score),
      
    azkar: Object.entries(azkarData).flatMap(([categoryId, items]) => 
      items.map((item: any) => ({
        ...item,
        categoryId,
        score: Math.max(
          getArabicMatchScore(item.title, searchQuery) * 2,
          getArabicMatchScore(item.text, searchQuery)
        )
      }))
      .filter(item => item.score > 0)
    ).sort((a, b) => b.score - a.score),
    
    prophet: prophetData.sections.flatMap(section => 
      section.topics.map(topic => ({
        ...topic,
        score: Math.max(
          getArabicMatchScore(topic.title, searchQuery) * 2,
          getArabicMatchScore(topic.content, searchQuery)
        )
      }))
      .filter(topic => topic.score > 0)
    ).sort((a, b) => b.score - a.score),
    
    tafsirs: staticTafsirsData
      .map(t => ({
        ...t,
        score: Math.max(
          getArabicMatchScore(t.text, searchQuery) * 2,
          getArabicMatchScore(t.explanation, searchQuery)
        )
      }))
      .filter(t => t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10),
  };

  const hasResults = searchQuery.length > 1 && (
    results.surahs.length > 0 || 
    results.stories.length > 0 || 
    results.rulings.length > 0 ||
    results.azkar.length > 0 ||
    results.prophet.length > 0 ||
    results.tafsirs.length > 0
  );

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-4 flex items-center justify-between max-w-2xl mx-auto card-shadow">
          <div>
            <h1 className="text-lg font-black text-black dark:text-slate-100">البحث الشامل</h1>
            <p className="text-xs text-black/60 dark:text-slate-400 font-medium">ابحث في السور، الآيات، والقصص</p>
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
              className="absolute inset-y-0 left-4 flex items-center text-slate-400 active:text-primary dark:text-slate-500 dark:active:text-emerald-400 transition-colors"
              title="مسح البحث"
            >
              <X size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Access to Verse Search */}
      <Link
        to="/verse-search"
        className="block mb-6 glass rounded-2xl card-shadow p-4 border border-primary/10 dark:border-emerald-500/10 active:border-primary/30 dark:active:border-emerald-500/30 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-emerald-500/10 flex items-center justify-center">
              <BookOpen size={18} className="text-primary dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">البحث في الآيات</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">ابحث في جميع آيات القرآن الكريم</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 rounded-full text-xs font-black border border-primary/20 dark:border-emerald-500/20 active:scale-95 transition-all">
            <span>ابدأ البحث</span>
            <ArrowRight size={14} className="rotate-180" />
          </div>
        </div>
      </Link>


      {hasResults ? (
        <div className="space-y-8">
          {results.surahs.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Book size={16} /> السور
              </h3>
              <div className="grid gap-3">
                {results.surahs.map(s => (
                  <Link key={s.number} to={`/surahs/${s.number}`} className="glass p-4 rounded-2xl card-shadow block font-bold text-black dark:text-slate-200 active:text-primary dark:active:text-emerald-400 transition-colors" style={{ fontFamily: 'var(--font-quran)' }}>
                    سورة {s.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.stories.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ScrollText size={16} /> القصص
              </h3>
              <div className="grid gap-3">
                {results.stories.map(s => (
                  <Link key={s.id} to={`/stories/${s.id}`} className="glass p-4 rounded-2xl card-shadow block font-bold text-black dark:text-slate-200 active:text-primary dark:active:text-emerald-400 transition-colors">
                    {s.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.azkar.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Book size={16} /> الأذكار
              </h3>
              <div className="grid gap-3">
                {results.azkar.map((a: any) => (
                  <Link key={`azkar-${a.categoryId}-${a.id}`} to={`/library/azkar/${a.categoryId}`} className="glass p-4 rounded-2xl card-shadow block font-bold text-black dark:text-slate-200 active:text-primary dark:active:text-emerald-400 transition-colors">
                    <div className="text-lg">{a.title}</div>
                    <p className="text-xs text-slate-500 font-normal mt-1 line-clamp-1">{a.text}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.prophet.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Book size={16} /> السيرة النبوية
              </h3>
              <div className="grid gap-3">
                {results.prophet.map((p: any, idx: number) => (
                  <Link key={`prophet-${idx}`} to={`/library/prophet-muhammad`} className="glass p-4 rounded-2xl card-shadow block font-bold text-black dark:text-slate-200 active:text-primary dark:active:text-emerald-400 transition-colors">
                    <div className="text-lg">{p.title}</div>
                    <p className="text-xs text-slate-500 font-normal mt-1 line-clamp-1">{p.content}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.tafsirs.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Book size={16} /> التفسير
              </h3>
              <div className="grid gap-3">
                {results.tafsirs.map((t: any, idx: number) => (
                  <Link key={`tafsir-${idx}`} to={`/library/static-tafsirs`} className="glass p-4 rounded-2xl card-shadow block font-bold text-black dark:text-slate-200 active:text-primary dark:active:text-emerald-400 transition-colors">
                    <div className="text-lg" style={{ fontFamily: 'var(--font-quran)' }}>تفسير {t.surah} - آية {t.ayah_number}</div>
                    <p className="text-xs text-slate-500 font-normal mt-1 line-clamp-1">{t.explanation}</p>
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
