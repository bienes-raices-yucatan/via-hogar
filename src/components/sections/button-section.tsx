
"use client";

import React from 'react';
import { ButtonSectionData, SelectedElement } from '@/lib/types';
import { SectionToolbar } from '@/components/section-toolbar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

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

  const handleButtonClick = () => {
    const targetSelector = `[data-section-type="${data.linkTo || 'contact'}"]`;
    const targetSection = document.querySelector(targetSelector);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Target section "${data.linkTo}" not found to scroll to.`);
    }
  };

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <section 
        className={cn(
            "py-8 md:py-12 relative group",
        )}
        style={{ backgroundColor: data.style?.backgroundColor }}
        data-section-type="button"
    >
      <div className={cn("container mx-auto px-4 flex", alignmentClasses[data.alignment || 'center'])}
           onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'text' })}
      >
        {isAdminMode && <SectionToolbar sectionId={data.id} onDelete={onDelete} isSectionSelected={isSelected} />}
        
        {isAdminMode ? (
            <div className={cn(
              "p-2 rounded-md",
              isAdminMode && "cursor-pointer hover:bg-accent/20",
              isSelected && "bg-accent/30 ring-2 ring-primary ring-offset-2"
            )}>
              <Input
                  type="text"
                  value={data.text}
                  onChange={(e) => onUpdate({ text: e.target.value })}
                  className="w-auto text-center !text-lg !px-8 !h-12"
              />
            </div>
        ) : (
            <Button size="lg" onClick={handleButtonClick}>
                {data.text}
            </Button>
        )}
      </div>
    </section>
  );
};
