import React from 'react';

interface AyahNumberProps {
  number: number | string;
  isBookmarked?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * AyahNumber component replacing the SVG with the native Uthman Taha font's 
 * End of Ayah ornament (U+06DD) enclosing the verse number.
 */
const AyahNumber: React.FC<AyahNumberProps> = ({ 
  number, 
  isBookmarked = false, 
  className = "",
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl md:text-4xl',
    lg: 'text-4xl md:text-5xl'
  };

  const toArabicDigits = (num: number | string) => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, w => arabicDigits[+w]);
  };

  return (
    <span 
      className={`quran-text inline-block select-none mx-1 px-1 transition-all duration-300 ${sizeClasses[size]} ${isBookmarked ? '!text-red-600 dark:!text-red-500 drop-shadow-[0_0_12px_rgba(220,38,38,0.7)] scale-[1.15] z-10 relative' : '!text-primary dark:!text-emerald-400 opacity-90 hover:opacity-100'} ${className}`}
      dir="rtl"
    >
      {/* U+06DD is the Arabic End of Ayah enclosing mark, followed by the digits */}
      {'\u06DD'}{toArabicDigits(number)}
    </span>
  );
};

export default AyahNumber;
