
"use client";
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from './icon';
import { Button } from './ui/button';
import { useImageLoader } from '@/hooks/use-image-loader';
import { Skeleton } from './ui/skeleton';
import ContentEditable from 'react-contenteditable';
import { cn } from '@/lib/utils';
import { saveImage } from '@/lib/storage';

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
    onSiteNameChange,
    customLogo,
    onLogoUpload,
    onNavigateHome,
}) => {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const { imageUrl: logoUrl, isLoading: isLogoLoading } = useImageLoader(customLogo);
    const [currentSiteName, setCurrentSiteName] = useState(siteName);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setCurrentSiteName(siteName);
    }, [siteName]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Directly save the blob to IndexedDB via saveImage
        try {
            const savedKey = await saveImage(file);
            onLogoUpload(savedKey);
        } catch (error) {
            console.error("Failed to save logo:", error);
        }
    };

    const handleSiteNameChange = (e: React.FormEvent<HTMLDivElement>) => {
        setCurrentSiteName((e.currentTarget as HTMLElement).innerText);
    };

    const handleSiteNameBlur = () => {
        onSiteNameChange(currentSiteName);
    };

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-center transition-all duration-300",
            scrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"
        )}>
            <div 
                className="flex items-center gap-3 cursor-pointer group relative"
                onClick={onNavigateHome}
            >
                {isLogoLoading ? (
                    <Skeleton className="h-10 w-10 rounded-full" />
                ) : logoUrl ? (
                    <Image src={logoUrl} alt="Custom Logo" width={40} height={40} className="object-contain h-10 w-10" />
                ) : (
                    <Icon name="logo" className="w-10 h-10 text-primary" />
                )}
                {isAdminMode ? (
                     <ContentEditable
                        html={currentSiteName}
                        tagName="h1"
                        onChange={handleSiteNameChange}
                        onBlur={handleSiteNameBlur}
                        className="text-2xl font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-sm px-1"
                     />
                ) : (
                    <h1 className="text-2xl font-bold text-primary">{siteName}</h1>
                )}
               
                {isAdminMode && (
                    <div className="absolute -right-12 h-7 flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-white/20 text-white hover:bg-white/30"
                            onClick={(e) => {
                                e.stopPropagation();
                                logoInputRef.current?.click();
                            }}
                            title="Cambiar logo"
                        >
                            <Icon name="pencil" className="h-4 w-4" />
                        </Button>
                        <input
                            type="file"
                            ref={logoInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                        />
                    </div>
                )}
            </div>
            {isAdminMode && (
                <div>
                    <Button onClick={() => setIsAdminMode(false)}>
                        Salir del Modo Admin
                    </Button>
                </div>
            )}
        </header>
    );
};
