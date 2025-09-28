'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import EditableText from '../editable-text';
import { Label } from '../ui/label';

interface HeaderProps {
  siteName: string;
  setSiteName: (name: string) => void;
  logoUrl: string;
  setLogoUrl: (file: File) => void;
  isAdminMode: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  siteName,
  setSiteName,
  logoUrl,
  setLogoUrl,
  isAdminMode,
  onLogout,
}) => {
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUrl(e.target.files[0]);
    }
  };
  
  const scrollToSection = (sectionId: string) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-6 flex justify-between items-center text-white bg-gradient-to-b from-black/50 to-transparent">
      <div className="flex items-center gap-2 sm:gap-4">
        <Label htmlFor="logo-upload" className={isAdminMode ? 'cursor-pointer' : ''}>
          <div 
            className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden group"
            title={isAdminMode ? "Hacer clic para cambiar logo" : ""}
          >
            <Image src={logoUrl} alt="Logo" layout="fill" objectFit="cover" />
             {isAdminMode && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
          </div>
        </Label>
        {isAdminMode && <input id="logo-upload" type="file" ref={logoFileInputRef} onChange={handleLogoFileChange} className="hidden" accept="image/*" />}

        <EditableText
          value={siteName}
          onChange={setSiteName}
          isAdminMode={isAdminMode}
          className="text-xl sm:text-2xl font-headline font-bold"
          as="h1"
        />
      </div>
      <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
        <button onClick={() => scrollToSection('section-features')} className="hover:text-amber-300 transition-colors hidden sm:block">Características</button>
        <button onClick={() => scrollToSection('section-location')} className="hover:text-amber-300 transition-colors hidden sm:block">Ubicación</button>
        <button onClick={() => scrollToSection('section-contact')} className="hover:text-amber-300 transition-colors hidden sm:block">Contacto</button>
        {isAdminMode && (
          <Button variant="outline" size="sm" onClick={onLogout} className="bg-transparent text-white border-white hover:bg-white hover:text-black">
            Salir
          </Button>
        )}
      </nav>
    </header>
  );
};

export default Header;
