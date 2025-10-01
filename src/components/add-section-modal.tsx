
"use client";

import React from 'react';
import { AnySectionData, IconName } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from './icon';

interface AddSectionModalProps {
  onClose: () => void;
  onSelect: (sectionType: AnySectionData['type']) => void;
}

const sectionOptions: { type: AnySectionData['type']; label: string; description: string, icon: IconName }[] = [
  { type: 'hero', label: 'Héroe', description: 'Banner principal con imagen y título.', icon: 'sparkles' },
  { type: 'imageWithFeatures', label: 'Imagen y Características', description: 'Una imagen destacada con puntos clave.', icon: 'check' },
  { type: 'gallery', label: 'Galería', description: 'Múltiples imágenes en un carrusel o cuadrícula.', icon: 'area' },
  { type: 'amenities', label: 'Amenidades', description: 'Lista de amenidades con iconos.', icon: 'list' },
  { type: 'location', label: 'Ubicación', description: 'Mapa y puntos de interés cercanos.', icon: 'map-pin' },
  { type: 'pricing', label: 'Precios', description: 'Tabla o tarjetas de precios.', icon: 'bath' }, // Using 'bath' as a stand-in for pricing
  { type: 'contact', label: 'Contacto', description: 'Formulario o llamada a la acción de contacto.', icon: 'whatsapp' },
  { type: 'button', label: 'Botón CTA', description: 'Un botón de llamada a la acción.', icon: 'message-circle' },
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({ onClose, onSelect }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Sección</DialogTitle>
          <DialogDescription>
            Elige el tipo de sección que quieres agregar a tu página.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
          {sectionOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => onSelect(option.type)}
              className="flex flex-col items-center justify-center p-4 border rounded-lg text-center hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <Icon name={option.icon} className="w-8 h-8 mb-2" />
              <span className="font-semibold">{option.label}</span>
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
