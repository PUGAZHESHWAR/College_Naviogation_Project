import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Languages } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { findBestMatch, extractNavigationCommand } from '../utils/voiceCommands';

interface VoiceBotProps {
  onDestinationSelect: (destination: string) => void;
  className?: string;
}

const VoiceBot: React.FC<VoiceBotProps> = ({ onDestinationSelect, className = '' }) => {
  const [feedback, setFeedback] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const { speak } = useSpeechSynthesis();

  const messages = {
    en: {
      navigating: 'Navigating to',
      didYouMean: 'Did you mean',
      locationNotFound: 'Sorry, I could not find that location. Please try again.',
      tryAgain: 'Location not found. Try saying the name more clearly.',
      helpMessage: 'Please say where you want to go, for example: Navigate to CSE Block',
      helpFeedback: 'Try saying "Navigate to [destination name]"',
      voiceError: 'Sorry, I could not understand you. Please try again.',
      startListening: 'Start Voice Command',
      stopListening: 'Stop Listening',
      listening: 'Listening for your command...'
    },
    ta: {
      navigating: 'செல்கிறோம்',
      didYouMean: 'நீங்கள் சொன்னது',
      locationNotFound: 'மன்னிக்கவும், அந்த இடத்தை கண்டுபிடிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      tryAgain: 'இடம் கிடைக்கவில்லை. பெயரை தெளிவாக சொல்லுங்கள்.',
      helpMessage: 'எங்கு செல்ல வேண்டும் என்று சொல்லுங்கள், உதாரணம்: சிஎஸ்இ பிளாக்கிற்கு செல்லுங்கள்',
      helpFeedback: '"[இடத்தின் பெயர்] க்கு செல்லுங்கள்" என்று சொல்லுங்கள்',
      voiceError: 'மன்னிக்கவும், உங்களை புரிந்துகொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      startListening: 'குரல் கட்டளை தொடங்கு',
      stopListening: 'கேட்பதை நிறுத்து',
      listening: 'உங்கள் கட்டளைக்காக காத்திருக்கிறோம்...'
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setFeedback(`You said: "${transcript}"`);
    
    const command = extractNavigationCommand(transcript);
    if (command) {
      const match = findBestMatch(command);
      
      if (match) {
        if (match.confidence > 0.7) {
          speak(`${messages[language].navigating} ${match.building.name}`, { lang: language });
          setFeedback(`✓ ${messages[language].navigating} ${match.building.name}`);
          onDestinationSelect(match.key);
        } else {
          speak(`${messages[language].didYouMean} ${match.building.name}?`, { lang: language });
          setFeedback(`${messages[language].didYouMean} ${match.building.name}? Say "yes" to confirm.`);
        }
      } else {
        speak(messages[language].locationNotFound, { lang: language });
        setFeedback(messages[language].tryAgain);
      }
    } else {
      speak(messages[language].helpMessage, { lang: language });
      setFeedback(messages[language].helpFeedback);
    }
  };

  const handleVoiceError = (error: string) => {
    setFeedback(`Voice error: ${error}`);
    speak(messages[language].voiceError, { lang: language });
  };

  const { isListening, isSupported, startListening, stopListening } = useVoiceRecognition({
    onResult: handleVoiceResult,
    onError: handleVoiceError,
    language: language === 'en' ? 'en-US' : 'ta-IN'
  });

  if (!isSupported) {
    return (
      <div className={`bg-gray-100 rounded-lg p-3 ${className}`}>
        <p className="text-sm text-gray-600">Voice recognition not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Language Toggle */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
        <Languages size={16} className="text-gray-600" />
        <span className="text-sm text-gray-600">Language:</span>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            language === 'en' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('ta')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            language === 'ta' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          தமிழ்
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all shadow-sm ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md'
          }`}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          {isListening ? messages[language].stopListening : messages[language].startListening}
        </button>
        
        <button
          onClick={() => speak(messages[language].helpMessage, { lang: language })}
          className="flex items-center gap-2 px-3 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
          title="Voice help"
        >
          <Volume2 size={16} />
        </button>
      </div>
      
      {feedback && (
        <div className={`text-sm p-3 rounded-lg border ${
          feedback.startsWith('✓') 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : feedback.includes('error') 
            ? 'bg-red-50 text-red-800 border-red-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {feedback}
        </div>
      )}
      
      {isListening && (
        <div className="flex items-center gap-2 mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">{messages[language].listening}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceBot;