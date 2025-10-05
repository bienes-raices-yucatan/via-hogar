"use client";

import React, { useRef, useState, useEffect } from 'react';
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

const MediaComponent = ({ data, onUpdate, isAdminMode }: { data: ImageWithFeaturesSectionData; onUpdate: (data: Partial<ImageWithFeaturesSectionData>) => void; isAdminMode: boolean; }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { imageUrl: mediaUrl, isLoading } = useImageLoader(data.media.url);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            const savedKey = await saveImage(dataUrl);
            const fileType = file.type.startsWith('video') ? 'video' : 'image';
            onUpdate({ media: { type: fileType, url: savedKey } });
        };
        reader.readAsDataURL(file);
    };
    
    const mediaContent = () => {
        if (isLoading) return <Skeleton className="w-full h-full aspect-video rounded-lg" />;
        
        if (!mediaUrl) return (
             <div 
                className="w-full h-96 rounded-lg flex items-center justify-center text-muted-foreground border-2 border-dashed"
                onClick={() => isAdminMode && fileInputRef.current?.click()}
            >
                <div className="text-center">
                    <Icon name="camera" className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Click para añadir</p>
                </div>
            </div>
        );
        
        const mediaElement = data.media.type === 'video' ? (
             <video 
                key={mediaUrl} 
                src={mediaUrl} 
                controls 
                className="w-full h-auto object-contain rounded-lg"
            />
        ) : (
            <Image 
                src={mediaUrl} 
                alt={data.title?.text || 'Property Image'} 
                width={600} 
                height={800} 
                className="w-full h-auto object-contain rounded-lg"
            />
        );

        return (
             <div className="relative group/media">
                {mediaElement}
                {isAdminMode && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={handleImageUpload}
                        />
                        {mediaUrl && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/media:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                <Button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click()}}>
                                    <Icon name="pencil" className="mr-2" />
                                    Cambiar
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };


    return (
        <div 
            className="relative w-full h-auto"
        >
            {mediaContent()}
        </div>
    );
};


interface ImageWithFeaturesSectionProps {
  data: ImageWithFeaturesSectionData;
  onUpdate: (data: Partial<ImageWithFeaturesSectionData>) => void;
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
  const handleTitleUpdate = (newTitle: Partial<StyledText>) => {
    if (data.title) {
        onUpdate({ ...data, title: { ...data.title, ...newTitle } });
    }
  };
  
  const handleFeatureUpdate = async (featureId: string, updates: Partial<FeatureItem>) => {
    let finalUpdates = { ...updates };
    if (updates.imageUrl && updates.imageUrl.startsWith('data:')) {
        try {
            finalUpdates.imageUrl = await saveImage(updates.imageUrl);
        } catch (error) {
            console.error("Failed to save feature image", error);
            delete finalUpdates.imageUrl;
        }
    }
    
    const newFeatures = data.features.map(f => {
        if (f.id === featureId) {
            // This logic is a bit complex because the update can be a partial StyledText or a direct value
            const newTitle = updates.title ? { ...f.title, ...updates.title } : f.title;
            const newDescription = updates.description ? { ...f.description, ...updates.description } : f.description;
            return { ...f, ...finalUpdates, title: newTitle, description: newDescription };
        }
        return f;
    });

    onUpdate({ features: newFeatures });
  };


  const handleAddFeature = () => {
    const newFeature: FeatureItem = {
      id: `feat-${Date.now()}`,
      icon: 'generic-feature',
      title: { text: 'Nueva Característica', fontSize: 1.125, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'left', fontWeight: 'bold' },
      description: { text: 'Descripción breve', fontSize: 1, color: '#475569', fontFamily: 'Poppins', textAlign: 'left', fontWeight: 'normal' },
    };
    onUpdate({ ...data, features: [...data.features, newFeature] });
  };
  
