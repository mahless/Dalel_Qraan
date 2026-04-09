import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const BACKUP_FOLDER = 'DalelQuranData';
const BACKUP_FILE = 'bookmarks_backup.json';

// Write a visible backup file to Documents folder
const writeVisibleBackup = async (value: string) => {
  try {
    try {
      await Filesystem.mkdir({
        path: BACKUP_FOLDER,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch {}

    await Filesystem.writeFile({
      path: `${BACKUP_FOLDER}/${BACKUP_FILE}`,
      data: value,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
  } catch (e) {
    console.warn('Failed to write visible backup:', e);
  }
};

// Read from visible backup file (fallback)
const readVisibleBackup = async (): Promise<string | null> => {
  try {
    const result = await Filesystem.readFile({
      path: `${BACKUP_FOLDER}/${BACKUP_FILE}`,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    return result.data as string;
  } catch {
    return null;
  }
};

// Dual storage: Preferences (reliable) + visible file backup
const dualStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      // Try Preferences first
      const { value } = await Preferences.get({ key: name });
      if (value) return value;
      
      // Fallback to visible file
      const backup = await readVisibleBackup();
      if (backup) {
        // Restore to Preferences
        await Preferences.set({ key: name, value: backup });
      }
      return backup;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      // Save to Preferences (primary)
      await Preferences.set({ key: name, value });
      // Save visible backup file to Documents
      await writeVisibleBackup(value);
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await Preferences.remove({ key: name });
    } catch {}
  },
};

export interface Bookmark {
  id: string;
  surahId: number;
  surahName: string;
  verseNumber?: number;
  juzNumber?: number;
  fontSize: number;
  timestamp: number;
}

interface AppState {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  uiFontSize: number;
  lastReadSurah: number | null;
  bookmarks: Bookmark[];
  searchQuery: string;
  notificationsEnabled: boolean;
  notificationTime: string;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setFontSize: (size: number) => void;
  setUiFontSize: (size: number) => void;
  setLastReadSurah: (surahNumber: number) => void;
  setSearchQuery: (query: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'timestamp' | 'fontSize'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (surahId: number, verseNumber?: number, juzNumber?: number) => boolean;
  modalCount: number;
  incrementModalCount: () => void;
  decrementModalCount: () => void;
  resetModalCount: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'auto',
      fontSize: 16,
      uiFontSize: 16,
      lastReadSurah: null,
      bookmarks: [],
      searchQuery: '',
      notificationsEnabled: true,
      notificationTime: '20:00',
      setTheme: (theme) => set({ theme }),
      setFontSize: (size) => set({ fontSize: size }),
      setUiFontSize: (size) => set({ uiFontSize: size }),
      setLastReadSurah: (surahNumber) => set({ lastReadSurah: surahNumber }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setNotificationTime: (time) => set({ notificationTime: time }),
      addBookmark: (bookmark) => {
        const exists = get().bookmarks.some(
          b => b.surahId === bookmark.surahId && b.verseNumber === bookmark.verseNumber && b.juzNumber === bookmark.juzNumber
        );
        if (exists) return;

        const newBookmark: Bookmark = {
          ...bookmark,
          id: Math.random().toString(36).substring(7),
          fontSize: get().fontSize,
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
      modalCount: 0,
      incrementModalCount: () => set((state) => ({ modalCount: state.modalCount + 1 })),
      decrementModalCount: () => set((state) => ({ modalCount: Math.max(0, state.modalCount - 1) })),
      resetModalCount: () => set({ modalCount: 0 }),
    }),
    {
      name: 'quran-guide-storage',
      storage: createJSONStorage(() => dualStorage),
      partialize: (state) => {
        const { modalCount, incrementModalCount, decrementModalCount, ...persistedState } = state;
        return persistedState;
      },
    }
  )
);
