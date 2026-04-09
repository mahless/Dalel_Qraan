import React, { memo } from 'react';
import AyahNumber from './AyahNumber';

import { formatQuranText } from '../utils/arabicUtils';

interface QuranVerseProps {
  text: string;
  number?: number;
  className?: string;
  center?: boolean;
}

/**
 * QuranVerse component for displaying Quranic text with the correct font and styling.
 * It uses the 'quran-text' class defined in index.css which points to the Uthman Taha font.
 */
const QuranVerse = memo(({ text, number, className = "", center = false }: QuranVerseProps) => {
  return (
    <div className={`${center ? 'quran-text-center' : 'quran-text'} my-2 select-none ${className}`} dir="rtl">
      <span className="inline-block px-2">
        {formatQuranText(text)}
        {number !== undefined && (
          <AyahNumber 
            number={number} 
            size="lg" 
            className="mr-3 align-middle"
          />
        )}
      </span>
    </div>
  );
});

export default QuranVerse;
