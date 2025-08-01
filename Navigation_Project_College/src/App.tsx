import React, { useState } from 'react';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import ChatBox, { ChatMessage } from './components/ChatBox';
import DestinationSelector from './components/DestinationSelector';
import VoiceBot from './components/VoiceBot';
import { findDestinationByText } from './utils/voiceCommands';

function App() {
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const handleDestinationChange = (destination: string) => {
    setSelectedDestination(destination);
  };

  const handleMessageAdd = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const handleChatToggle = () => {
    setIsChatVisible(!isChatVisible);
  };

  const handleQuickResponse = (response: string) => {
    // Create a user message for the quick response
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: response,
      timestamp: new Date(),
      language: 'en'
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Handle different types of quick responses with voice feedback
    if (response.includes('Navigate to') || response.includes('Go to') || response.includes('Take me to') || response.includes('Show me the') || response.includes('Find the') || response.includes('Where is the')) {
      // Try to find a destination in the response
      const destinationMatch = findDestinationByText(response);
      
      if (destinationMatch && destinationMatch.confidence > 0.3) {
        // Found a valid destination
        handleDestinationChange(destinationMatch.key);
        
        // Add voice feedback for navigation
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `Navigating to ${destinationMatch.building.name}. Please follow the route on the map.`,
          timestamp: new Date(),
          language: 'en'
        };
        setChatMessages(prev => [...prev, botMessage]);
      } else {
        // No destination found
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: 'I couldn\'t find that destination. Please try a different location or use the destination selector.',
          timestamp: new Date(),
          language: 'en'
        };
        setChatMessages(prev => [...prev, botMessage]);
      }
    } else if (response === 'yes') {
      // Handle confirmation
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Confirmed! Navigating to your destination. Please follow the route on the map.',
        timestamp: new Date(),
        language: 'en'
      };
      setChatMessages(prev => [...prev, botMessage]);
    } else if (response === 'no') {
      // Handle rejection
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'No problem! Please try saying the destination name again or use the quick options below.',
        timestamp: new Date(),
        language: 'en'
      };
      setChatMessages(prev => [...prev, botMessage]);
    } else if (response.includes('Help')) {
      // Handle help request
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I can help you navigate to any building on campus. Try saying "Navigate to [building name]" or use the quick options below. You can also click the microphone button to start voice commands.',
        timestamp: new Date(),
        language: 'en'
      };
      setChatMessages(prev => [...prev, botMessage]);
    } else if (response.includes('Show route details')) {
      // Handle route details request
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'The route is displayed on the map with a blue line. Follow the path to reach your destination. The route shows the optimal path from your current location.',
        timestamp: new Date(),
        language: 'en'
      };
      setChatMessages(prev => [...prev, botMessage]);
    } else if (response.includes('Cancel navigation')) {
      // Handle navigation cancellation
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Navigation cancelled. You can start a new navigation by selecting a destination or using voice commands.',
        timestamp: new Date(),
        language: 'en'
      };
      setChatMessages(prev => [...prev, botMessage]);
    }
  };

  const handleSendMessage = (message: string) => {
    // Create a user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      language: 'en'
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Handle different types of messages
    if (message.toLowerCase().includes('hi') || message.toLowerCase().includes('hello')) {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Hello! I\'m your navigation assistant. I can help you find any building on campus. Just tell me where you want to go or use the quick options above!',
        timestamp: new Date(),
        language: 'en'
      };
      setChatMessages(prev => [...prev, botMessage]);
    } else {
      // Try to find a destination in the message
      const destinationMatch = findDestinationByText(message);
      
      if (destinationMatch && destinationMatch.confidence > 0.3) {
        // Found a valid destination
        handleDestinationChange(destinationMatch.key);
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `Navigating to ${destinationMatch.building.name}. Please follow the route on the map.`,
          timestamp: new Date(),
          language: 'en'
        };
        setChatMessages(prev => [...prev, botMessage]);
      } else {
        // No destination found, provide helpful response
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: 'I couldn\'t find that destination. Try saying something like "I want to go to Canteen" or "Navigate to CSE Block". You can also use the quick options above.',
          timestamp: new Date(),
          language: 'en'
        };
        setChatMessages(prev => [...prev, botMessage]);
      }
    }
  };

    return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        {/* Left Sidebar - Control Panel */}
        <div className="w-80 bg-white shadow-lg z-10 flex-shrink-0 border-r border-gray-200">
          <ControlPanel
            selectedDestination={selectedDestination}
            onDestinationChange={handleDestinationChange}
            onMessageAdd={handleMessageAdd}
            className="h-full"
          />
        </div>
        
        {/* Main Content Area - Map and Chat */}
        <div className="flex-1 flex">
          {/* Map Container */}
          <div className="flex-1 relative">
            <MapView selectedDestination={selectedDestination} />
          </div>

          {/* Right Side - ChatBox Container */}
          <div className="w-96 bg-white shadow-lg z-10 flex-shrink-0 border-l border-gray-200">
            <ChatBox
              messages={chatMessages}
              isVisible={true}
              onToggleVisibility={handleChatToggle}
              onQuickResponse={handleQuickResponse}
              onSendMessage={handleSendMessage}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout - Google Maps Style */}
      <div className="md:hidden flex flex-col h-full">
        {/* Top Destination Selector */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-800">Campus Navigator</h1>
              <p className="text-xs text-gray-600">Select your destination</p>
            </div>
            <button 
              onClick={() => setIsChatVisible(!isChatVisible)}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
          
          {/* Destination Selector */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Destination
            </label>
            <DestinationSelector
              selectedDestination={selectedDestination}
              onDestinationChange={handleDestinationChange}
              className="w-full"
            />
            {selectedDestination && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-xs text-green-800">
                  ✓ Destination: {selectedDestination}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full-Width Map */}
        <div className="flex-1 relative">
          <MapView selectedDestination={selectedDestination} />
        </div>

        {/* Voice Controls - Full Width Bottom Section */}
        <div className="bg-white border-t border-gray-200 p-4 w-full">
          <VoiceBot 
            onDestinationSelect={handleDestinationChange} 
            onMessageAdd={handleMessageAdd}
            className="w-full"
          />
        </div>

        {/* ChatBox - Stacked under map */}
        {isChatVisible && (
          <div className="h-80 bg-white border-t border-gray-200 shadow-lg">
            {/* Mobile Chat Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-semibold text-sm">Navigation Assistant</span>
                </div>
                <button 
                  onClick={handleChatToggle}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="h-full">
              <ChatBox
                messages={chatMessages}
                isVisible={true}
                onToggleVisibility={handleChatToggle}
                onQuickResponse={handleQuickResponse}
                onSendMessage={handleSendMessage}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 hidden lg:block">
        <div className="bg-black bg-opacity-75 text-white text-xs p-2 rounded-lg">
          <h4 className="font-semibold mb-1">Voice Commands:</h4>
          <ul className="text-xs space-y-1">
            <li>• "Navigate to CSE Block"</li>
            <li>• "Take me to canteen"</li>
            <li>• "Show me the library"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;