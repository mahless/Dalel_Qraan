/**
 * Normalizes Arabic text for smarter searching.
 * Handles Alef variations, Teh Marbuta, Heh, and removes diacritics (Tashkeel).
 */
export const normalizeArabic = (text: string): string => {
  if (!text) return '';

  return text
    .toLowerCase()
    // Remove diacritics (Tashkeel)
    .replace(/[\u064B-\u0652]/g, '')
    // Normalize Alef variations (أ, إ, آ) to bare Alef (ا)
    .replace(/[أإآ]/g, 'ا')
    // Normalize Teh Marbuta (ة) to Heh (ه)
    .replace(/ة/g, 'ه')
    // Normalize Yaa (ي) and Alef Maksura (ى) to bare Yaa (ي)
    .replace(/[يى]/g, 'ي')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Returns a deterministic set of 3 stories based on the current date.
 */
export const getDailyFeaturedStories = (stories: any[]) => {
  if (!stories || stories.length === 0) return [];
  
  // Filter for main stories if possible, otherwise use all
  const mainStories = stories.filter(s => s.category !== 'sub');
  const pool = mainStories.length >= 3 ? mainStories : stories;
  
  const today = new Date();
  // Using YYYYMMDD as a seed
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  const result: any[] = [];
  const indices = new Set<number>();
  const count = pool.length;
  
  // Simple deterministic "random" selection
  let currentSeed = seed;
  while (indices.size < Math.min(3, count)) {
    // Linear congruential generator style
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    const index = currentSeed % count;
    indices.add(index);
  }
  
  indices.forEach(i => result.push(pool[i]));
  return result;
};

/**
 * Returns a deterministic daily verse based on the current date.
 */
export const getDailyVerse = (surahs: any[]) => {
  if (!surahs || surahs.length === 0) return null;
  
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Use seed to pick a surah
  const surahIndex = seed % surahs.length;
  const surah = surahs[surahIndex];
  
  // Use seed to pick a verse within that surah
  const verseCount = surah.versesCount || 7; // Default to 7 if not found
  const verseNumber = (seed % verseCount) + 1;
  
  return {
    surahNumber: surah.number,
    surahName: surah.name,
    verseNumber
  };
};

/**
 * Checks if a search query matches a target text after normalization.
 */
export const arabicIncludes = (target: string, query: string): boolean => {
  const normalizedTarget = normalizeArabic(target);
  const normalizedQuery = normalizeArabic(query);
  return normalizedTarget.includes(normalizedQuery);
};

/**
 * Returns a deterministic daily verse from a list, rotating through them incrementally.
 */
export const getDailyRotatedStaticVerse = (verses: any[]) => {
  if (!verses || verses.length === 0) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Use a fixed reference date (e.g. March 1, 2024) to ensure consistent rotation
  const startDate = new Date('2024-03-01').getTime(); 
  const daysSinceStart = Math.floor((today.getTime() - startDate) / (1000 * 60 * 60 * 24));
  
  // Cycle through verses without skipping
  const index = Math.abs(daysSinceStart) % verses.length;
  return verses[index];
};
