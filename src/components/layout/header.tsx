'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import EditableText from '@/components/editable-text';

interface HeaderProps {
  siteName: string;
  setSiteName: (name: string) => void;
  logoUrl: string;
  setLogoUrl: (file: File) => void;
  isAdminMode: boolean;
  onLogout: () => void;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({
  siteName,
  setSiteName,
  logoUrl,
  setLogoUrl,
  isAdminMode,
  onLogout,
  onNavigateHome
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    if (isAdminMode) {
      fileInputRef.current?.click();
    } else {
      onNavigateHome();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUrl(e.target.files[0]);
    }
  };

  const handleSiteNameClick = () => {
    if (!isAdminMode) {
      onNavigateHome();
    }
  }

  return (
    <header className="bg-background shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div 
            className={`relative w-10 h-10 rounded-full overflow-hidden ${isAdminMode ? 'cursor-pointer hover:opacity-80' : 'cursor-pointer'}`}
            onClick={handleLogoClick}
            title={isAdminMode ? "Cambiar logo" : "Inicio"}
          >
            <Image src={logoUrl} alt="Logo" layout="fill" objectFit="cover" />
            {isAdminMode && <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />}
          </div>
          <div onClick={handleSiteNameClick} className={`${!isAdminMode && 'cursor-pointer'}`}>
            <EditableText
              value={siteName}
              onChange={setSiteName}
              isAdminMode={isAdminMode}
              className="text-2xl font-headline font-bold text-slate-800"
              as="h1"
            />
          </div>
        </div>
        {isAdminMode && (
          <Button variant="outline" size="sm" onClick={onLogout}>
            Salir del Modo Admin
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
