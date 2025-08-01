import { useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number; lang?: 'en' | 'ta' }) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || 1;
      utterance.pitch = options?.pitch || 1;
      utterance.volume = options?.volume || 1;
      utterance.lang = options?.lang === 'ta' ? 'ta-IN' : 'en-US';
      
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