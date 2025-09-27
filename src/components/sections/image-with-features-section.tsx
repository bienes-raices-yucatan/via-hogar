'use client';
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ImageWithFeaturesSectionData } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';

type IconName = keyof typeof LucideIcons;

interface ImageWithFeaturesSectionProps {
    data: ImageWithFeaturesSectionData;
    updateSection: (sectionId: string, updatedData: Partial<ImageWithFeaturesSectionData>) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const ImageWithFeaturesSection: React.FC<ImageWithFeaturesSectionProps> = ({ data, updateSection, deleteSection, isAdminMode }) => {

    const handleFeatureUpdate = (featureId: string, field: 'title' | 'subtitle', value: string) => {
        const updatedFeatures = data.features.map(f => f.id === featureId ? { ...f, [field]: value } : f);
        updateSection(data.id, { features: updatedFeatures });
    };

    const handleAddFeature = () => {
        const newFeature = { id: uuidv4(), icon: 'Plus', title: 'Nueva Característica', subtitle: 'Descripción aquí.' };
        updateSection(data.id, { features: [...data.features, newFeature] });
    };
    
    const handleDeleteFeature = (featureId: string) => {
        const updatedFeatures = data.features.filter(f => f.id !== featureId);
        updateSection(data.id, { features: updatedFeatures });
    };

    return (
        <div className="py-16 md:py-24 relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden shadow-xl">
                        {data.media.type === 'image' ? (
                            <Image src={data.media.url} alt={data.title || 'Property Feature'} layout="fill" objectFit="cover" />
                        ) : (
                            <video
                                src={data.media.url}
                                controls
                                className="w-full h-full object-cover"
                            >
                                Tu navegador no soporta la etiqueta de video.
                            </video>
                        )}
                    </div>
                    <div className="space-y-8">
                        {data.features.map(feature => {
                             const Icon = LucideIcons[feature.icon as IconName] as React.ElementType;
                             return (
                                <div key={feature.id} className="flex items-start gap-4 group/feature relative">
                                    {Icon && <div className="bg-primary/10 text-primary p-3 rounded-full"><Icon className="h-6 w-6"/></div>}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold font-headline text-slate-800">
                                            <EditableText value={feature.title} onChange={(val) => handleFeatureUpdate(feature.id, 'title', val)} isAdminMode={isAdminMode} />
                                        </h3>
                                        <p className="text-slate-600 mt-1">
                                            <EditableText value={feature.subtitle} onChange={(val) => handleFeatureUpdate(feature.id, 'subtitle', val)} isAdminMode={isAdminMode} />
                                        </p>
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