import surahsData from '../data/surahs.json';
import juzMapping from '../data/juz_mapping.json';
import hizbMappingRaw from '../data/hizb_mapping.json';
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

// Global indices of all 240 quarters + end of Quran
const quarterStarts = [
  ...hizbMappingRaw.map(h => getGlobalVerseIndex(h.surah, h.ayah)),
  TOTAL_VERSES + 1
];

export const getJuzStartIndices = () => {
  return juzMapping.map(j => getGlobalVerseIndex(j.surah, j.ayah));
};

export const getNextWirdRange = (
  lastVerse: WirdVerse,
  settings: WirdSettings
): WirdRange => {
  const startIndex = getGlobalVerseIndex(lastVerse.surah, lastVerse.ayah) + 1;
  
  if (startIndex > TOTAL_VERSES) {
    return { startSurah: 114, startAyah: 6, endSurah: 114, endAyah: 6 };
  }

  let targetEndIndex: number;

  if (settings.mode === 'juz') {
    // Correct logic: Find our position and align to requested block size
    const currentQIdx = quarterStarts.findIndex((start, idx) => {
      const nextStart = quarterStarts[idx + 1] || TOTAL_VERSES + 1;
      return startIndex >= start && startIndex < nextStart;
    });

    const safeQIdx = currentQIdx === -1 ? 0 : currentQIdx;
    
    // settings.value is number of quarters (e.g., 8 for Full Juz)
    const step = settings.value;
    
    // Calculate the next boundary that satisfies at least 50% of the goal 
    // to prevent very small portions, while forcing the alignment.
    let targetQEndIdx = Math.ceil((safeQIdx + 1) / step) * step;
    
    // If the remaining part of the current Juz is too small (less than 2 quarters for a full Juz)
    // and they wanted a full Juz, we give them "Rest of current + next full one"
    if (step >= 4 && (targetQEndIdx - safeQIdx) < (step / 2)) {
      targetQEndIdx += step;
    }

    targetQEndIdx = Math.min(targetQEndIdx, quarterStarts.length - 1);
    targetEndIndex = quarterStarts[targetQEndIdx] - 1;
  } else {
    // Verse mode
    targetEndIndex = startIndex + settings.value - 1;
  }

  targetEndIndex = Math.max(startIndex, Math.min(targetEndIndex, TOTAL_VERSES));
  
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
