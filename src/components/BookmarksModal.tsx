import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import surahsData from '../data/surahs.json';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookmarksModal({ isOpen, onClose }: BookmarksModalProps) {
  const { bookmarks, removeBookmark, lastReadSurah, setFontSize } = useStore();
  const lastSurah = lastReadSurah ? (surahsData as any[]).find(s => s.number === lastReadSurah) : null;

  // Handle hardware back button to close modal
  useModalBackHandler(isOpen, onClose, 'bookmarks');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-emerald-900 rounded-[2.5rem] z-[70] w-[92%] max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 dark:border-emerald-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-emerald-900/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-emerald-500/10 flex items-center justify-center text-primary dark:text-emerald-400">
                  <Bookmark size={20} />
                </div>
                <h2 className="text-xl font-black text-black dark:text-slate-100">العلامات المرجعية</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8 no-scrollbar">
              {/* Last Read Section */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">آخر مكان للقراءة</h3>
                {lastSurah ? (
                  <Link
                    to={`/surahs/${lastSurah.number}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-4 bg-primary/5 dark:bg-emerald-500/10 rounded-2xl border border-primary/10 dark:border-emerald-500/20 hover:bg-primary/10 dark:hover:bg-emerald-500/20 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary dark:bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md">
                        {lastSurah.number}
                      </div>
                      <div>
                        <h4 className="font-bold text-black dark:text-slate-100">سورة {lastSurah.name}</h4>
                        <p className="text-[10px] text-black/60 dark:text-slate-400">واصل القراءة من حيث توقفت</p>
                      </div>
                    </div>
                    <ArrowLeft size={18} className="text-primary dark:text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">لم يتم تسجيل أي قراءة بعد</p>
                )}
              </section>

              {/* Saved Bookmarks Section */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">العلامات المحفوظة</h3>
                {bookmarks.length > 0 ? (
                  <div className="space-y-3">
                    {bookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="flex items-center gap-3 group"
                      >
                        <Link
                          to={`/surahs/${bookmark.surahId}${bookmark.verseNumber ? `?v=${bookmark.verseNumber}` : ''}`}
                          onClick={() => {
                            if (bookmark.fontSize) {
                              setFontSize(bookmark.fontSize);
                            }
                            onClose();
                          }}
                          className="flex-grow flex items-center justify-between p-4 glass rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all card-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                              {bookmark.juzNumber ? bookmark.juzNumber : bookmark.surahId}
                            </div>
                            <div>
                              <h4 className="font-bold text-black dark:text-slate-100">
                                {bookmark.juzNumber ? (
                                  <>
                                    الجزء {bookmark.juzNumber}
                                    <span className="mr-2 text-primary dark:text-emerald-400 text-xs">سورة {bookmark.surahName}</span>
                                  </>
                                ) : (
                                  <>
                                    سورة {bookmark.surahName}
                                    {bookmark.verseNumber && (
                                      <span className="mr-2 text-primary dark:text-emerald-400 text-xs">آية {bookmark.verseNumber}</span>
                                    )}
                                  </>
                                )}
                              </h4>
                              <div className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500">
                                <Clock size={10} />
                                <span>{new Date(bookmark.timestamp).toLocaleDateString('ar-EG')}</span>
                              </div>
                            </div>
                          </div>
                          <ArrowLeft size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-primary dark:text-emerald-400 transition-colors" />
                        </Link>
                        <button
                          onClick={() => removeBookmark(bookmark.id)}
                          className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Bookmark size={32} className="mx-auto text-slate-200 dark:text-slate-700 mb-2" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">لا توجد علامات محفوظة حالياً</p>
                  </div>
                )}
              </section>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-emerald-950 border-t border-slate-100 dark:border-emerald-800">
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 leading-relaxed">
                يمكنك إضافة علامة مرجعية لأي سورة من خلال النقر على أيقونة العلامة المرجعية في أعلى صفحة السورة.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
