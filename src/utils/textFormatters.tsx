import React from 'react';

/**
 * Formats occurrences of "عليه السلام" (Peace Be Upon Him) in the given text
 * by wrapping them in parentheses and reducing their font size to half.
 *
 * @param text The string to format
 * @returns An array of React nodes or strings
 */
export const formatPeaceBeUponHim = (text: string | undefined): React.ReactNode => {
  if (!text) return text;
  
  // Split text by "عليه السلام" preserving the delimiter
  const parts = text.split(/(عليه السلام)/g);
  
  return parts.map((part, index) => {
    if (part === 'عليه السلام') {
      return (
        <span key={index} className="text-[0.5em] mx-1 opacity-80 inline-block align-middle font-normal">
          (عليه السلام)
        </span>
      );
    }
    return part;
  });
};
