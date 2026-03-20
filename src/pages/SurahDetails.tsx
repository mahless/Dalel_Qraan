import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Settings, Share2, Type, Eye, EyeOff, Bookmark, BookmarkCheck, Search, X } from 'lucide-react';
import surahsData from '../data/surahs.json';
import storiesData from '../data/stories.json';
import juzMapping from '../data/juz_mapping.json';
import { Surah, Verse } from '../types/quran';
import { useStore } from '../store/useStore';
import { arabicIncludes } from '../utils/arabicUtils';

export default function SurahDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fontSize, setFontSize, setLastReadSurah, addBookmark, removeBookmark, bookmarks } = useStore();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const verseRange = queryParams.get('verses');
  const targetVerse = queryParams.get('v');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const surahMetadata = (surahsData as any[]).find(s => 
    s.number === Number(id) || s.name === id
  );
  const nextSurah = (surahsData as any[]).find(s => s.number === (surahMetadata?.number || 0) + 1);
  const relatedStories = (storiesData as any[]).filter(story => 
    story.references.some((ref: any) => {
      if (typeof ref.surah === 'number') return ref.surah === Number(id);
      return ref.surah === surahMetadata?.name;
    })
  );

  const isBookmarked = useMemo(() => 
    bookmarks.some(b => b.surahId === Number(id) && !b.verseNumber && !b.juzNumber),
    [bookmarks, id]
  );

  const toggleBookmark = () => {
    if (isBookmarked) {
      const bookmark = bookmarks.find(b => b.surahId === Number(id) && !b.verseNumber && !b.juzNumber);
      if (bookmark) removeBookmark(bookmark.id);
    } else if (surahMetadata) {
      addBookmark({
        surahId: surahMetadata.number,
        surahName: surahMetadata.name
      });
    }
  };

  const toggleVerseBookmark = (verseNumber: number) => {
    const bookmark = bookmarks.find(b => b.surahId === Number(id) && b.verseNumber === verseNumber && !b.juzNumber);
    if (bookmark) {
      removeBookmark(bookmark.id);
    } else if (surahMetadata) {
      addBookmark({
        surahId: surahMetadata.number,
        surahName: surahMetadata.name,
        verseNumber
      });
    }
  };

  const isVerseBookmarked = (verseNumber: number) => {
    return bookmarks.some(b => b.surahId === Number(id) && b.verseNumber === verseNumber && !b.juzNumber);
  };

  const toggleJuzBookmark = (juzNumber: number, verseNumber: number) => {
    const bookmark = bookmarks.find(b => b.juzNumber === juzNumber);
    if (bookmark) {
      removeBookmark(bookmark.id);
    } else if (surahMetadata) {
      addBookmark({
        surahId: surahMetadata.number,
        surahName: surahMetadata.name,
        verseNumber,
        juzNumber
      });
    }
  };

  const isJuzBookmarked = (juzNumber: number) => {
    return bookmarks.some(b => b.juzNumber === juzNumber);
  };

  useEffect(() => {
    if (verseRange) {
      setIsFocusMode(true);
    } else {
      setIsFocusMode(false);
    }
  }, [verseRange]);

  useEffect(() => {
    if (surahMetadata) {
      setLastReadSurah(surahMetadata.number);
      window.scrollTo(0, 0);
      
      const loadVerses = async () => {
        try {
          setLoading(true);
          const response = await import(`../data/quran/surah_${surahMetadata.number}.json`);
          const data = response.default;
          
          const verseArray: Verse[] = Object.entries(data.verse).map(([key, text]) => ({
            number: parseInt(key.replace('verse_', '')),
            text: text as string
          })).sort((a, b) => a.number - b.number);
          
          setVerses(verseArray);
        } catch (error) {
          console.error('Error loading surah verses:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadVerses();
    }
  }, [id, surahMetadata, setLastReadSurah]);

  const isInRange = (num: number, rangeStr: string | null) => {
    if (!rangeStr) return true;
    const parts = rangeStr.split('-');
    const start = parseInt(parts[0]);
    const end = parts.length > 1 ? parseInt(parts[1]) : start;
    return num >= start && num <= end;
  };

  const displayedVerses = useMemo(() => {
    let filtered = verses;
    if (isFocusMode && verseRange) {
      filtered = filtered.filter(v => isInRange(v.number, verseRange));
    }
    if (localSearchQuery.length > 1) {
      filtered = filtered.filter(v => arabicIncludes(v.text, localSearchQuery));
    }
    return filtered;
  }, [verses, isFocusMode, verseRange, localSearchQuery]);

  const isLastAyahShort = useMemo(() => {
    if (displayedVerses.length === 0 || isFocusMode || localSearchQuery.length > 1) return false;
    const lastVerse = displayedVerses[displayedVerses.length - 1];
    // A Surah usually has verses.length as its last verse number (or verses.length - 1 if 0-indexed)
    // Actually, surahMetadata.versesCount is the total.
    if (lastVerse.number !== surahMetadata.versesCount) return false;
    return lastVerse.text.length < 50;
  }, [displayedVerses, isFocusMode, localSearchQuery, surahMetadata]);

  if (!surahMetadata) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-slate-500 mb-4">السورة غير موجودة</p>
        <button onClick={() => navigate('/surahs')} className="text-primary font-bold">العودة للقائمة</button>
      </div>
    );
  }

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (isFocusMode) {
      // If we are turning off focus mode, we might want to scroll to the verse
      setTimeout(() => {
        const firstVerse = verseRange?.split('-')[0];
        if (firstVerse) {
          const element = document.getElementById(`verse-${firstVerse}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  };

  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

  useEffect(() => {
    setHasInitialScrolled(false);
  }, [id]);

  useEffect(() => {
    if (!loading && !hasInitialScrolled) {
      let verseToScrollTo = targetVerse;
      
      // If no target verse and no specific range, check for a bookmarked verse
      if (!verseToScrollTo && !verseRange) {
        const bookmark = bookmarks.find(b => b.surahId === Number(id) && b.verseNumber);
        if (bookmark) {
          verseToScrollTo = bookmark.verseNumber.toString();
        }
      }

      if (verseToScrollTo) {
        setTimeout(() => {
          const element = document.getElementById(`verse-${verseToScrollTo}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect
            element.classList.add('bg-primary/20', 'dark:bg-emerald-400/20', 'rounded-lg', 'px-1', 'py-0.5');
            setTimeout(() => {
              element.classList.remove('bg-primary/20', 'dark:bg-emerald-400/20', 'rounded-lg', 'px-1', 'py-0.5');
            }, 3000);
          }
        }, 300);
      } else if (verseRange && !isFocusMode) {
        setTimeout(() => {
          const firstVerse = verseRange.split('-')[0];
          const element = document.getElementById(`verse-${firstVerse}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
      
      setHasInitialScrolled(true);
    }
  }, [loading, hasInitialScrolled, targetVerse, verseRange, bookmarks, id, isFocusMode]);

  return (
    <div className="pb-20 pt-32 px-3 max-w-2xl mx-auto">
      <AnimatePresence>
        {isHeaderVisible && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-8 left-0 right-0 z-50 px-4 py-3"
          >
            <nav className="glass rounded-2xl px-4 py-3 flex items-center justify-between max-w-2xl mx-auto card-shadow">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowRight size={20} />
              </button>
              
              <div className="flex flex-col items-center">
                <h2 className="text-sm font-bold text-black dark:text-slate-100 truncate">سورة {surahMetadata.name}</h2>
                <span className="text-[10px] text-black/60 dark:text-slate-400 font-medium">
                  {isFocusMode ? `الآيات المحددة (${verseRange})` : 'قراءة متواصلة'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleBookmark}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isBookmarked ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title={isBookmarked ? "إزالة العلامة المرجعية" : "إضافة علامة مرجعية"}
                >
                  {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                </button>
                {verseRange && (
                  <button
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isFocusMode ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                    title={isFocusMode ? "عرض السورة كاملة" : "عرض الآيات المحددة فقط"}
                  >
                    {isFocusMode ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                )}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isSearchOpen ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200'
                    }`}
                    title="بحث في السورة"
                  >
                    <Search size={16} />
                  </button>
                  <button 
                    onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all"
                    title="تصغير الخط"
                  >
                    <span className="text-[10px] font-bold">A-</span>
                  </button>
                  <button 
                    onClick={() => setFontSize(Math.min(48, fontSize + 2))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all"
                    title="تكبير الخط"
                  >
                    <span className="text-xs font-bold">A+</span>
                  </button>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="relative">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="ابحث عن كلمة أو آية في هذه السورة..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full glass py-4 pr-12 pl-12 rounded-2xl card-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg dark:text-slate-100"
                autoFocus
              />
              {localSearchQuery && (
                <button
                  onClick={() => setLocalSearchQuery('')}
                  className="absolute inset-y-0 left-4 flex items-center text-slate-400 hover:text-primary"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {localSearchQuery.length > 1 && (
              <p className="text-[10px] text-slate-400 mt-2 mr-2">
                تم العثور على {displayedVerses.length} آية
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass p-3 rounded-2xl card-shadow mb-6 flex items-center gap-4 bg-emerald-50/30 dark:bg-emerald-500/5"
      >
        <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-primary dark:bg-emerald-500 text-white flex items-center justify-center text-xl font-bold card-shadow">
          {surahMetadata.number}
        </div>
        <div className="text-right">
          <h1 className="text-xl font-black text-primary dark:text-emerald-400">{surahMetadata.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            {surahMetadata.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surahMetadata.versesCount} آية
          </p>
        </div>
      </motion.div>

      {relatedStories.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">قصص مرتبطة</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {relatedStories.map(story => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className="flex-shrink-0 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-sm font-bold border border-amber-100 dark:border-amber-500/20"
              >
                {story.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={isFocusMode ? 'focus' : 'full'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass px-2 py-8 rounded-3xl card-shadow mb-4 text-center"
          >
            {isFocusMode && verseRange && (
              <div className="mb-6 flex flex-col items-center gap-3">
                <div className="py-2 px-4 bg-primary/5 rounded-xl inline-block">
                  <p className="text-xs font-bold text-primary">عرض الآيات المتعلقة بالقصة فقط</p>
                </div>
                <button 
                  onClick={toggleFocusMode}
                  className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors underline underline-offset-4"
                >
                  عرض السورة كاملة
                </button>
              </div>
            )}
            
            {!isFocusMode && verseRange && (
              <div className="mb-6">
                <button 
                  onClick={toggleFocusMode}
                  className="py-2 px-4 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all"
                >
                  العودة لوضع التركيز (الآيات المختارة)
                </button>
              </div>
            )}
            
            <div 
              className="quran-text leading-[2.2] space-x-reverse"
              style={{ 
                fontSize: `${fontSize}px`, 
                textAlignLast: isLastAyahShort ? 'center' : 'justify',
                textJustify: isLastAyahShort ? 'none' : 'inter-word'
              }}
            >
              {/* Juz indicator if it starts at the beginning of the Surah */}
              {!isFocusMode && (() => {
                const juz = juzMapping.find(j => j.surah === surahMetadata.number && (j.ayah === 1 || j.ayah === 0));
                if (!juz) return null;
                const bookmarked = isJuzBookmarked(juz.juz);
                return (
                  <div className="w-full flex items-center justify-center mb-6">
                    <div className="h-[1px] bg-amber-500/20 flex-grow"></div>
                    <button 
                      onClick={() => toggleJuzBookmark(juz.juz, 1)}
                      className={`mx-6 px-6 py-2 rounded-full border-2 transition-all font-black text-sm tracking-widest flex items-center gap-3 ${
                        bookmarked 
                          ? 'border-amber-500 bg-amber-500 text-white shadow-md' 
                          : 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                      }`}
                      title={bookmarked ? "إزالة العلامة المرجعية للجزء" : "حفظ الجزء كعلامة مرجعية"}
                    >
                      <span className="opacity-50 text-xs">۞</span>
                      الجزء {juz.juz}
                      {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      <span className="opacity-50 text-xs">۞</span>
                    </button>
                    <div className="h-[1px] bg-amber-500/20 flex-grow"></div>
                  </div>
                );
              })()}

              {/* Basmala handling */}
              {!isFocusMode && surahMetadata.number !== 9 && (
                <div className="mb-4 quran-text-center border-b border-primary/10 pb-3">
                  {surahMetadata.number === 1 ? (
                    <span className="quran-text block text-3xl mb-2 font-black text-primary dark:text-emerald-400">
                      {verses.find(v => v.number === 1)?.text}
                    </span>
                  ) : (
                    <span className="quran-text block text-3xl mb-2 font-black text-primary dark:text-emerald-400">
                      {verses.find(v => v.number === 0)?.text || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
                    </span>
                  )}
                </div>
              )}

              {displayedVerses
                .filter(v => {
                  if (isFocusMode) return true;
                  if (surahMetadata.number === 1) return v.number !== 1;
                  return v.number !== 0;
                })
                .map((verse) => {
                  const juz = juzMapping.find(j => j.surah === surahMetadata.number && j.ayah === verse.number && j.ayah > 1);
                  
                  return (
                    <React.Fragment key={verse.number}>
                      {juz && !isFocusMode && (() => {
                        const bookmarked = isJuzBookmarked(juz.juz);
                        return (
                          <div className="w-full flex items-center justify-center my-6">
                            <div className="h-[1px] bg-amber-500/20 flex-grow"></div>
                            <button
                              onClick={() => toggleJuzBookmark(juz.juz, verse.number)}
                              className={`mx-6 px-6 py-2 rounded-full border-2 transition-all flex items-center gap-3 font-black text-sm tracking-widest ${
                                bookmarked
                                  ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                  : 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                              }`}
                            >
                              <span className="opacity-50 text-xs">۞</span>
                              الجزء {juz.juz}
                              {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                              <span className="opacity-50 text-xs">۞</span>
                            </button>
                            <div className="h-[1px] bg-amber-500/20 flex-grow"></div>
                          </div>
                        );
                      })()}
                      <span 
                        id={`verse-${verse.number}`}
                        className="inline transition-colors duration-500"
                      >
                        {verse.text}
                      </span>
                      <button 
                        onClick={() => toggleVerseBookmark(verse.number)}
                        className={`inline-flex items-center justify-center w-7 h-7 mx-2 rounded-full border text-[15px] font-bold align-middle translate-y-[-2px] transition-all active:scale-90 ${
                          isVerseBookmarked(verse.number) 
                            ? 'bg-amber-500 border-amber-500 text-white shadow-md' 
                            : isFocusMode 
                              ? 'border-primary dark:border-emerald-500 bg-primary dark:bg-emerald-500 text-white' 
                              : 'border-primary/30 dark:border-emerald-500/30 text-primary dark:text-white hover:bg-primary/10 dark:hover:bg-emerald-500/10'
                        }`}
                        title={isVerseBookmarked(verse.number) ? "إزالة العلامة المرجعية للآية" : "حفظ الآية كعلامة مرجعية"}
                      >
                        {verse.number}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Surah End indicator */}
            {!isFocusMode && (
              <div className="flex items-center justify-center mt-16 mb-8">
                <div className="h-[1px] bg-primary/20 flex-grow"></div>
                <div className="mx-4 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
                    {surahMetadata.number}
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1 font-bold uppercase tracking-widest">سورة {surahMetadata.name}</span>
                </div>
                <div className="h-[1px] bg-primary/20 flex-grow"></div>
              </div>
            )}

            {/* Next Surah Button */}
            {!isFocusMode && nextSurah && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-2 mb-2"
              >
                <Link
                  to={`/surahs/${nextSurah.number}`}
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary dark:bg-emerald-500 text-white rounded-xl font-bold card-shadow hover:scale-105 active:scale-95 transition-all group"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] opacity-70 font-medium uppercase tracking-wider">السورة التالية</span>
                    <span className="text-base">سورة {nextSurah.name}</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:translate-x-[-4px] transition-transform">
                    <ArrowRight className="rotate-180" size={18} />
                  </div>
                </Link>
              </motion.div>
            )}

            {isFocusMode && (
              <button
                onClick={() => setIsFocusMode(false)}
                className="mt-8 text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-2 mx-auto"
              >
                <Eye size={16} />
                عرض السورة كاملة
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
