import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Languages, Mic2, Settings } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { findBestMatch, extractNavigationCommand } from '../utils/voiceCommands';
import { ChatMessage } from './ChatBox';

interface VoiceBotProps {
  onDestinationSelect: (destination: string) => void;
  onMessageAdd: (message: ChatMessage) => void;
  className?: string;
}

const VoiceBot: React.FC<VoiceBotProps> = ({ onDestinationSelect, onMessageAdd, className = '' }) => {
  const [feedback, setFeedback] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [micMode, setMicMode] = useState<'auto' | 'manual'>('auto');
  const [isManualListening, setIsManualListening] = useState(false);
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
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      language
    };
    onMessageAdd(userMessage);
    setFeedback(`You said: "${transcript}"`);
    
    const command = extractNavigationCommand(transcript);
    if (command) {
      const match = findBestMatch(command);
      
      if (match) {
        if (match.confidence > 0.7) {
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: `${messages[language].navigating} ${match.building.name}`,
            timestamp: new Date(),
            language
          };
          onMessageAdd(botMessage);
          speak(`${messages[language].navigating} ${match.building.name}`, { lang: language });
          setFeedback(`✓ ${messages[language].navigating} ${match.building.name}`);
          onDestinationSelect(match.key);
          
          // Auto mode: stop listening after successful command
          if (micMode === 'auto') {
            stopListening();
          }
        } else {
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: `${messages[language].didYouMean} ${match.building.name}?`,
            timestamp: new Date(),
            language
          };
          onMessageAdd(botMessage);
          speak(`${messages[language].didYouMean} ${match.building.name}?`, { lang: language });
          setFeedback(`${messages[language].didYouMean} ${match.building.name}? Say "yes" to confirm.`);
        }
      } else {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: messages[language].locationNotFound,
          timestamp: new Date(),
          language
        };
        onMessageAdd(botMessage);
        speak(messages[language].locationNotFound, { lang: language });
        setFeedback(messages[language].tryAgain);
      }
    } else {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: messages[language].helpMessage,
        timestamp: new Date(),
        language
      };
      onMessageAdd(botMessage);
      speak(messages[language].helpMessage, { lang: language });
      setFeedback(messages[language].helpFeedback);
    }
  };

  const handleVoiceError = (error: string) => {
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: `Voice error: ${error}`,
      timestamp: new Date(),
      language
    };
    onMessageAdd(botMessage);
    setFeedback(`Voice error: ${error}`);
    speak(messages[language].voiceError, { lang: language });
  };

  const { isListening, isSupported, startListening, stopListening } = useVoiceRecognition({
    onResult: handleVoiceResult,
    onError: handleVoiceError,
    language: language === 'en' ? 'en-US' : 'ta-IN'
  });

  const handleManualMicToggle = () => {
    if (isManualListening) {
      setIsManualListening(false);
      stopListening();
    } else {
      setIsManualListening(true);
      startListening();
    }
  };

  const handleAutoMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

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
        <span className="text-xs md:text-sm text-gray-600">Language:</span>
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 md:px-3 py-1 text-xs rounded-md transition-colors ${
            language === 'en' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('ta')}
          className={`px-2 md:px-3 py-1 text-xs rounded-md transition-colors ${
            language === 'ta' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          தமிழ்
        </button>
      </div>

      {/* Mic Mode Toggle */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
        <Settings size={16} className="text-gray-600" />
        <span className="text-xs md:text-sm text-gray-600">Mic Mode:</span>
        <button
          onClick={() => setMicMode('auto')}
          className={`px-2 md:px-3 py-1 text-xs rounded-md transition-colors ${
            micMode === 'auto' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Auto
        </button>
        <button
          onClick={() => setMicMode('manual')}
          className={`px-2 md:px-3 py-1 text-xs rounded-md transition-colors ${
            micMode === 'manual' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Manual
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
        {/* Auto Mic Button */}
        {micMode === 'auto' && (
          <button
            onClick={handleAutoMicClick}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all shadow-sm text-sm ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md'
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            <span className="hidden sm:inline">
              {isListening ? messages[language].stopListening : messages[language].startListening}
            </span>
          </button>
        )}

        {/* Manual Mic Button */}
        {micMode === 'manual' && (
          <button
            onClick={handleManualMicToggle}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all shadow-sm text-sm ${
              isManualListening
                ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse'
                : 'bg-purple-500 hover:bg-purple-600 text-white hover:shadow-md'
            }`}
          >
            {isManualListening ? <MicOff size={16} /> : <Mic2 size={16} />}
            <span className="hidden sm:inline">
              {isManualListening ? 'Stop Manual' : 'Start Manual'}
            </span>
          </button>
        )}
        
        <button
          onClick={() => speak(messages[language].helpMessage, { lang: language })}
          className="flex items-center gap-2 px-3 py-2 md:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
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
      
      {(isListening || isManualListening) && (
        <div className={`flex items-center gap-2 mt-3 text-sm p-2 rounded-lg border ${
          micMode === 'auto' 
            ? 'text-red-600 bg-red-50 border-red-200' 
            : 'text-green-600 bg-green-50 border-green-200'
        }`}>
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            micMode === 'auto' ? 'bg-red-500' : 'bg-green-500'
          }`}></div>
          <span className="font-medium">
            {micMode === 'auto' ? messages[language].listening : 'Manual listening active'}
          </span>
          <span className={`text-xs ${
            micMode === 'auto' ? 'text-red-500' : 'text-green-500'
          }`}>
            {micMode === 'auto' ? 'Speak now...' : 'Continuous listening...'}
          </span>
        </div>
      )}
    </div>
  );
};

export default VoiceBot;