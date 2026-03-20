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
  const { darkMode } = useStore();

  const filteredStories = useMemo(() => {
    const stories = (storiesData as Story[]).filter(s => {
      if (activeTab === 'sub') return s.category === 'sub';
      return s.category !== 'sub'; // Default to main if category is missing or 'main'
    });

    if (isTimeline) {
      return stories.sort((a, b) => (a.timelineOrder || 0) - (b.timelineOrder || 0));
    }
    return stories.sort((a, b) => (a.educationOrder || 0) - (b.educationOrder || 0));
  }, [isTimeline, activeTab]);

  return (
    <div className="pb-32 pt-32 px-6 max-w-2xl mx-auto">
      <div className="fixed top-8 left-0 right-0 z-50 px-4 py-3">
        <header className="glass rounded-2xl px-6 py-4 flex flex-col gap-4 max-w-2xl mx-auto card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-black dark:text-slate-100">قصص القرآن</h1>
              <p className="text-[10px] text-black/60 dark:text-slate-400 font-medium">عبر وقصص من كتاب الله</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTimeline(!isTimeline)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isTimeline 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {isTimeline ? <Clock size={14} /> : <BookOpen size={14} />}
                {isTimeline ? 'تسلسل زمني' : 'ترتيب تعليمي'}
              </button>
            </div>
          </div>

          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl">
            <button
              onClick={() => setActiveTab('main')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'main'
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                  : 'text-black/40 dark:text-slate-500 hover:text-black/60 dark:hover:text-slate-300'
              }`}
            >
              قصص الأنبياء
            </button>
            <button
              onClick={() => setActiveTab('sub')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'sub'
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                  : 'text-black/40 dark:text-slate-500 hover:text-black/60 dark:hover:text-slate-300'
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
    </div>
  );
}
