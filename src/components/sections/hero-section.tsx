
"use client";

import React from 'react';
import { HeroSectionData, SelectedElement } from '@/lib/types';
import { SectionToolbar } from '../section-toolbar';
import { EditableText } from '../editable-text';
import { DraggableEditableText } from '../draggable-editable-text';
import { cn } from '@/lib/utils';


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
  const handleTitleUpdate = (newTitle: any) => {
    onUpdate({ ...data, title: { ...data.title, ...newTitle } });
  };
  
  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full text-white group">
        {isAdminMode && <SectionToolbar sectionId={data.id} onDelete={onDelete} isSectionSelected={false} />}
        <div
            className="absolute inset-0 bg-cover bg-center"
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

