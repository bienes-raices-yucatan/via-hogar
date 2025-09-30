
"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import { Property } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Icon } from './icon';
import { saveImage } from '@/lib/storage';
import { useImageLoader } from '@/hooks/use-image-loader';
import { Skeleton } from './ui/skeleton';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  prop: Property;
  onSelectProperty: (id: string) => void;
  onDeleteProperty: (id: string) => void;
  onImageUploadClick: (e: React.MouseEvent, propertyId: string) => void;
  isAdminMode: boolean;
  isSelectedForExport: boolean;
  onToggleSelection: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
    prop, 
    onSelectProperty, 
    onDeleteProperty, 
    onImageUploadClick, 
    isAdminMode,
    isSelectedForExport,
    onToggleSelection
}) => {
    const { imageUrl, isLoading } = useImageLoader(prop.mainImageUrl);

    return (
        <Card className={cn("overflow-hidden group transition-all", isSelectedForExport && "ring-2 ring-primary ring-offset-2")}>
          <CardHeader className="p-0 relative group/image">
            {isAdminMode && (
                 <div className="absolute top-2 left-2 z-10 bg-background/50 backdrop-blur-sm rounded-full p-1">
                    <Checkbox
                        id={`select-${prop.id}`}
                        checked={isSelectedForExport}
                        onCheckedChange={() => onToggleSelection(prop.id)}
                        className="h-5 w-5"
                    />
                </div>
            )}
            {isLoading ? (
                <Skeleton className="w-full h-48" />
            ) : imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={prop.name}
                    width={600}
                    height={400}
                    className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
                    Sin imagen
                </div>
            )}
            {isAdminMode && (
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                  <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProperty(prop.id);
                      }}
                  >
                      <Icon name="trash" />
                  </Button>
                  <Button
                      variant="secondary"
                      size="icon"
                      onClick={(e) => onImageUploadClick(e, prop.id)}
                  >
                      <Icon name="pencil" />
                  </Button>
              </div>
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
    );
};


interface PropertyListProps {
  properties: Property[];
  onSelectProperty: (id: string) => void;
  onAddProperty: () => void;
  onUpdateProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  isAdminMode: boolean;
  selectedIdsForExport: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onSelectProperty,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  isAdminMode,
  selectedIdsForExport,
  onToggleSelection,
  onToggleAll,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const propertyIdToUpdateRef = useRef<string | null>(null);

  const handleImageUploadClick = (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    propertyIdToUpdateRef.current = propertyId;
    imageInputRef.current?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const propertyId = propertyIdToUpdateRef.current;
    if (!file || !propertyId) return;

    const propertyToUpdate = properties.find(p => p.id === propertyId);
    if (!propertyToUpdate) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        try {
            const savedKey = await saveImage(dataUrl);
            onUpdateProperty({ ...propertyToUpdate, mainImageUrl: savedKey });
        } catch(err) {
            console.error("Failed to save image", err);
            // Fallback to dataURL if indexedDB fails, though it's not ideal for large images
            onUpdateProperty({ ...propertyToUpdate, mainImageUrl: dataUrl });
        }
    };
    reader.readAsDataURL(file);

    // Reset for next upload
    if(imageInputRef.current) imageInputRef.current.value = "";
    propertyIdToUpdateRef.current = null;
  };

  const areAllSelected = properties.length > 0 && selectedIdsForExport.size === properties.length;


  return (
    <div className="container mx-auto p-4 md:p-8">
      <input 
        type="file" 
        ref={imageInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageChange}
      />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Propiedades Disponibles</h1>
        {isAdminMode && (
          <Button onClick={onAddProperty}>
            <Icon name="plus" className="mr-2" />
            Añadir Propiedad
          </Button>
        )}
      </div>

       {isAdminMode && properties.length > 0 && (
          <div className="flex items-center gap-4 mb-8 p-4 bg-muted rounded-lg">
             <Checkbox 
                id="select-all" 
                checked={areAllSelected} 
                onCheckedChange={onToggleAll}
            />
             <Label htmlFor="select-all" className="font-medium">
                {areAllSelected ? 'Deseleccionar Todas' : 'Seleccionar Todas para Guardar'}
            </Label>
             <span className="text-sm text-muted-foreground">({selectedIdsForExport.size} seleccionadas)</span>
          </div>
      )}


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
            <PropertyCard
              key={prop.id}
              prop={prop}
              onSelectProperty={onSelectProperty}
              onDeleteProperty={onDeleteProperty}
              onImageUploadClick={handleImageUploadClick}
              isAdminMode={isAdminMode}
              isSelectedForExport={selectedIdsForExport.has(prop.id)}
              onToggleSelection={onToggleSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
};
