
"use client";

import React from 'react';
import { HeroSectionData, SelectedElement } from '@/lib/types';
import { SectionToolbar } from '../section-toolbar';
import { DraggableEditableText } from '../draggable-editable-text';
import { cn } from '@/lib/utils';
import { useImageLoader } from '@/hooks/use-image-loader';
import { Skeleton } from '../ui/skeleton';
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
  isFirstSection: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  data,
  onUpdate,
  onDelete,
  isAdminMode,
  isDraggingMode,
  selectedElement,
  onSelectElement,
  isFirstSection,
}) => {
  const { imageUrl, isLoading } = useImageLoader(data.backgroundImageUrl);

  const handleTitleUpdate = (newTitle: any) => {
    onUpdate({ ...data, title: { ...data.title, ...newTitle } });
  };
  
  const sectionStyle: React.CSSProperties = {
    height: data.style?.height ? `${data.style.height}vh` : '80vh',
    minHeight: '400px', // Ensure a minimum height
    borderRadius: isFirstSection 
        ? `0 0 ${data.style?.borderRadiusBottomRight || 0}rem ${data.style?.borderRadiusBottomLeft || 0}rem`
        : `${data.style?.borderRadiusTopLeft || 0}rem ${data.style?.borderRadiusTopRight || 0}rem ${data.style?.borderRadiusBottomRight || 0}rem ${data.style?.borderRadiusBottomLeft || 0}rem`,
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
    >
        {isAdminMode && (
          <>
            <SectionToolbar sectionId={data.id} onDelete={onDelete} isSectionSelected={isSelected} />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-14 z-20 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement({ sectionId: data.id, elementKey: 'style' });
              }}
              title="Editar estilo del banner"
            >
              <Icon name="pencil" className="h-4 w-4" />
            </Button>
          </>
        )}
        
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

    