
"use client";
import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Icon } from './icon';

interface AdminToolbarProps {
  isDraggingMode: boolean;
  setIsDraggingMode: (isDragging: boolean) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({ isDraggingMode, setIsDraggingMode, onExport, onImport }) => {
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border p-2 rounded-lg shadow-lg flex items-center gap-2">
       <input
        type="file"
        ref={importInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
      <Button 
         variant="outline"
         size="sm"
         onClick={handleImportClick}
         title="Importar Propiedades"
       >
        <Icon name="upload" className="mr-2 h-4 w-4" />
        Importar
       </Button>
       <Button 
         variant="outline"
         size="sm"
         onClick={onExport}
         title="Exportar Propiedades"
       >
        <Icon name="download" className="mr-2 h-4 w-4" />
        Exportar
       </Button>
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
