'use client';
import { HeroSectionData } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import EditableText from '../editable-text';

interface HeroSectionProps {
  data: HeroSectionData;
  updateSection: (sectionId: string, updatedData: Partial<HeroSectionData>) => void;
  deleteSection: (sectionId: string) => void;
  isAdminMode: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ data, updateSection, deleteSection, isAdminMode }) => {
  
  const handleTextUpdate = (field: 'title' | 'subtitle', value: string) => {
    const updatedField = { ...data[field], text: value };
    updateSection(data.id, { [field]: updatedField });
  }
  
  const handleButtonTextUpdate = (value: string) => {
    updateSection(data.id, { buttonText: value });
  }

  return (
    <div 
      className="relative group/section w-full h-[70vh] md:h-[80vh] bg-cover bg-center" 
      style={{ backgroundImage: `url(${data.imageUrl})` }}
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
                />
            </div>
          )}
          <div className="mt-8">
            <Button size="lg" className="bg-primary hover:bg-amber-600 text-primary-foreground text-lg px-8 py-6">
                <EditableText
                    value={data.buttonText}
                    onChange={handleButton-text-update}
                    isAdminMode={isAdminMode}
                />
            </Button>
          </div>
        </div>
      </div>
      
      {isAdminMode && (
        <div className="absolute top-4 right-4 opacity-0 group-hover/section:opacity-100 transition-opacity flex gap-2">
          <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
