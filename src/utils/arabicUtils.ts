/**
 * Normalizes Arabic text for smarter searching.
 * Handles Alef variations, Teh Marbuta, Heh, removes diacritics (Tashkeel),
 * and removes Quranic-specific Unicode marks (stop signs, superscript alef, etc.).
 */
export const normalizeArabic = (text: string): string => {
  if (!text) return '';

  return text
    .toLowerCase()
    // Remove BOM
    .replace(/\uFEFF/g, '')
    // Remove standard diacritics/tashkeel (U+064B - U+0652)
    .replace(/[\u064B-\u0652]/g, '')
    // Remove extended Arabic diacritics (maddah U+0653, hamza above U+0654)
    .replace(/[\u0653\u0654]/g, '')
    // Convert superscript alef (U+0670) to regular alef — it represents a real letter in Quranic text
    .replace(/\u0670/g, 'ا')
    // Remove Quranic annotation signs (U+06D6 - U+06ED): stop marks, sajdah, etc.
    .replace(/[\u06D6-\u06ED]/g, '')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Normalize Alef Wasla (ٱ U+0671) to bare Alef (ا)
    .replace(/\u0671/g, 'ا')
    // Normalize Alef variations (أ, إ, آ) to bare Alef (ا)
    .replace(/[أإآ]/g, 'ا')
    // Normalize Teh Marbuta (ة) to Heh (ه)
    .replace(/ة/g, 'ه')
    // Normalize Yaa (ي) and Alef Maksura (ى) to bare Yaa (ي)
    .replace(/[يى]/g, 'ي')
    // Remove small high/low marks used in Quran typography (U+06D0-U+06D5 range letters if any)
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Removes only diacritics (Tashkeel) from Arabic text while keeping letters as is.
 */
export const removeTashkeel = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u0652]/g, '') // Standard Tashkeel
    .replace(/[\u0653\u0654]/g, ''); // Maddah and Hamza above
};

/**
 * Formats Quranic text for display, specifically handling the Iqlab Meem (U+06E2)
 * Removes it unless the next base letter is Baa (ب) or Meem (م).
 */
export const formatQuranText = (text: string): string => {
  if (!text) return '';

  let formatted = text.replace(/\u06E2/g, (match, offset, originalString) => {
    // Look ahead to find the next base Arabic letter
    let nextLetter = '';
    for (let i = offset + 1; i < originalString.length; i++) {
      const char = originalString[i];
      // Check if char is an Arabic letter (basic + Alef Wasla)
      if (/[\u0621-\u064A\u0671]/.test(char)) {
        nextLetter = char;
        break;
      }
    }
    // Keep it if the next letter is Baa or Meem
    if (nextLetter === '\u0628' || nextLetter === '\u0645') {
      return match;
    }
    // Otherwise remove it
    return '';
  });

  // Force 'الكاف العريضة' (Wide Kaf) by replacing standard Kaf (\u0643) with Swash Kaf (\u06AA).
  // This is the native Unicode character for the Stretched Kaf used in Quranic calligrapy.
  // We only replace medial/initial Kafs, which are followed by any diacritics and then another connecting letter.
  formatted = formatted.replace(/\u0643([\u064B-\u065F\u0670\u06D6-\u06ED]*)(?=[\u0621-\u064A\u0671\u06AA])/g, '\u06AA$1');

  return formatted;
};

/**
 * Returns Quranic text as an HTML string with stop marks wrapped in spans for CSS styling.
 */
export const formatQuranTextAsHtml = (text: string): string => {
  let formatted = formatQuranText(text);
  // Wrap Quranic stop marks (\u06D6 to \u06DC) in an inline-block span.
  // We provide a non-breaking space (&nbsp;) as a base character because these are combining marks.
  // We capture any preceding space and remove it so we don't double space.
  formatted = formatted.replace(/( ?)([\u06D6-\u06DC])/g, ' <span class="quran-stop-mark">&nbsp;$2</span>');
  return formatted;
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
 * Calculates a match score for sorting search results.
 * Higher score means better match.
 */
export const getArabicMatchScore = (target: string, query: string): number => {
  if (!target || !query) return 0;

  const normalizedTarget = normalizeArabic(target);
  const normalizedQuery = normalizeArabic(query);

  if (!normalizedTarget.includes(normalizedQuery)) return 0;

  // 1. Exact match
  if (normalizedTarget === normalizedQuery) return 100;

  // 2. Starts with query
  if (normalizedTarget.startsWith(normalizedQuery)) return 50;

  // 3. Word boundary exact match (e.g., searching "نور" in "سورة النور")
  const words = normalizedTarget.split(' ');
  if (words.includes(normalizedQuery)) return 30;

  // 4. Word boundary starts with
  if (words.some(w => w.startsWith(normalizedQuery))) return 20;

  // 5. General contains
  return 10;
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
