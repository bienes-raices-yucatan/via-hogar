
'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import EditableText from '../editable-text';
import { useStorage } from '@/firebase/storage';
import { uploadFile } from '@/lib/storage';
import { ImageIcon } from 'lucide-react';
import { Label } from '../ui/label';

interface HeaderProps {
  siteName: string;
  setSiteName: (name: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
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
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && storage) {
      const filePath = `site/logo/${file.name}`;
      const newUrl = await uploadFile(storage, file, filePath);
      setLogoUrl(newUrl);
    }
  };
  
  const scrollToSection = (sectionId: string) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const uploadId = "logo-upload";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-6 flex justify-between items-center text-white bg-gradient-to-b from-black/50 to-transparent">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="group relative">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
            <Image src={logoUrl} alt="Logo" layout="fill" objectFit="cover" />
          </div>
          {isAdminMode && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <Label htmlFor={uploadId} className="cursor-pointer">
                <div className="p-2 bg-black/50 rounded-full text-white" title="Cambiar logo">
                  <ImageIcon size={20} />
                </div>
              </Label>
              <input
                id={uploadId}
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          )}
        </div>

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
