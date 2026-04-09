import React from 'react';
import { ArrowRight, Sparkles, Sun, Moon, Sunrise, Utensils, Home, Droplets, Shirt, Plane, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import azkarData from '../data/azkar.json';

export default function BestDhikr() {
  const categories = [
    { 
      id: 'morning_evening', 
      title: 'أذكار الصباح والمساء', 
      subtitle: 'تحصين المسلم اليومي', 
      icon: Sun, 
      color: 'orange',
      count: (azkarData.morning_evening || []).length
    },
    { 
      id: 'sleep', 
      title: 'أذكار النوم', 
      subtitle: 'سكينة وطمأنينة قبل المنام', 
      icon: Moon, 
      color: 'indigo',
      count: (azkarData.sleep || []).length
    },
    { 
      id: 'waking_up', 
      title: 'أذكار الاستيقاظ', 
      subtitle: 'حمد الله على نعمة الحياة', 
      icon: Sunrise, 
      color: 'amber',
      count: ((azkarData as any).waking_up || []).length
    },
    { 
      id: 'food', 
      title: 'أذكار الطعام', 
      subtitle: 'بركة القوت وحمد المنعم', 
      icon: Utensils, 
      color: 'emerald',
      count: (azkarData.food || []).length
    },
    { 
      id: 'home', 
      title: 'أذكار المنزل', 
      subtitle: 'تحصين البيت والأهل', 
      icon: Home, 
      color: 'blue',
      count: (azkarData.home || []).length
    },
    { 
      id: 'washroom', 
      title: 'أذكار الخلاء', 
      subtitle: 'أدعية الدخول والخروج', 
      icon: Droplets, 
      color: 'slate',
      count: ((azkarData as any).washroom || []).length
    },
    { 
      id: 'clothing', 
      title: 'أذكار اللباس', 
      subtitle: 'شكر الله على سِتره', 
      icon: Shirt, 
      color: 'purple',
      count: ((azkarData as any).clothing || []).length
    },
    { 
      id: 'travel', 
      title: 'أذكار السفر', 
      subtitle: 'حفظ الله في ترحالك', 
      icon: Plane, 
      color: 'sky',
      count: ((azkarData as any).travel || []).length
    },
    { 
      id: 'general', 
      title: 'أذكار عامة', 
      subtitle: 'تسبيح وتحميد واستغفار', 
      icon: Heart, 
      color: 'rose',
      count: (azkarData.general || []).length
    }
  ];

  return (
    <div className="pb-32 pt-34 px-2 max-w-2xl mx-auto min-h-screen">
      <div className="fixed top-10 left-0 right-0 z-50 px-2 py-3">
        <header className="glass rounded-2xl px-2 py-4 flex items-center gap-4 max-w-2xl mx-auto card-shadow">
          <Link 
            to="/library"
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-white active:bg-black/10 dark:active:bg-white/10 transition-colors"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-black text-black dark:text-white">أفضل الذكر</h1>
            <p className="text-xs text-black/60 dark:text-slate-400 font-medium">
              بذكر الله تطمئن القلوب
            </p>
          </div>
        </header>
      </div>

      <div className="space-y-6">


        <div className="grid grid-cols-1 gap-4">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={`/library/azkar/${cat.id}`}
              className="block glass p-4 rounded-2xl card-shadow group transition-all border border-transparent"
              style={{ 
                '--hover-border': `var(--${cat.color}-500)`,
              } as React.CSSProperties}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                      ${cat.color === 'orange' ? 'bg-orange-500/10 text-orange-600 active:bg-orange-500 active:text-white' : ''}
                      ${cat.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-600 active:bg-indigo-500 active:text-white' : ''}
                      ${cat.color === 'amber' ? 'bg-amber-500/10 text-amber-600 active:bg-amber-500 active:text-white' : ''}
                      ${cat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 active:bg-emerald-500 active:text-white' : ''}
                      ${cat.color === 'blue' ? 'bg-blue-500/10 text-blue-600 active:bg-blue-500 active:text-white' : ''}
                      ${cat.color === 'slate' ? 'bg-slate-500/10 text-slate-600 active:bg-slate-500 active:text-white' : ''}
                      ${cat.color === 'purple' ? 'bg-purple-500/10 text-purple-600 active:bg-purple-500 active:text-white' : ''}
                      ${cat.color === 'sky' ? 'bg-sky-500/10 text-sky-600 active:bg-sky-500 active:text-white' : ''}
                      ${cat.color === 'rose' ? 'bg-rose-500/10 text-rose-600 active:bg-rose-500 active:text-white' : ''}
                    `}>
                      <cat.icon size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-slate-100 mb-1 transition-colors active:text-black dark:active:text-white">{cat.title}</h3>
                    <p className="text-xs text-black/60 dark:text-slate-400 flex items-center gap-2">
                       {cat.subtitle} • {cat.count} {cat.count === 1 ? 'ذكر' : cat.count <= 10 ? 'أذكار' : 'ذكراً'}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400 active:bg-slate-500 active:text-white transition-all rotate-180">
                  <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
    </div>
  );
}
