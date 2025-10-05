
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

const FeatureItemComponent: React.FC<{
    feature: FeatureItem;
    isAdminMode: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<FeatureItem>) => void;
    onDelete: () => void;
}> = ({ feature, isAdminMode, isSelected, onSelect, onUpdate, onDelete }) => {
    
    const handleUpdate = (updates: Partial<StyledText>, property: 'title' | 'description') => {
        onSelect(); // Ensure the element is selected before updating
        const currentData = feature[property];
        onUpdate({ [property]: { ...currentData, ...updates } });
    };

    return (
        <div 
            className={cn(
                "flex items-start gap-4 relative group/feature",
                isAdminMode && "cursor-pointer rounded-lg p-2 -m-2 transition-colors hover:bg-accent/20",
                isSelected && "bg-accent/30 ring-2 ring-primary"
            )}
            onClick={onSelect}
        >
            <div className="bg-primary/10 text-primary p-3 rounded-lg flex-shrink-0 h-12 w-12 flex items-center justify-center">
                <FeatureIconDisplay feature={feature} />
            </div>
            <div className="flex-grow min-w-0">
                <EditableText
                    as="h4"
                    id={`${feature.id}-title`}
                    value={feature.title}
                    isAdminMode={isAdminMode}
                    onUpdate={(upd) => handleUpdate(upd, 'title')}
                    onSelect={onSelect}
                    isSelected={isSelected}
                    className="font-bold text-lg text-foreground"
                />
                <EditableText
                    as="p"
                    id={`${feature.id}-desc`}
                    value={feature.description}
                    isAdminMode={isAdminMode}
                    onUpdate={(upd) => handleUpdate(upd, 'description')}
                    onSelect={onSelect}
                    isSelected={isSelected}
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
                            onDelete();
                        }}
                    >
                        <Icon name="x-mark" className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
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
    
    const newFeatures = data.features.map(f => f.id === featureId ? { ...f, ...finalUpdates } : f);
    onUpdate({ ...data, features: newFeatures });
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

  const handleSelectFeature = (featureId: string) => {
      if(!isAdminMode) return;
      onSelectElement({ sectionId: data.id, elementKey: 'features', subElementId: featureId });
  };

  const isSectionSelectedForStyle = selectedElement?.sectionId === data.id && selectedElement.elementKey === 'style';
  const isSectionSelectedForLayout = selectedElement?.sectionId === data.id && (selectedElement.elementKey === 'mediaWidth');
  const isSectionSelected = isSectionSelectedForStyle || isSectionSelectedForLayout;
  
  const mediaWidth = data.mediaWidth ?? 50;
  
  const features = data.features || [];
  const col1 = features.slice(0, 3);
  const col2 = features.slice(3, 6);


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
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-x-12 xl:gap-x-16">
                
                <div 
                  className="w-full lg:flex-shrink-0"
                  style={{ width: `${mediaWidth}%` }}
                >
                     <MediaComponent data={data} onUpdate={onUpdate} isAdminMode={isAdminMode} />
                </div>

                <div className="flex-1 w-full mt-8 lg:mt-0 flex justify-center">
                     <div className="flex flex-col sm:flex-row gap-x-8 gap-y-10 w-full max-w-2xl">
                        {/* Column 1 */}
                        <div className="flex flex-1 flex-col gap-y-10">
                            {col1.map(feature => (
                                <FeatureItemComponent 
                                    key={feature.id}
                                    feature={feature}
                                    isAdminMode={isAdminMode}
                                    isSelected={selectedElement?.subElementId === feature.id}
                                    onSelect={() => handleSelectFeature(feature.id)}
                                    onUpdate={(updates) => handleFeatureUpdate(feature.id, updates)}
                                    onDelete={() => handleDeleteFeature(feature.id)}
                                />
                            ))}
                        </div>
                        {/* Column 2 */}
                        <div className="flex flex-1 flex-col gap-y-10">
                           {col2.map(feature => (
                                <FeatureItemComponent 
                                    key={feature.id}
                                    feature={feature}
                                    isAdminMode={isAdminMode}
                                    isSelected={selectedElement?.subElementId === feature.id}
                                    onSelect={() => handleSelectFeature(feature.id)}
                                    onUpdate={(updates) => handleFeatureUpdate(feature.id, updates)}
                                    onDelete={() => handleDeleteFeature(feature.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {isAdminMode && (
                <div className="container mx-auto px-4 mt-8 flex justify-center">
                     <Button variant="outline" onClick={handleAddFeature}>
                        <Icon name="plus" className="mr-2" />
                        Añadir Característica
                    </Button>
                </div>
            )}
        </div>
    </section>
  );
}
