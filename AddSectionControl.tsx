import React from 'react';
import { Icon } from './Icon';

interface AddSectionControlProps {
  index: number;
  onClick: (index: number) => void;
}

export const AddSectionControl: React.FC<AddSectionControlProps> = ({ index, onClick }) => {
  return (
    <div className="h-10 flex items-center justify-center group">
      <div className="w-full border-t-2 border-dashed border-gray-300 group-hover:border-amber-400 transition-colors"></div>
      <button
        onClick={() => onClick(index)}
        className="absolute bg-white text-gray-500 hover:text-white hover:bg-amber-500 border-2 border-gray-300 group-hover:border-amber-500 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all transform group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        aria-label="Añadir nueva sección aquí"
      >
        <Icon name="plus" className="w-6 h-6" />
      </button>
      <div className="w-full border-t-2 border-dashed border-gray-300 group-hover:border-amber-400 transition-colors"></div>
    </div>
  );
};