import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Settings, Share2, Type, Eye, EyeOff, Bookmark, BookmarkCheck, Search, X, CheckCircle2, Play, Pause, Zap, ScrollText } from 'lucide-react';
import confetti from 'canvas-confetti';
import surahsData from '../data/surahs.json';
import storiesData from '../data/stories.json';
import juzMapping from '../data/juz_mapping.json';
import { Surah } from '../types/quran';

interface VerseWithSurah {
  number: number;
  text: string;
  surahId: number;
}
import { useStore } from '../store/useStore';
import { arabicIncludes, formatQuranText } from '../utils/arabicUtils';
import AyahNumber from '../components/AyahNumber';
import { KaabaIcon, MedinaIcon } from '../assets/SurahIcons';
import { useWirdStore } from '../store/useWirdStore';
import { formatPeaceBeUponHim } from '../utils/textFormatters';
import VerseExplanationModal from '../components/VerseExplanationModal';

// Map juz number (1-30) → Arabic ordinal with tashkeel
const JUZ_WORDS: Record<number, string> = {
  1:  'ٱلْأَوَّلُ',  2: 'ٱلثَّانِي',   3: 'ٱلثَّالِثُ',
  4:  'ٱلرَّابِعُ',  5: 'ٱلْخَامِسُ',  6: 'ٱلسَّادِسُ',
  7:  'ٱلسَّابِعُ',  8: 'ٱلثَّامِنُ',  9: 'ٱلتَّاسِعُ',
  10: 'ٱلْعَاشِرُ',  11: 'ٱلْحَادِي عَشَرَ', 12: 'ٱلثَّانِي عَشَرَ',
  13: 'ٱلثَّالِثَ عَشَرَ', 14: 'ٱلرَّابِعَ عَشَرَ', 15: 'ٱلْخَامِسَ عَشَرَ',
  16: 'ٱلسَّادِسَ عَشَرَ', 17: 'ٱلسَّابِعَ عَشَرَ', 18: 'ٱلثَّامِنَ عَشَرَ',
  19: 'ٱلتَّاسِعَ عَشَرَ', 20: 'ٱلْعِشْرُونَ',  21: 'ٱلْحَادِي وَالْعِشْرُونَ',
  22: 'ٱلثَّانِي وَالْعِشْرُونَ', 23: 'ٱلثَّالِثُ وَالْعِشْرُونَ', 24: 'ٱلرَّابِعُ وَالْعِشْرُونَ',
  25: 'ٱلْخَامِسُ وَالْعِشْرُونَ', 26: 'ٱلسَّادِسُ وَالْعِشْرُونَ', 27: 'ٱلسَّابِعُ وَالْعِشْرُونَ',
  28: 'ٱلثَّامِنُ وَالْعِشْرُونَ', 29: 'ٱلتَّاسِعُ وَالْعِشْرُونَ', 30: 'ٱلثَّلَاثُونَ'
};

