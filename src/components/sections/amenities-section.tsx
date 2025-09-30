
"use client";
import React from 'react';
import { AmenitiesSectionData, SelectedElement, AmenityItem } from '@/lib/types';
import { EditableText } from '@/components/editable-text';
import { SectionToolbar } from '@/components/section-toolbar';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface AmenitiesSectionProps {
  data: AmenitiesSectionData;
  onUpdate: (data: AmenitiesSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
}

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({
  data,
  onUpdate,
  onDelete,
  isAdminMode,
  selectedElement,
  onSelectElement,
}) => {
  const handleTitleUpdate = (newTitle: any) => {
    if (data.title) {
        onUpdate({ ...data, title: { ...data.title, ...newTitle } });
    }
  };
  
  const handleAddAmenity = () => {
    const newAmenity: AmenityItem = {
      id: `amenity-${Date.now()}`,
      text: 'Nueva Amenidad',
      icon: 'generic-feature',
    };
    onUpdate({ ...data, amenities: [...data.amenities, newAmenity] });
  };
  
  const handleDeleteAmenity = (id: string) => {
    const newAmenities = data.amenities.filter(a => a.id !== id);
    onUpdate({ ...data, amenities: newAmenities });
  };

  const handleUpdateAmenity = (id: string, updates: Partial<AmenityItem>) => {
    const newAmenities = data.amenities.map(a => a.id === id ? { ...a, ...updates } : a);
    onUpdate({ ...data, amenities: newAmenities });
  };

  const handleSelectAmenity = (amenityId: string) => {
    if (!isAdminMode) return;
    onSelectElement({ sectionId: data.id, elementKey: 'amenities', subElementId: amenityId });
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
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
            value={data.title}
            onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title' })}
            isSelected={selectedElement?.sectionId === data.id && selectedElement?.elementKey === 'title'}
          />
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {data.amenities.map(amenity => (
                <div 
                    key={amenity.id}
                    className={cn(
                        "relative group/amenity",
                        isAdminMode && "cursor-pointer rounded-lg p-2 transition-all hover:bg-accent/50",
                        selectedElement?.subElementId === amenity.id && "bg-accent/50 ring-2 ring-primary"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAmenity(amenity.id);
                    }}
                >
                     <div className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <Icon name={amenity.icon} className="w-8 h-8 text-primary" />
                        </div>
                        <EditableText
                            as="p"
                            id={amenity.id}
                            isAdminMode={isAdminMode}
                            onUpdate={(val) => handleUpdateAmenity(amenity.id, { text: val.text })}
                            className="font-semibold text-foreground"
                            value={{
                                text: amenity.text,
                                // Provide dummy style values, they aren't used for amenity text styling via toolbar
                                color: '#000', 
                                fontFamily: 'Roboto', 
                                fontSize: 1
                            }}
                            onSelect={() => handleSelectAmenity(amenity.id)}
                            isSelected={selectedElement?.subElementId === amenity.id}
                        />
                    </div>
                    {isAdminMode && (
                        <div className="absolute top-0 right-0 opacity-0 group-hover/amenity:opacity-100 transition-opacity">
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAmenity(amenity.id)
                                }}
                            >
                                <Icon name="x-mark" className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            ))}
            {isAdminMode && (
                <button
                    onClick={handleAddAmenity}
                    className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-4 hover:bg-accent hover:border-primary transition-colors"
                >
                    <Icon name="plus" className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-semibold text-muted-foreground">Añadir</span>
                </button>
            )}
        </div>
      </div>
    </section>
  );
};
