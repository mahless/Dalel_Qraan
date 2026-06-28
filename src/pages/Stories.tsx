import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen } from 'lucide-react';
import StoryCard from '../components/StoryCard';
import storiesData from '../data/stories.json';
import { Story } from '../types/quran';
import { useStore } from '../store/useStore';

export default function Stories() {
  const [isTimeline, setIsTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'sub'>('main');
  const { theme } = useStore();
  const [displayLimit, setDisplayLimit] = useState(15);

  // Reset scroll to top when tab or sort changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab, isTimeline]);

  const filteredStories = useMemo(() => {
    const stories = (storiesData as Story[]).filter(s => {
      if (activeTab === 'sub') return s.category === 'sub';
      return s.category !== 'sub'; // Default to main if category is missing or 'main'
    });

    const sorted = isTimeline
      ? [...stories].sort((a, b) => (a.timelineOrder || 0) - (b.timelineOrder || 0))
      : [...stories].sort((a, b) => (a.educationOrder || 0) - (b.educationOrder || 0));
    
    return sorted.slice(0, displayLimit);
  }, [isTimeline, activeTab, displayLimit]);

  const hasMore = useMemo(() => {
    const totalCount = (storiesData as Story[]).filter(s => {
      if (activeTab === 'sub') return s.category === 'sub';
      return s.category !== 'sub';
    }).length;
    return displayLimit < totalCount;
  }, [activeTab, displayLimit]);

  const resetLimit = () => setDisplayLimit(15);

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-4 flex flex-col gap-4 max-w-2xl mx-auto card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-black dark:text-slate-100">قصص القرآن</h1>
              <p className="text-xs text-black/60 dark:text-slate-400 font-medium">عبر وقصص من كتاب الله</p>
            </div>
            <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl">
              <button
                onClick={() => { setIsTimeline(false); resetLimit(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  !isTimeline
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-emerald-500/30'
                    : 'text-black/40 dark:text-slate-500 hover:text-black/60 dark:hover:text-slate-300'
                }`}
              >
                <BookOpen size={14} />
                <span className="hidden sm:inline">ترتيب </span>تعليمي
              </button>
              <button
                onClick={() => { setIsTimeline(true); resetLimit(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isTimeline
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-emerald-500/30'
                    : 'text-black/40 dark:text-slate-500 hover:text-black/60 dark:hover:text-slate-300'
                }`}
              >
                <Clock size={14} />
                <span className="hidden sm:inline">تسلسل </span>زمني
              </button>
            </div>
          </div>

          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent">
            <button
              onClick={() => { setActiveTab('main'); resetLimit(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'main'
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-emerald-500/30'
                  : 'text-black/40 dark:text-slate-500 active:text-black/60 dark:active:text-slate-300 border border-transparent'
              }`}
            >
              قصص الأنبياء
            </button>
            <button
              onClick={() => { setActiveTab('sub'); resetLimit(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'sub'
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-emerald-500/30'
                  : 'text-black/40 dark:text-slate-500 active:text-black/60 dark:active:text-slate-300 border border-transparent'
              }`}
            >
              قصص فرعيه
            </button>
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-20">
        {filteredStories.map((story, index) => (
          <StoryCard key={story.id} story={story} index={index} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setDisplayLimit(prev => prev + 15)}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 active:scale-95 transition-all text-lg"
          >
            عرض المزيد من القصص ✨
          </button>
        </div>
      )}
    </div>
  );
}
