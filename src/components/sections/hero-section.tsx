'use client';
import { HeroSectionData } from '@/lib/types';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import EditableText from '../editable-text';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { v4 as uuidv4 } from 'uuid';
import { saveImage, getImage } from '@/lib/db';

interface HeroSectionProps {
  data: HeroSectionData;
  updateSection: (sectionId: string, updatedData: Partial<HeroSectionData>) => void;
  deleteSection: (sectionId: string) => void;
  isAdminMode: boolean;
  setSelectedElement: (element: any) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ data, updateSection, deleteSection, isAdminMode, setSelectedElement }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundPosition, setBackgroundPosition] = useState('center');
  const [imageUrl, setImageUrl] = useState(data.imageUrl);

  useEffect(() => {
    const loadImage = async () => {
        if (data.imageKey) {
            const blob = await getImage(data.imageKey);
            if (blob) {
                const localUrl = URL.createObjectURL(blob);
                setImageUrl(localUrl);
                return () => URL.revokeObjectURL(localUrl);
            }
        } else {
            setImageUrl(data.imageUrl);
        }
    };
    loadImage();
  }, [data.imageKey, data.imageUrl]);

  useEffect(() => {
    if (!data.parallaxEnabled || isAdminMode) {
      setBackgroundPosition('center');
      return;
    }

    let animationFrameId: number;

    const handleScroll = () => {
      if (sectionRef.current) {
        const top = sectionRef.current.getBoundingClientRect().top;
        const speed = 0.4;
        const newY = -(top * speed);
        
        animationFrameId = requestAnimationFrame(() => {
          setBackgroundPosition(`50% ${newY}px`);
        });
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [data.parallaxEnabled, isAdminMode]);

  const handleTextUpdate = (field: 'title' | 'subtitle', value: string) => {
    const currentData = data[field];
    if (currentData) {
      const updatedField = { ...currentData, text: value };
      updateSection(data.id, { [field]: updatedField });
    }
  };
  
  const handleButtonTextUpdate = (value: string) => {
    updateSection(data.id, { buttonText: value });
  };
  
  const createSelectHandler = (field: 'title' | 'subtitle') => () => {
    if (data[field]) {
        setSelectedElement({
            type: 'STYLED_TEXT',
            sectionId: data.id,
            field: field
        });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const key = `hero-${data.id}-${uuidv4()}`;
        await saveImage(key, file);
        updateSection(data.id, { imageKey: key, imageUrl: undefined });
    }
  };

  return (
    <div 
      ref={sectionRef}
      className="relative group/section w-full h-[40vh] md:h-[50vh] bg-cover bg-center rounded-b-3xl overflow-hidden" 
      style={{ 
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: backgroundPosition,
        backgroundAttachment: data.parallaxEnabled && !isAdminMode ? 'fixed' : 'scroll',
        transition: 'background-position 0.1s ease-out',
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <div className="max-w-3xl">
          {data.title && (
            <div style={{color: data.title.color, fontSize: data.title.fontSize, fontFamily: data.title.fontFamily}}>
                <EditableText 
                    value={data.title.text} 
                    onChange={(val) => handleTextUpdate('title', val)} 
                    isAdminMode={isAdminMode} 
                    className="font-bold font-headline leading-tight"
                    as="h1"
                    onSelect={createSelectHandler('title')}
                />
            </div>
          )}
          {data.subtitle && (
            <div style={{color: data.subtitle.color, fontSize: data.subtitle.fontSize, fontFamily: data.subtitle.fontFamily}} className="mt-4">
                <EditableText
                    value={data.subtitle.text}
                    onChange={(val) => handleTextUpdate('subtitle', val)}
                    isAdminMode={isAdminMode}
                    className="font-body"
                    as="p"
                    onSelect={createSelectHandler('subtitle')}
                />
            </div>
          )}
          {data.buttonText && (
            <div className="mt-8">
              <Button size="lg" className="bg-slate-800 border-2 border-white hover:bg-slate-700 text-white text-lg px-8 py-6 rounded-full">
                  <EditableText
                      value={data.buttonText}
                      onChange={handleButtonTextUpdate}
                      isAdminMode={isAdminMode}
                  />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isAdminMode && (
        <div className="absolute top-4 right-4 opacity-100 sm:opacity-0 group-hover/section:opacity-100 transition-opacity flex flex-col sm:flex-row gap-2 items-center bg-black/20 backdrop-blur-sm p-2 rounded-lg" onClick={(e) => e.stopPropagation()}>
          <input
              type="file"
              id={`hero-image-upload-${data.id}`}
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
          />
          <div className="flex items-center space-x-2">
            <Switch
              id={`parallax-${data.id}`}
              checked={!!data.parallaxEnabled}
              onCheckedChange={(checked) => updateSection(data.id, { parallaxEnabled: checked })}
            />
            <Label htmlFor={`parallax-${data.id}`} className="text-white text-xs font-semibold">Parallax</Label>
          </div>
          <Label htmlFor={`hero-image-upload-${data.id}`} className="cursor-pointer">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 pointer-events-none" as="span" title="Cambiar imagen de fondo">
              <ImageIcon />
            </Button>
          </Label>
          <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
