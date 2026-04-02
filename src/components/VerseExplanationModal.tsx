import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, BookOpen } from 'lucide-react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';
import { useScrollLock } from '../hooks/useScrollLock';

interface VerseExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseText: string;
  verseInfo: string;
  explanation: string;
}

export default function VerseExplanationModal({ 
  isOpen, 
  onClose, 
  verseText, 
  verseInfo, 
  explanation 
}: VerseExplanationModalProps) {
  
  // Handle hardware back button to close modal
  useModalBackHandler(isOpen, onClose, 'verse_explanation');
  useScrollLock(isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-emerald-950/60 z-[100] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-[2.5rem] z-[110] w-[92%] max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-emerald-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-emerald-500/20 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black dark:text-slate-100 leading-none mb-1">شرح الآية</h2>
                  <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60 font-bold uppercase tracking-widest">{verseInfo}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
                title="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar no-scrollbar text-right">
              {/* Explanation Text */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <Lightbulb size={20} />
                  <span className="font-black text-sm uppercase tracking-widest">تفسير مبسط</span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {explanation ? (
                    <div className="space-y-4 text-justify leading-loose text-base font-bold text-[#745e3d] dark:text-[#d4b483] whitespace-pre-line">
                      {explanation}
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <p className="text-slate-400 dark:text-slate-500 font-bold italic">
                        عذراً، التفسير لهذه الآية سيتم إضافته قريباً...
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-4 border-t border-slate-100 dark:border-emerald-500/10">
                <p className="text-xs text-center text-slate-400 dark:text-slate-500 leading-relaxed italic">
                  * تم تلخيص هذا التفسير ليكون مختصراً ومفيداً، ولمزيد من التفصيل يرجى مراجعة "تفسير السعدي" أو "ابن كثير".
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
