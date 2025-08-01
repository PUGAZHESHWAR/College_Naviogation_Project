import React, { useState } from 'react';
import { findDestinationByText, getQuickActionSuggestions } from '../utils/voiceCommands';

interface QuickActionsProps {
  onDestinationSelect: (destination: string) => void;
  onMessageAdd: (message: any) => void;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onDestinationSelect,
  onMessageAdd,
  className = ''
}) => {
  const [inputText, setInputText] = useState('');
  const [matchedDestination, setMatchedDestination] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    
    if (text.trim()) {
      const match = findDestinationByText(text);
      setMatchedDestination(match);
    } else {
      setMatchedDestination(null);
    }
  };

  const handleQuickAction = (action: string) => {
    const match = findDestinationByText(action);
    if (match) {
      onDestinationSelect(match.key);
      
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: action,
        timestamp: new Date(),
        language: 'en'
      };
      onMessageAdd(userMessage);

      // Add bot response
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `Navigating to ${match.name}. Please follow the route on the map.`,
        timestamp: new Date(),
        language: 'en'
      };
      onMessageAdd(botMessage);
    }
  };

  const handleSubmit = () => {
    if (matchedDestination) {
      onDestinationSelect(matchedDestination.key);
      
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputText,
        timestamp: new Date(),
        language: 'en'
      };
      onMessageAdd(userMessage);

      // Add bot response
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `Navigating to ${matchedDestination.name}. Please follow the route on the map.`,
        timestamp: new Date(),
        language: 'en'
      };
      onMessageAdd(botMessage);

      setInputText('');
      setMatchedDestination(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && matchedDestination) {
      handleSubmit();
    }
  };

  const quickSuggestions = getQuickActionSuggestions();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Actions
      </h3>

      {/* Natural Language Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type: 'go to canteen' or 'navigate to CSE block'"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {matchedDestination && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                Go
              </button>
            </div>
          )}
        </div>
        
        {matchedDestination && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✓ Found: {matchedDestination.name} (Confidence: {Math.round(matchedDestination.confidence * 100)}%)
            </p>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Destinations:</h4>
        <div className="grid grid-cols-1 gap-2">
          {quickSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(suggestion)}
              className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-700 group-hover:text-blue-700">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">How to use:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Type natural language like "go to canteen"</li>
          <li>• Click any quick action button</li>
          <li>• Use voice commands with the microphone</li>
        </ul>
      </div>
    </div>
  );
};

export default QuickActions; 