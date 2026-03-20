import React from 'react';

interface QuranVerseProps {
  text: string;
  number?: number;
  className?: string;
}

/**
 * QuranVerse component for displaying Quranic text with the correct font and styling.
 * It uses the 'quran-text' class defined in index.css which points to the Uthman Taha font.
 */
export default function QuranVerse({ text, number, className = "" }: QuranVerseProps) {
  return (
    <div className={`quran-text quran-text-center my-2 select-none ${className}`} dir="rtl">
      <span className="inline-block px-4">
        {text}
        {number !== undefined && (
          <span className="inline-flex items-center justify-center w-10 h-10 mr-4 text-lg border-2 border-primary/30 rounded-full font-sans">
            {number}
          </span>
        )}
      </span>
    </div>
  );
}
