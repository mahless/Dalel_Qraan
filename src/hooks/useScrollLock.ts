import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

/**
 * Custom hook to lock body scrolling when a modal or overlay is open.
 * @param isOpen - Boolean indicating if the modal is open.
 */
export const useScrollLock = (isOpen: boolean) => {
  const { incrementModalCount, decrementModalCount } = useStore();
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Store current body overflow and padding-right (if any scrollbar exists)
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      if (!wasOpenRef.current) {
        incrementModalCount();
        wasOpenRef.current = true;
      }
      
      return () => {
        document.body.style.overflow = originalStyle;
        if (wasOpenRef.current) {
          decrementModalCount();
          wasOpenRef.current = false;
        }
      };
    } else if (wasOpenRef.current) {
      // Handle the case where isOpen becomes false but component is still mounted
      decrementModalCount();
      wasOpenRef.current = false;
    }
  }, [isOpen, incrementModalCount, decrementModalCount]);
};
