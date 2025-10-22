import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing form focus
 * Automatically focuses the first input when a form is shown
 * 
 * @param {boolean} showForm - Whether the form is currently visible
 * @param {number} delay - Delay in milliseconds before focusing (default: 100)
 * @returns {Object} Object containing formRef and firstInputRef
 */
export const useFormFocus = (showForm, delay = 100) => {
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  
  useEffect(() => {
    if (showForm && firstInputRef.current) {
      // Small delay to ensure form is rendered
      setTimeout(() => {
        firstInputRef.current.focus();
      }, delay);
    }
  }, [showForm, delay]);
  
  return {
    formRef,
    firstInputRef
  };
};

export default useFormFocus;
