
"use client";

import React, { useRef } from 'react';
import { HeroSectionData, SelectedElement } from '@/lib/types';
import { SectionToolbar } from '../section-toolbar';
import { EditableText } from '../editable-text';
import { DraggableEditableText } from '../draggable-editable-text';
import { cn } from '@/lib/utils';
import { saveImage } from '@/lib/storage';
import { Button } from '../ui/button';
import { Icon } from '../icon';

interface HeroSectionProps {
  data: HeroSectionData;
  onUpdate: (data: HeroSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  isDraggingMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  data,
  onUpdate,
  onDelete,
  isAdminMode,
  isDraggingMode,
  selectedElement,
  onSelectElement,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleUpdate = (newTitle: any) => {
    onUpdate({ ...data, title: { ...data.title, ...newTitle } });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          const savedKey = await saveImage(dataUrl);
          onUpdate({ ...data, backgroundImageUrl: savedKey });
      };
      reader.readAsDataURL(file);
  };
  
  return (
    <section 
        className="relative h-[60vh] md:h-[80vh] w-full text-white group"
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'backgroundImageUrl' })}
    >
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        {isAdminMode && <SectionToolbar sectionId={data.id} onDelete={onDelete} isSectionSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'backgroundImageUrl'} />}
        {isAdminMode && (
            <Button
              variant="secondary"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100"
              onClick={() => fileInputRef.current?.click()}
            >
                <Icon name="camera" className="mr-2" />
                Cambiar Fondo
            </Button>
        )}
        <div
            className={cn(
                "absolute inset-0 bg-cover bg-center",
                isAdminMode && "group-hover:brightness-50 transition-all",
                selectedElement?.sectionId === data.id && selectedElement.elementKey === 'backgroundImageUrl' && "brightness-50"
            )}
            style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${data.backgroundImageUrl})`,
            }}
        />
        <div className={cn("relative z-10 h-full w-full", isDraggingMode && 'cursor-move')}>
            <DraggableEditableText
                id={data.title.id}
                value={data.title}
                onUpdate={handleTitleUpdate}
                bounds="parent"
                isAdminMode={isAdminMode}
                isDraggingMode={isDraggingMode}
                onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title'})}
                isSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'title'}
            />
        </div>
    </section>
  );
};
