'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Property } from '@/lib/types';
import { Button } from './ui/button';
import EditableText from './editable-text';
import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import ConfirmationModal from './modals/confirmation-modal';
import Spinner from './spinner';
import { useToast } from "@/hooks/use-toast";

interface PropertyCardProps {
  property: Property;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (property: Property) => void;
  isAdminMode: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onDelete,
  onUpdate,
  isAdminMode,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const handleUpdate = (field: 'name' | 'address' | 'price', value: string | number) => {
    onUpdate({ ...property, [field]: value });
  };
  
  return (
    <>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <div className="relative group">
          <Image
            src={property.mainImageUrl}
            alt={property.name}
            width={400}
            height={300}
            className="w-full h-48 object-cover"
            data-ai-hint="house exterior"
          />
          {isAdminMode && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20"><Pencil /></Button>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-headline font-bold mb-2">
            <EditableText value={property.name} onChange={(val) => handleUpdate('name', val)} isAdminMode={isAdminMode} />
          </h3>
          <p className="text-sm text-slate-600 mb-2">
            <EditableText value={property.address} onChange={(val) => handleUpdate('address', val)} isAdminMode={isAdminMode} />
          </p>
          <p className="text-xl font-bold text-primary mt-auto pt-2">
            <EditableText
              value={`$${Number(property.price).toLocaleString()}`}
              onChange={(val) => handleUpdate('price', Number(val.replace(/[^0-9.-]+/g,"")))}
              isAdminMode={isAdminMode}
            />
          </p>
          <div className="mt-4 flex gap-2">
            <Button className="w-full bg-primary hover:bg-amber-600" onClick={() => onSelect(property.id)}>
              Ver Detalles
            </Button>
            {isAdminMode && (
              <Button size="icon" variant="destructive" onClick={() => setIsConfirmOpen(true)}>
                <Trash2 />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => onDelete(property.id)}
        title="Eliminar Propiedad"
        description="¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer."
      />
    </>
  );
};

export default PropertyCard;
