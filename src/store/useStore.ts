import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const FOLDER_NAME = 'quranAppDB';
const STATE_FILE = 'appState.json';

// Custom storage engine for Zustand using Capacitor Filesystem
const fileStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const result = await Filesystem.readFile({
        path: `${FOLDER_NAME}/${STATE_FILE}`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      const data = JSON.parse(result.data as string);
      return data[name] || null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    let currentData: any = {};
    try {
      const result = await Filesystem.readFile({
        path: `${FOLDER_NAME}/${STATE_FILE}`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      currentData = JSON.parse(result.data as string);
    } catch {}

    currentData[name] = value;
    
    try {
      await Filesystem.mkdir({
        path: FOLDER_NAME,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch {}

    await Filesystem.writeFile({
      path: `${FOLDER_NAME}/${STATE_FILE}`,
      data: JSON.stringify(currentData),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      const result = await Filesystem.readFile({
        path: `${FOLDER_NAME}/${STATE_FILE}`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      const data = JSON.parse(result.data as string);
      delete data[name];
      await Filesystem.writeFile({
        path: `${FOLDER_NAME}/${STATE_FILE}`,
        data: JSON.stringify(data),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
    } catch {}
  },
};

export interface Bookmark {
  id: string;
  surahId: number;
  surahName: string;
  verseNumber?: number;
  juzNumber?: number;
  timestamp: number;
}

interface AppState {
  darkMode: boolean;
  fontSize: number;
  lastReadSurah: number | null;
  bookmarks: Bookmark[];
  searchQuery: string;
  toggleDarkMode: () => void;
  setFontSize: (size: number) => void;
  setLastReadSurah: (surahNumber: number) => void;
  setSearchQuery: (query: string) => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'timestamp'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (surahId: number, verseNumber?: number, juzNumber?: number) => boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      fontSize: 18,
      lastReadSurah: null,
      bookmarks: [],
      searchQuery: '',
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setFontSize: (size) => set({ fontSize: size }),
      setLastReadSurah: (surahNumber) => set({ lastReadSurah: surahNumber }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      addBookmark: (bookmark) => {
        const exists = get().bookmarks.some(
          b => b.surahId === bookmark.surahId && b.verseNumber === bookmark.verseNumber && b.juzNumber === bookmark.juzNumber
        );
        if (exists) return;

        const newBookmark: Bookmark = {
          ...bookmark,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
        };
        set((state) => ({
          bookmarks: [newBookmark, ...state.bookmarks],
        }));
      },
      removeBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
      })),
      isBookmarked: (surahId, verseNumber, juzNumber) => {
        return get().bookmarks.some(
          (b) => b.surahId === surahId && b.verseNumber === verseNumber && b.juzNumber === juzNumber
        );
      },
    }),
    {
      name: 'quran-guide-storage',
      storage: createJSONStorage(() => fileStorage),
    }
  )
);
