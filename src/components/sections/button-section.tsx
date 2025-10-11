
"use client";

import React from 'react';
import { ButtonSectionData, SelectedElement } from '@/lib/types';
import { SectionToolbar } from '@/components/section-toolbar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { EditableText } from '../editable-text';

interface ButtonSectionProps {
  data: ButtonSectionData;
  onUpdate: (data: Partial<ButtonSectionData>) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
}

export const ButtonSection: React.FC<ButtonSectionProps> = ({
  data,
  onUpdate,
  onDelete,
  isAdminMode,
  selectedElement,
  onSelectElement,
}) => {
  const isSelected = selectedElement?.sectionId === data.id;

  const handleTitleUpdate = (newTitle: any) => {
    if (data.title) {
      onUpdate({ ...data, title: { ...data.title, ...newTitle } });
    }
  };

  const handleSubtitleUpdate = (newSubtitle: any) => {
    if (data.subtitle) {
      onUpdate({ ...data, subtitle: { ...data.subtitle, ...newSubtitle } });
    }
  };

  const handleButtonClick = () => {
    const targetSelector = `[data-section-type="${data.linkTo || 'contact'}"]`;
    const targetSection = document.querySelector(targetSelector);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Target section "${data.linkTo}" not found to scroll to.`);
    }
  };

  return (
    <section
      className={cn("py-8 md:py-12 relative group text-center")}
      style={{ backgroundColor: data.style?.backgroundColor }}
      data-section-type="button"
      onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'style' })}
    >
      <div className="container mx-auto px-4">
        {isAdminMode && <SectionToolbar sectionId={data.id} onDelete={onDelete} isSectionSelected={isSelected && selectedElement.elementKey === 'style'} />}

        {data.title && (data.title.text || isAdminMode) && (
          <EditableText
            as="h2"
            id={`${data.id}-title`}
            value={data.title}
            onUpdate={handleTitleUpdate}
            className="mb-2"
            isAdminMode={isAdminMode}
            onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title' })}
            isSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'title'}
          />
        )}

        {data.subtitle && (data.subtitle.text || isAdminMode) && (
          <EditableText
            as="p"
            id={`${data.id}-subtitle`}
            value={data.subtitle}
            onUpdate={handleSubtitleUpdate}
            className="max-w-2xl mx-auto mb-6 text-muted-foreground"
            isAdminMode={isAdminMode}
            onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'subtitle' })}
            isSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'subtitle'}
          />
        )}

        <div
          className={cn(
            "inline-block",
            isAdminMode && "cursor-pointer p-2 rounded-md",
            isAdminMode && selectedElement?.sectionId === data.id && (selectedElement.elementKey === 'text' || selectedElement.elementKey === 'alignment') && "bg-accent/30 ring-2 ring-primary ring-offset-2"
          )}
          onClick={(e) => {
            if (isAdminMode) {
              e.stopPropagation();
              onSelectElement({ sectionId: data.id, elementKey: 'text' });
            }
          }}
        >
          {isAdminMode ? (
            <Input
              type="text"
              value={data.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="w-auto text-center !text-lg !px-8 !h-12"
            />
          ) : (
            <Button size="lg" onClick={handleButtonClick}>
              {data.text}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

    