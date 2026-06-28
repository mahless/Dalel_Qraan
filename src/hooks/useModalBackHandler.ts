import { useEffect, useRef } from 'react';

/**
 * Hook to handle closing modals with the browser/hardware back button.
 * It pushes a temporary state to the history stack when the modal opens.
 */
export function useModalBackHandler(isOpen: boolean, onClose: () => void, modalId: string) {
  const onCloseRef = useRef(onClose);
  
  // Keep the ref updated with the latest callback
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Push a new state when the modal opens
    const state = { modalOpen: true, modalId };
    window.history.pushState(state, '');

    const handlePopState = (event: PopStateEvent) => {
      // If we've popped back to a state without this modal, close it
      if (isOpen) {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      
      // If the component is unmounting or isOpen becomes false manually
      // we need to remove the state we pushed to keep history clean.
      if (window.history.state?.modalOpen && window.history.state?.modalId === modalId) {
        window.history.back();
      }
    };
  }, [isOpen, modalId]); // Removed onClose from dependencies
}
