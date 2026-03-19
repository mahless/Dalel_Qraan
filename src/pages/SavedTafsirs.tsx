import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trash2, BookOpen, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllTafsirs, deleteTafsir, SavedTafsir } from '../utils/db';

export default function SavedTafsirs() {
  const [tafsirs, setTafsirs] = useState<SavedTafsir[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadTafsirs();
  }, []);

  const loadTafsirs = async () => {
    try {
      const data = await getAllTafsirs();
      setTafsirs(data);
    } catch (error) {
      console.error('Failed to load saved tafsirs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTafsir(key);
      setTafsirs(tafsirs.filter(t => t.key !== key));
      if (expandedId === key) {
        setExpandedId(null);
      }
    } catch (error) {
      console.error('Failed to delete tafsir:', error);
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedId(expandedId === key ? null : key);
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(timestamp));
  };

  return (
    <div className="pb-32 pt-32 px-6 max-w-2xl mx-auto min-h-screen">
      <div className="fixed top-8 left-0 right-0 z-50 px-4 py-3">
        <header className="glass rounded-2xl px-6 py-4 flex items-center gap-4 max-w-2xl mx-auto card-shadow">
          <Link 
            to="/"
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-black dark:text-white">التفاسير المحفوظة</h1>
            <p className="text-[10px] text-black/60 dark:text-slate-400 font-medium">
              {tafsirs.length} تفسير محفوظ
            </p>
          </div>
        </header>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tafsirs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-primary/10 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-primary dark:text-emerald-400 mb-4">
            <BookOpen size={32} />
          </div>
          <h2 className="text-lg font-bold text-black dark:text-white mb-2">لا توجد تفاسير محفوظة</h2>
          <p className="text-sm text-black/60 dark:text-slate-400">
            قم بحفظ تفسير آية اليوم للرجوع إليه لاحقاً بدون إنترنت
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tafsirs.map((tafsir) => (
              <motion.div
                key={tafsir.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-2xl card-shadow overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => toggleExpand(tafsir.key)}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-primary dark:text-emerald-400 mb-1">
                        سورة {tafsir.surahName} - آية {tafsir.ayahNumber}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] text-black/50 dark:text-slate-500">
                        <Clock size={12} />
                        <span>{formatDate(tafsir.savedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDelete(tafsir.key, e)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors"
                        title="حذف التفسير"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="p-2 text-black/40 dark:text-slate-500">
                        {expandedId === tafsir.key ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm font-quran text-black dark:text-white leading-loose text-right mb-2">
                    {tafsir.verseText}
                  </p>
                </div>

                <AnimatePresence>
                  {expandedId === tafsir.key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-black/5 dark:border-white/5"
                    >
                      <div className="p-4 bg-black/5 dark:bg-white/5">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-right">
                          {tafsir.tafsirText.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-2 last:mb-0 leading-relaxed text-sm text-black/80 dark:text-slate-300">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
