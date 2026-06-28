import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WirdSettings, WirdProgress, WirdVerse, WirdMode } from '../types/wird';
import { getGlobalVerseIndex, TOTAL_VERSES, getVerseFromGlobalIndex } from '../utils/wirdUtils';

interface WirdState {
  settings: WirdSettings;
  progress: WirdProgress;
  setSettings: (settings: Partial<WirdSettings>) => void;
  markAsRead: (lastVerse: WirdVerse) => void;
  resetKhatmah: () => void;
  getEstimatedEndDate: () => string;
}

const DEFAULT_SETTINGS: WirdSettings = {
  mode: 'juz',
  value: 1,
  startDate: new Date().toISOString()
};

const DEFAULT_PROGRESS: WirdProgress = {
  currentKhatmahId: Math.random().toString(36).substring(7),
  lastVerse: { surah: 1, ayah: 0 }, // 1:0 means hasn't started yet
  completedVerses: 0,
  totalVerses: TOTAL_VERSES,
  isCompleted: false,
  streak: 0,
  graceChances: 1,
  graceRecovery: 0,
  lastCompletedDate: null,
  history: []
};

export const useWirdStore = create<WirdState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      progress: DEFAULT_PROGRESS,

      setSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      markAsRead: (lastVerse) => {
        const state = get();
        const globalIndex = getGlobalVerseIndex(lastVerse.surah, lastVerse.ayah);
        const today = new Date().toLocaleDateString();
        
        let newStreak = state.progress.streak;
        let newGraceChances = state.progress.graceChances ?? 1;
        let newGraceRecovery = state.progress.graceRecovery ?? 0;

        if (state.progress.lastCompletedDate) {
          const lastDate = new Date(state.progress.lastCompletedDate);
          const todayDate = new Date();
          
          lastDate.setHours(0, 0, 0, 0);
          todayDate.setHours(0, 0, 0, 0);
          
          const diffTime = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) {
            // Already read today, no change
          } else if (diffDays === 1) {
            newStreak += 1;
            if (newGraceChances < 1) {
              newGraceRecovery += 1;
              if (newGraceRecovery >= 3) {
                newGraceChances = 1;
                newGraceRecovery = 0;
              }
            } else {
              newGraceRecovery = 0;
            }
          } else if (diffDays === 2) {
            if (newGraceChances > 0) {
              newGraceChances -= 1;
              newStreak += 1;
              newGraceRecovery = 1;
            } else {
              const nearestStation = Math.floor(state.progress.streak / 15) * 15;
              newStreak = nearestStation + 1;
              newGraceChances = 0;
              newGraceRecovery = 1;
            }
          } else if (diffDays > 2) {
            const nearestStation = Math.floor(state.progress.streak / 15) * 15;
            newStreak = nearestStation + 1;
            newGraceChances = 0;
            newGraceRecovery = 1;
          }
        } else {
          newStreak = 1;
          newGraceChances = 1;
          newGraceRecovery = 0;
        }

        const isCompleted = globalIndex >= TOTAL_VERSES;

        set((state) => ({
          progress: {
            ...state.progress,
            lastVerse,
            completedVerses: globalIndex,
            isCompleted,
            streak: newStreak,
            graceChances: newGraceChances,
            graceRecovery: newGraceRecovery,
            lastCompletedDate: new Date().toISOString(),
            history: [
              {
                date: new Date().toISOString(),
                startSurah: getVerseFromGlobalIndex(state.progress.completedVerses + 1).surah,
                startAyah: getVerseFromGlobalIndex(state.progress.completedVerses + 1).ayah,
                endSurah: lastVerse.surah,
                endAyah: lastVerse.ayah,
                versesCount: globalIndex - state.progress.completedVerses
              },
              ...state.progress.history
            ]
          }
        }));

        // Vibration
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      },

      resetKhatmah: () => set({
        progress: {
          ...DEFAULT_PROGRESS,
          currentKhatmahId: Math.random().toString(36).substring(7)
        }
      }),

      getEstimatedEndDate: () => {
        const state = get();
        const remainingVerses = TOTAL_VERSES - state.progress.completedVerses;
        
        let dailyVerses: number;
        if (state.settings.mode === 'verses') {
          dailyVerses = state.settings.value;
        } else {
          // Approximate: 6236 / 30 * value
          dailyVerses = (TOTAL_VERSES / 30) * state.settings.value;
        }

        const daysRemaining = Math.ceil(remainingVerses / dailyVerses);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + daysRemaining);
        
        return endDate.toLocaleDateString('ar-EG', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    }),
    {
      name: 'quran_wird_progress'
    }
  )
);
