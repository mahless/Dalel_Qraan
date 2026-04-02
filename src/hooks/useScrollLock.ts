import { useEffect } from 'react';

/**
 * Custom hook to lock body scrolling when a modal or overlay is open.
 * @param isOpen - Boolean indicating if the modal is open.
 */
export const useScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Store current body overflow and padding-right (if any scrollbar exists)
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);
};
