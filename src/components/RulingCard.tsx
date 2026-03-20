import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Ruling } from '../types/quran';
import surahsData from '../data/surahs.json';

interface RulingCardProps {
  key?: React.Key;
  ruling: Ruling;
  index: number;
}

export default function RulingCard({ ruling, index }: RulingCardProps) {
  const getSurahName = (surahRef: number | string) => {
    if (typeof surahRef === 'string') return surahRef;
    const surah = (surahsData as any[]).find(s => s.number === surahRef);
    return surah ? surah.name : `سورة رقم ${surahRef}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="glass p-6 rounded-3xl card-shadow border-r-4 border-r-primary dark:border-r-emerald-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-emerald-500/20 rounded-xl text-primary dark:text-emerald-400">
              <Scale size={24} />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-slate-100">{ruling.title}</h3>
          </div>
        </div>
        
        <div className="mb-2 text-primary/60 dark:text-emerald-500/60 text-[10px] font-black uppercase tracking-widest opacity-60">نبذة</div>
        <p className="text-black/90 dark:text-slate-400 mb-6 leading-relaxed">
          {ruling.summary}
        </p>
        
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">المراجع القرآنية</h4>
          <div className="flex flex-wrap gap-2">
            {ruling.references.map((ref, i) => (
              <Link 
                key={i} 
                to={`/surahs/${ref.surah}?verses=${ref.verses}`}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-black/80 dark:text-slate-300 border border-slate-100 dark:border-slate-700 flex items-center gap-2 hover:border-primary/30 dark:hover:border-emerald-500/30 hover:bg-white dark:hover:bg-slate-700 transition-all group max-w-full"
              >
                <span className="font-bold text-primary dark:text-emerald-400 group-hover:underline truncate">سورة {getSurahName(ref.surah)}</span>
                <span className="text-slate-400 dark:text-slate-600 flex-shrink-0">|</span>
                <span className="flex-shrink-0">آية {ref.verses}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
