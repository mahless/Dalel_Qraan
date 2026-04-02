import surahsData from '../data/surahs.json';
import juzMapping from '../data/juz_mapping.json';
import { WirdVerse, WirdRange, WirdSettings } from '../types/wird';

export const TOTAL_VERSES = 6236;

interface SurahInfo {
  number: number;
  name: string;
  versesCount: number;
}

const surahs = surahsData as SurahInfo[];

// Map surah number to its starting global verse index (1-indexed)
const surahStartIndices: number[] = [];
let currentIndex = 1;
surahs.forEach(s => {
  surahStartIndices[s.number] = currentIndex;
  currentIndex += s.versesCount;
});

export const getGlobalVerseIndex = (surah: number, ayah: number): number => {
  return (surahStartIndices[surah] || 1) + ayah - 1;
};

export const getVerseFromGlobalIndex = (index: number): WirdVerse => {
  if (index <= 0) return { surah: 1, ayah: 1 };
  if (index > TOTAL_VERSES) return { surah: 114, ayah: 6 };

  for (let i = 114; i >= 1; i--) {
    if (index >= surahStartIndices[i]) {
      return {
        surah: i,
        ayah: index - surahStartIndices[i] + 1
      };
    }
  }
  return { surah: 1, ayah: 1 };
};

export const getJuzStartIndices = () => {
  return juzMapping.map(j => getGlobalVerseIndex(j.surah, j.ayah));
};

export const getNextWirdRange = (
  lastVerse: WirdVerse,
  settings: WirdSettings
): WirdRange => {
  const startIndex = getGlobalVerseIndex(lastVerse.surah, lastVerse.ayah) + 1;
  const juzStarts = getJuzStartIndices();
  
  if (startIndex > TOTAL_VERSES) {
    return { startSurah: 114, startAyah: 6, endSurah: 114, endAyah: 6 };
  }

  let targetEndIndex: number;

  if (settings.mode === 'juz') {
    // Juz mode: 1, 0.5, 0.25
    const currentJuz = juzMapping.find((j, idx) => {
      const nextJuzStart = juzStarts[idx + 1] || TOTAL_VERSES + 1;
      return startIndex < nextJuzStart;
    })?.juz || 30;

    const juzIdx = currentJuz - 1;
    const juzStart = juzStarts[juzIdx];
    const juzEnd = (juzStarts[juzIdx + 1] || TOTAL_VERSES + 1) - 1;
    const juzSize = juzEnd - juzStart + 1;

    if (settings.value === 1) {
      targetEndIndex = juzEnd;
    } else if (settings.value === 0.5) {
      const mid = juzStart + Math.floor(juzSize / 2);
      targetEndIndex = startIndex <= mid ? mid : juzEnd;
    } else { // 0.25
      const q1 = juzStart + Math.floor(juzSize / 4);
      const q2 = juzStart + Math.floor(juzSize / 2);
      const q3 = juzStart + Math.floor((3 * juzSize) / 4);
      
      if (startIndex <= q1) targetEndIndex = q1;
      else if (startIndex <= q2) targetEndIndex = q2;
      else if (startIndex <= q3) targetEndIndex = q3;
      else targetEndIndex = juzEnd;
    }
  } else {
    // Verse mode: 10, 20, 50, 100
    // Logic: Sequential chunks. Allow crossing surah boundaries.
    targetEndIndex = startIndex + settings.value - 1;
  }

  targetEndIndex = Math.min(targetEndIndex, TOTAL_VERSES);
  
  const startVerse = getVerseFromGlobalIndex(startIndex);
  const finalEndVerse = getVerseFromGlobalIndex(targetEndIndex);

  return {
    startSurah: startVerse.surah,
    startAyah: startVerse.ayah,
    endSurah: finalEndVerse.surah,
    endAyah: finalEndVerse.ayah
  };
};

export const getRangeDescription = (startIndex: number, endIndex: number): string => {
  const start = getVerseFromGlobalIndex(startIndex);
  const end = getVerseFromGlobalIndex(endIndex);
  
  if (start.surah === end.surah) {
    return `سورة ${surahs[start.surah - 1].name} (${start.ayah}-${end.ayah})`;
  } else {
    return `${surahs[start.surah - 1].name} (${start.ayah}) إلى ${surahs[end.surah - 1].name} (${end.ayah})`;
  }
};
