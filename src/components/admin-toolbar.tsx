
"use client";
import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Icon } from './icon';

interface AdminToolbarProps {
  onExportClick: () => void;
  onImport: (file: File) => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({ onExportClick, onImport }) => {
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
         title="Cargar copia de seguridad desde un archivo"
       >
        <Icon name="upload" className="mr-2 h-4 w-4" />
        Cargar
       </Button>
       <Button 
         variant="outline"
         size="sm"
         onClick={onExportClick}
         title="Guardar una copia de seguridad de las propiedades seleccionadas"
       >
        <Icon name="download" className="mr-2 h-4 w-4" />
        Guardar
       </Button>
    </div>
  );
};
