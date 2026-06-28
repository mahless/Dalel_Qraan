import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, ArrowRight, BookOpen, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import versesData from '../data/verses_search.json';
import surahsData from '../data/surahs.json';
import { normalizeArabic } from '../utils/arabicUtils';
import QuranVerse from '../components/QuranVerse';

// Build a quick lookup for surah Arabic names
const surahNameMap: Record<number, string> = {};
(surahsData as any[]).forEach((s: any) => {
  surahNameMap[s.number] = s.name;
});

// Pre-normalize all verse texts once for performance
const normalizedVerses = (versesData as any[]).map(v => ({
  ...v,
  surahName: surahNameMap[v.s] || `سورة ${v.s}`,
  normalizedText: normalizeArabic(v.t),
}));

/**
 * Check if a normalized target text contains a query word,
 * trying multiple variants (with/without ال prefix).
 */
const flexibleIncludes = (normalizedTarget: string, word: string): boolean => {
  if (normalizedTarget.includes(word)) return true;
  // Try without "ال" prefix — e.g. user types "الله", text has "لله"
  if (word.startsWith('ال') && word.length > 2) {
    const withoutAl = word.slice(2);
    if (normalizedTarget.includes(withoutAl)) return true;
  }
  // Try adding "ال" prefix — e.g. user types "رحمن", text has "الرحمن"
  if (!word.startsWith('ال')) {
    if (normalizedTarget.includes('ال' + word)) return true;
  }
  return false;
};

/**
 * Multi-word aware Arabic search scoring.
 * All words in the query must be present in the verse.
 * Score is based on how well each word matches.
 */
const getMultiWordScore = (normalizedTarget: string, queryWords: string[]): number => {
  // All words must be found (with flexible matching)
  for (const word of queryWords) {
    if (!flexibleIncludes(normalizedTarget, word)) return 0;
  }
  
  let totalScore = 0;
  const targetWords = normalizedTarget.split(' ');
  
  for (const word of queryWords) {
    // Direct exact word match
    if (targetWords.includes(word)) { totalScore += 100; continue; }
    // Word boundary starts with
    if (targetWords.some(w => w.startsWith(word))) { totalScore += 50; continue; }
    // Full text starts with
    if (normalizedTarget.startsWith(word)) { totalScore += 40; continue; }
    // General contains (direct)
    if (normalizedTarget.includes(word)) { totalScore += 20; continue; }
    // Flexible match (ال variant)
    totalScore += 10;
  }
  
  return totalScore;
};

export default function VerseSearch() {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Split query into individual normalized words
  const queryWords = useMemo(() => {
    const normalized = normalizeArabic(query);
    return normalized.split(' ').filter(w => w.length >= 2);
  }, [query]);

  const results = useMemo(() => {
    if (queryWords.length === 0) return [];
    
    const matched = normalizedVerses
      .map(v => ({
        ...v,
        score: getMultiWordScore(v.normalizedText, queryWords)
      }))
      .filter(v => v.score > 0)
      .sort((a, b) => b.score - a.score);

    return showAll ? matched : matched.slice(0, 30);
  }, [queryWords, showAll]);

  const totalCount = useMemo(() => {
    if (queryWords.length === 0) return 0;
    return normalizedVerses.filter(v => {
      return queryWords.every(word => v.normalizedText.includes(word));
    }).length;
  }, [queryWords]);

  const handleClear = useCallback(() => {
    setQuery('');
    setShowAll(false);
  }, []);

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto min-h-screen">
      {/* Header */}
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-4 flex items-center gap-4 max-w-2xl mx-auto card-shadow">
          <Link 
            to="/search"
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-white active:bg-black/10 dark:active:bg-white/10 transition-colors"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-black text-black dark:text-white leading-none">البحث في الآيات</h1>
            <p className="text-xs text-black/60 dark:text-slate-400 font-medium mt-1">
              ابحث في جميع آيات القرآن الكريم
            </p>
          </div>
        </header>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <SearchIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="اكتب كلمة أو جزء من آية..."
            value={query}
            onChange={e => { setQuery(e.target.value); setShowAll(false); }}
            className="w-full pr-12 pl-12 py-4 rounded-2xl glass card-shadow text-right text-black dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-emerald-500/30 text-lg font-medium"
            autoFocus
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center"
            >
              <X size={12} className="text-black/60 dark:text-white/60" />
            </button>
          )}
        </div>
        {queryWords.length > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
            تم العثور على <span className="font-bold text-primary dark:text-emerald-400">{totalCount}</span> نتيجة
          </p>
        )}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {results.map((v: any, idx: number) => (
              <motion.div
                key={`${v.s}-${v.v}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx, 10) * 0.02 }}
              >
                <Link
                  to={`/surahs/${v.s}?v=${v.v}`}
                  className="block glass rounded-2xl card-shadow overflow-hidden active:border-primary/20 dark:active:border-emerald-500/20 border border-transparent transition-all group"
                >
                  {/* Surah info bar */}
                  <div className="px-4 py-2 bg-primary/5 dark:bg-emerald-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen size={12} className="text-primary dark:text-emerald-400" />
                      <span className="text-xs font-bold text-primary dark:text-emerald-400" style={{ fontFamily: 'var(--font-quran)' }}>
                        سورة {v.surahName}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      آية {v.v}
                    </span>
                  </div>
                  {/* Verse text */}
                  <div className="px-4 py-3">
                    <QuranVerse 
                      text={v.t} 
                      className="!my-0 !text-lg !leading-loose text-black/90 dark:text-white/90 active:text-primary dark:active:text-emerald-400 transition-colors" 
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {/* Show more button */}
            {!showAll && totalCount > 30 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowAll(true)}
                className="w-full py-3 rounded-2xl glass card-shadow text-lg font-bold text-primary dark:text-emerald-400 active:bg-primary/5 dark:active:bg-emerald-500/5 transition-colors"
              >
                عرض جميع النتائج ({totalCount})
              </motion.button>
            )}
          </motion.div>
        ) : queryWords.length > 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-slate-400 dark:text-slate-500">لا توجد آيات مطابقة لبحثك</p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 opacity-20 dark:opacity-10 dark:text-slate-100"
          >
            <BookOpen size={80} className="mx-auto mb-4" />
            <p>ابدأ بكتابة كلمة للبحث في آيات القرآن</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
