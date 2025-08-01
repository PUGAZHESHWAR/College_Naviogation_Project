import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Volume2, VolumeX, Navigation, MapPin, HelpCircle, Mic, Send, Smile } from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  language?: 'en' | 'ta';
}

interface ChatBoxProps {
  messages: ChatMessage[];
  isVisible: boolean;
  onToggleVisibility: () => void;
  onQuickResponse?: (response: string) => void;
  onSendMessage?: (message: string) => void;
  className?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  messages, 
  isVisible, 
  onToggleVisibility, 
  onQuickResponse,
  onSendMessage,
  className = '' 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak } = useSpeechSynthesis();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Auto-speak the latest bot message
    if (messages.length > 0 && autoSpeak) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'bot') {
        // Add a small delay to ensure the message is rendered first
        setTimeout(() => {
          handleSpeakMessage(lastMessage);
        }, 300);
      }
    }
  }, [messages, autoSpeak]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLanguageLabel = (language?: 'en' | 'ta') => {
    return language === 'ta' ? 'தமிழ்' : 'English';
  };

  const handleSpeakMessage = (message: ChatMessage) => {
    if (autoSpeak && message.type === 'bot') {
      setIsSpeaking(true);
      speak(message.content, { lang: message.language });
      // Reset speaking state after a delay
      setTimeout(() => {
        setIsSpeaking(false);
      }, 2000);
    }
  };

  const handleToggleAutoSpeak = () => {
    setAutoSpeak(!autoSpeak);
  };

  // Generate chat options based on conversation context
  const getChatOptions = () => {
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage) {
      return [
        { text: "Navigate to Gate", icon: Navigation, action: "Navigate to Gate" },
        { text: "Show me the library", icon: MapPin, action: "Show me the library" },
        { text: "Take me to canteen", icon: Navigation, action: "Take me to canteen" },
        { text: "Help with navigation", icon: HelpCircle, action: "Help with navigation" }
      ];
    }

    // If last message was from bot asking for confirmation
    if (lastMessage.type === 'bot' && lastMessage.content.includes('Did you mean')) {
      return [
        { text: "Yes, confirm", icon: Navigation, action: "yes" },
        { text: "No, try again", icon: Mic, action: "no" },
        { text: "Show other options", icon: HelpCircle, action: "show other options" }
      ];
    }

    // If last message was an error or location not found
    if (lastMessage.type === 'bot' && (
      lastMessage.content.includes('could not find') || 
      lastMessage.content.includes('not found') ||
      lastMessage.content.includes('try again')
    )) {
      return [
        { text: "Try CSE Block", icon: Navigation, action: "Navigate to CSE" },
        { text: "Try Library", icon: MapPin, action: "Show me the library" },
        { text: "Try Canteen", icon: Navigation, action: "Take me to canteen" },
        { text: "Help me", icon: HelpCircle, action: "Help with navigation" }
      ];
    }

    // If last message was successful navigation
    if (lastMessage.type === 'bot' && lastMessage.content.includes('Navigating to')) {
      return [
        { text: "Navigate to another location", icon: Navigation, action: "Navigate to another location" },
        { text: "Show route details", icon: MapPin, action: "Show route details" },
        { text: "Cancel navigation", icon: X, action: "Cancel navigation" },
        { text: "Help", icon: HelpCircle, action: "Help with navigation" }
      ];
    }

    // Default options
    return [
      { text: "Navigate to CSE Block", icon: Navigation, action: "Navigate to CSE Block" },
      { text: "Show me the library", icon: MapPin, action: "Show me the library" },
      { text: "Take me to canteen", icon: Navigation, action: "Take me to canteen" },
      { text: "Help with navigation", icon: HelpCircle, action: "Help with navigation" }
    ];
  };

  const handleQuickResponse = (action: string) => {
    if (onQuickResponse) {
      onQuickResponse(action);
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim() && onSendMessage) {
      onSendMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sampleResponses = [
    "Hi! How can I help you navigate today?",
    "Hello! I'm your navigation assistant. Where would you like to go?",
    "Welcome! I can help you find any building on campus.",
    "Hi there! Ready to explore the campus?",
    "Hello! Just say where you want to go and I'll guide you there."
  ];

  const getRandomSampleResponse = () => {
    return sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl z-50"
        title="Show Chat History"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className={`${className.includes('h-full') ? 'w-full h-full bg-white flex flex-col' : 'fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-300'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Navigation Assistant</h3>
            <p className="text-xs text-gray-600">Voice Command History</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Speaking...</span>
            </div>
          )}
          <button
            onClick={handleToggleAutoSpeak}
            className={`p-2 rounded-lg transition-all duration-200 ${
              autoSpeak 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
          >
            {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={() => {
              const testMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: 'This is a test message to verify voice functionality.',
                timestamp: new Date(),
                language: 'en'
              };
              handleSpeakMessage(testMessage);
            }}
            className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-all duration-200"
            title="Test voice"
          >
            <Volume2 size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={onToggleVisibility}
            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <div className={`${className.includes('h-full') ? 'flex-1' : 'h-64'} overflow-y-auto p-4 space-y-3 min-h-[300px]`}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={32} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to Navigation Assistant</h3>
              <p className="text-sm text-gray-600 mb-4">Start using voice commands to begin your conversation</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xs mx-auto">
                <p className="text-xs text-blue-700 font-medium mb-2">Try saying:</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• "Navigate to CSE Block"</li>
                  <li>• "Take me to canteen"</li>
                  <li>• "Show me the library"</li>
                </ul>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {message.type === 'bot' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MessageCircle size={18} className="text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                  <div
                    className={`p-4 rounded-2xl shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.language && (
                      <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${
                        message.type === 'user' 
                          ? 'bg-blue-400 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {getLanguageLabel(message.language)}
                      </div>
                    )}
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-right text-gray-500' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white text-sm font-bold">U</span>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Chat Options */}
      {!isMinimized && (
        <div className="border-t border-gray-200 bg-gray-50 p-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600">Quick Options</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {getChatOptions().map((option, index) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickResponse(option.action)}
                  className="flex items-center gap-1 p-1.5 bg-white border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-left"
                >
                  <IconComponent size={12} className="text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Input Area */}
      {!isMinimized && (
        <div className="border-t border-gray-200 bg-white p-2">
          <div className="flex items-center gap-2 mb-2">
            <Smile size={14} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Chat with Assistant</span>
          </div>
          
          {/* Sample Response Button */}
          <button
            onClick={() => {
              if (onSendMessage) {
                onSendMessage(getRandomSampleResponse());
              }
            }}
            className="w-full mb-2 p-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-all duration-200 text-center"
          >
            <span className="text-xs font-medium text-blue-700">💬 Say "Hi" to get started</span>
          </button>

          {/* Chat Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox; 