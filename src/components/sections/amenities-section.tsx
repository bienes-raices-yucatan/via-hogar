'use client';
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { AmenitiesSectionData } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import EditableText from '../editable-text';

type IconName = keyof typeof LucideIcons;

interface AmenitiesSectionProps {
    data: AmenitiesSectionData;
    updateSection: (sectionId: string, updatedData: Partial<AmenitiesSectionData>) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ data, updateSection, deleteSection, isAdminMode }) => {

    const handleAmenityTextChange = (amenityId: string, newText: string) => {
        const updatedAmenities = data.amenities.map(a => a.id === amenityId ? { ...a, text: newText } : a);
        updateSection(data.id, { amenities: updatedAmenities });
    };
    
    return (
        <div className="py-12 relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
            <div className="container mx-auto px-4">
                {data.title && <h2 className="text-3xl font-headline font-bold text-center mb-8">{data.title}</h2>}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {data.amenities.map(amenity => {
                        const Icon = LucideIcons[amenity.icon as IconName] as React.ElementType;
                        return (
                            <div key={amenity.id} className="text-center p-4 rounded-lg hover:bg-slate-100 transition-colors">
                                {Icon && <Icon className="mx-auto h-10 w-10 text-primary mb-3" />}
                                <EditableText value={amenity.text} onChange={newText => handleAmenityTextChange(amenity.id, newText)} isAdminMode={isAdminMode} className="text-slate-700" />
                            </div>
                        )
                    })}
                    {isAdminMode && (
                         <div className="text-center p-4 rounded-lg flex items-center justify-center">
                            <Button variant="outline" className="w-full h-full border-dashed"><PlusCircle className="mr-2"/>Añadir Comodidad</Button>
                        </div>
                    )}
                </div>
            </div>
             {isAdminMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
                    <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
                        <Trash2 />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AmenitiesSection;
