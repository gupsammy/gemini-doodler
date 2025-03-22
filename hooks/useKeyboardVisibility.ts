import { useState, useEffect } from "react";

/**
 * Hook to detect keyboard visibility on mobile devices
 * @returns Object containing isKeyboardVisible state
 */
export const useKeyboardVisibility = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // Function to detect keyboard visibility
    const detectKeyboard = () => {
      const currentWindowHeight = window.innerHeight;
      const fullWindowHeight = window.outerHeight;

      // If window height is significantly less than the total height, keyboard is probably visible
      const keyboardVisible = currentWindowHeight < fullWindowHeight * 0.85;

      if (keyboardVisible) {
        // Calculate approximate keyboard height
        const estimatedKeyboardHeight = fullWindowHeight - currentWindowHeight;
        setKeyboardHeight(estimatedKeyboardHeight);
      } else {
        setKeyboardHeight(0);
      }

      setIsKeyboardVisible(keyboardVisible);
    };

    // Initial check
    detectKeyboard();

    // Add resize listener for keyboard events
    window.addEventListener("resize", detectKeyboard);

    // Cleanup
    return () => window.removeEventListener("resize", detectKeyboard);
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};
