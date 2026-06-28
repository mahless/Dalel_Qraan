import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Sun, Moon, Type, Monitor, Bell, BellOff, Clock, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useModalBackHandler } from '../hooks/useModalBackHandler';
import { useScrollLock } from '../hooks/useScrollLock';
import { notificationService } from '../services/NotificationService';

const TimeWheel = <T extends string | number>({ 
  value, 
  options, 
  onChange, 
  label,
  formatLabel = (val: T) => val.toString().padStart(2, '0')
}: { 
  value: T; 
  options: T[]; 
  onChange: (val: T) => void;
  label: string;
  formatLabel?: (val: T) => string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isScrolling = React.useRef(false);
  const scrollTimeout = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const itemHeight = 40;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    isScrolling.current = true;
    
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (options[index] !== undefined && options[index] !== value) {
          onChange(options[index]);
        }
      }
    }, 100);
  };

  React.useEffect(() => {
    // Timeout to ensure the container is fully expanded and ready for scroll adjustments
    const timer = setTimeout(() => {
      if (containerRef.current && !isScrolling.current) {
        const index = options.indexOf(value);
        containerRef.current.scrollTop = index * itemHeight;
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, options]);

  return (
    <div className="flex flex-col items-center gap-1 group">
      <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="relative h-[120px] w-14 overflow-hidden rounded-xl bg-slate-100/30 dark:bg-slate-800/20 border border-slate-200/40 dark:border-slate-700/30">
        {/* Selection Highlight */}
        <div className="absolute top-[40px] left-0 right-0 h-[40px] bg-primary/10 dark:bg-emerald-500/10 pointer-events-none" />
        
        {/* Fading Overlays */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-50/100 dark:from-slate-900/100 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50/100 dark:from-slate-900/100 to-transparent pointer-events-none z-10" />

        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar py-[40px]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {options.map((opt, i) => (
            <div 
              key={i}
              className={`h-[40px] flex items-center justify-center snap-center transition-all duration-200 ${
                value === opt 
                  ? 'text-primary dark:text-emerald-400 font-extrabold text-lg scale-110' 
                  : 'text-slate-300 dark:text-slate-600 font-bold text-sm'
              }`}
            >
              {formatLabel(opt)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { 
    theme, setTheme, 
    uiFontSize, setUiFontSize,
    notificationsEnabled, setNotificationsEnabled,
    notificationTime, setNotificationTime
  } = useStore();

  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = React.useState(false);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = React.useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = React.useState(false);
  const [localNotificationTime, setLocalNotificationTime] = React.useState(notificationTime);

  // Sync local time whenever picker is opened
  React.useEffect(() => {
    if (isTimePickerVisible) {
      setLocalNotificationTime(notificationTime);
    }
  }, [isTimePickerVisible, notificationTime]);

  useModalBackHandler(isOpen, onClose, 'settings');
  useScrollLock(isOpen);

  const fontSizes = [
    { label: 'صغير', value: 16 },
    { label: 'متوسط', value: 18 },
    { label: 'كبير', value: 20 }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-[2.5rem] z-[70] w-[92%] max-w-md safe-modal overflow-hidden flex flex-col header-green-shadow border !border-primary/50 dark:!border-emerald-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-3 border-b border-slate-100 dark:border-emerald-500/20 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <Settings size={20} />
                </div>
                <h2 className="text-lg font-black text-black dark:text-slate-100">الإعدادات</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
                title="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 pb-8 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
              {/* Notification Settings */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  {/* Toggle */}
                  <div 
                    onClick={() => {
                      const newValue = !notificationsEnabled;
                      setNotificationsEnabled(newValue);
                      notificationService.updateSchedule();
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                      notificationsEnabled 
                        ? 'bg-primary/10 border-primary/20 border' 
                        : 'bg-slate-100 dark:bg-slate-800 border-transparent border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        notificationsEnabled ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm dark:text-slate-100">تفعيل التنبيهات اليومية</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">تذكير يومي للورد القرآني والأذكار</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                      notificationsEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        notificationsEnabled ? 'left-7' : 'left-1'
                      }`} />
                    </div>
                  </div>

                  {/* Time Picker */}
                  <AnimatePresence>
                    {notificationsEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-2xl border border-slate-100 dark:border-emerald-500/20 mt-2">
                          {/* Trigger Button */}
                          <button
                            onClick={() => {
                              if (!isTimePickerVisible) {
                                setLocalNotificationTime(notificationTime);
                              }
                              setIsTimePickerVisible(!isTimePickerVisible);
                            }}
                            className="w-full flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors group"
                          >
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-primary group-active:scale-95 transition-transform">
                                <Clock size={16} />
                              </div>
                              <span className="text-sm font-bold">تحديد الوقت</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="text-xs font-black text-primary dark:text-emerald-400 bg-primary/10 px-2 py-1 rounded-md ltr">
                                {(parseInt(notificationTime.split(':')[0]) % 12 || 12).toString().padStart(2, '0')}:
                                {notificationTime.split(':')[1]} 
                                {parseInt(notificationTime.split(':')[0]) >= 12 ? ' م' : ' ص'}
                               </span>
                               <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isTimePickerVisible ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          {/* Actual Picker Wheels */}
                          <AnimatePresence>
                            {isTimePickerVisible && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 pt-2 flex flex-col items-center">
                                  <div className="w-full h-px bg-slate-200/50 dark:bg-slate-700/50 mb-4" />
                                  <div className="flex items-center justify-center gap-4">
                                    {/* AM/PM - Right Column */}
                                    <TimeWheel 
                                      label="الفترة"
                                      value={parseInt(localNotificationTime.split(':')[0]) >= 12 ? 'م' : 'ص'}
                                      options={['ص', 'م']}
                                      formatLabel={(val) => val}
                                      onChange={(period) => {
                                        const [h24_str, m] = localNotificationTime.split(':');
                                        let h24 = parseInt(h24_str);
                                        
                                        if (period === 'م' && h24 < 12) h24 += 12;
                                        if (period === 'ص' && h24 >= 12) h24 -= 12;

                                        const newTime = `${h24.toString().padStart(2, '0')}:${m}`;
                                        setLocalNotificationTime(newTime);
                                      }}
                                    />

                                    {/* Minutes - Middle Column */}
                                    <TimeWheel 
                                      label="الدقيقة"
                                      value={parseInt(localNotificationTime.split(':')[1])}
                                      options={Array.from({ length: 60 }, (_, i) => i)}
                                      onChange={(m) => {
                                        const [h, _] = localNotificationTime.split(':');
                                        const newTime = `${h}:${m.toString().padStart(2, '0')}`;
                                        setLocalNotificationTime(newTime);
                                      }}
                                    />

                                    <div className="flex flex-col pt-5">
                                      <span className="text-xl font-black text-slate-300 dark:text-slate-700">:</span>
                                    </div>

                                    {/* Hours - Left Column (12h format) */}
                                    <TimeWheel 
                                      label="الساعة"
                                      value={parseInt(localNotificationTime.split(':')[0]) % 12 || 12}
                                      options={Array.from({ length: 12 }, (_, i) => i + 1)}
                                      onChange={(h12) => {
                                        const current24h = parseInt(localNotificationTime.split(':')[0]);
                                        const isPM = current24h >= 12;
                                        let h24 = h12;
                                        if (isPM && h12 !== 12) h24 += 12;
                                        if (!isPM && h12 === 12) h24 = 0;
                                        
                                        const [_, m] = localNotificationTime.split(':');
                                        const newTime = `${h24.toString().padStart(2, '0')}:${m}`;
                                        setLocalNotificationTime(newTime);
                                      }}
                                    />
                                  </div>

                                  <div className="w-full flex items-center justify-between mt-4 bg-white dark:bg-slate-800/60 pl-2 pr-3 py-1.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                                      سيتم إرسال التنبيه في 
                                      <span className="text-primary dark:text-emerald-400 font-bold mx-1">
                                        {(parseInt(localNotificationTime.split(':')[0]) % 12 || 12).toString().padStart(2, '0')}:
                                        {localNotificationTime.split(':')[1]} 
                                        {parseInt(localNotificationTime.split(':')[0]) >= 12 ? ' م' : ' ص'}
                                      </span>
                                    </p>
                                    <button
                                      onClick={() => {
                                        setNotificationTime(localNotificationTime);
                                        notificationService.updateSchedule();
                                        setIsTimePickerVisible(false);
                                      }}
                                      className="px-4 py-1.5 bg-primary dark:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 dark:shadow-emerald-500/20 active:scale-95 transition-all"
                                    >
                                      حفظ
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-emerald-500/10 my-1" />

              {/* Theme Settings */}
              <div className="flex items-center gap-4">
                <div className="w-1/3 flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold">
                  <Monitor size={18} />
                  <h3 className="text-sm whitespace-nowrap">المظهر</h3>
                </div>
                <div className="w-2/3 flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl relative">
                  {[
                    { id: 'light', label: 'نهاري', icon: <Sun size={14} /> },
                    { id: 'auto', label: 'تلقائي', icon: <Monitor size={14} /> },
                    { id: 'dark', label: 'ليلي', icon: <Moon size={14} /> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id as any)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all relative z-10 ${
                        theme === item.id 
                          ? 'text-primary dark:text-emerald-400' 
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                      }`}
                    >
                      {theme === item.id && (
                        <motion.div
                          layoutId="activeTheme"
                          className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className={theme === item.id ? 'opacity-100 scale-110 transition-transform' : 'opacity-70'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100 dark:border-emerald-500/10 my-1" />

              {/* Font Size Settings */}
              <div className="flex items-center gap-4">
                <div className="w-1/3 flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold">
                  <Type size={18} />
                  <h3 className="text-sm whitespace-nowrap">حجم الخط</h3>
                </div>
                <div className="w-2/3 flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl relative">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setUiFontSize(size.value)}
                      className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all relative z-10 ${
                        uiFontSize === size.value 
                          ? 'text-primary dark:text-emerald-400' 
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                      }`}
                    >
                      {uiFontSize === size.value && (
                        <motion.div
                          layoutId="activeFont"
                          className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="truncate">{size.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-center text-slate-400 dark:text-slate-500 py-2">
                * ملاحظة: تغيير حجم الخط لا يؤثر على الآيات القرآنية
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
