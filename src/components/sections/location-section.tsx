
"use client";

import React, { useState } from 'react';
import { LocationSectionData, SelectedElement, NearbyPlace } from '@/lib/types';
import { Icon } from '@/components/icon';
import { EditableText } from '@/components/editable-text';
import { SectionToolbar } from '@/components/section-toolbar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useImageLoader } from '@/hooks/use-image-loader';


const NearbyPlaceItem: React.FC<{ place: NearbyPlace; isAdminMode: boolean; onSelect: () => void; isSelected: boolean }> = ({ place, isAdminMode, onSelect, isSelected }) => {
    const { imageUrl } = useImageLoader(place.imageUrl);

    return (
        <div 
            className={cn(
                "flex items-center gap-4 p-2 rounded-lg",
                isAdminMode && "cursor-pointer hover:bg-accent/50",
                isSelected && "bg-accent/50 ring-2 ring-primary"
            )}
            onClick={onSelect}
        >
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                {imageUrl ? <Image src={imageUrl} alt={place.text} width={24} height={24} className="object-contain" /> : <Icon name={place.icon} className="w-5 h-5" />}
            </div>
            <p className="text-sm text-foreground">{place.text}</p>
        </div>
    );
};


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
        {data.title && (data.title.text || isAdminMode) && (
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

          <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow-lg min-h-[450px]">
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
            
            {(data.nearbyPlaces && data.nearbyPlaces.length > 0) && (
              <>
                <h3 className="text-xl font-bold mb-4 text-foreground">Puntos de Interés</h3>
                 <div className="space-y-4">
                    {data.nearbyPlaces.map(place => (
                        <NearbyPlaceItem 
                            key={place.id}
                            place={place}
                            isAdminMode={isAdminMode}
                            isSelected={selectedElement?.elementKey === 'nearbyPlaces' && selectedElement.subElementId === place.id}
                            onSelect={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'nearbyPlaces', subElementId: place.id })}
                        />
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

    