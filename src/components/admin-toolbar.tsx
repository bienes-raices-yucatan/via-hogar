
"use client";
import React from 'react';
import { Button } from './ui/button';
import { Icon } from './icon';

interface AdminToolbarProps {
  isDraggingMode: boolean;
  setIsDraggingMode: (isDragging: boolean) => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({ isDraggingMode, setIsDraggingMode }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border p-2 rounded-lg shadow-lg flex items-center gap-2">
       <Button 
         variant={isDraggingMode ? "default" : "outline"} 
         size="icon"
         onClick={() => setIsDraggingMode(!isDraggingMode)}
         title="Activar modo de arrastre"
       >
        <Icon name="arrows-move" />
       </Button>
    </div>
  );
};
