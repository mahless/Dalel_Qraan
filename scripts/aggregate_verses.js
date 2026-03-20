import fs from 'fs';
import path from 'path';

const quranDir = './src/data/quran';
const outputDir = './src/data';
const outputFile = path.join(outputDir, 'verses_search.json');

const surahs = [];

for (let i = 1; i <= 114; i++) {
  const filePath = path.join(quranDir, `surah_${i}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const surahName = data.name;
    const surahNumber = i;
    
    Object.entries(data.verse).forEach(([key, text]) => {
      const verseNumber = parseInt(key.replace('verse_', ''));
      surahs.push({
        s: surahNumber,
        n: surahName,
        v: verseNumber,
        t: text
      });
    });
  }
}

fs.writeFileSync(outputFile, JSON.stringify(surahs));
console.log(`Aggregated ${surahs.length} verses into ${outputFile}`);
