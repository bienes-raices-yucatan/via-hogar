
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

interface SectionToolbarProps {
  sectionId: string;
  onDelete: (sectionId: string) => void;
  isSectionSelected: boolean;
}

export const SectionToolbar: React.FC<SectionToolbarProps> = ({ sectionId, onDelete, isSectionSelected }) => {
  return (
    <div 
        className={cn(
            "absolute top-2 right-2 z-30 flex items-center gap-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100",
            isSectionSelected && "opacity-100"
        )}
        onClick={(e) => e.stopPropagation()} // Evita que el clic en la barra de herramientas active la selección de la sección
    >
      <Button
        variant="destructive"
        size="icon"
        onClick={() => onDelete(sectionId)}
        aria-label="Delete section"
      >
        <Icon name="trash" className="h-4 w-4" />
      </Button>
    </div>
  );
};
