'use client';
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { AmenitiesSectionData } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';

type IconName = keyof typeof LucideIcons;
const iconNames = Object.keys(LucideIcons) as IconName[];

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

    const handleAddAmenity = () => {
        const newAmenity = { id: uuidv4(), icon: 'PlusCircle', text: 'Nueva Comodidad' };
        updateSection(data.id, { amenities: [...data.amenities, newAmenity] });
    };

    const handleDeleteAmenity = (amenityId: string) => {
        const updatedAmenities = data.amenities.filter(a => a.id !== amenityId);
        updateSection(data.id, { amenities: updatedAmenities });
    };
    
    return (
        <div className="py-16 md:py-24 relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
            <div className="container mx-auto px-4">
                {data.title && <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12 text-slate-800">{data.title}</h2>}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {data.amenities.map(amenity => {
                        const Icon = LucideIcons[amenity.icon as IconName] as React.ElementType;
                        return (
                            <div key={amenity.id} className="text-center p-4 rounded-lg transition-colors group/amenity relative">
                                {Icon && <Icon className="mx-auto h-10 w-10 text-primary mb-3" />}
                                <EditableText value={amenity.text} onChange={newText => handleAmenityTextChange(amenity.id, newText)} isAdminMode={isAdminMode} className="text-slate-700" />
                                {isAdminMode && (
                                     <Button size="icon" variant="ghost" className="absolute -top-2 -right-2 h-6 w-6 text-destructive opacity-0 group-hover/amenity:opacity-100" onClick={() => handleDeleteAmenity(amenity.id)}>
                                        <Trash2 size={16} />
                                     </Button>
                                )}
                            </div>
                        )
                    })}
                    {isAdminMode && (
                         <div className="text-center p-4 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                            <Button variant="ghost" className="w-full h-full text-slate-500" onClick={handleAddAmenity}>
                                <PlusCircle className="mr-2"/>Añadir
                            </Button>
                        </div>
                    )}
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

export default AmenitiesSection;
