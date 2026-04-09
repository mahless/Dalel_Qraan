import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, Calendar } from 'lucide-react';
import { useWirdStore } from '../store/useWirdStore';
import { TOTAL_VERSES } from '../utils/wirdUtils';

export default function QuranWirdCard() {
  const { progress, settings, getEstimatedEndDate } = useWirdStore();
  
  const percentage = (progress.completedVerses / TOTAL_VERSES) * 100;
  
  return (
    <Link
      to="/wird"
      className="block glass border !border-primary/50 dark:!border-emerald-500/50 p-3 rounded-2xl card-shadow active:bg-white dark:active:bg-slate-800/50 transition-all relative overflow-hidden mb-6"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-black dark:text-slate-100">الورد اليومي</h3>
              <p className="text-xs text-black/60 dark:text-slate-400 font-medium">التقدم في الختمة</p>
            </div>
          </div>
          {progress.streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold">
              <Trophy size={14} />
              <span>{progress.streak} يوم استمرار</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-grow">
            <div className="flex justify-between text-xs font-black mb-1.5 tracking-tight">
              <span className="text-primary dark:text-emerald-400">{Math.round(percentage)}% من القرآن</span>
              <span className="text-black/40 dark:text-slate-500">{progress.completedVerses} / {TOTAL_VERSES}</span>
            </div>
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className="h-full rounded-full bg-primary dark:bg-emerald-500 shadow-[0_0_10px_rgba(20,184,166,0.8)] dark:shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="px-5 py-2.5 bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 rounded-full text-xs font-black whitespace-nowrap shrink-0 active:scale-95 transition-all border border-primary/20 dark:border-emerald-500/20">
            ابدأ الآن
          </div>
        </div>
      </div>

      {/* Background decoration */}

    </Link>
  );
}
