
"use client";

import React, { useRef } from 'react';
import { HeroSectionData, SelectedElement } from '@/lib/types';
import { SectionToolbar } from '../section-toolbar';
import { DraggableEditableText } from '../draggable-editable-text';
import { cn } from '@/lib/utils';
import { saveImage } from '@/lib/storage';
import { Button } from '../ui/button';
import { Icon } from '../icon';
import { useImageLoader } from '@/hooks/use-image-loader';
import { Skeleton } from '../ui/skeleton';

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
  const { imageUrl, isLoading } = useImageLoader(data.backgroundImageUrl);

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
  
  const sectionStyle: React.CSSProperties = {
    height: `${data.style?.height || 80}vh`,
    borderRadius: `${data.style?.borderRadiusTopLeft || 0}rem ${data.style?.borderRadiusTopRight || 0}rem ${data.style?.borderRadiusBottomRight || 0}rem ${data.style?.borderRadiusBottomLeft || 0}rem`,
    overflow: 'hidden',
  };

  const backgroundStyle: React.CSSProperties = {
      backgroundImage: `url(${imageUrl})`,
  };

  const isSelected = selectedElement?.sectionId === data.id && (selectedElement.elementKey === 'backgroundImageUrl' || selectedElement.elementKey === 'style');

  return (
    <section 
        className="relative w-full text-white group"
        style={sectionStyle}
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'style' })}
    >
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        {isAdminMode && <SectionToolbar sectionId={data.id} onDelete={onDelete} isSectionSelected={isSelected} />}
        
        {isAdminMode && (
            <Button
              variant="secondary"
              className="absolute top-2 right-14 z-20"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              size="sm"
            >
                <Icon name="camera" className="mr-2 h-4 w-4" />
                Cambiar Fondo
            </Button>
        )}
        
        {isLoading ? (
            <Skeleton className="absolute inset-0" />
        ) : (
            <div
                className={cn(
                    "absolute inset-0 bg-cover bg-center",
                    isAdminMode && "group-hover:brightness-90 transition-all",
                    isSelected && "brightness-90"
                )}
                style={backgroundStyle}
            />
        )}
        <div className="absolute inset-0 bg-black/20 z-0"></div>

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

    