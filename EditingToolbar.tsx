import React, { useState, useEffect, useRef } from 'react';
import { FontFamily, StyledText, DraggableTextData } from '../types';
import { Icon } from './Icon';

interface EditingToolbarProps {
  element: {
    type: 'styledText' | 'draggableText' | 'sectionStyle';
    data: Partial<StyledText & DraggableTextData & { backgroundColor: string }>;
  };
  onUpdate: (newData: any) => void;
  onClose: () => void;
}

const FONT_FAMILIES: FontFamily[] = ['Roboto', 'Montserrat', 'Lora', 'Playfair Display'];

export const EditingToolbar: React.FC<EditingToolbarProps> = ({ element, onUpdate, onClose }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    setPosition({ x: position.x + e.movementX, y: position.y + e.movementY });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    // Add keydown listener to the window for the Escape key
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [onClose]);

  const renderTextControls = () => {
    const data = element.data as StyledText;
    return (
      <>
        <div className="p-2 border-b">
          <label className="text-xs text-slate-500">Fuente</label>
          <select
            value={data.fontFamily || 'Roboto'}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full text-sm p-1 bg-white border border-slate-200 rounded"
          >
            {FONT_FAMILIES.map(font => <option key={font} value={font}>{font}</option>)}
          </select>
        </div>
        <div className="flex items-center p-2 border-b">
          <div className="w-1/2 pr-1">
            <label className="text-xs text-slate-500">Tamaño (rem)</label>
            <input
              type="number"
              step="0.1"
              value={data.fontSize || 1}
              onChange={(e) => onUpdate({ fontSize: parseFloat(e.target.value) || 1 })}
              className="w-full text-sm p-1 bg-white border border-slate-200 rounded"
            />
          </div>
          <div className="w-1/2 pl-1">
            <label className="text-xs text-slate-500">Color</label>
            <input
              type="color"
              value={data.color || '#000000'}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-full h-8 p-0 border-none rounded cursor-pointer"
            />
          </div>
        </div>
      </>
    );
  };

  const renderSectionControls = () => {
    const data = element.data as { backgroundColor?: string };
    return (
      <div className="p-2 border-b">
        <label className="text-xs text-slate-500">Color de Fondo</label>
        <input
          type="color"
          value={data.backgroundColor || '#FFFFFF'}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          className="w-full h-8 p-0 border-none rounded cursor-pointer"
        />
      </div>
    );
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-slate-50 rounded-lg shadow-2xl border border-slate-300 w-56 select-none"
      style={{ top: position.y, left: position.x }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up to the main App listener
      onKeyDown={handleKeyDown}
      tabIndex={-1} // Make it focusable
    >
      <div
        className="bg-slate-200 p-1 text-slate-600 cursor-move flex justify-between items-center rounded-t-md"
        onMouseMove={handleDrag}
      >
        <span className="text-xs font-bold uppercase pl-1">Editor</span>
        <button onClick={onClose} className="p-1 hover:bg-slate-300 rounded">
          <Icon name="x-mark" className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {element.type.includes('Text') && renderTextControls()}
        {element.type === 'sectionStyle' && renderSectionControls()}
      </div>
    </div>
  );
};