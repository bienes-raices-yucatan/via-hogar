
import React, { useRef } from 'react';
import { Icon } from './Icon';
import { EditableText } from './EditableText';

interface HeaderProps {
  isAdminMode: boolean;
  setIsAdminMode: (isAdmin: boolean) => void;
  customLogo: string | null;
  onLogoUpload: (logoDataUrl: string) => void;
  siteName: string;
  onSiteNameChange: (newName: string) => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAdminMode, setIsAdminMode, customLogo, onLogoUpload, siteName, onSiteNameChange, onNavigateHome }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdminLogoClick = () => {
    // This is only for the admin to trigger the file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
          if (isAdminMode) {
              handleAdminLogoClick();
          } else {
              onNavigateHome();
          }
      }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
           <div
              className="relative group cursor-pointer"
              onClick={!isAdminMode ? onNavigateHome : handleAdminLogoClick}
              onDoubleClick={isAdminMode ? onNavigateHome : undefined}
              title={isAdminMode ? "Clic: cambiar logo. Doble-clic: volver al listado." : "Volver al listado"}
              aria-label={isAdminMode ? "Cambiar logo o volver al listado de propiedades" : "Volver al listado de propiedades"}
              role="button"
              tabIndex={0}
              onKeyDown={handleKeyDown}
           >
              {customLogo ? (
                <img src={customLogo} alt="Logo personalizado" className="w-12 h-12 object-contain" />
              ) : (
                <Icon name="logo" className="w-12 h-12 text-slate-800"/>
              )}
             {isAdminMode && (
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <Icon name="pencil" className="w-5 h-5 text-white" />
               </div>
             )}
           </div>
          {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange to handle the object structure. */}
          <EditableText
            as="h1"
            isAdminMode={isAdminMode}
            value={{
                text: siteName,
                fontSize: 1.875, // Corresponds to text-3xl
                color: '#1f2937', // Corresponds to text-gray-800
                fontFamily: 'Montserrat',
            }}
            onChange={(newValue) => {
                if (newValue.text !== undefined) {
                    onSiteNameChange(newValue.text);
                }
            }}
            className="text-3xl font-bold text-gray-800"
            inputClassName="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-gray-400 focus:outline-none"
            onSelect={() => {}}
            isSelected={false}
          />
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/svg+xml, image/gif"
            className="hidden"
            aria-hidden="true"
          />
        </div>
        <div className="flex items-center space-x-3">
          {isAdminMode && (
            <button
              onClick={() => setIsAdminMode(false)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Salir
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
