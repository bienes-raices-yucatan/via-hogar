
"use client";

import React from 'react';
import { LocationSectionData, SelectedElement } from '@/lib/types';
import { Icon } from '@/components/icon';
import { EditableText } from '@/components/editable-text';
import { SectionToolbar } from '@/components/section-toolbar';

interface LocationSectionProps {
  data: LocationSectionData;
  onUpdate: (data: LocationSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
  propertyAddress: string;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  data,
  onUpdate,
  onDelete,
  isAdminMode,
  selectedElement,
  onSelectElement,
  propertyAddress,
}) => {
  const mapUrl = `https://maps.google.com/maps?q=${data.coordinates.lat},${data.coordinates.lng}&hl=es&z=15&output=embed`;

  const handleTitleUpdate = (newTitle: any) => {
    if (data.title) {
        onUpdate({ ...data, title: { ...data.title, ...newTitle } });
    }
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
            <p className="text-muted-foreground mb-6">{propertyAddress}</p>
            
            <h3 className="text-xl font-bold mb-4 text-foreground">Lugares de Interés Cercanos</h3>
            <div className="space-y-4">
              {data.nearbyPlaces && data.nearbyPlaces.length > 0 ? (
                data.nearbyPlaces.map((place) => (
                  <div key={place.id} className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Icon name={place.icon || 'generic-feature'} className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground">{place.text}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No se encontraron lugares de interés cercanos o aún no se han generado.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
