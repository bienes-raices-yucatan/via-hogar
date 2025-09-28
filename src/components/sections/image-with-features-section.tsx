'use client';
import React, { useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { ImageWithFeaturesSectionData } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '../ui/label';
import { uploadFile } from '@/firebase/storage';
import { useStorage } from '@/firebase';

type IconName = keyof typeof LucideIcons;

interface ImageWithFeaturesSectionProps {
    data: ImageWithFeaturesSectionData;
    updateSection: (sectionId: string, updatedData: Partial<ImageWithFeaturesSectionData>) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
    isDraggingMode: boolean;
}

const ImageWithFeaturesSection: React.FC<ImageWithFeaturesSectionProps> = ({ data, updateSection, deleteSection, isAdminMode }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const storage = useStorage();
    
    const handleFeatureUpdate = (featureId: string, field: 'title' | 'subtitle', value: string) => {
        const updatedFeatures = data.features.map(f => f.id === featureId ? { ...f, [field]: value } : f);
        updateSection(data.id, { features: updatedFeatures });
    };

    const handleAddFeature = () => {
        const newFeature = { id: uuidv4(), icon: 'PlusCircle', title: 'Nueva Característica', subtitle: 'Descripción aquí.' };
        updateSection(data.id, { features: [...data.features, newFeature] });
    };
    
    const handleDeleteFeature = (featureId: string) => {
        const updatedFeatures = data.features.filter(f => f.id !== featureId);
        updateSection(data.id, { features: updatedFeatures });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const mediaType = file.type.startsWith('video') ? 'video' : 'image';
            const path = `features-media/${data.id}/${file.name}`;
            const url = await uploadFile(storage, file, path);
            updateSection(data.id, {
                media: {
                    type: mediaType,
                    url: url,
                }
            });
        }
    };

    const uploadId = `media-upload-${data.id}`;

    return (
        <div className="py-16 md:py-24 relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative group/media w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden shadow-xl">
                        {data.media.type === 'image' && data.media.url ? (
                            <Image src={data.media.url} alt={data.title || 'Property Feature'} layout="fill" objectFit="cover" />
                        ) : data.media.url ? (
                            <video
                                key={data.media.url} // Important for re-rendering video
                                controls
                                className="w-full h-full object-cover"
                            >
                                <source src={data.media.url} />
                                Tu navegador no soporta la etiqueta de video.
                            </video>
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="text-gray-400 w-24 h-24" />
                          </div>
                        )}
                        {isAdminMode && (
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4 opacity-0 group-hover/media:opacity-100 transition-opacity">
                                <input
                                    type="file"
                                    id={uploadId}
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*,video/*"
                                />
                                <Label htmlFor={uploadId} className="cursor-pointer">
                                  <Button size="lg" variant="secondary" as="span">
                                     <ImageIcon className="mr-2"/> Cambiar Multimedia
                                  </Button>
                                </Label>
                            </div>
                        )}
                    </div>
                    <div className="space-y-8">
                        {data.features.map(feature => {
                             const Icon = LucideIcons[feature.icon as IconName] as React.ElementType;
                             return (
                                <div key={feature.id} className="flex items-start gap-4 group/feature relative">
                                    {Icon && <div className="bg-primary/10 text-primary p-3 rounded-full"><Icon className="h-6 w-6"/></div>}
                                    <div className="flex-1">
                                        <EditableText value={feature.title} onChange={(val) => handleFeatureUpdate(feature.id, 'title', val)} isAdminMode={isAdminMode} as="h3" className="text-xl font-bold font-headline text-slate-800"/>
                                        <div className="text-slate-600 mt-1">
                                            <EditableText value={feature.subtitle} onChange={(val) => handleFeatureUpdate(feature.id, 'subtitle', val)} isAdminMode={isAdminMode} as="div" />
                                        </div>
                                    </div>
                                    {isAdminMode && (
                                         <Button size="icon" variant="ghost" className="absolute top-0 right-0 h-6 w-6 text-destructive opacity-0 group-hover/feature:opacity-100" onClick={() => handleDeleteFeature(feature.id)}>
                                            <Trash2 size={16} />
                                         </Button>
                                    )}
                                </div>
                             )
                        })}
                        {isAdminMode && (
                            <div className="pt-4">
                                <Button variant="outline" onClick={handleAddFeature}>
                                    <PlusCircle className="mr-2"/> Añadir Característica
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
             {isAdminMode && (
                <div className="absolute top-4 right-4 opacity-0 group-hover/section:opacity-100 transition-opacity">
                    <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
                        <Trash2 />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ImageWithFeaturesSection;
