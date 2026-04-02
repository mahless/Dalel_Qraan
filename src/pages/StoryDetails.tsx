import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, BookOpen } from 'lucide-react';
import storiesData from '../data/stories.json';
import surahsData from '../data/surahs.json';
import { Story } from '../types/quran';
import { useStore } from '../store/useStore';
import { formatPeaceBeUponHim } from '../utils/textFormatters';

export default function StoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useStore();
  const story = (storiesData as Story[]).find(s => s.id === id);

  if (!story) return null;

  const getSurahName = (surahRef: number | string) => {
    if (typeof surahRef === 'string') return surahRef;
    const surah = (surahsData as any[]).find(s => s.number === surahRef);
    return surah ? surah.name : `سورة رقم ${surahRef}`;
  };

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <nav className="glass rounded-2xl px-2 py-4 flex items-center justify-between max-w-2xl mx-auto card-shadow">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 active:bg-black/10 dark:active:bg-white/10 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <h1 className="text-lg font-black text-black dark:text-slate-100">تفاصيل القصة</h1>
          <div className="w-10" /> {/* Spacer for symmetry */}
        </nav>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-black dark:text-slate-100 mb-4">{formatPeaceBeUponHim(story.title)}</h1>
        <div className="glass p-6 rounded-3xl card-shadow bg-amber-50/30 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10">
          <div className="mb-2 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest opacity-60">نبذة</div>
          <p className="text-black dark:text-slate-300 leading-relaxed text-lg mb-4">
            {formatPeaceBeUponHim(story.summary)}
          </p>
          {story.content && (
            <div className="pt-4 border-t border-amber-200 dark:border-amber-500/20">
              <div className="mb-2 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest opacity-60">القصة</div>
              <p className="text-black/80 dark:text-slate-400 leading-relaxed text-lg whitespace-pre-wrap">
                {formatPeaceBeUponHim(story.content)}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4 text-slate-400 dark:text-slate-500">
          <Users size={18} />
          <h3 className="text-lg font-bold uppercase tracking-widest">الشخصيات</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {story.characters.map((char, i) => (
            <span key={i} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl text-black dark:text-slate-300 text-lg font-medium card-shadow border border-slate-100 dark:border-slate-700">
              {formatPeaceBeUponHim(char)}
            </span>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4 text-slate-400 dark:text-slate-500">
          <BookOpen size={18} />
          <h3 className="text-xs font-bold uppercase tracking-widest italic opacity-70">المراجع القرآنية</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {story.references.map((ref, i) => (
            <Link
              key={i}
              to={`/surahs/${ref.surah}?verses=${ref.verses}`}
              className="px-4 py-2 bg-primary/5 dark:bg-emerald-500/5 rounded-full text-sm text-black/80 dark:text-slate-300 border border-primary/10 dark:border-emerald-500/10 flex items-center gap-2 active:scale-95 transition-all group max-w-full"
            >
              <span className="font-black text-primary dark:text-emerald-400 truncate">سورة {getSurahName(ref.surah)}</span>
              <span className="text-slate-300 dark:text-slate-600 flex-shrink-0">|</span>
              <span className="flex-shrink-0 font-bold text-xs opacity-70">آية {ref.verses}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
