import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, ChevronUp, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import staticTafsirs from '../data/static_tafsirs.json';
import QuranVerse from '../components/QuranVerse';

export default function StaticTafsirs() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto min-h-screen">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-4 flex items-center gap-4 max-w-2xl mx-auto card-shadow">
          <Link 
            to="/library"
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-white active:bg-black/10 dark:active:bg-white/10 transition-colors"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-black text-black dark:text-white leading-none">تفاسير بعض الأيات</h1>
            <p className="text-xs text-black/60 dark:text-slate-400 font-medium mt-1">
              مجموعة مختارة من الآيات وتفاسيرها
            </p>
          </div>
        </header>
      </div>

      <div className="space-y-4">
        {staticTafsirs.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-[2rem] card-shadow overflow-hidden border border-transparent active:border-primary/20 dark:active:border-emerald-500/20 transition-all"
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-emerald-500/10 flex items-center justify-center text-primary dark:text-emerald-400 font-bold text-xs shadow-inner">
                     {index + 1}
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-black dark:text-white leading-none">
                       سورة {item.surah}
                     </h3>
                     <p className="text-xs text-black/50 dark:text-slate-500 mt-1">آية {item.ayah_number}</p>
                   </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-black/20 dark:text-white/20">
                  {expandedId === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              <div className="text-center px-2">
                <QuranVerse text={item.text} className="!my-2 !text-[22px] !leading-relaxed text-black/90 dark:text-white/95" />
              </div>
            </div>

            <AnimatePresence>
              {expandedId === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-6 pt-2">
                    <div className="bg-primary/5 dark:bg-emerald-500/5 rounded-[1.5rem] p-5 relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-3 text-primary dark:text-emerald-400 relative z-10">
                        <Sparkles size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">التفسير والتدبر</span>
                      </div>
                      <p className="text-lg text-black/80 dark:text-slate-300 leading-relaxed text-right font-medium relative z-10">
                        {item.explanation}
                      </p>
                      <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
