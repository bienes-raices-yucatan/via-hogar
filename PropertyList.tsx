import React from 'react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { Icon } from './Icon';

interface PropertyListProps {
  properties: Property[];
  onSelectProperty: (id: string) => void;
  onAddProperty: () => void;
  onUpdateProperty: (updatedProperty: Property) => void;
  onDeleteProperty: (id: string) => void;
  isAdminMode: boolean;
}

export const PropertyList: React.FC<PropertyListProps> = ({ 
    properties, 
    onSelectProperty, 
    onAddProperty, 
    onUpdateProperty, 
    onDeleteProperty, 
    isAdminMode 
}) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Propiedades Disponibles</h2>
        {isAdminMode && (
          <button
            onClick={onAddProperty}
            className="bg-amber-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center"
          >
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Añadir Propiedad
          </button>
        )}
      </div>
      
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
              onUpdate={onUpdateProperty}
              onDelete={onDeleteProperty}
              isAdminMode={isAdminMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl text-gray-600">No hay propiedades para mostrar.</h3>
          {isAdminMode ? (
            <p className="text-gray-500 mt-2">Haz clic en "Añadir Propiedad" para empezar.</p>
          ) : (
            <p className="text-gray-500 mt-2">Vuelve a consultar más tarde.</p>
          )}
        </div>
      )}
    </div>
  );
};