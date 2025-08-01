import React, { useState } from 'react';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';

function App() {
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  const handleDestinationChange = (destination: string) => {
    setSelectedDestination(destination);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Control Panel */}
      <div className="w-80 bg-white shadow-lg z-10 flex-shrink-0">
        <ControlPanel
          selectedDestination={selectedDestination}
          onDestinationChange={handleDestinationChange}
          className="h-full"
        />
      </div>
      
      {/* Right Side - Map Container */}
      <div className="flex-1 relative">
        <MapView selectedDestination={selectedDestination} />
        
        {/* Mobile Toggle Button */}
        <button className="md:hidden absolute top-4 left-4 bg-white p-2 rounded-lg shadow-lg z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Overlay for smaller screens */}
      <div className="md:hidden absolute inset-0 flex">
        <div className="w-full bg-white">
          <ControlPanel
            selectedDestination={selectedDestination}
            onDestinationChange={handleDestinationChange}
            className="h-auto p-4"
          />
        </div>
        <div className="flex-1">
          <MapView selectedDestination={selectedDestination} />
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