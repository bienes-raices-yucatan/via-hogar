
"use client";
import React from 'react';
import { Icon } from './icon';
import { Button } from './ui/button';

interface HeaderProps {
    isAdminMode: boolean;
    setIsAdminMode: (isAdmin: boolean) => void;
    siteName: string;
    onSiteNameChange: (name: string) => void;
    customLogo: string | null;
    onLogoUpload: (logo: string | null) => void;
    onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    isAdminMode,
    setIsAdminMode,
    siteName, 
    onNavigateHome 
}) => {
    return (
        <header className="bg-background border-b p-4 flex justify-between items-center sticky top-0 z-40">
            <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={onNavigateHome}
            >
                <Icon name="logo" className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-bold text-foreground">{siteName}</h1>
            </div>
            <div>
                <Button onClick={() => setIsAdminMode(!isAdminMode)}>
                    {isAdminMode ? 'Salir del Modo Admin' : 'Modo Admin'}
                </Button>
            </div>
        </header>
    );
};
