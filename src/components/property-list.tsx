
"use client";
import React from 'react';
import Image from 'next/image';
import { Property } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Icon } from './icon';

interface PropertyListProps {
  properties: Property[];
  onSelectProperty: (id: string) => void;
  onAddProperty: () => void;
  onUpdateProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  isAdminMode: boolean;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onSelectProperty,
  onAddProperty,
  isAdminMode,
  onDeleteProperty,
}) => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Propiedades Disponibles</h1>
        {isAdminMode && (
          <Button onClick={onAddProperty}>
            <Icon name="plus" className="mr-2" />
            Añadir Propiedad
          </Button>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <p className="text-muted-foreground mb-4">No hay propiedades todavía.</p>
          {isAdminMode && (
             <Button onClick={onAddProperty}>
                <Icon name="plus" className="mr-2" />
                Añadir la Primera Propiedad
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <Card key={prop.id} className="overflow-hidden group">
              <CardHeader className="p-0 relative">
                 <Image
                    src={prop.mainImageUrl}
                    alt={prop.name}
                    width={600}
                    height={400}
                    className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                />
                {isAdminMode && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProperty(prop.id);
                        }}
                    >
                        <Icon name="trash" />
                    </Button>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-xl mb-2">{prop.name}</CardTitle>
                <p className="text-muted-foreground text-sm mb-2">{prop.address}</p>
                <p className="text-lg font-semibold text-primary">{prop.price}</p>
              </CardContent>
              <CardFooter className="p-4 bg-muted/50">
                <Button onClick={() => onSelectProperty(prop.id)} className="w-full">
                  Ver Detalles
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
