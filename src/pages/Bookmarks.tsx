import React from 'react';
import { ArrowRight, Bookmark, Trash2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function Bookmarks() {
  const { bookmarks, removeBookmark } = useStore();

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto min-h-screen">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-4 flex items-center gap-4 max-w-2xl mx-auto card-shadow">
          <Link 
            to="/"
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-white active:bg-black/10 dark:active:bg-white/10 transition-colors"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-black text-black dark:text-white">المفضلة</h1>
            <p className="text-xs text-black/60 dark:text-slate-400 font-medium">
              العلامات المرجعية المحفوظة ({bookmarks.length})
            </p>
          </div>
        </header>
      </div>

      {bookmarks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary">
            <Bookmark size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد علامات مرجعية</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-[250px]">
            احتفظ بالآيات والأجزاء التي تود الرجوع إليها لاحقاً هنا.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {bookmarks.map((bookmark) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-4 rounded-2xl card-shadow flex items-center justify-between group bg-white/50 dark:bg-slate-800/50"
              >
                <Link
                  to={bookmark.verseNumber ? `/surahs/${bookmark.surahId}?v=${bookmark.verseNumber}` : `/surahs/${bookmark.surahId}`}
                  className="flex-1 flex flex-col"
                >
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-1 leading-tight flex items-center gap-2" style={{ fontFamily: 'var(--font-quran)' }}>
                    سورة {bookmark.surahName}
                    {bookmark.juzNumber && (
                      <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                        الجزء {bookmark.juzNumber}
                      </span>
                    )}
                  </h3>
                  <p className="text-lg text-slate-500 dark:text-slate-400">
                    {bookmark.verseNumber ? `الآية ${bookmark.verseNumber}` : 'بداية السورة'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(bookmark.timestamp).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </Link>

                <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-700/50 mr-2">
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-red-500 active:bg-red-50 dark:active:bg-red-500/10 transition-colors"
                    title="حذف العلامة"
                  >
                    <Trash2 size={18} />
                  </button>
                  <Link 
                    to={bookmark.verseNumber ? `/surahs/${bookmark.surahId}?v=${bookmark.verseNumber}` : `/surahs/${bookmark.surahId}`}
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary active:bg-primary active:text-white transition-colors"
                    title="الذهاب للعلامة"
                  >
                    <ChevronLeft size={20} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
