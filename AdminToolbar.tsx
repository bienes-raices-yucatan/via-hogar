import React from 'react';
import { Icon } from './Icon';

interface AdminToolbarProps {
  isDraggingMode: boolean;
  setIsDraggingMode: (isDragging: boolean) => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({ isDraggingMode, setIsDraggingMode }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white rounded-lg shadow-2xl flex items-center space-x-1 p-1">
      <button
        onClick={() => setIsDraggingMode(!isDraggingMode)}
        className={`p-2 rounded-md transition-colors ${isDraggingMode ? 'bg-amber-500 text-slate-900' : 'hover:bg-slate-700'}`}
        title={isDraggingMode ? 'Desactivar modo de movimiento' : 'Activar modo de movimiento'}
      >
        <Icon name="arrows-move" className="w-6 h-6" />
      </button>
      {/* Other admin tools can be added here */}
    </div>
  );
};
