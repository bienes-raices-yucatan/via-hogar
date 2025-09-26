import React from 'react';
import { Icon } from './Icon';
import { IconName } from '../types';

interface IconPickerProps {
  onSelect: (iconName: IconName) => void;
  onClose: () => void;
}

// List of icons available for amenities. We can customize this list.
const availableIcons: IconName[] = [
  'sparkles', 'pool', 'gym', 'parking', 'bus', 'park', 'school', 'store', 'solar-panel', 'laundry', 'street-view', 'generic-feature', 'nearby'
];

export const IconPicker: React.FC<IconPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute z-20 top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border p-2">
      <div className="grid grid-cols-4 gap-2">
        {availableIcons.map(iconName => (
          <button
            key={iconName}
            onClick={() => {
              onSelect(iconName);
              onClose();
            }}
            className="p-2 rounded-md hover:bg-gray-100 flex items-center justify-center"
            title={iconName}
          >
            <Icon name={iconName} className="w-6 h-6 text-slate-600" />
          </button>
        ))}
      </div>
    </div>
  );
};
