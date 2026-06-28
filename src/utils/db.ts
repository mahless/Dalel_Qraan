import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const FOLDER_NAME = 'quranAppDB';
const FILE_NAME = 'explanations.json';

export interface SavedTafsir {
  key: string; // surahNumber:ayahNumber
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  verseText: string;
  tafsirText: string;
  savedAt: number;
}

const ensureFolderExists = async () => {
  try {
    await Filesystem.mkdir({
      path: FOLDER_NAME,
      directory: Directory.Documents,
      recursive: true,
    });
  } catch (e) {
    // Folder might already exist
  }
};

const readTafsirsFromFile = async (): Promise<SavedTafsir[]> => {
  try {
    const result = await Filesystem.readFile({
      path: `${FOLDER_NAME}/${FILE_NAME}`,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    return JSON.parse(result.data as string) as SavedTafsir[];
  } catch (e) {
    return [];
  }
};

const writeTafsirsToFile = async (tafsirs: SavedTafsir[]): Promise<void> => {
  await ensureFolderExists();
  await Filesystem.writeFile({
    path: `${FOLDER_NAME}/${FILE_NAME}`,
    data: JSON.stringify(tafsirs, null, 2),
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });
};

export const saveTafsir = async (tafsir: SavedTafsir): Promise<void> => {
  const tafsirs = await readTafsirsFromFile();
  const index = tafsirs.findIndex(t => t.key === tafsir.key);
  if (index !== -1) {
    tafsirs[index] = tafsir;
  } else {
    tafsirs.push(tafsir);
  }
  await writeTafsirsToFile(tafsirs);
};

export const getTafsir = async (key: string): Promise<SavedTafsir | undefined> => {
  const tafsirs = await readTafsirsFromFile();
  return tafsirs.find(t => t.key === key);
};

export const getAllTafsirs = async (): Promise<SavedTafsir[]> => {
  const tafsirs = await readTafsirsFromFile();
  return tafsirs.sort((a, b) => b.savedAt - a.savedAt);
};

export const deleteTafsir = async (key: string): Promise<void> => {
  const tafsirs = await readTafsirsFromFile();
  const updatedTafsirs = tafsirs.filter(t => t.key !== key);
  await writeTafsirsToFile(updatedTafsirs);
};

// These were used for IndexedDB init, no longer needed but keeping exports if needed for compatibility
export const initDB = async () => {};
