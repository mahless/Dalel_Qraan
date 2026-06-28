import React from 'react';
import { ArrowRight, BookOpen, Sparkles, Star, Scale, Book, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import azkarData from '../data/azkar.json';

export default function Library() {
  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto min-h-screen">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-4 flex items-center gap-4 max-w-2xl mx-auto card-shadow">
          <Link 
            to="/"
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-white active:bg-black/10 dark:active:bg-white/10 transition-colors"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-black text-black dark:text-white">المكتبة</h1>
            <p className="text-xs text-black/60 dark:text-slate-400 font-medium">
              من أصح المصادر
            </p>
          </div>
        </header>
      </div>

      <div className="space-y-4">
        {/* Card: اللؤلؤ والمرجان */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/library/hadith"
            className="block glass p-3 rounded-2xl card-shadow active:border-emerald-500/30 dark:active:border-emerald-500/30 transition-all border border-transparent"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 active:bg-emerald-500 active:text-white transition-colors flex-shrink-0 overflow-hidden">
                  <img src="/icons/prophet_mosque_icon.png" alt="Hadith Icon" className="w-8 h-8 object-contain" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-black dark:text-slate-100 mb-1 active:text-emerald-500 transition-colors truncate">الأحاديث النبوية</h3>
                  <p className="text-xs text-black/60 dark:text-slate-400 truncate">
                    من "الصحيحين" (البخاري ومسلم)
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400 active:bg-emerald-500 active:text-white transition-all rotate-180 flex-shrink-0">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card: خاتم الرسل سيدنا محمد ﷺ */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/library/prophet-muhammad"
            className="block glass p-3 rounded-2xl card-shadow active:border-indigo-500/30 dark:active:border-indigo-500/30 transition-all border border-transparent"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 active:bg-indigo-500 active:text-white transition-colors flex-shrink-0 overflow-hidden shadow-inner">
                  <img src="/icons/hadith_icon.png" alt="Prophet Muhammad Icon" className="w-8 h-8 object-contain drop-shadow-sm" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-black dark:text-slate-100 mb-1 active:text-indigo-500 transition-colors truncate">حياه سيدنا محمد ﷺ</h3>
                  <p className="text-xs text-black/60 dark:text-slate-400 truncate">
                    سيرة عطرة ومواقف خالدة
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400 active:bg-indigo-500 active:text-white transition-all rotate-180 flex-shrink-0">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card: أفضل الذكر */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/library/best-dhikr"
            className="block glass p-3 rounded-2xl card-shadow active:border-emerald-500/30 dark:active:border-emerald-500/30 transition-all border border-transparent"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 active:bg-emerald-500 active:text-white transition-colors flex-shrink-0">
                  <Sparkles size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-black dark:text-slate-100 mb-1 active:text-emerald-500 transition-colors truncate">أفضل الأذكار</h3>
                  <p className="text-xs text-black/60 dark:text-slate-400 truncate">
                    موسوعة الأذكار الشاملة واليومية
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400 active:bg-emerald-500 active:text-white transition-all rotate-180 flex-shrink-0">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card: الرقية الشرعية */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.25 }}
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/library/ruqyah"
            className="block glass p-3 rounded-2xl card-shadow active:border-emerald-500/30 dark:active:border-emerald-500/30 transition-all border border-transparent"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 active:bg-emerald-500 active:text-white transition-colors flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-black dark:text-slate-100 mb-1 active:text-emerald-500 transition-colors truncate">الرقية الشرعية</h3>
                  <p className="text-xs text-black/60 dark:text-slate-400 truncate">
                    تحصين من القرآن والسنة المعطرة
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400 active:bg-emerald-500 active:text-white transition-all rotate-180 flex-shrink-0">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card: تفاسير بعض الأيات */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/library/static-tafsirs"
            className="block glass p-3 rounded-2xl card-shadow active:border-orange-500/30 dark:active:border-orange-500/30 transition-all border border-transparent"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 active:bg-orange-500 active:text-white transition-colors flex-shrink-0">
                  <BookOpen size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-black dark:text-slate-100 mb-1 active:text-orange-500 transition-colors truncate">تفاسير بعض الأيات</h3>
                  <p className="text-xs text-black/60 dark:text-slate-400 truncate">
                    محتوى "آية اليوم" كامل
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400 active:bg-orange-500 active:text-white transition-all rotate-180 flex-shrink-0">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card: الأحكام القرآنية */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/rulings"
            className="block glass p-3 rounded-2xl card-shadow active:border-blue-500/30 dark:active:border-blue-500/30 transition-all border border-transparent"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 active:bg-blue-500 active:text-white transition-colors flex-shrink-0">
                  <Scale size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-black dark:text-slate-100 mb-1 active:text-blue-500 transition-colors truncate">الأحكام القرآنية</h3>
                  <p className="text-xs text-black/60 dark:text-slate-400 truncate">
                    تشريعات وأحكام من آيات الذكر
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400 active:bg-blue-500 active:text-white transition-all rotate-180 flex-shrink-0">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
