import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { KaabaIcon, MedinaIcon } from '../assets/SurahIcons';
import { Surah } from '../types/quran';
import AyahNumber from './AyahNumber';

interface SurahCardProps {
  key?: React.Key;
  surah: Surah;
  index: number;
}

export default function SurahCard({ surah, index }: SurahCardProps) {
  const isMeccan = surah.revelationType === 'Meccan';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={`/surahs/${surah.number}`}
        className="block glass p-2 rounded-2xl card-shadow active:border-primary/30 dark:active:border-emerald-500/30 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <AyahNumber 
              number={surah.number} 
              size="lg" 
              className="flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-2xl font-black text-black dark:text-slate-100 truncate" style={{ fontFamily: 'var(--font-quran)' }}>{surah.name}</h3>
              <p className="text-xs text-black/60 dark:text-slate-400 truncate">
                {isMeccan ? 'مكية' : 'مدنية'} • {surah.versesCount} آية
              </p>
            </div>
          </div>
          {isMeccan ? (
            <KaabaIcon size={32} className="flex-shrink-0" />
          ) : (
            <MedinaIcon size={36} className="flex-shrink-0" />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
