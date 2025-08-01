import React from 'react';
import { MapPin, Navigation, Bot } from 'lucide-react';
import DestinationSelector from './DestinationSelector';
import VoiceBot from './VoiceBot';
import { ChatMessage } from './ChatBox';

interface ControlPanelProps {
  selectedDestination: string;
  onDestinationChange: (destination: string) => void;
  onMessageAdd: (message: ChatMessage) => void;
  className?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedDestination,
  onDestinationChange,
  onMessageAdd,
  className = ''
}) => {
  return (
    <div className={`bg-white p-4 md:p-6 overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-gray-200">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Bot className="text-blue-600" size={20} />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Campus AI Navigator</h1>
          <p className="text-xs md:text-sm text-gray-600">Voice-powered navigation assistant</p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Destination Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <MapPin size={16} className="inline mr-1" />
            Select Destination
          </label>
          <DestinationSelector
            selectedDestination={selectedDestination}
            onDestinationChange={onDestinationChange}
            className="mb-2"
          />
          {selectedDestination && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs md:text-sm text-green-800">
                ✓ Destination set: {selectedDestination}
              </p>
            </div>
          )}
        </div>

        {/* Voice Commands */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Navigation size={16} />
            Voice Assistant
          </label>
          <VoiceBot onDestinationSelect={onDestinationChange} onMessageAdd={onMessageAdd} />
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <h3 className="font-semibold text-blue-800 mb-2 text-sm">Quick Tips:</h3>
          <ul className="text-xs md:text-sm text-blue-700 space-y-1">
            <li>• Click the microphone to voice commands</li>
            <li>• Say "Navigate to [building name]"</li>
            <li>• Use the dropdown for manual selection</li>
            <li>• Your location updates automatically</li>
          </ul>
        </div>

        {/* Status */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
          <h3 className="font-semibold text-gray-700 mb-2 text-sm">System Status:</h3>
          <div className="space-y-2 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">GPS Location: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Voice Recognition: Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Map Services: Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;