  const handleDeleteFeature = (id: string) => {
    const newFeatures = data.features.filter(f => f.id !== id);
    onUpdate({ ...data, features: newFeatures });
  };

  const handleSelectFeatureProperty = (featureId: string, property: 'title' | 'description' | 'icon') => {
      if(!isAdminMode) return;
      const existingSelection = selectedElement?.subElementId === featureId && selectedElement?.property === property;
      
      if (existingSelection) {
        onSelectElement(null);
      } else if (property === 'icon') {
        onSelectElement({ sectionId: data.id, elementKey: 'features', subElementId: featureId });
      } else {
        onSelectElement({ sectionId: data.id, elementKey: 'features', subElementId: featureId, property });
      }
  };

  const isSectionSelectedForStyle = selectedElement?.sectionId === data.id && selectedElement.elementKey === 'style';
  const isSectionSelectedForLayout = selectedElement?.sectionId === data.id && (selectedElement.elementKey === 'mediaWidth');
  const isSectionSelected = isSectionSelectedForStyle || isSectionSelectedForLayout;
  
  const mediaWidth = data.mediaWidth ?? 50;

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
                isSectionSelected={isSectionSelected}
              />
            )}
            {isAdminMode && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-14 z-20 h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectElement({ sectionId: data.id, elementKey: 'mediaWidth' });
                    }}
                    title="Ajustar diseño de la sección"
                >
                    <Icon name="pencil" className="h-4 w-4" />
                </Button>
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
            <div className="flex flex-col lg:flex-row items-start gap-x-12 xl:gap-x-16">
                
                <div 
                  className="w-full lg:flex-shrink-0"
                  style={{ width: `${mediaWidth}%` }}
                >
                     <MediaComponent data={data} onUpdate={onUpdate} isAdminMode={isAdminMode} />
                </div>

                <div className="flex-1 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
                        {data.features.map((feature) => (
                        <div 
                          key={feature.id} 
                          className="flex items-start gap-4 relative group/feature"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                            <div 
                                className={cn(
                                  "bg-primary/10 text-primary p-3 rounded-lg flex-shrink-0 h-12 w-12 flex items-center justify-center", 
                                  isAdminMode && "cursor-pointer", 
                                  selectedElement?.subElementId === feature.id && (selectedElement.property === 'icon' || !selectedElement.property) && "ring-2 ring-primary"
                                )}
                                onClick={(e) => {e.stopPropagation(); handleSelectFeatureProperty(feature.id, 'icon')}}
                            >
                              <FeatureIconDisplay feature={feature} />
                            </div>
                            <div className="flex-grow min-w-0">
                                <EditableText
                                    as="h4"
                                    id={`${feature.id}-title`}
                                    value={feature.title}
                                    isAdminMode={isAdminMode}
                                    onUpdate={(val) => handleFeatureUpdate(feature.id, { title: val })}
                                    onSelect={() => handleSelectFeatureProperty(feature.id, 'title')}
                                    isSelected={selectedElement?.subElementId === feature.id && selectedElement.property === 'title'}
                                    className="font-bold text-lg text-foreground"
                                />
                                 <EditableText
                                    as="p"
                                    id={`${feature.id}-desc`}
                                    value={feature.description}
                                    isAdminMode={isAdminMode}
                                    onUpdate={(val) => handleFeatureUpdate(feature.id, { description: val })}
                                    onSelect={() => handleSelectFeatureProperty(feature.id, 'description')}
                                    isSelected={selectedElement?.subElementId === feature.id && selectedElement.property === 'description'}
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
                         {isAdminMode && (
                            <div className="flex items-center justify-start sm:col-span-2 xl:col-span-3">
                                 <Button variant="outline" onClick={handleAddFeature} className="mt-8 self-start">
                                    <Icon name="plus" className="mr-2" />
                                    Añadir Característica
                                </Button>
                            </div>
                        )}
                    </div>
                  </div>
            </div>
        </div>
    </section>
  );
}
