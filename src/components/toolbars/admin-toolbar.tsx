import React from 'react';
import { Button } from '../ui/button';
import { Move, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AnySectionData } from '@/lib/types';
import { GalleryHorizontal, LayoutGrid, Mail, Image as ImageIcon, MapPin, BadgeDollarSign } from 'lucide-react';

interface AdminToolbarProps {
  isDraggingMode: boolean;
  onToggleDragMode: () => void;
  onAddSection: (sectionType: AnySectionData['type']) => void;
}

const sectionOptions = [
  { type: 'IMAGE_WITH_FEATURES' as const, label: 'Imagen y Características', icon: <ImageIcon/> },
  { type: 'GALLERY' as const, label: 'Galería', icon: <GalleryHorizontal/> },
  { type: 'AMENITIES' as const, label: 'Comodidades', icon: <LayoutGrid/> },
  { type: 'LOCATION' as const, label: 'Ubicación', icon: <MapPin/> },
  { type: 'CONTACT' as const, label: 'Contacto', icon: <Mail/> },
  { type: 'PRICING' as const, label: 'Precios', icon: <BadgeDollarSign /> },
];

const AdminToolbar: React.FC<AdminToolbarProps> = ({ isDraggingMode, onToggleDragMode, onAddSection }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="default"
            className="bg-primary hover:bg-amber-600 rounded-full h-12 w-12 shadow-lg"
            title="Añadir nueva sección"
          >
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-56 mb-2">
          {sectionOptions.map(option => (
            <DropdownMenuItem key={option.type} onClick={() => onAddSection(option.type)} className="flex items-center gap-2">
              {React.cloneElement(option.icon, { className: 'h-4 w-4' })}
              <span>{option.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="icon"
        onClick={onToggleDragMode}
        variant={isDraggingMode ? 'default' : 'secondary'}
        className="rounded-full h-12 w-12 shadow-lg"
        title={isDraggingMode ? 'Desactivar modo arrastrar' : 'Activar modo arrastrar'}
      >
        <Move />
      </Button>
    </div>
  );
};

export default AdminToolbar;
