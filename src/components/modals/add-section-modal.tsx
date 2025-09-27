'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnySectionData } from '@/lib/types';
import { GalleryHorizontal, LayoutGrid, MapPin, Grid3x3 } from 'lucide-react';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (sectionType: AnySectionData['type']) => void;
}

const sectionOptions = [
  { type: 'GALLERY' as const, label: 'Galería', icon: <GalleryHorizontal/> },
  { type: 'AMENITIES' as const, label: 'Comodidades', icon: <Grid3x3/> },
  // Add other section types here
];

const AddSectionModal: React.FC<AddSectionModalProps> = ({ isOpen, onClose, onAddSection }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Nueva Sección</DialogTitle>
          <DialogDescription>
            Elige el tipo de sección que deseas añadir a la página de la propiedad.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {sectionOptions.map((option) => (
            <Button
              key={option.type}
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => onAddSection(option.type)}
            >
                {option.icon}
              <span>{option.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSectionModal;
