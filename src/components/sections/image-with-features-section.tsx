
"use client";

import React from 'react';
import Image from 'next/image';
import { ImageWithFeaturesSectionData, SelectedElement, FeatureItem } from '@/lib/types';
import { SectionToolbar } from '@/components/section-toolbar';
import { EditableText } from '@/components/editable-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';

interface ImageWithFeaturesSectionProps {
  data: ImageWithFeaturesSectionData;
  onUpdate: (data: ImageWithFeaturesSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
}

export const ImageWithFeaturesSection: React.FC<ImageWithFeaturesSectionProps> = ({
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

  const handleAddFeature = () => {
    const newFeature: FeatureItem = {
      id: `feat-${Date.now()}`,
      icon: 'generic-feature',
      title: 'Nueva Característica',
      description: 'Descripción breve',
    };
    onUpdate({ ...data, features: [...data.features, newFeature] });
  };
  
  const handleDeleteFeature = (id: string) => {
    const newFeatures = data.features.filter(f => f.id !== id);
    onUpdate({ ...data, features: newFeatures });
  };

  const MediaComponent = () => {
    if (data.media.type === 'video') {
        return (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                <video
                    src={data.media.url}
                    controls
                    className="w-full h-full object-cover"
                />
            </div>
        )
    }
    // Default to image
    return (
        <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden shadow-lg">
            <Image
            src={data.media.url}
            alt={data.title?.text || 'Property Image'}
            fill
            className="object-cover"
            />
        </div>
    )
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="flex justify-center">
             <MediaComponent />
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {data.features.map((feature) => (
                <div key={feature.id} className="flex items-start gap-4 relative group/feature">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg flex-shrink-0">
                    <Icon name={feature.icon} className="w-6 h-6" />
                    </div>
                    <div>
                    <h4 className="font-bold text-lg text-foreground">{feature.title}</h4>
                    <p className="text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                    {isAdminMode && (
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover/feature:opacity-100 transition-opacity">
                            <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => handleDeleteFeature(feature.id)}>
                                <Icon name="x-mark" className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                ))}
            </div>
            {isAdminMode && (
                <Button variant="outline" onClick={handleAddFeature} className="mt-8">
                    <Icon name="plus" className="mr-2" />
                    Añadir Característica
                </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
