'use client';

import React from 'react';
import { Property } from '@/lib/types';
import PropertyCard from './property-card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface PropertyListProps {
  properties: Property[];
  onSelectProperty: (id: string) => void;
  onDeleteProperty: (id: string) => void;
  onUpdateProperty: (property: Property) => void;
  isAdminMode: boolean;
  onAddNew: () => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onSelectProperty,
  onDeleteProperty,
  onUpdateProperty,
  isAdminMode,
  onAddNew,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline font-bold text-slate-800">Propiedades Disponibles</h1>
        {isAdminMode && (
          <Button onClick={onAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Propiedad
          </Button>
        )}
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
              onDelete={onDeleteProperty}
              onUpdate={onUpdateProperty}
              isAdminMode={isAdminMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl text-slate-600">No hay propiedades para mostrar.</h2>
          {isAdminMode && <p className="text-slate-500 mt-2">Haz clic en "Añadir Propiedad" para empezar.</p>}
        </div>
      )}
    </div>
  );
};

export default PropertyList;
