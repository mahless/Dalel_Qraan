export type WirdMode = 'juz' | 'verses';

export interface WirdSettings {
  mode: WirdMode;
  value: number; // 1, 0.5, 0.25 for juz; 10, 20, 50 for verses
  startDate: string;
}

export interface WirdVerse {
  surah: number;
  ayah: number;
}

export interface WirdRange {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export interface WirdProgress {
  currentKhatmahId: string;
  lastVerse: WirdVerse;
  completedVerses: number;
  totalVerses: number;
  isCompleted: boolean;
  streak: number;
  lastCompletedDate: string | null;
  history: {
    date: string;
    startSurah: number;
    startAyah: number;
    endSurah: number;
    endAyah: number;
    versesCount: number;
  }[];
}

export interface WirdState {
  settings: WirdSettings;
  progress: WirdProgress;
}
