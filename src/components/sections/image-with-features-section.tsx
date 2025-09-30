
"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { ImageWithFeaturesSectionData, SelectedElement, FeatureItem, StyledText } from '@/lib/types';
import { SectionToolbar } from '@/components/section-toolbar';
import { EditableText } from '@/components/editable-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { saveImage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useImageLoader } from '@/hooks/use-image-loader';
import { Skeleton } from '../ui/skeleton';


const FeatureIconDisplay: React.FC<{ feature: FeatureItem }> = ({ feature }) => {
    const { imageUrl, isLoading } = useImageLoader(feature.imageUrl);

    if (imageUrl) {
        return (
            <div className="relative w-full h-full">
                <Image 
                    src={imageUrl} 
                    alt={feature.title.text} 
                    fill 
                    className="object-contain rounded-md"
                />
            </div>
        );
    }
    
    return <Icon name={feature.icon} className="w-6 h-6" />;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleUpdate = (newTitle: Partial<StyledText>) => {
    if (data.title) {
        onUpdate({ ...data, title: { ...data.title, ...newTitle } });
    }
  };
  
  const handleFeatureUpdate = async (featureId: string, updates: Partial<FeatureItem>) => {
    if (updates.imageUrl && updates.imageUrl.startsWith('data:')) {
        try {
            updates.imageUrl = await saveImage(updates.imageUrl);
        } catch (error) {
            console.error("Failed to save feature image", error);
        }
    }
    const newFeatures = data.features.map(f => (f.id === featureId ? { ...f, ...updates } : f));
    onUpdate({ ...data, features: newFeatures });
  };


  const handleAddFeature = () => {
    const newFeature: FeatureItem = {
      id: `feat-${Date.now()}`,
      icon: 'generic-feature',
      title: { text: 'Nueva Característica', fontSize: 1.125, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'left' },
      description: { text: 'Descripción breve', fontSize: 1, color: '#475569', fontFamily: 'Roboto', textAlign: 'left' },
    };
    onUpdate({ ...data, features: [...data.features, newFeature] });
  };
  
  const handleDeleteFeature = (id: string) => {
    const newFeatures = data.features.filter(f => f.id !== id);
    onUpdate({ ...data, features: newFeatures });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          const savedKey = await saveImage(dataUrl);
          onUpdate({ ...data, media: { ...data.media, url: savedKey } });
      };
      reader.readAsDataURL(file);
  };

  const handleSelectFeature = (featureId: string) => {
      if(!isAdminMode) return;
      onSelectElement({ sectionId: data.id, elementKey: 'features', subElementId: featureId });
  };

  const MediaComponent = () => {
    const isSelected = selectedElement?.sectionId === data.id && selectedElement.elementKey === 'media';
    const { imageUrl, isLoading } = useImageLoader(data.media.url);
    
    const mediaContent = () => {
        if (isLoading) return <Skeleton className="w-full h-full" />;

        if (!imageUrl) return <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">Sin medio</div>;

        if (data.media.type === 'video') {
            return <video src={imageUrl} controls className="w-full h-full object-cover" />;
        }
        
        return <Image src={imageUrl} alt={data.title?.text || 'Property Image'} fill className="object-cover" />;
    };
    
    return (
        <div className={cn(
            "relative w-full h-full rounded-lg overflow-hidden shadow-lg group/media",
            isAdminMode && "cursor-pointer",
            isSelected && "ring-2 ring-primary ring-offset-2"
        )}
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'media' })}>
            {mediaContent()}
             {isAdminMode && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/media:opacity-100 flex items-center justify-center transition-opacity">
                    <Button onClick={() => fileInputRef.current?.click()}>
                        <Icon name="pencil" className="mr-2" />
                        Cambiar
                    </Button>
                </div>
             )}
        </div>
    );
  }

  return (
    <section 
        className="py-12 md:py-20 relative group"
        style={{ backgroundColor: data.style?.backgroundColor }}
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'style' })}
    >
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*,video/*" />
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
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
            value={data.title}
            onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title' })}
            isSelected={selectedElement?.sectionId === data.id && selectedElement?.elementKey === 'title'}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-stretch">
          <div className="flex justify-center md:h-auto min-h-[400px]">
             <MediaComponent />
          </div>
          <div className="flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 flex-grow">
                {data.features.map((feature) => (
                <div 
                  key={feature.id} 
                  className="flex items-start gap-4 relative group/feature"
                  onClick={(e) => { e.stopPropagation(); handleSelectFeature(feature.id); }}
                >
                    <div 
                        className={cn(
                          "bg-primary/10 text-primary p-3 rounded-lg flex-shrink-0 h-12 w-12 flex items-center justify-center", 
                          isAdminMode && "cursor-pointer", 
                          selectedElement?.subElementId === feature.id && "ring-2 ring-primary"
                        )}
                    >
                      <FeatureIconDisplay feature={feature} />
                    </div>
                    <div className="flex-grow">
                        <EditableText
                            as="h4"
                            id={`${feature.id}-title`}
                            value={feature.title}
                            isAdminMode={isAdminMode}
                            onUpdate={(val) => handleFeatureUpdate(feature.id, { title: { ...feature.title, ...val} })}
                            onSelect={() => handleSelectFeature(feature.id)}
                            isSelected={selectedElement?.subElementId === feature.id}
                            className="font-bold text-lg text-foreground"
                        />
                         <EditableText
                            as="p"
                            id={`${feature.id}-desc`}
                            value={feature.description}
                            isAdminMode={isAdminMode}
                            onUpdate={(val) => handleFeatureUpdate(feature.id, { description: { ...feature.description, ...val} })}
                            onSelect={() => handleSelectFeature(feature.id)}
isSelected={selectedElement?.subElementId === feature.id}
                            className="text-muted-foreground mt-1"
                        />
                    </div>
                    {isAdminMode && (
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover/feature:opacity-100 transition-opacity">
                            <Button 
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFeature(feature.id);
                              }}
                            >
                                <Icon name="x-mark" className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                ))}
            </div>
            {isAdminMode && (
                <Button variant="outline" onClick={handleAddFeature} className="mt-8 self-start">
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
