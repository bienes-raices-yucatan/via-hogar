
"use client";
import React from 'react';
import { AmenitiesSectionData, SelectedElement, AmenityItem } from '@/lib/types';
import { EditableText } from '@/components/editable-text';
import { SectionToolbar } from '@/components/section-toolbar';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import Image from 'next/image';
import { useImageLoader } from '@/hooks/use-image-loader';
import { saveImage } from '@/lib/storage';

interface AmenityDisplayProps {
    amenity: AmenityItem;
}

const AmenityDisplay: React.FC<AmenityDisplayProps> = ({ amenity }) => {
    // Use the useImageLoader hook for Amenity Images. We'll pass the raw data URL or key.
    const { imageUrl, isLoading } = useImageLoader(amenity.imageUrl);

    if (imageUrl) {
        return (
            <div className="relative w-12 h-12">
                <Image 
                    src={imageUrl} 
                    alt={amenity.text} 
                    fill 
                    className="object-contain rounded-md"
                />
            </div>
        )
    }

    // Fallback to icon if no image
    return (
        <div className="bg-primary/10 p-4 rounded-full">
            <Icon name={amenity.icon || 'generic-feature'} className="w-8 h-8 text-primary" />
        </div>
    );
};


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

  const handleUpdateAmenity = async (id: string, updates: Partial<AmenityItem>) => {
    // If imageUrl is a data URL, save it to IndexedDB and replace with key
    if (updates.imageUrl && updates.imageUrl.startsWith('data:')) {
        try {
            updates.imageUrl = await saveImage(updates.imageUrl);
        } catch (error) {
            console.error("Failed to save amenity image", error);
            // Optionally handle error, e.g., show a toast
        }
    }
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
        style={{ backgroundColor: data.style?.backgroundColor || '#FFFFFF' }}
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
                        <div className="mb-4 flex items-center justify-center h-12 w-12">
                           <AmenityDisplay amenity={amenity} />
                        </div>
                        <EditableText
                            as="p"
                            id={amenity.id}
                            isAdminMode={isAdminMode}
                            onUpdate={(val) => handleUpdateAmenity(amenity.id, { text: val.text })}
                            className="font-semibold text-foreground"
                            value={{
                                text: amenity.text,
                                color: '#000', 
                                fontFamily: 'Poppins', 
                                fontSize: 1,
                                fontWeight: 'normal',
                                textAlign: 'center'
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
