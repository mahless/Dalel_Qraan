import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Heart, Sparkles, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ruqyahData from '../data/ruqyah.json';
import QuranVerse from '../components/QuranVerse';
import { useStore } from '../store/useStore';
import { formatPeaceBeUponHim } from '../utils/textFormatters';

interface RuqyahItem {
  id: string;
  title: string;
  type: string;
  text: string;
  source: string;
}

export default function Ruqyah() {
  const navigate = useNavigate();
  const { theme } = useStore();

  return (
    <div className="pb-32 pt-34 px-4 max-w-2xl mx-auto min-h-screen">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <nav className="glass rounded-2xl px-2 py-4 flex items-center justify-between max-w-2xl mx-auto card-shadow">
            <div className="flex items-center gap-0">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-90 transition-all shrink-0"
                title="الرجوع"
              >
                <ArrowRight size={20} />
              </button>
              <div className="flex flex-col items-start pr-1">
                <h1 className="text-lg font-black text-black dark:text-slate-100">الرقية الشرعية</h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-none">تحصين وشفاء</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
        </nav>
      </div>

      <div className="space-y-6">
        {ruqyahData.map((item: RuqyahItem, index: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-3xl card-shadow overflow-hidden border border-transparent hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-inner ${
                    item.type === 'quran' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {item.type === 'quran' ? <BookOpen size={16} /> : <Sparkles size={16} />}
                  </div>
                  <h3 className="text-lg font-black text-black dark:text-slate-100">{formatPeaceBeUponHim(item.title)}</h3>
                </div>
                <span className={`text-xs font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                  item.type === 'quran'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                }`}>
                  {item.type === 'quran' ? 'قرآن كريم' : 'حديث نبوي'}
                </span>
              </div>

              <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 border border-black/5 dark:border-white/5 relative mb-4">
                {item.type === 'quran' ? (
                  <QuranVerse text={item.text} className="!my-0 !text-[24px] !leading-[2.1] text-slate-800 dark:text-slate-200" />
                ) : (
                  <p className="text-lg text-black/80 dark:text-slate-300 leading-normal font-black text-center">
                    {formatPeaceBeUponHim(item.text)}
                  </p>
                )}
                <div className="absolute top-2 right-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                   <ShieldCheck size={40} />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 text-xs text-slate-400 dark:text-slate-500 font-bold px-1">
                <span>المصدر:</span>
                <span>{item.source}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.8 }}
        className="mt-12 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 transition-opacity"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500/50 mb-3">
          <Heart size={20} fill="currentColor" fillOpacity={0.1} />
        </div>
        <p className="text-xs text-black dark:text-white font-medium max-w-[200px] leading-normal">
          اللهم اشفِ كُل مريض، وعافِ كُل مبتلى، وارحم موتى المسلمين أجمعين.
        </p>
      </motion.div>
    </div>
  );
}
