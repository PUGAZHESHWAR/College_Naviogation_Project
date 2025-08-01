import React from 'react';
import { buildingsList } from '../data/buildings';

interface DestinationSelectorProps {
  selectedDestination: string;
  onDestinationChange: (destination: string) => void;
  className?: string;
}

const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  selectedDestination,
  onDestinationChange,
  className = ''
}) => {
  return (
    <select
      value={selectedDestination}
      onChange={(e) => onDestinationChange(e.target.value)}
      className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm hover:border-gray-400 transition-colors ${className}`}
    >
      <option value="">-- Select Destination --</option>
      {buildingsList.map((building) => (
        <option key={building.key} value={building.key}>
          {building.name}
        </option>
      ))}
    </select>
  );
};

export default DestinationSelector;