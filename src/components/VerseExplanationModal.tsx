import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { getTafsir } from '../utils/db';
import staticTafsirs from '../data/static_tafsirs.json';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface VerseExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseText: string;
  verseInfo: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
}

export default function VerseExplanationModal({ isOpen, onClose, verseText, verseInfo, surahNumber, ayahNumber, surahName }: VerseExplanationModalProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle hardware back button to close modal
  useModalBackHandler(isOpen, onClose, 'explanation');

  useEffect(() => {
    if (isOpen && verseText) {
      checkIfSaved();
    }
  }, [isOpen, verseText]);

  async function checkIfSaved() {
    setLoading(true);
    setError(null);
    try {
      const key = `${surahNumber}:${ayahNumber}`;
      
      // 1. Check user-saved tafsirs in DB first
      const saved = await getTafsir(key);
      if (saved) {
        setExplanation(saved.tafsirText);
        setLoading(false);
        return;
      }

      // 2. Check embedded static database
      const staticMatch = staticTafsirs.find(t => 
        (t.surah_number === surahNumber || t.surah === surahName) && 
        t.ayah_number === ayahNumber
      );

      if (staticMatch) {
        setExplanation(staticMatch.explanation);
        setLoading(false);
        return;
      }

      // 3. If not found and AI is possible, try fetching
      setExplanation('');
      fetchExplanation();
    } catch (err) {
      console.error('Error checking saved tafsir:', err);
      setExplanation('');
      fetchExplanation();
    }
  }

  async function fetchExplanation() {
    setLoading(true);
    setError(null);
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // AI is not configured, show friendly message
        setError('عذراً، التفسير لهذه الآية غير متوفر حالياً في النسخة الأوفلاين. سيتم إضافة المزيد من التفاسير في التحديثات القادمة.');
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
أريد شرحاً وتفسيراً مختصراً للآية التالية:
"${verseText}"
(${verseInfo})

الشروط:
- جلب التفسير الأصلي ثم تلخيصه فقط.
- الاعتماد فقط على المعاني اللغوية للآية.
- الاستناد إلى تفسير ابن كثير وتفسير الطبري.
- عدم إضافة آراء أو استنتاجات خارج هذه المصادر.
- تقديم الشرح بلغة عربية مبسطة وواضحة.
- لا يتجاوز الشرح 500 كلمة.
- قم بتنسيق النص باستخدام فقرات قصيرة لسهولة القراءة.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      if (response.text) {
        setExplanation(response.text);
      } else {
        throw new Error('لم يتم إرجاع أي نص من النموذج');
      }
    } catch (err) {
      console.error('Error fetching explanation:', err);
      setError('حدث خطأ أثناء جلب التفسير. يرجى التأكد من الاتصال بالإنترنت أو المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="px-6 py-4 border-b border-slate-100 dark:border-emerald-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-emerald-900/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-emerald-500/10 flex items-center justify-center text-primary dark:text-emerald-400">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-xl font-black text-black dark:text-slate-100">شرح الآية</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
              <div className="bg-primary/5 dark:bg-emerald-500/10 rounded-2xl p-5 border border-primary/10 dark:border-emerald-500/20">
                <p className="text-primary dark:text-emerald-400 font-bold text-lg text-center leading-loose quran-text">
                  {verseText}
                </p>
                <p className="text-center text-xs text-black/50 dark:text-slate-400 mt-3">
                  {verseInfo}
                </p>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      جاري استخراج التفسير من مصادر موثوقة...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <p className="text-rose-500 dark:text-rose-400 mb-4">{error}</p>
                    <button 
                      onClick={fetchExplanation}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 whitespace-pre-line text-justify leading-relaxed text-black/80 dark:text-slate-300">
                    {explanation}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
