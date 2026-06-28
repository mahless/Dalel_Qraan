import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Trophy, 
  Calendar, 
  ChevronRight, 
  CheckCircle2,
  RefreshCw,
  Shield,
  Heart
} from 'lucide-react';
import { useWirdStore } from '../store/useWirdStore';
import { getNextWirdRange, TOTAL_VERSES, getRangeDescription, getStreakStation, STATIONS } from '../utils/wirdUtils';

export default function QuranWird() {
  const navigate = useNavigate();
  const { settings, progress, setSettings, resetKhatmah, getEstimatedEndDate } = useWirdStore();
  const [showResetModal, setShowResetModal] = useState(false);

  const percentage = (progress.completedVerses / TOTAL_VERSES) * 100;
  const todayWird = getNextWirdRange(progress.lastVerse, settings);
  const station = getStreakStation(progress.streak);


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

      <div className="space-y-4">
        {/* Progress Bar & Streak Section */}
        <div className="glass p-3.5 rounded-3xl card-shadow flex flex-col justify-center gap-1.5">
          <div className="flex justify-between text-sm font-black mb-0.5 tracking-tight">
            <span className="text-primary dark:text-emerald-400">{Math.round(percentage)}% من القرآن</span>
            <span className="text-slate-400 dark:text-slate-500">{progress.completedVerses} / {TOTAL_VERSES}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className="h-full rounded-full bg-primary dark:bg-emerald-500 shadow-[0_0_10px_rgba(20,184,166,0.8)] dark:shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Streak Station UI */}
        <div className="glass p-4 rounded-3xl card-shadow flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-3xl shrink-0 drop-shadow-sm">
              {station.emoji}
            </div>
            <div className="flex-1 flex items-center flex-wrap gap-2">
              <h4 className="text-lg font-black text-amber-600 dark:text-amber-400 leading-none">
                {station.name}
              </h4>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-none">
                 <span className="text-primary dark:text-emerald-400">{progress.streak}</span> يوم استمرار
              </p>
              
              <div className="flex-grow" />
              
              {progress.graceChances > 0 ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-lg text-[10px] font-black leading-none">
                  <Heart size={10} className="fill-current" />
                  <span>1</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black leading-none">
                  <Heart size={10} className="opacity-50" />
                  <span>اقرأ {3 - (progress.graceRecovery || 0)} أيام</span>
                </div>
              )}
            </div>
          </div>

          {!station.isMaxLevel && (
            <div className="mt-1 w-full pt-1 px-1">
              <div className="flex justify-start text-[10px] font-black text-slate-400 mb-3">
                <span>باقي {station.daysRemaining} يوم للمحطة القادمة</span>
              </div>
              <div className="relative flex items-center justify-between w-full">
                {/* Background Line */}
                <div className="absolute left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 rounded-full top-1/2 -translate-y-1/2" />
                
                {/* Fill Line */}
                <div 
                  className="absolute right-0 h-1 bg-amber-400 dark:bg-amber-500 rounded-full top-1/2 -translate-y-1/2 transition-all duration-1000"
                  style={{ width: `${Math.min(100, (progress.streak / STATIONS[STATIONS.length - 1].days) * 100)}%` }}
                />

                {/* Stations Dots */}
                {STATIONS.map((s, idx) => {
                  const isPassed = progress.streak >= s.days;
                  const isCurrent = s.days === station.days;
                  return (
                    <div key={idx} className="relative flex justify-center z-10" title={s.name}>
                      <div 
                        className={`rounded-full transition-all duration-500 ${
                          isCurrent 
                            ? 'w-4 h-4 bg-amber-500 border-2 border-white dark:border-slate-900 scale-110 shadow-md flex items-center justify-center text-[8px]' 
                            : isPassed 
                              ? 'w-2.5 h-2.5 bg-amber-400 border border-amber-400' 
                              : 'w-2 h-2 bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isCurrent && <span className="absolute -top-4 text-xs">{s.emoji}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Khatmah Settings - Always visible */}
        <div className="glass p-3 rounded-3xl card-shadow bg-primary/5 dark:bg-emerald-500/5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-black text-primary dark:text-emerald-400">كمية الورد اليومي</h3>
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
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'ربع حزب', mode: 'juz', value: 1 },
                  { label: 'حزب', mode: 'juz', value: 4 },
                  { label: 'حزب ونصف', mode: 'juz', value: 6 },
                  { label: 'جزء كامل', mode: 'juz', value: 8 }
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setSettings({ mode: option.mode as any, value: option.value })}
                    className={`px-3 py-2.5 rounded-2xl transition-all font-black text-sm border flex items-center justify-center gap-2 ${
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
              
              {/* Estimated time display */}
              <motion.div 
                key={settings.value}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center justify-center gap-2 text-primary/60 dark:text-emerald-400/60"
              >
                <span className="text-[10px] font-bold leading-none text-center">
                  {settings.value === 1 && "يستغرق حوالي ٥ دقائق بقراءة متوسطة"}
                  {settings.value === 4 && "يستغرق حوالي ١٥ دقيقة بقراءة متوسطة"}
                  {settings.value === 6 && "يستغرق حوالي ٢٠ دقيقة بقراءة متوسطة"}
                  {settings.value === 8 && "يستغرق حوالي ٣٠ دقيقة بقراءة متوسطة"}
                </span>
              </motion.div>
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
            className="fixed inset-0 z-[120] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
          >

            <h1 className="text-4xl font-black mb-4 text-black dark:text-white">مبارك!</h1>
            <p className="text-base text-slate-600 dark:text-slate-300 mb-6 font-bold">
              لقد أتممت ختم القرآن الكريم بنجاح. جعل الله ذلك في ميزان حسناتك.
            </p>
            <div className="bg-emerald-500/10 p-6 rounded-3xl mb-8 border border-emerald-500/20 max-w-md mx-auto relative overflow-hidden">
              <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-3 bg-emerald-500/20 inline-block px-3 py-1 rounded-full">دعاء ختم القرآن</div>
              <p className="text-base sm:text-lg text-emerald-800 dark:text-emerald-300 leading-loose font-bold text-center" style={{ fontFamily: 'var(--font-quran)' }}>
                "اللَّهُمَّ ارْحَمْنِي بالقُرْءَانِ وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً، اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ العَالَمِينَ"
              </p>
            </div>
            <button
              onClick={resetKhatmah}
              className="w-full max-w-sm py-4 bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 rounded-2xl text-lg font-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-primary/20 dark:border-emerald-500/20 shadow-xl shadow-primary/10 dark:shadow-emerald-500/20 mx-auto"
            >
              ابدأ ختمة جديدة
              <RefreshCw size={20} />
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
                className="relative glass p-8 rounded-[32px] card-shadow max-w-sm w-full text-center overflow-hidden safe-modal"
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
