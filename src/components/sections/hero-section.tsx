
"use client";

import React, { useRef } from 'react';
import { HeroSectionData, SelectedElement } from '@/lib/types';
import { SectionToolbar } from '../section-toolbar';
import { DraggableEditableText } from '../draggable-editable-text';
import { cn } from '@/lib/utils';
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
  const { imageUrl, isLoading } = useImageLoader(data.backgroundImageUrl);

  const handleTitleUpdate = (newTitle: any) => {
    onUpdate({ ...data, title: { ...data.title, ...newTitle } });
  };
  
  const sectionStyle: React.CSSProperties = {
    height: data.style?.height ? `${data.style.height}vh` : '80vh',
    minHeight: '400px', // Ensure a minimum height
    borderRadius: `${data.style?.borderRadiusTopLeft || 0}rem ${data.style?.borderRadiusTopRight || 0}rem ${data.style?.borderRadiusBottomRight || 0}rem ${data.style?.borderRadiusBottomLeft || 0}rem`,
    overflow: 'hidden',
  };

  const backgroundStyle: React.CSSProperties = {
      backgroundImage: `url(${imageUrl})`,
  };

  const isSelected = selectedElement?.sectionId === data.id && (selectedElement.elementKey === 'backgroundImageUrl' || selectedElement.elementKey === 'style');

  return (
    <section 
        className="relative text-white group w-full"
        style={sectionStyle}
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'style' })}
    >
        {isAdminMode && <SectionToolbar sectionId={data.id} onDelete={onDelete} isSectionSelected={isSelected} />}
        
        {isLoading ? (
            <Skeleton className="absolute inset-0" style={sectionStyle} />
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
            { (isAdminMode || data.title.text) && (
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
            )}
        </div>
    </section>
  );
};