export default function SurahDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fontSize, setFontSize, setLastReadSurah, addBookmark, removeBookmark, bookmarks } = useStore();
  
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const startAyahParam = queryParams.get('startAyah');
  const endSurahParam = queryParams.get('endSurah');
  const endAyahParam = queryParams.get('endAyah');
  const verseRange = queryParams.get('verses');
  const targetVerse = queryParams.get('v');
  const isWird = queryParams.get('wird') === 'true';
  const { markAsRead } = useWirdStore();

  const [selectedTafsirVerse, setSelectedTafsirVerse] = useState<VerseWithSurah | null>(null);
  const [tafsirData, setTafsirData] = useState<Record<string, string[]>>({});
  const [wordMeaningsData, setWordMeaningsData] = useState<Record<string, {w: string, m: string}[]>>({});

  useEffect(() => {
    // Load Tafsir
    import('../data/tafsir_muyassar.json')
      .then((data) => setTafsirData(data.default || data))
      .catch((e) => console.error("Error loading tafsir:", e));
    
    // Load Word Meanings
    import('../data/word_meanings_seraj.json')
      .then((data) => setWordMeaningsData(data.default || data))
      .catch((e) => console.error("Error loading word meanings:", e));
  }, []);

  const [wasAutoScrolling, setWasAutoScrolling] = useState(false);

  const handleVerseClick = (verse: VerseWithSurah) => {
    if (isAutoScrolling) {
      setWasAutoScrolling(true);
      setIsAutoScrolling(false);
    } else {
      setWasAutoScrolling(false);
    }
    setSelectedTafsirVerse(verse);
  };

  const [verses, setVerses] = useState<VerseWithSurah[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeVerse, setActiveVerse] = useState<{surahId: number, number: number} | null>(null);
  
  const surahMetadata = (surahsData as any[]).find(s => 
    s.number === Number(id) || s.name === id
  );

  const headerSurahMetadata = activeVerse 
    ? (surahsData as any[]).find(s => s.number === activeVerse.surahId) || surahMetadata
    : surahMetadata;


  const currentJuz = useMemo(() => {
    if (!surahMetadata || verses.length === 0) return null;
    const refVerse = activeVerse || (verses as any)[0];
    
    // Find the highest juz number that starts at or before the current surah/ayah
    const juz = [...juzMapping].sort((a, b) => b.juz - a.juz).find(j => {
      if (j.surah < refVerse.surahId) return true;
      if (j.surah === refVerse.surahId) return j.ayah <= refVerse.number;
      return false;
    });
    
    return juz ? juz.juz : null;
  }, [surahMetadata, verses, activeVerse]);
  
  // Auto Scroll States
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<5 | 10 | 15>(5); // pixels per second

  const speedLabels: Record<number, string> = {
    5: 'بطيء',
    10: 'متوسط',
    15: 'سريع'
  };

  const cycleSpeed = () => {
    setScrollSpeed(prev => {
      if (prev === 5) return 10;
      if (prev === 10) return 15;
      return 5;
    });
  };

  useEffect(() => {
    setHasInitialScrolled(false);
  }, [id]);

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

  // Track active verse for dynamic Juz update
  useEffect(() => {
    const handleScrollForJuz = () => {
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2; // Point accurately representing the middle of the screen
      const element = document.elementFromPoint(x, y);
      
      if (element) {
        let current: HTMLElement | null = element as HTMLElement;
        while (current && (!current.id || (!current.id.startsWith('verse-') && !current.id.startsWith('surah-header-')))) {
          current = current.parentElement;
        }
        
        if (current) {
          const idStr = current.id;
          if (idStr.startsWith('verse-')) {
            const parts = idStr.split('-');
            const sId = parseInt(parts[1].substring(1));
            const vNum = parseInt(parts[2].substring(1));
            
            if (!activeVerse || activeVerse.surahId !== sId || activeVerse.number !== vNum) {
              setActiveVerse({ surahId: sId, number: vNum });
            }
          } else if (idStr.startsWith('surah-header-')) {
            const sId = parseInt(idStr.replace('surah-header-', ''));
            if (!activeVerse || activeVerse.surahId !== sId) {
              setActiveVerse({ surahId: sId, number: 1 });
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollForJuz, { passive: true });
    handleScrollForJuz(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScrollForJuz);
  }, [verses, activeVerse]);

  // Auto Scroll Logic
  useEffect(() => {
    let requestRef: number;
    let lastTime = 0;
    let exactScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let isInteracting = false;

    const handleInteractionStart = () => { isInteracting = true; };
    const handleInteractionEnd = () => { 
      isInteracting = false; 
      exactScrollY = window.scrollY; // Re-sync when interaction ends
    };

    window.addEventListener('touchstart', handleInteractionStart, { passive: true });
    window.addEventListener('touchend', handleInteractionEnd, { passive: true });
    window.addEventListener('wheel', handleInteractionStart, { passive: true });
    
    // Simple way to detect wheel end
    let wheelTimeout: NodeJS.Timeout;
    const handleWheel = () => {
      handleInteractionStart();
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(handleInteractionEnd, 150);
    };
    window.addEventListener('wheel', handleWheel, { passive: true });

    const scroll = (time: number) => {
      if (!isAutoScrolling) return;
      
      if (lastTime !== 0) {
        const deltaTime = time - lastTime;
        
        if (isInteracting) {
          // While user is interacting, just stay synced with their movement
          exactScrollY = window.scrollY;
        } else {
          // deltaTime is typically ~16.6ms for 60fps
          // scrollSpeed is pixels per second
          const nextY = exactScrollY + (scrollSpeed * deltaTime) / 1000;
          
          // Check if we've reached the bottom
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (nextY >= maxScroll - 2) { // 2px buffer to ensure it stops reliably
            window.scrollTo(window.scrollX, maxScroll);
            setIsAutoScrolling(false);
            return;
          }

          exactScrollY = nextY;
          
          // Exact fractional scrolling provides smooth sub-pixel rendering in modern browsers
          window.scrollTo(window.scrollX, exactScrollY);
          
          // Fallback sync if anything else moves the scroll
          if (Math.abs(window.scrollY - exactScrollY) > 10) {
            exactScrollY = window.scrollY;
          }
        }
      }
      
      lastTime = time;
      requestRef = requestAnimationFrame(scroll);
    };

    if (isAutoScrolling) {
      lastTime = performance.now();
      exactScrollY = window.scrollY;
      requestRef = requestAnimationFrame(scroll);
    }

    return () => {
      if (requestRef) cancelAnimationFrame(requestRef);
      window.removeEventListener('touchstart', handleInteractionStart);
      window.removeEventListener('touchend', handleInteractionEnd);
      window.removeEventListener('wheel', handleInteractionStart);
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimeout);
    };
  }, [isAutoScrolling, scrollSpeed]);

  const nextSurah = (surahsData as any[]).find(s => s.number === (surahMetadata?.number || 0) + 1);
  const prevSurah = (surahsData as any[]).find(s => s.number === (surahMetadata?.number || 0) - 1);
  const rawRelatedStories = (storiesData as any[]).filter(story => 
    story.references.some((ref: any) => {
      if (typeof ref.surah === 'number') return ref.surah === Number(id);
      return ref.surah === surahMetadata?.name;
    })
  );
  
  const relatedStories = useMemo(() => {
    return rawRelatedStories
      .filter((story, index, self) => 
        index === self.findIndex((t) => t.title === story.title)
      )
      .sort((a, b) => a.title.length - b.title.length);
  }, [rawRelatedStories]);

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
          const startSurah = surahMetadata.number;
          const endSurah = endSurahParam ? parseInt(endSurahParam) : startSurah;
          
          let allVerses: VerseWithSurah[] = [];
          
          // Load all surahs in the range
          for (let sId = startSurah; sId <= endSurah; sId++) {
            const response = await import(`../data/quran/surah_${sId}.json`);
            const data = response.default;
            
            const surahVerses: VerseWithSurah[] = Object.entries(data.verse).map(([key, text]) => ({
              number: parseInt(key.replace('verse_', '')),
              text: text as string,
              surahId: sId
            })).sort((a, b) => a.number - b.number);
            
            allVerses = [...allVerses, ...surahVerses];
          }
          
          setVerses(allVerses as any);
        } catch (error) {
          console.error('Error loading surah verses:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadVerses();
    }
  }, [id, surahMetadata, endSurahParam, setLastReadSurah]);

  // Scroll to target verse when loading finished
  useEffect(() => {
    if (!loading && verses.length > 0 && targetVerse && !hasInitialScrolled) {
      setTimeout(() => {
        const element = document.getElementById(`verse-s${surahMetadata?.number}-v${targetVerse}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the verse briefly
          element.classList.add('bg-amber-200/40', 'dark:bg-amber-900/30', 'rounded', 'px-1');
          setTimeout(() => {
            element.classList.remove('bg-amber-200/40', 'dark:bg-amber-900/30', 'rounded', 'px-1');
          }, 3000);
          setHasInitialScrolled(true);
        }
      }, 500); // Small delay to ensure rendering is complete
    }
  }, [loading, verses, targetVerse, hasInitialScrolled, surahMetadata]);

  const isInRange = (num: number, rangeStr: string | null) => {
    if (!rangeStr) return true;
    const parts = rangeStr.split('-');
    const start = parseInt(parts[0]);
    const end = parts.length > 1 ? parseInt(parts[1]) : start;
    return num >= start && num <= end;
  };

  const displayedVerses = useMemo(() => {
    let filtered = verses as unknown as VerseWithSurah[];
    
    // Support new multi-surah wird range params
    if (startAyahParam && endSurahParam && endAyahParam) {
      const sSurah = parseInt(id!);
      const eSurah = parseInt(endSurahParam);
      const sAyah = parseInt(startAyahParam);
      const eAyah = parseInt(endAyahParam);

      filtered = filtered.filter(v => {
        if (v.surahId === sSurah && v.surahId === eSurah) {
          return v.number >= sAyah && v.number <= eAyah;
        }
        if (v.surahId === sSurah) return v.number >= sAyah;
        if (v.surahId === eSurah) return v.number <= eAyah;
        return v.surahId > sSurah && v.surahId < eSurah;
      });
    } else if (isFocusMode && verseRange) {
      filtered = filtered.filter(v => isInRange(v.number, verseRange));
    }
    
    if (localSearchQuery.length > 1) {
      filtered = filtered.filter(v => arabicIncludes(v.text, localSearchQuery));
    }
    return filtered;
  }, [verses, isFocusMode, verseRange, startAyahParam, endSurahParam, endAyahParam, id, localSearchQuery]);


  return (
    <div className="pb-20 pt-34 px-2 max-w-2xl mx-auto">
      <AnimatePresence>
        {isHeaderVisible && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-10 left-0 right-0 z-50 px-2 py-3"
          >
            <nav className="glass rounded-2xl px-2 py-3 flex items-center justify-between max-w-2xl mx-auto card-shadow">
              <div className="flex items-center gap-0">
                <button
                  onClick={() => navigate(-1)}
                  className="group relative w-10 h-10 flex items-center justify-center transition-all active:scale-90 shrink-0"
                  title="الرجوع"
                >
                  <div className="absolute inset-1 bg-primary/10 dark:bg-emerald-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <AyahNumber 
                    number={headerSurahMetadata.number} 
                    size="md"
                    className="!mx-0 !px-0 relative z-10 drop-shadow-sm group-hover:scale-110 transition-transform"
                  />
                </button>
                
                <div className="flex flex-col items-start pr-2">
                  <div className="flex items-center gap-1">
                    <h1 className="text-lg font-black text-black dark:text-slate-100 truncate" style={{ fontFamily: 'var(--font-quran)' }}>سورة {headerSurahMetadata.name}</h1>
                    {headerSurahMetadata.revelationType === 'Meccan' ? (
                      <KaabaIcon size={20} className="text-primary dark:text-emerald-400" />
                    ) : (
                      <MedinaIcon size={24} className="text-primary dark:text-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-black/60 dark:text-slate-400 font-medium">
                    {isWird ? `الورد اليومي (الجزء ${currentJuz || ''})` : isFocusMode ? `الآيات المحددة (${verseRange})` : `الجزء ${currentJuz || ''}`}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
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
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 active:scale-95 transition-all"
                    title="تصغير الخط"
                  >
                    <span className="text-base font-bold">A-</span>
                  </button>
                  <button 
                    onClick={() => setFontSize(Math.min(48, fontSize + 2))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 active:scale-95 transition-all"
                    title="تكبير الخط"
                  >
                    <span className="text-base font-bold">A+</span>
                  </button>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={containerRef} className="will-change-transform">
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 mt-4 overflow-hidden px-4 -mx-4 pb-6 pt-2"
          >
            <div className="relative">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="ابحث في هذه السورة..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full glass py-5 pr-12 pl-12 rounded-3xl card-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg dark:text-slate-100 dark:focus:bg-slate-800/80"
                autoFocus
              />
              <AnimatePresence>
                {localSearchQuery.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setLocalSearchQuery('')}
                    className="absolute inset-y-0 left-4 flex items-center text-slate-400 active:text-primary dark:text-slate-500 dark:active:text-emerald-400 transition-colors"
                    title="مسح البحث"
                  >
                    <X size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            {localSearchQuery.length > 1 && (
              <p className="text-xs text-slate-400 mt-2 mr-6">
                تم العثور على {displayedVerses.length} آية
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>


      {!loading && !isFocusMode && !isWird && relatedStories.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 px-1"
        >
          <div className="glass p-5 rounded-3xl card-shadow border border-primary/10 dark:border-emerald-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 dark:bg-emerald-500/10 rounded-bl-[100px] -mr-8 -mt-8" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-primary/10 dark:bg-emerald-500/20 rounded-lg text-primary dark:text-emerald-400">
                  <ScrollText size={18} />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-700 dark:text-slate-300">قصص مرتبطة بالسورة</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {relatedStories.map((story: any) => (
                  <Link
                    key={story.id}
                    to={`/stories/${story.id}`}
                    className="px-2.5 py-1 bg-white/60 dark:bg-slate-800/60 text-black dark:text-slate-100 rounded-lg text-xs font-semibold border border-slate-200/50 dark:border-slate-700/50 active:bg-primary/5 dark:active:bg-emerald-500/5 active:border-primary/30 dark:active:border-emerald-500/30 transition-all flex items-center gap-1.5 card-shadow-sm"
                  >
                    <span className="truncate">{formatPeaceBeUponHim(story.title)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="min-h-[200px]">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass px-2 py-8 rounded-3xl card-shadow mb-4 text-center"
          >
            <div 
              className="quran-text leading-[2.1] space-x-reverse"
              style={{ 
                fontSize: `${fontSize}px`
              }}
            >
              {/* Early Juz indicator if it starts at the beginning of the Surah */}
              {!isFocusMode && !startAyahParam && (() => {
                const juz = juzMapping.find(j => j.surah === surahMetadata.number && (j.ayah === 1 || j.ayah === 0));
                if (!juz) return null;
                const bookmarked = isJuzBookmarked(juz.juz);
                return (
                  <div className="w-full flex items-center justify-center mb-2">
                    <div className="h-[1px] bg-amber-500/20 flex-grow"></div>
                    <button 
                      onClick={() => toggleJuzBookmark(juz.juz, 1)}
                      className={`mx-6 px-4 py-2 rounded-full border-2 transition-all font-black text-lg tracking-widest flex items-center gap-3 ${
                        bookmarked 
                          ? 'border-amber-500 bg-amber-500 text-white shadow-md' 
                          : 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 active:bg-amber-100 dark:active:bg-amber-900/40'
                      }`}
                      title={bookmarked ? "إزالة العلامة المرجعية للجزء" : "حفظ الجزء كعلامة مرجعية"}
                    >
                      <span className="opacity-30 text-base">۞</span>
                      <span style={{ fontFamily: 'var(--font-quran)' }} className="text-xl tracking-normal font-normal">
                        الجُزءُ {JUZ_WORDS[juz.juz] ?? juz.juz}
                      </span>
                      {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      <span className="opacity-30 text-base">۞</span>
                    </button>
                    <div className="h-[1px] bg-amber-500/20 flex-grow"></div>
                  </div>
                );
              })()}

              {/* Initial Basmala */}
              {!isFocusMode && !startAyahParam && surahMetadata.number !== 9 && (
                <div className="mb-1 border-b border-primary/10 pb-2 pt-1 flex justify-center items-center w-full overflow-visible">
                  {surahMetadata.number === 1 ? (
                    <span
                      className="quran-text quran-text-center !text-primary dark:!text-emerald-400 drop-shadow-sm leading-tight px-4 mx-auto block text-center"
                      style={{ fontSize: `min(${fontSize}px, 12vw)`, maxWidth: '100%' }}
                    >
                      {formatQuranText(verses.find(v => v.surahId === 1 && v.number === 1)?.text || '')}
                      <span className="mx-2 !text-primary dark:!text-emerald-400 opacity-90 relative inline-block drop-shadow-sm align-middle translate-y-[-2px]">{'\u06DD'}١</span>
                    </span>
                  ) : (
                    <span
                      className="quran-text quran-text-center !text-primary dark:!text-emerald-400 drop-shadow-sm px-4 py-2 mx-auto block text-center overflow-visible"
                      style={{ 
                        fontSize: 'clamp(16px, 6.6vw, 30px)',
                        lineHeight: 'normal',
                        maxWidth: '100%',
                        display: 'inline-block'
                      }}
                    >
                      {'\uFDFD'}
                    </span>
                  )}
                </div>
              )}

              {displayedVerses
                .filter(v => {
                  if (v.number === 0) return false;
                  // Skip displaying verse 1 of Fatihah in the main list because we just displayed it as the header
                  if (v.surahId === 1 && v.number === 1 && !isFocusMode && !startAyahParam) return false;
                  return true;
                })
                .map((verse, idx) => {
                  const filteredVerses = displayedVerses.filter(v => {
                    if (v.number === 0) return false;
                    return true;
                  });
                  const actualIdx = filteredVerses.findIndex(v => v.surahId === verse.surahId && v.number === verse.number);
                  const prevVerse = actualIdx > 0 ? filteredVerses[actualIdx - 1] : null;
                  const surahChanged = prevVerse && prevVerse.surahId !== verse.surahId;
                  const currentSurahMetadata = (surahsData as any[]).find(s => s.number === verse.surahId);
                  
                  const juz = juzMapping.find(j => j.surah === verse.surahId && j.ayah === verse.number && j.ayah > 1);
                  
                  return (
                    <React.Fragment key={`${verse.surahId}-${verse.number}`}>
                      {(surahChanged || (actualIdx === 0 && startAyahParam && verse.surahId !== surahMetadata.number)) && currentSurahMetadata && (
                        <div id={`surah-header-${currentSurahMetadata.number}`} className="w-full my-3 border-t border-primary/10 pt-3">
                          <h3 className="text-2xl font-black text-primary dark:text-emerald-400 mb-2 text-center" style={{ fontFamily: 'var(--font-quran)' }}>
                            سورة {currentSurahMetadata.name}
                          </h3>
                        </div>
                      )}

                      {juz && !isFocusMode && (() => {
                        const bookmarked = isJuzBookmarked(juz.juz);
                        return (
                          <div className="w-full flex items-center justify-center my-6">
                            <div className="h-[1px] bg-amber-500/20 flex-grow"></div>
                            <button
                              onClick={() => toggleJuzBookmark(juz.juz, verse.number)}
                              className={`mx-6 px-4 py-2 rounded-full border-2 transition-all flex items-center gap-3 font-black text-lg tracking-widest ${
                                bookmarked
                                  ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                  : 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 active:bg-amber-100 dark:active:bg-amber-900/40'
                              }`}
                            >
                              <span className="opacity-30 text-base">۞</span>
                              <span style={{ fontFamily: 'var(--font-quran)' }} className="text-xl tracking-normal font-normal">
                                الجُزءُ {JUZ_WORDS[juz.juz] ?? juz.juz}
                              </span>
                              {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                              <span className="opacity-30 text-base">۞</span>
                            </button>
                            <div className="h-[1px] bg-amber-500/20 flex-grow"></div>
                          </div>
                        );
                      })()}
                      <span 
                        id={`verse-s${verse.surahId}-v${verse.number}`}
                        className="inline transition-colors duration-500 cursor-pointer"
                        onClick={() => handleVerseClick(verse)}
                      >
                        {formatQuranText(verse.text)}
                      </span>
                      <button 
                        onClick={() => toggleVerseBookmark(verse.number)}
                        className={`inline-flex items-center justify-center mx-0.5 align-middle translate-y-[-0.1em] transition-all active:scale-90`}
                        title={isVerseBookmarked(verse.number) ? "إزالة العلامة المرجعية للآية" : "حفظ الآية كعلامة مرجعية"}
                      >
                        <AyahNumber 
                          number={verse.number} 
                          isBookmarked={isVerseBookmarked(verse.number)}
                          size="md"
                        />
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Surah End indicator */}
            {!isFocusMode && !startAyahParam && (
              <div className="flex items-center justify-center mt-16 mb-8">
                <div className="h-[1px] bg-primary/20 flex-grow"></div>
                <div className="mx-4 flex flex-col items-center">
                  <AyahNumber 
                    number={surahMetadata.number} 
                    size="lg"
                  />
                  <span className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">سورة {surahMetadata.name}</span>
                </div>
                <div className="h-[1px] bg-primary/20 flex-grow"></div>
              </div>
            )}

            {/* Navigation Buttons */}
            {!isFocusMode && !startAyahParam && (nextSurah || prevSurah) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-2 mb-2 flex flex-wrap items-center justify-center gap-3"
              >
                {prevSurah && (
                  <Link
                    to={`/surahs/${prevSurah.number}`}
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 rounded-full font-bold active:scale-95 transition-all group border border-primary/20 dark:border-emerald-500/20"
                  >
                    <ArrowRight className="opacity-70 group-active:translate-x-[4px] transition-transform" size={20} />
                    <span className="text-lg" style={{ fontFamily: 'var(--font-quran)' }}>سورة {prevSurah.name}</span>
                  </Link>
                )}
                
                {nextSurah && (
                  <Link
                    to={`/surahs/${nextSurah.number}`}
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 rounded-full font-bold active:scale-95 transition-all group border border-primary/20 dark:border-emerald-500/20"
                  >
                    <span className="text-lg" style={{ fontFamily: 'var(--font-quran)' }}>سورة {nextSurah.name}</span>
                    <ArrowRight className="rotate-180 opacity-70 group-active:translate-x-[-4px] transition-transform" size={20} />
                  </Link>
                )}
              </motion.div>
            )}

            {isFocusMode && (
              <button
                onClick={() => setIsFocusMode(false)}
                className="mt-8 text-lg font-bold text-slate-400 active:text-primary transition-colors flex items-center gap-2 mx-auto"
              >
                <Eye size={16} />
                عرض السورة كاملة
              </button>
            )}
          </motion.div>
        </div>
      )}
      </div>

      {/* Wird Completion Bar */}
      {isWird && (
        <div className="fixed bottom-15 left-0 right-0 z-[60] px-4 flex justify-center pointer-events-none">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-2xl pointer-events-auto"
          >
            <button
              onClick={() => {
                const lastVerse = displayedVerses[displayedVerses.length - 1];
                if (lastVerse) {
                  // Celebration animation
                  const duration = 3 * 1000;
                  const animationEnd = Date.now() + duration;
                  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                  const interval: any = setInterval(function() {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                      return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                  }, 250);

                  markAsRead({ surah: lastVerse.surahId, ayah: lastVerse.number });
                  
                  // Small delay to let user see animation start before transition
                  setTimeout(() => {
                    navigate('/wird');
                  }, 800);
                }
              }}
              className="w-full py-4 glass text-primary dark:text-emerald-400 rounded-2xl text-lg font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-primary/20 dark:border-emerald-500/20 shadow-xl shadow-primary/10 dark:shadow-emerald-500/10"
            >
              <CheckCircle2 size={24} />
              تمت قراءة الورد اليومي
            </button>
          </motion.div>
        </div>
      )}

      {/* Auto Scroll Controls */}
      <AnimatePresence>
        {!isFocusMode && (
          <div 
            className={`fixed ${isWird ? 'bottom-32' : 'bottom-16'} left-0 right-0 z-[55] px-4 flex justify-center pointer-events-none`}
          >
            <motion.div 
              layout
              drag
              dragMomentum={false}
              dragConstraints={{ top: -500, bottom: 100, left: -200, right: 200 }}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              whileDrag={{ scale: 1.05 }}
              className="glass p-1.5 rounded-full shadow-2xl flex items-center gap-1.5 pointer-events-auto border border-white/20 dark:border-white/10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10"
            >
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isAutoScrolling 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                    : 'bg-primary dark:bg-emerald-500 text-white shadow-lg shadow-primary/30 dark:shadow-emerald-500/30'
                } active:scale-90`}
              >
                {isAutoScrolling ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="mr-0.5" fill="currentColor" />}
              </button>
              
              <div className="h-6 w-[1px] bg-black/5 dark:bg-white/10 mx-0.5" />
              
              <button
                onClick={cycleSpeed}
                className="px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-sm active:bg-black/10 dark:active:bg-white/10 transition-colors flex items-center gap-2 min-w-[60px]"
                title="سرعة التمرير"
              >
                <div className="flex items-end gap-[2px] h-3">
                  <div className={`w-[3px] rounded-full transition-all ${scrollSpeed >= 5 ? 'bg-primary dark:bg-emerald-400 h-1.5' : 'bg-slate-300 dark:bg-slate-600 h-1'}`} />
                  <div className={`w-[3px] rounded-full transition-all ${scrollSpeed >= 10 ? 'bg-primary dark:bg-emerald-400 h-2.5' : 'bg-slate-300 dark:bg-slate-600 h-1'}`} />
                  <div className={`w-[3px] rounded-full transition-all ${scrollSpeed >= 15 ? 'bg-primary dark:bg-emerald-400 h-3.5' : 'bg-slate-300 dark:bg-slate-600 h-1'}`} />
                </div>
                <Zap size={10} className={isAutoScrolling ? 'text-amber-500 animate-pulse' : 'opacity-30'} />
              </button>

              {isAutoScrolling && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => setIsAutoScrolling(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 active:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <VerseExplanationModal
        isOpen={!!selectedTafsirVerse}
        onClose={() => {
          setSelectedTafsirVerse(null);
          if (wasAutoScrolling) {
            setIsAutoScrolling(true);
            setWasAutoScrolling(false);
          }
        }}
        verseText={selectedTafsirVerse?.text || ""}
        surahName={surahMetadata?.name || ''}
        ayahNumber={selectedTafsirVerse?.number || undefined}
        explanation={
          selectedTafsirVerse 
            ? (tafsirData[selectedTafsirVerse.surahId.toString()]?.[selectedTafsirVerse.number - 1] || 'التفسير غير متوفر في هذه النسخة.')
            : ''
        }
        wordMeanings={
          selectedTafsirVerse
            ? wordMeaningsData[`${selectedTafsirVerse.surahId}:${selectedTafsirVerse.number}`]
            : []
        }
      />
    </div>
  );
}
