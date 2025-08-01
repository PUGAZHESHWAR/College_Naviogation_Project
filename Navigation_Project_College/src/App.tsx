import React, { useState } from 'react';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import ChatBox, { ChatMessage } from './components/ChatBox';

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
    if (response.includes('Navigate to')) {
      // Extract destination from response
      const destination = response.replace('Navigate to ', '').replace('Show me the ', '').replace('Take me to ', '');
      handleDestinationChange(destination);
      
      // Add voice feedback for navigation
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `Navigating to ${destination}. Please follow the route on the map.`,
        timestamp: new Date(),
        language: 'en'
      };
      setChatMessages(prev => [...prev, botMessage]);
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
    } else if (message.toLowerCase().includes('navigate') || message.toLowerCase().includes('go to') || message.toLowerCase().includes('take me')) {
      // Extract destination from message
      const destination = message.replace(/navigate to|go to|take me to/gi, '').trim();
      if (destination) {
        handleDestinationChange(destination);
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `I'll help you navigate to ${destination}. Please check the map for the route.`,
          timestamp: new Date(),
          language: 'en'
        };
        setChatMessages(prev => [...prev, botMessage]);
      }
    } else {
      // Default response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I understand you said: "' + message + '". How can I help you navigate today? You can ask me to take you anywhere on campus or use the quick options above.',
        timestamp: new Date(),
        language: 'en'
      };
      setChatMessages(prev => [...prev, botMessage]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
          
          {/* Mobile Toggle Button */}
          <button className="md:hidden absolute top-4 left-4 bg-white p-2 rounded-lg shadow-lg z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
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

      {/* Mobile Overlay for smaller screens */}
      <div className="md:hidden absolute inset-0 flex flex-col">
        <div className="h-1/2 bg-white border-b border-gray-200">
          <ControlPanel
            selectedDestination={selectedDestination}
            onDestinationChange={handleDestinationChange}
            onMessageAdd={handleMessageAdd}
            className="h-full p-4"
          />
        </div>
        <div className="h-1/2 relative">
          <MapView selectedDestination={selectedDestination} />
          {/* Mobile ChatBox */}
          <div className="absolute bottom-4 right-4 z-20">
                      <ChatBox
            messages={chatMessages}
            isVisible={isChatVisible}
            onToggleVisibility={handleChatToggle}
            onQuickResponse={handleQuickResponse}
            onSendMessage={handleSendMessage}
          />
          </div>
        </div>
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