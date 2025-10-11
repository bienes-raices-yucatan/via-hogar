
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
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

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
  
  const handleParallaxToggle = (isChecked: boolean) => {
      onUpdate({ ...data, isParallax: isChecked });
  };

  const sectionStyle: React.CSSProperties = {
    height: data.style?.height ? `${data.style.height}vh` : '80vh',
    minHeight: '400px',
    backgroundColor: 'white', // Fallback color
    backgroundImage: `url(${imageUrl})`,
    borderRadius: isFirstSection 
        ? `0 0 ${data.style?.borderRadiusBottomRight || 0}rem ${data.style?.borderRadiusBottomLeft || 0}rem`
        : `${data.style?.borderRadiusTopLeft || 0}rem ${data.style?.borderRadiusTopRight || 0}rem ${data.style?.borderRadiusBottomRight || 0}rem ${data.style?.borderRadiusBottomLeft || 0}rem`,
  };

  const isSelected = selectedElement?.sectionId === data.id && (selectedElement.elementKey === 'backgroundImageUrl' || selectedElement.elementKey === 'style');

  if (isLoading) {
    return (
        <Skeleton 
            className="relative w-full"
            style={{...sectionStyle, backgroundImage: 'none'}} 
        />
    )
  }

  return (
    <section 
        className={cn(
            "relative text-white group w-full bg-cover bg-center",
            data.isParallax && "bg-fixed",
            isAdminMode && "group-hover:brightness-90 transition-all",
            isSelected && "brightness-90"
        )}
        style={sectionStyle}
    >
        {isAdminMode && (
          <>
            <div className="absolute top-2 left-2 z-20 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement({ sectionId: data.id, elementKey: 'style' });
                }}
                title="Editar estilo del banner"
              >
                <Icon name="pencil" className="h-4 w-4" />
              </Button>
               <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDelete(data.id)}
                  title="Eliminar sección"
              >
                  <Icon name="trash" className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="absolute top-2 right-2 z-20 flex items-center space-x-2 bg-black/20 backdrop-blur-sm p-2 rounded-md">
                <Switch
                    id={`parallax-switch-${data.id}`}
                    checked={data.isParallax}
                    onCheckedChange={handleParallaxToggle}
                />
                <Label htmlFor={`parallax-switch-${data.id}`} className="text-xs text-white font-medium cursor-pointer">
                    Efecto de Movilidad
                </Label>
            </div>
          </>
        )}
        
        <div className={cn("absolute inset-0 bg-black/30 z-0")} style={{ borderRadius: 'inherit' }}></div>

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
