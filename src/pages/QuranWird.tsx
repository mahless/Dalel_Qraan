import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Trophy, 
  Calendar, 
  ChevronRight, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useWirdStore } from '../store/useWirdStore';
import { getNextWirdRange, TOTAL_VERSES, getRangeDescription } from '../utils/wirdUtils';

export default function QuranWird() {
  const navigate = useNavigate();
  const { settings, progress, setSettings, resetKhatmah, getEstimatedEndDate } = useWirdStore();
  const [showResetModal, setShowResetModal] = useState(false);

  const percentage = (progress.completedVerses / TOTAL_VERSES) * 100;
  const todayWird = getNextWirdRange(progress.lastVerse, settings);


  const handleStartReading = () => {
    // Navigate to SurahDetails with the full range
    navigate(`/surahs/${todayWird.startSurah}?startAyah=${todayWird.startAyah}&endSurah=${todayWird.endSurah}&endAyah=${todayWird.endAyah}&wird=true`);
  };

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-4 flex items-center max-w-2xl mx-auto card-shadow">
          <div>
            <h1 className="text-lg font-black text-black dark:text-slate-100">الورد اليومي</h1>
            <p className="text-xs text-black/60 dark:text-slate-400 font-medium">خطتك لختم القرآن الكريم</p>
          </div>
        </header>
      </div>

      <div className="space-y-6">
        {/* Progress Bar & Streak Section */}
        <div className="glass p-5 rounded-3xl card-shadow flex flex-col justify-center min-h-[90px] gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">التقدم الإجمالي</h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-black">
                <Trophy size={12} />
                <span>{progress.streak} يوم استمرار</span>
              </div>
            </div>
            <span className="text-primary dark:text-emerald-400 font-extrabold text-xl">{Math.round(percentage)}%</span>
          </div>
          
          <div className="relative">
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className="h-full bg-gradient-to-l from-primary to-primary/60 dark:from-emerald-500 dark:to-emerald-400"
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
          
          <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-tighter">
            <span>{progress.completedVerses} آية مكتملة</span>
            <span>باقي {TOTAL_VERSES - progress.completedVerses} آية</span>
          </div>
        </div>



        {/* Khatmah Settings - Always visible */}
        <div className="glass p-5 rounded-3xl card-shadow bg-primary/5 dark:bg-emerald-500/5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-primary dark:text-emerald-400">إعدادات الختمة</h3>
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-2 text-rose-500 font-bold text-xs active:opacity-80 transition-opacity"
            >
              <RefreshCw size={14} />
              إعادة تعيين
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-400 mb-2 block uppercase tracking-wider">كمية الورد اليومي</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '١٠ آيات', mode: 'verses', value: 10 },
                  { label: '٢٠ آية', mode: 'verses', value: 20 },
                  { label: 'نصف جزء', mode: 'juz', value: 0.5 },
                  { label: 'جزء كامل', mode: 'juz', value: 1 }
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setSettings({ mode: option.mode as any, value: option.value })}
                    className={`px-4 py-3 rounded-2xl transition-all font-black text-sm border flex items-center justify-center gap-2 ${
                      settings.mode === option.mode && settings.value === option.value
                      ? 'bg-primary/20 text-primary border-primary dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500 shadow-lg shadow-primary/5' 
                      : 'bg-primary/5 text-slate-400 border-transparent dark:bg-white/5 dark:text-slate-500'
                    }`}
                  >
                    {settings.mode === option.mode && settings.value === option.value && (
                      <CheckCircle2 size={16} className="text-primary dark:text-emerald-400" />
                    )}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleStartReading}
          className="w-full py-4 bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 rounded-2xl text-lg font-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-primary/20 dark:border-emerald-500/20 shadow-xl shadow-primary/10 dark:shadow-emerald-500/20"
        >
          ابدأ قراءة الآن
          <ChevronRight size={20} className="rotate-180" />
        </motion.button>

        {/* Congratulations Screen (Overlay) */}
        {progress.isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[120] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-32 h-32 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
              <Trophy size={64} />
            </div>
            <h1 className="text-4xl font-black mb-4 text-black dark:text-white">مبارك!</h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-12">
              لقد أتممت ختم القرآن الكريم بنجاح. جعل الله ذلك في ميزان حسناتك.
            </p>
            <button
              onClick={resetKhatmah}
              className="px-12 py-5 bg-primary dark:bg-emerald-500 text-white rounded-3xl text-xl font-black card-shadow active:scale-95 transition-all"
            >
              ابدأ ختمة جديدة
            </button>
          </motion.div>
        )}

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {showResetModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowResetModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative glass p-8 rounded-[32px] card-shadow max-w-sm w-full text-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <RefreshCw size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">إعادة تعيين الختمة؟</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                  هل أنت متأكد من رغبتك في البدء من جديد؟ سيتم حذف كافة التقدم الحالي المسجل في هذه الختمة.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 active:scale-95 transition-all text-sm"
                  >
                    تراجع
                  </button>
                  <button
                    onClick={() => {
                      resetKhatmah();
                      setShowResetModal(false);
                    }}
                    className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all text-sm"
                  >
                    نعم، إعادة تعيين
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
