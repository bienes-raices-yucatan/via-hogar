
"use client";

import React, { useState } from 'react';
import { LocationSectionData, SelectedElement, NearbyPlace } from '@/lib/types';
import { Icon } from '@/components/icon';
import { EditableText } from '@/components/editable-text';
import { SectionToolbar } from '@/components/section-toolbar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

interface LocationSectionProps {
  data: LocationSectionData;
  onUpdate: (data: Partial<LocationSectionData>) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
  propertyAddress: string;
  onUpdateAddress: (newAddress: string) => Promise<void>;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  data,
  onUpdate,
  onDelete,
  isAdminMode,
  selectedElement,
  onSelectElement,
  propertyAddress,
  onUpdateAddress,
}) => {
  const mapUrl = `https://maps.google.com/maps?q=${data.coordinates.lat},${data.coordinates.lng}&hl=es&z=15&output=embed`;

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState(propertyAddress);
  const [isLoading, setIsLoading] = useState(false);

  const handleTitleUpdate = (newTitle: any) => {
    if (data.title) {
        onUpdate({ ...data, title: { ...data.title, ...newTitle } });
    }
  };

  const handleAddressSave = async () => {
      if (addressDraft === propertyAddress) {
          setIsEditingAddress(false);
          return;
      }
      setIsLoading(true);
      await onUpdateAddress(addressDraft);
      setIsLoading(false);
      setIsEditingAddress(false);
  };
  
  const handleNearbyPlacesUpdate = (newNearbyPlaces: NearbyPlace[]) => {
      onUpdate({ nearbyPlaces: newNearbyPlaces });
  };
  
  const handleAddPlace = () => {
      const newPlace: NearbyPlace = {
          id: `nearby-${Date.now()}`,
          icon: 'generic-feature',
          text: 'Nuevo lugar - 5 min'
      };
      const newPlaces = [...(data.nearbyPlaces || []), newPlace];
      handleNearbyPlacesUpdate(newPlaces);
  };

  const handleDeletePlace = (id: string) => {
      const newPlaces = (data.nearbyPlaces || []).filter(p => p.id !== id);
      handleNearbyPlacesUpdate(newPlaces);
  };
  
  const handleUpdatePlace = (id: string, updates: Partial<NearbyPlace>) => {
      const newPlaces = (data.nearbyPlaces || []).map(p => p.id === id ? {...p, ...updates} : p);
      handleNearbyPlacesUpdate(newPlaces);
  };

  const handleSelectPlace = (placeId: string) => {
    if (!isAdminMode) return;
    onSelectElement({ sectionId: data.id, elementKey: 'nearbyPlaces', subElementId: placeId });
  };


  return (
    <section 
        className="py-12 md:py-20 relative group"
        style={{ backgroundColor: data.style?.backgroundColor }}
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'style' })}
    >
      <div className="container mx-auto px-4">
        {isAdminMode && (
          <SectionToolbar
            sectionId={data.id}
            onDelete={onDelete}
            isSectionSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'style'}
          />
        )}
        {data.title && (
          <EditableText
            id={`${data.id}-title`}
            as="h2"
            isAdminMode={isAdminMode}
            onUpdate={handleTitleUpdate}
            className="text-3xl md:text-4xl font-bold text-center mb-10 text-foreground"
            value={data.title}
            onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title' })}
            isSelected={selectedElement?.sectionId === data.id && selectedElement?.elementKey === 'title'}
          />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 rounded-lg overflow-hidden shadow-xl">
            <iframe
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={mapUrl}
            ></iframe>
          </div>

          <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2 text-foreground">Ubicación</h3>
            {isEditingAddress && isAdminMode ? (
                <div className="flex gap-2 items-center mb-6">
                    <Input 
                        value={addressDraft}
                        onChange={(e) => setAddressDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddressSave()}
                        disabled={isLoading}
                    />
                    <Button onClick={handleAddressSave} disabled={isLoading} size="sm">
                        {isLoading ? '...' : 'Guardar'}
                    </Button>
                </div>
            ) : (
                <div className="flex items-start justify-between mb-6">
                    <p className="text-muted-foreground">{propertyAddress}</p>
                    {isAdminMode && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => { setAddressDraft(propertyAddress); setIsEditingAddress(true); }}
                        >
                            <Icon name="pencil" className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-foreground">Lugares de Interés</h3>
                 {isAdminMode && (
                    <Button variant="outline" size="sm" onClick={handleAddPlace}>
                        <Icon name="plus" className="mr-1 h-4 w-4" />
                        Añadir
                    </Button>
                )}
            </div>
            <div className="space-y-4">
              {data.nearbyPlaces && data.nearbyPlaces.length > 0 ? (
                data.nearbyPlaces.map((place) => (
                  <div 
                    key={place.id}
                    className={cn(
                        "flex items-center gap-4 relative group/place rounded-md",
                        isAdminMode && "cursor-pointer p-2 hover:bg-accent/50",
                        selectedElement?.subElementId === place.id && "bg-accent/50 ring-2 ring-primary"
                    )}
                    onClick={(e) => {e.stopPropagation(); handleSelectPlace(place.id)}}
                  >
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Icon name={place.icon || 'generic-feature'} className="w-5 h-5 text-primary" />
                    </div>
                    <EditableText
                        as="span"
                        id={`${place.id}-text`}
                        value={{text: place.text, fontSize: 1, color: 'hsl(var(--foreground))', fontFamily: 'Poppins'}}
                        onUpdate={(val) => handleUpdatePlace(place.id, { text: val.text })}
                        isAdminMode={isAdminMode}
                        onSelect={() => handleSelectPlace(place.id)}
                        isSelected={selectedElement?.subElementId === place.id}
                        className="text-foreground flex-grow"
                    />
                     {isAdminMode && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover/place:opacity-100 transition-opacity">
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePlace(place.id);
                                }}
                            >
                                <Icon name="trash" className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No se han añadido lugares de interés.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
