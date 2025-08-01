import { useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number; lang?: 'en' | 'ta' }) => {
    if ('speechSynthesis' in window) {
      // Only cancel if there's already speech happening for the same text
      const currentUtterance = window.speechSynthesis.speaking;
      if (currentUtterance) {
        // Don't cancel - let the current speech finish
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || 1;
      utterance.pitch = options?.pitch || 1;
      utterance.volume = options?.volume || 1;
      utterance.lang = options?.lang === 'ta' ? 'ta-IN' : 'en-US';
      
      // Add event listeners to handle speech completion
      utterance.onend = () => {
        // Speech completed successfully
      };
      
      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const cancel = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, cancel };
};