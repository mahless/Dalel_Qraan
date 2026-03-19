import React from 'react';
import RulingCard from '../components/RulingCard';
import rulingsData from '../data/rulings.json';
import { Ruling } from '../types/quran';
import { useStore } from '../store/useStore';

export default function Rulings() {
  const { darkMode } = useStore();
  return (
    <div className="pb-32 pt-32 px-6 max-w-2xl mx-auto">
      <div className="fixed top-8 left-0 right-0 z-50 px-4 py-3">
        <header className="glass rounded-2xl px-6 py-4 flex items-center justify-between max-w-2xl mx-auto card-shadow">
          <div>
            <h1 className="text-xl font-black text-black dark:text-slate-100">الأحكام القرآنية</h1>
            <p className="text-[10px] text-black/60 dark:text-slate-400 font-medium">تشريعات وأحكام من آيات الذكر</p>
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-4">
        {(rulingsData as Ruling[]).map((ruling, index) => (
          <RulingCard key={ruling.id} ruling={ruling as Ruling} index={index} />
        ))}
      </div>
    </div>
  );
}
