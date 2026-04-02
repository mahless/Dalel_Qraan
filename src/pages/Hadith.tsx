import React, { useState, useMemo, useEffect } from 'react';
import { ArrowRight, Search, X, Book, Quote, Info, ChevronDown, Lightbulb, CheckCircle2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import hadithData from '../data/hadith/hadith01.json';
import hadithDailyData from '../data/hadith/hadith_daily.json';
import { normalizeArabic, arabicIncludes, getArabicMatchScore } from '../utils/arabicUtils';
import HadithExplanationModal from '../components/HadithExplanationModal';

export default function Hadith() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<string>('الكل');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  useEffect(() => {
    setDisplayLimit(20);
  }, [searchQuery, selectedBook]);

  const books = useMemo(() => {
    return ['الكل', ...Array.from(new Set(hadithData.map(h => h.book)))];
  }, []);

  const filteredHadiths = useMemo(() => {
    let results = hadithData.filter(h => {
      const matchesBook = selectedBook === 'الكل' || h.book === selectedBook;
      
      if (searchQuery.length < 2) return matchesBook;
      
      const matchesSearch = 
        arabicIncludes(h.hadith, searchQuery) || 
        arabicIncludes(h.chapter, searchQuery) ||
        arabicIncludes(h.book, searchQuery);
        
      return matchesBook && matchesSearch;
    });

    if (searchQuery.length >= 2) {
      return results.sort((a, b) => {
        const scoreA = Math.max(
          getArabicMatchScore(a.chapter, searchQuery) * 2, // Chapter matches are more important
          getArabicMatchScore(a.hadith, searchQuery)
        );
        const scoreB = Math.max(
          getArabicMatchScore(b.chapter, searchQuery) * 2,
          getArabicMatchScore(b.hadith, searchQuery)
        );
        return scoreB - scoreA;
      });
    }

    return results;
  }, [searchQuery, selectedBook]);

  const displayedHadiths = useMemo(() => {
    return filteredHadiths.slice(0, displayLimit);
  }, [filteredHadiths, displayLimit]);

  const targetBooks = useMemo(() => [
    'كتاب الإيمان', 'كتاب الطهارة', 'كتاب الصلاة', 'كتاب الصيام', 
    'كتاب الآداب', 'كتاب الفضائل', 'كتاب التوبة', 
    'كتاب الذكر والدعاء والتوبة والاستغفار', 'كتاب الجنة وصفة نعيمها وأهلها'
  ], []);

  const dailyHadith = useMemo(() => {
    if (hadithDailyData.length === 0) return null;
    
    // Use a stable seed based on the date (Egypt time approach)
    const dateStr = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Cairo' });
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
    
    const index = daysSinceEpoch % hadithDailyData.length;
    return hadithDailyData[index];
  }, []);

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto min-h-screen">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-4 flex items-center gap-4 max-w-2xl mx-auto card-shadow">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center active:bg-emerald-500/20 transition-all overflow-hidden shrink-0 border border-emerald-500/20"
          >
            <img src="/icons/prophet_mosque_icon.png" alt="Back" className="w-10 h-10 object-contain shadow-sm" />
          </button>
          <div>
            <h1 className="text-lg font-black text-black dark:text-white">من كتاب اللؤلؤ والمرجان</h1>
            <p className="text-xs text-black/60 dark:text-slate-400 font-bold uppercase tracking-widest">
             فيما اتفق عليه الشيخان "البخاري ومسلم"
            </p>
          </div>
          <button 
            onClick={() => setShowInfoModal(true)}
            className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 active:bg-emerald-500/20 transition-colors mr-auto"
          >
            <Lightbulb size={20} />
          </button>
        </header>
      </div>

      {/* Hadith List Header */}
      <div className="flex items-center justify-between mb-4 mt-2 px-2">
        <h2 className="text-lg font-black text-black dark:text-white">الأحاديث النبوية</h2>
        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest">
          {filteredHadiths.length} حديث
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 flex flex-row gap-2 relative">
        {/* Dropdown Filter (1/3) */}
        <div className="relative flex-1">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full glass px-4 py-3.5 rounded-2xl card-shadow flex items-center justify-between text-slate-700 dark:text-slate-200 border border-transparent"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Book size={16} className="text-emerald-500 shrink-0" />
              <span className="font-bold text-[10px] xs:text-xs truncate">{selectedBook}</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-300 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[60]" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 p-1.5 glass rounded-2xl card-shadow z-[70] max-h-60 overflow-y-auto min-w-full w-max max-w-[calc(100vw-32px)]"
                >
                  {books.map((book) => (
                    <button
                      key={book}
                      onClick={() => {
                        setSelectedBook(book);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        selectedBook === book
                          ? 'bg-emerald-500 text-white'
                          : 'hover:bg-emerald-500/10 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {book}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Search Input (2/3) */}
        <div className="relative flex-[2]">
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="البحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass py-3.5 pr-10 pl-10 rounded-2xl card-shadow focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm dark:text-slate-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 left-3 flex items-center text-slate-400"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {displayedHadiths.length > 0 ? (
          <>
            {displayedHadiths.map((h, idx) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-6 rounded-3xl card-shadow space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Book size={16} />
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{h.book}</span>
                </div>
                <div className="text-xs font-black text-emerald-600/60 dark:text-emerald-400/60">
                  #{h.id}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Quote size={18} className="text-emerald-500 shrink-0 mt-1 opacity-40" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                    {h.chapter}
                  </h3>
                </div>
                
                <p className="quran-text !text-2xl !leading-relaxed text-slate-800 dark:text-slate-100 py-2">
                  {h.hadith}
                </p>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Info size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold">{h.reference}</span>
                </div>
              </div>
              
              {/* Decoration */}
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            </motion.div>
          ))}
          
          {displayLimit < filteredHadiths.length && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="px-8 py-3.5 bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 rounded-full font-black active:scale-[0.95] transition-all flex items-center gap-2 border border-primary/20 dark:border-emerald-500/20 group"
              >
                تحميل المزيد
                <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform opacity-70" />
              </button>
            </div>
          )}
        </>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 font-bold">لم يتم العثور على أحاديث تطابق بحثك</p>
          </div>
        )}
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-8 rounded-[32px] card-shadow z-[110] max-w-sm w-full relative overflow-hidden text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <Lightbulb size={40} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-black">
                  <CheckCircle2 size={18} />
                  <span>توضيح هام</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-bold text-sm">
                  هذا القسم يحتوي على قرابة ٥٠٠ حديث من أصح الأحاديث المتفق عليها في البخاري ومسلم، تم التحقق منها قدر المستطاع، ومحتمل اختلافات بسيطة في الألفاظ.
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs leading-relaxed">
                  إذا أردت الحديث كما ورد في المتن، برجاء الرجوع إلى الصحيحين.
                </p>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm card-shadow hover:bg-emerald-600 active:scale-[0.98] transition-all"
              >
                فهمت ذلك
              </button>

              {/* Decoration */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
