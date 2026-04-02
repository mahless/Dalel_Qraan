import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, ChevronUp, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import prophetData from '../data/prophet_muhammad.json';
import QuranVerse from '../components/QuranVerse';
import { formatPeaceBeUponHim } from '../utils/textFormatters';

export default function ProphetMuhammad() {
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
            className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center active:bg-indigo-500/20 transition-all overflow-hidden shrink-0 border border-indigo-500/10"
          >
            <img src="/icons/hadith_icon.png" alt="Back" className="w-10 h-10 object-contain drop-shadow-sm" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-black dark:text-white leading-none">خاتم الرسل ﷺ</h1>
            <p className="text-xs text-black/60 dark:text-slate-400 font-medium mt-1">
              سيرة عطرة ومواقف خالدة
            </p>
          </div>
        </header>
      </div>

      <div className="space-y-8">
        {prophetData.sections.map((section, sectionIndex) => (
          <div key={section.id} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="flex items-center gap-3 px-2 mb-2"
            >
              <div className="h-6 w-1 bg-emerald-500 rounded-full" />
              <h2 className="text-lg font-black text-black dark:text-white/90 flex items-center gap-2">
                {section.title}
                <span className="text-xs font-medium text-emerald-500/50 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                  {section.topics.length} موضوعات
                </span>
              </h2>
            </motion.div>

            <div className="space-y-4">
              {section.topics.map((topic, topicIndex) => {
                const globalIndex = prophetData.sections
                  .slice(0, sectionIndex)
                  .reduce((acc, s) => acc + s.topics.length, 0) + topicIndex;
                
                return (
                  <motion.div
                    key={globalIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: globalIndex * 0.03 }}
                    className="glass rounded-[2rem] card-shadow overflow-hidden border border-transparent active:border-emerald-500/20 dark:active:border-emerald-500/20 transition-all"
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => toggleExpand(globalIndex)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs shadow-inner">
                           {globalIndex + 1}
                         </div>
                         <h3 className="text-lg font-black text-black dark:text-white">
                           {topic.title}
                         </h3>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-black/20 dark:text-white/20">
                          {expandedId === globalIndex ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>

                      <p className="text-xs text-black/50 dark:text-slate-500 leading-relaxed line-clamp-2 px-1">
                        {formatPeaceBeUponHim(topic.content)}
                      </p>
                    </div>

                    <AnimatePresence>
                      {expandedId === globalIndex && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-6 pt-2 space-y-4 text-right" dir="rtl">
                            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5">
                              <p className="text-lg text-black/80 dark:text-slate-300 leading-relaxed font-semibold whitespace-pre-wrap">
                                {formatPeaceBeUponHim(topic.content)}
                              </p>
                            </div>

                            {topic.references && topic.references.length > 0 && (
                              <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 px-1">
                                  <Sparkles size={14} />
                                  <span className="text-xs font-bold uppercase tracking-wider">من وحي القرآن الكريم</span>
                                </div>
                                {topic.references.map((ref, refIndex) => (
                                  <div key={refIndex} className="bg-emerald-500/5 dark:bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10">
                                    <QuranVerse text={ref.text} className="!my-0 !text-[22px] !leading-relaxed text-emerald-800 dark:text-emerald-300" />
                                    <div className="mt-3 flex items-center justify-end gap-2 text-xs text-emerald-600/60 dark:text-emerald-400/60 font-bold">
                                      <span>سورة {ref.surah}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.5 }}
        className="mt-12 flex flex-col items-center justify-center text-center opacity-40 active:opacity-100 transition-opacity"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500/50 mb-3">
          <Heart size={20} fill="currentColor" fillOpacity={0.1} />
        </div>
        <p className="text-xs text-black dark:text-white font-medium max-w-[200px] leading-relaxed">
          نستقبل المزيد من الموضوعات قريباً بإذن الله لتغطية كافة جوانب السيرة العطرة
        </p>
      </motion.div>
    </div>
  );
}
