import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Book } from 'lucide-react';
import { Surah } from '../types/quran';

interface SurahCardProps {
  key?: React.Key;
  surah: Surah;
  index: number;
}

export default function SurahCard({ surah, index }: SurahCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={`/surahs/${surah.number}`}
        className="block glass p-3 rounded-2xl card-shadow group hover:border-primary/30 dark:hover:border-emerald-500/30 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/5 dark:bg-emerald-500/10 flex items-center justify-center text-primary dark:text-emerald-400 font-bold text-sm group-hover:bg-primary dark:group-hover:bg-emerald-500 group-hover:text-white transition-colors flex-shrink-0">
              {surah.number}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-black dark:text-slate-100 truncate">{surah.name}</h3>
              <p className="text-[10px] text-black/60 dark:text-slate-400 truncate">
                {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.versesCount} آية
              </p>
            </div>
          </div>
          <Book className="text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors" size={18} />
        </div>
      </Link>
    </motion.div>
  );
}
