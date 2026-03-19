import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ScrollText, ArrowLeft } from 'lucide-react';
import { Story } from '../types/quran';

interface StoryCardProps {
  key?: React.Key;
  story: Story;
  index: number;
}

export default function StoryCard({ story, index }: StoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Link
        to={`/stories/${story.id}`}
        className="block glass p-6 rounded-3xl card-shadow group overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 dark:bg-emerald-500/10 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-primary/10 dark:group-hover:bg-emerald-500/20 transition-colors" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 dark:bg-emerald-500/20 rounded-lg text-primary dark:text-emerald-400">
              <ScrollText size={20} />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-slate-100">{story.title}</h3>
          </div>
          
          <div className="mb-1 text-primary/60 dark:text-emerald-500/60 text-[8px] font-black uppercase tracking-widest opacity-60">نبذة</div>
          <p className="text-black/90 dark:text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {story.summary}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {story.characters.slice(0, 3).map((char, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-emerald-800 border-2 border-white dark:border-emerald-900 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-emerald-400">
                  {char[0]}
                </div>
              ))}
              {story.characters.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-emerald-800 border-2 border-white dark:border-emerald-900 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-emerald-400">
                  +{story.characters.length - 3}
                </div>
              )}
            </div>
            
            <span className="text-primary dark:text-emerald-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
              اقرأ المزيد <ArrowLeft size={16} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
