
'use client';
import React, { useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { ImageWithFeaturesSectionData, Property } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';
import { useStorage } from '@/firebase/storage';
import { uploadFile } from '@/lib/storage';
import { Label } from '../ui/label';

type IconName = keyof typeof LucideIcons;

interface ImageWithFeaturesSectionProps {
    data: ImageWithFeaturesSectionData;
    property: Property;
    updateProperty: (updatedProperty: Property) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const ImageWithFeaturesSection: React.FC<ImageWithFeaturesSectionProps> = ({ data, property, updateProperty, deleteSection, isAdminMode }) => {
    const storage = useStorage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdate = (updates: Partial<ImageWithFeaturesSectionData>) => {
        const updatedSections = property.sections.map(s => s.id === data.id ? {...s, ...updates} : s);
        updateProperty({ ...property, sections: updatedSections });
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && storage) {
            const filePath = `sections/${data.id}/media/${file.name}`;
            const newUrl = await uploadFile(storage, file, filePath);
            handleUpdate({ media: { ...data.media, url: newUrl } });
        }
    };

    const handleFeatureUpdate = (featureId: string, field: 'title' | 'subtitle', value: string) => {
        const updatedFeatures = data.features.map(f => f.id === featureId ? { ...f, [field]: value } : f);
        handleUpdate({ features: updatedFeatures });
    };

    const handleAddFeature = () => {
        const newFeature = { id: uuidv4(), icon: 'PlusCircle', title: 'Nueva Característica', subtitle: 'Descripción aquí.' };
        handleUpdate({ features: [...data.features, newFeature] });
    };
    
    const handleDeleteFeature = (featureId: string) => {
        const updatedFeatures = data.features.filter(f => f.id !== featureId);
        handleUpdate({ features: updatedFeatures });
    };

    const uploadId = `media-upload-${data.id}`;

    return (
        <div className="py-16 md:py-24 relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative group/media w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden shadow-xl">
                         <div className="relative w-full h-full">
                            {data.media.type === 'image' && data.media.url ? (
                                <Image src={data.media.url} alt={data.title || 'Property Feature'} layout="fill" objectFit="cover" />
                            ) : data.media.type === 'video' && data.media.url ? (
                                <video
                                    key={data.media.url}
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
                        </div>
                        {isAdminMode && (
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity">
                                <Label htmlFor={uploadId} className="cursor-pointer">
                                    <div className="p-3 bg-black/50 rounded-full text-white" title="Cambiar imagen/video">
                                        <ImageIcon size={24}/>
                                    </div>
                                </Label>
                                <input id={uploadId} type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*"/>
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
                                         <Button size="icon" variant="ghost" className="absolute top-0 right-0 h-6 w-6 text-destructive opacity-0 group-hover/feature:opacity-100" onClick={(e) => { e.stopPropagation(); handleDeleteFeature(feature.id)}}>
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
